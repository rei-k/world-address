# ZKPアドレスプロトコル - セキュリティガイド

## 目次

1. [セキュリティ原則](#セキュリティ原則)
2. [鍵管理](#鍵管理)
3. [ZK証明のセキュリティ](#zk証明のセキュリティ)
4. [アクセス制御](#アクセス制御)
5. [監査とコンプライアンス](#監査とコンプライアンス)
6. [脅威モデル](#脅威モデル)
7. [インシデント対応](#インシデント対応)

---

## セキュリティ原則

### 1. ゼロトラスト原則

**すべてのアクセスを検証**
- DIDベースの認証を必須とする
- すべてのAPI呼び出しにアクセストークンを要求
- PID解決は必ずアクセスポリシーをチェック

**最小権限の原則**
```typescript
// ❌ 悪い例: すべての住所データを返す
async function getAddress(pid: string) {
  return database.findAddress(pid);
}

// ✅ 良い例: 必要な情報のみを返す
async function getAddress(pid: string, requesterId: string, fields: string[]) {
  // アクセス権限チェック
  if (!hasAccess(requesterId, pid)) {
    throw new Error('Access denied');
  }
  
  // 必要なフィールドのみ返す
  const address = await database.findAddress(pid);
  return pick(address, fields);
}
```

### 2. 深層防御（Defense in Depth）

複数のセキュリティ層を実装：

```
┌────────────────────────────────────────────┐
│ Layer 1: Network Security (TLS 1.3, WAF)  │
├────────────────────────────────────────────┤
│ Layer 2: Authentication (DID, OAuth)      │
├────────────────────────────────────────────┤
│ Layer 3: Authorization (RBAC, Policies)   │
├────────────────────────────────────────────┤
│ Layer 4: Data Protection (ZKP, E2EE)      │
├────────────────────────────────────────────┤
│ Layer 5: Audit & Monitoring               │
└────────────────────────────────────────────┘
```

### 3. プライバシー・バイ・デザイン

**住所データの取り扱い**

| ステークホルダー | 保存するデータ | 保存してはいけないデータ |
|---------------|--------------|---------------------|
| ユーザー | 完全な住所、PID、DID | - |
| アドレスプロバイダ | 完全な住所、PID、DID | - |
| ECサイト | PIDトークン、ZK証明 | **生住所（絶対NG）** |
| キャリア（中継） | PIDトークン、ゾーン情報 | **生住所** |
| キャリア（配達員） | 一時的に生住所を閲覧 | **永続的な保存NG** |

---

## 鍵管理

### 1. 秘密鍵の保護

**❌ 絶対にやってはいけないこと**

```typescript
// 悪い例: コードに秘密鍵をハードコード
const PRIVATE_KEY = '5KYZdUEo39z3FPrtuX2QbbwGnNP5zTd7yyr2SC1j299sBCnWjss';

// 悪い例: 平文で保存
fs.writeFileSync('private.key', privateKey);

// 悪い例: ログに出力
console.log('Private key:', privateKey);
```

**✅ 正しい鍵管理**

```typescript
// 1. 環境変数から読み込む
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error('PRIVATE_KEY not set');
}

// 2. HSM/KMSを使用
import { KMS } from '@aws-sdk/client-kms';

const kms = new KMS({ region: 'ap-northeast-1' });

async function signWithKMS(data: Buffer): Promise<Buffer> {
  const result = await kms.sign({
    KeyId: process.env.KMS_KEY_ID,
    Message: data,
    SigningAlgorithm: 'ECDSA_SHA_256',
  });
  return result.Signature;
}

// 3. 鍵のローテーション
class KeyRotationManager {
  async rotateKey(oldKeyId: string): Promise<string> {
    // 新しい鍵を生成
    const newKey = await this.generateNewKey();
    
    // 古い鍵でサインしたデータを再署名
    await this.reSignData(oldKeyId, newKey.id);
    
    // 古い鍵を無効化（即座には削除しない）
    await this.deprecateKey(oldKeyId);
    
    return newKey.id;
  }
}
```

### 2. DIDの鍵管理

```typescript
import { Resolver } from 'did-resolver';
import { getResolver } from 'web-did-resolver';

class SecureDIDManager {
  private resolver: Resolver;
  
  constructor() {
    this.resolver = new Resolver({
      ...getResolver(),
    });
  }

  /**
   * DIDドキュメント作成（鍵をHSMで管理）
   */
  async createDID(keyId: string): Promise<string> {
    // HSMで鍵ペア生成
    const publicKey = await kms.getPublicKey({ KeyId: keyId });
    
    // DID生成
    const did = `did:web:vey.example:user:${keyId}`;
    
    // DIDドキュメント作成
    const didDocument = {
      '@context': 'https://www.w3.org/ns/did/v1',
      id: did,
      verificationMethod: [{
        id: `${did}#key-1`,
        type: 'EcdsaSecp256k1VerificationKey2019',
        controller: did,
        publicKeyJwk: publicKey,
      }],
      authentication: [`${did}#key-1`],
    };
    
    // DIDドキュメントを公開
    await this.publishDIDDocument(did, didDocument);
    
    return did;
  }

  /**
   * 鍵の失効
   */
  async revokeDID(did: string, reason: string): Promise<void> {
    const didDocument = await this.resolver.resolve(did);
    
    // 失効エントリ作成
    const revocation = {
      did,
      revokedAt: new Date().toISOString(),
      reason,
    };
    
    // 失効リストに追加
    await this.addToRevocationList(revocation);
  }
}
```

---

## ZK証明のセキュリティ

### 1. 回路の検証

**Trusted Setupの安全性**

```bash
#!/bin/bash
# マルチパーティ計算でTrusted Setupを実行

# Phase 1: Powers of Tau ceremony (複数参加者)
snarkjs powersoftau new bn128 20 pot20_0000.ptau
snarkjs powersoftau contribute pot20_0000.ptau pot20_0001.ptau \
  --name="Contributor 1" -v -e="random entropy 1"

snarkjs powersoftau contribute pot20_0001.ptau pot20_0002.ptau \
  --name="Contributor 2" -v -e="random entropy 2"

# ... 複数の参加者が貢献

# Phase 2: 最終処理
snarkjs powersoftau prepare phase2 pot20_final.ptau pot20_final.ptau
```

### 2. 証明の再利用攻撃対策

**❌ 危険: タイムスタンプなしの証明**

```typescript
// 悪い例: 古い証明を再利用できてしまう
const proof = {
  circuitId: 'membership-v1',
  proof: '...',
  publicInputs: {
    merkleRoot: '0x123...',
    // タイムスタンプがない！
  },
};
```

**✅ 安全: タイムスタンプとnonceを含める**

```typescript
// 良い例: 証明に時間制限を設ける
const proof = {
  circuitId: 'membership-v1',
  proof: '...',
  publicInputs: {
    merkleRoot: '0x123...',
    timestamp: Date.now(),      // タイムスタンプ
    nonce: generateNonce(),     // 一意なnonce
  },
};

// 検証時にタイムスタンプをチェック
function verifyProof(proof: ZKProof): boolean {
  const age = Date.now() - proof.publicInputs.timestamp;
  const MAX_AGE = 5 * 60 * 1000; // 5分
  
  if (age > MAX_AGE) {
    throw new Error('Proof expired');
  }
  
  // nonce が使用済みでないかチェック
  if (await isNonceUsed(proof.publicInputs.nonce)) {
    throw new Error('Nonce already used');
  }
  
  // ... ZK検証
}
```

### 3. サイドチャネル攻撃対策

**定数時間演算の使用**

```typescript
import { timingSafeEqual } from 'crypto';

// ❌ 悪い例: 通常の比較（タイミング攻撃に脆弱）
function verifySecret(input: string, secret: string): boolean {
  return input === secret;
}

// ✅ 良い例: 定数時間比較
function verifySecret(input: string, secret: string): boolean {
  const inputBuffer = Buffer.from(input, 'utf8');
  const secretBuffer = Buffer.from(secret, 'utf8');
  
  if (inputBuffer.length !== secretBuffer.length) {
    return false;
  }
  
  return timingSafeEqual(inputBuffer, secretBuffer);
}
```

---

## アクセス制御

### 1. ポリシーベースのアクセス制御

```typescript
interface AccessPolicy {
  id: string;
  principal: string;        // DID of requester
  resource: string;         // PID pattern (e.g., 'JP-13-*')
  action: string;           // 'read' | 'resolve' | 'update'
  conditions?: {
    timeRange?: { start: string; end: string };
    ipWhitelist?: string[];
    rateLimit?: { requests: number; period: number };
  };
  expiresAt: string;
}

class AccessController {
  /**
   * アクセス権限の検証
   */
  async checkAccess(
    requesterId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    // 1. 適用可能なポリシーを取得
    const policies = await this.getPolicies(requesterId);
    
    // 2. リソースにマッチするポリシーを検索
    const matchingPolicy = policies.find(p => 
      this.matchesResource(p.resource, resource) &&
      p.action === action
    );
    
    if (!matchingPolicy) {
      return false;
    }
    
    // 3. 有効期限チェック
    if (new Date(matchingPolicy.expiresAt) < new Date()) {
      return false;
    }
    
    // 4. 条件チェック
    if (matchingPolicy.conditions) {
      if (!await this.checkConditions(matchingPolicy.conditions)) {
        return false;
      }
    }
    
    return true;
  }

  private matchesResource(pattern: string, resource: string): boolean {
    // ワイルドカードマッチング
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*') + '$'
    );
    return regex.test(resource);
  }

  private async checkConditions(conditions: any): Promise<boolean> {
    // 時間範囲チェック
    if (conditions.timeRange) {
      const now = new Date();
      if (now < new Date(conditions.timeRange.start) ||
          now > new Date(conditions.timeRange.end)) {
        return false;
      }
    }
    
    // レート制限チェック
    if (conditions.rateLimit) {
      const count = await this.getRequestCount(
        conditions.rateLimit.period
      );
      if (count >= conditions.rateLimit.requests) {
        return false;
      }
    }
    
    return true;
  }
}
```

### 2. レート制限

```typescript
import Redis from 'ioredis';

class RateLimiter {
  private redis: Redis;
  
  constructor(redis: Redis) {
    this.redis = redis;
  }

  /**
   * トークンバケットアルゴリズム
   */
  async checkRateLimit(
    key: string,
    maxRequests: number,
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number }> {
    const now = Date.now();
    const windowKey = `ratelimit:${key}:${Math.floor(now / windowMs)}`;
    
    const count = await this.redis.incr(windowKey);
    
    if (count === 1) {
      // 初回リクエスト: TTL設定
      await this.redis.pexpire(windowKey, windowMs);
    }
    
    const allowed = count <= maxRequests;
    const remaining = Math.max(0, maxRequests - count);
    
    return { allowed, remaining };
  }
}

// 使用例
app.use(async (req, res, next) => {
  const clientId = req.headers['x-client-id'];
  const { allowed, remaining } = await rateLimiter.checkRateLimit(
    clientId,
    100,    // 100リクエスト
    60000   // 1分間
  );
  
  if (!allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: 60,
    });
  }
  
  res.setHeader('X-RateLimit-Remaining', remaining);
  next();
});
```

---

## 監査とコンプライアンス

### 1. 監査ログ

**すべてのPID解決をログ記録**

```typescript
interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;           // DID of accessor
  action: string;          // 'pid_resolve' | 'address_update' | etc.
  resource: string;        // PID
  result: 'success' | 'denied' | 'error';
  ipAddress: string;
  userAgent: string;
  reason?: string;
  metadata?: Record<string, any>;
}

