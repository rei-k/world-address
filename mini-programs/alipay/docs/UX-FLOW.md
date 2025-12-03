# Alipay Mini Program UX導線 / UX Flow

このドキュメントでは、Alipay Mini ProgramにおけるVEYシステムの完全なUX導線と体験設計を説明します。

---

## UX導線の完成 / Complete UX Flow

### 10ステップの完全フロー

#### 1. ギフト送信をECサイトで選択

**ユーザーアクション**:
- ECサイトで商品を選択
- チェックアウト時に「ギフトとして送る」を選択

**システム動作**:
- ECサイトがVEY連携を検出
- Alipay Mini Programへのディープリンク生成

**画面遷移**: `EC Site → Alipay Mini Program (Vey Wallet)`

---

#### 2. Vey Walletが開く

**ユーザーアクション**:
- Alipay Mini Program自動起動
- Vey Walletホーム画面表示

**システム動作**:
- ECサイトからの注文情報を受信
- ユーザー認証（生体認証/PIN）
- セッション初期化

**画面遷移**: `Home Screen`

**UI要素**:
```typescript
interface VeyWalletLaunch {
  orderId: string;
  ecSite: {
    name: string;
    partnerId: string;
  };
  items: OrderItem[];
  totalAmount: number;
  currency: string;
}
```

---

#### 3. 友達の保存済み住所だけ検索して選択

**ユーザーアクション**:
- 検索バーに友達の名前/地域/タグを入力
- 候補リストから友達の住所を選択

**システム動作**:
- **友達住所のみ検索**: 自己住所UIは出さない
- **PID一致検証AI**: 裏で自動実行
- **地域クラスタ圧縮AI**: 近い受取地点を自動グルーピング

**画面遷移**: `Home → Cloud Address Search`

**UI要素**:
```typescript
interface AddressSearchUI {
  searchQuery: string;
  filters: {
    country?: string;
    region?: string;
    tags?: string[];
  };
  results: FriendAddress[];
  clusters: AddressCluster[];
}

interface FriendAddress {
  pid: string;
  friendId: string;
  friendName: string;
  displayName: string; // "東京都内の住所" など簡略表示
  tags: string[];
  verified: boolean; // PID検証済み
}
```

**重要**: 住所の詳細は表示されない。PIDと簡略表示のみ。

---

#### 4. 住所に紐づく提出権パッケージが裏で作られ、決済へ進む

**ユーザーアクション**:
- 住所選択後、「決済へ進む」ボタンをタップ

**システム動作**:
- **提出権パッケージ自動生成**:
  - 署名付き提出権トークン生成
  - 用途ID（この注文専用）付与
  - 有効期限設定
- **生住所は含まない**: PIDと提出権限のみ

**画面遷移**: `Cloud Address Search → Payment Select`

**生成データ**:
```typescript
interface SubmissionRightsPackage {
  rightId: string; // 一意の提出権ID
  addressPID: string; // 友達住所のPID
  orderId: string; // EC注文ID
  partnerId: string; // ECサイトID
  signature: string; // 署名
  usageId: string; // 用途ID（この注文のみ有効）
  expiryDate: Date; // 有効期限
  permissions: ['READ_PID', 'VALIDATE_SHIPMENT', 'GENERATE_WAYBILL'];
  // 生住所データは含まれない
}
```

---

#### 5. 決済方法はクラウドのトークンIDだけ選べる

**ユーザーアクション**:
- 保存済み決済トークンから選択
- デフォルト決済が自動選択されている場合はそのまま確認

**システム動作**:
- **番号入力UIなし**: カード番号入力フォームは一切表示されない
- **トークンID参照のみ**: 保存済みトークンから選択
- **住所連動AI**: 選択した住所に紐づく高頻度の決済候補を上位表示

**画面遷移**: `Payment Select`

**UI要素**:
```typescript
interface PaymentSelectUI {
  tokens: PaymentToken[];
  selectedToken: PaymentToken | null;
  recommendedToken: PaymentToken | null; // AIによる推薦
}

interface PaymentToken {
  tokenId: string;
  type: 'ALIPAY_BALANCE' | 'BANK_CARD' | 'CREDIT_CARD';
  lastFourDigits?: string; // 下4桁のみ表示
  displayName: string; // "支付宝余额" "招商银行 ****1234"
  isDefault: boolean;
  linkedAddressPID?: string;
  usageFrequency: number;
}
```

**セキュリティ**:
- カード番号は一切表示されない
- トークンIDのみで決済処理
- Alipay決済SDKによる安全な処理

---

#### 6. 送信内容を確定し**Waybillを生成（Pending Destination）**で保存

**ユーザーアクション**:
- 注文内容を確認
- 「確定」ボタンをタップ

