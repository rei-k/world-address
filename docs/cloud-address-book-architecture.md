# クラウド住所帳システムアーキテクチャ / Cloud Address Book System Architecture

クラウド住所帳システムの技術的アーキテクチャとデータフロー図

Technical architecture and data flow diagrams for the Cloud Address Book System

---

## 目次 / Table of Contents

1. [システムアーキテクチャ概要](#1-システムアーキテクチャ概要)
2. [データフロー詳細](#2-データフロー詳細)
3. [コンポーネント設計](#3-コンポーネント設計)
4. [セキュリティアーキテクチャ](#4-セキュリティアーキテクチャ)
5. [データモデル](#5-データモデル)
6. [APIエンドポイント設計](#6-apiエンドポイント設計)

---

## 1. システムアーキテクチャ概要

### 1.1 全体構成図

```
┌─────────────────────────────────────────────────────────────────┐
│                         ユーザー層 / User Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  モバイルアプリ  │  │  Webアプリ   │  │  ウォレットアプリ  │         │
│  │  Mobile App   │  │  Web App     │  │  Wallet App   │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
          ┌──────────────────┴──────────────────┐
          │         API Gateway Layer           │
          │  - 認証/認可                         │
          │  - レート制限                         │
          │  - ロードバランシング                  │
          └──────────────────┬──────────────────┘
                             │
          ┌──────────────────┴──────────────────┐
          │                                     │
  ┌───────┴────────┐              ┌────────────┴──────────┐
  │ Address Provider │              │   EC/Service Layer   │
  │  (住所基盤)       │              │   (EC/サービス事業者) │
  │                 │              │                       │
  │ - AMF正規化      │              │ - 注文処理            │
  │ - PID発行        │              │ - ZK証明検証          │
  │ - VC発行         │              │ - 送り状発行          │
  │ - ZK証明生成     │              └───────────┬───────────┘
  └────────┬────────┘                          │
           │                                   │
  ┌────────┴────────┐              ┌───────────┴───────────┐
  │  Storage Layer  │              │   Carrier Layer       │
  │  (ストレージ層)   │              │   (配送業者層)         │
  │                 │              │                       │
  │ - 暗号化DB       │              │ - PID解決             │
  │ - 失効リスト     │              │ - 配送追跡            │
  │ - 監査ログ       │              │ - アクセスログ         │
  └─────────────────┘              └───────────────────────┘
```

### 1.2 レイヤー別責務

#### ユーザー層
- **責務**: UI/UX提供、ローカル鍵管理
- **技術**: React Native, PWA, WebAuthn
- **データ**: 秘密鍵（ローカル）、表示用データ

#### API Gateway層
- **責務**: リクエストルーティング、認証、レート制限
- **技術**: Kong, AWS API Gateway, Nginx
- **機能**: mTLS, OAuth2.0, JWT

#### Address Provider層
- **責務**: コア住所処理、PID管理、ZK証明
- **技術**: Node.js/Go, gRPC, PostgreSQL
- **機能**: AMF正規化、暗号化、署名

#### EC/Service層
- **責務**: ビジネスロジック、注文処理
- **技術**: 各ECシステム、Webhook
- **機能**: ZK検証、送り状生成

#### Carrier層
- **責務**: 配送実行、追跡
- **技術**: TMS/WMS統合、GPS追跡
- **機能**: PID解決、配達確認

---

## 2. データフロー詳細

### 2.1 住所登録フロー（シーケンス図）

```
ユーザー              アプリ           Address Provider        DB
  │                   │                    │                    │
  │──住所入力─────────→│                    │                    │
  │                   │──正規化リクエスト──→│                    │
  │                   │                    │──AMF正規化         │
  │                   │                    │──PID生成           │
  │                   │                    │                    │
  │                   │←─PID返却──────────│                    │
  │←─署名要求─────────│                    │                    │
  │──署名(秘密鍵)────→│                    │                    │
  │                   │──VC発行リクエスト──→│                    │
  │                   │                    │──VC作成            │
  │                   │                    │──サーバー署名       │
  │                   │                    │──暗号化            │
  │                   │                    │──保存─────────────→│
  │                   │←─VC返却───────────│                    │
  │←─完了通知─────────│                    │                    │
  │                   │                    │                    │
  │──QR生成要求───────→│                    │                    │
  │                   │──ローカル暗号化     │                    │
  │←─QRコード─────────│                    │                    │
```

### 2.2 送り状発行フロー（シーケンス図）

```
ユーザー    EC Site      Address Provider    Carrier        DB
  │          │                 │                │           │
  │─注文─────→│                 │                │           │
  │          │──配送先選択─────→│                │           │
  │          │   (PID)          │                │           │
  │          │                  │──失効チェック──→│           │
  │          │                  │←─有効確認─────│           │
  │          │                  │──ZK証明生成    │           │
  │          │←─ZK証明─────────│                │           │
  │          │──検証OK          │                │           │
  │          │──送り状発行──────┼────────────────→│           │
  │          │   (PID+ZK)       │                │           │
  │          │                  │                │──配送開始  │
  │          │                  │                │           │
  │          │                  │←─PID解決要求────│           │
  │          │                  │──アクセス権確認 │           │
  │          │                  │──監査ログ記録──→│           │
  │          │                  │──生住所取得────→│           │
  │          │                  │──復号           │           │
  │          │                  │──生住所返却────→│           │
  │          │                  │                │──配達実行  │
```

### 2.3 友達登録フロー

```
ユーザーA         アプリA         Address Provider         アプリB         ユーザーB
  │               │                   │                      │               │
  │──友達追加─────→│                   │                      │               │
  │               │──QRスキャン───────┼──────────────────────→│               │
  │               │                   │                      │──QR表示───────→│
  │               │                   │                      │               │
  │               │←─PID取得──────────┼──────────────────────│               │
  │               │──PID検証要求──────→│                      │               │
  │               │                   │──有効性確認           │               │
  │               │←─検証結果─────────│                      │               │
  │               │──FriendEntry作成   │                      │               │
  │←─登録完了─────│                   │                      │               │
  │               │                   │                      │               │
```

**重要**: 生住所は一切送信されない。PIDとDIDのみが交換される。

---

## 3. コンポーネント設計

### 3.1 Address Provider コンポーネント

```typescript
// Address Provider の主要コンポーネント構成

┌─────────────────────────────────────────────────────────┐
│               Address Provider Service                  │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │ AMF Engine   │  │ PID Service  │  │ VC Service  │  │
│  │              │  │              │  │             │  │
│  │ - 住所正規化  │  │ - PID生成    │  │ - VC発行    │  │
│  │ - 形式変換    │  │ - PID検証    │  │ - VC検証    │  │
│  │ - フィールド  │  │ - 暗号化     │  │ - 署名      │  │
│  │   マッピング  │  │              │  │             │  │
│  └──────────────┘  └──────────────┘  └─────────────┘  │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │ ZK Service   │  │ Crypto       │  │ Access      │  │
│  │              │  │ Service      │  │ Control     │  │
│  │ - ZK生成     │  │              │  │             │  │
│  │ - ZK検証     │  │ - 暗号化     │  │ - ポリシー  │  │
│  │ - 回路管理   │  │ - 復号       │  │ - 監査ログ  │  │
│  │              │  │ - 鍵管理     │  │             │  │
│  └──────────────┘  └──────────────┘  └─────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Revocation Service                     │  │
│  │  - 失効リスト管理                                 │  │
│  │  - Merkle Tree更新                               │  │
│  │  - 失効チェック                                   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 3.2 クライアントSDKコンポーネント

```typescript
// @vey/core SDK の構成

@vey/core
├── AMF (Address Mapping Framework)
│   ├── normalize()
│   ├── denormalize()
│   └── validate()
│
├── PID (Place ID)
│   ├── encodePID()
│   ├── decodePID()
│   └── validatePID()
│
├── ZKP (Zero-Knowledge Proof)
│   ├── createZKCircuit()
│   ├── generateZKProof()
│   └── verifyZKProof()
│
├── DID/VC
│   ├── createDIDDocument()
│   ├── createAddressPIDCredential()
│   ├── signCredential()
│   └── verifyCredential()
│
├── Crypto
│   ├── encrypt()
│   ├── decrypt()
│   ├── sign()
│   └── verify()
│
└── Access Control
    ├── validateAccessPolicy()
    ├── resolvePID()
    └── createAuditLogEntry()
```

---

## 4. セキュリティアーキテクチャ

### 4.1 セキュリティレイヤー

```
┌─────────────────────────────────────────────────────────┐
│                  Application Layer                      │
│  - Input validation                                     │
│  - Business logic security                              │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                   API Security Layer                    │
│  - Authentication (WebAuthn, OAuth2.0)                  │
│  - Authorization (RBAC, ABAC)                           │
│  - Rate limiting                                        │
│  - API key management                                   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                 Transport Layer                         │
│  - TLS 1.3                                              │
│  - mTLS for carrier communication                       │
│  - Certificate pinning                                  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                   Data Layer                            │
│  - Encryption at rest (AES-256-GCM)                     │
│  - Key management (KMS/HSM)                             │
│  - Database encryption                                  │
│  - Audit logging                                        │
└─────────────────────────────────────────────────────────┘
```

### 4.2 鍵管理アーキテクチャ

```
┌──────────────────────────────────────────────────────┐
│               Key Management Hierarchy               │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │         Root Key (HSM/KMS)                 │    │
│  │         - Master encryption key            │    │
│  │         - Highly protected                 │    │
│  └──────────────────┬─────────────────────────┘    │
│                     │                               │
│         ┌───────────┴───────────┐                  │
│         │                       │                   │
│  ┌──────┴──────┐        ┌──────┴──────┐           │
│  │ User Keys   │        │ System Keys │           │
│  │             │        │             │           │
│  │ - ED25519   │        │ - Signing   │           │
│  │ - Stored in │        │ - Stored in │           │
│  │   wallet    │        │   KMS       │           │
│  └─────────────┘        └─────────────┘           │
│                                                     │
│  ┌──────────────┐      ┌──────────────┐          │
│  │ Data         │      │ Transport    │          │
│  │ Encryption   │      │ Keys         │          │
│  │ Keys         │      │              │          │
│  │ - AES-256    │      │ - TLS certs  │          │
│  │ - Per user   │      │ - Rotated    │          │
│  └──────────────┘      └──────────────┘          │
└──────────────────────────────────────────────────────┘
```

---

## 5. データモデル

### 5.1 Address Entry (クラウド住所帳)

```typescript
interface AddressEntry {
  // 識別子
  id: string;                      // 内部ID
  user_did: string;                // ユーザーDID
  pid: string;                     // 住所PID
  
  // 住所データ（暗号化）
  encrypted_address_local: string; // 暗号化された母国語住所
  encrypted_address_en: string;    // 暗号化された英語住所
  encryption_algorithm: string;    // 暗号化アルゴリズム
  encryption_iv: string;           // 初期化ベクトル
  
  // メタデータ（平文）
  country_code: string;            // 国コード
  admin1_code?: string;            // 第1行政区コード
  admin2_code?: string;            // 第2行政区コード
  
  // セキュリティ
  signature: string;               // ユーザー署名
  vc_id?: string;                  // Verifiable Credential ID
  
  // 地理情報
  geo_hash?: string;               // Geohash（粗い位置）
  geo_restriction_flags?: string[]; // 配送制約フラグ
  
  // 状態管理
  is_revoked: boolean;             // 失効フラグ
  is_primary: boolean;             // 主住所フラグ
  
  // タイムスタンプ
  created_at: string;              // 作成日時
  updated_at: string;              // 更新日時
  revoked_at?: string;             // 失効日時
  
  // ラベル
  label?: string;                  // 表示用ラベル（例: "自宅", "職場"）
  notes?: string;                  // メモ
}
```

### 5.2 Friend Entry

```typescript
interface FriendEntry {
  // 識別子
  id: string;                      // 内部ID
  owner_did: string;               // 所有者DID
  friend_did: string;              // 友達DID
  friend_pid: string;              // 友達のPID
  
  // 検証
  friend_label_qr_hash: string;    // 友達QRのハッシュ
  verified: boolean;               // 検証済みフラグ
  
  // 表示
  label: string;                   // 表示名（例: "田中さん"）
  avatar_url?: string;             // アバター画像URL
  
  // 状態
  is_revoked: boolean;             // 失効フラグ
  
  // 権限
  can_use_for_shipping: boolean;   // 配送先として使用可能
  
  // タイムスタンプ
  added_at: string;                // 追加日時
  last_used_at?: string;           // 最終使用日時
  
  // メモ
  notes?: string;                  // メモ
}
```

### 5.3 Revocation Entry

```typescript
interface RevocationEntry {
  // 識別子
  id: string;                      // 内部ID
  pid: string;                     // 失効したPID
  
  // 失効情報
  reason: string;                  // 失効理由
  new_pid?: string;                // 新しいPID（引越しの場合）
  
  // メタデータ
  revoked_by: string;              // 失効実行者DID
  revoked_at: string;              // 失効日時
  
  // Merkle Tree
  merkle_proof?: string[];         // Merkle証明
  merkle_index?: number;           // Merkleインデックス
}
```

### 5.4 Access Log Entry

```typescript
interface AccessLogEntry {
  // 識別子
  id: string;                      // ログID
  
  // アクセス情報
  pid: string;                     // アクセスされたPID
  accessor_did: string;            // アクセス者DID
  action: string;                  // アクション（resolve, verify等）
  
  // 結果
  result: 'success' | 'denied' | 'error';
  error_message?: string;          // エラーメッセージ
  
  // コンテキスト
  ip_address?: string;             // IPアドレス
  user_agent?: string;             // User Agent
  geo_location?: string;           // アクセス元位置
  
  // メタデータ
  reason?: string;                 // アクセス理由
  metadata?: Record<string, any>;  // 追加メタデータ
  
  // タイムスタンプ
  accessed_at: string;             // アクセス日時
}
```

---

## 6. APIエンドポイント設計

### 6.1 Address Provider API

#### 住所登録・管理

```
POST   /v1/addresses              # 新規住所登録
GET    /v1/addresses              # 住所一覧取得
GET    /v1/addresses/{id}         # 特定住所取得
PUT    /v1/addresses/{id}         # 住所更新
DELETE /v1/addresses/{id}         # 住所削除（論理削除）

POST   /v1/addresses/normalize    # 住所正規化
POST   /v1/addresses/validate     # 住所検証
```

#### PID管理

```
POST   /v1/pid/generate           # PID生成
GET    /v1/pid/{pid}              # PID検証
POST   /v1/pid/resolve            # PID解決（要認証）
GET    /v1/pid/{pid}/revocation   # 失効状態確認
```

#### VC管理

```
POST   /v1/credentials/issue      # VC発行
GET    /v1/credentials/{id}       # VC取得
POST   /v1/credentials/verify     # VC検証
POST   /v1/credentials/revoke     # VC失効
```

#### ZK証明

```
POST   /v1/zkp/circuits           # ZK回路登録
POST   /v1/zkp/prove              # ZK証明生成
POST   /v1/zkp/verify             # ZK証明検証
```

### 6.2 Friend Management API

```
POST   /v1/friends                # 友達追加
GET    /v1/friends                # 友達一覧
GET    /v1/friends/{id}           # 友達詳細
PUT    /v1/friends/{id}           # 友達更新
DELETE /v1/friends/{id}           # 友達削除

POST   /v1/friends/qr/generate    # 友達QR生成
POST   /v1/friends/qr/scan        # 友達QRスキャン
```

### 6.3 Shipping API

```
POST   /v1/shipping/validate      # 配送先検証
POST   /v1/shipping/waybill       # 送り状発行
GET    /v1/shipping/waybill/{id}  # 送り状取得
POST   /v1/shipping/track         # 配送追跡
```

### 6.4 Carrier API

```
POST   /v1/carrier/resolve        # PID解決（配送業者用）
POST   /v1/carrier/track          # 配送追跡更新
GET    /v1/carrier/access-logs    # アクセスログ取得
```

---

## 関連ドキュメント

- [Cloud Address Book System](./cloud-address-book.md) - システム概要
- [ZKP Protocol](./zkp-protocol.md) - ZKPプロトコル
- [API Documentation](./zkp-api.md) - API詳細仕様

---

## ライセンス

MIT License
