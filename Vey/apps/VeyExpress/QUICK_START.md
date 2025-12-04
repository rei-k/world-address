# VeyExpress - Quick Start Guide
# VeyExpressクイックスタートガイド

## 🚀 5分で始めるVeyExpress / Get Started in 5 Minutes

### 1. インストール / Installation

```bash
npm install @vey/veyexpress
```

### 2. 基本的な使い方 / Basic Usage

```typescript
import { createVeyExpress } from '@vey/veyexpress';

// Initialize SDK
const vey = createVeyExpress('your-api-key');

// Get shipping quotes
const quotes = await vey.getShippingQuote(
  { country: 'US', postalCode: '10001' },
  { country: 'JP', postalCode: '100-0001' },
  { weight: 2.5, value: 100 }
);

// Track shipment
const status = await vey.trackShipment('TRACK123456');

// Validate address (254 countries)
const validation = await vey.validateAddress({
  country: 'JP',
  postalCode: '100-0001',
  state: '東京都',
  city: '千代田区',
});
```

### 3. React UIの使用 / Using React UI

```typescript
import { VeyExpressApp } from '@vey/veyexpress/ui';

function App() {
  return <VeyExpressApp apiKey="your-api-key" />;
}
```

## 📱 7つの主要画面 / 7 Major Screens

### 1. 📊 Dashboard (総合ダッシュボード)
配達番号検索、配送サマリー、世界地図表示

### 2. 🔧 API Console (APIコンソール)
9つのコアAPI、デバッグツール、使用状況モニター

### 3. 📦 Logistics (物流管理)
DMS/OMS/IMS/WMS/TMS、クラウド倉庫

### 4. 🛍️ EC Integration (EC/店舗連携)
Shopify/WooCommerce/Magento、O2O対応

### 5. 🌍 Cross-Border (越境配送)
マルチモーダル輸送、関税計算、国際追跡

### 6. ⭐ Value Services (付加価値サービス)
料金計算、一括処理、保険管理

### 7. 🔌 Hardware (Hardware連動)
QR/NFC発行、GDPR/CCPA対応

## 🎯 主要機能 / Key Features

### ✅ 254カ国対応 / 254 Countries
世界中の住所形式に完全対応

### ✅ AI予測 / AI Prediction
遅延・事故リスクをリアルタイムスコアリング

### ✅ 自動プラグイン生成 / Auto Plugin Generation
Shopify/WooCommerce/Magento対応

### ✅ セキュリティ / Security
GDPR/CCPA完全準拠、Zero-Knowledge Ready

## 📚 ドキュメント / Documentation

- **[README.md](./README.md)** - Overview & features
- **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** - Complete API reference
- **[UI_SCREENS.md](./UI_SCREENS.md)** - UI components guide
- **[IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)** - Implementation report
- **[FINAL_SUMMARY.md](./FINAL_SUMMARY.md)** - Summary

## 💻 Examples

- **[complete-example.ts](./examples/complete-example.ts)** - Complete SDK usage
- **[react-ui-example.tsx](./examples/react-ui-example.tsx)** - React app example

## 🔑 APIキーの取得 / Get API Key

1. Visit https://veyexpress.com
2. Sign up for account
3. Get your API key from dashboard
4. Use in your application

## 🆘 サポート / Support

- 📧 Email: support@veyexpress.com
- 📖 Docs: https://docs.veyexpress.com
- 💬 Discord: https://discord.gg/veyexpress

---

**VeyExpress - Making global logistics as simple as email** 📦✨