class AuditLogger {
  /**
   * 監査ログの記録
   */
  async log(entry: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    const log: AuditLog = {
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      ...entry,
    };
    
    // 1. データベースに記録
    await db.auditLogs.insert(log);
    
    // 2. SIEM/ログ管理システムに送信
    await this.sendToSIEM(log);
    
    // 3. 異常検知
    await this.detectAnomalies(log);
  }

  /**
   * 異常検知
   */
  private async detectAnomalies(log: AuditLog): Promise<void> {
    // 短時間に大量のアクセス
    const recentLogs = await db.auditLogs.find({
      actor: log.actor,
      timestamp: { $gte: new Date(Date.now() - 60000) },
    });
    
    if (recentLogs.length > 100) {
      await this.alertSecurityTeam({
        type: 'suspicious_activity',
        actor: log.actor,
        message: `Unusual access pattern detected: ${recentLogs.length} requests in 1 minute`,
      });
    }
    
    // 通常時間外のアクセス
    const hour = new Date(log.timestamp).getHours();
    if (hour < 6 || hour > 22) {
      await this.alertSecurityTeam({
        type: 'off_hours_access',
        actor: log.actor,
        timestamp: log.timestamp,
      });
    }
  }
}
```

### 2. GDPR/CCPA準拠

**個人データの削除権（忘れられる権利）**

```typescript
class DataDeletionService {
  /**
   * ユーザーの全データを削除
   */
  async deleteUserData(userDid: string): Promise<void> {
    // 1. 住所データの削除
    await db.addresses.delete({ userDid });
    
    // 2. PIDの失効
    const userPIDs = await db.pids.find({ userDid });
    for (const pid of userPIDs) {
      await this.revokePID(pid.id, 'user_deletion');
    }
    
    // 3. VCの失効
    const userVCs = await db.credentials.find({ subject: userDid });
    for (const vc of userVCs) {
      await this.revokeVC(vc.id);
    }
    
    // 4. 監査ログの匿名化（完全削除はしない）
    await db.auditLogs.update(
      { actor: userDid },
      { $set: { actor: 'ANONYMIZED', metadata: null } }
    );
    
    // 5. 削除証明の生成
    const deletionProof = {
      userDid,
      deletedAt: new Date().toISOString(),
      dataTypes: ['addresses', 'pids', 'credentials'],
      signature: await this.sign(userDid),
    };
    
    return deletionProof;
  }
}
```

---

## 脅威モデル

### 1. 主要な脅威

| 脅威 | 説明 | 対策 |
|-----|------|------|
| **住所データ漏洩** | 不正アクセスによる生住所の窃取 | ZKP、E2EE、アクセス制御 |
| **ZK証明の偽造** | 偽の証明による不正配送 | Trusted Setup、証明検証 |
| **リプレイ攻撃** | 古い証明の再利用 | タイムスタンプ、nonce |
| **中間者攻撃** | 通信の盗聴・改ざん | TLS 1.3、mTLS |
| **DID偽装** | なりすましによる不正アクセス | DID署名検証、PKI |
| **DoS攻撃** | サービス妨害 | レート制限、WAF、DDoS対策 |

### 2. 攻撃シナリオと対策

**シナリオ1: 悪意のあるECサイト**

攻撃: ECサイトが大量のPIDトークンを保存し、後でブルートフォース攻撃

対策:
```typescript
// PIDトークンをハッシュ化して保存
function generatePIDToken(pid: string, salt: string): string {
  const hash = createHash('sha256')
    .update(pid + salt + Date.now())
    .digest('hex');
  return `tok_${hash.substring(0, 32)}`;
}

