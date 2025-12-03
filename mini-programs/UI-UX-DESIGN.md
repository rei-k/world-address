# UI/UX 設計 - 検索・スキャン中心の思想 / UI/UX Design - Search & Scan Philosophy

このドキュメントは、Alipay Mini Program と WeChat Mini Program における革新的なUI/UX設計を定義します。

**設計コンセプト**: 「Searchable. Scannable. Revocable. Compatible.」

---

## 1. 設計思想 / Design Philosophy

### 核心原則 / Core Principles

**住所は書かせない。入力させない。**

すべての操作を以下の4動作だけで完結:

1. **Search** - 検索
2. **Scan** - スキャン
3. **Select** - 選択
4. **Confirm** - 確認

### 情報の扱い方 / Information Handling

- **検索のみ**: 住所入力UIは存在しない
- **スキャン**: QR/NFCで情報取得
- **トークン参照**: 決済情報の入力UIも存在しない
- **提出権管理**: 生データではなく権限のみ扱う

---

## 2. 左サイドメニュー / Left Side Menu

友達ギフト中心の設計。自分の情報はメニューにも画面にも表示しない。

### メニュー構成 / Menu Structure

```typescript
interface SideMenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

const menuItems: SideMenuItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: 'clock-history', // 最近の操作
    route: '/overview'
  },
  {
    id: 'addresses',
    label: 'Addresses',
    icon: 'location-pin', // Default と友達住所のみ
    route: '/addresses'
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: 'credit-card', // 決済トークン選択
    route: '/payments'
  },
  {
    id: 'contacts',
    label: 'Contacts',
    icon: 'people', // 友達追加/グループ
    route: '/contacts'
  },
  {
    id: 'gifts',
    label: 'Gifts',
    icon: 'gift-tag', // Pending受取設定の管理
    route: '/gifts'
  },
  {
    id: 'waybills',
    label: 'Waybills',
    icon: 'document-qr', // 生成伝票プレビュー/復元
    route: '/waybills'
  },
  {
    id: 'permissions',
    label: 'Permissions',
    icon: 'shield-lock', // 解除だけ管理
    route: '/permissions'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'gear', // 国/言語/スキャン設定
    route: '/settings'
  }
];
```

### アイコンガイドライン / Icon Guidelines

**参考デザイン**:
- Google Wallet のカード風アイコン
- NFC のシンプル波アイコン
- Amazon Gift Card のようなギフトタグアイコン

**原則**:
- アイコン + 短いラベルのみ
- 認知負荷を削る
- 直感的な理解

---

## 3. ホーム画面 / Home Screen

**役割**: シンプルな開始点。フォームもステータスも長文も置かない。

### UI構成 / UI Layout

```typescript
interface HomeScreen {
  // 上部: スキャンボタン（最優先アクション）
  scanButton: {
    type: 'QR' | 'NFC';
    label: 'Scan';
    aiPrediction: boolean; // AIが用途を推測して適切な画面へ
  };
  
  // その下: 住所検索ボタン（直通）
  searchButton: {
    label: 'Search Address';
    directRoute: '/search-address';
  };
  
  // その他はなし
  noOtherElements: true;
}
```

### キーアクション / Key Actions

1. **Scan ボタン（QR/NFC）**
   - 用途を推測しAIが適切な次画面を開く
   - 友達の受取設定 / 追跡情報 / 住所共有を自動判別

2. **Search Address ボタン**
   - 住所検索画面へ直通
   - 友達住所のみ検索

### TypeScript定義 / TypeScript Definition

```typescript
interface HomeScreenState {
  scanMode: 'QR' | 'NFC' | null;
  scanResult?: ScanResult;
  aiPrediction?: AIPrediction;
}

interface ScanResult {
  type: 'GIFT_RECEIPT' | 'ADDRESS_SHARE' | 'TRACKING' | 'UNKNOWN';
  data: string;
  timestamp: Date;
}

interface AIPrediction {
  intent: 'GIFT_SETUP' | 'TRACKING' | 'FRIEND_ADD' | 'PAYMENT';
  confidence: number;
  nextScreen: string;
}
```

