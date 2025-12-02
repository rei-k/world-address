# 📱 Google Wallet & Apple Wallet 統合ガイド
# Google Wallet & Apple Wallet Integration Guide

住所帳・送り状・ホテルチェックインのための完全なウォレット統合ガイド

Complete wallet integration guide for address books, shipping labels, and hotel check-ins.

---

## 目次 / Table of Contents

1. [概要 / Overview](#概要--overview)
2. [住所プロフィールカード / Address ID Card](#1-住所プロフィールカードaddress-id-card)
3. [住所共有QR / Friend Address QR](#2-住所共有qrfriend-address-qr)
4. [送り状 / Shipping Label](#3-送り状shipping-labelwaybill-token)
5. [ホテルチェックイン / Hotel Check-in](#4-ホテルチェックインhotel-check-in)
6. [住所更新・転送 / Address Moving & Forwarding](#5-住所更新転送address-moving--forwarding)
7. [オフライン主権 / Offline Ownership](#6-オフライン主権offline-ownership)
8. [ウォレット機能 / Wallet Side Functions](#7-ウォレット機能wallet-side-functions)
9. [ZKP拡張 / ZKP Extension](#8-zkp拡張zkp-extension)
10. [セキュリティ考慮事項 / Security Considerations](#セキュリティ考慮事項--security-considerations)

---

## 概要 / Overview

このガイドでは、Google WalletとApple Walletで**住所そのもの**ではなく**PIDハンドル**を中心とした、プライバシー保護型の住所管理システムを実装します。

This guide implements a privacy-preserving address management system centered on **PID handles** rather than exposing actual addresses in Google Wallet and Apple Wallet.

### 主要原則 / Key Principles

- 🔒 **住所そのもの** → クラウド住所帳のみに保存
- 🔑 **共有** → PID/QR/DIDのみ
- 📱 **体験** → NFC/QRで"機能だけ使う"
- 📊 **監査** → 復号はログだけ確認
- 🤝 **連携** → EC/ホテル/金融は最小情報だけ

---

## 1. 住所プロフィールカード（Address ID Card）

### 概要

名前/住所そのものは見せず、**PIDハンドル**で保存する"秘匿カード"です。

A "concealed card" that stores a **PID handle** without showing the actual name/address.

### 特徴

- カード表面：国と言語だけ（例：Japan / English）
- カード裏面：本人のみがフル住所を確認できる
- 署名付きで真正性を保証（改ざん不可）
- 失効/更新ボタン（引越し後の古い住所を無効化）

### 使用例

```typescript
import { createAddressIDCard, revokeAddressIDCard } from '@vey/qr-nfc';

// 住所データ
const myAddress = {
  recipient: '山田太郎',
  street_address: '千代田区千代田1-1',
  city: '千代田区',
  province: '東京都',
  postal_code: '100-0001',
  country: 'JP',
  phone: '+81-3-1234-5678'
};

// プライベートキー（ウォレットが管理）
const privateKey = 'your-secure-private-key';

// 住所IDカードを作成
const card = await createAddressIDCard(
  myAddress,
  'ja',  // 言語
  privateKey
);

console.log('PID:', card.pid);  // JP-A1B2-C3D4-E5F6-...
console.log('Country:', card.country);  // JP
console.log('Locale:', card.locale);  // ja
console.log('Status:', card.status);  // active

// カードを失効（引越し時など）
const revokedCard = revokeAddressIDCard(card);
console.log('Revoked at:', revokedCard.revoked_at);
```

### データ構造

```typescript
interface AddressIDCard {
  pid: string;                    // PIDハンドル
  country: string;                // 国コード（表面）
  locale: string;                 // 言語（表面）
  encrypted_address: string;      // 暗号化された住所（裏面）
  signature: string;              // WebAuthn署名
  issued_at: string;              // 発行日時
  expires_at?: string;            // 有効期限
  status: 'active' | 'revoked' | 'expired';
  revoked_at?: string;            // 失効日時
  version: number;                // バージョン
}
```

### ウォレット表示

#### カード表面（公開情報）
```
┌─────────────────────────┐
│  Address ID Card        │
│                         │
│  🌍 Japan               │
│  🗣️ 日本語 (Japanese)    │
│                         │
│  PID: JP-****-****      │
└─────────────────────────┘
```

#### カード裏面（本人のみ）
```
┌─────────────────────────┐
│  Full Address           │
│                         │
│  山田太郎                │
│  〒100-0001             │
│  東京都千代田区         │
│  千代田1-1              │
│                         │
│  📞 +81-3-1234-5678    │
└─────────────────────────┘
```

---

## 2. 住所共有QR（Friend Address QR）

### 概要

友達追加専用のQRコードを発行します。読み取る側は「住所の存在の証明だけ」確認できます。

Issue a QR code specifically for friend registration. Readers can only verify the "proof of address existence."

### 特徴

- QRには住所暗号Blob + 署名 + 有効期限を含む
- クラウド住所帳へは`friend_pid`だけ保存
- 失効（Revocation）できる
- スキャン履歴は粗い地域でしか記録しない

### 使用例

```typescript
import { createFriendAddressQR, revokeFriendAddressQR, generateQRData } from '@vey/qr-nfc';

// 友達共有用QRを作成（7日間有効）
const friendQR = await createFriendAddressQR(
  myAddress,
  'ja',
  privateKey,
  7  // 有効日数
);

// QRコードデータを生成
const qrData = generateQRData({
  type: 'address',
  version: 1,
  data: friendQR
});

console.log('Friend PID:', friendQR.pid);
console.log('Expires at:', friendQR.expires_at);

// QRを失効
const revokedQR = revokeFriendAddressQR(friendQR);
```

### QRデータ構造

```typescript
interface FriendAddressQR {
  pid: string;              // 友達専用PID
  country: string;          // 国コード
  locale: string;           // 言語
  encrypted: string;        // 暗号化Blob
  signature: string;        // ウォレット署名
  expiry: string;           // "7days"
  expires_at: string;       // 有効期限タイムスタンプ
  created_at: string;       // 作成日時
  revoked: boolean;         // 失効フラグ
  revoked_at?: string;      // 失効日時
}
```

### QR例

```json
{
  "pid": "JP-F1E2-D3C4-B5A6-...",
  "country": "JP",
  "locale": "ja",
  "encrypted": "AES-GCM blob...",
  "signature": "wallet-bound-signature",
  "expiry": "7days",
  "expires_at": "2025-01-10T00:00:00Z",
  "created_at": "2025-01-03T00:00:00Z",
  "revoked": false
}
```

---

## 3. 送り状（Shipping Label/Waybill Token）

### 概要

ウォレットから直接送り状を発行できます。FROM/TOはPID選択またはQR選択で、生住所は最後の配送拠点だけが復号できます。

Issue shipping labels directly from the wallet. FROM/TO are PID selection or QR selection, with actual addresses decryptable only by the final delivery hub.

### 特徴

- 追跡番号は住所やユーザーに紐づかないランダムToken
- キャリア選択、集荷オプション、サイズ推定プリセット
- ZKで「国/配送可能エリアだけ」検証できるProofを添付可能

### 使用例

```typescript
import { createWaybillToken } from '@vey/qr-nfc';

// 送り元と送り先の住所
const fromAddress = { /* 自分の住所 */ };
const toAddress = { /* 友達の住所 */ };

// 送り状を作成
const waybill = await createWaybillToken(
  fromAddress,
  toAddress,
  'yamato',  // キャリア
  privateKey,
  {
    pickupOptions: {
      scheduled_time: '2025-01-05T14:00:00Z',
      location_type: 'home',
      special_instructions: '玄関前に置いてください'
    },
    sizePreset: 'medium'
  }
);

console.log('Waybill ID:', waybill.waybill_id);
console.log('Tracking Number:', waybill.tracking_number);
console.log('From PID:', waybill.from_pid);
console.log('To PID:', waybill.to_pid);
```

### データ構造

```typescript
interface WaybillToken {
  waybill_id: string;           // 送り状ID
  from_pid: string;             // 送り元PID
  to_pid: string;               // 送り先PID
  encrypted_from: string;       // 暗号化送り元住所
  encrypted_to: string;         // 暗号化送り先住所
  tracking_number: string;      // ランダム追跡番号
  carrier: string;              // 配送業者
  pickup_options?: {
    scheduled_time?: string;
    location_type?: 'home' | 'office' | 'locker';
    special_instructions?: string;
  };
  size_preset?: 'small' | 'medium' | 'large' | 'custom';
  region_proof?: {
    proof_type: 'zk_region' | 'zk_country';
    proof_data: string;
    verified_at: string;
  };
  created_at: string;
  signature: string;
}
```

---

## 4. ホテルチェックイン（Hotel Check-in）

### 概要

ウォレットでチェックイン用NFC/QRトークンを生成します。施設は生住所を保存せず、チェックイン後に破棄します。

Generate check-in NFC/QR tokens from the wallet. Facilities do not store actual addresses and discard them after check-in.

### 特徴

- 施設が必要とする国/滞在日/予約IDの一致証明
- 住所暗号Blob（復号は施設アプリに権限付与された場合のみ）
- 署名と認証タグ付き

### 使用例

```typescript
import { createHotelCheckinToken } from '@vey/qr-nfc';

// チェックイントークンを作成
const checkinToken = await createHotelCheckinToken(
  myAddress,
  'RES-2025-001',      // 予約ID
  'HOTEL-TOKYO-001',   // 施設ID
  '2025-01-10',        // チェックイン日
  '2025-01-12',        // チェックアウト日
  privateKey,
  true  // 施設に住所復号権限を付与
);

console.log('Token ID:', checkinToken.token_id);
console.log('Guest PID:', checkinToken.guest_pid);
console.log('Permission Granted:', checkinToken.facility_permission_granted);
```

### データ構造

```typescript
interface HotelCheckinToken {
  token_id: string;
  guest_pid: string;
  reservation_id: string;
  facility_id: string;
  checkin_date: string;
  checkout_date: string;
  country: string;
  encrypted_address: string;
  facility_permission_granted: boolean;
  signature: string;
  auth_tag: string;
  created_at: string;
  expires_at: string;
  status: 'active' | 'used' | 'expired' | 'revoked';
}
```

---

## 5. 住所更新・転送（Address Moving & Forwarding）

### 概要

引越し先で新しいAddress Cardを発行し、旧カードは失効します。新カードで`forwarding_flag`を追加できます。

Issue a new Address Card at the new location and revoke the old card. Add a `forwarding_flag` to the new card.

### 使用例

```typescript
import { 
  createAddressForwarding,
  addServiceNotification,
  markServiceNotified 
} from '@vey/qr-nfc';

// 引越し情報を作成（6ヶ月間転送）
let forwarding = await createAddressForwarding(
  oldAddress,
  newAddress,
  6,  // 転送期間（月）
  privateKey
);

// 通知するサービスを追加
forwarding = addServiceNotification(
  forwarding,
  'financial',
  'My Bank'
);

forwarding = addServiceNotification(
  forwarding,
  'logistics',
  'Amazon'
);

// サービスに通知完了をマーク
forwarding = markServiceNotified(forwarding, 'My Bank');

console.log('Old PID:', forwarding.old_pid);
console.log('New PID:', forwarding.new_pid);
console.log('Forwarding until:', forwarding.forwarding_expires_at);
```

### データ構造

```typescript
interface AddressForwarding {
  old_pid: string;
  new_pid: string;
  moved_at: string;
  forwarding_period: string;
  forwarding_expires_at: string;
  forwarding_active: boolean;
  notify_services?: Array<{
    service_type: 'financial' | 'hotel' | 'logistics' | 'government' | 'other';
    service_name: string;
    notified: boolean;
    notified_at?: string;
  }>;
}
```

---

## 6. オフライン主権（Offline Ownership）

### 概要

ネット未接続でもQR/NFCチェックイン/送り状発行が使えます。

Use QR/NFC check-in and shipping label issuance even without internet connection.

### 特徴

- 署名検証だけで「形式上の正しさ」「存在」を保証
- 復号は通信復帰時または権限のある拠点のみ

### 使用例

```typescript
// オフラインモードでカードを作成
const offlineCard = await createAddressIDCard(
  myAddress,
  'ja',
  privateKey,
  {
    provider: 'custom',
    encryption: 'AES-256-GCM',
    signature: 'WebAuthn',
    default_qr_expiry: 7 * 24 * 3600,
    offline_mode: true,  // オフラインモード有効
    zkp_enabled: true
  }
);

// 署名検証（オンラインなしで可能）
const crypto = new WalletCrypto();
const isValid = await crypto.verifySignature(
  JSON.stringify({
    pid: offlineCard.pid,
    country: offlineCard.country,
    locale: offlineCard.locale
  }),
  offlineCard.signature,
  privateKey  // 公開鍵として使用
);
```

---

## 7. ウォレット機能（Wallet Side Functions）

### ウォレット内で利用可能な機能

```typescript
interface WalletFeatures {
  address_cards: AddressIDCard[];           // 住所カード一覧
  friend_qrs: FriendAddressQR[];            // 友達QR
  waybills: WaybillToken[];                 // 送り状
  hotel_checkins: HotelCheckinToken[];      // ホテルチェックイン
  forwardings: AddressForwarding[];         // 転送設定
  audit_log: AuditLogEntry[];               // 監査ログ
  default_country?: string;                 // デフォルト国
  default_language?: string;                // デフォルト言語
}
```

### 監査ログ（Audit Log）

```typescript
import { createAuditLogEntry } from '@vey/qr-nfc';

// 監査ログエントリを作成
const logEntry = createAuditLogEntry(
  'JP-A1B2-C3D4-...',  // PID
  'decrypted',         // アクション
  'EC Site XYZ',       // アクセス元
  'Shipping',          // 目的
  'Tokyo'              // 粗い地域
);

console.log('Log Entry ID:', logEntry.entry_id);
console.log('Timestamp:', logEntry.timestamp);
```

### ウォレットUI画面設計

#### 1. Address Card Collection（住所カード一覧）
```
┌─────────────────────────────────┐
│ 住所カード                       │
├─────────────────────────────────┤
│ ✅ 自宅                          │
│    🌍 Japan / 日本語             │
│    PID: JP-****-****            │
│                                 │
│ ✅ 実家                          │
│    🌍 Japan / 日本語             │
│    PID: JP-****-****            │
│                                 │
│ ❌ 旧住所（失効済み）             │
│    🌍 Japan / 日本語             │
│    PID: JP-****-**** (Revoked)  │
│                                 │
│ [+ 新しいカードを追加]           │
└─────────────────────────────────┘
```

#### 2. Friend QR Scanner（友達QRスキャナー）
```
┌─────────────────────────────────┐
│ 友達の住所を追加                 │
├─────────────────────────────────┤
│                                 │
│     📷 QRコードをスキャン         │
│                                 │
│  または                          │
│                                 │
│  📡 NFC をタップ                 │
│                                 │
│─────────────────────────────────│
│ 登録済み友達:                    │
│  • 田中さん (JP-****-****)      │
│  • 鈴木さん (US-****-****)      │
│  • 佐藤さん (UK-****-****)      │
└─────────────────────────────────┘
```

#### 3. Waybill Generator（送り状生成）
```
┌─────────────────────────────────┐
│ 送り状を作成                     │
├─────────────────────────────────┤
│ 送り元:                          │
│  [自宅 ▼]                        │
│                                 │
│ 送り先:                          │
│  [田中さん ▼]                    │
│                                 │
│ 配送業者:                        │
│  [ヤマト運輸 ▼]                  │
│                                 │
│ サイズ:                          │
│  ○ 小  ● 中  ○ 大              │
│                                 │
│ 集荷オプション:                  │
│  日時: [2025/01/05 14:00]       │
│  場所: ○ 自宅  ○ オフィス        │
│  備考: [玄関前に置く]            │
│                                 │
│ [送り状を発行]                   │
└─────────────────────────────────┘
```

#### 4. Hotel Check-in（ホテルチェックイン）
```
┌─────────────────────────────────┐
│ チェックイントークン             │
├─────────────────────────────────┤
│ 予約番号:                        │
│  [RES-2025-001]                 │
│                                 │
│ ホテル:                          │
│  [東京ホテル]                    │
│                                 │
│ チェックイン:                    │
│  [2025/01/10]                   │
│                                 │
│ チェックアウト:                  │
│  [2025/01/12]                   │
│                                 │
│ ☑️ ホテルに住所情報へのアクセスを │
│    許可する                      │
│                                 │
│ [QR/NFCトークンを生成]           │
│                                 │
│     📱 生成されたQRコード         │
│     ▓▓▓▓▓▓▓▓▓▓                  │
│     ▓▓▓▓▓▓▓▓▓▓                  │
│                                 │
└─────────────────────────────────┘
```

---

## 8. ZKP拡張（ZKP Extension）

### 将来拡張できるZKPの扱い

今はProofまでウォレットで作らなくてもよいが、将来的には条件だけ証明するZK回路を実装できます。

```typescript
import { createRegionZKProof } from '@vey/qr-nfc';

// 国だけを証明
const countryProof = await createRegionZKProof(
  myAddress,
  'zk_country'
);

console.log('Proof Type:', countryProof.proof_type);
console.log('Public Inputs:', countryProof.public_inputs);
// { country: 'JP' }

// 地域まで証明
const regionProof = await createRegionZKProof(
  myAddress,
  'zk_region'
);

console.log('Public Inputs:', regionProof.public_inputs);
// { country: 'JP', region: 'Tokyo' }
```

### ZKP回路の制約定義（将来実装）

```
pickup ∈ ValidRegion 
  ∧ delivery ∈ AllowedCountries 
  ∧ ¬(pid ∈ RevokedSet)
```

このような条件だけ証明するZK回路とProofをアドレスプロバイダで生成し、Walletで検証 → EC/キャリアへ提出できます。

---

## セキュリティ考慮事項 / Security Considerations

### 暗号化

- **AES-256-GCM**: 住所データの暗号化
- **WebAuthn**: ウォレット署名
- **HMAC-SHA256**: データ整合性検証

### PIDハンドル

- 逆算不可能（ハッシュベース）
- ユーザーIDと別空間
- 失効可能

### アクセス制御

- 最小権限の原則（Principle of Least Privilege）
- 復号は必要な拠点のみ
- 監査ログで追跡

### プライバシー

- 生住所はクラウドとウォレットのみ
- PIDで共有
- 粗い地域のみログ記録

---

## まとめ / Summary

Google Wallet/Apple Walletで理想的なのは：

1. **住所そのもの** → クラウド住所帳しか保存しない
2. **共有** → PID/QR/DIDだけ
3. **体験** → NFC/QRで"機能だけ使う"
4. **監査** → 復号はログだけ確認
5. **連携** → EC/ホテル/金融は最小情報だけ

この主権構造により、プライバシーを保護しながら便利な住所管理が実現できます。

---

## 関連ドキュメント / Related Documentation

- [@vey/qr-nfc README](../README.md)
- [Cloud Address Book System](../../../docs/cloud-address-book.md)
- [ZKP Protocol](../../../docs/zkp-protocol.md)
- [API Reference](../../../docs/zkp-api.md)

---

## ライセンス / License

MIT