**システム動作**:
1. **決済実行**:
   - トークンIDで決済処理
   - 提出権パッケージとセットで保存

2. **Waybill生成（Pending状態）**:
   - 送り状番号生成（一意Nonce付き）
   - 宛先は「Pending Destination」
   - キャリアへは**未提出**
   - ハッシュ生成（追跡用）

3. **ギフトリンク生成**:
   - 友達が受取場所を選択できるURL/QR/NFC生成

**画面遷移**: `Payment Select → Gift Setting (Pending) → Waybill Preview`

**生成データ**:
```typescript
interface PendingWaybill {
  waybillNumber: string;
  nonce: string; // 一意性保証
  hash: string; // 追跡用ハッシュ
  status: 'PENDING'; // 受取場所未確定
  recipientPID: string;
  destination: 'PENDING'; // まだ確定していない
  carrier: CarrierInfo; // AI互換判定済み
  submissionRights: SubmissionRightsPackage;
  createdAt: Date;
  expiryDate: Date; // 友達が選択する期限
}

interface CarrierInfo {
  carrierId: string;
  name: string;
  compatibilityVerified: boolean; // AI検証済み
  // キャリアへは未提出
}
```

**重要**: 
- **Pending Destination設計**: 先に発送に進ませないガード
- **キャリア未提出**: 受取場所確定まで配送開始しない
- **誤送信防止**: 友達が受取場所を選ぶまで停止

---

#### 7. 友達側へ受取リンク/QR/NFCコードを送付

**ユーザーアクション**:
- 共有方法を選択（WeChat、SMS、メール、NFC）
- 友達に送信

**システム動作**:
- **ギフトリンク生成**:
  - URL: 友達が受取場所選択画面を開けるリンク
  - QRコード: スキャンで即座に受取設定画面へ
  - NFCタグ: タップで受取設定画面へ

**画面遷移**: `Waybill Preview → Share Options`

**共有データ**:
```typescript
interface GiftShareData {
  type: 'URL' | 'QR' | 'NFC';
  giftId: string;
  linkId: string; // ギフトリンクID
  expiryDate: Date; // 受取選択期限
  deepLink: string; // "alipay://gift/pending/{linkId}"
  qrCode?: string; // QRコード画像
  nfcData?: string; // NFCタグデータ
  submissionRights: string; // 署名付き提出権（住所実データなし）
  usageId: string; // 用途ID
}
```

**スキャンペイロードの境界**:
- QR/NFCに入れるのは住所実データではない
- 署名付きの提出権と用途IDだけ
- 言語差・引越し・破損コードの復元で破綻しない

---

#### 8. 友達は期限以内に受取場所を選択しなければ注文キャンセル

**ユーザーアクション（友達側）**:
- QR/NFCスキャン or URLタップ
- Alipay Mini Program起動
- 受取場所候補から選択

**システム動作**:
1. **スキャン意図分類AI**:
   - QR/NFCスキャン直後に「ギフト受取設定」と判定
   - 受取場所選択画面へ直接遷移

2. **受取場所候補表示**:
   - 友達の保存済み住所から選択
   - 新規住所追加も可能
   - コンビニ受取、ロッカー受取も選択可

3. **期限監視**:
   - 期限接近時に通知
   - カウントダウン表示

**画面遷移**: `QR/NFC Scan → Gift Setting (Pending) → 受取場所選択`

**期限切れ時の動作**:
```typescript
interface DeadlineExpiredFlow {
  // 自動実行される処理
  1: 'ORDER_CANCELLATION', // 注文自動キャンセル
  2: 'PAYMENT_REFUND', // 決済返金
  3: 'SUBMISSION_RIGHTS_REVOCATION', // 提出権失効
  4: 'INDEX_EXCLUSION', // 検索インデックスから排除
  5: 'CACHE_INVALIDATION', // キャッシュ無効化
  6: 'NOTIFICATION_TO_SENDER', // 送信者へ通知
}
```

**期限内選択の動作**:
```typescript
interface PickupConfirmed {
  giftId: string;
  selectedPickupPID: string; // 友達が選んだ受取場所のPID
  confirmedAt: Date;
  // 次のステップ: 最終Waybill生成へ
}
```

---

#### 9. 受取場所を選択 → 最終Waybillとしてキャリアへ提出

**ユーザーアクション（友達側）**:
- 受取場所を確定
- 「確認」ボタンをタップ

**システム動作**:
1. **Waybill更新**:
   - `destination: 'PENDING'` → `destination: PID（確定）`
   - `status: 'PENDING'` → `status: 'READY_FOR_SHIPMENT'`

2. **キャリア提出**:
   - 最終Waybillをキャリアに送信
   - 配送開始

3. **送信者に通知**:
   - 「受取場所が確定しました」
   - 追跡情報共有

