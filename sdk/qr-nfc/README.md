# @vey/qr-nfc

QRコードとNFCを活用した住所関連機能のSDK

QR code and NFC utilities for address handling in the Vey World Address SDK.

## 📋 概要 / Overview

このパッケージは、住所データをQRコードやNFCタグを通じて共有・認証・交換するための機能を提供します。

This package provides functionality for sharing, authenticating, and exchanging address data through QR codes and NFC tags.

## ⚡ 住所入力代行 (Address Auto-fill) - NEW!

**QRコードやNFCをスキャンするだけで、住所フォームを自動入力できます。**

Automatically fill address forms by scanning QR codes or tapping NFC tags.

### 🔧 クイックスタート

```typescript
import {
  createAutoFillQR,
  autoFillFormFromQR,
  createNFCAutoFillHandler
} from '@vey/qr-nfc';

// === QRコード生成（送信側） ===
// 住所をQRコードにエンコード
const qrData = createAutoFillQR({
  recipient: '山田太郎',
  postal_code: '100-0001',
  province: '東京都',
  city: '千代田区',
  street_address: '千代田1-1',
  country: 'Japan'
}, { label: '自宅' });

// QRコードライブラリで表示（例：qrcode.js）
// qrcode.toCanvas(canvas, qrData);

// === QRコード読み取り（受信側） ===
// QRコードスキャナーで読み取ったデータでフォームを自動入力
const result = autoFillFormFromQR(scannedQRData);
if (result.success) {
  console.log(`${result.filledCount}件のフィールドを入力しました`);
}

// === NFC経由での自動入力 ===
const nfcAutoFill = createNFCAutoFillHandler();

if (nfcAutoFill.supported) {
  // NFCタグを読み取りフォームを自動入力
  const result = await nfcAutoFill.readAndFill();
  if (result.success) {
    showMessage('住所を入力しました');
  }
}
```

### 📋 カスタムフィールドマッピング

デフォルトでは、一般的なフォームフィールド名（`name`, `postal_code`, `address`, etc.）に対応していますが、
独自のフィールド名を使用している場合はカスタムマッピングを指定できます：

```typescript
import { autoFillForm } from '@vey/qr-nfc';

const result = autoFillForm(address, {
  recipient: '#customer-name',           // CSSセレクタ
  postal_code: '[name="zip-code"]',      // 属性セレクタ
  province: '#prefecture-select',
  city: 'input[data-field="city"]',
  street_address: '#address-line1'
});
```

### ⏱️ 有効期限付きのQRコード

セキュリティのため、QRコードに有効期限を設定できます：

```typescript
import { createAutoFillPayload, isAutoFillExpired } from '@vey/qr-nfc';

// 1時間有効なQRコードを作成
const payload = createAutoFillPayload(address, {
  expiresIn: 3600  // 秒単位
});

// 有効期限チェック
if (isAutoFillExpired(payload)) {
  console.log('このQRコードは期限切れです');
}
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

### QRコード
- 有効期限を設定して不正利用を防止
- 署名付きペイロードで改ざんを検出
- 最小限の情報のみを含める（必要に応じて）

### NFC
- 暗号化された通信を使用
- 認証済みデバイスのみ書き込み許可
- 読み取りログを保持

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
