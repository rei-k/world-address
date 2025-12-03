# ギフト配送AI機能 / Gift Delivery AI Features

## 概要 / Overview

ギフト配送フローを最適化し、破綻を防止するための3つのコアAI機能と、さらなる改善のための3つの拡張AI機能を提供します。

This document describes three core AI features to optimize the gift delivery flow and prevent failures, plus three extended AI features for further improvements.

---

## コアAI機能 / Core AI Features

### 1. 🤖 Carrier Intent AI（配送適合AI）

#### 概要 / Overview

受取候補の住所を分析し、配送キャリアと互換性のある住所のみを提示する。期限が近い住所を優先し、過去の受取履歴から成功確率を計算する。

Analyzes recipient's candidate addresses and presents only those compatible with the delivery carrier. Prioritizes addresses with approaching deadlines and calculates success probability from past delivery history.

#### 主要機能 / Key Features

##### 1.1 配送可能エリアチェック / Deliverable Area Check

```typescript
interface DeliverabilityCheck {
  /**
   * PIDとキャリアの互換性を検証
   * Verify PID and carrier compatibility
   */
  verifyCarrierCompatibility(
    pid: string,
    carrier: CarrierCode,
    serviceLevel: ServiceLevel
  ): Promise<{
    compatible: boolean;
    reasons?: string[];
    alternativeCarriers?: CarrierCode[];
  }>;
}
```

**チェック項目 / Check Items:**

- ✓ キャリアの配送対応エリア / Carrier's delivery coverage
- ✓ 郵便番号の有効性 / Postal code validity
- ✓ 住所階層の完全性 / Address hierarchy completeness
- ✓ 特殊配送条件（離島、山間部等）/ Special delivery conditions (islands, mountains, etc.)
- ✓ 時間指定・日付指定の可否 / Time/date specification availability

##### 1.2 期限優先度調整 / Deadline Priority Adjustment

```typescript
interface DeadlinePriority {
  /**
   * 期限に基づいて候補の優先度を計算
   * Calculate candidate priority based on deadline
   */
  calculatePriority(
    candidates: GiftDeliveryCandidate[],
    deadline: Date,
    currentTime: Date
  ): Promise<GiftDeliveryCandidate[]>;
}
```

**優先度計算アルゴリズム / Priority Calculation Algorithm:**

```
Priority Score = (Base Score) × (Deadline Factor) × (Success Rate)

where:
  Deadline Factor = 1 + (1 / hours_remaining)^2
  Success Rate = successful_deliveries / total_deliveries
  Base Score = carrier_compatibility_score × address_quality_score
```

**期限別優先度 / Priority by Deadline:**

| 残り時間 / Remaining | 優先度倍率 / Priority Multiplier | アクション / Action |
|---------------------|--------------------------------|-------------------|
| 72時間以上 / 72h+ | 1.0x | 通常表示 / Normal display |
| 48-72時間 / 48-72h | 1.5x | 優先表示 / Priority display |
| 24-48時間 / 24-48h | 2.0x | 強調表示 / Highlighted display |
| 12-24時間 / 12-24h | 3.0x | 緊急表示 / Urgent display |
| 12時間未満 / <12h | 5.0x | 最優先表示 / Top priority display |

##### 1.3 成功確率計算 / Success Probability Calculation

```typescript
interface SuccessProbability {
  /**
   * 住所の配送成功確率を計算
   * Calculate delivery success probability for an address
   */
  calculateSuccessProbability(
    pid: string,
    recipientDID: string,
    carrierCode: CarrierCode
  ): Promise<{
    probability: number;        // 0-1
    confidence: number;         // 0-1
    factors: ProbabilityFactors;
  }>;
}

interface ProbabilityFactors {
  historicalSuccess: number;    // 過去の成功率 / Historical success rate
  addressQuality: number;       // 住所品質スコア / Address quality score
  carrierReliability: number;   // キャリア信頼性 / Carrier reliability
  seasonalFactor: number;       // 季節要因 / Seasonal factor
  geographicFactor: number;     // 地理的要因 / Geographic factor
}
```