---

## 4. 住所検索画面 / Address Search Screen

**役割**: 友達住所のみ検索。縦一列で候補だけ。

### レイアウト / Layout

```typescript
interface AddressSearchScreen {
  // 検索ボックス
  searchBox: {
    placeholder: '名前 / 国 / タグ / グループ';
    filters: SearchFilters;
  };
  
  // 住所候補リスト（縦一列）
  addressList: {
    defaultAddress: FriendAddress; // 常に最上位にピン固定
    friendAddresses: FriendAddress[];
    layout: 'vertical-list';
  };
  
  // 選択後の遷移
  selectionFlow: {
    onSelect: 'ADDRESS_SELECT';
    next: 'PAYMENT_TOKEN_SELECT';
    then: 'GIFT_SETTING_CONFIRM';
  };
}

interface SearchFilters {
  name?: string;
  country?: string;
  tags?: string[];
  group?: string;
}

interface FriendAddress {
  pid: string;
  friendId: string;
  friendName: string;
  displayName: string; // 簡略表示（詳細は非表示）
  tags: string[];
  isDefault: boolean; // Default住所フラグ
  verified: boolean; // PID照合確定済み
  lastUsed?: Date;
}
```

### 操作フロー / Operation Flow

1. **検索ボックス入力**
   - 名前、国、タグ、グループで絞り込み
   - リアルタイム候補表示

2. **Default住所**
   - 常に最上位にピン固定
   - 太字または異なる背景色で強調

3. **友達住所候補**
   - Default住所の下に縦一列表示
   - 簡略表示のみ（生住所は表示されない）

4. **選択動作**
   - 選択した瞬間、内部でPID照合確定
   - 次画面（決済トークン選択）へ自動遷移

### 遷移順序 / Transition Order

```
Address select 
  → Payment Token select 
    → Gift Setting confirm
```

---

## 5. 支払いトークン選択画面 / Payment Token Selection Screen

**役割**: 住所と決済を完全分離。ID/トークンだけ表示。

### UI構成 / UI Layout

```typescript
interface PaymentTokenScreen {
  // クラウド保存された支払いID候補のみ
  savedTokens: PaymentToken[];
  
  // AIが最上位に1つだけ圧縮
  recommendedToken: PaymentToken | null;
  
  // カード番号入力欄は存在しない
  noCardInput: true;
  
  // 検索しかできない
  searchOnly: true;
}

interface PaymentToken {
  tokenId: string;
  type: 'ALIPAY_BALANCE' | 'WECHAT_PAY' | 'BANK_CARD' | 'CREDIT_CARD';
  lastFourDigits?: string; // 下4桁のみ
  displayName: string;
  icon: string;
  isRecommended: boolean; // AIによる推薦
  linkedAddressPID?: string; // 住所との紐付け
  usageFrequency: number;
}
```

### 特徴 / Features

1. **トークンID参照のみ**
   - カード番号は一切表示されない
   - 検索しかできない

2. **AI推薦**
   - よく使うトークンを最上位に1つだけ圧縮
   - 住所との関連性を考慮

3. **完全分離**
   - 住所と決済は完全に分離
   - ID/トークンだけで管理

---

## 6. ギフト受取設定画面（友達側）/ Gift Receipt Setting Screen (Friend Side)

**役割**: 友達が受取場所を選択。期限内に行わないと失効。

### UI構成 / UI Layout

```typescript
interface GiftReceiptScreen {
  // 受取期限ゲージ
  deadlineGauge: {
    remainingDays: number;
    remainingHours: number;
    progressBar: number; // 0-100%
    urgentWarning: boolean; // 24時間以内
  };
  
  // 受け取る場所の候補（クラスタ圧縮済み）
  pickupLocations: PickupLocation[];
  
  // 確定ボタンのみ
  confirmButton: {
    label: '場所を選択して確定';
    enabled: boolean;
  };
}

interface PickupLocation {
  pid: string;
  type: 'CONVENIENCE_STORE' | 'AIRPORT' | 'HOME' | 'OFFICE' | 'LOCKER';
  displayName: string;
  examples: string[]; // "FamilyMart", "Narita Airport"
  clustered: boolean; // クラスタ圧縮されているか
  estimatedDelivery: Date;
}
```

