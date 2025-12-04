# E-commerce Purchase Flow Examples

このディレクトリには、Veybookを使用したEコマース購入フローの完全な実装例が含まれています。

This directory contains complete implementation examples of the e-commerce purchase flow using Veybook.

---

## 📋 ファイル構成 / File Structure

### ドキュメント / Documentation

- **[../ec-purchase-flow.md](../ec-purchase-flow.md)** - 完全な購入フローの説明とコード例

### React コンポーネント / React Components

- **[VeybookCheckout.tsx](./VeybookCheckout.tsx)** - 完全なチェックアウトコンポーネント
- **[checkout-styles.css](./checkout-styles.css)** - スタイルシート
- **[usage-example.tsx](./usage-example.tsx)** - 使用例

### サーバーサイド / Server-side

- **[api-routes.ts](./api-routes.ts)** - Next.js API Routes実装例
- **[webhook-handler.ts](./webhook-handler.ts)** - Webhook処理

---

## 🚀 クイックスタート / Quick Start

### 1. インストール / Installation

```bash
npm install @vey/core @vey/react @vey/express
```

### 2. 環境変数設定 / Environment Variables

```.env
# Veybook Configuration
NEXT_PUBLIC_VEYBOOK_CLIENT_ID=your_veybook_client_id
VEYBOOK_CLIENT_SECRET=your_veybook_client_secret

# Google OAuth (Optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Apple OAuth (Optional)
NEXT_PUBLIC_APPLE_CLIENT_ID=your_apple_client_id
APPLE_CLIENT_SECRET=your_apple_client_secret

# VeyExpress
VEYEXPRESS_API_KEY=your_veyexpress_api_key
```

### 3. 基本的な使用 / Basic Usage

```tsx
import { VeybookCheckout } from './VeybookCheckout';

function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([
    {
      productId: 'prod_001',
      name: 'ワイヤレスイヤホン',
      price: 8980,
      quantity: 1,
      image: '/images/earphones.jpg',
      weight: 0.2
    }
  ]);

  const handleCheckoutComplete = (orderId: string, trackingNumber: string) => {
    console.log('Order completed:', orderId);
    console.log('Tracking number:', trackingNumber);
    // Redirect to order confirmation page
    window.location.href = `/orders/${orderId}`;
  };

  return (
    <VeybookCheckout
      cart={cart}
      onComplete={handleCheckoutComplete}
      onCancel={() => window.location.href = '/cart'}
    />
  );
}
```

---

## 📱 実装されている機能 / Implemented Features

### ✅ 完了した機能

1. **ステップ 1: Veybookログイン**
   - OAuth 2.0認証フロー
   - Google/Apple統合
   - 手動入力のフォールバック

2. **ステップ 2: 住所選択**
   - 登録済み住所一覧表示
   - デフォルト住所の自動選択
   - 新規住所追加フォーム
   - PID自動生成

3. **ステップ 3: 決済方法選択**
   - 登録済みカード一覧
   - 新規カード追加
   - 代金引換オプション

4. **ステップ 4: 注文確認**
   - 配送先確認
   - 商品リスト表示
   - 金額内訳
   - ZKP証明による配送可能性検証

5. **ステップ 5: 完了**
   - 注文確認画面
   - 配送状況追跡リンク
   - 次のアクション表示

---

## 🔐 セキュリティ機能 / Security Features

### ZKP（ゼロ知識証明）

```typescript
// ECサイトは実際の住所を見ることなく配送可能性を検証
const deliveryValidation = await veybookClient.addresses.validateDelivery({
  pid: address.pid,  // 暗号化された住所ID
  conditions: {
    allowedCountries: ['JP'],
    allowedRegions: ['13', '14', '27']
  }
});
```

### エンドツーエンド暗号化

- ユーザーの住所データは常に暗号化されて保存
- 復号化は本人と許可された配送業者のみ可能
- ECサイトは生の住所データにアクセスできない

### OAuth 2.0

- CSRF対策のためのstate parameter
- PKCE (Proof Key for Code Exchange)対応
- セキュアなトークン管理

---

## ⏱️ パフォーマンス / Performance

### チェックアウト時間

- **従来のチェックアウト**: 5-10分
- **Veybookチェックアウト**: **約1分** ✨

### タイムライン

```
従来: 商品選択 → ログイン → 住所入力(3分) → 決済入力(2分) → 完了
      ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼ (8分)

Veybook: 商品選択 → Veybookログイン(10秒) → 住所選択(10秒) → 決済(10秒) → 完了
         ▼▼▼▼▼▼▼▼ (1分)
```

---

## 🌍 国際化 / Internationalization

### 対応言語

- 日本語 (ja)
- English (en)
- 中文 (zh)
- 한국어 (ko)