**成功確率計算式 / Success Probability Formula:**

```
Probability = Weighted Average of:
  - Historical Success Rate (40%)
  - Address Quality Score (25%)
  - Carrier Reliability (20%)
  - Seasonal Factor (10%)
  - Geographic Factor (5%)
```

#### 実装例 / Implementation Example

```typescript
import { CarrierIntentAI } from '@vey/core';

const ai = new CarrierIntentAI({
  apiKey: 'your-api-key',
  model: 'carrier-intent-v1'
});

// 配送可能な候補を抽出
const result = await ai.extractDeliverableCandidates({
  candidates: [
    { pid: 'JP-13-113-01-T07-B12-BN02-R342', label: '自宅' },
    { pid: 'JP-13-101-02-T05-B08-BN01-R201', label: '職場' },
    { pid: 'JP-27-100-03-T03-B15-BN05-R105', label: '実家' }
  ],
  carrierCode: 'dhl',
  deadline: new Date('2025-12-10T00:00:00Z'),
  recipientDID: 'did:key:user123'
});

console.log(result);
// {
//   deliverableCandidates: [
//     {
//       pid: 'JP-13-113-01-T07-B12-BN02-R342',
//       label: '自宅',
//       carrierCompatible: true,
//       aiScore: 95,
//       successProbability: 0.92,
//       previousDeliveries: 15,
//       successfulDeliveries: 14,
//       priority: 'normal'
//     },
//     {
//       pid: 'JP-13-101-02-T05-B08-BN01-R201',
//       label: '職場',
//       carrierCompatible: true,
//       aiScore: 88,
//       successProbability: 0.87,
//       previousDeliveries: 8,
//       successfulDeliveries: 7,
//       priority: 'normal'
//     }
//   ],
//   excludedCandidates: [
//     {
//       pid: 'JP-27-100-03-T03-B15-BN05-R105',
//       label: '実家',
//       carrierCompatible: false,
//       incompatibleReasons: [
//         'Carrier does not service this region',
//         'Special delivery fee required'
//       ],
//       alternativeCarriers: ['yamato', 'sagawa']
//     }
//   ]
// }
```

---

### 2. 🤖 Gift Deadline Watch AI（期限監視AI）

#### 概要 / Overview

ギフトの受取期限を監視し、期限切れを防ぐためのリマインダー送信、優先順位調整、自動キャンセルを実行する。

Monitors gift delivery deadlines and executes reminder sending, priority adjustment, and auto-cancellation to prevent expiration.

#### 主要機能 / Key Features

##### 2.1 期限リスク検出 / Expiration Risk Detection

```typescript
interface ExpirationRisk {
  /**
   * 期限切れリスクを検出
   * Detect expiration risk
   */
  detectExpirationRisk(
    orderId: string
  ): Promise<{
    risk: 'critical' | 'high' | 'medium' | 'low';
    hoursRemaining: number;
    recommendedActions: Action[];
    urgencyScore: number;  // 0-100
  }>;
}

interface Action {
  type: 'send_reminder' | 'adjust_priority' | 'escalate' | 'auto_cancel';
  description: string;
  scheduledAt?: string;
  executedAt?: string;
}
```

**リスクレベル判定 / Risk Level Determination:**

| 残り時間 / Remaining | リスクレベル / Risk Level | 緊急度スコア / Urgency Score |
|---------------------|-------------------------|----------------------------|
| 72時間以上 / 72h+ | Low | 0-25 |
| 48-72時間 / 48-72h | Medium | 26-50 |
| 24-48時間 / 24-48h | High | 51-75 |
| 24時間未満 / <24h | Critical | 76-100 |

##### 2.2 スマートリマインダー / Smart Reminder