**画面遷移**: `Gift Setting → Waybill Preview (Updated) → Tracking`

**最終Waybill**:
```typescript
interface FinalWaybill {
  waybillNumber: string;
  nonce: string;
  hash: string;
  status: 'READY_FOR_SHIPMENT'; // 配送準備完了
  recipientPID: string; // 友達が選んだ受取場所
  destination: string; // 確定した受取場所（簡略表示）
  carrier: CarrierInfo;
  submittedToCarrier: true;
  submittedAt: Date;
  trackingUrl: string;
}
```

**キャリア提出データ**:
- **ラストワンマイルのみ住所開示**: キャリアには配送に必要な最小限の情報のみ
- **PIDベース**: 可能な限りPIDで管理
- **監査ログ**: すべてのアクセスを記録

---

#### 10. 送信者は提出権を後から解除できる（検索候補/キャッシュから即削除）

**ユーザーアクション（送信者側）**:
- Gift Tracker または Permissions画面を開く
- 対象のギフト/提出権を選択
- 「提出権を解除」ボタンをタップ

**システム動作**:
1. **提出権失効**:
   - `status: 'ACTIVE'` → `status: 'REVOKED'`
   - `revokedAt: Date`記録

2. **3層からの即排除**:
   - **キャッシュ失効**: Redis等のキャッシュから削除
   - **検索インデックス排除**: Elasticsearchから削除
   - **提出キー無効化**: 再提出防止

3. **ECサイトへ通知**:
   - Webhookで提出権失効を通知
   - ECサイト側でも該当データを無効化

**画面遷移**: `Permissions → Revocation Confirmation → Completed`

**失効処理**:
```typescript
interface RevocationProcess {
  permissionId: string;
  revokedAt: Date;
  
  // 即座に実行される処理
  steps: {
    1: {
      action: 'CACHE_INVALIDATION',
      target: 'Redis Cache',
      status: 'COMPLETED'
    },
    2: {
      action: 'INDEX_REMOVAL',
      target: 'Elasticsearch',
      status: 'COMPLETED'
    },
    3: {
      action: 'SUBMISSION_KEY_INVALIDATION',
      target: 'Database',
      status: 'COMPLETED'
    },
    4: {
      action: 'WEBHOOK_NOTIFICATION',
      target: 'EC Site',
      status: 'COMPLETED'
    }
  };
  
  // 検索候補から完全除外
  searchExclusion: {
    partnerSites: string[]; // 該当ECサイト
    permanentBlock: true; // 再提出防止
  };
}
```

**失効の伝播性**:
- 解除された提出権はキャッシュ/検索候補/提出キーの3層から即排除
- 期限切れ後の悪用による破綻を抑止
- 解除されたサイトやサービスは検索候補で二度と出ない

---

## 位置と互換性の保証 / Location & Compatibility Guarantee

### 配送仕様適合チェック

友達住所検索、決済トークン選択、Waybill生成の間に、**配送仕様適合チェックと位置候補フィルタを1回だけ必ず挟む**。

#### チェックポイント

1. **キャリア互換性検証**:
```typescript
interface CarrierCompatibilityCheck {
  addressPID: string;
  carrier: CarrierInfo;
  compatible: boolean;
  reason?: string;
  
  checks: {
    regionSupported: boolean; // 地域対応確認
    weightLimit: boolean; // 重量制限確認
    prohibitedItems: boolean; // 禁制品確認
    deliveryDays: number; // 配送日数見積もり
  };
}
```

2. **位置候補フィルタ**:
```typescript
interface LocationFilter {
  addressPID: string;
  coordinates: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  
  filters: {
    deliverable: boolean; // 配送可能エリア
    estimatedDistance: number; // 推定距離
    accessRestrictions: string[]; // アクセス制限
  };
}
```

3. **決済互換性**:
```typescript
interface PaymentCompatibility {
  paymentToken: PaymentToken;
  carrier: CarrierInfo;
  compatible: boolean;
  supportedMethods: string[];
}
```

### AI実行タイミング

```
住所選択
    ↓
[AI: キャリア互換性チェック] ← ここで1回だけ実行
    ↓
提出権パッケージ生成
    ↓
決済選択
    ↓
[AI: 決済互換性チェック] ← ここで1回だけ実行
    ↓
Waybill生成（Pending）
```

---

## スキャンペイロードの境界 / Scan Payload Boundaries

### QR/NFCに含めるデータ

**含める**:
```typescript
interface ScanPayload {
  version: string; // "1.0"
  type: 'GIFT_RECEIPT' | 'ADDRESS_SHARE' | 'TRACKING';
  linkId: string; // ギフトリンクID
  signature: string; // 署名（改ざん防止）
  usageId: string; // 用途ID（この取引専用）
  expiryDate: string; // ISO 8601形式
  deepLink: string; // "alipay://gift/pending/{linkId}"
}
```