### 具体例 / Examples

**受取場所候補**:
- FamilyMart 店舗受け取り
- Narita Airport
- Home (Default住所)
- Office
- コンビニロッカー

### 期限管理 / Deadline Management

```typescript
interface DeadlineManagement {
  // 期限切れ前の自動誘導
  autoGuidance: {
    trigger: '24_HOURS_BEFORE';
    action: 'SEND_REMINDER';
    notification: {
      push: true;
      sms: true;
      email: true;
    };
  };
  
  // 期限切れ時の自動処理
  expiredFlow: {
    action: 'AUTO_CANCEL';
    steps: [
      'CANCEL_ORDER',
      'REFUND_PAYMENT',
      'REVOKE_SUBMISSION_RIGHTS',
      'NOTIFY_SENDER'
    ];
  };
}
```

### 離脱防止 / Exit Prevention

**場所を選ばず離脱しそうなとき**:
1. 期限切れ前にAIがキャンセル導線を自動で誘導
2. キャンセル確定 → 提出権は自動失効

---

## 7. Waybillプレビュー画面 / Waybill Preview Screen

**役割**: 送信者には「送付できる」情報だけを見せる。

### UI構成 / UI Layout

```typescript
interface WaybillPreviewScreen {
  // 宛先PIDの一致
  recipientPID: {
    pid: string;
    verified: boolean;
    displayName: string; // 簡略表示
  };
  
  // PaymentトークンID
  paymentToken: {
    tokenId: string;
    displayName: string;
  };
  
  // 送り状のハッシュ追跡ID
  trackingHash: {
    hash: string;
    qrCode: string; // QRコード
    zkProof: boolean; // ZKなしでも検証できる構造
  };
  
  // 互換性チェック結果
  compatibility: {
    addressCompatible: boolean;
    carrierCompatible: boolean;
    message?: string;
  };
}
```

### UI強化 / UI Enhancement

1. **住所互換NGならこの画面でストップ**
   - 配送不可地域の場合、エラー表示
   - 代替案を提示

2. **予測された正しい送り状構造だけPreview**
   - AIが検証した送り状のみ表示
   - 改ざん検知

```typescript
interface CompatibilityCheck {
  result: 'COMPATIBLE' | 'INCOMPATIBLE' | 'WARNING';
  reasons: string[];
  
  stopConditions: {
    addressIncompatible: boolean;
    carrierUnavailable: boolean;
    prohibitedItem: boolean;
  };
  
  alternatives?: {
    suggestedCarrier?: string;
    suggestedLocation?: string;
  };
}
```

---

## 8. 解除（Permissions）画面 / Revocation (Permissions) Screen

**役割**: 解除理由の候補だけをAIで抽出。解除したサイトは検索に二度と出ない。

### UI構成 / UI Layout

```typescript
interface PermissionsScreen {
  // 提出権限リスト
  activePermissions: Permission[];
  revokedPermissions: Permission[];
  
  // 解除アクション
  revokeButton: {
    label: '提出権を解除';
    confirm: boolean; // 確認ダイアログ
  };
  
  // AI抽出の解除理由候補
  revocationReasons: RevocationReason[];
}

interface Permission {
  permissionId: string;
  partnerId: string;
  partnerName: string;
  addressPID: string;
  paymentTokenId?: string;
  grantedAt: Date;
  status: 'ACTIVE' | 'REVOKED';
  lastUsed?: Date;
}

interface RevocationReason {
  id: string;
  label: string;
  aiSuggested: boolean; // AIが抽出した理由
  examples: string[];
}
```

### 解除理由の例 / Revocation Reason Examples

AIが抽出する候補:
- "サービスを使わなくなった"
- "プライバシー上の理由"
- "引越しした"
- "不正アクセスの疑い"
- "その他"

