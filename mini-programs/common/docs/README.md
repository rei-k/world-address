# Common Module Documentation

## 概要 / Overview

このモジュールは、WeChatとAlipayミニプログラム間で共有される共通のユーティリティ、型定義、サービスを提供します。

This module provides common utilities, type definitions, and services shared between WeChat and Alipay mini-programs.

## 📦 パッケージ構成 / Package Structure

```
common/
├── src/
│   ├── types.ts              # 共通型定義
│   ├── utils/
│   │   ├── address.ts        # 住所処理ユーティリティ
│   │   ├── validation.ts     # バリデーション関数
│   │   ├── encryption.ts     # 暗号化・セキュリティ
│   │   └── qr-generator.ts   # QRコード生成
│   ├── services/
│   │   ├── shipping.ts       # 配送サービス基底クラス
│   │   └── address-book.ts   # 住所帳サービス基底クラス
│   └── index.ts              # エクスポート
└── package.json
```

## 🔧 主要機能 / Key Features

### 1. 型定義 (types.ts)

すべてのミニプログラムで使用される共通の型定義：

- `ShippingItem`: 配送アイテム
- `Address`: 住所情報
- `ShippingFormData`: 配送フォームデータ
- `ValidationResult`: バリデーション結果
- `ShippingOrder`: 配送オーダー
- `TrackingInfo`: 追跡情報
- `HandshakeToken`: ハンドシェイクトークン

### 2. 住所ユーティリティ (utils/address.ts)

住所データの処理と表示：

```typescript
import { normalizeAddress, formatAddressDisplay, maskAddress } from '@vey/mini-common';

// 住所の正規化
const normalized = normalizeAddress(rawAddress);

// 表示用フォーマット
const display = formatAddressDisplay(address);

// 住所のマスキング（プライバシー保護）
const masked = maskAddress(address);
```

### 3. バリデーション (utils/validation.ts)

フォームとデータのバリデーション：

```typescript
import { validateShippingForm, checkProhibitedItems } from '@vey/mini-common';

// 配送フォームの検証
const result = validateShippingForm(formData);
if (!result.valid) {
  console.error(result.reason);
}

// 禁制品チェック
const prohibited = checkProhibitedItems(items);
```

### 4. 暗号化 (utils/encryption.ts)

セキュリティとデータ保護：

```typescript
import { generateSignature, verifySignature, maskSensitiveData } from '@vey/mini-common';

// 署名生成
const signature = generateSignature(data, secret);

// 署名検証
const isValid = verifySignature(data, signature, secret);

// センシティブデータのマスキング
const maskedData = maskSensitiveData(logData);
```

### 5. QRコード生成 (utils/qr-generator.ts)

QR/NFCハンドシェイク用のデータ生成：

```typescript
import { generateHandshakeQRData, generateNFCPayload } from '@vey/mini-common';

// ハンドシェイクQRデータ生成
const token = generateHandshakeQRData(waybillNumber, pickupId, secret);

// NFC用ペイロード
const nfcData = generateNFCPayload(token);
```

### 6. 配送サービス基底クラス (services/shipping.ts)

プラットフォーム固有の実装のための抽象基底クラス：

```typescript
import { ShippingService } from '@vey/mini-common';

class WeChatShippingService extends ShippingService {
  protected async request(url, method, data) {
    // WeChat API実装
    return await wx.request({ url, method, data });
  }
}
```

### 7. 住所帳サービス基底クラス (services/address-book.ts)

クラウド住所帳操作のための基底クラス：

```typescript
import { AddressBookService } from '@vey/mini-common';

class AlipayAddressBookService extends AddressBookService {
  protected async request(url, method, data) {
    // Alipay API実装
    return await my.request({ url, method, data });
  }
}
```

## 🎯 設計原則 / Design Principles

### 1. プラットフォーム非依存
- 特定のプラットフォームAPIに依存しない
- 抽象基底クラスを使用してインターフェースを定義
- 具体的な実装はプラットフォーム固有モジュールで提供

### 2. 型安全性
- TypeScriptの厳格な型チェック
- すべての公開APIに型定義
- インターフェースベースの設計

### 3. セキュリティファースト
- すべての機密データをマスキング
- 署名による改ざん防止
- 暗号化によるデータ保護

### 4. テスタビリティ
- 純粋関数を優先
- 依存性注入パターン
- モック可能な設計

## 📖 使用例 / Usage Examples

### 完全な配送フローの例

```typescript
import {
  validateShippingForm,
  ShippingFormData,
  generateHandshakeQRData,
} from '@vey/mini-common';

// 1. フォームデータの準備
const formData: ShippingFormData = {
  recipientPID: 'JP-13-113-01-T07-B12-BN02-R342',
  items: [
    { name: '化粧品', quantity: 2, weight: 0.5 },
  ],
  carrier: 'SF_EXPRESS',
};

// 2. バリデーション
const validation = validateShippingForm(formData);
if (!validation.valid) {
  console.error('Validation failed:', validation.reason);
  return;
}

// 3. 配送オーダー作成（プラットフォーム固有サービス経由）
const order = await shippingService.createPickup(formData);

// 4. QRコード生成
const qrToken = generateHandshakeQRData(
  order.waybillNumber,
  order.pickupId,
  'secret-key'
);

// 5. QRコードを表示
displayQRCode(qrToken.qrData);
```

## 🔄 更新履歴 / Changelog

### v1.0.0 (2024-12)
- 初回リリース
- 基本的な型定義とユーティリティ
- 配送・住所帳サービスの抽象基底クラス
- QR/NFCハンドシェイク対応

## 📝 ライセンス / License

MIT License
