# Quick Start Guide - Integration Tests

このガイドでは、データベースとクラウドサービスの統合テストを最速で開始する方法を説明します。

This guide explains how to quickly get started with database and cloud service integration tests.

---

## 🚀 クイックスタート / Quick Start

### 1. 依存関係のインストール / Install Dependencies

```bash
cd tests/integration
npm install
```

### 2. 環境変数の設定 / Configure Environment

```bash
# テンプレートをコピー / Copy template
cp config/.env.test.example config/.env.test

# エディタで編集 / Edit with your editor
nano config/.env.test  # or vim, code, etc.
```

### 3. テスト実行 / Run Tests

```bash
# すべてのテストを実行（設定済みのサービスのみ）
# Run all tests (only configured services)
npm run test:integration

# 特定のデータベースのみ / Specific database only
npm run test:postgres
npm run test:mongodb
npm run test:mysql
npm run test:sqlite

# 特定のクラウドサービスのみ / Specific cloud service only
npm run test:firebase
npm run test:supabase
```

---

## 📝 最小限の設定例 / Minimal Configuration Examples

### SQLite（追加設定不要）/ SQLite (No Additional Setup)

SQLiteはローカルファイルベースなので、すぐにテストできます。

SQLite is file-based, so you can test immediately without any setup.

```bash
npm run test:sqlite
```

### PostgreSQL (Docker)

Dockerでローカル環境をすぐに起動できます。

Quickly start a local environment with Docker.

```bash
# PostgreSQLコンテナを起動 / Start PostgreSQL container
docker run --name vey-postgres-test \
  -e POSTGRES_PASSWORD=test_password \
  -e POSTGRES_USER=vey_user \
  -e POSTGRES_DB=vey_test \
  -p 5432:5432 \
  -d postgres:16

# .env.test に設定 / Configure in .env.test
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=vey_test
POSTGRES_USER=vey_user
POSTGRES_PASSWORD=test_password

# テスト実行 / Run tests
npm run test:postgres

# クリーンアップ / Cleanup
docker stop vey-postgres-test
docker rm vey-postgres-test
```

### MongoDB (Docker)

```bash
# MongoDBコンテナを起動 / Start MongoDB container
docker run --name vey-mongo-test \
  -p 27017:27017 \
  -d mongo:7

# .env.test に設定 / Configure in .env.test
MONGODB_URI=mongodb://localhost:27017/vey_test

# テスト実行 / Run tests
npm run test:mongodb

# クリーンアップ / Cleanup
docker stop vey-mongo-test
docker rm vey-mongo-test
```

### MySQL (Docker)

```bash
# MySQLコンテナを起動 / Start MySQL container
docker run --name vey-mysql-test \
  -e MYSQL_ROOT_PASSWORD=root_password \
  -e MYSQL_DATABASE=vey_test \
  -e MYSQL_USER=vey_user \
  -e MYSQL_PASSWORD=test_password \
  -p 3306:3306 \
  -d mysql:8

# .env.test に設定 / Configure in .env.test
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB=vey_test
MYSQL_USER=vey_user
MYSQL_PASSWORD=test_password

# テスト実行 / Run tests
npm run test:mysql

# クリーンアップ / Cleanup
docker stop vey-mysql-test
docker rm vey-mysql-test
```

### Firebase

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成
2. プロジェクト設定から設定値を取得
3. `.env.test` に設定

```bash
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com

npm run test:firebase
```

### Supabase

