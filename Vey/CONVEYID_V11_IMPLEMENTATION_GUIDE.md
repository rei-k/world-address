# ConveyID v1.1.0 実装ガイド / Implementation Guide

**Version:** 1.0.0  
**Date:** 2026-01-02  
**Target Audience:** Engineers, Product Managers, Technical Leads

---

## 📋 目次 / Table of Contents

- [概要 / Overview](#概要--overview)
- [実装優先度 / Implementation Priority](#実装優先度--implementation-priority)
- [Phase 1: データモデル実装](#phase-1-データモデル実装)
- [Phase 2: API実装](#phase-2-api実装)
- [Phase 3: UI/UX実装](#phase-3-uiux実装)
- [Phase 4: テスト実装](#phase-4-テスト実装)
- [マイグレーション戦略](#マイグレーション戦略)
- [チェックリスト](#チェックリスト)

---

## 概要 / Overview

このドキュメントは、[DELIVERY_TRUST_SYSTEM.md](./DELIVERY_TRUST_SYSTEM.md) で定義された仕様を実際のコードベースに実装するためのステップバイステップガイドです。

This document provides a step-by-step guide to implement the specifications defined in [DELIVERY_TRUST_SYSTEM.md](./DELIVERY_TRUST_SYSTEM.md) into the actual codebase.

### 前提条件 / Prerequisites

- ✅ [DELIVERY_TRUST_SYSTEM.md](./DELIVERY_TRUST_SYSTEM.md) を読了
- ✅ [CONVEY_PROTOCOL.md v1.1.0](./CONVEY_PROTOCOL.md) を理解
- ✅ 既存の Veyvault/VeyExpress コードベースへのアクセス
- ✅ PostgreSQL (or equivalent) データベース
- ✅ TypeScript/Node.js 開発環境

---

## 実装優先度 / Implementation Priority

### 優先度 HIGH (MVP必須) / Priority HIGH (MVP Required)

1. **配送信頼度レベル基本実装** (2-3週間)
   - データモデル
   - レベル判定ロジック
   - 基本API

2. **受取側事前承認フロー** (1-2週間)
   - 初回配送リクエスト
   - 承認UI

3. **責任境界スナップショット** (2週間)
   - スナップショット生成
   - 住所変更時の通知

### 優先度 MEDIUM (Phase 2) / Priority MEDIUM (Phase 2)

4. **ロッカー配送統合** (3-4週間)
   - ロッカー選択UI
   - API統合

5. **信頼度レベルの可視化** (2週間)
   - 住所帳バッジ表示
   - コンタクトカード更新

6. **一時トークン機能** (2-3週間)
   - トークン生成
   - 自動削除ロジック

### 優先度 LOW (Phase 3) / Priority LOW (Phase 3)

7. **友人紹介機能** (2-3週間)
8. **ZKP Phase 1 実装** (4-6週間)
9. **多言語対応強化** (2週間)

---

## Phase 1: データモデル実装

### Step 1.1: データベーススキーマ追加

**ファイル**: `database/migrations/001_add_delivery_trust_system.sql`

```sql
-- Delivery history table
CREATE TABLE delivery_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address_id VARCHAR(255) NOT NULL UNIQUE,
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
  
  CONSTRAINT delivery_history_trust_level_check 
    CHECK (trust_level >= 0 AND trust_level <= 3),
  
  INDEX idx_address_id (address_id),
  INDEX idx_trust_level (trust_level),
  INDEX idx_last_delivery_date (last_delivery_date)
);

-- Delivery snapshots table
CREATE TABLE delivery_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id VARCHAR(255) UNIQUE NOT NULL,
  delivery_id VARCHAR(255) NOT NULL,
  resolved_address_encrypted TEXT NOT NULL,
  resolved_at TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  address_version INTEGER NOT NULL,
  snapshot_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  INDEX idx_delivery_id (delivery_id),
  INDEX idx_snapshot_hash (snapshot_hash),
  INDEX idx_valid_until (valid_until)
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
  exception_route VARCHAR(50) NOT NULL,
  requested_at TIMESTAMP NOT NULL,
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT first_time_approval_status_check 
    CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  CONSTRAINT first_time_exception_route_check 
    CHECK (exception_route IN ('approval', 'locker', 'one_time', 'introduction')),
  
  INDEX idx_recipient_conveyid (recipient_conveyid),
  INDEX idx_approval_status (approval_status),
  INDEX idx_requested_at (requested_at)
);

-- One-time address tokens table
CREATE TABLE one_time_address_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id VARCHAR(255) UNIQUE NOT NULL,
  encrypted_address TEXT NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  max_uses INTEGER NOT NULL DEFAULT 1,
  used_count INTEGER NOT NULL DEFAULT 0,
  authorized_carrier_did VARCHAR(255) NOT NULL,
  auto_delete BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  accessed_at TIMESTAMP,
  
  INDEX idx_token_id (token_id),
  INDEX idx_valid_until (valid_until),
  INDEX idx_used_count (used_count)
);

-- Token access log table
CREATE TABLE token_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id VARCHAR(255) NOT NULL,
  accessor VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  
  INDEX idx_token_id (token_id),
  INDEX idx_timestamp (timestamp),
  
  FOREIGN KEY (token_id) 
    REFERENCES one_time_address_tokens(token_id) 
    ON DELETE CASCADE
);
```

**マイグレーション実行 / Run Migration:**

```bash
# PostgreSQL
psql -U postgres -d veyvault -f database/migrations/001_add_delivery_trust_system.sql

# または Prisma を使用している場合
npx prisma migrate dev --name add_delivery_trust_system
```

---

### Step 1.2: TypeScript型定義

**ファイル**: `src/types/delivery-trust.ts`

```typescript
/**
 * Delivery Trust System Types
 * Based on DELIVERY_TRUST_SYSTEM.md specification
 */

/**
 * Delivery trust level enumeration
 */
export enum DeliveryTrustLevel {
  /** No delivery history */
  NONE = 0,
  
  /** Basic delivery proof (at least 1 successful delivery) */
  BASIC = 1,
  
  /** Continuous delivery (3+ deliveries in last 90 days) */
  CONTINUOUS = 2,
  
  /** Direct + verified delivery (ID confirmed) */
  VERIFIED = 3,
}

/**
 * Delivery history record with trust level
 */
export interface DeliveryHistoryRecord {
  /** Record ID */
  id: string;
  
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
  firstDeliveryDate: Date | null;
  
  /** Last delivery date */
  lastDeliveryDate: Date | null;
  
  /** Last delivery within days */
  lastDeliveryWithinDays: number | null;
  
  /** Timestamps */
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Delivery snapshot for address resolution
 */
export interface DeliverySnapshot {
  /** Snapshot ID */
  snapshotId: string;
  
  /** Delivery ID */
  deliveryId: string;
  
  /** Resolved address (encrypted) */
  resolvedAddressEncrypted: string;
  
  /** Resolution timestamp */
  resolvedAt: Date;
  
  /** Snapshot valid until */
  validUntil: Date;
  
  /** Address version at resolution */
  addressVersion: number;
  
  /** Snapshot hash (immutable proof) */
  snapshotHash: string;
  
  /** Created timestamp */
  createdAt: Date;
}

/**
 * First-time delivery request
 */
export interface FirstTimeDeliveryRequest {
  /** Request ID */
  requestId: string;
  
  /** Sender ConveyID */
  senderConveyId: string;
  
  /** Recipient ConveyID */
  recipientConveyId: string;
  
  /** Item description */
  itemDescription: string;
  
  /** Package weight in kg */
  weightKg: number;
  
  /** Estimated cost */
  estimatedCost: number;
  
  /** Currency */
  currency: string;
  
  /** Requires explicit recipient approval */
  requiresApproval: boolean;
  
  /** Approval status */
  approvalStatus: 'pending' | 'approved' | 'rejected';
  
  /** Exception route type */
  exceptionRoute: 'approval' | 'locker' | 'one_time' | 'introduction';
  
  /** Timestamps */
  requestedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * One-time address token
 */
export interface OneTimeAddressToken {
  /** Token ID */
  tokenId: string;
  
  /** Encrypted address */
  encryptedAddress: string;
  
  /** Valid until */
  validUntil: Date;
  
  /** Maximum uses (always 1) */
  maxUses: number;
  
  /** Used count */
  usedCount: number;
  
  /** Authorized carrier DID */
  authorizedCarrierDid: string;
  
  /** Auto-delete after delivery */
  autoDelete: boolean;
  
  /** Created timestamp */
  createdAt: Date;
  
  /** Last accessed */
  accessedAt?: Date;
}

/**
 * Token access log entry
 */
export interface TokenAccessLog {
  /** Log ID */
  id: string;
  
  /** Token ID */
  tokenId: string;
  
  /** Accessor identifier */
  accessor: string;
  
  /** Action performed */
  action: string;
  
  /** Timestamp */
  timestamp: Date;
}

/**
 * Address change policy
 */
export interface AddressChangePolicy {
  /** Change takes effect */
  effectiveFrom: 'next_delivery';
  
  /** In-transit deliveries */
  inTransitDeliveries: 'use_old_address';
  
  /** User notification */
  notifyUser: boolean;
  
  /** Warning message */
  warningMessage: string;
}

/**
 * Rejection handling policy
 */
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

---

### Step 1.3: ビジネスロジック実装

**ファイル**: `src/services/delivery-trust.service.ts`

```typescript
import { DeliveryTrustLevel, DeliveryHistoryRecord } from '@/types/delivery-trust';

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
    lastDeliveryWithinDays !== null && lastDeliveryWithinDays <= 90
  ) {
    return DeliveryTrustLevel.VERIFIED;
  }
  
  // Level 2: Continuous delivery
  if (
    recentDeliveries >= 3 &&
    lastDeliveryWithinDays !== null && lastDeliveryWithinDays <= 90
  ) {
    return DeliveryTrustLevel.CONTINUOUS;
  }
  
  // Level 1: Basic delivery proof
  return DeliveryTrustLevel.BASIC;
}

/**
 * Get trust badge text for UI display
 */
export function getTrustBadge(
  level: DeliveryTrustLevel,
  locale: 'ja' | 'en' = 'en'
): string {
  const badges = {
    ja: {
      [DeliveryTrustLevel.NONE]: '新規',
      [DeliveryTrustLevel.BASIC]: '✓ 配送実績あり',
      [DeliveryTrustLevel.CONTINUOUS]: '✓✓ 継続配送先',
      [DeliveryTrustLevel.VERIFIED]: '✓✓✓ 本人確認済み',
    },
    en: {
      [DeliveryTrustLevel.NONE]: 'New',
      [DeliveryTrustLevel.BASIC]: '✓ Delivery History',
      [DeliveryTrustLevel.CONTINUOUS]: '✓✓ Regular Address',
      [DeliveryTrustLevel.VERIFIED]: '✓✓✓ Verified',
    },
  };
  
  return badges[locale][level];
}

/**
 * Get trust description for UI display
 */
export function getTrustDescription(
  level: DeliveryTrustLevel,
  history: DeliveryHistoryRecord,
  locale: 'ja' | 'en' = 'en'
): string {
  const descriptions = {
    ja: {
      [DeliveryTrustLevel.NONE]: '配送実績なし',
      [DeliveryTrustLevel.BASIC]: `配送実績: ${history.totalDeliveries}回`,
      [DeliveryTrustLevel.CONTINUOUS]: 
        `継続配送先 (直近${history.lastDeliveryWithinDays}日以内)`,
      [DeliveryTrustLevel.VERIFIED]: 
        `本人確認済み配送先 (直近${history.lastDeliveryWithinDays}日以内)`,
    },
    en: {
      [DeliveryTrustLevel.NONE]: 'No delivery history',
      [DeliveryTrustLevel.BASIC]: `${history.totalDeliveries} deliveries`,
      [DeliveryTrustLevel.CONTINUOUS]: 
        `Regular address (within ${history.lastDeliveryWithinDays} days)`,
      [DeliveryTrustLevel.VERIFIED]: 
        `Verified address (within ${history.lastDeliveryWithinDays} days)`,
    },
  };
  
  return descriptions[locale][level];
}

/**
 * Get shipping discount based on trust level
 */
export function getShippingDiscount(level: DeliveryTrustLevel): number {
  const discounts = {
    [DeliveryTrustLevel.NONE]: 0,
    [DeliveryTrustLevel.BASIC]: 0,
    [DeliveryTrustLevel.CONTINUOUS]: 0.075, // 7.5% (5-10% range)
    [DeliveryTrustLevel.VERIFIED]: 0.125,   // 12.5% (10-15% range)
  };
  
  return discounts[level];
}

/**
 * Check if address is eligible for premium services
 */
export function isPremiumEligible(level: DeliveryTrustLevel): boolean {
  return level === DeliveryTrustLevel.VERIFIED;
}
```

---

## Phase 2: API実装

### Step 2.1: REST API エンドポイント

**ファイル**: `src/api/routes/delivery-trust.routes.ts`

```typescript
import express from 'express';
import { authenticateUser } from '@/middleware/auth';
import * as deliveryTrustController from '@/controllers/delivery-trust.controller';

const router = express.Router();

// Get delivery history for an address
router.get(
  '/delivery-history/:addressId',
  authenticateUser,
  deliveryTrustController.getDeliveryHistory
);

// Calculate trust level
router.get(
  '/trust-level/:addressId',
  authenticateUser,
  deliveryTrustController.calculateTrustLevel
);

// Create first-time delivery request
router.post(
  '/first-time-delivery',
  authenticateUser,
  deliveryTrustController.createFirstTimeDeliveryRequest
);

// Approve first-time delivery
router.post(
  '/first-time-delivery/:requestId/approve',
  authenticateUser,
  deliveryTrustController.approveFirstTimeDelivery
);

// Reject first-time delivery
router.post(
  '/first-time-delivery/:requestId/reject',
  authenticateUser,
  deliveryTrustController.rejectFirstTimeDelivery
);

// Create delivery snapshot
router.post(
  '/snapshot',
  authenticateUser,
  deliveryTrustController.createDeliverySnapshot
);

// Get delivery snapshot
router.get(
  '/snapshot/:snapshotId',
  authenticateUser,
  deliveryTrustController.getDeliverySnapshot
);

export default router;
```

**ファイル**: `src/controllers/delivery-trust.controller.ts`

```typescript
import { Request, Response } from 'express';
import * as deliveryTrustService from '@/services/delivery-trust.service';

/**
 * Get delivery history for an address
 */
export async function getDeliveryHistory(req: Request, res: Response) {
  try {
    const { addressId } = req.params;
    const userId = req.user.id; // From auth middleware
    
    const history = await deliveryTrustService.getDeliveryHistoryByAddress(
      addressId,
      userId
    );
    
    if (!history) {
      return res.status(404).json({
        error: 'Delivery history not found',
      });
    }
    
    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Error getting delivery history:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
}

/**
 * Calculate trust level for an address
 */
export async function calculateTrustLevel(req: Request, res: Response) {
  try {
    const { addressId } = req.params;
    const userId = req.user.id;
    
    const trustLevel = await deliveryTrustService.calculateTrustLevelForAddress(
      addressId,
      userId
    );
    
    res.json({
      success: true,
      data: {
        addressId,
        trustLevel,
        badge: deliveryTrustService.getTrustBadge(trustLevel, req.locale),
      },
    });
  } catch (error) {
    console.error('Error calculating trust level:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
}

// ... (other controller methods)
```

---

## Phase 3: UI/UX実装

### Step 3.1: 住所帳バッジコンポーネント

**ファイル**: `components/AddressTrustBadge.tsx` (React example)

```typescript
import React from 'react';
import { DeliveryTrustLevel } from '@/types/delivery-trust';

interface AddressTrustBadgeProps {
  level: DeliveryTrustLevel;
  lastDeliveryWithinDays?: number;
  locale?: 'ja' | 'en';
}

const AddressTrustBadge: React.FC<AddressTrustBadgeProps> = ({
  level,
  lastDeliveryWithinDays,
  locale = 'en',
}) => {
  const getBadgeStyle = () => {
    switch (level) {
      case DeliveryTrustLevel.NONE:
        return {
          color: 'text-gray-600',
          bg: 'bg-gray-100',
          icon: '➕',
        };
      case DeliveryTrustLevel.BASIC:
        return {
          color: 'text-blue-600',
          bg: 'bg-blue-100',
          icon: '✓',
        };
      case DeliveryTrustLevel.CONTINUOUS:
        return {
          color: 'text-green-600',
          bg: 'bg-green-100',
          icon: '✓✓',
        };
      case DeliveryTrustLevel.VERIFIED:
        return {
          color: 'text-yellow-600',
          bg: 'bg-yellow-100',
          icon: '✓✓✓',
        };
    }
  };
  
  const getBadgeText = () => {
    const texts = {
      ja: {
        [DeliveryTrustLevel.NONE]: '新規',
        [DeliveryTrustLevel.BASIC]: '配送実績あり',
        [DeliveryTrustLevel.CONTINUOUS]: '継続配送先',
        [DeliveryTrustLevel.VERIFIED]: '本人確認済み',
      },
      en: {
        [DeliveryTrustLevel.NONE]: 'New',
        [DeliveryTrustLevel.BASIC]: 'Delivery History',
        [DeliveryTrustLevel.CONTINUOUS]: 'Regular Address',
        [DeliveryTrustLevel.VERIFIED]: 'Verified',
      },
    };
    
    return texts[locale][level];
  };
  
  const getSubtext = () => {
    if (level === DeliveryTrustLevel.NONE) {
      return locale === 'ja' ? '配送実績なし' : 'No delivery history';
    }
    
    if (lastDeliveryWithinDays !== undefined) {
      return locale === 'ja'
        ? `直近${lastDeliveryWithinDays}日以内`
        : `Within ${lastDeliveryWithinDays} days`;
    }
    
    return '';
  };
  
  const style = getBadgeStyle();
  
  return (
    <div className="flex items-center space-x-2">
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.color}`}
      >
        <span className="mr-1">{style.icon}</span>
        {getBadgeText()}
      </span>
      {getSubtext() && (
        <span className="text-xs text-gray-500">{getSubtext()}</span>
      )}
    </div>
  );
};

export default AddressTrustBadge;
```

---

## Phase 4: テスト実装

### Step 4.1: ユニットテスト

**ファイル**: `tests/services/delivery-trust.service.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import {
  calculateDeliveryTrustLevel,
  getTrustBadge,
  getShippingDiscount,
} from '@/services/delivery-trust.service';
import { DeliveryTrustLevel } from '@/types/delivery-trust';

describe('Delivery Trust Service', () => {
  describe('calculateDeliveryTrustLevel', () => {
    it('should return NONE for no deliveries', () => {
      const history = {
        totalDeliveries: 0,
        recentDeliveries: 0,
        directDeliveries: 0,
        verifiedDeliveries: 0,
        lastDeliveryWithinDays: null,
      };
      
      expect(calculateDeliveryTrustLevel(history)).toBe(
        DeliveryTrustLevel.NONE
      );
    });
    
    it('should return BASIC for 1 delivery', () => {
      const history = {
        totalDeliveries: 1,
        recentDeliveries: 1,
        directDeliveries: 1,
        verifiedDeliveries: 0,
        lastDeliveryWithinDays: 30,
      };
      
      expect(calculateDeliveryTrustLevel(history)).toBe(
        DeliveryTrustLevel.BASIC
      );
    });
    
    it('should return CONTINUOUS for 3+ recent deliveries', () => {
      const history = {
        totalDeliveries: 5,
        recentDeliveries: 3,
        directDeliveries: 4,
        verifiedDeliveries: 1,
        lastDeliveryWithinDays: 45,
      };
      
      expect(calculateDeliveryTrustLevel(history)).toBe(
        DeliveryTrustLevel.CONTINUOUS
      );
    });
    
    it('should return VERIFIED for high-quality deliveries', () => {
      const history = {
        totalDeliveries: 10,
        recentDeliveries: 5,
        directDeliveries: 9, // 90%
        verifiedDeliveries: 6, // 60%
        lastDeliveryWithinDays: 20,
      };
      
      expect(calculateDeliveryTrustLevel(history)).toBe(
        DeliveryTrustLevel.VERIFIED
      );
    });
  });
  
  describe('getShippingDiscount', () => {
    it('should return 0% for NONE and BASIC', () => {
      expect(getShippingDiscount(DeliveryTrustLevel.NONE)).toBe(0);
      expect(getShippingDiscount(DeliveryTrustLevel.BASIC)).toBe(0);
    });
    
    it('should return 7.5% for CONTINUOUS', () => {
      expect(getShippingDiscount(DeliveryTrustLevel.CONTINUOUS)).toBe(0.075);
    });
    
    it('should return 12.5% for VERIFIED', () => {
      expect(getShippingDiscount(DeliveryTrustLevel.VERIFIED)).toBe(0.125);
    });
  });
});
```

---

## マイグレーション戦略

### 既存ユーザーへの対応

```typescript
/**
 * Backfill delivery history for existing users
 */
async function backfillDeliveryHistory() {
  // 1. Get all existing deliveries
  const deliveries = await db.deliveries.findMany({
    where: { status: 'delivered' },
    orderBy: { deliveredAt: 'asc' },
  });
  
  // 2. Group by address
  const deliveriesByAddress = groupBy(deliveries, 'recipientAddressId');
  
  // 3. Calculate trust level for each address
  for (const [addressId, addressDeliveries] of Object.entries(deliveriesByAddress)) {
    const history = calculateHistoryFromDeliveries(addressDeliveries);
    
    await db.deliveryHistory.upsert({
      where: { addressId },
      create: history,
      update: history,
    });
  }
  
  console.log(`Backfilled delivery history for ${Object.keys(deliveriesByAddress).length} addresses`);
}
```

---

## チェックリスト

### データモデル
- [ ] データベーススキーマ作成
- [ ] マイグレーション実行
- [ ] TypeScript型定義作成
- [ ] ビジネスロジック実装

### API
- [ ] RESTエンドポイント実装
- [ ] コントローラー実装
- [ ] サービス層実装
- [ ] 認証・認可処理

### UI/UX
- [ ] 住所帳バッジコンポーネント
- [ ] 初回配送承認UI
- [ ] 責任境界通知UI
- [ ] 多言語対応

### テスト
- [ ] ユニットテスト
- [ ] 統合テスト
- [ ] E2Eテスト
- [ ] パフォーマンステスト

### ドキュメント
- [ ] API ドキュメント更新
- [ ] ユーザーガイド更新
- [ ] 開発者ガイド更新

---

## 参照 / References

- [Delivery Trust System Specification](./DELIVERY_TRUST_SYSTEM.md)
- [ConveyID Protocol v1.1.0](./CONVEY_PROTOCOL.md)
- [Implementation Report](./CONVEYID_V11_IMPLEMENTATION_REPORT.md)

---

**Author:** Vey Engineering Team  
**Last Updated:** 2026-01-02  
**Status:** Ready for Implementation