```typescript
interface SmartReminder {
  /**
   * 最適なタイミングでリマインダーを送信
   * Send reminders at optimal timing
   */
  scheduleReminders(
    orderId: string,
    recipientPreferences: {
      preferredChannel: 'email' | 'sms' | 'push';
      timezone: string;
      quietHours?: { start: string; end: string };
    }
  ): Promise<{
    schedule: ReminderSchedule[];
  }>;
}

interface ReminderSchedule {
  reminderType: '72h' | '48h' | '24h' | '12h' | '3h' | '1h';
  scheduledAt: string;
  channel: 'email' | 'sms' | 'push';
  message: string;
  sent: boolean;
}
```

**リマインダースケジュール / Reminder Schedule:**

```
Default Schedule:
  - 72 hours before: Email
  - 48 hours before: Email + Push
  - 24 hours before: Email + SMS + Push
  - 12 hours before: SMS + Push (if not selected)
  - 3 hours before: SMS + Push + Escalation
  - 1 hour before: Final warning (all channels)
```

**最適送信時刻計算 / Optimal Send Time Calculation:**

```typescript
function calculateOptimalSendTime(
  scheduledTime: Date,
  timezone: string,
  quietHours?: { start: string; end: string }
): Date {
  // ユーザーのタイムゾーンで最適な時刻を計算
  // Calculate optimal time in user's timezone
  
  // 例: 朝8時-10時、昼12時-14時、夕方18時-20時を優先
  // Priority: 8-10am, 12-2pm, 6-8pm
  
  const optimalHours = [8, 9, 12, 13, 18, 19];
  const userTime = convertToTimezone(scheduledTime, timezone);
  
  // quietHours（就寝時間）を避ける
  // Avoid quiet hours (sleep time)
  if (quietHours) {
    if (isInQuietHours(userTime, quietHours)) {
      return adjustToNextAvailableTime(userTime, quietHours);
    }
  }
  
  return userTime;
}
```

##### 2.3 検索インデックス優先度自動調整 / Auto-Adjust Search Index Priority

```typescript
interface SearchPriorityAdjustment {
  /**
   * 期限に基づいて検索インデックスの優先度を調整
   * Adjust search index priority based on deadline
   */
  adjustSearchPriority(
    orderId: string,
    hoursRemaining: number
  ): Promise<{
    indexPriority: number;  // 0-100
    boostFactor: number;    // 1.0-10.0
    appliedAt: string;
  }>;
}
```

**優先度調整アルゴリズム / Priority Adjustment Algorithm:**

```
Index Priority = Base Priority × Boost Factor

where:
  Boost Factor = {
    1.0  if hours_remaining > 72
    2.0  if 48 < hours_remaining ≤ 72
    4.0  if 24 < hours_remaining ≤ 48
    8.0  if 12 < hours_remaining ≤ 24
    10.0 if hours_remaining ≤ 12
  }
```

#### 実装例 / Implementation Example

```typescript
import { GiftDeadlineWatchAI } from '@vey/core';

const ai = new GiftDeadlineWatchAI({
  apiKey: 'your-api-key',
  model: 'deadline-watch-v1'
});

// 期限監視を開始
const watch = await ai.startWatch({
  orderId: 'ORD-12345',
  deadline: new Date('2025-12-10T00:00:00Z'),
  recipientPreferences: {
    preferredChannel: 'email',
    timezone: 'Asia/Tokyo',
    quietHours: { start: '22:00', end: '07:00' }
  }
});

console.log(watch);
// {
//   watchId: 'WATCH-67890',
//   reminderSchedule: [
//     {
//       reminderType: '72h',
//       scheduledAt: '2025-12-07T09:00:00+09:00',
//       channel: 'email',
//       message: 'Your gift is waiting! Select delivery location within 3 days.',
//       sent: false
//     },
//     {
//       reminderType: '24h',
//       scheduledAt: '2025-12-09T09:00:00+09:00',
//       channel: 'email',
//       message: 'Urgent: Only 24 hours left to select delivery location!',
//       sent: false
//     },
//     // ... more reminders
//   ],
//   expirationRisk: {
//     risk: 'low',
//     hoursRemaining: 168,
//     urgencyScore: 15
//   }
// }

// リスク検出
const risk = await ai.detectExpirationRisk('ORD-12345');
if (risk.risk === 'critical') {
  // 緊急アクション実行
  await ai.sendUrgentReminder('ORD-12345', 'sms');
}
```

