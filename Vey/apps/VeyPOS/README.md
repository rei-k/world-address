# VeyPOS - Point of Sale System

**VeyPOS（ヴェイポス）** は、世界中の税制・通貨・レシート要件に対応したPOSアプリケーションです。

**VeyPOS** is a Point of Sale system that supports tax systems, currencies, and receipt requirements worldwide.

---

## 📋 概要 / Overview

VeyPOSは、各国の税制・通貨・レシート要件に完全対応したグローバルPOSシステムです。Veyvaultと連携し、顧客の住所を安全に管理しながら、QR/NFCでの決済と配送先登録を同時に実現します。

VeyPOS is a global POS system that fully supports tax systems, currencies, and receipt requirements of each country. It integrates with Veyvault to securely manage customer addresses while simultaneously enabling payment and delivery address registration via QR/NFC.

### 主な機能 / Key Features

- 💳 **Multi-Currency Support**: 世界中の通貨に対応
- 🧾 **Receipt Generation**: 各国の法的要件に準拠したレシート発行
- 📊 **Tax Calculation**: 複雑な税制に対応した自動計算
- 🔗 **Veyvault Integration**: 顧客住所の安全な管理
- 📱 **QR/NFC Payment**: タップで決済と配送先登録
- 🌍 **Global Compliance**: 248カ国の税制・通貨対応
- 📦 **Delivery Integration**: 店頭購入品の配送手配
- 📈 **Analytics**: 売上分析とレポート

---

## 🏗️ アーキテクチャ / Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VeyPOS Architecture                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Tablet App │  │  Mobile POS  │  │  Desktop App │    │
│  │              │  │              │  │              │    │
│  │  • iPad      │  │  • Android   │  │  • Windows   │    │
│  │  • React     │  │  • React Nat.│  │  • Electron  │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                 │             │
│         └─────────────────┴─────────────────┘             │
│                           │                                │
│                  ┌────────▼────────┐                      │
│                  │   VeyPOS API    │                      │
│                  │   Gateway       │                      │
│                  └────────┬────────┘                      │
│                           │                                │
│         ┌─────────────────┼─────────────────┐             │
│         │                 │                 │             │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐      │
│  │   Payment   │  │   Receipt   │  │  Inventory  │      │
│  │   Service   │  │   Service   │  │   Service   │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │         Payment Gateways                             │ │
│  │         Stripe, PayPal, Square, etc.                 │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 💳 POS Data Support

Based on the world-address-yaml POS schema, VeyPOS supports:

### Currency Settings
- ISO 4217 currency codes
- Symbol position (before/after)
- Decimal places
- Thousands/decimal separators

### Tax Configuration
- Standard and reduced tax rates
- Tax-inclusive vs. tax-exclusive pricing
- Category-specific taxes (food, beverages, etc.)
- Invoice requirements

### Receipt Requirements
- Legal mandatory fields per country
- Paper width standards
- Electronic receipt support
- Retention period compliance

### Payment Methods
- Cash
- Credit/Debit cards
- Mobile payments (Suica, PayPay, etc.)
- QR code payments
- NFC payments

---

## 🚀 主な用途 / Use Cases

### 1. 小売店舗 / Retail Stores
- 商品販売と在庫管理
- レシート発行
- 配送手配

### 2. 飲食店 / Restaurants
- テーブル会計
- 軽減税率適用
- モバイルオーダー連携

### 3. グローバルチェーン / Global Chains
- 多店舗管理
- 統一された税務処理
- 各国の法的要件対応

---

## 🔗 Integration with Vey Ecosystem

VeyPOS integrates with:

- **Veyvault**: Customer address management
- **VeyStore**: Online/offline inventory sync
- **VeyExpress**: Delivery arrangement
- **VeyFinance**: Payment processing
- **VeyWorkspace**: Business management

---

## 📊 Supported Countries

VeyPOS currently has full POS data support for:

- 🇯🇵 Japan (JP)
- 🇺🇸 United States (US)

Additional countries are being added based on priority.

---

## 📄 ライセンス / License

MIT License

---

## 🔗 関連リンク / Related Links

- [Vey エコシステム](../../README.md)
- [VeyPOS ドキュメント](./IMPLEMENTATION.md)
- [POS データスキーマ](../../../docs/schema/README.md)

---

**最終更新 / Last Updated**: 2025-12-03
