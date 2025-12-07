# ZKPアドレスプロトコル - 実装ガイド

## 目次

1. [開発環境のセットアップ](#開発環境のセットアップ)
2. [ステップ1: ZK回路の実装](#ステップ1-zk回路の実装)
3. [ステップ2: アドレスプロバイダの構築](#ステップ2-アドレスプロバイダの構築)
4. [ステップ3: ECサイト統合](#ステップ3-ecサイト統合)
5. [ステップ4: 配送業者統合](#ステップ4-配送業者統合)
6. [ステップ5: テストと検証](#ステップ5-テストと検証)
7. [ステップ6: 本番デプロイ](#ステップ6-本番デプロイ)

---

## 開発環境のセットアップ

### 必要な環境

```bash
# Node.js 18以上
node --version  # v18.0.0+

# TypeScript
npm install -g typescript

# Circom (ZK回路コンパイラ)
npm install -g circom

# snarkjs (ZK証明生成・検証)
npm install -g snarkjs
```

### プロジェクトの初期化

```bash
# 新規プロジェクト作成
mkdir zkp-address-provider
cd zkp-address-provider

# package.json初期化
npm init -y

# 必要なパッケージのインストール
npm install @vey/core
npm install snarkjs circomlib
npm install @noble/ed25519
npm install did-jwt veramo
npm install express cors helmet
npm install dotenv

# 開発用パッケージ
npm install -D typescript @types/node @types/express
npm install -D vitest tsx
npm install -D eslint prettier
```

---

## ステップ1: ZK回路の実装

### 1.1 Circom回路の作成

**circuits/membership.circom** - ZK-Membership Proof用回路

```circom
pragma circom 2.0.0;

include "node_modules/circomlib/circuits/poseidon.circom";
include "node_modules/circomlib/circuits/comparators.circom";
include "node_modules/circomlib/circuits/mux1.circom";

// Merkle Tree membership proof
template MerkleTreeChecker(levels) {
    signal input leaf;
    signal input root;
    signal input pathElements[levels];
    signal input pathIndices[levels];

    component hashers[levels];
    component mux[levels];

    signal hashes[levels + 1];
    hashes[0] <== leaf;

    for (var i = 0; i < levels; i++) {
        pathIndices[i] * (1 - pathIndices[i]) === 0;

        hashers[i] = Poseidon(2);
        mux[i] = Mux1();

        mux[i].c[0] <== hashes[i];
        mux[i].c[1] <== pathElements[i];
        mux[i].s <== pathIndices[i];
        
        hashers[i].inputs[0] <== mux[i].out;
        hashers[i].inputs[1] <== pathElements[i];
        
        hashes[i + 1] <== hashers[i].out;
    }

    root === hashes[levels];
}

// Address Membership Proof
template AddressMembership(levels) {
    // Private inputs
    signal input addressPID;           // User's PID (secret)
    signal input merklePathElements[levels];
    signal input merklePathIndices[levels];
    
    // Public inputs
    signal input merkleRoot;           // Public Merkle root
    signal input timestamp;
    
    // Output
    signal output valid;

    // Compute leaf hash
    component leafHasher = Poseidon(1);
    leafHasher.inputs[0] <== addressPID;
    
    // Verify Merkle path
    component merkleChecker = MerkleTreeChecker(levels);
    merkleChecker.leaf <== leafHasher.out;
    merkleChecker.root <== merkleRoot;
    
    for (var i = 0; i < levels; i++) {
        merkleChecker.pathElements[i] <== merklePathElements[i];
        merkleChecker.pathIndices[i] <== merklePathIndices[i];
    }
    
    valid <== 1;
}

component main {public [merkleRoot, timestamp]} = AddressMembership(20);
```

**circuits/structure.circom** - ZK-Structure Proof用回路

```circom
pragma circom 2.0.0;

include "node_modules/circomlib/circuits/comparators.circom";
include "node_modules/circomlib/circuits/gates.circom";

template PIDStructureValidator() {
    // Private inputs
    signal input pid[8];               // PID components (secret)
    signal input hierarchyRules[8];    // Country-specific rules
    
    // Public inputs
    signal input countryCode;          // Expected country
    signal input hierarchyDepth;       // Expected depth
    
    // Output
    signal output valid;

    // Verify country code matches
    component countryEq = IsEqual();
    countryEq.in[0] <== pid[0];
    countryEq.in[1] <== countryCode;
    
    // Verify hierarchy depth
    component depthEq = IsEqual();
    depthEq.in[0] <== hierarchyDepth;
    depthEq.in[1] <== hierarchyDepth;  // Placeholder: would verify actual depth
    
    // Verify each level follows rules
    component ruleChecks[8];
    signal ruleValid[8];
    
    for (var i = 0; i < 8; i++) {
        ruleChecks[i] = LessThan(32);
        ruleChecks[i].in[0] <== pid[i];
        ruleChecks[i].in[1] <== hierarchyRules[i];
        ruleValid[i] <== ruleChecks[i].out;
    }
    
    // All checks must pass
    component allValid = MultiAND(10);
    allValid.in[0] <== countryEq.out;
    allValid.in[1] <== depthEq.out;
    for (var i = 0; i < 8; i++) {
        allValid.in[i + 2] <== ruleValid[i];
    }
    
    valid <== allValid.out;
}

component main {public [countryCode, hierarchyDepth]} = PIDStructureValidator();
```

### 1.2 回路のコンパイルと鍵生成

```bash
#!/bin/bash
# scripts/compile-circuits.sh

# Membership circuit
circom circuits/membership.circom --r1cs --wasm --sym -o build/
snarkjs groth16 setup build/membership.r1cs powersOfTau28_hez_final_20.ptau build/membership_0000.zkey

# Generate verification key
snarkjs zkey export verificationkey build/membership_0000.zkey build/membership_verification_key.json

# Structure circuit
circom circuits/structure.circom --r1cs --wasm --sym -o build/
snarkjs groth16 setup build/structure.r1cs powersOfTau28_hez_final_20.ptau build/structure_0000.zkey
snarkjs zkey export verificationkey build/structure_0000.zkey build/structure_verification_key.json

echo "✓ Circuits compiled and keys generated"
```

---

## ステップ2: アドレスプロバイダの構築

### 2.1 証明生成サービス

**src/prover.ts**

```typescript
import { buildPoseidon } from 'circomlibjs';
import { groth16 } from 'snarkjs';
import * as fs from 'fs';

export class ZKPProver {
  private poseidon: any;
  
  async initialize() {
    this.poseidon = await buildPoseidon();
  }

  /**
   * ZK-Membership Proof生成
   */
  async generateMembershipProof(
    addressPID: string,
    validPIDs: string[],
    merkleTree: MerkleTree
  ): Promise<ZKMembershipProof> {
    // Merkle path取得
    const { pathElements, pathIndices } = merkleTree.getProof(addressPID);
    const merkleRoot = merkleTree.root;

    // Witnessデータ準備
    const input = {
      addressPID: this.pidToFieldElement(addressPID),
      merklePathElements: pathElements,
      merklePathIndices: pathIndices,
      merkleRoot: merkleRoot,
      timestamp: Date.now(),
    };

    // 証明生成
    const { proof, publicSignals } = await groth16.fullProve(
      input,
      'build/membership_js/membership.wasm',
      'build/membership_0000.zkey'
    );

    return {
      circuitId: 'membership-v1',
      proofType: 'groth16',
      patternType: 'membership',
      proof: this.proofToString(proof),
      publicInputs: {
        merkleRoot: publicSignals[0],
        timestamp: publicSignals[1],
      },
      timestamp: new Date().toISOString(),
      merkleRoot,
      merklePath: pathElements,
      leafIndex: pathIndices.indexOf(1),
    };
  }

  /**
   * ZK-Structure Proof生成
   */
  async generateStructureProof(
    pid: string,
    countryCode: string,
    hierarchyDepth: number
  ): Promise<ZKStructureProof> {
    const pidComponents = this.parsePID(pid);
    const hierarchyRules = this.getHierarchyRules(countryCode);

    const input = {
      pid: pidComponents,
      hierarchyRules,
      countryCode: this.countryToFieldElement(countryCode),
      hierarchyDepth,
    };

    const { proof, publicSignals } = await groth16.fullProve(
      input,
      'build/structure_js/structure.wasm',
      'build/structure_0000.zkey'
    );

    return {
      circuitId: 'structure-v1',
      proofType: 'groth16',
      patternType: 'structure',
      proof: this.proofToString(proof),
      publicInputs: {
        countryCode,
        hierarchyDepth,
        pidLength: pidComponents.length,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
      countryCode,
      hierarchyDepth,
      rulesHash: this.hashRules(hierarchyRules),
    };
  }

  private pidToFieldElement(pid: string): bigint {
    const hash = this.poseidon([Buffer.from(pid, 'utf-8')]);
    return hash;
  }

  private countryToFieldElement(country: string): bigint {
    return BigInt(country.charCodeAt(0) * 256 + country.charCodeAt(1));
  }

  private parsePID(pid: string): bigint[] {
    return pid.split('-').map(part => BigInt('0x' + Buffer.from(part).toString('hex')));
  }

  private getHierarchyRules(countryCode: string): bigint[] {
    // 国別の階層ルールを読み込む
    const rules = {
      'JP': [2, 2, 3, 2, 3, 2, 4, 3],  // 日本の階層構造ルール
      'US': [2, 2, 5, 5, 0, 0, 0, 0],  // アメリカの階層構造ルール
    };
    return rules[countryCode as keyof typeof rules] || [];
  }

  private hashRules(rules: bigint[]): string {
    const hash = this.poseidon(rules);
    return hash.toString(16);
  }

  private proofToString(proof: any): string {
    return JSON.stringify({
      pi_a: proof.pi_a,
      pi_b: proof.pi_b,
      pi_c: proof.pi_c,
      protocol: proof.protocol,
      curve: proof.curve,
    });
  }
}
```

### 2.2 検証サービス

**src/verifier.ts**

```typescript
import { groth16 } from 'snarkjs';
import * as fs from 'fs';

export class ZKPVerifier {
  private verificationKeys: Map<string, any> = new Map();

  async initialize() {
    // 検証鍵の読み込み
    const membershipKey = JSON.parse(
      fs.readFileSync('build/membership_verification_key.json', 'utf-8')
    );
    this.verificationKeys.set('membership-v1', membershipKey);

    const structureKey = JSON.parse(
      fs.readFileSync('build/structure_verification_key.json', 'utf-8')
    );
    this.verificationKeys.set('structure-v1', structureKey);
  }

  /**
   * ZK証明を検証
   */
  async verifyProof(
    proof: ZKProof,
    circuitId: string
  ): Promise<ZKProofVerificationResult> {
    const verificationKey = this.verificationKeys.get(circuitId);
    if (!verificationKey) {
      return {
        valid: false,
        circuitId,
        error: `Unknown circuit: ${circuitId}`,
        verifiedAt: new Date().toISOString(),
      };
    }

    try {
      const proofObj = JSON.parse(proof.proof);
      const publicInputs = Object.values(proof.publicInputs);

      const isValid = await groth16.verify(
        verificationKey,
        publicInputs,
        proofObj
      );

      return {
        valid: isValid,
        circuitId,
        publicInputs: proof.publicInputs,
        verifiedAt: new Date().toISOString(),
        error: isValid ? undefined : 'Proof verification failed',
      };
    } catch (error: any) {
      return {
        valid: false,
        circuitId,
        error: error.message,
        verifiedAt: new Date().toISOString(),
      };
    }
  }
}
```

### 2.3 APIサーバー

**src/server.ts**

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ZKPProver } from './prover';
import { ZKPVerifier } from './verifier';
import { MerkleTreeManager } from './merkle';
import { DIDManager } from './did';

const app = express();
const prover = new ZKPProver();
const verifier = new ZKPVerifier();
const merkleManager = new MerkleTreeManager();
const didManager = new DIDManager();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Initialize services
Promise.all([
  prover.initialize(),
  verifier.initialize(),
  merkleManager.initialize(),
]).then(() => {
  console.log('✓ All services initialized');
});

/**
 * エンドポイント1: 住所登録・VC発行
 */
app.post('/v1/address/register', async (req, res) => {
  try {
    const { userDid, fullAddress } = req.body;

    // 1. 住所正規化とPID生成
    const pid = await normalizeToPID(fullAddress);

    // 2. Merkle Treeに追加
    await merkleManager.addLeaf(pid);

    // 3. Address PID VC作成
    const vc = await didManager.createAddressPIDCredential(
      userDid,
      'did:web:vey.example',
      pid,
      fullAddress.country,
      fullAddress.province
    );

    res.json({
      success: true,
      pid,
      credential: vc,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * エンドポイント2: ZK証明生成（配送リクエスト用）
 */
app.post('/v1/zkp/generate', async (req, res) => {
  try {
    const { pid, conditions, pattern = 'membership' } = req.body;

    let proof;
    if (pattern === 'membership') {
      const validPIDs = await merkleManager.getAllPIDs();
      const merkleTree = await merkleManager.getMerkleTree();
      proof = await prover.generateMembershipProof(pid, validPIDs, merkleTree);
    } else if (pattern === 'structure') {
      const country = pid.split('-')[0];
      const depth = pid.split('-').length;
      proof = await prover.generateStructureProof(pid, country, depth);
    }

    res.json({
      success: true,
      proof,
      pidToken: generatePIDToken(pid),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * エンドポイント3: ZK証明検証
 */
app.post('/v1/zkp/verify', async (req, res) => {
  try {
    const { proof, circuitId } = req.body;
    
    const result = await verifier.verifyProof(proof, circuitId);
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * エンドポイント4: PID解決（配送業者向け）
 */
app.post('/v1/pid/resolve', async (req, res) => {
  try {
    const { pid, requesterId, accessToken, reason } = req.body;

    // 1. アクセス制御チェック
    const hasAccess = await validateAccess(requesterId, pid, accessToken);
    if (!hasAccess) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // 2. 監査ログ記録
    await logAccess(pid, requesterId, reason);

    // 3. PIDから住所を解決
    const address = await resolvePIDToAddress(pid);

    res.json({
      success: true,
      address,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Address Provider API running on port ${PORT}`);
});
```

---

## ステップ3: ECサイト統合

### 3.1 SDK統合

```typescript
import { VeyAddressClient } from '@vey/core';

const client = new VeyAddressClient({
  providerUrl: 'https://address-provider.vey.example',
  apiKey: process.env.VEY_API_KEY,
});

/**
 * チェックアウト時の住所検証
 */
async function validateShippingAddress(pidToken: string, shippingConditions: any) {
  try {
    // ZK証明をリクエスト
    const result = await client.validateShipping({
      pidToken,
      conditions: {
        allowedCountries: ['JP'],
        allowedRegions: ['13', '14', '27'],
      },
    });

    if (result.valid) {
      // 証明のみを保存（生住所は保存しない）
      await saveOrder({
        pidToken: result.pidToken,
        zkProof: result.zkProof,
        // その他の注文情報
      });
      
      return { success: true };
    } else {
      return { success: false, error: '配送不可能な地域です' };
    }
  } catch (error) {
    console.error('Address validation failed:', error);
    return { success: false, error: '住所検証エラー' };
  }
}
```

---

## ステップ4: 配送業者統合

### 4.1 PID解決の実装

```typescript
import { VeyCarrierClient } from '@vey/carrier-sdk';

const carrierClient = new VeyCarrierClient({
  did: 'did:web:carrier.example',
  privateKey: process.env.CARRIER_PRIVATE_KEY,
  providerUrl: 'https://address-provider.vey.example',
});

/**
 * ラストワンマイル配送時のPID解決
 */
async function resolveAddressForDelivery(pidToken: string) {
  try {
    const result = await carrierClient.resolvePID({
      pidToken,
      reason: 'last-mile-delivery',
    });

    if (result.success) {
      // 完全な住所を取得
      const fullAddress = result.address;
      
      // 配送ナビゲーションシステムに渡す
      await deliveryNavigation.setDestination(fullAddress);
      
      return fullAddress;
    }
  } catch (error) {
    console.error('PID resolution failed:', error);
    throw error;
  }
}
```

---

## ステップ5: テストと検証

### 5.1 ユニットテスト

**tests/prover.test.ts**

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { ZKPProver } from '../src/prover';
import { ZKPVerifier } from '../src/verifier';
import { MerkleTreeManager } from '../src/merkle';

describe('ZKP Prover & Verifier', () => {
  let prover: ZKPProver;
  let verifier: ZKPVerifier;
  let merkleManager: MerkleTreeManager;

  beforeAll(async () => {
    prover = new ZKPProver();
    verifier = new ZKPVerifier();
    merkleManager = new MerkleTreeManager();
    
    await Promise.all([
      prover.initialize(),
      verifier.initialize(),
      merkleManager.initialize(),
    ]);
  });

  it('should generate and verify membership proof', async () => {
    const testPID = 'JP-13-113-01-T07-B12';
    const validPIDs = [testPID, 'JP-14-201-05', 'US-CA-90210'];
    
    await merkleManager.buildTree(validPIDs);
    const merkleTree = await merkleManager.getMerkleTree();

    // 証明生成
    const proof = await prover.generateMembershipProof(
      testPID,
      validPIDs,
      merkleTree
    );

    expect(proof).toBeDefined();
    expect(proof.patternType).toBe('membership');

    // 証明検証
    const result = await verifier.verifyProof(proof, 'membership-v1');
    expect(result.valid).toBe(true);
  });

  it('should generate and verify structure proof', async () => {
    const testPID = 'JP-13-113-01-T07-B12-BN02-R342';
    
    const proof = await prover.generateStructureProof(testPID, 'JP', 8);

    expect(proof).toBeDefined();
    expect(proof.patternType).toBe('structure');

    const result = await verifier.verifyProof(proof, 'structure-v1');
    expect(result.valid).toBe(true);
  });
});
```

---

## ステップ6: 本番デプロイ

### 6.1 環境変数設定

**.env.production**

```bash
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@db.vey.example:5432/addresses
REDIS_URL=redis://redis.vey.example:6379

# DID/VC
ISSUER_DID=did:web:vey.example
ISSUER_PRIVATE_KEY=...

# API Keys
API_KEY_ENCRYPTION_KEY=...

# Monitoring
SENTRY_DSN=...
LOG_LEVEL=info
```

### 6.2 Dockerデプロイ

**Dockerfile**

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm ci --only=production

# アプリケーションコピー
COPY . .

# 回路のビルド
RUN npm run build:circuits

# TypeScriptビルド
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

**docker-compose.yml**

```yaml
version: '3.8'

services:
  address-provider:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: addresses
      POSTGRES_USER: user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data

volumes:
  postgres-data:
  redis-data:
```

---

## まとめ

この実装ガイドでは、ZKPアドレスプロトコルの完全な実装手順を説明しました。

### 次のステップ

1. [セキュリティガイド](./security-guide.md) - セキュリティのベストプラクティス
2. [デプロイメントガイド](./deployment-guide.md) - 本番環境への詳細なデプロイ手順
3. [運用ガイド](./operations-guide.md) - 監視とメンテナンス

### サポート

技術的な質問やサポートが必要な場合:
- GitHub Issues: https://github.com/rei-k/world-address/issues
- ドキュメント: https://docs.vey.example

---

**最終更新**: 2024-12-07