---

### 3. 🤖 Location Clustering AI（位置クラスタリングAI）

#### 概要 / Overview

受取人の候補住所を地理的に分析し、近隣の候補をグループ化して最適な選択肢のみを提示する。これにより、UI混雑を防ぎ、受取人の意思決定を支援する。

Geographically analyzes recipient's candidate addresses, groups nearby candidates, and presents only optimal options. This prevents UI clutter and assists recipient's decision-making.

#### 主要機能 / Key Features

##### 3.1 地理的クラスタリング / Geographic Clustering

```typescript
interface GeographicClustering {
  /**
   * 候補をクラスタリング
   * Cluster candidates
   */
  clusterCandidates(
    candidates: GiftDeliveryCandidate[],
    options?: {
      maxClusters?: number;      // 最大クラスタ数 / Max clusters
      radiusKm?: number;         // クラスタ半径（km）/ Cluster radius (km)
      minCandidates?: number;    // 最小候補数 / Min candidates
    }
  ): Promise<{
    clusters: CandidateCluster[];
    unclustered: GiftDeliveryCandidate[];
  }>;
}

interface CandidateCluster {
  clusterId: string;
  label: string;                       // クラスタラベル（例: "渋谷エリア"）
  candidates: GiftDeliveryCandidate[];
  center: {
    latitude: number;
    longitude: number;
    label?: string;                    // 中心点の名称（例: "渋谷駅"）
  };
  radius: number;                      // km
  optimalCandidate?: GiftDeliveryCandidate;
  clusterScore: number;                // クラスタ品質スコア (0-100)
}
```

**クラスタリングアルゴリズム / Clustering Algorithm:**

```
Algorithm: Hierarchical Agglomerative Clustering (HAC)

Steps:
1. 各候補の緯度経度を抽出
   Extract latitude/longitude for each candidate
   
2. 候補間の距離を計算（Haversine formula）
   Calculate distance between candidates (Haversine formula)
   
3. 近隣の候補をグループ化（半径内の候補を統合）
   Group nearby candidates (merge candidates within radius)
   
4. クラスタ中心を計算（候補の重心）
   Calculate cluster center (centroid of candidates)
   
5. 各クラスタから最適候補を選定
   Select optimal candidate from each cluster
```

##### 3.2 最適候補選定 / Optimal Candidate Selection

```typescript
interface OptimalCandidateSelection {
  /**
   * クラスタから最適候補を選定
   * Select optimal candidate from cluster
   */
  selectOptimalCandidate(
    cluster: CandidateCluster
  ): Promise<{
    candidate: GiftDeliveryCandidate;
    selectionReason: string;
    score: number;
  }>;
}
```

**選定基準 / Selection Criteria:**

```
Optimal Candidate Score = Weighted Sum of:
  - Success Probability (35%)
  - Accessibility (25%)
  - Delivery Speed (20%)
  - Carrier Compatibility (15%)
  - User Preference (5%)

where:
  Accessibility = (1 / distance_from_cluster_center) × proximity_to_transit
  Delivery Speed = 1 / estimated_delivery_days
  User Preference = frequency_of_use × recency_factor
```

##### 3.3 候補数最適化 / Optimize Number of Candidates

```typescript
interface CandidateOptimization {
  /**
   * 表示候補数を最適化
   * Optimize number of displayed candidates
   */
  optimizeCandidateList(
    clusters: CandidateCluster[],
    maxDisplay?: number  // デフォルト: 5
  ): Promise<{
    displayCandidates: GiftDeliveryCandidate[];
    hiddenCount: number;
    showMoreAvailable: boolean;
  }>;
}
```

