# Alipay Mini Program 画面構成 / Screen Structure

このドキュメントでは、Alipay Mini ProgramにおけるVEY（Veyform）システムの完全な画面構成と機能を説明します。

住所入力UIを完全に廃し、検索・トークン参照・期限管理による革新的なUX設計を実現します。

---

## 設計コンセプト / Design Concept

### 核心原則 / Core Principles

1. **住所入力UI廃止** - 検索のみで住所確定
2. **提出権パッケージ** - 生住所ではなく提出権限のみ扱う
3. **トークンID参照** - カード番号入力UIなし
4. **期限内受取設定** - 友達が期限内に受取場所選択
5. **完全なIndex排除** - 解除後は検索候補から即削除

### システムの流れ / System Flow

```
ECサイトでギフト選択
    ↓
Vey Wallet起動
    ↓
友達住所検索（クラウド保存済みのみ）
    ↓
提出権パッケージ自動生成
    ↓
決済（トークンID選択のみ）
    ↓
Waybill生成（Pending Destination）
    ↓
友達へリンク/QR/NFC送付
    ↓
友達が期限内に受取場所選択
    ↓
最終Waybill生成 → キャリア提出
    ↓
追跡 / 提出権解除
```

---

## 画面構成 / Screen Structure

### 1. Home (ホーム画面)

**役割**: 検索中心のスタート画面

#### UI要素

1. **検索バー**
   - 友達住所の名前検索
   - 国/地域/タグでフィルタ
   - リアルタイム候補表示

2. **QR/NFCスキャン入口**
   - ギフト受取設定への直通リンク
   - 友達の期限受取設定画面へ即遷移
   - 住所実データは含まず、署名付き提出権のみ

3. **提出履歴セクション**
   - Default住所の提出履歴表示
   - 最速候補が上位に表示
   - 最近使用した住所候補

4. **クイックアクション**
   - 新規ギフト送信
   - 受取場所設定（自分宛て）
   - 追跡中のギフト一覧

#### 機能

- **スキャン後の意図分類AI**: QR/NFCスキャン直後に用途/文脈/操作先シーンを即分類
- **候補最適化**: よく使われる受取先を1画面分に圧縮表示
- **高速アクセス**: Default住所の提出履歴から最速候補を上位表示

#### TypeScript インターフェース

```typescript
interface HomeScreenState {
  searchQuery: string;
  recentAddresses: AddressSubmissionHistory[];
  quickActions: QuickAction[];
  scanMode: 'QR' | 'NFC' | null;
}

interface AddressSubmissionHistory {
  pid: string;
  friendName: string;
  lastUsed: Date;
  frequency: number;
  tags: string[];
}

interface QuickAction {
  type: 'NEW_GIFT' | 'SET_PICKUP' | 'TRACK_GIFTS';
  label: string;
  icon: string;
  route: string;
}
```

---

### 2. Cloud Address Search (クラウド住所検索)

**役割**: 友達住所のみ検索表示（自己住所UIは出さない）

#### UI要素

1. **検索フィルタ**
   - 国/地域選択
   - 名前検索
   - タグフィルタ（家族、友人、仕事など）

2. **住所候補リスト**
   - 友達の保存済み住所のみ表示
   - PID一致検証は裏でAIが保証
   - クラスタ圧縮表示（近い受取地点をグループ化）

3. **選択ボタン**
   - 住所選択 → 提出権パッケージ生成
   - Checkoutへ進む

#### 機能

- **友達住所のみ検索**: 自己住所は表示されない設計
- **PID一致検証AI**: 異なる表記でも同一住所を自動判定
- **地域クラスタ圧縮**: 近い受取地点をAIが自動グルーピング
- **提出権パッケージ自動生成**: 選択後、裏で提出権限トークン生成

#### TypeScript インターフェース

