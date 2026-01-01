# 配送受取人決定機能の分離 - 実装概要

## 概要

このPRは、メールアドレスのような配送相手を決める機能を独立したファイルに分離し、わかりやすくするものです。

## 変更内容

### 新規作成ファイル

#### 1. `Vey/integration/src/recipient-resolver.ts`

**目的**: 配送受取人の決定に関する全機能を独立したモジュールとして実装

**主な機能**:

- **受取人の検証** (`validateRecipient`)
  - ConveyIDの形式チェック
  - 予約語の確認
  - メールアドレスの検証に似た機能

- **配送受付ポリシー** (`shouldAcceptDelivery`)
  - 送信者がブロックリストにいるかチェック
  - 名前空間の制限確認
  - 重量・金額制限のチェック
  - 匿名配送の拒否設定
  - メールのスパムフィルターに似た機能

- **住所自動選択** (`selectDeliveryAddress`)
  - 曜日・時間帯による自動選択（例：平日昼間はオフィス、夜間はロッカー）
  - 荷物の重量・金額による選択
  - 国際配送の場合の住所選択
  - メールの自動フォルダ分けに似た機能

- **連絡先管理**
  - 認証済み送信者リスト (`addVerifiedSender`, `isVerifiedSender`)
  - 友達リスト (`addFriend`, `isFriend`)
  - メールの連絡先リストに似た機能

**提供される型定義**:

```typescript
// 配送受付ポリシー
interface DeliveryAcceptancePolicy {
  autoAcceptFriends: boolean;        // 友達から自動受付
  autoAcceptVerified: boolean;       // 認証済み送信者から自動受付
  requireManualApproval: boolean;    // 手動承認が必要
  blockedSenders: string[];          // ブロック済み送信者
  allowedNamespaces?: string[];      // 許可する名前空間
  maxWeight?: number;                // 最大重量（kg）
  maxValue?: number;                 // 最大金額
  allowedCountries?: string[];       // 許可する国
  rejectAnonymous?: boolean;         // 匿名配送を拒否
}

// 住所選択ルール
interface AddressSelectionRule {
  name: string;                      // ルール名
  priority: number;                  // 優先度
  condition: AddressCondition;       // 条件
  selectAddress: string;             // 選択する住所
}

// 条件
interface AddressCondition {
  dayOfWeek?: number[];              // 曜日（0=日曜, 6=土曜）
  timeRange?: {                      // 時間範囲
    start: string;                   // 開始時刻（HH:mm）
    end: string;                     // 終了時刻（HH:mm）
  };
  weightRange?: {                    // 重量範囲
    min?: number;
    max?: number;
  };
  valueRange?: {                     // 金額範囲
    min?: number;
    max?: number;
  };
  senderNamespace?: string[];        // 送信者の名前空間
  isInternational?: boolean;         // 国際配送かどうか
  senderCountry?: string[];          // 送信者の国
}
```

#### 2. `Vey/integration/examples/recipient-resolver-usage.ts`

**目的**: 新しいモジュールの使い方を示す詳細な実例

**含まれる例**:
1. ConveyIDの検証
2. 配送受付ポリシーのチェック
3. ルールに基づく住所選択
4. 認証済み送信者・友達の管理
5. 複数ポリシーのマージ
6. カスタムルールの作成

実行方法:
```bash
cd Vey/integration
npm run example:recipient-resolver
```

#### 3. `Vey/integration/RECIPIENT_RESOLVER.md`

**目的**: モジュールの包括的なドキュメント

**内容**:
- モジュールの概要と目的
- 主な機能の説明
- API リファレンス
- 使用例
- メールシステムとの比較表
- アーキテクチャ図

### 更新ファイル

#### 1. `Vey/integration/src/convey-protocol.ts`

**変更内容**:
- `RecipientResolver`をインポート
- `ConveyProtocol`クラスに`RecipientResolver`インスタンスを追加
- 受取人検証ロジックを`RecipientResolver`に委譲
- 配送受付チェックを`RecipientResolver`に委譲
- 住所選択を`RecipientResolver`に委譲
- 新しいメソッドを追加:
  - `addVerifiedSender()` - 認証済み送信者を追加
  - `removeFriend()` - 友達を削除
  - `getRecipientResolver()` - RecipientResolverインスタンスを取得
  - `updateAddressSelectionRules()` - 住所選択ルールを更新

