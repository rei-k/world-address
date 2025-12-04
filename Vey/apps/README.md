# Vey アプリケーション / Vey Applications

このディレクトリには、Veyエコシステムの全アプリケーションが含まれています。

This directory contains all applications in the Vey ecosystem.

---

## 📱 コンシューマー向けアプリ / Consumer Applications

### [Veyvault](./Veyvault/) - クラウド住所帳
**Cloud Address Book Application**

住所管理、友達管理、QR/NFC対応、ソーシャルログイン統合

### [VeyStore](./VeyStore/) - Eコマースプラットフォーム
**E-commerce Platform**

住所レス・Vey統合のEコマース特化型CMS

### [VeyTable](./VeyTable/) - 店舗注文アプリ
**In-Store Ordering Application**

タブレット対応の店舗注文・POS連携アプリ

### [Veycontract](./Veycontract/) - 契約管理アプリ
**Personal Contract Management**

個人用契約管理・自動入力アプリケーション

### [VeyTravel](./VeyTravel/) - 旅行統合アプリ
**Travel Integration Application**

航空券・ホテル・レンタカーの統合予約プラットフォーム

### [Veyform](./Veyform/) - 住所入力フォームシステム
**Address Form System**

世界中の住所形式に対応した柔軟なフォームシステム

---

## 🏢 ビジネス向けアプリ / Business Applications

### [VeyWorkspace](./VeyWorkspace/) - B2B統合プラットフォーム
**B2B Integrated Platform**

中小企業向けオールインワン業務管理システム

### [VeyOperations](./VeyOperations/) - オペレーション管理
**Operations Management**

倉庫・配送センター向けWMS/TMS統合システム

### [VeyWorkforce](./VeyWorkforce/) - 配送員管理
**Delivery Workforce Management**

配送員・ドライバー管理プラットフォーム

### [VeyGovernance](./VeyGovernance/) - ガバナンス・コンプライアンス
**Governance & Compliance**

法令遵守・監査ログ管理システム

### [VeyFleet](./VeyFleet/) - 車両・フリート管理
**Fleet Management**

配送車両・フリート管理システム

---

## 🏗️ インフラストラクチャ / Infrastructure

### [VeyExpress](./VeyExpress/) - 配送統合プラットフォーム
**Delivery Integration Platform**

マルチキャリア配送統合・最適化プラットフォーム

### [VeyPOS](./VeyPOS/) - POSシステム
**Point of Sale System**

国際対応POSアプリケーション

### [VeyLocker](./VeyLocker/) - ロッカー管理システム
**Locker Management System**

宅配ロッカー・PUDO管理プラットフォーム

### [VeyAnalytics](./VeyAnalytics/) - データ分析プラットフォーム
**Data Analytics Platform**

配送・売上データの可視化・分析プラットフォーム

### [VeyAPI](./VeyAPI/) - API Gateway
**API Gateway & Developer Platform**

開発者向けAPI・SDK・ドキュメント

---

## 💰 金融・決済 / Finance & Payment

### [VeyFinance](./VeyFinance/) - 金融統合プラットフォーム
**Financial Integration Platform**

銀行API、決済API、仮想通貨、在庫資金管理

### [VeyTrading](./VeyTrading/) - 電子商社プラットフォーム
**Electronic Trading Platform**

商品・資源・デジタル資産の取引プラットフォーム

---

## 🔧 開発ガイド / Development Guide

### 共通セットアップ / Common Setup

```bash
# リポジトリのクローン
git clone https://github.com/rei-k/world-address-yaml.git
cd world-address-yaml/Vey/apps

# 各アプリケーションのディレクトリに移動
cd Veyvault  # または他のアプリ

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

### 技術スタック / Tech Stack

**フロントエンド:**
- React / Next.js
- TypeScript
- Tailwind CSS
- React Native (モバイル)

**バックエンド:**
- Node.js / Express
- PostgreSQL
- Redis
- gRPC

**インフラ:**
- Docker / Kubernetes
- AWS / GCP
- CloudFlare CDN

---

## 📊 アプリケーション間連携 / Inter-Application Integration

```
Consumer Apps → VeyAPI → Business Apps → Infrastructure
                  ↓
            VeyFinance (決済)
                  ↓
           Core Platform (データ・セキュリティ)
```

詳細な連携図は [../diagrams/system-overview.md](../diagrams/system-overview.md) をご覧ください。

---

## 📄 ドキュメント / Documentation

各アプリケーションの詳細は、それぞれのディレクトリ内の `README.md` をご覧ください。

- アーキテクチャ図: [../diagrams/](../diagrams/)
- API仕様: [../diagrams/technical-integration.md](../diagrams/technical-integration.md)
- セキュリティ: [../diagrams/security-architecture.md](../diagrams/security-architecture.md)

---

**最終更新 / Last Updated**: 2025-12-04