```typescript
interface CloudAddressSearchState {
  filters: AddressSearchFilters;
  results: FriendAddress[];
  selectedAddress: FriendAddress | null;
  clusters: AddressCluster[];
}

interface AddressSearchFilters {
  country?: string;
  region?: string;
  name?: string;
  tags?: string[];
}

interface FriendAddress {
  pid: string;
  friendId: string;
  friendName: string;
  displayName: string; // 表示用の簡略名（詳細は非表示）
  tags: string[];
  lastUsed?: Date;
  verified: boolean; // PID検証済みフラグ
}

interface AddressCluster {
  clusterId: string;
  centerPID: string;
  addresses: FriendAddress[];
  region: string;
  usageFrequency: number;
}
```

---

### 3. Payment Select (決済選択)

**役割**: クラウドに保存されたStored Payment Tokensから提出権トークンだけ選択

#### UI要素

1. **決済トークンリスト**
   - 保存済みトークンのみ表示
   - カード下4桁のみ表示（セキュリティ）
   - 住所に紐づく高頻度の決済候補を1つだけ上に圧縮

2. **デフォルト決済**
   - 最頻使用の決済方法を自動選択
   - ワンタップで決済完了

3. **番号入力UIなし**
   - カード番号入力フォームは一切表示されない
   - ID/トークン提出のみ

#### 機能

- **トークンID参照のみ**: カード番号を一切扱わない
- **住所連動AI**: 選択した住所に最適な決済候補を自動推薦
- **Alipay統合**: 支付宝残高、銀聯カード、クレジットカードトークン
- **芝麻信用連携**: 信用スコアに基づく特典提供

#### TypeScript インターフェース

```typescript
interface PaymentSelectState {
  tokens: PaymentToken[];
  selectedToken: PaymentToken | null;
  recommendedToken: PaymentToken | null; // 住所に紐づく推薦
  sesameCreditScore?: number;
}

interface PaymentToken {
  tokenId: string;
  type: 'ALIPAY_BALANCE' | 'BANK_CARD' | 'CREDIT_CARD';
  lastFourDigits?: string;
  expiryDate?: string;
  isDefault: boolean;
  linkedAddressPID?: string; // 住所との紐付け
  usageFrequency: number;
}

interface PaymentResult {
  success: boolean;
  transactionId: string;
  timestamp: Date;
  submissionRights: SubmissionRightsPackage;
}
```

---

### 4. Gift Setting (Pending) (ギフト設定 - 保留中)

**役割**: 友達の受取期限設定画面へ遷移できるURL/QRとして保存

#### UI要素

1. **期限設定**
   - 受取場所選択の期限日時設定
   - デフォルト: 7日間

2. **共有オプション**
   - URL/QRコード生成
   - WeChat、SMS、メール共有
   - NFCタグ書き込み

3. **期限表示**
   - カウントダウンタイマー
   - 期限切れアラート

4. **受取場所選択（友達側）**
   - 期限内に受取場所を選択
   - 複数候補から選択可能
   - 期限切れ → 注文キャンセル

#### 機能

- **Pending Destination**: Waybill生成時の宛先は「Pending」として停止
- **期限監視AI**: 期限が近づくと友達側へ優先通知
- **自動キャンセル**: 期限内に選択なし → 注文キャンセル → Revocation & Index排除が同時実行
- **誤送信防止**: 先に発送に進ませないガード設計

#### TypeScript インターフェース

```typescript
interface GiftSettingState {
  giftId: string;
  recipientPID: string;
  deadline: Date;
  status: 'PENDING' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';
  shareOptions: ShareOption[];
  selectedPickupLocation?: string;
}

interface ShareOption {
  type: 'URL' | 'QR' | 'NFC' | 'WECHAT' | 'SMS' | 'EMAIL';
  data: string;
  generatedAt: Date;
}

interface PendingGiftLink {
  linkId: string;
  giftId: string;
  expiryDate: Date;
  submissionRights: string; // 署名付き提出権
  usageId: string; // 用途ID
  // 住所実データは含まない
}
```

---

### 5. Waybill Preview (送り状プレビュー)

**役割**: そのECのキャリア互換判定がAIで通った送り状だけ表示

#### UI要素

1. **送り状情報**
   - 送り状番号（一意Nonce付き）
   - ハッシュで追跡可能
   - キャリア名（DHL、SF Express など）

2. **キャリアQRコード**
   - キャリア提出用QR復元
   - 配達員スキャン用
   - オフライン表示可能