**Before（変更前）**:
```typescript
// 受取人検証ロジックがConveyProtocol内に混在
const recipientId = parseConveyID(recipientConveyId);

// 受付チェックが散在
if (this.user.acceptancePolicy.blockedSenders.includes(request.from.full)) {
  await this.rejectDeliveryRequest(request.id, 'Sender is blocked');
  return;
}
```

**After（変更後）**:
```typescript
// RecipientResolverを使用
const validation = this.recipientResolver.validateRecipient(recipientConveyId);
if (!validation.valid) {
  throw new Error(validation.error);
}

// 受付チェックもRecipientResolverに委譲
const acceptance = this.recipientResolver.shouldAcceptDelivery(request, policy);
if (!acceptance.accepted && !acceptance.requiresManualApproval) {
  await this.rejectDeliveryRequest(request.id, acceptance.reason);
}
```

#### 2. `Vey/integration/src/index.ts`

**変更内容**:
新しい`recipient-resolver`モジュールのエクスポートを追加:

```typescript
export {
  RecipientResolver,
  createRecipientResolver,
  createDefaultAcceptancePolicy,
  createPermissiveAcceptancePolicy,
  createStrictAcceptancePolicy,
  createDefaultAddressSelectionRules,
  mergeAcceptancePolicies,
  type RecipientInfo,
  type AddressSelectionRule,
  type AddressCondition,
  type RecipientValidationResult,
  type DeliveryAcceptanceResult,
  type PackageDetails,
  type DeliveryRequestInfo,
} from './recipient-resolver';
```

#### 3. `Vey/integration/package.json`

**変更内容**:
- 新しいエクスポートを追加: `./recipient-resolver`
- 新しいスクリプトを追加: `example:recipient-resolver`

## メールとの比較

このモジュールは、メールシステムの概念を配送システムに適用しています：

| メールシステム | RecipientResolver |
|--------------|-------------------|
| メールアドレスの検証 | ConveyIDの検証 |
| スパムフィルター | 配送受付ポリシー |
| 受信トレイルール | 住所選択ルール |
| 連絡先リスト | 認証済み送信者・友達 |
| ブロック送信者 | ブロック済みConveyID |
| 自動フォルダ分け | 自動住所選択 |

## 利点

### 1. 関心の分離
- 受取人決定ロジックが独立したモジュールになった
- `ConveyProtocol`がよりシンプルになった

### 2. 再利用性
- `RecipientResolver`は`ConveyProtocol`外でも使用可能
- 他のコンテキストでも受取人ロジックを再利用できる

### 3. テスト性
- 受取人ロジックを独立してテストできる
- モックやスタブが簡単になった

### 4. 保守性
- 受取人関連の機能がすべて一箇所にある
- 新しい機能の追加が容易

### 5. 理解しやすさ
- メールのアナロジーで理解しやすい
- 明確な責任範囲

## 使用例

### 基本的な使い方

```typescript
import { createRecipientResolver } from '@vey/integration';

const resolver = createRecipientResolver();

// 1. 受取人の検証
const validation = resolver.validateRecipient('alice@convey');
console.log(validation.valid); // true

// 2. 配送受付のチェック
const acceptance = resolver.shouldAcceptDelivery(request, policy);
console.log(acceptance.accepted); // true/false

// 3. 住所の自動選択
const address = resolver.selectDeliveryAddress(request, addresses, rules);
console.log(address.pid);
```

### ConveyProtocolとの統合

```typescript
import { ConveyProtocol, createZKPIntegration } from '@vey/integration';

const zkp = createZKPIntegration({ environment: 'sandbox' });
const protocol = new ConveyProtocol(zkp);

// RecipientResolverは自動的に使用される
await protocol.sendDeliveryRequest('alice@convey', packageDetails);

// 直接アクセスも可能
const resolver = protocol.getRecipientResolver();
resolver.addVerifiedSender('shop@convey.store');
```

## まとめ

この変更により、配送受取人の決定機能が：

1. **独立したモジュール**として分離された
2. **メールのような**わかりやすいインターフェースを持つようになった
3. **再利用可能**で**テストしやすい**構造になった
4. **詳細なドキュメントと例**が提供された

メールアドレスを扱うように、簡単に配送受取人を扱えるようになりました。