**最適表示数 / Optimal Display Count:**

| 総候補数 / Total | 表示数 / Display | 理由 / Reason |
|----------------|-----------------|-------------|
| 1-3 | 全て / All | 選択肢が少ない / Few options |
| 4-10 | 5 | UI混雑回避 / Avoid UI clutter |
| 11-20 | 7 | バランス / Balance |
| 21+ | 10 | 多様性確保 / Ensure diversity |

#### 実装例 / Implementation Example

```typescript
import { LocationClusteringAI } from '@vey/core';

const ai = new LocationClusteringAI({
  apiKey: 'your-api-key',
  model: 'location-clustering-v1'
});

// 候補をクラスタリング
const result = await ai.clusterCandidates({
  candidates: [
    { pid: 'JP-13-113-01-T07-B12-BN02-R342', label: '自宅（渋谷）', lat: 35.6595, lon: 139.7004 },
    { pid: 'JP-13-113-02-T08-B15-BN03-R401', label: 'オフィス（渋谷）', lat: 35.6586, lon: 139.7016 },
    { pid: 'JP-13-101-01-T05-B08-BN01-R201', label: '職場（千代田）', lat: 35.6812, lon: 139.7671 },
    { pid: 'JP-13-101-02-T03-B20-BN05-R105', label: 'コワーキング（千代田）', lat: 35.6820, lon: 139.7650 },
    { pid: 'JP-27-100-01-T02-B05-BN02-R301', label: '実家（大阪）', lat: 34.6937, lon: 135.5023 }
  ],
  options: {
    maxClusters: 3,
    radiusKm: 2.0
  }
});

console.log(result);
// {
//   clusters: [
//     {
//       clusterId: 'CLUSTER-1',
//       label: '渋谷エリア',
//       candidates: [
//         { pid: 'JP-13-113-01-T07-B12-BN02-R342', label: '自宅（渋谷）', ... },
//         { pid: 'JP-13-113-02-T08-B15-BN03-R401', label: 'オフィス（渋谷）', ... }
//       ],
//       center: { latitude: 35.6591, longitude: 139.7010, label: '渋谷駅周辺' },
//       radius: 0.5,
//       optimalCandidate: { pid: 'JP-13-113-01-T07-B12-BN02-R342', ... },
//       clusterScore: 92
//     },
//     {
//       clusterId: 'CLUSTER-2',
//       label: '千代田エリア',
//       candidates: [
//         { pid: 'JP-13-101-01-T05-B08-BN01-R201', label: '職場（千代田）', ... },
//         { pid: 'JP-13-101-02-T03-B20-BN05-R105', label: 'コワーキング（千代田）', ... }
//       ],
//       center: { latitude: 35.6816, longitude: 139.7661, label: '東京駅周辺' },
//       radius: 0.3,
//       optimalCandidate: { pid: 'JP-13-101-01-T05-B08-BN01-R201', ... },
//       clusterScore: 88
//     }
//   ],
//   unclustered: [
//     { pid: 'JP-27-100-01-T02-B05-BN02-R301', label: '実家（大阪）', ... }
//   ]
// }

// 表示候補を最適化
const optimized = await ai.optimizeCandidateList(result.clusters, 5);
console.log(optimized);
// {
//   displayCandidates: [
//     { pid: 'JP-13-113-01-T07-B12-BN02-R342', label: '自宅（渋谷）★最適', ... },
//     { pid: 'JP-13-101-01-T05-B08-BN01-R201', label: '職場（千代田）★最適', ... },
//     { pid: 'JP-27-100-01-T02-B05-BN02-R301', label: '実家（大阪）', ... }
//   ],
//   hiddenCount: 2,
//   showMoreAvailable: true
// }
```

---

## 拡張AI機能 / Extended AI Features

### 4. 🤖 Cancel Reason AI（キャンセル理由分類AI）

#### 概要 / Overview

