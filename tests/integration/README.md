# Integration Tests

このディレクトリには、データベースとクラウドサービスへの接続テストが含まれています。

This directory contains integration tests for database and cloud service connections.

## 📋 目次 / Table of Contents

- [概要 / Overview](#概要--overview)
- [テスト対象 / Test Coverage](#テスト対象--test-coverage)
- [セットアップ / Setup](#セットアップ--setup)
- [実行方法 / Running Tests](#実行方法--running-tests)
- [環境変数 / Environment Variables](#環境変数--environment-variables)

## 概要 / Overview

これらのテストは、Veyエコシステムが様々なデータベースとクラウドサービスに接続できることを検証します。

These tests verify that the Vey ecosystem can connect to various databases and cloud services.

## テスト対象 / Test Coverage

### データベース / Databases

- **PostgreSQL** - メインのリレーショナルデータベース
- **MongoDB** - NoSQLドキュメントデータベース
- **MySQL/MariaDB** - 代替リレーショナルデータベース
- **SQLite** - ローカル開発用データベース

### クラウドサービス / Cloud Services

- **Firebase**
  - Firestore (NoSQL database)
  - Authentication
  - Cloud Storage
  - Realtime Database

- **Supabase**
  - PostgreSQL database
  - Authentication
  - Storage
  - Realtime subscriptions

- **AWS Services**
  - S3 (Object storage)
  - DynamoDB (NoSQL database)
  - RDS (Managed PostgreSQL/MySQL)

- **Google Cloud Platform**
  - Cloud Storage
  - Cloud Firestore
  - Cloud SQL

- **Azure Services**
  - Blob Storage
  - Cosmos DB
  - Azure Database for PostgreSQL

## セットアップ / Setup

### 1. 依存関係のインストール / Install Dependencies

```bash
npm install --save-dev
```

### 2. 環境変数の設定 / Configure Environment Variables

`.env.test` ファイルを作成し、必要な接続情報を設定します。

Create a `.env.test` file with the necessary connection information.

```bash
cp tests/integration/config/.env.test.example tests/integration/config/.env.test
```

### 3. テストデータベースの準備 / Prepare Test Databases

各データベースのテスト環境を準備します。

Prepare test environments for each database.

## 実行方法 / Running Tests

### すべてのテストを実行 / Run All Tests

```bash
npm run test:integration
```

### 特定のテストを実行 / Run Specific Tests

```bash
# PostgreSQLのみ
npm run test:integration -- databases/postgresql.test.ts

# Firebaseのみ
npm run test:integration -- cloud-services/firebase.test.ts

# Supabaseのみ
npm run test:integration -- cloud-services/supabase.test.ts
```

### カバレッジレポート / Coverage Report

```bash
npm run test:integration:coverage
```

## 環境変数 / Environment Variables

### PostgreSQL

```
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=vey_test
POSTGRES_USER=vey_user
POSTGRES_PASSWORD=your_password
```

### MongoDB

```
MONGODB_URI=mongodb://localhost:27017/vey_test
```

### Firebase

```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_SERVICE_ACCOUNT_KEY=path/to/service-account-key.json
```

### Supabase

```
SUPABASE_URL=https://your_project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### AWS

```
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=vey-test-bucket
```

### Google Cloud

```
GCP_PROJECT_ID=your_project_id
GCP_CREDENTIALS=path/to/credentials.json
GCP_STORAGE_BUCKET=vey-test-bucket
```

### Azure

```
AZURE_STORAGE_CONNECTION_STRING=your_connection_string
AZURE_STORAGE_CONTAINER=vey-test-container
AZURE_COSMOS_DB_ENDPOINT=https://your_account.documents.azure.com:443/
AZURE_COSMOS_DB_KEY=your_key
```

## テスト構造 / Test Structure

```
tests/integration/
├── databases/
│   ├── postgresql.test.ts
│   ├── mongodb.test.ts
│   ├── mysql.test.ts
│   └── sqlite.test.ts
├── cloud-services/
│   ├── firebase.test.ts
│   ├── supabase.test.ts
│   ├── aws.test.ts
│   ├── gcp.test.ts
│   └── azure.test.ts
├── config/
│   ├── .env.test.example
│   └── test-config.ts
└── utils/
    ├── database-helpers.ts
    ├── cleanup.ts
    └── fixtures.ts
```

## 注意事項 / Notes

- テストは実際のクラウドサービスに接続する可能性があるため、コストが発生する場合があります
- テスト環境とプロダクション環境は必ず分離してください
- テスト後はリソースのクリーンアップが自動的に実行されます
- センシティブな情報（API キー、パスワード等）は絶対にコミットしないでください

---

**Tests may incur costs** as they connect to actual cloud services
**Always separate** test and production environments
**Cleanup runs automatically** after tests
**Never commit** sensitive information (API keys, passwords, etc.)