### 使用例

```typescript
import { useTranslation } from 'next-i18next';

function Component() {
  const { t } = useTranslation('checkout');
  return <h1>{t('checkout.title')}</h1>;
}
```

---

## 📊 アナリティクス / Analytics

### Google Analytics 4 統合

```typescript
// チェックアウト開始
gtag('event', 'begin_checkout', {
  currency: 'JPY',
  value: totalAmount,
  items: cart
});

// Veybookログイン
gtag('event', 'veybook_login', {
  method: 'veybook'
});

// 購入完了
gtag('event', 'purchase', {
  transaction_id: orderId,
  value: totalAmount,
  currency: 'JPY'
});
```

---

## 🧪 テスト / Testing

### ユニットテスト

```bash
npm run test
```

### E2Eテスト

```bash
npm run test:e2e
```

### テスト用データ

```typescript
// テスト用住所
const testAddress = {
  pid: 'TEST-JP-13-113-01',
  label: 'テスト住所',
  country: 'JP',
  postalCode: '000-0000',
  prefecture: 'テスト都道府県',
  city: 'テスト市',
  addressLine1: 'テスト町1-2-3'
};

// テスト用クレジットカード
const testCard = {
  number: '4242424242424242',
  exp_month: 12,
  exp_year: 2030,
  cvc: '123'
};
```

---

## 📱 モバイル対応 / Mobile Support

### レスポンシブデザイン

- スマートフォン最適化
- タブレット対応
- タッチ操作対応

### PWA機能

- オフライン対応
- ホーム画面追加
- プッシュ通知

---

## 🔗 API統合 / API Integration

### Veybook API

```typescript
import { VeybookClient } from '@vey/core';

const client = new VeybookClient({
  apiKey: process.env.VEYBOOK_API_KEY
});

// 住所一覧取得
const addresses = await client.addresses.list();

// 新規住所追加
const newAddress = await client.addresses.create({
  country: 'JP',
  postalCode: '150-0001',
  ...
});
```

### VeyExpress API

```typescript
import { VeyExpressClient } from '@vey/express';

const expressClient = new VeyExpressClient({
  apiKey: process.env.VEYEXPRESS_API_KEY
});

// 配送業者選択
const carriers = await expressClient.shipments.selectCarrier({
  fromPid: 'JP-13-101-01',
  toPid: 'JP-27-100-05',
  weight: 2.5
});

// 配送作成
const shipment = await expressClient.shipments.create({
  orderId: 'order_123',
  fromPid: warehousePid,
  toPid: customerPid,
  items: orderItems
});
```

---

## 🆘 トラブルシューティング / Troubleshooting

### よくある問題

**Q: Veybookログインができない**

A: 環境変数が正しく設定されているか確認してください：

```bash
NEXT_PUBLIC_VEYBOOK_CLIENT_ID=xxx
VEYBOOK_CLIENT_SECRET=xxx
```

**Q: 住所が読み込めない**

A: アクセストークンの有効期限を確認してください。期限切れの場合はリフレッシュトークンを使用して更新してください。

**Q: 決済が失敗する**

A: 決済方法が正しく登録されているか、APIキーが有効か確認してください。

---

## 📚 関連ドキュメント / Related Documentation

- [Vey Ecosystem](../../vey-ecosystem.md)
- [ZKP Protocol](../../zkp-protocol.md)
- [VeyExpress Specification](../../veyexpress-complete-specification.md)
- [SDK Documentation](../../../sdk/README.md)
- [API Reference](../../diagrams/technical-integration.md)

---

## 💡 ベストプラクティス / Best Practices

### 1. エラーハンドリング

```typescript
try {
  const result = await processCheckout(data);
} catch (error) {
  if (error.code === 'DELIVERY_NOT_AVAILABLE') {
    // 配送不可エリア
    showDeliveryError();
  } else if (error.code === 'PAYMENT_FAILED') {
    // 決済失敗
    showPaymentError();
  } else {
    // 一般的なエラー
    showGenericError();
  }
}
```

### 2. ローディング状態

```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await processCheckout();
  } finally {
    setLoading(false);
  }
};
```

### 3. ユーザーフィードバック

```typescript
// 成功メッセージ
toast.success('住所を追加しました');

// エラーメッセージ
toast.error('住所の追加に失敗しました');

// 進行状況
toast.loading('処理中...');
```

---

## 🔄 更新履歴 / Changelog

### v1.0.0 (2025-12-04)

- ✨ 初回リリース
- ✅ Veybookログイン機能
- ✅ 住所選択・追加機能
- ✅ 決済統合
- ✅ ZKP証明対応
- ✅ VeyExpress配送統合

---

**最終更新 / Last Updated**: 2025-12-04