3. **配送状態**
   - Pending（受取場所未確定）
   - Ready for Shipment（配送準備完了）
   - In Transit（配送中）
   - Delivered（配達完了）

4. **アクション**
   - QRコード保存
   - 追跡情報共有
   - 送り状コピー

#### 機能

- **キャリア互換判定AI**: ECのキャリア互換性をAIが事前検証
- **Pending状態管理**: 受取場所確定まで「Pending Destination」
- **送り状改ざん耐性AI**: ハッシュと署名構造の検証
- **QR復元機能**: Alipay Wallet内でQRコード再生成

#### TypeScript インターフェース

```typescript
interface WaybillPreviewState {
  waybillNumber: string;
  nonce: string; // 一意性保証
  hash: string; // 追跡用ハッシュ
  carrier: CarrierInfo;
  status: WaybillStatus;
  qrCode: string;
  shipmentDetails: ShipmentDetails;
}

interface CarrierInfo {
  carrierId: 'DHL' | 'SF_EXPRESS' | 'JD_LOGISTICS' | 'YTO_EXPRESS' | 'ZTO_EXPRESS';
  name: string;
  trackingUrl: string;
  compatibilityVerified: boolean; // AI検証済み
  estimatedDelivery?: Date;
}

interface WaybillStatus {
  current: 'PENDING' | 'READY' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  timeline: StatusEvent[];
}

interface StatusEvent {
  status: string;
  timestamp: Date;
  location?: string;
  description: string;
}

interface ShipmentDetails {
  senderName: string; // 送信者名のみ
  recipientPID: string; // 受取者PID（住所は非表示）
  destination: 'PENDING' | string; // Pending or 確定後の簡略表示
  items: ShipmentItem[];
}

interface ShipmentItem {
  name: string;
  quantity: number;
  weight: number;
}
```

---

### 6. Gift Tracker (ギフト追跡)

**役割**: ギフトの状態だけ追跡（住所データは表示されない/提出権だけ扱う）

#### UI要素

1. **ギフトリスト**
   - 送信中のギフト
   - 受取待ちのギフト
   - 完了したギフト

2. **状態表示**
   - キャンセル理由
   - 期限カウントダウン
   - 解除状態の時系列

3. **アクション**
   - 追跡詳細表示
   - 提出権解除
   - リマインダー送信

#### 機能

- **プライバシー保護**: 住所データは一切表示されない
- **提出権のみ管理**: 提出権限の状態のみ追跡
- **時系列表示**: キャンセル理由、期限、解除状態を時系列で表示
- **自動通知**: 期限接近時に自動リマインダー

#### TypeScript インターフェース

```typescript
interface GiftTrackerState {
  sentGifts: GiftTrackingInfo[];
  receivedGifts: GiftTrackingInfo[];
  completedGifts: GiftTrackingInfo[];
  filter: GiftFilter;
}

interface GiftTrackingInfo {
  giftId: string;
  recipientName: string; // 受取者名のみ
  recipientPID: string; // PIIDのみ、住所は非表示
  status: GiftStatus;
  deadline?: Date;
  timeline: GiftEvent[];
  submissionRights: SubmissionRightsStatus;
}

interface GiftStatus {
  current: 'PENDING_PICKUP' | 'PICKUP_CONFIRMED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' | 'EXPIRED';
  updatedAt: Date;
}

interface GiftEvent {
  eventType: 'CREATED' | 'SHARED' | 'PICKUP_SET' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REVOKED';
  timestamp: Date;
  description: string;
  reason?: string; // キャンセル理由など
}

interface SubmissionRightsStatus {
  active: boolean;
  grantedAt: Date;
  revokedAt?: Date;
  partnerId: string;
  permissions: string[];
}

interface GiftFilter {
  status?: GiftStatus['current'];
  dateRange?: { start: Date; end: Date };
  recipient?: string;
}
```

---

### 7. Permissions (権限管理)

**役割**: 住所・決済の提出権だけ管理

#### UI要素

1. **提出権限リスト**
   - アクティブな提出権
   - 解除済み提出権
   - サイト/サービス別表示

2. **権限詳細**
   - 提出先サイト/サービス名
   - 提出した住所PID（住所詳細は非表示）
   - 使用した決済トークンID
   - 提出日時