### ガード機能 / Guard Features

```typescript
interface RevocationGuard {
  // 解除したサイトは検索に二度と出ない
  searchExclusion: {
    partnerId: string;
    permanentBlock: true;
    reason: 'USER_REVOKED';
  };
  
  // 失効住所の誤送信防止
  preventMisship: {
    indexRemoval: boolean; // インデックスから削除
    cacheInvalidation: boolean; // キャッシュ無効化
    submissionKeyInvalidation: boolean; // 提出キー無効化
  };
  
  // UIで明示
  uiIndication: {
    revokedBadge: boolean;
    searchExcluded: boolean;
    preventResubmission: boolean;
  };
}
```

---

## 9. 具体的なUX改善ポイント / Specific UX Improvements

### 1. 住所は入力→登録→提出を別工程に見せない

**すべてスキャン/検索/選択/ハッシュID確認だけで進む導線**

```typescript
interface SimplifiedFlow {
  steps: [
    'SCAN_OR_SEARCH',    // スキャンまたは検索
    'SELECT',            // 選択
    'CONFIRM_HASH_ID'    // ハッシュID確認
  ];
  
  noSeparateSteps: {
    noInputForm: true;
    noRegistrationStep: true;
    noSubmissionStep: true;
  };
}
```

### 2. 失効/解除は削除ではなく権限失効のみ

```typescript
interface RevocationNotDeletion {
  action: 'REVOKE_PERMISSION'; // 削除ではなく失効
  
  preserved: {
    historyRecord: boolean; // 履歴は保持
    auditLog: boolean; // 監査ログ保持
  };
  
  revoked: {
    accessPermission: boolean; // アクセス権限のみ失効
    searchVisibility: boolean; // 検索候補から除外
    submissionRight: boolean; // 提出権のみ無効化
  };
}
```

### 3. 画面内分岐を減らし、操作ごとに1つの選択肢画面だけ開く

**一画面一アクション原則**:

```typescript
interface OneScreenOneAction {
  principle: 'ONE_SCREEN_ONE_ACTION';
  
  examples: {
    addressSearch: {
      action: 'SEARCH_AND_SELECT';
      noBranching: true;
    };
    paymentSelect: {
      action: 'SELECT_TOKEN';
      noBranching: true;
    };
    giftSetup: {
      action: 'CHOOSE_LOCATION';
      noBranching: true;
    };
  };
}
```

### 4. 国や言語の並び順の違いは内部PID化で吸収

**UIで不整合を出さない**:

```typescript
interface PIDNormalization {
  // 内部ではすべてPID化
  internalRepresentation: 'PID';
  
  // UI表示時に変換
  displayConversion: {
    fromPID: (pid: string) => DisplayAddress;
    toPID: (displayAddress: DisplayAddress) => string;
  };
  
  // 国/言語の違いを吸収
  localization: {
    country: string;
    language: string;
    format: AddressFormat;
  };
  
  // UIで不整合なし
  noInconsistency: true;
}

interface DisplayAddress {
  country: string;
  region: string;
  locality: string;
  formatted: string; // ユーザー言語でフォーマット
}
```

---

## 10. 1語のコンセプト / One-Word Concept

**「Searchable. Scannable. Revocable. Compatible.」**

### 各コンセプトの実装 / Implementation of Each Concept

```typescript
interface CoreConcepts {
  searchable: {
    description: '検索可能';
    implementation: {
      addressSearch: boolean;
      friendSearch: boolean;
      paymentTokenSearch: boolean;
      waybillSearch: boolean;
    };
  };
  
  scannable: {
    description: 'スキャン可能';
    implementation: {
      qrCode: boolean;
      nfc: boolean;
      aiIntentPrediction: boolean;
    };
  };
  
  revocable: {
    description: '取消可能';
    implementation: {
      permissionRevocation: boolean;
      searchExclusion: boolean;
      autoExpiration: boolean;
    };
  };
  
  compatible: {
    description: '互換性保証';
    implementation: {
      addressCompatibility: boolean;
      carrierCompatibility: boolean;
      pidNormalization: boolean;
    };
  };
}
```