// トークンからPIDへの逆引きは不可能
// PID解決にはアクセストークンが必要
```

**シナリオ2: 配送業者の不正アクセス**

攻撃: 配送業者が業務外で住所を閲覧

対策:
```typescript
// すべてのアクセスをログ記録
// アクセス理由の記録を必須に
async function resolvePID(pid: string, requesterId: string, reason: string) {
  // 監査ログ
  await auditLogger.log({
    actor: requesterId,
    action: 'pid_resolve',
    resource: pid,
    result: 'success',
    reason,
  });
  
  // 異常検知
  // 業務時間外、大量アクセスなどを検知
}
```

---

## インシデント対応

### 1. インシデント対応計画

**フェーズ1: 検知**
```typescript
// リアルタイム監視
class SecurityMonitor {
  async detectIncident(): Promise<void> {
    // 1. 異常アクセスパターン検知
    const suspiciousLogs = await db.auditLogs.find({
      timestamp: { $gte: new Date(Date.now() - 300000) },
      result: 'denied',
    });
    
    if (suspiciousLogs.length > 50) {
      await this.raiseIncident('ACCESS_ANOMALY', suspiciousLogs);
    }
    
    // 2. データ漏洩の兆候
    const largeBatchAccess = await db.auditLogs.aggregate([
      {
        $group: {
          _id: '$actor',
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1000 } } },
    ]);
    
