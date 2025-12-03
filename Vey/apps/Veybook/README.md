# Veybook - クラウド住所帳アプリケーション

**Veybook（ヴェイブック）** は、あなたの住所を安全に管理するクラウド住所帳アプリケーションです。

**Veybook** is a cloud address book application that securely manages your addresses.

---

## 📋 概要 / Overview

Veybookは、ユーザーの住所情報を暗号化してクラウド上で安全に管理し、ECサイトや配送サービスとシームレスに連携できる次世代の住所管理アプリケーションです。

Veybook is a next-generation address management application that encrypts and securely manages user address information in the cloud, seamlessly integrating with e-commerce sites and delivery services.

### 主な機能 / Key Features

- 📝 **住所管理**: 自宅、職場、実家など複数の住所を登録・管理
- 👥 **友達管理**: QR/NFCで友達を追加し、生住所を見ずに配送先指定
- 🔐 **プライバシー保護**: エンドツーエンド暗号化とゼロ知識証明
- 🛍️ **ECサイト連携**: ワンクリックチェックアウト
- 💳 **ウォレット統合**: Google Wallet/Apple Wallet対応
- 🌍 **国際対応**: 248カ国の住所形式をサポート

---

## 🏗️ アーキテクチャ / Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Veybook Architecture                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Web App    │  │  Mobile App  │  │  Mini-Program│    │
│  │              │  │              │  │              │    │
│  │  • React     │  │  • React Native│  • WeChat    │    │
│  │  • Next.js   │  │  • iOS/Android│  • Alipay    │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                 │             │
│         └─────────────────┴─────────────────┘             │
│                           │                                │
│                  ┌────────▼────────┐                      │
│                  │   VeyAPI        │                      │
│                  │   Gateway       │                      │
│                  └────────┬────────┘                      │
│                           │                                │
│         ┌─────────────────┼─────────────────┐             │
│         │                 │                 │             │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐      │
│  │  Address    │  │    User     │  │    Auth     │      │
│  │  Service    │  │   Service   │  │   Service   │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │         Encrypted Database (PostgreSQL)              │ │
│  │         • AES-256 Encryption                         │ │
│  │         • End-to-End Encryption                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 セットアップ / Setup

### 前提条件 / Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### インストール / Installation

```bash
# リポジトリのクローン
git clone https://github.com/rei-k/world-address-yaml.git
cd world-address-yaml/Vey/apps/Veybook

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集

# データベースのマイグレーション
npm run db:migrate

# 開発サーバーの起動
npm run dev
```

### 環境変数 / Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/veybook

# Redis
REDIS_URL=redis://localhost:6379

# API
VEY_API_KEY=your_api_key
VEY_API_URL=https://api.vey.com

# Authentication
JWT_SECRET=your_jwt_secret
OAUTH_GOOGLE_CLIENT_ID=your_google_client_id
OAUTH_GOOGLE_CLIENT_SECRET=your_google_client_secret
OAUTH_APPLE_CLIENT_ID=your_apple_client_id
OAUTH_APPLE_CLIENT_SECRET=your_apple_client_secret

# Encryption
MASTER_KEY=your_master_encryption_key
```

---

## 📱 使用方法 / Usage

### Web アプリケーション

```bash
# 開発サーバー
npm run dev

# ビルド
npm run build

# 本番サーバー
npm run start
```

アクセス: http://localhost:3000

### モバイルアプリケーション

```bash
cd mobile

# iOS
npm run ios

# Android
npm run android
```

---

## 🔐 セキュリティ / Security

### エンドツーエンド暗号化

```typescript
// 住所の暗号化
import { encryptAddress } from '@vey/crypto';

const encryptedAddress = await encryptAddress(
  {
    country: 'JP',
    postalCode: '150-0001',
    address: '東京都渋谷区神宮前1-2-3'
  },
  userPublicKey
);

// 保存時は暗号化された状態
await saveAddress(userId, encryptedAddress);
```

### ゼロ知識証明

```typescript
// ZKP証明の生成
import { generateAddressProof } from '@vey/zkp';

const proof = await generateAddressProof(
  secretAddress,
  privateKey
);

// 配送業者は証明を検証（生住所は見えない）
const isValid = await verifyAddressProof(proof);
```

---

## 🔗 API統合 / API Integration

### 住所の作成

```typescript
import { VeyClient } from '@vey/core';

const client = new VeyClient({ apiKey: 'your_api_key' });

const address = await client.addresses.create({
  type: 'home',
  country: 'JP',
  postalCode: '150-0001',
  admin1: '東京都',
  admin2: '渋谷区',
  locality: '神宮前',
  addressLine1: '1-2-3',
  label: '自宅'
});

console.log('PID:', address.pid);
```

### ECサイト連携

```typescript
// Veybook連携ボタン
<VeybookButton
  onSelect={(addressToken) => {
    // addressTokenを使用してチェックアウト
    checkout(addressToken);
  }}
/>
```

---

## 📊 データモデル / Data Model

### User

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Address

```typescript
interface Address {
  id: string;
  userId: string;
  type: 'home' | 'work' | 'other';
  pid: string;
  encryptedData: string; // Encrypted address data
  label?: string;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Friend

```typescript
interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
}
```

---

## 🧪 テスト / Testing

```bash
# ユニットテスト
npm run test

# E2Eテスト
npm run test:e2e

# カバレッジ
npm run test:coverage
```

---

## 📈 パフォーマンス / Performance

- **ページロード**: < 2秒
- **API応答時間**: < 200ms
- **暗号化処理**: < 100ms
- **ZKP証明生成**: < 500ms

---

## 🌍 国際化 / Internationalization

対応言語:
- 日本語 (ja)
- 英語 (en)
- 中国語 (zh)
- 韓国語 (ko)
- その他多言語

```typescript
import { useTranslation } from 'next-i18next';

function Component() {
  const { t } = useTranslation('common');
  return <h1>{t('welcome')}</h1>;
}
```

---

## 📄 ライセンス / License

MIT License

---

## 🔗 関連リンク / Related Links

- [Vey エコシステム](../../README.md)
- [API ドキュメント](../../diagrams/technical-integration.md)
- [セキュリティ](../../diagrams/security-architecture.md)

---

**最終更新 / Last Updated**: 2025-12-03