---

## 11. ナビゲーションフロー / Navigation Flow

### 主要フロー / Primary Flows

```typescript
interface NavigationFlows {
  // ギフト送信フロー
  giftSending: [
    'HOME',
    'ADDRESS_SEARCH',
    'PAYMENT_SELECT',
    'GIFT_SETUP',
    'WAYBILL_PREVIEW'
  ];
  
  // ギフト受取フロー（友達側）
  giftReceiving: [
    'SCAN_QR_NFC',
    'GIFT_RECEIPT_SETUP',
    'CONFIRM'
  ];
  
  // 追跡フロー
  tracking: [
    'HOME',
    'WAYBILLS',
    'WAYBILL_PREVIEW'
  ];
  
  // 権限管理フロー
  permissions: [
    'HOME',
    'PERMISSIONS',
    'REVOKE_CONFIRM'
  ];
}
```

### フロー図 / Flow Diagram

```
Home
├── Scan → AI Intent Prediction → 適切な画面
├── Search Address → Payment Select → Gift Setup → Waybill Preview
│
Menu
├── Overview → 最近の操作一覧
├── Addresses → Default + 友達住所（検索のみ）
├── Payments → トークン選択（検索のみ）
├── Contacts → 友達追加/グループ
├── Gifts → Pending受取設定の管理
├── Waybills → 生成伝票プレビュー/復元
├── Permissions → 解除管理
└── Settings → 国/言語/スキャン設定
```

---

## 12. TypeScript型定義まとめ / TypeScript Type Definitions Summary

### 画面状態型 / Screen State Types

```typescript
// ホーム画面
interface HomeScreenState {
  scanMode: 'QR' | 'NFC' | null;
  scanResult?: ScanResult;
  aiPrediction?: AIPrediction;
}

// 住所検索画面
interface AddressSearchScreenState {
  searchQuery: string;
  filters: SearchFilters;
  results: FriendAddress[];
  selectedAddress: FriendAddress | null;
}

// 決済選択画面
interface PaymentSelectScreenState {
  tokens: PaymentToken[];
  selectedToken: PaymentToken | null;
  recommendedToken: PaymentToken | null;
}

// ギフト受取設定画面
interface GiftReceiptScreenState {
  giftId: string;
  deadline: Date;
  remainingTime: {
    days: number;
    hours: number;
    minutes: number;
  };
  pickupLocations: PickupLocation[];
  selectedLocation: PickupLocation | null;
}

// Waybillプレビュー画面
interface WaybillPreviewScreenState {
  waybillNumber: string;
  recipientPID: string;
  paymentTokenId: string;
  trackingHash: string;
  qrCode: string;
  compatibility: CompatibilityCheck;
}

// 権限管理画面
interface PermissionsScreenState {
  activePermissions: Permission[];
  revokedPermissions: Permission[];
  selectedPermission: Permission | null;
  revocationReasons: RevocationReason[];
}
```

### データモデル型 / Data Model Types

```typescript
// 友達住所
interface FriendAddress {
  pid: string;
  friendId: string;
  friendName: string;
  displayName: string;
  tags: string[];
  isDefault: boolean;
  verified: boolean;
  lastUsed?: Date;
}

// 決済トークン
interface PaymentToken {
  tokenId: string;
  type: 'ALIPAY_BALANCE' | 'WECHAT_PAY' | 'BANK_CARD' | 'CREDIT_CARD';
  lastFourDigits?: string;
  displayName: string;
  icon: string;
  isRecommended: boolean;
  linkedAddressPID?: string;
  usageFrequency: number;
}

// 受取場所
interface PickupLocation {
  pid: string;
  type: 'CONVENIENCE_STORE' | 'AIRPORT' | 'HOME' | 'OFFICE' | 'LOCKER';
  displayName: string;
  examples: string[];
  clustered: boolean;
  estimatedDelivery: Date;
}

// 権限
interface Permission {
  permissionId: string;
  partnerId: string;
  partnerName: string;
  addressPID: string;
  paymentTokenId?: string;
  grantedAt: Date;
  status: 'ACTIVE' | 'REVOKED';
  lastUsed?: Date;
}
```

