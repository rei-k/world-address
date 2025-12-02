# 住所検索エンジン / Address Search Engine

## 概要 / Overview

**住所検索エンジン**は、クラウド住所帳を「住所基盤の検索エンジン」として活用し、フォーム入力のステップ自体を削除する革新的なアドレス管理システムです。

The **Address Search Engine** is an innovative address management system that uses cloud address books as a "search engine for address infrastructure," eliminating form input steps entirely.

---

## コア概念 / Core Concept

### 従来のアプローチ vs 検索エンジンアプローチ

**従来**: 住所入力の代行や自動補完（フォームの最適化）
- ユーザーは毎回住所を入力する
- サイトごとに住所を保存する
- 入力ミスや形式の違いが問題

**検索エンジン**: 住所の検索と選択だけで完了（入力工程の削除）
- ユーザーは保存済み住所を検索・選択
- サイトには必要な時だけ提出
- グローバル標準化（PID化）で一貫性確保

---

## システムアーキテクチャ / System Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                    住所検索エンジン層構造                        │
└───────────────────────────────────────────────────────────────┘

Layer 1: 住所データ層（ユーザーのみ所有）
         ┌──────────────────────────────────┐
         │ ユーザーの住所データベース          │
         │ - Default住所                    │
         │ - Saved住所（名前・タグ付き）      │
         │ - 拠点・友達住所                  │
         └─────────────┬────────────────────┘
                       │
                       ▼
Layer 2: 正規化/PIDツリー化
         ┌──────────────────────────────────┐
         │ AMF + PID Standardization        │
         │ - 世界中の住所を統一フォーマット化  │
         │ - PID: JP-13-113-01-T07-B12      │
         │ - 国・地域・言語順序の正規化       │
         └─────────────┬────────────────────┘
                       │
                       ▼
Layer 3: Permissions Index（提携サイトの権限管理）
         ┌──────────────────────────────────┐
         │ サイト × 住所 リンクテーブル       │
         │ ┌─────────┬──────┬──────────┐   │
         │ │ Site ID │ PID  │ Status   │   │
         │ ├─────────┼──────┼──────────┤   │
         │ │ ec-001  │ PID1 │ Active   │   │
         │ │ hotel-1 │ PID2 │ Active   │   │
         │ │ bank-01 │ PID3 │ Revoked  │   │
         │ └─────────┴──────┴──────────┘   │
         └─────────────┬────────────────────┘
                       │
                       ▼
Layer 4: Routing Layer（フォーマット変換）
         ┌──────────────────────────────────┐
         │ サイト別フォーマット変換           │
         │ - ECサイト用フォーマット           │
         │ - ホテル予約用フォーマット         │
         │ - 金融機関用フォーマット           │
         │ - 配送業者用フォーマット           │
         └─────────────┬────────────────────┘
                       │
                       ▼
Layer 5: Search UI（検索で入力を置換）
         ┌──────────────────────────────────┐
         │ 検索インターフェース               │
         │ - 名前・拠点・タグで検索           │
         │ - リアルタイム絞り込み             │
         │ - 提携サイトへ即座に提出可能       │
         └─────────────┬────────────────────┘
                       │
                       ▼
         [ Checkout / Booking 成立 ]
```

---

## 検索エンジンの役割 / Search Engine Role

### Identity vs Index & Routing

このシステムは**Identity Provider**ではなく、**Index & Routing Engine**として機能します。

**Focus Areas:**
1. ✅ **検索**: ユーザーの住所データベースから検索
2. ✅ **インデックス**: 住所と提携サイトのリンク管理
3. ✅ **ルーティング**: 適切なフォーマットで提出
4. ✅ **権限管理**: アクセス権の付与と削除
5. ❌ **NOT**: ユーザー認証（別システムで実施）
6. ❌ **NOT**: 住所の外部検索（自分のDBのみ）

### 主要機能

#### 1. 住所検索（Address Search）
```typescript
// ユーザーが自分の住所を検索
searchAddresses({
  query: "実家",           // 名前・タグで検索
  filters: {
    type: "default",      // Default/Saved/Friendなど
    country: "JP",        // 国で絞り込み
    active: true          // 有効な住所のみ
  }
})

