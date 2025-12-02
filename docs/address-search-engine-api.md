# 住所検索エンジン API仕様 / Address Search Engine API Specification

## 概要 / Overview

住所検索エンジンのRESTful API仕様書です。

This document provides the RESTful API specifications for the Address Search Engine.

---

## 目次 / Table of Contents

1. [認証 / Authentication](#認証--authentication)
2. [検索API / Search APIs](#検索api--search-apis)
3. [権限管理API / Permission Management APIs](#権限管理api--permission-management-apis)
4. [ルーティングAPI / Routing APIs](#ルーティングapi--routing-apis)
5. [監査API / Audit APIs](#監査api--audit-apis)
6. [エラーハンドリング / Error Handling](#エラーハンドリング--error-handling)

---

## 認証 / Authentication

### Bearer Token認証

全てのAPIリクエストには、Authorizationヘッダーにトークンを含める必要があります。

```http
Authorization: Bearer <access_token>
```

### トークン取得

```http
POST /api/auth/token
Content-Type: application/json

{
  "userId": "did:key:user123",
  "signature": "0x...",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**レスポンス:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "tokenType": "Bearer"
}
```

---

## 検索API / Search APIs

### 1. 住所検索 / Search Addresses

ユーザーの住所データベースから住所を検索します。

```http
POST /api/search/addresses
Authorization: Bearer <access_token>
Content-Type: application/json
```

**リクエストボディ:**
```json
{
  "query": "実家",
  "filters": {
    "type": "default",
    "country": "JP",
    "active": true,
    "tags": ["family"]
  },
  "page": 1,
  "limit": 10,
  "orderBy": "name",
  "order": "asc"
}
```

**パラメータ:**
| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `query` | string | No | 検索クエリ（名前、タグ、PID部分一致） |
| `filters.type` | string | No | 住所タイプ: `default`, `saved`, `friend` |
| `filters.country` | string | No | 国コード（ISO 3166-1 alpha-2） |
| `filters.active` | boolean | No | 有効な住所のみ検索 |
| `filters.tags` | string[] | No | タグでフィルタ |
| `page` | number | No | ページ番号（デフォルト: 1） |
| `limit` | number | No | 1ページあたりの件数（デフォルト: 10） |
| `orderBy` | string | No | ソート項目: `name`, `createdAt`, `lastUsed` |
| `order` | string | No | ソート順: `asc`, `desc` |

**レスポンス:**
```json
{
  "results": [
    {
      "id": "addr-001",
      "name": "実家",
      "pid": "JP-13-113-01",
      "tags": ["default", "family"],
      "preview": "東京都渋谷区...",
      "type": "default",
      "linkedSites": [
        {
          "siteId": "ec-001",
          "siteName": "ECサイトA",
          "status": "active",
          "linkedAt": "2024-01-01T00:00:00Z",
          "lastAccessedAt": "2024-06-01T00:00:00Z"
        }
      ],
      "createdAt": "2023-01-01T00:00:00Z",
      "lastUsedAt": "2024-06-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

### 2. 住所詳細取得 / Get Address Details

特定の住所の詳細情報を取得します。

```http
GET /api/addresses/:addressId
Authorization: Bearer <access_token>
```

**レスポンス:**
```json
{
  "id": "addr-001",
  "userId": "did:key:user123",
  "name": "実家",
  "pid": "JP-13-113-01-T07-B12-BN02-R342",
  "type": "default",
  "tags": ["default", "family"],
  "address": {
    "countryCode": "JP",
    "postalCode": "150-0001",
    "admin1": "東京都",
    "admin2": "渋谷区",
    "locality": "神宮前",
    "street": "1-1-1",
    "building": {
      "name": "ビル名",
      "floor": "3F",
      "unit": "342"
    },
    "recipient": "山田太郎",
    "phone": "+81-90-1234-5678"
  },
  "linkedSites": [
    {
      "siteId": "ec-001",
      "siteName": "ECサイトA",
      "status": "active",
      "permissions": {
        "canRead": true,
        "canUpdate": false
      },
      "linkedAt": "2024-01-01T00:00:00Z",
      "lastAccessedAt": "2024-06-01T00:00:00Z",
      "accessCount": 5
    }
  ],
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T00:00:00Z"
}
```

### 3. PID検索 / Search by PID

PIDで住所を検索します。

```http
GET /api/search/by-pid/:pid
Authorization: Bearer <access_token>
```

**パスパラメータ:**
- `pid`: 住所のPID（例: `JP-13-113-01`）

**レスポンス:**
```json
{
  "id": "addr-001",
  "name": "実家",
  "pid": "JP-13-113-01-T07-B12-BN02-R342",
  "preview": "東京都渋谷区神宮前1-1-1...",
  "type": "default",
  "linkedSites": ["ec-001", "hotel-1"]
}
```

---

## 権限管理API / Permission Management APIs

### 1. 住所をサイトにリンク / Link Address to Site

選択した住所をサイトにリンクし、提出権を付与します。

```http
POST /api/permissions/link
Authorization: Bearer <access_token>
Content-Type: application/json
```

**リクエストボディ:**
```json
{
  "addressId": "addr-001",
  "siteId": "ec-001",
  "permissions": {
    "canRead": true,
    "canUpdate": false,
    "canDelete": false
  },
  "expiresAt": null,
  "metadata": {
    "purpose": "配送先として使用",
    "context": "ec"
  }
}
```

**パラメータ:**
| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `addressId` | string | Yes | 住所ID |
| `siteId` | string | Yes | サイトID |
| `permissions.canRead` | boolean | No | 読み取り権限（デフォルト: true） |
| `permissions.canUpdate` | boolean | No | 更新権限（デフォルト: false） |
| `permissions.canDelete` | boolean | No | 削除権限（デフォルト: false） |
| `expiresAt` | string | No | 有効期限（ISO 8601形式、nullで無期限） |
| `metadata.purpose` | string | No | 使用目的 |
| `metadata.context` | string | No | 利用コンテキスト: `ec`, `hotel`, `finance`, `delivery` |

**レスポンス:**
```json
{
  "permissionId": "perm-001",
  "addressId": "addr-001",
  "pid": "JP-13-113-01",
  "siteId": "ec-001",
  "status": "active",
  "permissions": {
    "canRead": true,
    "canUpdate": false,
    "canDelete": false
  },
  "createdAt": "2024-06-15T00:00:00Z",
  "expiresAt": null,
  "message": "住所をサイトにリンクしました"
}
```

### 2. 提出権の削除 / Revoke Access

サイトへの提出権を削除します。

```http
DELETE /api/permissions/revoke
Authorization: Bearer <access_token>
Content-Type: application/json
```

**リクエストボディ:**
```json
{
  "addressId": "addr-001",
  "siteId": "ec-001",
  "reason": "サービス解約のため"
}
```

**レスポンス:**
```json
{
  "success": true,
  "permissionId": "perm-001",
  "status": "revoked",
  "revokedAt": "2024-06-15T00:00:00Z",
  "message": "提出権を削除しました",
  "note": "サイトに保存された住所は残ります。サイトへ直接削除依頼が可能です。"
}
```

### 3. 権限一覧取得 / List Permissions

ユーザーの全ての権限リンクを取得します。

```http
GET /api/permissions
Authorization: Bearer <access_token>
```

**クエリパラメータ:**
- `status`: フィルタ - `active`, `revoked`, `expired`
- `siteId`: 特定サイトのみ取得
- `page`: ページ番号
- `limit`: 1ページあたりの件数

**レスポンス:**
```json
{
  "permissions": [
    {
      "permissionId": "perm-001",
      "addressId": "addr-001",
      "addressName": "実家",
      "pid": "JP-13-113-01",
      "siteId": "ec-001",
      "siteName": "ECサイトA",
      "status": "active",
      "permissions": {
        "canRead": true,
        "canUpdate": false,
        "canDelete": false
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "lastAccessedAt": "2024-06-01T00:00:00Z",
      "accessCount": 5,
      "expiresAt": null
    },
    {
      "permissionId": "perm-002",
      "addressId": "addr-001",
      "addressName": "実家",
      "pid": "JP-13-113-01",
      "siteId": "bank-01",
      "siteName": "銀行A",
      "status": "revoked",
      "permissions": {
        "canRead": true,
        "canUpdate": false,
        "canDelete": false
      },
      "createdAt": "2023-06-01T00:00:00Z",
      "lastAccessedAt": "2024-01-01T00:00:00Z",
      "revokedAt": "2024-06-01T00:00:00Z",
      "accessCount": 12
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "summary": {
    "active": 5,
    "revoked": 2,
    "expired": 1
  }
}
```

### 4. サイト別権限確認 / Check Site Permission

特定サイトへの権限を確認します。

```http
GET /api/permissions/check/:siteId/:addressId
Authorization: Bearer <access_token>
```

**レスポンス:**
```json
{
  "hasPermission": true,
  "permissionId": "perm-001",
  "status": "active",
  "permissions": {
    "canRead": true,
    "canUpdate": false,
    "canDelete": false
  },
  "expiresAt": null
}
```

---

## ルーティングAPI / Routing APIs

### 1. フォーマット変換 / Format Address

PIDを指定フォーマットに変換します。

```http
POST /api/routing/format
Authorization: Bearer <access_token>
Content-Type: application/json
```

**リクエストボディ:**
```json
{
  "addressId": "addr-001",
  "siteId": "ec-001",
  "formatId": "ec-standard"
}
```

**パラメータ:**
| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `addressId` | string | Yes | 住所ID |
| `siteId` | string | Yes | サイトID（権限確認用） |
| `formatId` | string | Yes | フォーマットID: `ec-standard`, `hotel-booking`, `bank-kyc`, `carrier-delivery` |

**レスポンス（ec-standardの場合）:**
```json
{
  "formatId": "ec-standard",
  "formatted": {
    "recipient": "山田太郎",
    "postalCode": "150-0001",
    "prefecture": "東京都",
    "city": "渋谷区",
    "streetAddress": "神宮前1-1-1",
    "building": "ビル名 3F 342号室",
    "phone": "+81-90-1234-5678"
  },
  "pid": "JP-13-113-01",
  "timestamp": "2024-06-15T00:00:00Z"
}
```

**レスポンス（hotel-bookingの場合）:**
```json
{
  "formatId": "hotel-booking",
  "formatted": {
    "guestName": "山田太郎",
    "country": "JP",
    "countryName": "Japan",
    "region": "東京都",
    "city": "渋谷区",
    "fullAddress": "〒150-0001 東京都渋谷区神宮前1-1-1 ビル名 3F 342号室",
    "phone": "+81-90-1234-5678"
  },
  "pid": "JP-13-113-01",
  "timestamp": "2024-06-15T00:00:00Z"
}
```

**レスポンス（bank-kycの場合）:**
```json
{
  "formatId": "bank-kyc",
  "formatted": {
    "fullName": "山田太郎",
    "postalCode": "150-0001",
    "prefecture": "東京都",
    "city": "渋谷区",
    "town": "神宮前",
    "blockNumber": "1-1-1",
    "buildingName": "ビル名",
    "floor": "3F",
    "roomNumber": "342",
    "phone": "+81-90-1234-5678"
  },
  "pid": "JP-13-113-01",
  "timestamp": "2024-06-15T00:00:00Z"
}
```

### 2. 利用可能フォーマット一覧 / List Available Formats

利用可能なフォーマット一覧を取得します。

```http
GET /api/routing/formats
Authorization: Bearer <access_token>
```

**レスポンス:**
```json
{
  "formats": [
    {
      "id": "ec-standard",
      "name": "ECサイト標準",
      "description": "一般的なECサイト向けの配送先フォーマット",
      "fields": ["recipient", "postalCode", "prefecture", "city", "streetAddress", "building", "phone"],
      "useCases": ["ec", "delivery"]
    },
    {
      "id": "hotel-booking",
      "name": "ホテル予約",
      "description": "ホテル予約サイト向けのゲスト情報フォーマット",
      "fields": ["guestName", "country", "region", "city", "fullAddress", "phone"],
      "useCases": ["hotel", "booking"]
    },
    {
      "id": "bank-kyc",
      "name": "金融機関本人確認",
      "description": "金融機関の本人確認用詳細フォーマット",
      "fields": ["fullName", "postalCode", "prefecture", "city", "town", "blockNumber", "buildingName", "floor", "roomNumber", "phone"],
      "useCases": ["finance", "kyc"]
    },
    {
      "id": "carrier-delivery",
      "name": "配送業者",
      "description": "配送業者向けの配達先フォーマット",
      "fields": ["recipientName", "recipientPhone", "postalCode", "deliveryAddress", "deliveryInstructions"],
      "useCases": ["delivery", "logistics"]
    }
  ]
}
```

---

## 監査API / Audit APIs

### 1. アクセスログ取得 / Get Access Logs

住所へのアクセスログを取得します。

```http
GET /api/audit/logs
Authorization: Bearer <access_token>
```

**クエリパラメータ:**
- `addressId`: 特定住所のログのみ取得
- `siteId`: 特定サイトのログのみ取得
- `startDate`: 開始日（ISO 8601形式）
- `endDate`: 終了日（ISO 8601形式）
- `page`: ページ番号
- `limit`: 1ページあたりの件数

**レスポンス:**
```json
{
  "logs": [
    {
      "logId": "log-001",
      "timestamp": "2024-06-15T12:34:56Z",
      "action": "address_accessed",
      "userId": "did:key:user123",
      "addressId": "addr-001",
      "pid": "JP-13-113-01",
      "siteId": "ec-001",
      "siteName": "ECサイトA",
      "formatId": "ec-standard",
      "ipAddress": "203.0.113.0",
      "userAgent": "Mozilla/5.0...",
      "metadata": {
        "purpose": "配送先として使用"
      }
    },
    {
      "logId": "log-002",
      "timestamp": "2024-06-15T10:00:00Z",
      "action": "permission_revoked",
      "userId": "did:key:user123",
      "addressId": "addr-001",
      "siteId": "bank-01",
      "reason": "サービス解約のため"
    }
  ],
  "pagination": {
    "total": 125,
    "page": 1,
    "limit": 10,
    "totalPages": 13
  },
  "summary": {
    "totalAccesses": 100,
    "totalRevocations": 5,
    "totalLinks": 20
  }
}
```

### 2. サイト別統計 / Site Statistics

サイトごとの利用統計を取得します。

```http
GET /api/audit/statistics/sites
Authorization: Bearer <access_token>
```

**レスポンス:**
```json
{
  "statistics": [
    {
      "siteId": "ec-001",
      "siteName": "ECサイトA",
      "activePermissions": 3,
      "totalAccesses": 45,
      "lastAccessedAt": "2024-06-15T00:00:00Z",
      "averageAccessPerMonth": 15
    },
    {
      "siteId": "hotel-1",
      "siteName": "ホテルA",
      "activePermissions": 1,
      "totalAccesses": 8,
      "lastAccessedAt": "2024-05-01T00:00:00Z",
      "averageAccessPerMonth": 2
    }
  ],
  "summary": {
    "totalSites": 5,
    "totalActivePermissions": 8,
    "totalAccesses": 125
  }
}
```

---

## エラーハンドリング / Error Handling

### エラーレスポンス形式

```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "この住所へのアクセス権限がありません",
    "details": {
      "addressId": "addr-001",
      "siteId": "ec-001",
      "reason": "Permission not found or revoked"
    },
    "timestamp": "2024-06-15T00:00:00Z",
    "requestId": "req-12345"
  }
}
```

### エラーコード一覧

| コード | HTTPステータス | 説明 |
|-------|--------------|------|
| `UNAUTHORIZED` | 401 | 認証エラー |
| `FORBIDDEN` | 403 | アクセス権限なし |
| `NOT_FOUND` | 404 | リソースが見つからない |
| `PERMISSION_DENIED` | 403 | 提出権がない、または削除済み |
| `PERMISSION_EXPIRED` | 403 | 提出権の有効期限切れ |
| `INVALID_FORMAT` | 400 | 不正なフォーマットID |
| `ADDRESS_NOT_FOUND` | 404 | 住所が見つからない |
| `SITE_NOT_FOUND` | 404 | サイトが見つからない |
| `VALIDATION_ERROR` | 400 | バリデーションエラー |
| `RATE_LIMIT_EXCEEDED` | 429 | レート制限超過 |
| `INTERNAL_ERROR` | 500 | サーバー内部エラー |

### バリデーションエラーの詳細

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "リクエストの検証に失敗しました",
    "details": {
      "fields": [
        {
          "field": "addressId",
          "message": "addressIdは必須です",
          "code": "REQUIRED"
        },
        {
          "field": "siteId",
          "message": "siteIdの形式が不正です",
          "code": "INVALID_FORMAT"
        }
      ]
    },
    "timestamp": "2024-06-15T00:00:00Z",
    "requestId": "req-12345"
  }
}
```

---

## レート制限 / Rate Limiting

### 制限値

| エンドポイント | 制限 |
|--------------|------|
| 検索API | 60リクエスト/分 |
| 権限管理API | 30リクエスト/分 |
| ルーティングAPI | 120リクエスト/分 |
| 監査API | 10リクエスト/分 |

### レート制限ヘッダー

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1718460000
```

### レート制限超過時のレスポンス

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "レート制限を超過しました。しばらくしてから再試行してください。",
    "details": {
      "limit": 60,
      "resetAt": "2024-06-15T12:00:00Z"
    },
    "timestamp": "2024-06-15T11:45:00Z",
    "requestId": "req-12345"
  }
}
```

---

## Webhooks

### イベント通知

サイト側がユーザーの権限変更を受け取るためのWebhook仕様です。

**対応イベント:**
- `permission.linked`: 新規リンク作成
- `permission.revoked`: 提出権削除
- `permission.expired`: 提出権期限切れ
- `address.updated`: 住所情報更新

**Webhookペイロード例:**
```json
{
  "event": "permission.revoked",
  "timestamp": "2024-06-15T00:00:00Z",
  "data": {
    "permissionId": "perm-001",
    "userId": "did:key:user123",
    "addressId": "addr-001",
    "pid": "JP-13-113-01",
    "siteId": "ec-001",
    "status": "revoked",
    "revokedAt": "2024-06-15T00:00:00Z",
    "reason": "user_initiated"
  },
  "signature": "0x..."
}
```

---

## SDK使用例 / SDK Examples

### JavaScript/TypeScript

```typescript
import { AddressSearchEngine } from '@vey/search-engine';

const engine = new AddressSearchEngine({
  apiKey: 'your-api-key',
  userId: 'did:key:user123'
});

// 住所検索
const results = await engine.searchAddresses({
  query: '実家',
  filters: { active: true }
});

// サイトにリンク
await engine.linkToSite({
  addressId: 'addr-001',
  siteId: 'ec-001'
});

// フォーマット変換
const formatted = await engine.formatAddress({
  addressId: 'addr-001',
  siteId: 'ec-001',
  formatId: 'ec-standard'
});

// 提出権削除
await engine.revokeAccess({
  addressId: 'addr-001',
  siteId: 'ec-001'
});
```

### Python

```python
from vey_search_engine import AddressSearchEngine

engine = AddressSearchEngine(
    api_key='your-api-key',
    user_id='did:key:user123'
)

# 住所検索
results = engine.search_addresses(
    query='実家',
    filters={'active': True}
)

# サイトにリンク
engine.link_to_site(
    address_id='addr-001',
    site_id='ec-001'
)

# 提出権削除
engine.revoke_access(
    address_id='addr-001',
    site_id='ec-001'
)
```

---

## まとめ / Summary

住所検索エンジンAPIは、以下の主要機能を提供します：

1. **検索**: ユーザーの住所データベースを検索
2. **権限管理**: サイトへの提出権の付与と削除
3. **ルーティング**: サイト別フォーマットへの変換
4. **監査**: アクセスログと統計情報

詳細な実装例は[実装ガイド](./cloud-address-book-implementation.md)を参照してください。

---

**🌐 住所検索エンジンAPI - 検索で入力を置き換える基盤規格**