---

## 13. AI機能統合 / AI Integration

### AIが担う役割 / AI Responsibilities

```typescript
interface AICapabilities {
  // スキャン意図予測
  intentPrediction: {
    input: ScanResult;
    output: AIPrediction;
    confidence: number;
  };
  
  // 決済トークン推薦
  paymentRecommendation: {
    input: {
      addressPID: string;
      userHistory: PaymentHistory[];
    };
    output: PaymentToken;
    reason: string;
  };
  
  // 受取場所クラスタ圧縮
  locationClustering: {
    input: PickupLocation[];
    output: PickupLocation[]; // 圧縮済み
    method: 'GEOGRAPHIC_PROXIMITY';
  };
  
  // 互換性チェック
  compatibilityCheck: {
    input: {
      addressPID: string;
      carrierId: string;
    };
    output: CompatibilityCheck;
    autoFix: boolean;
  };
  
  // 解除理由抽出
  revocationReasonExtraction: {
    input: {
      permissionHistory: Permission[];
      userBehavior: UserBehavior[];
    };
    output: RevocationReason[];
    topN: number;
  };
}
```

---

## 14. セキュリティとプライバシー / Security and Privacy

### プライバシー保護原則 / Privacy Protection Principles

```typescript
interface PrivacyProtection {
  // 生住所の非表示
  noRawAddress: {
    displayPIDOnly: boolean;
    simplifiedDisplay: boolean;
    noDetailedAddress: boolean;
  };
  
  // 決済情報の保護
  noCardNumbers: {
    tokenIDOnly: boolean;
    lastFourDigitsOnly: boolean;
    noInputForm: boolean;
  };
  
  // 提出権のみ扱う
  submissionRightsOnly: {
    noRawData: boolean;
    signedTokens: boolean;
    expirationManagement: boolean;
  };
}
```

### セキュリティ機能 / Security Features

```typescript
interface SecurityFeatures {
  // 失効管理
  revocation: {
    threeLayerRemoval: [
      'CACHE_INVALIDATION',
      'INDEX_REMOVAL',
      'SUBMISSION_KEY_INVALIDATION'
    ];
    permanentBlock: boolean;
  };
  
  // 監査ログ
  auditLog: {
    allActions: boolean;
    timestamp: boolean;
    userIP: boolean;
    deviceInfo: boolean;
  };
  
  // 暗号化
  encryption: {
    endToEnd: boolean;
    algorithm: 'AES-256';
    transport: 'TLS-1.3';
  };
}
```

---

## 15. まとめ / Summary

### システムの特徴 / System Characteristics

1. **入力不要**: 住所・決済情報の入力フォームが存在しない
2. **検索中心**: すべて検索とスキャンで完結
3. **提出権管理**: 生データではなく権限のみ扱う
4. **失効の徹底**: 解除されたデータは3層から即座に排除
5. **AI統合**: すべての操作でAIがサポート

### UXの破綻防止 / UX Failure Prevention

- **Pending Destination**: 受取場所確定まで発送しない
- **期限管理**: 自動キャンセルと通知
- **互換性チェック**: 事前に配送可否を判定
- **失効の伝播**: 3層からの即座な排除

### インフラ級の体験 / Infrastructure-Grade Experience

このシステムは、規模・信頼性・速度の全てにおいてインフラレベルの品質を実現します。

情報をスキャンして検索して選んで提出権だけ扱い、解除も権限のみ管理する――この一貫した設計により、サービスの破綻を防ぎ、世界最高水準のユーザー体験を提供します。

---

## 関連ドキュメント / Related Documents

- [Alipay Screen Structure](./alipay/docs/SCREEN-STRUCTURE.md)
- [Alipay UX Flow](./alipay/docs/UX-FLOW.md)
- [WeChat Documentation](./wechat/docs/README.md)
- [Common Module](./common/docs/README.md)

---

## ライセンス / License

MIT License