// 結果例
[
  {
    id: "addr-001",
    name: "実家",
    pid: "JP-13-113-01",
    tags: ["default", "family"],
    linkedSites: ["ec-001", "hotel-1"]
  }
]
```

#### 2. 提出権リンク（Submission Permission Link）
```typescript
// 選択した住所をサイトにリンク
linkAddressToSite({
  addressId: "addr-001",
  siteId: "ec-001",
  permissions: {
    canRead: true,
    canUpdate: false,
    expiresAt: null  // 無期限
  }
})

// 内部的に Permissions Index に登録
{
  siteId: "ec-001",
  pid: "JP-13-113-01",
  status: "active",
  createdAt: "2024-01-01T00:00:00Z",
  accessCount: 0
}
```

#### 3. フォーマット変換（Format Routing）
```typescript
// サイトに合わせた形式で住所を提出
submitAddress({
  addressId: "addr-001",
  siteId: "ec-001",
  format: "ec-standard"  // ECサイト標準フォーマット
})

// 変換例（内部処理）
{
  // 元のPID
  pid: "JP-13-113-01-T07-B12-BN02-R342",
  
  // ECサイト用フォーマット
  formatted: {
    recipient: "山田太郎",
    postalCode: "150-0001",
    prefecture: "東京都",
    city: "渋谷区",
    streetAddress: "神宮前1-1-1",
    building: "ビル名 342号室"
  }
}
```

#### 4. アクセス権削除（User-Controlled Revocation）
```typescript
// ユーザーが提携解除時にアクセス権を削除
revokeAccess({
  addressId: "addr-001",
  siteId: "bank-01"
})

// Permissions Index 更新
{
  siteId: "bank-01",
  pid: "JP-13-113-01",
  status: "revoked",        // active → revoked
  revokedAt: "2024-06-01T00:00:00Z",
  reason: "user_initiated"
}

// 重要: 住所実データはクラウドから消えない
// → 他のサイト（EC/ホテル）でも使用可能
// → 削除されるのは「そのサイトへの提出権」のみ
```

---

## 検索体験フロー / Search Experience Flow

### フォーム入力なしで買い物・予約成立

```
┌─────────────────────────────────────────────────────────────┐
│            検索UIで入力工程を削除する体験フロー                │
└─────────────────────────────────────────────────────────────┘

ステップ1: チェックアウト画面
┌──────────────────────────────────┐
│ ECサイト - 商品購入               │
│                                  │
│ 【商品】                         │
│ ノートパソコン  ¥150,000         │
│                                  │
│ 【配送先】                       │
│ ┌──────────────────────────────┐ │
│ │  🔍 住所を検索               │ │  ← 入力欄ではなく検索アイコン
│ └──────────────────────────────┘ │
│                                  │
│ [次へ]                           │
└──────────────────────────────────┘

        ↓ クリック

ステップ2: クラウド住所検索画面
┌──────────────────────────────────┐
│ クラウド住所帳 - 住所を選択       │
│                                  │
│ 🔍 検索: [実家___________]       │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ ✓ 実家（デフォルト）          │ │
│ │   東京都渋谷区...             │ │
│ │   ■■■ ECサイト で使用中      │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │   会社                        │ │
│ │   東京都港区...               │ │
│ │   使用履歴なし                │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ ＋ 新しい住所を追加           │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘

        ↓ 選択

ステップ3: 確認
┌──────────────────────────────────┐
│ 権限の確認                       │
│                                  │
│ この住所を「■■■ ECサイト」に    │
│ 提出してよろしいですか？         │
│                                  │
│ 提出する住所: 実家               │
│ PID: JP-13-113-01-***            │
│                                  │
│ ⚠️ 提出後、ECサイトは            │
│   配送のため住所を保存します     │
│                                  │
│ [キャンセル]  [提出して決済へ]   │
└──────────────────────────────────┘

        ↓ 承認

