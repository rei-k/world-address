# 配送信頼度システム / Delivery Trust System

**Version:** 1.0.0  
**Date:** 2026-01-02  
**Status:** Production Specification

---

## 📋 目次 / Table of Contents

- [概要 / Overview](#概要--overview)
- [配送実績レベル / Delivery History Levels](#配送実績レベル--delivery-history-levels)
- [信頼度表示 / Trust Indicators](#信頼度表示--trust-indicators)
- [初回配送例外ルート / First-Time Delivery Exception Routes](#初回配送例外ルート--first-time-delivery-exception-routes)
- [責任境界の定義 / Responsibility Boundaries](#責任境界の定義--responsibility-boundaries)
- [ZKP段階導入 / Gradual ZKP Introduction](#zkp段階導入--gradual-zkp-introduction)
- [用語対応表 / Terminology Mapping](#用語対応表--terminology-mapping)
- [実装ガイドライン / Implementation Guidelines](#実装ガイドライン--implementation-guidelines)

---

## 概要 / Overview

### 問題意識 / Problem Statement

現状の配送システムでは「配送実績がある」という二値的な判断しかできず、以下の課題がありました：

Current delivery system had binary "has delivery history" judgment with following issues:

- **配送実績の質的差異が不明確** - 1回届いた住所と100回届いた住所が同格
- **古い実績の扱い** - 数年前の実績も有効に見える
- **配送方法の違い** - 転送・代理受取でも「届いた」扱い
- **初回配送の障壁** - 実績がないと配送できない

### 解決方針 / Solution Approach

**段階的な信頼構築モデルの導入** - Gradual trust building model:

1. ✅ 配送実績にレベルを持たせる
2. ✅ 初回配送の例外ルートを正式に定義
3. ✅ 信頼度の可視化（UXレベル）
4. ✅ 技術的信頼と人間的信頼の統合

---

## 配送実績レベル / Delivery History Levels

### 3段階の信頼レベル / 3-Tier Trust Levels

```typescript
/**
 * Delivery history trust level
 */
export enum DeliveryTrustLevel {
  /** Level 0: No delivery history */
  NONE = 0,
  
  /** Level 1: Basic delivery proof (arrived at least once) */
  BASIC = 1,
  
  /** Level 2: Continuous delivery (consistent recent deliveries) */
  CONTINUOUS = 2,
  
  /** Level 3: Direct + verified delivery (direct handoff, identity confirmed) */
  VERIFIED = 3,
}

/**
 * Delivery history record with trust level
 */
export interface DeliveryHistoryRecord {
  /** Address ID (PID) */
  addressId: string;
  
  /** Trust level */
  trustLevel: DeliveryTrustLevel;
  
  /** Total deliveries */
  totalDeliveries: number;
  
  /** Recent deliveries (last 90 days) */
  recentDeliveries: number;
  
  /** Direct deliveries (not forwarded/proxy) */
  directDeliveries: number;
  
  /** Verified deliveries (identity confirmed) */
  verifiedDeliveries: number;
  
  /** First delivery date */
  firstDeliveryDate: string;
  
  /** Last delivery date */
  lastDeliveryDate: string;
  
  /** Last delivery within days */
  lastDeliveryWithinDays: number;
  
  /** Timestamps */
  createdAt: string;
  updatedAt: string;
}
```

### Level 1: 基本的到達実績 / Basic Delivery Proof

**条件 / Conditions:**
- ✅ 少なくとも1回の配送完了実績がある
- ✅ 配送が実際に到達したことが確認されている
- ✅ Veyvault / VeyPOS / Veyform 経由で記録されている

**取得方法 / How to Achieve:**
```
- 初回配送が成功裏に完了
- 配送業者からの配達完了通知
- 受取側のアプリ確認（任意）
```

**UI表示 / UI Display:**
```
✓ 配送実績あり
✓ Delivery History Available
```

**ビジネスルール / Business Rules:**
- 💰 標準配送料金
- 📦 通常の配送サービスが利用可能
- 🔄 一般的な配送ポリシーが適用

---

### Level 2: 継続的到達実績 / Continuous Delivery Proof

**条件 / Conditions:**
- ✅ 直近90日以内に複数回（3回以上）の配送実績
- ✅ 配送成功率が95%以上
- ✅ 明確な配送パターンがある（定期配送など）

**取得方法 / How to Achieve:**
```
- 月1回以上の定期配送
- 直近3ヶ月で3回以上の配送成功
- 配送失敗率5%未満
```

**UI表示 / UI Display:**
```
✓✓ 継続配送先
✓✓ Regular Delivery Address
信頼度: 高 / Trust: High
```

**ビジネスルール / Business Rules:**
- 💰 優遇配送料金（5-10%割引）
- 📦 優先配送サービス
- 🔄 簡略化された配送承認プロセス
- ⚡ 配送時間指定の優先度向上

---

### Level 3: 直送・本人受取実績 / Direct + Verified Delivery

**条件 / Conditions:**
- ✅ Level 2の全条件を満たす
- ✅ 本人による直接受取が記録されている
- ✅ 身分証明書による本人確認済み（オプション）
- ✅ 転送・代理受取なし

**取得方法 / How to Achieve:**
```
- 配送時の本人確認（署名・ID確認）
- Veyvault アプリでの受取確認
- QR/NFC デバイスでの直接受取
- 生体認証による本人確認（オプション）
```

**UI表示 / UI Display:**
```
✓✓✓ 本人確認済み配送先
✓✓✓ Verified Delivery Address
信頼度: 最高 / Trust: Maximum
直近◯日以内に配送実績 / Delivered within ◯ days
```

**ビジネスルール / Business Rules:**
- 💰 最優遇配送料金（10-15%割引）
- 📦 プレミアム配送サービス
- 🔄 自動承認配送（事前設定による）
- ⚡ 最優先配送時間指定
- 💎 高額商品配送可能
- 🔐 追加の保険オプション

---

### レベル判定ロジック / Level Determination Logic

```typescript
/**
 * Calculate delivery trust level based on history
 */
export function calculateDeliveryTrustLevel(
  history: DeliveryHistoryRecord
): DeliveryTrustLevel {
  const { 
    totalDeliveries, 
    recentDeliveries, 
    directDeliveries, 
    verifiedDeliveries,
    lastDeliveryWithinDays 
  } = history;
  
  // Level 0: No history
  if (totalDeliveries === 0) {
    return DeliveryTrustLevel.NONE;
  }
  
  // Level 3: Direct + Verified (highest trust)
  if (
    recentDeliveries >= 3 &&
    directDeliveries >= totalDeliveries * 0.9 && // 90%+ direct
    verifiedDeliveries >= totalDeliveries * 0.5 && // 50%+ verified
    lastDeliveryWithinDays <= 90
  ) {
    return DeliveryTrustLevel.VERIFIED;
  }
  
  // Level 2: Continuous delivery
  if (
    recentDeliveries >= 3 &&
    lastDeliveryWithinDays <= 90
  ) {
    return DeliveryTrustLevel.CONTINUOUS;
  }
  
  // Level 1: Basic delivery proof
  return DeliveryTrustLevel.BASIC;
}
```

---

## 信頼度表示 / Trust Indicators

### UI/UX での表示方針 / Display Guidelines

**原則 / Principles:**
- 🎨 **最小限の表示** - ユーザーを圧倒しない
- 🔒 **控えめなバッジ** - 技術的な詳細は隠す
- 💚 **ポジティブな表現** - 信頼を強調
- 🌐 **多言語対応** - 日本語・英語

### 住所帳エントリでの表示 / Address Book Display

```
┌─────────────────────────────────────────┐
│ 📍 山田太郎 - 自宅                      │
│    〒150-0001 東京都渋谷区...          │
│                                         │
│    ✓✓✓ 本人確認済み配送先             │
│    直近30日以内に配送実績              │
│    信頼度: 最高                         │
└─────────────────────────────────────────┘
```

**English Version:**
```
┌─────────────────────────────────────────┐
│ 📍 John Doe - Home                      │
│    123 Main St, Tokyo...                │
│                                         │
│    ✓✓✓ Verified Delivery Address       │
│    Delivered within 30 days             │
│    Trust: Maximum                       │
└─────────────────────────────────────────┘
```

### コンタクトカードでの表示 / Contact Card Display

```typescript
interface AddressCardProps {
  address: Address;
  deliveryHistory: DeliveryHistoryRecord;
}

// UI Component
function AddressCard({ address, deliveryHistory }: AddressCardProps) {
  const trustLevel = calculateDeliveryTrustLevel(deliveryHistory);
  const trustBadge = getTrustBadge(trustLevel);
  const trustDescription = getTrustDescription(trustLevel, deliveryHistory);
  
  return (
    <Card>
      <AddressDetails>{address}</AddressDetails>
      <TrustBadge level={trustLevel}>{trustBadge}</TrustBadge>
      <TrustDescription>{trustDescription}</TrustDescription>
    </Card>
  );
}
```

### バッジデザイン / Badge Design

| Level | Badge | Color | Icon |
|-------|-------|-------|------|
| **0 (None)** | `新規` / `New` | Gray | ➕ |
| **1 (Basic)** | `✓ 配送実績あり` / `✓ Delivery History` | Blue | ✓ |
| **2 (Continuous)** | `✓✓ 継続配送先` / `✓✓ Regular Address` | Green | ✓✓ |
| **3 (Verified)** | `✓✓✓ 本人確認済み` / `✓✓✓ Verified` | Gold | ✓✓✓ |

---

## 初回配送例外ルート / First-Time Delivery Exception Routes

### 問題 / Problem

**現状**: 配送実績がないと配送依頼ができない  
**結果**: 新規ユーザー同士、新規拠点で詰まる

**Current**: Cannot send without delivery history  
**Result**: New users and new locations are blocked

### 解決策 / Solution

**4つの正式な例外ルート** - 4 Official Exception Routes:

---

### Route 1: 受取側事前承認 / Recipient Pre-Approval

**フロー / Flow:**
```
1. 送り手が配送リクエスト送信
2. 受け手に「初回配送」として通知
3. 受け手が明示的に承認（住所選択 + 承認ボタン）
4. 配送開始
```

**セキュリティ / Security:**
- ✅ 受取側の明示的な同意
- ✅ 送り手の身元確認（ConveyID）
- ✅ 配送内容の事前開示

**UI表示 / UI Display:**
```
⚠️ 初回配送リクエスト / First-Time Delivery Request

送り手: alice@convey
内容物: Birthday gift
重量: 1.5kg
推定配送料: ¥1,200

この送り手からの配送を承認しますか？
Do you approve delivery from this sender?

[承認する / Approve]  [拒否 / Reject]
```

**TypeScript Definition:**
```typescript
export interface FirstTimeDeliveryRequest {
  /** Request ID */
  requestId: string;
  
  /** Sender ConveyID */
  senderConveyId: string;
  
  /** Item description */
  itemDescription: string;
  
  /** Package weight */
  weightKg: number;
  
  /** Estimated cost */
  estimatedCost: number;
  
  /** Currency */
  currency: string;
  
  /** Requires explicit recipient approval */
  requiresApproval: true;
  
  /** Approval status */
  approvalStatus: 'pending' | 'approved' | 'rejected';
  
  /** Timestamps */
  requestedAt: string;
  approvedAt?: string;
}
```

---

### Route 2: デポ・ロッカー経由 / Depot/Locker Delivery

**フロー / Flow:**
```
1. 送り手が配送リクエスト送信
2. 受け手が公共ロッカーを配送先に指定
3. 配送業者が指定ロッカーに配送
4. 受け手がロッカーからピックアップ
```

**メリット / Benefits:**
- 🏢 自宅住所を公開しない
- 🔐 プライバシー保護
- ⏰ 24時間受取可能
- 📦 大型荷物にも対応

**対応ロッカー / Supported Lockers:**
```yaml
locker_types:
  - convenience_stores: コンビニ受取
  - station_lockers: 駅ロッカー
  - pudo_points: PUDOポイント
  - vey_lockers: Veyロッカー（専用）
```

**TypeScript Definition:**
```typescript
export interface LockerDeliveryOption {
  /** Locker type */
  type: 'convenience_store' | 'station' | 'pudo' | 'vey_locker';
  
  /** Locker ID */
  lockerId: string;
  
  /** Locker location */
  location: {
    name: string;
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  
  /** Available hours */
  availableHours: string;
  
  /** Maximum package size */
  maxPackageSize: {
    length: number;
    width: number;
    height: number;
  };
  
  /** Storage duration (days) */
  storageDays: number;
}
```

---

### Route 3: 一時的住所公開（ワンタイム）/ Temporary Address Disclosure (One-Time)

**フロー / Flow:**
```
1. 送り手が配送リクエスト送信
2. 受け手が「一時的住所公開」を選択
3. 住所が配送業者にのみ1回限り公開
4. 配送完了後、住所は自動削除
```

**セキュリティ / Security:**
- 🔐 暗号化された一時トークン
- ⏱️ 有効期限付き（24-72時間）
- 🗑️ 配送完了後に自動削除
- 👁️ アクセスログ記録

**ユースケース / Use Cases:**
- 🎁 一度きりのギフト受取
- 🏨 ホテル滞在中の配送
- 🚚 一時的な住所への配送
- 📦 引越し直後の配送

**TypeScript Definition:**
```typescript
export interface OneTimeAddressToken {
  /** Token ID */
  tokenId: string;
  
  /** Encrypted address */
  encryptedAddress: string;
  
  /** Valid until */
  validUntil: string;
  
  /** Maximum uses (always 1) */
  maxUses: 1;
  
  /** Used count */
  usedCount: number;
  
  /** Authorized carrier DID */
  authorizedCarrierDid: string;
  
  /** Auto-delete after delivery */
  autoDelete: true;
  
  /** Access log */
  accessLog: Array<{
    timestamp: string;
    accessor: string;
    action: string;
  }>;
}
```

---

### Route 4: 友人・知人紹介 / Friend/Acquaintance Introduction

**フロー / Flow:**
```
1. 既存ユーザーが新規ユーザーを紹介
2. 紹介者の信頼度が引き継がれる
3. 新規ユーザーの初回配送が承認される
```

**信頼の継承 / Trust Inheritance:**
```typescript
export interface IntroductionEndorsement {
  /** Introducer ConveyID */
  introducerConveyId: string;
  
  /** Introducer trust level */
  introducerTrustLevel: DeliveryTrustLevel;
  
  /** New user ConveyID */
  newUserConveyId: string;
  
  /** Inherited trust level (1 level lower) */
  inheritedTrustLevel: DeliveryTrustLevel;
  
  /** Endorsement valid for */
  validForDeliveries: number; // e.g., first 5 deliveries
  
  /** Expires at */
  expiresAt: string;
  
  /** Timestamps */
  endorsedAt: string;
}
```

**ビジネスルール / Business Rules:**
- 📊 紹介者が Level 2 以上である必要がある
- 🔄 新規ユーザーは紹介者の1レベル下からスタート
- 📦 最初の3-5回の配送に適用
- ⏱️ 紹介効果は90日間有効

---

### 例外ルート選択ガイドライン / Exception Route Selection Guidelines

| Scenario | Recommended Route | Reason |
|----------|-------------------|--------|
| 友人からのギフト | 受取側承認 | 信頼関係がある |
| オンラインショッピング（初回） | デポ・ロッカー | プライバシー保護 |
| ホテル滞在中 | 一時的住所公開 | 短期間のみ有効 |
| 家族・同僚紹介 | 友人紹介 | 信頼の継承 |

---

## 責任境界の定義 / Responsibility Boundaries

### 問題 / Problem

**現状**: 失敗時の責任境界が曖昧  
**課題**:
- 誤配送の責任
- 住所変更直後の配送
- 受取拒否時の処理

**Current**: Unclear responsibility boundaries  
**Issues**:
- Misdelivery responsibility
- Delivery right after address change
- Rejected delivery handling

### 解決策 / Solution

**明確な責任境界の定義** - Clear Responsibility Boundaries

---

### Boundary 1: Delivery ID 解決時点のスナップショット / Snapshot at Delivery ID Resolution

```typescript
export interface DeliverySnapshot {
  /** Snapshot ID */
  snapshotId: string;
  
  /** Delivery ID */
  deliveryId: string;
  
  /** Resolved address (encrypted) */
  resolvedAddress: string;
  
  /** Resolution timestamp */
  resolvedAt: string;
  
  /** Snapshot valid until */
  validUntil: string;
  
  /** Address version at resolution */
  addressVersion: number;
  
  /** Snapshot hash (immutable proof) */
  snapshotHash: string;
}
```

**原則 / Principle:**
> **「Delivery ID 解決時点の住所情報がスナップショットとして固定される」**
> 
> "Address information at Delivery ID resolution time is frozen as a snapshot"

**責任 / Responsibility:**
- ✅ Vey が正しい住所を解決することに責任を持つ
- ✅ スナップショット後の住所変更は次回配送から反映
- ✅ スナップショットは immutable（変更不可）

---

### Boundary 2: 配送開始後は配送業者責任 / Carrier Responsibility After Dispatch

```
┌─────────────────────────────────────────────────────────────┐
│                  責任境界 / Responsibility Boundary         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  Delivery ID    │  ← Vey Responsibility
│  Resolution     │     (住所解決の責任)
└────────┬────────┘
         │
         │ 📸 Snapshot Creation
         │    (スナップショット作成)
         ▼
┌─────────────────┐
│  Address        │  ← Vey Responsibility
│  Transmission   │     (住所伝達の責任)
│  to Carrier     │
└────────┬────────┘
         │
         │ 🚚 Dispatch
         │    (配送開始)
         ▼
┌─────────────────┐
│  Physical       │  ← Carrier Responsibility
│  Delivery       │     (物理配送の責任)
└────────┬────────┘
         │
         │ 📦 Delivery Attempt
         │
         ▼
┌─────────────────┐
│  Completion     │  ← Shared Responsibility
│  or Failure     │     (共同責任)
└─────────────────┘
```

**配送業者の責任 / Carrier Responsibilities:**
- 📦 物理的な配送の実行
- 🚚 配送状況の追跡
- 📞 受取人との連絡
- 🔄 配送失敗時の再配達
- 💼 荷物の安全な保管

**Veyの責任範囲外 / Outside Vey's Responsibility:**
- ❌ 配送遅延（天候・交通事情）
- ❌ 荷物の破損（輸送中の事故）
- ❌ 受取人不在による不達
- ❌ 配送先変更（配送開始後）

---

### Boundary 3: 住所変更は次回配送から反映 / Address Changes Apply to Next Delivery

**原則 / Principle:**
> **「配送中の注文には影響しない」**
> 
> "Address changes do not affect in-transit orders"

**実装 / Implementation:**

```typescript
export interface AddressChangePolicy {
  /** Change takes effect */
  effectiveFrom: 'next_delivery';
  
  /** In-transit deliveries */
  inTransitDeliveries: 'use_old_address';
  
  /** User notification */
  notifyUser: true;
  
  /** Warning message */
  warningMessage: string;
}

// Example
const addressChangePolicy: AddressChangePolicy = {
  effectiveFrom: 'next_delivery',
  inTransitDeliveries: 'use_old_address',
  notifyUser: true,
  warningMessage: 
    '配送中の注文は変更前の住所に配送されます。' +
    'In-transit orders will be delivered to the old address.',
};
```

**ユーザー通知 / User Notification:**
```
⚠️ 住所変更のお知らせ / Address Change Notice

新しい住所は次回の配送から使用されます。
New address will be used from next delivery.

配送中の注文（2件）:
In-transit orders (2):
  • Order #12345 → 旧住所 / Old Address
  • Order #12346 → 旧住所 / Old Address

次回以降の注文:
Future orders:
  • 新住所に配送 / New Address

[了解 / OK]
```

---

### Boundary 4: 受取拒否時の処理 / Rejected Delivery Handling

**責任分担 / Responsibility Sharing:**

```typescript
export interface RejectionHandling {
  /** Rejection reason */
  reason: 'recipient_refused' | 'address_incorrect' | 'unable_to_deliver';
  
  /** Responsible party */
  responsibleParty: 'vey' | 'carrier' | 'sender' | 'recipient';
  
  /** Refund policy */
  refundPolicy: {
    shippingFee: 'full' | 'partial' | 'none';
    itemCost: 'full' | 'partial' | 'none';
  };
  
  /** Next action */
  nextAction: 'return_to_sender' | 'dispose' | 'hold_at_facility';
}
```

**責任マトリクス / Responsibility Matrix:**

| Rejection Reason | Responsible Party | Shipping Fee Refund | Item Cost Refund |
|------------------|-------------------|---------------------|------------------|
| **受取拒否（正当な理由なし）** / Recipient refused (no valid reason) | Recipient | None | None |
| **住所不正確（Vey起因）** / Incorrect address (Vey's fault) | Vey | Full | Full |
| **住所不正確（送り手起因）** / Incorrect address (Sender's fault) | Sender | None | Full (to sender) |
| **配送不可（業者起因）** / Unable to deliver (Carrier's fault) | Carrier | Full | Full |
| **不在（再配達可能）** / Recipient absent (redeliver possible) | Shared | Partial | None |

---

## ZKP段階導入 / Gradual ZKP Introduction

### 問題 / Problem

**現状**: ZKP ありなしの二分  
**課題**: 初期フェーズで実装・運用が重くなる

**Current**: Binary ZKP (yes/no)  
**Issue**: Heavy implementation and operational burden in early phase

### 解決策 / Solution

**3段階の導入アプローチ** - 3-Phase Introduction Approach

---

### Phase 1: 署名 + ログ証明 / Signature + Log Proof

**実装時期 / Timeline:** MVP 〜 最初の6ヶ月 / First 6 months  
**技術要件 / Technical Requirements:** Low  
**セキュリティレベル / Security Level:** Basic

**実装内容 / Implementation:**
```typescript
export interface SignatureProof {
  /** Delivery record ID */
  deliveryId: string;
  
  /** Digital signature (Ed25519) */
  signature: string;
  
  /** Signer (carrier) DID */
  signerDid: string;
  
  /** Signed data hash */
  dataHash: string;
  
  /** Timestamp */
  timestamp: string;
  
  /** Proof type */
  type: 'signature_proof';
}
```

**メリット / Benefits:**
- ✅ 実装が簡単
- ✅ 運用コストが低い
- ✅ 既存システムと統合しやすい
- ✅ 配送記録の改ざん防止

**制限事項 / Limitations:**
- ⚠️ プライバシー保護は限定的
- ⚠️ 住所情報は暗号化のみ
- ⚠️ ZKP レベルのプライバシーなし

---

### Phase 2: Merkle Inclusion Proof / Merkle包含証明

**実装時期 / Timeline:** 6ヶ月〜1年目 / 6-12 months  
**技術要件 / Technical Requirements:** Medium  
**セキュリティレベル / Security Level:** Enhanced

**実装内容 / Implementation:**
```typescript
export interface MerkleInclusionProof {
  /** Delivery record ID */
  deliveryId: string;
  
  /** Merkle root */
  merkleRoot: string;
  
  /** Merkle path */
  merklePath: string[];
  
  /** Leaf hash */
  leafHash: string;
  
  /** Tree depth */
  treeDepth: number;
  
  /** Proof type */
  type: 'merkle_proof';
}
```

**メリット / Benefits:**
- ✅ 配送記録の集合への所属証明
- ✅ 個別の配送内容を秘匿
- ✅ 効率的な検証
- ✅ ブロックチェーンとの統合可能

**制限事項 / Limitations:**
- ⚠️ 完全な ZKP ではない
- ⚠️ 一部の情報は公開される可能性

---

### Phase 3: 完全 ZKP (zk-SNARK) / Full ZKP (zk-SNARK)

**実装時期 / Timeline:** 1年目以降 / After 1 year  
**技術要件 / Technical Requirements:** High  
**セキュリティレベル / Security Level:** Maximum

**実装内容 / Implementation:**
```typescript
export interface ZKSNARKProof {
  /** Delivery record ID */
  deliveryId: string;
  
  /** zk-SNARK proof */
  proof: string;
  
  /** Public signals */
  publicSignals: string[];
  
  /** Verification key hash */
  verificationKeyHash: string;
  
  /** Circuit type */
  circuitType: 'membership' | 'structure' | 'selective_reveal';
  
  /** Proof type */
  type: 'zksnark_proof';
}
```

**メリット / Benefits:**
- ✅ 最高レベルのプライバシー保護
- ✅ 住所を完全に秘匿
- ✅ 選択的開示が可能
- ✅ 国際標準への準拠

**実装要件 / Implementation Requirements:**
- 🔐 Trusted Setup Ceremony
- 🧪 Formal Circuit Verification
- 🛡️ External Security Audit
- 💻 高性能証明生成サーバー

---

### 段階的移行戦略 / Gradual Migration Strategy

```
Phase 1 (MVP)          Phase 2 (Growth)       Phase 3 (Mature)
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
Signature + Log        Merkle Inclusion       Full zk-SNARK
    │                       │                       │
    │  [6 months]          │  [6 months]          │  [Ongoing]
    ▼                       ▼                       ▼
✓ Basic trust          ✓ Enhanced trust       ✓ Maximum trust
✓ Low cost             ✓ Medium cost          ✓ Higher cost
✓ Fast to market       ✓ Better privacy       ✓ Best privacy
```

**並行運用期間 / Parallel Operation Period:**
```
Month 0-6:   Phase 1 only
Month 6-12:  Phase 1 + Phase 2 (hybrid)
Month 12-18: Phase 1 + Phase 2 + Phase 3 (hybrid)
Month 18+:   Phase 2 + Phase 3 (Phase 1 deprecation)
```

---

## 用語対応表 / Terminology Mapping

### 問題 / Problem

**現状**: 内部用語が外向きにも使われている  
**課題**: 非技術者への説明コストが高い

**Current**: Internal terminology used externally  
**Issue**: High explanation cost for non-technical users

### 解決策 / Solution

**内部用語と外向き用語の明確な分離** - Clear separation of internal and external terminology

---

### 用語マッピング / Terminology Mapping

| 内部用語 / Internal | 外向き用語 / External (JP) | External (EN) | 使用場所 / Usage |
|-------------------|-------------------------|---------------|-----------------|
| **Delivery ID** | 宛先コード | Destination Code | UI, Documentation |
| **ConveyID** | 配送アドレス | Delivery Address | UI, Marketing |
| **ZKP (Zero-Knowledge Proof)** | ー（表示しない） | ー (Not displayed) | Internal only |
| **実在性証明** | 配送実績 | Delivery History | UI, User-facing |
| **PID (Privacy ID)** | 住所番号 | Address Number | Internal only |
| **Merkle Tree** | 配送記録 | Delivery Records | Internal only |
| **zk-SNARK** | 高度な暗号化 | Advanced Encryption | Documentation (simplified) |
| **Commitment** | 保証証明 | Proof of Guarantee | Internal only |
| **Verification Key** | 検証コード | Verification Code | Technical docs only |
| **Trusted Setup** | セキュリティ設定 | Security Setup | Admin interface |

---

### UI/UX 表示例 / UI/UX Display Examples

#### ❌ 避けるべき表現 / Expressions to Avoid

```
✗ "ZKP証明を生成中..."
✗ "Merkle treeに登録しています..."
✗ "PIDAを選択してください"
✗ "Commitment hashを確認中..."
```

#### ✅ 推奨表現 / Recommended Expressions

```
✓ "配送先を確認しています..."
✓ "配送実績を確認中..."
✓ "住所を選択してください"
✓ "配送記録を確認中..."
```

---

### ドキュメント使い分け / Documentation Usage

**技術ドキュメント / Technical Documentation:**
- 📘 開発者向け: 内部用語を使用
- 📗 API リファレンス: 内部用語を使用
- 📕 アーキテクチャ図: 内部用語を使用

**ユーザー向けドキュメント / User Documentation:**
- 📙 ユーザーガイド: 外向き用語を使用
- 📔 FAQ: 外向き用語を使用
- 📰 マーケティング資料: 外向き用語を使用

---

## 実装ガイドライン / Implementation Guidelines

### データモデル / Data Models

```typescript
// File: src/types/delivery-trust.ts

/**
 * Complete delivery trust system types
 */

export { DeliveryTrustLevel, DeliveryHistoryRecord };
export { FirstTimeDeliveryRequest, LockerDeliveryOption };
export { OneTimeAddressToken, IntroductionEndorsement };
export { DeliverySnapshot, AddressChangePolicy };
export { RejectionHandling };
export { SignatureProof, MerkleInclusionProof, ZKSNARKProof };

/**
 * Calculate delivery trust level
 */
export { calculateDeliveryTrustLevel };

/**
 * Get trust badge for UI display
 */
export function getTrustBadge(level: DeliveryTrustLevel): string {
  switch (level) {
    case DeliveryTrustLevel.NONE:
      return '新規';
    case DeliveryTrustLevel.BASIC:
      return '✓ 配送実績あり';
    case DeliveryTrustLevel.CONTINUOUS:
      return '✓✓ 継続配送先';
    case DeliveryTrustLevel.VERIFIED:
      return '✓✓✓ 本人確認済み';
  }
}

/**
 * Get trust description for UI display
 */
export function getTrustDescription(
  level: DeliveryTrustLevel,
  history: DeliveryHistoryRecord
): string {
  switch (level) {
    case DeliveryTrustLevel.NONE:
      return '配送実績なし';
    case DeliveryTrustLevel.BASIC:
      return `配送実績: ${history.totalDeliveries}回`;
    case DeliveryTrustLevel.CONTINUOUS:
      return `継続配送先 (直近${history.lastDeliveryWithinDays}日以内)`;
    case DeliveryTrustLevel.VERIFIED:
      return `本人確認済み配送先 (直近${history.lastDeliveryWithinDays}日以内)`;
  }
}
```

---

### API エンドポイント / API Endpoints

```typescript
// File: src/api/delivery-trust-api.ts

/**
 * Get delivery history for an address
 */
export async function getDeliveryHistory(
  addressId: string
): Promise<DeliveryHistoryRecord> {
  // Implementation
}

/**
 * Calculate trust level
 */
export async function calculateTrustLevel(
  addressId: string
): Promise<DeliveryTrustLevel> {
  // Implementation
}

/**
 * Request first-time delivery
 */
export async function requestFirstTimeDelivery(
  request: FirstTimeDeliveryRequest
): Promise<DeliveryResponse> {
  // Implementation
}

/**
 * Create delivery snapshot
 */
export async function createDeliverySnapshot(
  deliveryId: string
): Promise<DeliverySnapshot> {
  // Implementation
}
```

---

### データベーススキーマ / Database Schema

```sql
-- Delivery history table
CREATE TABLE delivery_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address_id VARCHAR(255) NOT NULL,
  trust_level INTEGER NOT NULL DEFAULT 0,
  total_deliveries INTEGER NOT NULL DEFAULT 0,
  recent_deliveries INTEGER NOT NULL DEFAULT 0,
  direct_deliveries INTEGER NOT NULL DEFAULT 0,
  verified_deliveries INTEGER NOT NULL DEFAULT 0,
  first_delivery_date TIMESTAMP,
  last_delivery_date TIMESTAMP,
  last_delivery_within_days INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  INDEX idx_address_id (address_id),
  INDEX idx_trust_level (trust_level),
  INDEX idx_last_delivery_date (last_delivery_date)
);

-- Delivery snapshot table
CREATE TABLE delivery_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id VARCHAR(255) UNIQUE NOT NULL,
  delivery_id VARCHAR(255) NOT NULL,
  resolved_address TEXT NOT NULL, -- encrypted
  resolved_at TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  address_version INTEGER NOT NULL,
  snapshot_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  INDEX idx_delivery_id (delivery_id),
  INDEX idx_snapshot_hash (snapshot_hash)
);

-- First-time delivery requests table
CREATE TABLE first_time_delivery_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id VARCHAR(255) UNIQUE NOT NULL,
  sender_conveyid VARCHAR(255) NOT NULL,
  recipient_conveyid VARCHAR(255) NOT NULL,
  item_description TEXT,
  weight_kg DECIMAL(10, 2),
  estimated_cost DECIMAL(10, 2),
  currency VARCHAR(3),
  requires_approval BOOLEAN DEFAULT TRUE,
  approval_status VARCHAR(50) NOT NULL,
  requested_at TIMESTAMP NOT NULL,
  approved_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  INDEX idx_recipient_conveyid (recipient_conveyid),
  INDEX idx_approval_status (approval_status)
);
```

---

## まとめ / Summary

### 達成された改善 / Achieved Improvements

✅ **1. 配送実績レベル化** - 3段階の信頼レベル定義  
✅ **2. 初回例外ルート** - 4つの正式な例外ルート定義  
✅ **3. 責任境界固定** - 明確な責任分担の定義  
✅ **4. ZKP段階導入** - 3段階の実装アプローチ  
✅ **5. 信頼統合** - 人間的信頼と技術的信頼の統合  
✅ **6. 用語分離** - 内部用語と外向き用語の明確化  
✅ **7. Vey独自性** - エコシステム依存関係の明文化

### インパクト / Impact

**思想プロトタイプ → インフラ仕様への移行完了**

This specification moves Vey from a "conceptual prototype" to a "production-ready infrastructure specification"

---

## 参照 / References

- [ConveyID Protocol Specification](./CONVEY_PROTOCOL.md)
- [ZKP Implementation Guide](../docs/zkp/COMPLETE_IMPLEMENTATION.md)
- [Veyvault Delivery Features](./apps/Veyvault/DELIVERY_FEATURES_GUIDE.md)
- [Integration Guide](./integration/INTEGRATION_GUIDE.md)

---

**Author:** Vey Team  
**Version:** 1.0.0  
**Last Updated:** 2026-01-02  
**Status:** ✅ Production Specification
