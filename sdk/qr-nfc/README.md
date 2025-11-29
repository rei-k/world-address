# @vey/qr-nfc

QRコードとNFCを活用した住所関連機能のSDK

QR code and NFC utilities for address handling in the Vey World Address SDK.

## 📋 概要 / Overview

このパッケージは、住所データをQRコードやNFCタグを通じて共有・認証・交換するための機能を提供します。

This package provides functionality for sharing, authenticating, and exchanging address data through QR codes and NFC tags.

## 🔐 ゼロ知識証明 (Zero-Knowledge Proof / ZKP) 機能

### 概要

このパッケージは、高度な暗号技術を使用したゼロ知識証明機能を提供します。これにより、住所の存在を証明しながら、実際の住所情報を開示することなくプライバシーを保護できます。

This package provides advanced Zero-Knowledge Proof (ZKP) capabilities using cryptographic techniques. This allows proving address existence while protecting privacy without revealing actual address information.

### サポートするアルゴリズム / Supported Algorithms

| アルゴリズム | 説明 | 用途 |
|-------------|------|------|
| **Pedersen Commitment** | ハッシュベースのコミットメントスキーム | 住所の存在証明 |
| **Schnorr Proof** | Fiat-Shamirヒューリスティックを使用した知識証明 | 秘密情報の知識証明 |
| **Merkle Tree** | ハッシュベースのメンバーシップ証明 | データベース所属証明 |

> **⚠️ セキュリティノート**: PedersenとSchnorrの実装は、Web Crypto APIを使用した簡易化されたハッシュベースの実装です。正式なゼロ知識証明の保証が必要な本番システムでは、楕円曲線暗号ライブラリ（libsodium、snarkjs等）の使用を推奨します。
>
> **⚠️ Security Note**: The Pedersen and Schnorr implementations are simplified hash-based implementations using Web Crypto API. For production systems requiring formal ZKP guarantees, use a proper elliptic curve cryptography library (e.g., libsodium, snarkjs).

### 使用例 / Usage Examples

#### 1. 暗号学的住所証明 (V2) / Cryptographic Address Proof (V2)

```typescript
import { createAddressProofV2, verifyAddressProofV2, randomBytes } from '@vey/qr-nfc';

const address = {
  recipient: '山田太郎',
  street_address: '千代田区千代田1-1',
  city: '千代田区',
  province: '東京都',
  postal_code: '100-0001',
  country: 'Japan'
};

// 秘密鍵を生成
const secret = randomBytes(32);

// 暗号学的に安全な住所証明を作成（SHA-256ハッシュ + HMAC-SHA256署名）
const proof = await createAddressProofV2(address, {
  expiresIn: 3600,  // 1時間有効
  secret: secret
});

// 証明を検証
const result = await verifyAddressProofV2(proof, { 
  secret: secret,
  address: address  // オプション：住所ハッシュも検証
});

if (result.valid && result.addressVerified) {
  console.log('住所が暗号学的に確認されました');
}
```

#### 2. ZKP住所存在証明 / ZKP Address Existence Proof

```typescript
import { createZKPAddressProof, verifyZKPAddressProof, randomBytes } from '@vey/qr-nfc';

const secret = randomBytes(32);

// Pedersenコミットメントを使用したZKP証明
const zkpProof = await createZKPAddressProof(address, {
  algorithm: 'pedersen',
  expiresIn: 3600,
  secret: secret
});

// 証明を検証（住所を知らなくても検証可能）
const result = await verifyZKPAddressProof(zkpProof, { secret });

console.log(`証明有効: ${result.valid}`);
console.log(`使用アルゴリズム: ${result.algorithm}`);
```

#### 3. 選択的開示 / Selective Disclosure

住所の一部のみを開示しながら、全体の存在を証明：

```typescript
import { createZKPAddressProof } from '@vey/qr-nfc';

// 国と郵便番号のみを開示
const proof = await createZKPAddressProof(address, {
  disclosureFields: ['country', 'postal_code']
});

// 開示されたフィールド
console.log(proof.data.disclosed_fields?.revealed);
// { country: 'Japan', postal_code: '100-0001' }

// 他のフィールドはハッシュとして保存（開示されない）
console.log(proof.data.disclosed_fields?.hashes);
// { recipient: 'abc...', street_address: 'def...', ... }
```

