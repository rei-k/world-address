# Veyform - Address Form System

**Veyform（ヴェイフォーム）** は、Veyエコシステムの住所入力フォームシステムです。

**Veyform** is the address form system for the Vey ecosystem.

---

## 📋 概要 / Overview

Veyformは、世界中の住所形式に対応した柔軟なフォームシステムを提供し、ユーザーがスムーズに住所を入力・管理できるようにします。Veyvaultとの統合により、一度入力した住所を再利用することで、高速チェックアウト体験を実現します。

Veyform provides a flexible form system supporting address formats from around the world, enabling users to smoothly input and manage addresses. Integration with Veyvault enables fast checkout experiences by reusing previously entered addresses.

### 主な機能 / Key Features

- 🌍 **Global Address Support**: 269カ国の住所形式に対応
- 🔄 **Smart Auto-fill**: 住所の自動補完・検証機能
- 📱 **Responsive Design**: モバイル・タブレット・デスクトップ対応
- 🔐 **Privacy-First**: 入力された住所は暗号化して保存
- 🎨 **Customizable**: テーマ・スタイルのカスタマイズ対応
- ⚡ **Fast Integration**: シンプルなAPI・SDK統合

---

## 🚀 Features

### Universal Address Forms
- 国・地域ごとに最適化されたフォーム
- 住所の正規化・バリデーション
- リアルタイムエラーチェック

### Smart Address Entry
- 郵便番号からの住所補完
- Google Maps Places API統合
- 住所の自動修正機能

### Veyvault Integration
- 保存済み住所の呼び出し
- ワンクリック住所入力
- 住所履歴管理

### Developer-Friendly
- React コンポーネント
- Vue コンポーネント
- Web コンポーネント（フレームワーク非依存）
- REST API / GraphQL対応

---

## 🏗️ アーキテクチャ / Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Veyform Architecture                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   React      │  │     Vue      │  │ Web Component│    │
│  │  Component   │  │  Component   │  │              │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                 │             │
│         └─────────────────┴─────────────────┘             │
│                           │                                │
│                  ┌────────▼────────┐                      │
│                  │   Veyform Core  │                      │
│                  │   Engine        │                      │
│                  └────────┬────────┘                      │
│                           │                                │
│         ┌─────────────────┼─────────────────┐             │
│         │                 │                 │             │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐      │
│  │  Address    │  │ Validation  │  │   Veyvault   │      │
│  │   Data      │  │   Engine    │  │ Integration │      │
│  │  (269国)    │  │             │  │             │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 セットアップ / Setup

### 前提条件 / Prerequisites

- Node.js 18+
- React 18+ または Vue 3+ (フレームワーク使用時)

### インストール / Installation

```bash
# リポジトリのクローン
git clone https://github.com/rei-k/world-address-yaml.git
cd world-address-yaml/Vey/apps/Veyform

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

---

## 📖 使用例 / Usage Examples

### React での使用

```typescript
import { AddressForm } from '@vey/veyform-react';

function CheckoutPage() {
  const handleAddressSubmit = (address) => {
    console.log('Address submitted:', address);
  };

  return (
    <AddressForm
      country="JP"
      onSubmit={handleAddressSubmit}
      veybookIntegration={true}
      theme="modern"
    />
  );
}
```

### Vue での使用

```vue
<template>
  <VeyAddressForm
    :country="country"
    @submit="handleAddressSubmit"
    :veybook-integration="true"
    theme="modern"
  />
</template>

<script setup>
import { VeyAddressForm } from '@vey/veyform-vue';

const country = ref('JP');

const handleAddressSubmit = (address) => {
  console.log('Address submitted:', address);
};
</script>
```

### Web Component での使用

```html
<vey-address-form
  country="JP"
  veybook-integration="true"
  theme="modern"
></vey-address-form>

<script type="module">
  import '@vey/veyform-web';
  
  const form = document.querySelector('vey-address-form');
  form.addEventListener('submit', (e) => {
    console.log('Address submitted:', e.detail);
  });
</script>
```

---

## 🌍 対応国 / Supported Countries

Veyformは269カ国・地域の住所形式に対応しています。各国の住所フォーマットは自動的に適用されます。

- 🇯🇵 日本 (Japan)
- 🇺🇸 アメリカ合衆国 (United States)
- 🇬🇧 イギリス (United Kingdom)
- 🇨🇳 中国 (China)
- 🇰🇷 韓国 (South Korea)
- ... その他252カ国

詳細は [../../data/](../../data/) を参照してください。

---

## 🔌 Integration with Vey Ecosystem

### Veyvault連携

```typescript
import { VeyformWithVeyvault } from '@vey/veyform';

const form = new VeyformWithVeyvault({
  veybookApiUrl: 'https://api.veybook.com',
  enableSavedAddresses: true,
  enableAutoFill: true
});
```

### VeyStore連携

```typescript
import { VeyformCheckout } from '@vey/veyform';

const checkout = new VeyformCheckout({
  onAddressComplete: (address) => {
    // 住所確定後の処理
  },
  veystoreIntegration: true
});
```

---

## 🎨 カスタマイズ / Customization

### テーマ設定

```typescript
const customTheme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    error: '#dc3545'
  },
  borderRadius: '8px',
  fontSize: '16px'
};

<AddressForm theme={customTheme} />
```

### フィールドカスタマイズ

```typescript
const fieldConfig = {
  postalCode: {
    label: 'ZIP Code',
    placeholder: '100-0001',
    required: true
  },
  prefecture: {
    label: 'State/Province',
    required: true
  }
};

<AddressForm fieldConfig={fieldConfig} />
```

---

## 🔐 セキュリティ / Security

- **End-to-End Encryption**: 入力された住所はE2E暗号化
- **No Storage on Client**: 住所データはクライアント側に保存しない
- **GDPR Compliant**: GDPRに準拠したデータ処理
- **PCI DSS**: 決済関連データの安全な取り扱い

---

## 📚 ドキュメント / Documentation

- **[Use Cases & Integration Domains](./USE_CASES.md) - ユースケース & 導入領域総まとめ** 🆕
- [API Reference](./docs/api-reference.md) - API仕様
- [Field Configuration](./docs/field-configuration.md) - フィールド設定
- [Theme Customization](./docs/theme-customization.md) - テーマカスタマイズ
- [Integration Guide](./docs/integration-guide.md) - 統合ガイド

---

## 🧪 テスト / Testing

```bash
# ユニットテスト
npm run test

# E2Eテスト
npm run test:e2e

# カバレッジレポート
npm run test:coverage
```

---

## 📦 パッケージ / Packages

| パッケージ | 説明 | 状態 |
|-----------|------|------|
| `@vey/veyform-core` | コアエンジン | 🔨 開発中 |
| `@vey/veyform-react` | React コンポーネント | 📋 計画中 |
| `@vey/veyform-vue` | Vue コンポーネント | 📋 計画中 |
| `@vey/veyform-web` | Web コンポーネント | 📋 計画中 |

---

## 🤝 貢献 / Contributing

貢献を歓迎します！詳細は [CONTRIBUTING.md](../../../CONTRIBUTING.md) をご覧ください。

---

## 📄 ライセンス / License

MIT License

---

**最終更新 / Last Updated**: 2025-12-04
