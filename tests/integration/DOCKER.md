# Integration Tests - Docker Compose

このファイルは統合テスト用のデータベースコンテナを起動します。

This file starts database containers for integration tests.

## 使用方法 / Usage

### すべてのデータベースを起動 / Start All Databases

```bash
docker-compose up -d
```

### 特定のデータベースのみ起動 / Start Specific Database

```bash
# PostgreSQLのみ
docker-compose up -d postgres

# MongoDBのみ
docker-compose up -d mongodb

# MySQLのみ
docker-compose up -d mysql
```

### ステータス確認 / Check Status

```bash
docker-compose ps
```

### ログ確認 / View Logs

```bash
# すべてのログ
docker-compose logs -f

# 特定のサービスのみ
docker-compose logs -f postgres
```

### 停止 / Stop

```bash
docker-compose down
```

### データも削除して停止 / Stop and Remove Data

```bash
docker-compose down -v
```

## 接続情報 / Connection Information

### PostgreSQL

- Host: `localhost`
- Port: `5432`
- Database: `vey_test`
- User: `vey_user`
- Password: `test_password`

```bash
# 接続テスト
docker exec -it vey-postgres-test psql -U vey_user -d vey_test
```

### MongoDB

- Host: `localhost`
- Port: `27017`
- Database: `vey_test`

```bash
# 接続テスト
docker exec -it vey-mongo-test mongosh vey_test
```

### MySQL

- Host: `localhost`
- Port: `3306`
- Database: `vey_test`
- User: `vey_user`
- Password: `test_password`

```bash
# 接続テスト
docker exec -it vey-mysql-test mysql -u vey_user -ptest_password vey_test
```

### Redis

- Host: `localhost`
- Port: `6379`

```bash
# 接続テスト
docker exec -it vey-redis-test redis-cli ping
```

## 環境変数設定例 / Environment Variable Example

`.env.test` に以下を設定してください:

Configure the following in `.env.test`:

```bash
# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=vey_test
POSTGRES_USER=vey_user
POSTGRES_PASSWORD=test_password

# MongoDB
MONGODB_URI=mongodb://localhost:27017/vey_test

# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB=vey_test
MYSQL_USER=vey_user
MYSQL_PASSWORD=test_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

## ヘルスチェック / Health Checks

すべてのサービスにヘルスチェックが設定されています。準備が整うまで待機：

All services have health checks. Wait until they're ready:

```bash
# すべてのサービスが健全になるまで待機
docker-compose up -d --wait
```

## トラブルシューティング / Troubleshooting

### ポートが使用中 / Port Already in Use

既に同じポートを使用しているサービスがある場合、`docker-compose.yml` のポート番号を変更してください。

If a port is already in use, change the port mapping in `docker-compose.yml`.

例 / Example:
```yaml
ports:
  - "5433:5432"  # Changed from 5432 to 5433
```

### データベースに接続できない / Cannot Connect to Database

1. コンテナが起動しているか確認
2. ヘルスチェックが通っているか確認
3. ファイアウォール設定を確認

Verify:
1. Containers are running
2. Health checks pass
3. Firewall settings

### データをリセット / Reset Data

```bash
# すべて削除してやり直し
docker-compose down -v
docker-compose up -d --wait
```