ステップ4: 決済完了
┌──────────────────────────────────┐
│ 注文完了                         │
│                                  │
│ 配送先が登録されました！         │
│ そのまま決済を進めてください     │
│                                  │
│ [決済へ進む]                     │
└──────────────────────────────────┘
```

### 体験の違い

| 従来のフォーム | 検索エンジン |
|---------------|-------------|
| 郵便番号を入力 | 住所名で検索 |
| 都道府県を選択 | 即座に選択 |
| 市区町村を入力 | 1クリックで完了 |
| 番地を入力 | - |
| 建物名・部屋番号を入力 | - |
| **5-10ステップ** | **1-2ステップ** |

---

## Permissions Index構造 / Permissions Index Structure

### データモデル

```typescript
interface PermissionIndex {
  // プライマリーキー
  id: string;
  
  // リンク情報
  userId: string;      // ユーザーDID
  addressId: string;   // ユーザーの住所ID
  pid: string;         // 正規化されたPID
  siteId: string;      // 提携サイトID
  
  // 権限状態
  status: 'active' | 'revoked' | 'expired';
  permissions: {
    canRead: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
  
  // タイムスタンプ
  createdAt: string;
  lastAccessedAt: string;
  revokedAt?: string;
  expiresAt?: string;
  
  // メタデータ
  accessCount: number;
  usageContext: 'ec' | 'hotel' | 'finance' | 'delivery';
}
```

### インデックス設計

```sql
-- 主要インデックス
CREATE INDEX idx_user_site ON permissions (userId, siteId);
CREATE INDEX idx_pid_status ON permissions (pid, status);
CREATE INDEX idx_site_active ON permissions (siteId, status) 
  WHERE status = 'active';

-- 検索用インデックス
CREATE INDEX idx_user_search ON permissions (userId, status, createdAt);
```

### 検索クエリ例

```typescript
// 特定サイトで有効な住所を検索
const activeAddresses = await searchPermissions({
  userId: "did:key:user123",
  siteId: "ec-001",
  status: "active"
});

// ユーザーの全提携状況を検索
const allLinks = await searchPermissions({
  userId: "did:key:user123",
  orderBy: "lastAccessedAt",
  order: "desc"
});

// 削除候補の検索（90日以上未使用）
const unusedLinks = await searchPermissions({
  userId: "did:key:user123",
  lastAccessedBefore: "2024-03-01",
  status: "active"
});
```

---

## 解除・権限モデル / Revocation & Permission Model

### 権限ライフサイクル

```
┌──────────────────────────────────────────────────────────┐
│              権限のライフサイクル                          │
└──────────────────────────────────────────────────────────┘

1. 作成（Creation）
   ユーザーが住所を選択してサイトにリンク
   
   [住所選択] → [サイトへ提出] → [Permission: Active]
   
   状態: status = 'active'
   住所データ: サイト側に保存される

2. 使用（Usage）
   サイトが配送・予約・金融サービスで使用
   
   [配送依頼] → [Permission確認] → [住所使用]
   
   記録: accessCount++, lastAccessedAt更新

3. 削除（Revocation）
   ユーザーが提携を解除
   
   [ユーザー操作] → [Permission: Revoked]
   
   状態: status = 'revoked', revokedAt設定
   効果: サイトは新規アクセス不可
   
   ⚠️ 重要な設計思想:
   - 住所実データはクラウドから消えない
   - サイト側に保存された住所はそのまま残る
   - 削除されるのは「検索インデックス上の提出権」のみ

4. 期限切れ（Expiration）
   有効期限付きの権限が期限到達
   
   [expiresAt到達] → [Permission: Expired]
   