#### 4. 地域証明 / Region Proof

住所全体を開示せずに、特定の地域に住んでいることを証明：

```typescript
import { createRegionProof } from '@vey/qr-nfc';

// 国のみを開示
const countryProof = await createRegionProof(address);
// -> { country: 'Japan' } のみ開示

// 都道府県まで開示
const prefectureProof = await createRegionProof(address, ['country', 'province']);
// -> { country: 'Japan', province: 'Tokyo' } のみ開示
```

#### 5. 郵便番号証明 / Postal Code Proof

配送可能エリアの確認に使用：

```typescript
import { createPostalCodeProof } from '@vey/qr-nfc';

const proof = await createPostalCodeProof(address);
// -> { postal_code: '100-0001', country: 'Japan' } のみ開示
```

#### 6. Merkleツリー証明 / Merkle Tree Proof

住所がデータベースに存在することを証明：

```typescript
import { 
  sha256, 
  calculateMerkleRoot, 
  generateMerkleProof, 
  verifyMerkleProof 
} from '@vey/qr-nfc';

// 住所データベースのハッシュリスト
const addressHashes = await Promise.all(
  addresses.map(addr => sha256(JSON.stringify(addr)))
);

// Merkleルートを計算
const merkleRoot = await calculateMerkleRoot(addressHashes);

// 特定の住所のMerkle証明を生成
const targetHash = await sha256(JSON.stringify(address));
const proof = await generateMerkleProof(targetHash, addressHashes);

// 証明を検証（ルートを知っていれば、データベース全体を知らなくても検証可能）
const isValid = await verifyMerkleProof(
  proof.leaf,
  proof.root,
  proof.proof,
  proof.positions
);
```

### 暗号化ユーティリティ / Cryptographic Utilities

```typescript
import { sha256, hmacSha256, verifyHmacSha256, randomBytes } from '@vey/qr-nfc';

// SHA-256ハッシュ
const hash = await sha256('data to hash');

// HMAC-SHA256署名
const signature = await hmacSha256('message', 'secret-key');

// 署名検証
const isValid = await verifyHmacSha256('message', signature, 'secret-key');

// 暗号学的に安全な乱数生成
const randomHex = randomBytes(32);  // 32バイト = 64文字のhex
```

## 🎯 QRコードでできること / QR Code Use Cases

### 1. 📍 住所共有 (Address Sharing)

**用途**: 住所情報をQRコードでかんたんに共有

- ECサイトでの住所入力簡素化
- 名刺への住所QRコード埋め込み
- イベント招待状での会場住所共有

```typescript
import { createAddressQR, generateQRCodeURL } from '@vey/qr-nfc';

// 住所QRコードを生成
const address = {
  recipient: '山田太郎',
  street_address: '千代田区千代田1-1',
  city: '千代田区',
  province: '東京都',
  postal_code: '100-0001',
  country: 'Japan'
};

const qrPayload = createAddressQR(address, 'addr_12345');
const qrData = generateQRCodeURL(qrPayload);
// → QRコードライブラリに渡してQRコードを生成
```

### 2. 🔐 住所証明 (Address Proof / Proof of Residence)

**用途**: ゼロ知識証明による住所の存在確認

- 本人確認書類なしでの住所確認
- プライバシーを保護した住所検証
- 時限式の住所証明（有効期限付き）

#### 基本的な使用例（レガシーV1）

```typescript
import { createAddressProof, verifyAddressProof } from '@vey/qr-nfc';

// 住所証明を生成（1時間有効）
const proof = createAddressProof(address, {
  expiresIn: 3600, // 秒
  proofId: 'proof_abc123'
});

// 証明を検証
const result = verifyAddressProof(proof);
if (result.valid && !result.expired) {
  console.log('住所が確認されました');
}
```

#### 暗号学的に安全な住所証明（V2推奨）