ギフト注文がキャンセルされた理由を自動分類し、UIに適切なメッセージを表示する。統計分析により改善提案も生成する。

Automatically classifies reasons for gift order cancellations and displays appropriate messages in the UI. Generates improvement suggestions through statistical analysis.

#### 主要機能 / Key Features

```typescript
interface CancelReasonAI {
  /**
   * キャンセル理由を自動分類
   * Automatically classify cancellation reason
   */
  classifyCancellationReason(
    orderId: string,
    context: {
      hasSelectedAddress: boolean;
      isExpired: boolean;
      userAction?: 'cancel' | 'ignore';
      remindersSent: number;
      viewCount: number;
    }
  ): Promise<{
    reason: CancellationReason;
    confidence: number;
    message: {
      sender: string;        // 送り主へのメッセージ
      recipient: string;     // 受取人へのメッセージ
    };
    retryOption?: {
      available: boolean;
      suggestedAction: string;
      newDeadline?: string;
    };
  }>;

  /**
   * キャンセル統計を分析
   * Analyze cancellation statistics
   */
  analyzeCancellationStats(
    period: { start: Date; end: Date }
  ): Promise<{
    total: number;
    byReason: Record<CancellationReason, number>;
    trends: {
      increasingReasons: string[];
      decreasingReasons: string[];
    };
    suggestions: Suggestion[];
  }>;
}

enum CancellationReason {
  ADDRESS_UNSET = 'address_unset',           // 住所未選択
  DEADLINE_EXPIRED = 'deadline_expired',     // 期限切れ
  USER_CANCELLED = 'user_cancelled',         // ユーザーキャンセル
  RECIPIENT_DECLINED = 'recipient_declined', // 受取拒否
  SYSTEM_ERROR = 'system_error',             // システムエラー
  PAYMENT_FAILED = 'payment_failed'          // 決済失敗
}

interface Suggestion {
  type: 'deadline_extension' | 'reminder_optimization' | 'ui_improvement';
  description: string;
  expectedImprovement: number;  // % improvement
  priority: 'high' | 'medium' | 'low';
}
```

#### 実装例 / Implementation Example

```typescript
import { CancelReasonAI } from '@vey/core';

const ai = new CancelReasonAI({
  apiKey: 'your-api-key'
});

// キャンセル理由を分類
const result = await ai.classifyCancellationReason('ORD-12345', {
  hasSelectedAddress: false,
  isExpired: true,
  userAction: 'ignore',
  remindersSent: 5,
  viewCount: 2
});

console.log(result);
// {
//   reason: 'deadline_expired',
//   confidence: 0.95,
//   message: {
//     sender: 'Your gift expired because the recipient did not select a delivery location in time.',
//     recipient: 'This gift has expired. Contact the sender if you still want to receive it.'
//   },
//   retryOption: {
//     available: true,
//     suggestedAction: 'Extend deadline by 3 days and resend notification',
//     newDeadline: '2025-12-13T00:00:00Z'
//   }
// }
```

---

### 5. 🤖 Smart Address Suggestion AI（スマート住所提案AI）

#### 概要 / Overview

受取人の行動パターン、現在位置、過去の受取履歴を分析し、最適な受取場所を提案する。

Analyzes recipient's behavior patterns, current location, and past delivery history to suggest the optimal delivery location.

#### 主要機能 / Key Features

```typescript
interface SmartAddressSuggestionAI {
  /**
   * 最適な受取場所を提案
   * Suggest optimal delivery location
   */
  suggestOptimalLocation(
    recipientDID: string,
    context: {
      currentTime: Date;
      currentLocation?: { latitude: number; longitude: number };
      deliveryTimeframe: { start: Date; end: Date };
    }
  ): Promise<{
    suggestions: LocationSuggestion[];
    reasoning: string;
  }>;
}

interface LocationSuggestion {
  pid: string;
  label: string;
  score: number;  // 0-100
  reasons: string[];
  availability: {
    likely: boolean;
    confidence: number;
  };
}
```

