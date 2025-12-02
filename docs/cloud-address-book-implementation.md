# クラウド住所帳システム実装ガイド / Cloud Address Book Implementation Guide

クラウド住所帳システムの実装ガイドとコード例

Implementation guide and code examples for the Cloud Address Book System

---

## 目次 / Table of Contents

1. [開発環境のセットアップ](#1-開発環境のセットアップ)
2. [基本的な使用例](#2-基本的な使用例)
3. [住所登録の実装](#3-住所登録の実装)
4. [友達管理の実装](#4-友達管理の実装)
5. [配送統合の実装](#5-配送統合の実装)
6. [QR/NFC統合](#6-qrnfc統合)
7. [セキュリティベストプラクティス](#7-セキュリティベストプラクティス)

---

## 1. 開発環境のセットアップ

### 1.1 必要なパッケージのインストール

```bash
# コアSDKのインストール
npm install @vey/core

# React統合（Reactを使用する場合）
npm install @vey/react

# QR/NFC統合
npm install @vey/qr-nfc

# 開発依存関係
npm install -D typescript @types/node
```

### 1.2 TypeScript設定

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 2. 基本的な使用例

### 2.1 クライアントの初期化

```typescript
import { createAddressClient } from '@vey/core';

// クライアントの作成
const client = createAddressClient({
  apiKey: process.env.VEY_API_KEY,
  apiEndpoint: 'https://api.vey.example',
  environment: 'production', // 'development' | 'staging' | 'production'
});

// ユーザー認証
await client.authenticate({
  did: 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
  privateKey: userPrivateKey,
});
```

### 2.2 住所の正規化とPID生成

```typescript
import { normalizeAddress, encodePID } from '@vey/core';

// 住所の正規化
const rawAddress = {
  country: 'JP',
  postalCode: '150-0043',
  province: '東京都',
  city: '渋谷区',
  streetAddress: '道玄坂1-2-3',
  building: 'ビル名',
  room: '101',
};

const normalized = await normalizeAddress(rawAddress, 'JP');
console.log(normalized);
// {
//   countryCode: 'JP',
//   admin1: '13',
//   admin2: '113',
//   locality: '01',
//   ...
// }

// PID生成
const pid = encodePID(normalized);
console.log(pid); // "JP-13-113-01-T07-B12-BN02-R101"
```

---

## 3. 住所登録の実装

### 3.1 完全な住所登録フロー

```typescript
import {
  normalizeAddress,
  encodePID,
  createAddressPIDCredential,
  signCredential,
  encryptAddress,
} from '@vey/core';

async function registerAddress(
  userDid: string,
  userPrivateKey: string,
  rawAddress: any,
  providerDid: string
) {
  // ステップ1: 住所正規化
  const normalized = await normalizeAddress(
    rawAddress,
    rawAddress.country
  );
  
  // ステップ2: PID生成
  const pid = encodePID(normalized);
  
  // ステップ3: Verifiable Credential作成
  const vc = createAddressPIDCredential(
    userDid,
    providerDid,
    pid,
    normalized.countryCode,
    normalized.admin1,
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1年後
  );
  
  // ステップ4: ユーザー署名
  const signedVC = await signCredential(vc, userPrivateKey, `${userDid}#key-1`);
  
  // ステップ5: 住所暗号化
  const encryptedLocal = await encryptAddress(
    JSON.stringify(rawAddress),
    userPrivateKey
  );
  
  const encryptedEn = await encryptAddress(
    JSON.stringify(normalized),
    userPrivateKey
  );
  
  // ステップ6: クラウドに保存
  const addressEntry = {
    user_did: userDid,
    pid,
    encrypted_address_local: encryptedLocal.ciphertext,
    encrypted_address_en: encryptedEn.ciphertext,
    encryption_algorithm: 'AES-256-GCM',
    encryption_iv: encryptedLocal.iv,
    country_code: normalized.countryCode,
    admin1_code: normalized.admin1,
    admin2_code: normalized.admin2,
    signature: signedVC.proof?.proofValue || '',
    vc_id: signedVC.id,
    is_revoked: false,
    is_primary: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  // API経由で保存
  const response = await client.addresses.create(addressEntry);
  
  return {
    pid,
    addressId: response.id,
    vc: signedVC,
  };
}
```

### 3.2 住所の取得と復号

```typescript
async function getAddress(
  addressId: string,
  userPrivateKey: string
): Promise<any> {
  // 暗号化された住所を取得
  const addressEntry = await client.addresses.get(addressId);
  
  // 復号
  const decryptedAddress = await decryptAddress(
    addressEntry.encrypted_address_local,
    addressEntry.encryption_iv,
    userPrivateKey
  );
  
  return JSON.parse(decryptedAddress);
}
```

### 3.3 QR/NFCトークン生成

```typescript
import { generateAddressQR } from '@vey/qr-nfc';

async function generateUserAddressQR(
  pid: string,
  address: any,
  userPrivateKey: string
): Promise<string> {
  // ステップ1: 住所を端末内で暗号化
  const encrypted = await encryptAddress(
    JSON.stringify(address),
    userPrivateKey
  );
  
  // ステップ2: QRペイロード作成
  const payload = {
    version: '1.0',
    pid,
    encrypted_address: encrypted.ciphertext,
    signature: await signData(encrypted.ciphertext, userPrivateKey),
    auth_tag: encrypted.authTag,
    timestamp: new Date().toISOString(),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30日後
  };
  
  // ステップ3: QRコード生成
  const qrCode = await generateAddressQR(payload);
  
  return qrCode; // Base64エンコードされたQRコード画像
}
```

---

## 4. 友達管理の実装

### 4.1 友達の追加（QRスキャン）

```typescript
import { scanFriendQR, verifyFriendPID } from '@vey/core';

async function addFriend(
  qrData: string,
  ownerDid: string,
  label: string
): Promise<FriendEntry> {
  // ステップ1: QRデータをパース
  const friendData = await scanFriendQR(qrData);
  
  // ステップ2: PID検証
  const isValid = await verifyFriendPID(friendData.pid);
  
  if (!isValid) {
    throw new Error('Invalid friend PID');
  }
  
  // ステップ3: 友達エントリ作成
  const friendEntry: FriendEntry = {
    id: generateId(),
    owner_did: ownerDid,
    friend_did: friendData.did,
    friend_pid: friendData.pid,
    friend_label_qr_hash: await hashData(qrData),
    verified: true,
    label,
    is_revoked: false,
    can_use_for_shipping: true,
    added_at: new Date().toISOString(),
  };
  
  // ステップ4: クラウドに保存
  await client.friends.create(friendEntry);
  
  return friendEntry;
}
```

### 4.2 友達リストの取得

```typescript
async function getFriends(ownerDid: string): Promise<FriendEntry[]> {
  const friends = await client.friends.list({
    owner_did: ownerDid,
    is_revoked: false,
  });
  
  return friends;
}
```

### 4.3 友達QR生成（自分用）

```typescript
async function generateMyFriendQR(
  userDid: string,
  userPid: string,
  userPrivateKey: string
): Promise<string> {
  const payload = {
    version: '1.0',
    did: userDid,
    pid: userPid,
    timestamp: new Date().toISOString(),
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  };
  
  // 署名
  const signature = await signData(JSON.stringify(payload), userPrivateKey);
  
  const qrPayload = {
    ...payload,
    signature,
  };
  
  // QR生成
  const qrCode = await generateFriendQR(qrPayload);
  
  return qrCode;
}
```

---

## 5. 配送統合の実装

### 5.1 ECサイトでの配送先検証

```typescript
import {
  validateShippingRequest,
  createZKCircuit,
  createZKPWaybill,
} from '@vey/core';

async function validateShippingAddress(
  pid: string,
  ecDid: string,
  shippingConditions: ShippingCondition
): Promise<{ valid: boolean; zkProof?: ZKProof }> {
  // ステップ1: ZK回路の準備
  const circuit = createZKCircuit(
    'shipping-validation-v1',
    'Shipping Address Validation',
    'Validates shipping address against EC conditions'
  );
  
  // ステップ2: 検証リクエスト作成
  const request: ShippingValidationRequest = {
    pid,
    userSignature: '', // ユーザーから取得
    conditions: shippingConditions,
    requesterId: ecDid,
    timestamp: new Date().toISOString(),
  };
  
  // ステップ3: Address Providerに検証依頼
  const response = await client.shipping.validate(request, circuit);
  
  return {
    valid: response.valid,
    zkProof: response.zkProof,
  };
}
```

### 5.2 送り状発行

```typescript
async function issueWaybill(
  orderId: string,
  pid: string,
  zkProof: ZKProof,
  carrierInfo: { id: string; name: string }
): Promise<ZKPWaybill> {
  // 追跡番号生成
  const trackingNumber = generateTrackingNumber(orderId);
  
  // 送り状作成
  const waybill = createZKPWaybill(
    `WB-${orderId}`,
    pid,
    zkProof,
    trackingNumber,
    {
      parcelWeight: 2.5,
      parcelSize: '60',
      carrierZone: 'KANTO-01',
      senderName: 'EC Store',
      recipientName: 'Customer', // 実名は含まない
      carrierInfo,
    }
  );
  
  // 配送業者に送り状を送信
  await client.shipping.createWaybill(waybill);
  
  return waybill;
}
```

### 5.3 配送業者によるPID解決

```typescript
import { resolvePID, validateAccessPolicy } from '@vey/core';

async function resolveAddressForDelivery(
  pid: string,
  carrierDid: string,
  accessToken: string,
  reason: string
): Promise<{ success: boolean; address?: any }> {
  // ステップ1: アクセスポリシー定義
  const policy: AccessControlPolicy = {
    id: 'carrier-access-policy',
    principal: carrierDid,
    resource: `${pid.split('-').slice(0, 3).join('-')}*`, // 地域レベルまで許可
    action: 'resolve',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24時間
  };
  
  // ステップ2: PID解決リクエスト
  const request: PIDResolutionRequest = {
    pid,
    requesterId: carrierDid,
    accessToken,
    reason,
    timestamp: new Date().toISOString(),
  };
  
  // ステップ3: 解決実行
  const response = await client.carrier.resolvePID(request, policy);
  
  // ステップ4: 監査ログ記録（自動）
  if (response.success) {
    console.log('Address resolved successfully');
    console.log('Audit log created');
  }
  
  return response;
}
```

---

## 6. QR/NFC統合

### 6.1 Google Wallet統合

```typescript
import { generateGoogleWalletPass } from '@vey/qr-nfc';

async function createGoogleWalletAddressPass(
  pid: string,
  encryptedAddress: string,
  userDid: string
): Promise<string> {
  const pass = await generateGoogleWalletPass({
    type: 'address',
    pid,
    encryptedAddress,
    userDid,
    issuerName: 'Vey Address Provider',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  });
  
  // Google Wallet API経由でパスを発行
  const passUrl = await uploadToGoogleWallet(pass);
  
  return passUrl;
}
```

### 6.2 Apple Wallet統合

```typescript
import { generateAppleWalletPass } from '@vey/qr-nfc';

async function createAppleWalletAddressPass(
  pid: string,
  encryptedAddress: string,
  userDid: string
): Promise<Buffer> {
  const pass = await generateAppleWalletPass({
    type: 'address',
    pid,
    encryptedAddress,
    userDid,
    organizationName: 'Vey Address Provider',
    description: 'Address Card',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  });
  
  // .pkpassファイルとして返す
  return pass;
}
```

### 6.3 NFC書き込み

```typescript
import { writeNFCTag } from '@vey/qr-nfc';

async function writeAddressToNFC(
  pid: string,
  encryptedAddress: string,
  signature: string
): Promise<void> {
  const ndefMessage = {
    records: [
      {
        tnf: 0x01, // Well Known
        type: 'U', // URI
        payload: `vey://address/${pid}?data=${encodeURIComponent(encryptedAddress)}&sig=${signature}`,
      },
    ],
  };
  
  await writeNFCTag(ndefMessage);
  console.log('Address written to NFC tag successfully');
}
```

---

## 7. セキュリティベストプラクティス

### 7.1 鍵管理

```typescript
// ❌ 悪い例: ハードコードされた鍵
const privateKey = 'my-secret-key-12345';

// ✅ 良い例: 環境変数または安全なストレージから取得
const privateKey = await getSecureKey('user-private-key');

async function getSecureKey(keyId: string): Promise<string> {
  // モバイル: KeychainまたはKeystore
  // Web: IndexedDB with encryption
  // Server: KMS (AWS KMS, Google Cloud KMS, Azure Key Vault)
  return await secureStorage.get(keyId);
}
```

### 7.2 入力検証

```typescript
import { validateAddressInput, sanitizeInput } from '@vey/core';

async function safeNormalizeAddress(rawAddress: any): Promise<any> {
  // ステップ1: 入力検証
  const validation = validateAddressInput(rawAddress);
  
  if (!validation.valid) {
    throw new Error(`Invalid address input: ${validation.errors.join(', ')}`);
  }
  
  // ステップ2: サニタイズ
  const sanitized = sanitizeInput(rawAddress);
  
  // ステップ3: 正規化
  return await normalizeAddress(sanitized, rawAddress.country);
}
```

### 7.3 エラーハンドリング

```typescript
async function safeRegisterAddress(
  userDid: string,
  userPrivateKey: string,
  rawAddress: any
): Promise<{ success: boolean; pid?: string; error?: string }> {
  try {
    const result = await registerAddress(
      userDid,
      userPrivateKey,
      rawAddress,
      'did:web:vey.example'
    );
    
    return {
      success: true,
      pid: result.pid,
    };
  } catch (error) {
    console.error('Address registration failed:', error);
    
    // ユーザーに適切なエラーメッセージを返す
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

### 7.4 レート制限の実装

```typescript
import { RateLimiter } from '@vey/core';

const limiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60 * 60 * 1000, // 1時間
});

async function rateLimitedRegisterAddress(
  userId: string,
  ...args: any[]
): Promise<any> {
  // レート制限チェック
  const allowed = await limiter.check(userId);
  
  if (!allowed) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }
  
  return await registerAddress(...args);
}
```

### 7.5 監査ログの記録

```typescript
import { createAuditLogEntry } from '@vey/core';

async function logAddressAccess(
  pid: string,
  accessorDid: string,
  action: string,
  result: 'success' | 'denied' | 'error',
  metadata?: any
): Promise<void> {
  const logEntry = createAuditLogEntry(
    pid,
    accessorDid,
    action,
    result,
    {
      ...metadata,
      timestamp: new Date().toISOString(),
      ip: metadata?.ip,
      userAgent: metadata?.userAgent,
    }
  );
  
  // ログを永続化
  await client.audit.log(logEntry);
}
```

---

## 完全な実装例

以下は、すべてを統合した完全な実装例です：

```typescript
import {
  createAddressClient,
  normalizeAddress,
  encodePID,
  createAddressPIDCredential,
  signCredential,
  encryptAddress,
  generateAddressQR,
} from '@vey/core';

class CloudAddressBook {
  private client: any;
  private userDid: string;
  private userPrivateKey: string;
  
  constructor(userDid: string, userPrivateKey: string, apiKey: string) {
    this.userDid = userDid;
    this.userPrivateKey = userPrivateKey;
    this.client = createAddressClient({
      apiKey,
      apiEndpoint: 'https://api.vey.example',
      environment: 'production',
    });
  }
  
  async initialize() {
    await this.client.authenticate({
      did: this.userDid,
      privateKey: this.userPrivateKey,
    });
  }
  
  async addAddress(rawAddress: any, label: string) {
    // 正規化
    const normalized = await normalizeAddress(rawAddress, rawAddress.country);
    
    // PID生成
    const pid = encodePID(normalized);
    
    // VC作成
    const vc = createAddressPIDCredential(
      this.userDid,
      'did:web:vey.example',
      pid,
      normalized.countryCode,
      normalized.admin1
    );
    
    // 署名
    const signedVC = await signCredential(vc, this.userPrivateKey, `${this.userDid}#key-1`);
    
    // 暗号化
    const encrypted = await encryptAddress(
      JSON.stringify(rawAddress),
      this.userPrivateKey
    );
    
    // 保存
    const addressEntry = {
      user_did: this.userDid,
      pid,
      encrypted_address_local: encrypted.ciphertext,
      encryption_algorithm: 'AES-256-GCM',
      encryption_iv: encrypted.iv,
      country_code: normalized.countryCode,
      signature: signedVC.proof?.proofValue || '',
      vc_id: signedVC.id,
      is_revoked: false,
      label,
      created_at: new Date().toISOString(),
    };
    
    await this.client.addresses.create(addressEntry);
    
    return { pid, vc: signedVC };
  }
  
  async getAddresses() {
    return await this.client.addresses.list({ user_did: this.userDid });
  }
  
  async generateQR(pid: string) {
    const address = await this.client.addresses.getByPid(pid);
    const decrypted = await decryptAddress(
      address.encrypted_address_local,
      address.encryption_iv,
      this.userPrivateKey
    );
    
    return await generateAddressQR({
      version: '1.0',
      pid,
      encrypted_address: address.encrypted_address_local,
      signature: address.signature,
      timestamp: new Date().toISOString(),
    });
  }
  
  async addFriend(qrData: string, label: string) {
    const friendData = JSON.parse(qrData);
    
    const friendEntry = {
      owner_did: this.userDid,
      friend_did: friendData.did,
      friend_pid: friendData.pid,
      friend_label_qr_hash: await hashData(qrData),
      verified: true,
      label,
      is_revoked: false,
      can_use_for_shipping: true,
      added_at: new Date().toISOString(),
    };
    
    await this.client.friends.create(friendEntry);
    
    return friendEntry;
  }
}

// 使用例
async function main() {
  const addressBook = new CloudAddressBook(
    'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
    process.env.USER_PRIVATE_KEY!,
    process.env.VEY_API_KEY!
  );
  
  await addressBook.initialize();
  
  // 住所追加
  const result = await addressBook.addAddress(
    {
      country: 'JP',
      postalCode: '150-0043',
      province: '東京都',
      city: '渋谷区',
      streetAddress: '道玄坂1-2-3',
    },
    '自宅'
  );
  
  console.log('Address registered:', result.pid);
  
  // QR生成
  const qr = await addressBook.generateQR(result.pid);
  console.log('QR code generated');
  
  // 友達追加
  const friend = await addressBook.addFriend(friendQrData, '田中さん');
  console.log('Friend added:', friend.label);
}

main().catch(console.error);
```

---

## 関連ドキュメント

- [Cloud Address Book System](./cloud-address-book.md) - システム概要
- [Architecture](./cloud-address-book-architecture.md) - アーキテクチャ
- [ZKP Protocol](./zkp-protocol.md) - ZKPプロトコル
- [API Documentation](./zkp-api.md) - API仕様

---

## ライセンス

MIT License