   状態: status = 'expired'
```

### 責任範囲の明確化

```
┌─────────────────────────────────────────────────────────┐
│           住所データと権限の責任分界                       │
└─────────────────────────────────────────────────────────┘

【クラウド住所帳（検索エンジン）の責任】
✓ ユーザーの住所データ保管
✓ PIDの生成・管理
✓ Permissions Indexの管理
✓ サイトへの提出権の付与・削除
✓ 検索インデックスの提供

【提携サイト（EC/ホテル/金融）の責任】
✓ 提出された住所の保存
✓ 配送・予約・サービス提供での使用
✓ 個人情報保護法への準拠
✓ ユーザーからの削除依頼への対応（別経路）

【ユーザーの権限】
✓ いつでも提出権を削除できる
✓ どのサイトが住所を持っているか確認できる
✓ 提出権削除後も、サイトへ直接削除依頼可能
```

### User-Controlled Revocation API

```typescript
// 提出権の削除
async function revokeAddressAccess(
  userId: string,
  addressId: string,
  siteId: string,
  reason?: string
): Promise<RevocationResult> {
  // 1. Permissions Index を更新
  const permission = await db.permissions.update({
    where: {
      userId,
      addressId,
      siteId,
      status: 'active'
    },
    data: {
      status: 'revoked',
      revokedAt: new Date().toISOString(),
      revocationReason: reason
    }
  });
  
  // 2. サイトへ通知（オプション）
  await notifySite(siteId, {
    event: 'permission.revoked',
    userId,
    addressId,
    timestamp: new Date().toISOString()
  });
  
  // 3. 監査ログ記録
  await auditLog.create({
    action: 'revoke_permission',
    userId,
    siteId,
    addressId,
    reason
  });
  
  return {
    success: true,
    message: "提出権を削除しました",
    note: "サイトに保存された住所は残ります。サイトへ直接削除依頼が可能です。"
  };
}

// 使用例
await revokeAddressAccess(
  "did:key:user123",
  "addr-001",
  "ec-001",
  "サービス解約のため"
);
```

---

## ルーティングレイヤー / Routing Layer

### サイト別フォーマット変換

```typescript
// フォーマット定義
interface AddressFormat {
  id: string;
  name: string;
  fields: string[];
  transform: (pid: string, rawAddress: Address) => any;
}

// ECサイト標準フォーマット
const ecStandardFormat: AddressFormat = {
  id: 'ec-standard',
  name: 'ECサイト標準',
  fields: ['recipient', 'postalCode', 'prefecture', 'city', 'streetAddress', 'building'],
  transform: (pid, addr) => ({
    recipient: addr.recipient,
    postalCode: addr.postalCode,
    prefecture: addr.admin1,
    city: addr.admin2,
    streetAddress: addr.street,
    building: addr.building
  })
};

// ホテル予約フォーマット
const hotelFormat: AddressFormat = {
  id: 'hotel-booking',
  name: 'ホテル予約',
  fields: ['guestName', 'country', 'region', 'city', 'fullAddress'],
  transform: (pid, addr) => ({
    guestName: addr.recipient,
    country: addr.countryCode,
    region: addr.admin1,
    city: addr.admin2,
    fullAddress: formatFullAddress(addr)
  })
};

// 金融機関フォーマット（本人確認用）
const bankFormat: AddressFormat = {
  id: 'bank-kyc',
  name: '金融機関本人確認',
  fields: ['fullName', 'postalCode', 'prefecture', 'city', 'town', 'blockNumber', 'buildingName', 'roomNumber'],
  transform: (pid, addr) => ({
    fullName: addr.recipient,
    postalCode: addr.postalCode,
    prefecture: addr.admin1,
    city: addr.admin2,
    town: addr.locality,
    blockNumber: addr.block,
    buildingName: addr.building?.name,
    roomNumber: addr.unit
  })
};

// 配送業者フォーマット
const carrierFormat: AddressFormat = {
  id: 'carrier-delivery',
  name: '配送業者',
  fields: ['recipientName', 'recipientPhone', 'postalCode', 'deliveryAddress', 'deliveryInstructions'],
  transform: (pid, addr) => ({
    recipientName: addr.recipient,
    recipientPhone: addr.phone,
    postalCode: addr.postalCode,
    deliveryAddress: formatDeliveryAddress(addr),
    deliveryInstructions: addr.deliveryNotes
  })
};

// ルーティング実行
async function routeAddress(
  pid: string,
  siteId: string,
  formatId: string
): Promise<any> {
  // 1. PIDから住所を取得
  const address = await getAddressByPID(pid);
  
  // 2. サイトの権限確認
  const hasPermission = await checkPermission(address.userId, siteId, pid);
  if (!hasPermission) {
    throw new Error('Access denied: Permission not found or revoked');
  }
  
  // 3. フォーマット取得
  const format = getFormat(formatId);
  
  // 4. 変換実行
  const formatted = format.transform(pid, address);
  
  // 5. アクセスログ記録
  await logAccess(address.userId, siteId, pid);
  
  return formatted;
}
```

---

## プロダクト競争力 / Product Competitiveness

### これはアプリではなく基盤規格

**住所検索エンジンの本質:**
- ❌ 住所帳アプリ
- ❌ フォーム最適化ツール
- ✅ **グローバル住所検索エンジン**
- ✅ **提出権プロトコル**
- ✅ **サービス横断住所基盤**

### 導入価値

#### ECサイト・予約サイト側のメリット

1. **離脱率の大幅削減**
   - フォーム入力 → 検索選択に変わることで、入力途中の離脱が減少
   - モバイルでの入力負担がゼロに
   
2. **開発コストの削減**
   - 独自の住所フォームを構築不要
   - 国際対応の住所検証ロジック不要
   - メンテナンスコストの削減

3. **即戦力ユーザーの獲得**
   - クラウド住所帳を持つユーザーは初回から高速チェックアウト
   - リピーター化が容易

4. **コンバージョン率向上**
   - チェックアウトステップが削減される
   - 決済までのスピードが向上

#### ユーザー側のメリット

1. **入力工程の完全削除**
   - 検索・選択だけで完了
   - 時間短縮（30秒 → 3秒）

2. **プライバシー管理**
   - どのサイトが住所を持っているか可視化
   - いつでも提出権を削除可能

3. **一元管理**
   - 住所が変わっても1箇所更新すれば完了
   - 全サイトで最新住所を使用可能

4. **グローバル対応**
   - どの国の住所形式でも同じUI
   - 海外サイトでも日本の住所が使える

### 市場ポジション

```
┌────────────────────────────────────────────────────────┐
│              住所管理ソリューション マップ               │
└────────────────────────────────────────────────────────┘