```typescript
import { createAddressProofV2, verifyAddressProofV2, randomBytes } from '@vey/qr-nfc';

const secret = randomBytes(32);

// SHA-256 + HMAC-SHA256を使用した安全な証明
const proofV2 = await createAddressProofV2(address, {
  expiresIn: 3600,
  secret: secret
});

// 暗号学的検証
const result = await verifyAddressProofV2(proofV2, { secret });
```

**活用シーン**:
- 銀行口座開設時の住所確認
- 年齢確認サービス（住所から地域のみを証明）
- サブスクリプションサービスの配送可否確認

### 3. 📦 宅配ロッカー連携 (Locker Integration)

**用途**: 宅配ロッカーへのピックアップ指示

- ロッカーの場所・番号をQRコードで共有
- 受取人がスキャンして場所を確認
- 配達完了時の通知リンク生成

```typescript
import { createLockerQR } from '@vey/qr-nfc';

const lockerQR = createLockerQR(
  'locker_001',
  '渋谷駅東口ロッカー',
  {
    street_address: '渋谷区渋谷2-24-12',
    city: '渋谷区',
    province: '東京都',
    postal_code: '150-0002',
    country: 'Japan'
  },
  'A-15' // ボックス番号
);
```

### 4. 🚚 配送トラッキング (Delivery Tracking)

**用途**: 配送状況の追跡リンク

- 配送伝票へのQRコード埋め込み
- リアルタイム追跡ページへのリンク
- 配達完了証明の生成

```typescript
import { generateQRData, QRPayload } from '@vey/qr-nfc';

const deliveryPayload: QRPayload = {
  type: 'delivery',
  version: 1,
  data: {
    tracking_id: 'TRACK123456789',
    carrier: 'vey-logistics',
    destination: address,
    estimated_delivery: '2025-01-15T14:00:00Z'
  }
};

const qrData = generateQRData(deliveryPayload);
```

### 5. 🏪 店舗受取 (Store Pickup / Click & Collect)

**用途**: 店舗受取の予約・確認

- オンライン注文の店舗受取確認
- 受取窓口でのQRコード提示
- 複数店舗からの最寄り店舗選択

### 6. 🌍 多言語住所変換 (Multilingual Address)

**用途**: 一つのQRコードで複数言語の住所を提供

- 観光客向けの多言語対応
- 国際配送での言語切替
- ローマ字表記と現地語表記の両立

```typescript
const multilingualAddress = {
  type: 'address',
  version: 1,
  data: {
    address: {
      recipient: 'Taro Yamada',
      street_address: '1-1 Chiyoda, Chiyoda-ku',
      city: 'Tokyo',
      postal_code: '100-0001',
      country: 'Japan'
    },
    translations: {
      ja: {
        recipient: '山田太郎',
        street_address: '千代田区千代田1-1',
        city: '東京都',
        postal_code: '〒100-0001',
        country: '日本'
      }
    }
  }
};
```

## 📱 NFCでできること / NFC Use Cases

### 1. 🏠 ワンタップ住所登録 (One-Tap Address Registration)

**用途**: NFCタグをタップするだけで住所を登録

- 引越し時の住所変更一括登録
- 新居のNFCタグに住所を書き込み
- 来訪者への住所共有

```typescript
import { createNFCHandler, NFCRecord } from '@vey/qr-nfc';

const nfc = createNFCHandler();

// NFCタグに住所を書き込み
if (nfc.supported) {
  const record: NFCRecord = {
    type: 'address',
    data: {
      recipient: '山田太郎',
      street_address: '千代田区千代田1-1',
      city: '東京都',
      postal_code: '100-0001',
      country: 'Japan'
    }
  };
  
  await nfc.write(record);
  console.log('住所をNFCタグに書き込みました');
}
```

### 2. 📋 名刺交換 (Business Card Exchange)

**用途**: NFC内蔵名刺での住所交換

- デジタル名刺への住所埋め込み
- タップで連絡先アプリに住所追加
- 環境にやさしいペーパーレス名刺

### 3. 🚪 スマートドアベル連携 (Smart Doorbell Integration)

**用途**: 玄関先でのタップ操作

- 配達員がNFCをタップして配達完了通知
- 不在時の置き配指示
- 訪問者への住所確認

### 4. 📦 宅配ボックス開錠 (Locker Unlock)

**用途**: NFCタップで宅配ボックスを開錠