**提案アルゴリズム / Suggestion Algorithm:**

```
Suggestion Score = Weighted Sum of:
  - Temporal Availability (30%)     // 時間帯の在宅確率
  - Distance from Current (25%)     // 現在地からの距離
  - Historical Preference (20%)     // 過去の選択傾向
  - Delivery Success Rate (15%)     // 配送成功率
  - Convenience Factor (10%)        // 利便性（コンビニ、ロッカー等）
```

---

### 6. 🤖 Delivery Time Optimization AI（配送時間最適化AI）

#### 概要 / Overview

受取人のスケジュール、生活パターン、交通状況を分析し、最適な配達時間帯を提案する。

Analyzes recipient's schedule, lifestyle patterns, and traffic conditions to suggest the optimal delivery time window.

#### 主要機能 / Key Features

```typescript
interface DeliveryTimeOptimizationAI {
  /**
   * 最適な配達時間帯を提案
   * Suggest optimal delivery time window
   */
  suggestOptimalDeliveryTime(
    recipientDID: string,
    deliveryDate: Date
  ): Promise<{
    optimalWindows: TimeWindow[];
    reasoning: string;
  }>;
}

interface TimeWindow {
  start: string;  // HH:mm
  end: string;    // HH:mm
  score: number;  // 0-100
  receiveProbability: number;  // 0-1
  factors: {
    weekdayPattern: number;
    holidayPattern: number;
    trafficCondition: number;
  };
}
```

**最適化アルゴリズム / Optimization Algorithm:**

```
Time Window Score = Weighted Sum of:
  - Historical Availability (40%)   // 過去の在宅パターン
  - Traffic Condition (25%)         // 交通状況
  - Weather Forecast (15%)          // 天気予報
  - Holiday/Weekend Factor (10%)    // 休日・週末要因
  - Carrier Preference (10%)        // キャリア推奨時間帯
```

---

## まとめ / Summary

### AI機能の相互作用 / AI Features Interaction

```
┌─────────────────────────────────────────────────────────┐
│                  AI機能統合フロー                         │
│              Integrated AI Features Flow                 │
└─────────────────────────────────────────────────────────┘

受取場所選択画面
Delivery Location Selection Screen
        │
        ├─► 🤖 Carrier Intent AI
        │   └─► 配送可能な候補を抽出
        │       Extract deliverable candidates
        │
        ├─► 🤖 Location Clustering AI
        │   └─► 近隣候補をグループ化
        │       Group nearby candidates
        │
        ├─► 🤖 Smart Address Suggestion AI
        │   └─► 最適な受取場所を提案
        │       Suggest optimal location
        │
        └─► 🤖 Delivery Time Optimization AI
            └─► 最適な配達時間を提案
                Suggest optimal delivery time

期限監視プロセス
Deadline Monitoring Process
        │
        └─► 🤖 Gift Deadline Watch AI
            ├─► リマインダー送信
            │   Send reminders
            ├─► 優先度調整
            │   Adjust priority
            └─► 期限切れ検出
                Detect expiration
                    │
                    └─► 🤖 Cancel Reason AI
                        └─► キャンセル理由を分類
                            Classify cancellation reason
```

### 主要な利点 / Key Benefits

1. **最適な受取体験 / Optimal Delivery Experience**
   - AI支援により最適な受取場所を簡単に選択
   - 配送成功確率の向上

2. **期限切れ防止 / Prevent Expiration**
   - スマートリマインダーによる期限切れリスク低減
   - 自動優先度調整で緊急性を可視化

3. **UI/UX改善 / Improved UI/UX**
   - クラスタリングによりUI混雑を回避
   - 候補数の最適化で意思決定を支援

4. **データ駆動型改善 / Data-Driven Improvement**
   - キャンセル理由分析による継続的な改善
   - 統計データに基づく提案生成

5. **グローバル対応 / Global Applicability**
   - 地域特性を考慮したAI学習
   - マルチリージョン・マルチキャリア対応