1. [Supabase](https://supabase.com/) でプロジェクトを作成
2. プロジェクト設定からURLとキーを取得
3. `.env.test` に設定

```bash
SUPABASE_URL=https://your_project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

npm run test:supabase
```

---

## 🎯 テスト対象 / What Gets Tested

### すべてのデータベース / All Databases

- ✅ 接続テスト / Connection test
- ✅ CRUD操作 / CRUD operations
- ✅ 一意制約 / Unique constraints
- ✅ インデックス付きクエリ / Indexed queries
- ✅ トランザクション / Transactions
- ✅ パフォーマンステスト / Performance tests

### クラウドサービス / Cloud Services

**Firebase**:
- Firestore CRUD
- Authentication
- Storage

**Supabase**:
- PostgreSQL operations
- Storage
- Realtime subscriptions

---

## 🔍 トラブルシューティング / Troubleshooting

### テストがスキップされる / Tests are Skipped

```
⚠️  Skipping postgres tests: Service not configured
```

**解決方法** / Solution:
`.env.test` ファイルに必要な環境変数が設定されているか確認してください。

Make sure the required environment variables are configured in `.env.test`.

### 接続エラー / Connection Errors

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**解決方法** / Solution:
- データベースサーバーが起動しているか確認
- ポート番号が正しいか確認
- ファイアウォール設定を確認

Check that:
- Database server is running
- Port number is correct
- Firewall allows the connection

### 認証エラー / Authentication Errors

```
Error: Authentication failed
```

**解決方法** / Solution:
- ユーザー名とパスワードが正しいか確認
- データベースにユーザーが存在するか確認
- ユーザーに適切な権限があるか確認

Verify:
- Username and password are correct
- User exists in the database
- User has appropriate permissions

---

## 📊 カバレッジレポート / Coverage Report

カバレッジレポートを生成するには：

To generate a coverage report:

```bash
npm run test:integration:coverage
```

レポートは `coverage/` ディレクトリに生成されます。

Reports are generated in the `coverage/` directory.

---

## 🛡️ セキュリティのベストプラクティス / Security Best Practices

### ✅ DO

- テスト専用のデータベース/プロジェクトを使用
- `.env.test` を `.gitignore` に含める（すでに設定済み）
- 本番環境のクレデンシャルは使用しない
- テスト後に自動クリーンアップを実行（デフォルトで有効）

Use:
- Dedicated test databases/projects
- `.env.test` in `.gitignore` (already configured)
- Test credentials only, never production
- Auto-cleanup after tests (enabled by default)

### ❌ DON'T

- `.env.test` をコミットしない
- 本番データベースに接続しない
- 本番APIキーを使用しない
- センシティブな情報をログに出力しない

Don't:
- Commit `.env.test`
- Connect to production databases
- Use production API keys
- Log sensitive information

---

## 💡 ヒント / Tips

### Docker Composeを使用する / Using Docker Compose

すべてのデータベースを一度に起動：

Start all databases at once:

```yaml
# tests/integration/docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: test_password
      POSTGRES_USER: vey_user
      POSTGRES_DB: vey_test
    ports:
      - "5432:5432"

  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"

  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: vey_test
      MYSQL_USER: vey_user
      MYSQL_PASSWORD: test_password
    ports:
      - "3306:3306"
```

```bash
# 起動 / Start
docker-compose -f tests/integration/docker-compose.yml up -d

# テスト実行 / Run tests
cd tests/integration && npm run test:integration

# 停止 / Stop
docker-compose -f tests/integration/docker-compose.yml down
```

### CI/CD環境での実行 / Running in CI/CD

GitHub Actionsの例：

Example for GitHub Actions:

```yaml
name: Integration Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test_password
          POSTGRES_USER: vey_user
          POSTGRES_DB: vey_test
        ports:
          - 5432:5432

      mongodb:
        image: mongo:7
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: |
          cd tests/integration
          npm install
      
      - name: Run tests
        run: |
          cd tests/integration
          npm run test:integration
        env:
          POSTGRES_HOST: localhost
          POSTGRES_PORT: 5432
          POSTGRES_DB: vey_test
          POSTGRES_USER: vey_user
          POSTGRES_PASSWORD: test_password
          MONGODB_URI: mongodb://localhost:27017/vey_test
```

---

## 📚 詳細ドキュメント / Detailed Documentation

- [README.md](./README.md) - 完全なドキュメント / Complete documentation
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - 実装の詳細 / Implementation details
- [.env.test.example](./config/.env.test.example) - 全環境変数リスト / All environment variables

---

**ハッピーテスティング！ / Happy Testing! 🎉**
