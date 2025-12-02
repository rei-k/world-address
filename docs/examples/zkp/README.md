# ZKP Address Protocol Examples

このディレクトリには、ZKPアドレスプロトコルの実装例が含まれています。

## Examples

### 1. Complete Flow Example (`complete-flow.ts`)

ZKPアドレスプロトコルの全4フローを網羅した完全な実装例です。

**含まれるフロー:**
- Flow 1: 住所登録・認証 (Address Registration & Authentication)
- Flow 2: 配送依頼・送り状発行 (Shipping Request & Waybill Generation)
- Flow 3: 配送実行・追跡 (Delivery Execution & Tracking)
- Flow 4: 住所更新・失効 (Address Update & Revocation)

**実行方法:**
```bash
cd docs/examples/zkp
npx tsx complete-flow.ts
```

**学べること:**
- DIDドキュメントの作成
- Verifiable Credentialの発行と検証
- ZK証明の生成と検証
- アクセス制御とPID解決
- 失効リストの管理

### 2. EC Integration Example (`ec-integration.ts`)

ECサイトがZKPアドレスプロトコルを統合する際の実装例です。

**特徴:**
- ECサイトは生住所を一切見ない
- PIDトークンとZK証明のみを保存
- プライバシーを保護しながら配送を実現

**実行方法:**
```bash
cd docs/examples/zkp
npx tsx ec-integration.ts
```

**学べること:**
- ECサイトでのZKP統合
- 配送条件の定義
- ZK証明の検証
- プライバシー保護型の注文処理

## 必要な依存関係

これらの例を実行するには、以下が必要です：

```bash
# @vey/coreパッケージのインストール
npm install @vey/core

# TypeScriptの実行環境（開発時のみ）
npm install -D tsx
```

## 注意事項

### プレースホルダー実装について

現在の実装は**プレースホルダー**です。以下の機能は実際のライブラリを使用して実装する必要があります：

1. **ZK証明の生成と検証**
   - 現在: Base64エンコードされた文字列
   - 必要: Groth16、PLONK、Halo2などの実際のZKライブラリ
   - 推奨ライブラリ:
     - [snarkjs](https://github.com/iden3/snarkjs) (Groth16, PLONK)
     - [circom](https://github.com/iden3/circom) (回路定義)
     - [halo2](https://github.com/zcash/halo2) (Halo2)

2. **暗号署名**
   - 現在: 簡易的なハッシュベースの署名
   - 必要: Ed25519、ECDSA、BLS署名
   - 推奨ライブラリ:
     - [@noble/ed25519](https://github.com/paulmillr/noble-ed25519)
     - [@noble/secp256k1](https://github.com/paulmillr/noble-secp256k1)

3. **DID/VC処理**
   - 現在: 基本的な構造のみ
   - 必要: W3C準拠の完全な実装
   - 推奨ライブラリ:
     - [did-jwt](https://github.com/decentralized-identity/did-jwt)
     - [veramo](https://github.com/uport-project/veramo)

4. **失効リスト**
   - 現在: 単純な配列
   - 必要: Merkle TreeまたはAccumulatorベースの効率的な実装
   - 推奨:
     - [merkletreejs](https://github.com/miguelmota/merkletreejs)
     - RSA Accumulator

## 本番環境への移行ステップ

### ステップ1: ZK回路の実装

```bash
# Circomのインストール
npm install -g circom

# 回路の作成
# circuits/address_validation.circom
```

回路の例：
```circom
pragma circom 2.0.0;

template AddressValidation() {
    signal input countryCode;
    signal input allowedCountries[10];
    signal input provinceCode;
    signal input allowedProvinces[50];
    
    signal output valid;
    
    // 国コードチェック
    component countryCheck = ArrayContains(10);
    countryCheck.value <== countryCode;
    for (var i = 0; i < 10; i++) {
        countryCheck.array[i] <== allowedCountries[i];
    }
    
    // 都道府県コードチェック
    component provinceCheck = ArrayContains(50);
    provinceCheck.value <== provinceCode;
    for (var i = 0; i < 50; i++) {
        provinceCheck.array[i] <== allowedProvinces[i];
    }
    
    // 両方が有効な場合のみtrue
    valid <== countryCheck.result * provinceCheck.result;
}
```

### ステップ2: 暗号署名の実装

```typescript
import * as ed from '@noble/ed25519';

async function signCredentialProduction(
  vc: VerifiableCredential,
  privateKey: Uint8Array
): Promise<VerifiableCredential> {
  const message = new TextEncoder().encode(JSON.stringify(vc));
  const signature = await ed.sign(message, privateKey);
  
  return {
    ...vc,
    proof: {
      type: 'Ed25519Signature2020',
      created: new Date().toISOString(),
      verificationMethod: 'did:example:123#key-1',
      proofPurpose: 'assertionMethod',
      proofValue: `z${Buffer.from(signature).toString('base64')}`,
    },
  };
}
```

### ステップ3: DID/VC処理の実装

```typescript
import { Resolver } from 'did-resolver';
import { getResolver } from 'web-did-resolver';
import { verifyCredential as verifyVC } from '@veramo/core';

const resolver = new Resolver({
  ...getResolver(),
});

async function verifyCredentialProduction(
  vc: VerifiableCredential
): Promise<boolean> {
  try {
    const result = await verifyVC(vc, resolver);
    return result.verified;
  } catch (error) {
    console.error('Verification failed:', error);
    return false;
  }
}
```

### ステップ4: APIサーバーの構築

Address ProviderのAPI実装例：

```typescript
import express from 'express';
import { validateShippingRequest } from '@vey/core';

const app = express();
app.use(express.json());

// Shipping validation endpoint
app.post('/v1/validate', async (req, res) => {
  const { pid, conditions, requesterId, userSignature } = req.body;
  
  // 1. Verify user signature
  // 2. Load full address from database using PID
  // 3. Generate ZK proof
  // 4. Return validation response
  
  const response = await validateShippingRequest(
    { pid, conditions, requesterId, userSignature, timestamp: new Date().toISOString() },
    zkCircuit,
    fullAddress
  );
  
  res.json(response);
});

app.listen(3000, () => {
  console.log('Address Provider API listening on port 3000');
});
```

## セキュリティ考慮事項

1. **秘密鍵の管理**
   - HSM (Hardware Security Module) の使用
   - KMS (Key Management Service) の使用
   - 絶対にコードに秘密鍵をハードコードしない

2. **ZK証明の検証**
   - すべてのZK証明を必ず検証する
   - 古い証明を拒否する（タイムスタンプチェック）
   - 失効リストを常に確認する

3. **アクセス制御**
   - PID解決は認可されたキャリアのみ
   - すべてのアクセスを監査ログに記録
   - 定期的にアクセスパターンを監視

4. **ネットワークセキュリティ**
   - TLS 1.3以上を使用
   - mTLSでキャリアとの通信を保護
   - WAFでAPI保護

## 参考資料

- [ZKP Protocol Documentation](../../zkp-protocol.md)
- [API Documentation](../../zkp-api.md)
- [W3C DID Core](https://www.w3.org/TR/did-core/)
- [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/)
- [Circom Documentation](https://docs.circom.io/)
- [snarkjs Documentation](https://github.com/iden3/snarkjs)

## ライセンス

MIT License