**含めない**:
- ❌ 生住所データ
- ❌ 決済情報
- ❌ 個人識別情報（PID以外）
- ❌ ECサイトの注文詳細

### 破綻しない設計

1. **言語差対応**: QRにはデータID のみ。表示は端末言語で動的生成
2. **引越し対応**: 住所変更時もPIDで追跡。QR再生成不要
3. **破損コード復元**: サーバー側にデータ保存。QRは単なる参照

```typescript
interface ScanRestoration {
  scannedData: string; // 破損したQRデータ
  
  restoration: {
    linkId: string; // サーバーから取得
    validUntil: Date;
    canRestore: boolean;
    alternativeAccess: {
      url: string;
      sms: string;
      email: string;
    };
  };
}
```

---

## 受取場所の未定状態設計 / Pending Destination Design

### Waybill生成時の宛先制御

**Pending状態の保証**:

```typescript
interface PendingDestinationControl {
  waybillStatus: 'PENDING';
  destination: 'PENDING'; // 文字列として"PENDING"
  
  guards: {
    preventCarrierSubmission: true; // キャリア提出防止
    preventShipment: true; // 発送防止
    requireRecipientConfirmation: true; // 受取者確認必須
  };
  
  timeline: {
    created: Date;
    expiryDate: Date;
    confirmedAt?: Date; // 受取場所確定時刻
    submittedToCarrierAt?: Date; // キャリア提出時刻
  };
}
```

### 誤送信破綻の回避

**3段階のガード**:

1. **生成段階**: `destination: 'PENDING'`で固定
2. **検証段階**: 受取場所未確定の場合、キャリア提出をブロック
3. **監視段階**: 期限監視AIが期限切れ前に通知、期限切れ後に自動キャンセル

```typescript
interface MisshipmentPrevention {
  checks: {
    destinationConfirmed: boolean;
    deadlineValid: boolean;
    carrierReady: boolean;
  };
  
  preventShipment(): boolean {
    return !this.checks.destinationConfirmed || 
           !this.checks.deadlineValid;
  }
}
```

---

## 失効の伝播性 / Revocation Propagation

### 3層からの即排除

解除された提出権は以下の3層から**即座に排除**:

#### Layer 1: キャッシュ失効
```typescript
interface CacheInvalidation {
  cacheKeys: string[];
  action: 'DELETE';
  
  targets: {
    redis: {
      keys: [
        `address:${pid}`,
        `submission:${permissionId}`,
        `partner:${partnerId}:addresses`
      ],
      invalidated: true
    }
  };
}
```

#### Layer 2: 検索インデックス排除
```typescript
interface IndexRemoval {
  indexName: 'addresses' | 'permissions';
  documentId: string;
  action: 'DELETE';
  
  targets: {
    elasticsearch: {
      indices: [
        'friend_addresses',
        'submission_permissions',
        'partner_associations'
      ],
      removed: true
    }
  };
}
```

#### Layer 3: 提出キー無効化
```typescript
interface SubmissionKeyInvalidation {
  permissionId: string;
  submissionRights: SubmissionRightsPackage;
  
  invalidation: {
    database: {
      status: 'REVOKED',
      revokedAt: Date,
      preventResubmission: true
    },
    webhooks: {
      notifyPartner: true,
      partnerMustInvalidate: true
    }
  };
}
```

### 期限切れ後の悪用抑止

```typescript
interface AbusePrevent {
  permissionId: string;
  
  protections: {
    // 再提出防止
    blockResubmission: {
      partnerId: string;
      addressPID: string;
      blockedUntil: 'PERMANENT';
    };
    
    // 検索候補から永久除外
    searchExclusion: {
      partnerSites: string[];
      permanentBlock: true;
      reason: 'REVOKED_BY_USER';
    };
    
    // アクセス記録
    auditLog: {
      action: 'REVOCATION',
      timestamp: Date;
      reason: string;
      ipAddress: string;
    };
  };
}
```

---

## まとめ / Summary

### 一本道の構造

Alipay Mini Programで成立させるべき画面は、**住所入力UIなしで検索だけで確定・決済はトークンID引用・受取場所は友達が期限内選択・キャンセルと権限解除はIndexから完全排除**という一本道の構造。

### 破綻しない流れ

この構造なら、**住所→認証→決済→受取設定→送り状生成→提出→解除**が破綻せず流れます。

### インフラ級の体験

規模も信頼も速度もインフラ級の体験設計です。 🚀

---

## 関連ドキュメント / Related Documents

- [Screen Structure](./SCREEN-STRUCTURE.md)
- [AI Capabilities](./AI-CAPABILITIES.md)
- [Alipay Mini-Program README](./README.md)

---

## ライセンス / License

MIT License
