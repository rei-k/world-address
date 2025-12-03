# クラウド住所帳システム（Veybook） / Cloud Address Book System (Veybook)

ゼロ知識証明（ZKP）を中心とした、プライバシー保護型のクラウド住所帳システムの包括的なドキュメントです。

このシステムは **Veyエコシステム** の中核となる **Veybook**（ヴェイブック）として提供されます。

Comprehensive documentation for a privacy-preserving cloud address book system centered on Zero-Knowledge Proofs (ZKP).

This system is provided as **Veybook**, the core of the **Vey Ecosystem**.

> 📖 **関連ドキュメント**: [Veyエコシステム全体の概要](./vey-ecosystem.md) もご覧ください。

---

## 目次 / Table of Contents

1. [システムの登場人物（役割）](#1-システムの登場人物役割)
2. [住所ID（PID）の扱い方](#2-住所idpidの扱い方)
3. [フロー図（簡潔版）](#3-フロー図簡潔版)
4. [住所登録フロー（コア）](#4-住所登録フローコア)
5. [送り状（Shipping Label）発行フロー](#5-送り状shipping-label発行フロー)
6. [QR/NFCの活用ケース](#6-qrnfcの活用ケース)
7. [各国・多言語対応の形式](#7-各国多言語対応の形式)
8. [住所更新・失効（引越し・チェックアウト解除）](#8-住所更新失効引越しチェックアウト解除)
9. [実装に必要な主要技術まとめ](#9-実装に必要な主要技術まとめ)
10. [最小でも実現すべきロードマップ](#10-最小でも実現すべきロードマップ)

---

## 1. システムの登場人物（役割）

### 1.1 本人（ユーザー）/ User
- **役割**: 住所を入力・保持する主体
- **責任**: 
  - 自分の生住所（実際の住所情報）を管理
  - DID（分散型識別子）とウォレットで秘密鍵を管理
  - 配送時にどの住所を使うか選択・承認
- **データ保持**: 完全な生住所、全PID、秘密鍵

### 1.2 アドレスプロバイダー / Address Provider

**Veybook** がこの役割を担います。

- **役割**: 住所の保存とPID発行を行う住所基盤
- **責任**:
  - AMF（Address Mapping Framework）による住所正規化
  - PID（Place ID）の発行と管理
  - Verifiable Credential（VC）の発行
  - ZK証明の生成サービス提供
  - ソーシャルログイン統合（Google、Apple、LINE等）
- **データ保持**: 完全な生住所、PID、VC、秘密塩（secret_salt）

### 1.3 友達/配送先 / Friend/Delivery Recipient
- **役割**: 住所をID/QRで登録される相手
- **責任**:
  - 友達PIDまたはQRコードを提供
  - 配送先として指定される
- **データ保持**: 自分のPID、友達専用QR/NFC

### 1.4 配送業者 / Carrier
- **役割**: 実際に配送する事業者
- **責任**:
  - ラストワンマイルでのみ生住所にアクセス
  - 配送実行と追跡
  - アクセスログの記録
- **データ保持**: PIDトークン、配送ゾーン情報、（配達時のみ）生住所

---

## 2. 住所ID（PID）の扱い方

### 2.1 概要
**どの国の住所形式でも扱える内部ID（公開しても安全な住所ハンドル）**

PIDは、世界中のあらゆる住所を一意に識別するための階層的識別子です。

PID is a hierarchical identifier that uniquely identifies any address in the world.

### 2.2 PIDの性質

1. **ランダムまたは正規化ハッシュ** - 逆算不可能な形式
2. **ユーザーIDと別空間** - プライバシー保護
3. **失効可能** - 引っ越し時に無効化できる

### 2.3 PID生成式

```
PID = H(normalized_address + secret_salt)
```

- **H**: 暗号学的ハッシュ関数（SHA-256など）
- **normalized_address**: AMF形式で正規化された住所
- **secret_salt**: サーバーのみが知る秘密値

**重要**: サーバーだけが `secret_salt` を知るため、PIDから生住所を逆算できない（ZKPに適したID設計）

### 2.4 PID構造

```
<Country>-<Admin1>-<Admin2>-<Locality>-<Sublocality>-<Block>-<Building>-<Unit>
```

**例**: `JP-13-113-01-T07-B12-BN02-R342`

| フィールド | 内容 | コード例 |
|-----------|------|---------|
| Country | 国/地域 (ISO 3166-1 alpha-2) | `JP` |
| Admin1 | 第1行政階層（都道府県） | `13` = 東京 |
| Admin2 | 第2行政階層（市区町村） | `113` = 渋谷区 |
| Locality | 市/区/郡 | `01` |
| Sublocality | 町/丁目 | `T07` = 東7丁目 |
| Block | 番地/ブロック | `B12` = 12番地 |
| Building | 建物/ビル | `BN02` = build-02 |
| Unit | 部屋/ユニット | `R342` = 342号室 |

---

## 3. フロー図（簡潔版）

```
住所入力 → 正規化(AMF) → PID発行 → 署名/VC発行 → 暗号化保存
                ↓
      QR/NFC用トークン生成 (ユーザー端末内)
```

**相手の登録は生住所ではなくPIDのみ**:
```
QR/友達コード読み取り → 友達PID登録(DB) → 住所は暗号のまま
```

---

## 4. 住所登録フロー（コア）

### 4-1. 自分の住所登録（クラウド住所帳に保存）

#### ステップ1: 住所入力
- **使用**: 住所フォームSDK
- **対応**: 全ての国の住所形式に対応
- **UI**: 国別に最適化されたフォーム

#### ステップ2: 住所正規化
- **エンジン**: AMF（Address Mapping Framework）
- **処理**: 住所を標準化された形式に変換
- **出力**: 正規化された住所データ

#### ステップ3: PID発行
- **入力**: 正規化された住所 + secret_salt
- **処理**: ハッシュ関数でPID生成
- **出力**: 一意なPID（例: `JP-13-113-01`）

#### ステップ4: 署名付与
- **方法**: ユーザーの秘密鍵で署名
- **目的**: 改ざん防止
- **技術**: Ed25519, WebAuthn等

#### ステップ5: 暗号化保存
- **暗号化**: AES-GCM等で暗号化
- **保存先**: 本人のクラウド住所帳DB
- **アクセス**: ユーザーの秘密鍵でのみ復号可能

#### ステップ6: QR/NFCトークン生成
- **生成場所**: ユーザー端末内
- **内容**: 生住所を端末で暗号化
- **用途**: Google Wallet / Apple Wallet 対応

#### 必要技術スタック

| レイヤ | 技術 |
|-------|------|
| 住所正規化 | AMF |
| ハッシュID | SHA-256 + Salt |
| 署名 | Ed25519, WebAuthn |
| 暗号化 | AES-GCM |
| QR/NFC | 端末側暗号化 + 認証タグ |

---

### 4-2. 友達を登録（クラウド住所帳に「他人の住所は保存しない」）

**重要原則**: 生住所はクラウドに登録できない

代わりに保存するデータ:
```typescript
interface FriendEntry {
  friend_pid: string;           // 友達のPID
  friend_did: string;           // 友達のDID
  friend_label_qr_hash: string; // 友達専用QRの検証用ハッシュ
  is_revoked: boolean;          // 失効フラグ
  added_at: string;             // 登録日時
  label?: string;               // 表示用ラベル（例: "田中さん"）
}
```

**ポイント**: 住所は暗号のままで絶対見えない。友達の実際の住所を知る必要なく、PIDだけで配送可能。

---

## 5. 送り状（Shipping Label）発行フロー

### 5-1. ユーザーがECで送り状を作る時

#### ステップ1: 送り状作成開始
- **場所**: ECサイト
- **操作**: 「送り状作成」ボタンをクリック

#### ステップ2: 配送先選択
- **選択肢**: 
  - 配送先のPID
  - 友達QR
- **提供**: ユーザーが選択して提供

#### ステップ3: 検証依頼
- **送信先**: EC → アドレスプロバイダー
- **検証内容**:
  - PIDが実在するか
  - 失効していないか
  - 有効な行政区の順序か（メタデータ検証）

#### ステップ4: 配送業者への情報提供
- **提供データ**:
  - PID → 復号用URL
  - または暗号化ペイロード
- **注意**: 生住所は含まれない

#### ステップ5: ラストワンマイル配送
- **タイミング**: 配達員が配送先に到達
- **アクセス**: 配送業者が生住所を取り出せる
- **監査**: すべてのアクセスがログ記録される

---

### 5-2. ZKPが必要なケース（任意）

集荷点/配送点が有効であることだけをZKで証明したい場合:

```typescript
// ZK証明で検証する内容
Prove {
  pickup_valid = true;                    // 集荷点が有効
  delivery_valid = true;                   // 配送点が有効
  country_allowed_list.contains(country_code); // 許可国リストに含まれる
  notRevoked(PID);                        // 失効していない
}
```

**利点**: ECや中継拠点は座標も番地も知らないまま条件だけ検証できる。

#### 必要技術

| 技術 | 用途 |
|------|------|
| zk-SNARK/STARK | 回路設計 |
| 住所検証API | メタデータ検証 |
| 失効管理 | Revocation list or Accumulator |

---

## 6. QR/NFCの活用ケース

| ケース | 渡す情報 | 住所開示 |
|--------|---------|---------|
| 送り状 | PIDのみまたは友達QRのハッシュ | ECには非開示、配送業者のみ |
| ホテルチェックイン | 端末内で暗号化された住所Payloadを含むQR/NFC | 施設には復号権限のみ |
| 金融機関登録変更 | PID+署名VC / ZK証明で国・行政区の正当性 | 形式だけ |
| ホテル予約サイト | PID+ZKで滞在国の一致のみ検証 | 生住所非開示 |
| 引越(Address Change) | 旧PID失効 + 新PID発行 | 逆算不可 |

### 6.1 QR/NFCペイロード構造例

```typescript
interface QRPayload {
  version: string;           // プロトコルバージョン
  pid: string;              // 住所PID
  encrypted_address?: string; // 暗号化された住所（端末内で暗号化）
  signature: string;        // 署名
  auth_tag: string;         // 認証タグ
  timestamp: string;        // タイムスタンプ
  expires_at?: string;      // 有効期限
}
```

---

## 7. 各国・多言語対応の形式

### 7.1 データ構造

住所データを**母国語＋英語の2レイヤ**で保存:

```typescript
interface AddressEntry {
  pid: string;                    // 住所PID
  address_local: LocalizedAddress; // 母国語住所（例：日本語）
  address_en: EnglishAddress;     // 英語住所
  country_code: string;           // ISO 3166-1 alpha-2
  geo_restriction_flags?: string[]; // 地理的制約フラグ
  signature: string;              // 署名
  encrypted_blob: string;         // 暗号化ブロブ
  is_revoked: boolean;            // 失効フラグ
  created_at: string;             // 作成日時
  updated_at: string;             // 更新日時
}

interface LocalizedAddress {
  language: string;               // 言語コード
  script: string;                 // 文字体系
  direction: 'ltr' | 'rtl';      // 書字方向
  fields: {
    recipient?: string;           // 受取人
    postal_code?: string;         // 郵便番号
    province?: string;            // 都道府県
    city?: string;                // 市区町村
    street_address?: string;      // 番地・建物
    building?: string;            // 建物名
    room?: string;                // 部屋番号
  };
}
```

### 7.2 住所フォームSDK要件

- **Google Wallet 対応**: QR/NFC形式の互換性
- **Apple Wallet 対応**: Pass形式の互換性
- **多言語UI**: すべての主要言語に対応
- **動的フォーム**: 国ごとに最適化されたフィールド

### 7.3 必要技術

| 技術 | 用途 |
|------|------|
| 多言語住所スキーマ | YAML/JSON |
| i18nフォームSDK | 国際化対応UI |
| Public carrier polygon DB | 配送制約データベース |

---

## 8. 住所更新・失効（引越し・チェックアウト解除）

### 8-1. 引越しフロー

#### ステップ1: 新住所入力
- **操作**: 新住所を住所フォームSDKで入力
- **処理**: AMFで正規化
- **結果**: PID2を発行

#### ステップ2: 旧PID失効
- **操作**: 旧PIDを失効リストへ追加
- **フラグ**: `is_revoked=true`
- **記録**: 失効理由と新PIDへのリンク

#### ステップ3: ZK回路更新
- **条件**: 以降のZK回路は「失効してないこと」を証明条件として組み込む
- **検証**: 配送前に必ず失効チェック

```typescript
interface RevocationEntry {
  old_pid: string;              // 失効したPID
  new_pid?: string;             // 新しいPID（引越しの場合）
  reason: string;               // 失効理由
  revoked_at: string;           // 失効日時
  revoked_by: string;           // 失効実行者のDID
}
```

### 8-2 必要技術

| 技術 | 用途 |
|------|------|
| 失効リスト | CRL/Accumulator/Merkle Proof |
| PID再発行 | 新しいPID生成 |
| 署名VCの更新 | 新しいCredentialの発行 |

---

## 9. 実装に必要な主要技術まとめ

| レイヤ | 技術 | 用途 |
|--------|------|------|
| 住所正規化 | AMF | 住所の標準化 |
| 住所ID | SHA-256/カスタムハッシュ + Salt | PID生成 |
| 署名 | WebAuthn / Ed25519 / DID key | 改ざん防止 |
| 暗号保存 | AES-GCM / ChaCha20-Poly1305 | データ暗号化 |
| プライバシー証明 | zk-SNARK/STARK / Accumulator | ZK証明 |
| QR/NFC | 端末側暗号化 + 署名 + AuthTag | モバイルウォレット統合 |
| DID/VC | W3C DID/VC標準 | 分散型識別 |
| 失効管理 | Merkle Tree / RSA Accumulator | 効率的な失効リスト |

### 9.1 推奨ライブラリ

```typescript
// 暗号化
import { encrypt, decrypt } from 'crypto'; // AES-GCM

// 署名
import * as ed from '@noble/ed25519';

// ZK証明（プレースホルダー、本番では実装必要）
import { groth16 } from 'snarkjs';

// DID/VC
import { Resolver } from 'did-resolver';
import { verifyCredential } from '@veramo/core';

// 失効リスト
import { MerkleTree } from 'merkletreejs';
```

---

## 10. 最小でも実現すべきロードマップ

### v1 MVP：基本機能
- [x] AMF＋PID＋署名付き暗号保存のクラウド住所帳
- [x] 基本的なDID/VC対応
- [ ] **ZKPなし**で配送条件検証

**目標**: 基本的な住所管理とPID発行

---

### v2：ZK証明の導入
- [ ] ホテル/金融機関の国コード一致だけをZKで証明
- [ ] 国コード・都道府県レベルの配送可否ZK証明
- [ ] 基本的な失効リスト

**目標**: プライバシー保護型の基本検証

---

### v3：配送業者統合
- [ ] 配送業者にだけ復号可能なPID→住所解決フローを追加
- [ ] ポリゴン内判定のZK化
- [ ] 危険区域除外の高度な制約
- [ ] Merkle Tree / Accumulatorベースの失効リスト

**目標**: 実用的な配送システム統合

---

### v4：完全なプライバシー機能
- [ ] 友達QR/DIDの失効機能と監査の実装
- [ ] DID/VC完全連携
- [ ] マルチキャリア対応
- [ ] ユーザー主権型住所VC

**目標**: エンタープライズグレードのセキュリティ

---

### v5：モバイルウォレット統合
- [ ] Google Wallet/Apple Wallet への QR/NFC 引き渡し対応
- [ ] オフライン配送対応
- [ ] クロスボーダー配送対応
- [ ] ハードウェアウォレット統合

**目標**: シームレスなユーザー体験

---

## 関連ドキュメント

- [ZKP Protocol Documentation](./zkp-protocol.md) - ZKPプロトコル詳細
- [ZKP API Documentation](./zkp-api.md) - API仕様
- [Schema Documentation](./schema/README.md) - スキーマ定義
- [Cloud Address Book Examples](./examples/cloud-address-book/) - クラウド住所帳実装例
- [ZKP Examples](./examples/zkp/) - ZKP実装例

---

## セキュリティとプライバシー原則

### 1. 最小権限の原則
各ステークホルダーは必要最小限の情報のみアクセス

### 2. ゼロ知識証明
生住所を公開せずに配送可能性を証明

### 3. 監査可能性
すべてのアクセスを記録し、不正利用を検出

### 4. ユーザー主権
ユーザーが自分の住所データを完全に管理

---

## ライセンス

MIT License

---

**🌐 World Address YAML / JSON** - Privacy-preserving cloud address book with ZKP
