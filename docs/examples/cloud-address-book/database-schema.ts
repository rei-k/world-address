/**
 * クラウド住所帳システム - データベーススキーマとモデル
 * Cloud Address Book System - Database Schema and Models
 * 
 * このファイルは、cloud-address-book-architecture.md の
 * Section 5 (データモデル) で定義されたデータベーススキーマです。
 * 
 * This file provides database schema and models defined in
 * Section 5 (Data Model) of cloud-address-book-architecture.md
 */

// ============================================================================
// TypeScript 型定義
// ============================================================================

/**
 * Address Entry - クラウド住所帳のアドレスエントリ
 * 
 * cloud-address-book-architecture.md の 5.1 Address Entry に対応
 */
export interface AddressEntry {
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

/**
 * Friend Entry - 友達エントリ
 * 
 * cloud-address-book-architecture.md の 5.2 Friend Entry に対応
 */
export interface FriendEntry {
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

/**
 * Revocation Entry - 失効エントリ
 * 
 * cloud-address-book-architecture.md の 5.3 Revocation Entry に対応
 */
export interface RevocationEntry {
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

/**
 * Access Log Entry - アクセスログエントリ
 * 
 * cloud-address-book-architecture.md の 5.4 Access Log Entry に対応
 */
export interface AccessLogEntry {
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

// ============================================================================
// PostgreSQL DDL (Data Definition Language)
// ============================================================================

export const PostgreSQLSchema = `
-- ============================================================================
-- Cloud Address Book System - PostgreSQL Schema
-- ============================================================================

-- Address Entry テーブル
CREATE TABLE address_entries (
  -- 識別子
  id VARCHAR(255) PRIMARY KEY,
  user_did VARCHAR(255) NOT NULL,
  pid VARCHAR(255) NOT NULL UNIQUE,
  
  -- 住所データ（暗号化）
  encrypted_address_local TEXT NOT NULL,
  encrypted_address_en TEXT NOT NULL,
  encryption_algorithm VARCHAR(50) NOT NULL DEFAULT 'AES-256-GCM',
  encryption_iv VARCHAR(255) NOT NULL,
  
  -- メタデータ（平文）
  country_code VARCHAR(2) NOT NULL,
  admin1_code VARCHAR(10),
  admin2_code VARCHAR(10),
  
  -- セキュリティ
  signature TEXT NOT NULL,
  vc_id VARCHAR(255),
  
  -- 地理情報
  geo_hash VARCHAR(20),
  geo_restriction_flags TEXT[],
  
  -- 状態管理
  is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- タイムスタンプ
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP WITH TIME ZONE,
  
  -- ラベル
  label VARCHAR(255),
  notes TEXT,
  
  -- インデックス
  CONSTRAINT check_pid_format CHECK (pid ~ '^[A-Z]{2}(-[A-Z0-9]+)*$')
);

-- インデックス
CREATE INDEX idx_address_entries_user_did ON address_entries(user_did);
CREATE INDEX idx_address_entries_pid ON address_entries(pid);
CREATE INDEX idx_address_entries_country_code ON address_entries(country_code);
CREATE INDEX idx_address_entries_is_revoked ON address_entries(is_revoked);

-- ============================================================================

-- Friend Entry テーブル
CREATE TABLE friend_entries (
  -- 識別子
  id VARCHAR(255) PRIMARY KEY,
  owner_did VARCHAR(255) NOT NULL,
  friend_did VARCHAR(255) NOT NULL,
  friend_pid VARCHAR(255) NOT NULL,
  
  -- 検証
  friend_label_qr_hash VARCHAR(255) NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- 表示
  label VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  
  -- 状態
  is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- 権限
  can_use_for_shipping BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- タイムスタンプ
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  -- メモ
  notes TEXT,
  
  -- 制約
  CONSTRAINT unique_owner_friend UNIQUE (owner_did, friend_pid)
);

-- インデックス
CREATE INDEX idx_friend_entries_owner_did ON friend_entries(owner_did);
CREATE INDEX idx_friend_entries_friend_did ON friend_entries(friend_did);
CREATE INDEX idx_friend_entries_friend_pid ON friend_entries(friend_pid);
CREATE INDEX idx_friend_entries_is_revoked ON friend_entries(is_revoked);

-- ============================================================================

-- Revocation Entry テーブル
CREATE TABLE revocation_entries (
  -- 識別子
  id VARCHAR(255) PRIMARY KEY,
  pid VARCHAR(255) NOT NULL,
  
  -- 失効情報
  reason VARCHAR(255) NOT NULL,
  new_pid VARCHAR(255),
  
  -- メタデータ
  revoked_by VARCHAR(255) NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Merkle Tree
  merkle_proof TEXT[],
  merkle_index INTEGER,
  
  -- インデックス
  CONSTRAINT check_revocation_pid_format CHECK (pid ~ '^[A-Z]{2}(-[A-Z0-9]+)*$')
);

-- インデックス
CREATE INDEX idx_revocation_entries_pid ON revocation_entries(pid);
CREATE INDEX idx_revocation_entries_revoked_at ON revocation_entries(revoked_at);

-- ============================================================================

-- Access Log Entry テーブル
CREATE TABLE access_log_entries (
  -- 識別子
  id VARCHAR(255) PRIMARY KEY,
  
  -- アクセス情報
  pid VARCHAR(255) NOT NULL,
  accessor_did VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  
  -- 結果
  result VARCHAR(20) NOT NULL CHECK (result IN ('success', 'denied', 'error')),
  error_message TEXT,
  
  -- コンテキスト
  ip_address INET,
  user_agent TEXT,
  geo_location VARCHAR(255),
  
  -- メタデータ
  reason TEXT,
  metadata JSONB,
  
  -- タイムスタンプ
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_access_log_entries_pid ON access_log_entries(pid);
CREATE INDEX idx_access_log_entries_accessor_did ON access_log_entries(accessor_did);
CREATE INDEX idx_access_log_entries_accessed_at ON access_log_entries(accessed_at);
CREATE INDEX idx_access_log_entries_result ON access_log_entries(result);

-- ============================================================================
-- トリガー: updated_at の自動更新
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_address_entries_updated_at 
  BEFORE UPDATE ON address_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ビュー: アクティブな住所のみ
-- ============================================================================

CREATE VIEW active_addresses AS
SELECT * FROM address_entries
WHERE is_revoked = FALSE;

CREATE VIEW active_friends AS
SELECT * FROM friend_entries
WHERE is_revoked = FALSE;

-- ============================================================================
-- 関数: PID検証
-- ============================================================================

CREATE OR REPLACE FUNCTION is_pid_revoked(p_pid VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM revocation_entries WHERE pid = p_pid
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- サンプルクエリ
-- ============================================================================

-- ユーザーのすべての住所を取得
-- SELECT * FROM address_entries WHERE user_did = 'did:key:...';

-- 失効していない住所のみを取得
-- SELECT * FROM active_addresses WHERE user_did = 'did:key:...';

-- 友達リストを取得
-- SELECT * FROM active_friends WHERE owner_did = 'did:key:...';

-- アクセスログを取得（最新100件）
-- SELECT * FROM access_log_entries 
-- WHERE pid = 'JP-13-113-01' 
-- ORDER BY accessed_at DESC 
-- LIMIT 100;

-- 失効されたPIDを確認
-- SELECT is_pid_revoked('JP-13-113-01');

`;

// ============================================================================
// MongoDB Schema
// ============================================================================

export const MongoDBSchema = `
// ============================================================================
// Cloud Address Book System - MongoDB Schema
// ============================================================================

// Address Entry コレクション
db.createCollection("address_entries", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "id", "user_did", "pid",
        "encrypted_address_local", "encrypted_address_en",
        "encryption_algorithm", "encryption_iv",
        "country_code", "signature",
        "is_revoked", "is_primary",
        "created_at", "updated_at"
      ],
      properties: {
        id: { bsonType: "string" },
        user_did: { bsonType: "string" },
        pid: { 
          bsonType: "string",
          pattern: "^[A-Z]{2}(-[A-Z0-9]+)*$"
        },
        encrypted_address_local: { bsonType: "string" },
        encrypted_address_en: { bsonType: "string" },
        encryption_algorithm: { bsonType: "string" },
        encryption_iv: { bsonType: "string" },
        country_code: { 
          bsonType: "string",
          minLength: 2,
          maxLength: 2
        },
        admin1_code: { bsonType: ["string", "null"] },
        admin2_code: { bsonType: ["string", "null"] },
        signature: { bsonType: "string" },
        vc_id: { bsonType: ["string", "null"] },
        geo_hash: { bsonType: ["string", "null"] },
        geo_restriction_flags: { 
          bsonType: ["array", "null"],
          items: { bsonType: "string" }
        },
        is_revoked: { bsonType: "bool" },
        is_primary: { bsonType: "bool" },
        created_at: { bsonType: "string" },
        updated_at: { bsonType: "string" },
        revoked_at: { bsonType: ["string", "null"] },
        label: { bsonType: ["string", "null"] },
        notes: { bsonType: ["string", "null"] }
      }
    }
  }
});

// インデックス
db.address_entries.createIndex({ "user_did": 1 });
db.address_entries.createIndex({ "pid": 1 }, { unique: true });
db.address_entries.createIndex({ "country_code": 1 });
db.address_entries.createIndex({ "is_revoked": 1 });

// ============================================================================

// Friend Entry コレクション
db.createCollection("friend_entries", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "id", "owner_did", "friend_did", "friend_pid",
        "friend_label_qr_hash", "verified", "label",
        "is_revoked", "can_use_for_shipping", "added_at"
      ],
      properties: {
        id: { bsonType: "string" },
        owner_did: { bsonType: "string" },
        friend_did: { bsonType: "string" },
        friend_pid: { bsonType: "string" },
        friend_label_qr_hash: { bsonType: "string" },
        verified: { bsonType: "bool" },
        label: { bsonType: "string" },
        avatar_url: { bsonType: ["string", "null"] },
        is_revoked: { bsonType: "bool" },
        can_use_for_shipping: { bsonType: "bool" },
        added_at: { bsonType: "string" },
        last_used_at: { bsonType: ["string", "null"] },
        notes: { bsonType: ["string", "null"] }
      }
    }
  }
});

// インデックス
db.friend_entries.createIndex({ "owner_did": 1 });
db.friend_entries.createIndex({ "friend_did": 1 });
db.friend_entries.createIndex({ "friend_pid": 1 });
db.friend_entries.createIndex({ "owner_did": 1, "friend_pid": 1 }, { unique: true });

// ============================================================================

// Revocation Entry コレクション
db.createCollection("revocation_entries", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "pid", "reason", "revoked_by", "revoked_at"],
      properties: {
        id: { bsonType: "string" },
        pid: { bsonType: "string" },
        reason: { bsonType: "string" },
        new_pid: { bsonType: ["string", "null"] },
        revoked_by: { bsonType: "string" },
        revoked_at: { bsonType: "string" },
        merkle_proof: { 
          bsonType: ["array", "null"],
          items: { bsonType: "string" }
        },
        merkle_index: { bsonType: ["int", "null"] }
      }
    }
  }
});

// インデックス
db.revocation_entries.createIndex({ "pid": 1 });
db.revocation_entries.createIndex({ "revoked_at": 1 });

// ============================================================================

// Access Log Entry コレクション
db.createCollection("access_log_entries", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "pid", "accessor_did", "action", "result", "accessed_at"],
      properties: {
        id: { bsonType: "string" },
        pid: { bsonType: "string" },
        accessor_did: { bsonType: "string" },
        action: { bsonType: "string" },
        result: { 
          bsonType: "string",
          enum: ["success", "denied", "error"]
        },
        error_message: { bsonType: ["string", "null"] },
        ip_address: { bsonType: ["string", "null"] },
        user_agent: { bsonType: ["string", "null"] },
        geo_location: { bsonType: ["string", "null"] },
        reason: { bsonType: ["string", "null"] },
        metadata: { bsonType: ["object", "null"] },
        accessed_at: { bsonType: "string" }
      }
    }
  }
});

// インデックス
db.access_log_entries.createIndex({ "pid": 1 });
db.access_log_entries.createIndex({ "accessor_did": 1 });
db.access_log_entries.createIndex({ "accessed_at": 1 });
db.access_log_entries.createIndex({ "result": 1 });

`;

// ============================================================================
// ORM モデル (TypeORM / Prisma)
// ============================================================================

export const PrismaSchema = `
// ============================================================================
// Cloud Address Book System - Prisma Schema
// ============================================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model AddressEntry {
  // 識別子
  id       String @id
  userDid  String @map("user_did")
  pid      String @unique
  
  // 住所データ（暗号化）
  encryptedAddressLocal String @map("encrypted_address_local")
  encryptedAddressEn    String @map("encrypted_address_en")
  encryptionAlgorithm   String @default("AES-256-GCM") @map("encryption_algorithm")
  encryptionIv          String @map("encryption_iv")
  
  // メタデータ（平文）
  countryCode String  @map("country_code")
  admin1Code  String? @map("admin1_code")
  admin2Code  String? @map("admin2_code")
  
  // セキュリティ
  signature String
  vcId      String? @map("vc_id")
  
  // 地理情報
  geoHash              String?   @map("geo_hash")
  geoRestrictionFlags  String[]  @map("geo_restriction_flags")
  
  // 状態管理
  isRevoked Boolean @default(false) @map("is_revoked")
  isPrimary Boolean @default(false) @map("is_primary")
  
  // タイムスタンプ
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  revokedAt DateTime? @map("revoked_at")
  
  // ラベル
  label String?
  notes String?
  
  @@index([userDid])
  @@index([pid])
  @@index([countryCode])
  @@index([isRevoked])
  @@map("address_entries")
}

model FriendEntry {
  // 識別子
  id        String @id
  ownerDid  String @map("owner_did")
  friendDid String @map("friend_did")
  friendPid String @map("friend_pid")
  
  // 検証
  friendLabelQrHash String  @map("friend_label_qr_hash")
  verified          Boolean @default(false)
  
  // 表示
  label     String
  avatarUrl String? @map("avatar_url")
  
  // 状態
  isRevoked Boolean @default(false) @map("is_revoked")
  
  // 権限
  canUseForShipping Boolean @default(true) @map("can_use_for_shipping")
  
  // タイムスタンプ
  addedAt    DateTime  @default(now()) @map("added_at")
  lastUsedAt DateTime? @map("last_used_at")
  
  // メモ
  notes String?
  
  @@unique([ownerDid, friendPid])
  @@index([ownerDid])
  @@index([friendDid])
  @@index([friendPid])
  @@index([isRevoked])
  @@map("friend_entries")
}

model RevocationEntry {
  // 識別子
  id  String @id
  pid String
  
  // 失効情報
  reason String
  newPid String? @map("new_pid")
  
  // メタデータ
  revokedBy String   @map("revoked_by")
  revokedAt DateTime @default(now()) @map("revoked_at")
  
  // Merkle Tree
  merkleProof String[] @map("merkle_proof")
  merkleIndex Int?     @map("merkle_index")
  
  @@index([pid])
  @@index([revokedAt])
  @@map("revocation_entries")
}

model AccessLogEntry {
  // 識別子
  id String @id
  
  // アクセス情報
  pid         String
  accessorDid String @map("accessor_did")
  action      String
  
  // 結果
  result       String  // 'success' | 'denied' | 'error'
  errorMessage String? @map("error_message")
  
  // コンテキスト
  ipAddress   String? @map("ip_address")
  userAgent   String? @map("user_agent")
  geoLocation String? @map("geo_location")
  
  // メタデータ
  reason   String?
  metadata Json?
  
  // タイムスタンプ
  accessedAt DateTime @default(now()) @map("accessed_at")
  
  @@index([pid])
  @@index([accessorDid])
  @@index([accessedAt])
  @@index([result])
  @@map("access_log_entries")
}
`;

// Export all schemas
export default {
  PostgreSQLSchema,
  MongoDBSchema,
  PrismaSchema,
};