    if (largeBatchAccess.length > 0) {
      await this.raiseIncident('POTENTIAL_DATA_BREACH', largeBatchAccess);
    }
  }
}
```

**フェーズ2: 封じ込め**
```typescript
// アカウント凍結
async function lockAccount(did: string, reason: string): Promise<void> {
  await db.suspendedAccounts.insert({
    did,
    suspendedAt: new Date().toISOString(),
    reason,
  });
  
  // すべてのアクセストークンを無効化
  await db.accessTokens.delete({ issuedTo: did });
  
  // 通知
  await notifySecurityTeam({
    type: 'account_locked',
    did,
    reason,
  });
}
```

**フェーズ3: 復旧**
```typescript
// 影響範囲の特定
async function assessImpact(incidentId: string): Promise<ImpactReport> {
  const incident = await db.incidents.findOne({ id: incidentId });
  
  // 影響を受けたPIDを特定
  const affectedPIDs = await db.auditLogs.find({
    timestamp: { 
      $gte: incident.startTime,
      $lte: incident.endTime,
    },
    actor: incident.suspectedActor,
  }).map(log => log.resource);
  
  return {
    affectedUsers: affectedPIDs.length,
    dataExposed: determineDataExposure(affectedPIDs),
    recommendedActions: generateRecommendations(incident),
  };
}
```

### 2. セキュリティインシデント通知

```typescript
// GDPR Article 33: データ侵害通知（72時間以内）
async function notifyDataBreach(incident: SecurityIncident): Promise<void> {
  if (incident.severity === 'HIGH' || incident.severity === 'CRITICAL') {
    // 1. 監督当局への通知
    await notifyRegulator({
      type: 'data_breach',
      incidentId: incident.id,
      affectedUsers: incident.affectedUsers,
      dataCategories: incident.dataCategories,
      mitigationSteps: incident.mitigationSteps,
    });
    
    // 2. 影響を受けたユーザーへの通知
    for (const userDid of incident.affectedUsers) {
      await sendEmail(userDid, {
        subject: 'セキュリティインシデント通知',
        body: generateBreachNotification(incident),
      });
    }
  }
}
```

---

## セキュリティチェックリスト

### 開発時

- [ ] すべての秘密鍵をHSM/KMSで管理
- [ ] ZK回路のTrusted Setupを実施
- [ ] 入力検証を実装（SQLインジェクション、XSS対策）
- [ ] レート制限を実装
- [ ] 監査ログを実装
- [ ] エラーメッセージに機密情報を含めない

### デプロイ時

- [ ] TLS 1.3を有効化
- [ ] WAF/DDoS対策を設定
- [ ] 環境変数で秘密情報を管理
- [ ] セキュリティヘッダーを設定
- [ ] 定期的なセキュリティスキャン

### 運用時

- [ ] 定期的な脆弱性スキャン
- [ ] ログの監視と異常検知
- [ ] 定期的な鍵のローテーション
- [ ] インシデント対応訓練
- [ ] セキュリティパッチの適用

---

## まとめ

このセキュリティガイドでは、ZKPアドレスプロトコルの安全な実装と運用に必要な要素を説明しました。

セキュリティは継続的なプロセスです。定期的な見直しと改善を行ってください。

---

**最終更新**: 2024-12-07