                高い抽象度（基盤規格）
                        ▲
                        │
                        │ 【住所検索エンジン】
                        │  ・入力工程削除
                        │  ・提出権プロトコル
                        │  ・サービス横断
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        │ Google Maps   │               │ 住所帳アプリ
        │ API           │               │ (個人管理)
        │               │               │
低い相互運用性 ←─────────┼─────────→ 高い相互運用性
        │               │               │
        │ 住所自動補完  │               │ クラウドストレージ
        │ API           │               │
        │               │               │
        └───────────────┼───────────────┘
                        │
                        │
                低い抽象度（ツール）
                        ▼
```

### 規格レベルの影響

- **個別EC最適化** → **業界標準化**
- **国内フォーマット** → **グローバル対応**
- **入力支援** → **入力削除**
- **データ保管** → **検索エンジン**

---

## 実装ガイド / Implementation Guide

### SDKインストール

```bash
npm install @vey/core @vey/search-engine
```

### 基本的な使用例

```typescript
import { 
  createSearchEngine,
  searchAddresses,
  linkToSite,
  revokeAccess 
} from '@vey/search-engine';

// 1. 検索エンジン初期化
const searchEngine = createSearchEngine({
  userId: 'did:key:user123',
  apiKey: 'your-api-key'
});

// 2. 住所を検索
const results = await searchAddresses({
  query: '実家',
  filters: { active: true }
});

console.log(results);
// [
//   {
//     id: 'addr-001',
//     name: '実家',
//     pid: 'JP-13-113-01',
//     tags: ['default', 'family'],
//     preview: '東京都渋谷区...'
//   }
// ]

// 3. サイトにリンク
await linkToSite({
  addressId: 'addr-001',
  siteId: 'ec-001',
  format: 'ec-standard'
});

// 4. 後から削除
await revokeAccess({
  addressId: 'addr-001',
  siteId: 'ec-001'
});
```

### ECサイト統合例

```typescript
// ECサイト側の実装
import { VeySearchWidget } from '@vey/widget';

function CheckoutPage() {
  return (
    <div>
      <h2>配送先を選択</h2>
      
      {/* 住所検索ウィジェット */}
      <VeySearchWidget
        onSelect={(address) => {
          // 選択された住所を使用
          console.log('Selected:', address);
          proceedToPayment(address);
        }}
        siteId="ec-001"
        format="ec-standard"
      />
    </div>
  );
}
```

### API仕様

```typescript
// 検索API
POST /api/search/addresses
{
  "userId": "did:key:user123",
  "query": "実家",
  "filters": {
    "type": "default",
    "country": "JP",
    "active": true
  }
}

// レスポンス
{
  "results": [
    {
      "id": "addr-001",
      "name": "実家",
      "pid": "JP-13-113-01",
      "tags": ["default", "family"],
      "linkedSites": ["ec-001"]
    }
  ],
  "total": 1
}

// リンクAPI
POST /api/permissions/link
{
  "userId": "did:key:user123",
  "addressId": "addr-001",
  "siteId": "ec-001",
  "format": "ec-standard"
}

// 削除API
DELETE /api/permissions/revoke
{
  "userId": "did:key:user123",
  "addressId": "addr-001",
  "siteId": "ec-001",
  "reason": "サービス解約"
}
```

---

## セキュリティとプライバシー / Security & Privacy

### データ保護

1. **エンドツーエンド暗号化**
   - 住所データは暗号化して保存
   - PIDのみが検索可能

2. **アクセス制御**
   - 明示的な権限付与が必要
   - ユーザーがいつでも削除可能

3. **監査ログ**
   - 全アクセスを記録
   - 不正利用の検出

### プライバシー原則

```
┌─────────────────────────────────────────────────────┐
│          プライバシーバイデザイン原則                 │
└─────────────────────────────────────────────────────┘

1. データ最小化
   ✓ サイトは必要な形式の住所のみ取得
   ✓ PIDは生住所を含まない

2. 目的限定
   ✓ 配送・予約・本人確認など明確な目的
   ✓ 目的外利用の禁止

3. ユーザー管理
   ✓ ユーザーが全権限を管理
   ✓ 透明性の確保

4. セキュリティ
   ✓ 暗号化保存
   ✓ アクセスログ記録
```

---

## まとめ / Summary

**住所検索エンジン**は、従来の「住所入力フォーム」を「住所検索UI」に置き換えることで、ユーザー体験を根本から変革する基盤規格です。

### キーポイント

1. **入力削除**: フォームの最適化ではなく、入力工程そのものを削除
2. **検索エンジン**: 自分の住所データベースを検索・選択
3. **権限管理**: ユーザーが提出権を完全にコントロール
4. **グローバル対応**: 世界中の住所形式を統一的に扱う
5. **基盤規格**: ECサイトごとの個別実装から業界標準へ

### 次のステップ

- [実装ガイド](./cloud-address-book-implementation.md)
- [ECサイト統合](./ec-integration-flow.md)
- [API仕様](./address-search-engine-api.md)
- [SDK Documentation](../sdk/README.md)

---

**🌐 住所検索エンジン - 入力を削除し、検索で置き換える**