3. **解除アクション**
   - ワンタップで提出権解除
   - 解除後は検索候補から即削除
   - 再提出防止

#### 機能

- **提出権のみ管理**: 生住所や決済情報は扱わない
- **完全なIndex排除**: 解除 → キャッシュ失効 → インデックス排除 → 再提出防止
- **検索候補除外**: 解除されたサイトやサービスは検索候補で二度と出ない
- **失効の伝播性**: 解除された提出権はキャッシュ/検索候補/提出キーの3層から即排除

#### TypeScript インターフェース

```typescript
interface PermissionsState {
  activePermissions: SubmissionPermission[];
  revokedPermissions: SubmissionPermission[];
  filter: PermissionFilter;
}

interface SubmissionPermission {
  permissionId: string;
  partnerId: string;
  partnerName: string;
  partnerType: 'EC_SITE' | 'HOTEL' | 'DELIVERY' | 'FINANCIAL' | 'OTHER';
  addressPID: string; // PIIDのみ
  paymentTokenId?: string;
  grantedAt: Date;
  expiryDate?: Date;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  revokedAt?: Date;
  permissions: PermissionType[];
  usageCount: number;
  lastUsedAt?: Date;
}

interface PermissionType {
  type: 'READ_PID' | 'VALIDATE_SHIPMENT' | 'GENERATE_WAYBILL' | 'PAYMENT_PROCESS';
  granted: boolean;
}

interface PermissionFilter {
  status?: SubmissionPermission['status'];
  partnerType?: SubmissionPermission['partnerType'];
  dateRange?: { start: Date; end: Date };
}

interface RevocationResult {
  success: boolean;
  permissionId: string;
  revokedAt: Date;
  cacheInvalidated: boolean; // キャッシュ失効確認
  indexRemoved: boolean; // インデックス排除確認
  preventResubmission: boolean; // 再提出防止確認
}
```

---

### 8. Settings (設定)

**役割**: Default国/言語/提出先キャリアの設定

#### UI要素

1. **デフォルト設定**
   - 国/地域
   - 言語
   - 提出先キャリア優先順位

2. **スキャン設定**
   - カメラ優先/NFC優先
   - スキャン自動実行
   - QRコード生成設定

3. **Wallet統合**
   - Google Wallet連携
   - Apple Wallet連携
   - インポート/エクスポート設定

4. **通知設定**
   - ギフト期限通知
   - 配送状態通知
   - 提出権解除通知

5. **セキュリティ**
   - 生体認証設定
   - PIN設定
   - 自動ロック

#### 機能

- **デフォルト国/言語設定**: ユーザーの主要利用国・言語を設定
- **キャリア優先順位**: 提出先キャリアの優先順位設定
- **Wallet統合**: Google Wallet、Apple Walletからのインポート設定
- **スキャン最適化**: カメラ/NFC優先モード設定

#### TypeScript インターフェース

```typescript
interface SettingsState {
  defaults: DefaultSettings;
  scan: ScanSettings;
  wallet: WalletIntegration;
  notifications: NotificationSettings;
  security: SecuritySettings;
}

interface DefaultSettings {
  country: string;
  language: string;
  preferredCarriers: CarrierPriority[];
  defaultPaymentToken?: string;
}

interface CarrierPriority {
  carrierId: string;
  priority: number; // 1が最優先
}

interface ScanSettings {
  preferredMode: 'CAMERA' | 'NFC' | 'AUTO';
  autoExecute: boolean;
  qrCodeQuality: 'LOW' | 'MEDIUM' | 'HIGH';
  nfcEnabled: boolean;
}

interface WalletIntegration {
  googleWallet: WalletConnection;
  appleWallet: WalletConnection;
  autoImport: boolean;
  syncEnabled: boolean;
}

interface WalletConnection {
  enabled: boolean;
  connected: boolean;
  lastSync?: Date;
}

interface NotificationSettings {
  giftDeadline: boolean;
  deliveryStatus: boolean;
  permissionRevocation: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
}

interface SecuritySettings {
  biometricEnabled: boolean;
  pinEnabled: boolean;
  autoLockDuration: number; // 秒
  requireAuthForPayment: boolean;
  requireAuthForRevocation: boolean;
}
```

