# クラウド住所帳システム完全実装例 / Complete Cloud Address Book Example

このディレクトリには、クラウド住所帳システムの全フローを網羅した完全な実装例が含まれています。

This directory contains complete implementation examples covering all flows of the Cloud Address Book System.

## 📁 ファイル一覧 / Files

### 1. `complete-flow.ts` - 完全なデータフロー実装

cloud-address-book-architecture.md で定義された**すべてのデータフロー**を実装した完全な例です。

**実装されたフロー:**
- ✅ Flow 1: 住所登録フロー (Section 2.1)
- ✅ Flow 2: 送り状発行フロー (Section 2.2)
- ✅ Flow 3: 友達登録フロー (Section 2.3)
- ✅ Flow 4: 住所更新・失効フロー

**実装されたデータモデル:**
- ✅ AddressEntry (Section 5.1)
- ✅ FriendEntry (Section 5.2)
- ✅ RevocationEntry (Section 5.3)
- ✅ AccessLogEntry (Section 5.4)

```bash
# 実行方法
npx ts-node complete-flow.ts
```

### 2. `server-api.ts` - サーバーサイドAPI実装

cloud-address-book-architecture.md の Section 6 (APIエンドポイント設計) で定義された**すべてのAPI**の実装例です。

**実装されたAPI:**
- ✅ Address Provider API (Section 6.1)
  - POST /v1/addresses - 新規住所登録
  - GET /v1/addresses - 住所一覧取得
  - GET /v1/addresses/{id} - 特定住所取得
  - PUT /v1/addresses/{id} - 住所更新
  - DELETE /v1/addresses/{id} - 住所削除
  - POST /v1/addresses/normalize - 住所正規化
  - POST /v1/addresses/validate - 住所検証

- ✅ PID Management API (Section 6.2)
  - POST /v1/pid/generate - PID生成
  - GET /v1/pid/{pid} - PID検証
  - POST /v1/pid/resolve - PID解決
  - GET /v1/pid/{pid}/revocation - 失効状態確認

- ✅ VC Management API (Section 6.3)
  - POST /v1/credentials/issue - VC発行
  - GET /v1/credentials/{id} - VC取得
  - POST /v1/credentials/verify - VC検証
  - POST /v1/credentials/revoke - VC失効

- ✅ ZKP API (Section 6.4)
  - POST /v1/zkp/circuits - ZK回路登録
  - POST /v1/zkp/prove - ZK証明生成
  - POST /v1/zkp/verify - ZK証明検証

- ✅ Shipping API (Section 6.5)
  - POST /v1/shipping/validate - 配送先検証
  - POST /v1/shipping/waybill - 送り状発行
  - GET /v1/shipping/waybill/{id} - 送り状取得
  - POST /v1/shipping/track - 配送追跡

- ✅ Carrier API (Section 6.6)
  - POST /v1/carrier/resolve - PID解決（配送業者用）
  - POST /v1/carrier/track - 配送追跡更新
  - GET /v1/carrier/access-logs - アクセスログ取得

### 3. `database-schema.ts` - データベーススキーマ

cloud-address-book-architecture.md の Section 5 (データモデル) で定義されたデータベーススキーマです。

**提供されるスキーマ:**
- ✅ PostgreSQL DDL
- ✅ MongoDB Schema
- ✅ Prisma Schema (TypeORM/Prisma対応)

**含まれる機能:**
- テーブル定義（全4テーブル）
- インデックス
- 制約（CHECK、UNIQUE、Foreign Key）
- トリガー（updated_at自動更新）
- ビュー（アクティブな住所・友達）
- 関数（PID失効チェック）

### 4. `client-integration.ts` - クライアント統合例

Web/Mobileアプリケーションでクラウド住所帳システムを統合する例です。

**提供される機能:**
- クライアントラッパークラス
- React フック (useCloudAddressBook)
- 完全な使用例
- エラーハンドリング

## 前提条件 / Prerequisites

```bash
# 必要なパッケージのインストール
npm install @vey/core @vey/qr-nfc

# TypeScript（開発時）
npm install -D typescript @types/node ts-node
```

## 🚀 クイックスタート / Quick Start

### 1. 完全なフロー実行

```bash
npx ts-node complete-flow.ts
```

すべてのデータフローが順番に実行されます:
1. 住所登録フロー
2. 送り状発行フロー
3. 友達登録フロー
4. 住所更新・失効フロー

### 2. サーバーAPI起動

```typescript
import CloudAddressBookAPIServer from './server-api';

const server = new CloudAddressBookAPIServer();
await server.start(3000);
```

### 3. クライアント統合

```typescript
import CloudAddressBookClient from './client-integration';

const client = new CloudAddressBookClient('your-api-key');

// 認証
await client.authenticate('did:key:...', 'private-key');

// 住所追加
const { pid } = await client.addAddress({
  country: 'JP',
  postalCode: '150-0043',
  province: '東京都',
  city: '渋谷区',
  streetAddress: '道玄坂1-2-3',
}, '自宅');

// QRコード生成
const qr = await client.generateAddressQRCode(pid);
```

### 4. データベース設定

```bash
# PostgreSQLの場合
psql -U postgres -d cloud_address_book < database-schema.sql

# Prismaの場合
npx prisma db push
```

## 📖 詳細ドキュメント / Documentation

### アーキテクチャ
- [システム概要](../../cloud-address-book.md) - クラウド住所帳システムの全体像
- [アーキテクチャ](../../cloud-address-book-architecture.md) - 技術アーキテクチャとデータフロー
- [実装ガイド](../../cloud-address-book-implementation.md) - コード例とベストプラクティス

### プロトコル
- [ZKPプロトコル](../../zkp-protocol.md) - ゼロ知識証明プロトコルの詳細
- [API仕様](../../zkp-api.md) - APIリファレンス

### その他
- [ウォレット統合](../../wallet-integration.md) - Google Wallet/Apple Wallet統合

## 🔐 セキュリティ機能 / Security Features

実装されたセキュリティ機能:

- ✅ エンドツーエンド暗号化 (AES-256-GCM)
- ✅ ゼロ知識証明 (ZKP)
- ✅ DID/VC による認証
- ✅ アクセス制御とポリシー
- ✅ 完全な監査ログ
- ✅ PID 失効管理
- ✅ Merkle Tree による効率的な失効リスト

## 🧪 テスト / Testing

```bash
# ユニットテスト実行
npm test

# 統合テスト実行
npm run test:integration

# すべてのフローをテスト
npm run test:flows
```

## 📝 ライセンス / License

MIT License

---

**🌐 World Address YAML / JSON** - Privacy-preserving cloud address book with ZKP