- 受取人のスマホで認証
- 時限式のアクセス権限
- 配達完了の自動記録

```typescript
import { createNFCHandler } from '@vey/qr-nfc';

const nfc = createNFCHandler();

// NFCタグから情報を読み取り
if (nfc.supported) {
  const record = await nfc.read();
  
  if (record?.type === 'locker') {
    const lockerData = record.data as {
      locker_id: string;
      compartment: string;
    };
    
    console.log(`ロッカー ${lockerData.locker_id} を開錠します`);
    // 開錠処理...
  }
}
```

### 5. 🏢 オフィスビル入館 (Building Access)

**用途**: 来訪者の住所確認と入館管理

- 訪問者がNFCタップで住所を提示
- 受付での本人確認簡素化
- 入館記録の自動化

### 6. 🚗 カーナビ連携 (Car Navigation Integration)

**用途**: NFCタップで目的地設定

- 宿泊施設のNFCカードをタップ
- カーナビに住所を自動設定
- レンタカーでの目的地共有

## 🔧 高度な使用例 / Advanced Use Cases

### オフライン住所証明

インターネット接続なしでも住所を証明:

```typescript
// オフライン署名付き証明
const offlineProof = createAddressProof(address, {
  expiresIn: 86400, // 24時間
  secret: 'your-secret-key' // 事前共有鍵
});
```

### 住所変更のチェーン証明

引越し履歴を証明可能な形で記録:

```typescript
const addressHistory: QRPayload = {
  type: 'proof',
  version: 1,
  data: {
    chain: [
      { address: '旧住所', valid_from: '2020-01-01', valid_until: '2023-03-31' },
      { address: '現住所', valid_from: '2023-04-01', valid_until: null }
    ]
  }
};
```

### IoTデバイス連携

スマートホームデバイスとの連携:

```typescript
// スマートロックに住所情報を設定
const smartLockConfig: NFCRecord = {
  type: 'address',
  data: {
    device_type: 'smart_lock',
    address: address,
    authorized_users: ['user_001', 'user_002']
  }
};
```

## 📊 ユースケースまとめ / Use Case Summary

| 機能 | QR | NFC | 主な用途 |
|------|:--:|:---:|----------|
| 住所共有 | ✅ | ✅ | EC、名刺、招待状 |
| 住所証明 | ✅ | ❌ | 本人確認、アカウント作成 |
| ロッカー連携 | ✅ | ✅ | 宅配受取、店舗受取 |
| 配送追跡 | ✅ | ❌ | 荷物追跡、配達通知 |
| 名刺交換 | ✅ | ✅ | ビジネス、イベント |
| 入館管理 | ✅ | ✅ | オフィス、マンション |
| カーナビ連携 | ❌ | ✅ | 車載機器連携 |
| スマートホーム | ❌ | ✅ | IoT機器設定 |

## 🔐 セキュリティ考慮事項 / Security Considerations

### 暗号化技術

- **SHA-256**: 住所データのハッシュ化に使用。衝突耐性があり、元データの推測が困難
- **HMAC-SHA256**: デジタル署名に使用。改ざん検出と認証を提供
- **Pedersenコミットメント**: 情報を秘匿しながらコミットメントを作成
- **Merkleツリー**: データベースメンバーシップの効率的な証明

### QRコード
- 有効期限を設定して不正利用を防止
- 署名付きペイロードで改ざんを検出
- 最小限の情報のみを含める（選択的開示）
- V2ではHMAC-SHA256による暗号学的署名

### NFC
- 暗号化された通信を使用
- 認証済みデバイスのみ書き込み許可
- 読み取りログを保持

### プライバシー保護
- ゼロ知識証明により、住所全体を開示せずに存在を証明
- 選択的開示で必要最小限の情報のみを共有
- ハッシュベースのコミットメントで元データを保護

## 📦 インストール / Installation

```bash
npm install @vey/qr-nfc @vey/core
```

## 🔗 関連パッケージ / Related Packages

- [`@vey/core`](../core) - コアSDK
- [`@vey/react`](../react) - Reactコンポーネント
- [`@vey/widget`](../widget) - Webウィジェット

## 📄 ライセンス / License

MIT