---

## AI機能統合 / AI Integration

各画面で活用されるAI機能：

### 1. Home - スキャン意図分類AI
- QR/NFCスキャン直後に用途/文脈/操作先シーンを即分類
- 次に必要な画面だけを表示

### 2. Cloud Address Search - 地域クラスタ圧縮AI
- 友達の住所候補をクラスタ圧縮
- 近い受取地点や、よく使われる受取先を1画面分にまとめて候補を圧縮表示

### 3. Payment Select - 決済連動AI
- 住所に紐づく高頻度の決済候補を1つだけ上に圧縮

### 4. Gift Setting - 期限監視AI
- 期限が近づくと友達側へ優先通知
- UI上でも候補スコアを再計算して上位に

### 5. Waybill Preview - 改ざん耐性チェックAI
- Waybill JSON/YAMLが生成された後
- ハッシュと署名構造が意図した保証仕様を満たしているかだけをレビュー

### 6. Gift Tracker - 異常検知AI
- 異常なキャンセルパターンを検出
- 不正利用の可能性を通知

### 7. Permissions - 失効伝播AI
- 解除された提出権はキャッシュ/検索候補/提出キーの3層から即排除
- 期限切れ後の悪用による破綻を抑止

---

## ナビゲーションフロー / Navigation Flow

```
Home
├── Cloud Address Search
│   └── Payment Select
│       └── Gift Setting (Pending)
│           └── Waybill Preview
├── Gift Tracker
│   ├── Waybill Preview
│   └── Permissions
├── Permissions
└── Settings
```

### 主要フロー / Primary Flows

#### 1. ギフト送信フロー
```
Home → Cloud Address Search → Payment Select → Gift Setting → Waybill Preview
```

#### 2. ギフト受取フロー（友達側）
```
QR/NFCスキャン → Gift Setting (受取場所選択) → 確認
```

#### 3. 追跡フロー
```
Home → Gift Tracker → Waybill Preview
```

#### 4. 権限管理フロー
```
Home → Permissions → 解除確認
```

---

## まとめ / Summary

### すごさを保ちつつスッキリ

Alipay Mini Programで成立させるべき画面は、**住所入力UIなしで検索だけで確定・決済はトークンID引用・受取場所は友達が期限内選択・キャンセルと権限解除はIndexから完全排除**という一本道の構造。

この構造なら、**住所→認証→決済→受取設定→送り状生成→提出→解除**が破綻せず流れます。

規模も信頼も速度もインフラ級の体験設計です。 🚀

### システム名候補 / System Name Candidates

- **Vey Atlas**: 住所探索システム
- **Waybill Oracle**: 送り状予言システム
- **ZK Circuit Resolver**: ゼロ知識回路解決システム
- **GAP Radar**: ギフト住所プロトコルレーダー
- **ScanWeave AI**: スキャン統合AIシステム

---

## 技術仕様 / Technical Specifications

### フロントエンド
- **Framework**: Alipay Mini-Program Framework
- **UI Library**: Ant Design Mini
- **State Management**: Redux / MobX
- **Type Safety**: TypeScript

### AI/ML
- **TensorFlow.js**: ブラウザ内機械学習
- **ONNX Runtime**: 軽量推論エンジン
- **Alipay Cloud AI**: Alipayクラウド機能

### セキュリティ
- **JWT**: トークン管理
- **AES-256**: データ暗号化
- **TLS 1.3**: 通信暗号化
- **Biometric Auth**: 生体認証

### 統合
- **Alipay Payment SDK**: 決済統合
- **Alipay Sesame Credit SDK**: 芝麻信用統合
- **Google Wallet API**: Wallet統合
- **Apple Wallet API**: Wallet統合

---

## 関連ドキュメント / Related Documents

- [AI Capabilities](./AI-CAPABILITIES.md)
- [Alipay Mini-Program README](./README.md)
- [VEY Common Module](../../common/docs/README.md)
- [Cloud Address Book System](../../../docs/cloud-address-book.md)

---

## ライセンス / License

MIT License
