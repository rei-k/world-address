# ZKP Address Protocol API Documentation

## Table of Contents

1. [Authentication](#authentication)
2. [Flow 1: Address Registration & Authentication](#flow-1-address-registration--authentication)
3. [Flow 2: Shipping Request & Waybill Generation](#flow-2-shipping-request--waybill-generation)
4. [Flow 3: Delivery Execution & Tracking](#flow-3-delivery-execution--tracking)
5. [Flow 4: Address Update & Revocation](#flow-4-address-update--revocation)
6. [Types Reference](#types-reference)

## Authentication

すべてのAPI呼び出しは、適切な認証と認可が必要です。

### DID-based Authentication

```typescript
// DIDBベースの認証ヘッダー
const headers = {
  'Authorization': `DID ${userDid}`,
  'X-DID-Signature': signature,
  'X-DID-Challenge': challenge,
};
```

## Flow 1: Address Registration & Authentication

### createDIDDocument

ユーザーまたはエンティティのDIDドキュメントを作成します。

**Signature:**
```typescript
function createDIDDocument(
  did: string,
  publicKey: string,
  keyType?: string
): DIDDocument
```

**Parameters:**
- `did` (string): DID識別子（例: `did:key:z6Mk...`）
- `publicKey` (string): multibase形式の公開鍵
- `keyType` (string, optional): キータイプ（デフォルト: `'Ed25519VerificationKey2020'`）

**Returns:**
- `DIDDocument`: 作成されたDIDドキュメント

**Example:**
```typescript
const didDoc = createDIDDocument(
  'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
  'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK'
);
```

### createAddressPIDCredential

住所PIDのVerifiable Credentialを作成します。

**Signature:**
```typescript
function createAddressPIDCredential(
  userDid: string,
  issuerDid: string,
  pid: string,
  countryCode: string,
  admin1Code?: string,
  expirationDate?: string
): VerifiableCredential
```

**Parameters:**
- `userDid` (string): ユーザーのDID
- `issuerDid` (string): アドレスプロバイダのDID
- `pid` (string): 住所PID
- `countryCode` (string): 国コード（ISO 3166-1 alpha-2）
- `admin1Code` (string, optional): 第1行政階層コード
- `expirationDate` (string, optional): 有効期限（ISO 8601形式）

**Returns:**
- `VerifiableCredential`: 作成されたVC

**Example:**
```typescript
const vc = createAddressPIDCredential(
  'did:key:user123',
  'did:web:vey.example',
  'JP-13-113-01',
  'JP',
  '13',
  new Date('2025-12-31').toISOString()
);
```

### signCredential

Verifiable Credentialに署名を付与します。

**Signature:**
```typescript
function signCredential(
  vc: VerifiableCredential,
  signingKey: string,
  verificationMethod: string
): VerifiableCredential
```

**Parameters:**
- `vc` (VerifiableCredential): 署名するVC
- `signingKey` (string): 署名用の秘密鍵
- `verificationMethod` (string): 検証メソッドの参照（例: `did:web:vey.example#key-1`）

**Returns:**
- `VerifiableCredential`: 署名付きVC

**Example:**
```typescript
const signedVC = signCredential(
  vc,
  'private-key-here',
  'did:web:vey.example#key-1'
);
```

### verifyCredential

Verifiable Credentialの署名を検証します。

**Signature:**
```typescript
function verifyCredential(
  vc: VerifiableCredential,
  publicKey: string
): boolean
```

**Parameters:**
- `vc` (VerifiableCredential): 検証するVC
- `publicKey` (string): 検証用の公開鍵

**Returns:**
- `boolean`: 検証結果（true: 有効、false: 無効）

## Flow 2: Shipping Request & Waybill Generation

### createZKCircuit

ZK証明回路の定義を作成します。

**Signature:**
```typescript
function createZKCircuit(
  id: string,
  name: string,
  description?: string
): ZKCircuit
```

**Parameters:**
- `id` (string): 回路識別子
- `name` (string): 回路名
- `description` (string, optional): 回路の説明

**Returns:**
- `ZKCircuit`: 作成された回路定義

**Example:**
```typescript
const circuit = createZKCircuit(
  'address-validation-v1',
  'Address Validation Circuit',
  'Validates address against shipping conditions'
);
```

### generateZKProof

住所検証のためのZK証明を生成します。

**Signature:**
```typescript
function generateZKProof(
  pid: string,
  conditions: ShippingCondition,
  circuit: ZKCircuit,
  addressData: AddressInput
): ZKProof
```

**Parameters:**
- `pid` (string): 住所PID
- `conditions` (ShippingCondition): 証明する配送条件
- `circuit` (ZKCircuit): 使用する回路
- `addressData` (AddressInput): 完全な住所データ（秘密入力）

**Returns:**
- `ZKProof`: 生成されたZK証明

**Note:** これはプレースホルダー実装です。本番環境では実際のZKライブラリ（Groth16、PLONK等）を使用してください。

### verifyZKProof

ZK証明を検証します。

**Signature:**
```typescript
function verifyZKProof(
  proof: ZKProof,
  circuit: ZKCircuit
): ZKProofVerificationResult
```

**Parameters:**
- `proof` (ZKProof): 検証するZK証明
- `circuit` (ZKCircuit): 使用された回路

**Returns:**
- `ZKProofVerificationResult`: 検証結果

### validateShippingRequest

配送リクエストを検証し、ZK証明を生成します。

**Signature:**
```typescript
function validateShippingRequest(
  request: ShippingValidationRequest,
  circuit: ZKCircuit,
  addressData: AddressInput
): ShippingValidationResponse
```

**Parameters:**
- `request` (ShippingValidationRequest): 配送検証リクエスト
- `circuit` (ZKCircuit): 使用する回路
- `addressData` (AddressInput): 完全な住所データ（アドレスプロバイダのみが保持）

**Returns:**
- `ShippingValidationResponse`: ZK証明を含む検証結果

**Example:**
```typescript
const request = {
  pid: 'JP-13-113-01-T07-B12-BN02-R342',
  userSignature: 'signature',
  conditions: {
    allowedCountries: ['JP'],
    allowedRegions: ['13', '14'],
  },
  requesterId: 'did:web:ec-site.example',
  timestamp: new Date().toISOString(),
};

const response = validateShippingRequest(request, circuit, fullAddress);
```

### createZKPWaybill

ZK証明付き送り状を作成します。

**Signature:**
```typescript
function createZKPWaybill(
  waybillId: string,
  pid: string,
  zkProof: ZKProof,
  trackingNumber: string,
  options?: {
    parcelWeight?: number;
    parcelSize?: string;
    carrierZone?: string;
    senderName?: string;
    recipientName?: string;
    carrierInfo?: { id: string; name: string };
  }
): ZKPWaybill
```

**Parameters:**
- `waybillId` (string): 送り状ID
- `pid` (string): 住所PID
- `zkProof` (ZKProof): ZK証明
- `trackingNumber` (string): 追跡番号
- `options` (object, optional): 追加オプション

**Returns:**
- `ZKPWaybill`: ZK証明付き送り状

## Flow 3: Delivery Execution & Tracking

### validateAccessPolicy

アクセス制御ポリシーを検証します。

**Signature:**
```typescript
function validateAccessPolicy(
  policy: AccessControlPolicy,
  requesterId: string,
  action: string
): boolean
```

**Parameters:**
- `policy` (AccessControlPolicy): アクセスポリシー
- `requesterId` (string): リクエスト者のDID
- `action` (string): 実行しようとするアクション

**Returns:**
- `boolean`: アクセス許可の可否

### resolvePID

PIDを生住所に解決します（アクセス制御付き）。

**Signature:**
```typescript
function resolvePID(
  request: PIDResolutionRequest,
  policy: AccessControlPolicy,
  addressData: AddressInput
): PIDResolutionResponse
```

**Parameters:**
- `request` (PIDResolutionRequest): PID解決リクエスト
- `policy` (AccessControlPolicy): アクセス制御ポリシー
- `addressData` (AddressInput): 完全な住所データ

**Returns:**
- `PIDResolutionResponse`: 解決結果（アクセスが許可された場合は住所を含む）

**Example:**
```typescript
const request = {
  pid: 'JP-13-113-01-T07-B12-BN02-R342',
  requesterId: 'did:web:carrier.example',
  accessToken: 'token',
  reason: 'last-mile-delivery',
  timestamp: new Date().toISOString(),
};

const policy = {
  id: 'policy-001',
  principal: 'did:web:carrier.example',
  resource: 'JP-13-113-01-*',
  action: 'resolve',
};

const response = resolvePID(request, policy, fullAddress);
```

### createAuditLogEntry

監査ログエントリを作成します。

**Signature:**
```typescript
function createAuditLogEntry(
  pid: string,
  accessor: string,
  action: string,
  result: 'success' | 'denied' | 'error',
  metadata?: Record<string, unknown>
): AuditLogEntry
```

**Parameters:**
- `pid` (string): アクセスされたPID
- `accessor` (string): アクセス者のDID
- `action` (string): 実行されたアクション
- `result` (string): 結果
- `metadata` (object, optional): 追加メタデータ

**Returns:**
- `AuditLogEntry`: 監査ログエントリ

### createTrackingEvent

配送追跡イベントを作成します。

**Signature:**
```typescript
function createTrackingEvent(
  trackingNumber: string,
  type: string,
  description?: string,
  location?: { country?: string; admin1?: string; city?: string }
): TrackingEvent
```

**Parameters:**
- `trackingNumber` (string): 追跡番号
- `type` (string): イベントタイプ（例: `'out_for_delivery'`）
- `description` (string, optional): イベントの説明
- `location` (object, optional): 位置情報（粗い粒度）

**Returns:**
- `TrackingEvent`: 追跡イベント

## Flow 4: Address Update & Revocation

### createRevocationEntry

失効エントリを作成します。

**Signature:**
```typescript
function createRevocationEntry(
  pid: string,
  reason: string,
  newPid?: string
): RevocationEntry
```

**Parameters:**
- `pid` (string): 失効させるPID
- `reason` (string): 失効理由
- `newPid` (string, optional): 新しいPID（住所変更の場合）

**Returns:**
- `RevocationEntry`: 失効エントリ

### createRevocationList

失効リストを作成または更新します。

**Signature:**
```typescript
function createRevocationList(
  issuerDid: string,
  entries: RevocationEntry[],
  previousList?: RevocationList
): RevocationList
```

**Parameters:**
- `issuerDid` (string): 発行者のDID
- `entries` (RevocationEntry[]): 失効エントリの配列
- `previousList` (RevocationList, optional): 前回の失効リスト（バージョン管理用）

**Returns:**
- `RevocationList`: 失効リスト

### isPIDRevoked

PIDが失効しているかチェックします。

**Signature:**
```typescript
function isPIDRevoked(
  pid: string,
  revocationList: RevocationList
): boolean
```

**Parameters:**
- `pid` (string): チェックするPID
- `revocationList` (RevocationList): 失効リスト

**Returns:**
- `boolean`: 失効しているか

### getNewPID

失効した住所の新しいPIDを取得します。

**Signature:**
```typescript
function getNewPID(
  oldPid: string,
  revocationList: RevocationList
): string | undefined
```

**Parameters:**
- `oldPid` (string): 旧PID
- `revocationList` (RevocationList): 失効リスト

**Returns:**
- `string | undefined`: 新しいPID（存在する場合）

### signRevocationList

失効リストに署名します。

**Signature:**
```typescript
function signRevocationList(
  revocationList: RevocationList,
  signingKey: string,
  verificationMethod: string
): RevocationList
```

**Parameters:**
- `revocationList` (RevocationList): 署名する失効リスト
- `signingKey` (string): 署名用の秘密鍵
- `verificationMethod` (string): 検証メソッドの参照

**Returns:**
- `RevocationList`: 署名付き失効リスト

## Types Reference

### DIDDocument

```typescript
interface DIDDocument {
  id: string;
  method?: DIDMethod;
  verificationMethod?: VerificationMethod[];
  authentication?: string[];
  service?: ServiceEndpoint[];
  created?: string;
  updated?: string;
}
```

### VerifiableCredential

```typescript
interface VerifiableCredential {
  '@context': string[];
  id: string;
  type: VCType[];
  issuer: string;
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: CredentialSubject;
  proof?: Proof;
}
```

### ZKCircuit

```typescript
interface ZKCircuit {
  id: string;
  name: string;
  proofType: ZKProofType;
  version: string;
  paramsHash: string;
  verificationKey: string;
  description?: string;
}
```

### ShippingCondition

```typescript
interface ShippingCondition {
  allowedCountries?: string[];
  allowedRegions?: string[];
  prohibitedAreas?: string[];
  requiredCapabilities?: string[];
  maxWeight?: number;
  maxDimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
}
```

### RevocationList

```typescript
interface RevocationList {
  id: string;
  issuer: string;
  version: number;
  updatedAt: string;
  entries: RevocationEntry[];
  merkleRoot?: string;
  proof?: Proof;
}
```

詳細な型定義については、[types.ts](../sdk/core/src/types.ts) を参照してください。

## Error Handling

すべてのAPI関数は、エラーが発生した場合に適切なエラーメッセージを返すか、例外をスローします。

```typescript
try {
  const vc = createAddressPIDCredential(...);
  const signedVC = signCredential(vc, privateKey, verificationMethod);
} catch (error) {
  console.error('VC creation failed:', error.message);
}
```

## Rate Limits

APIレート制限は以下の通りです：

- **Address Registration**: 100 requests/hour per user
- **Shipping Validation**: 1000 requests/hour per EC site
- **PID Resolution**: 10000 requests/hour per carrier

レート制限を超えた場合、`429 Too Many Requests` エラーが返されます。

## Webhook Events

以下のイベントでWebhookが発火します：

- `address.created` - 新しい住所が登録された
- `address.updated` - 住所が更新された
- `address.revoked` - 住所が失効した
- `delivery.started` - 配送が開始された
- `delivery.completed` - 配送が完了した
- `delivery.failed` - 配送が失敗した

Webhook設定については、プロバイダのダッシュボードを参照してください。

---

## 5つのZKPパターンAPI

### Pattern 1: ZK-Membership Proof

#### generateZKMembershipProof

住所が有効なPIDセットに含まれることを証明するZK-Membership Proofを生成します。

**Signature:**
```typescript
function generateZKMembershipProof(
  pid: string,
  validPids: string[],
  circuit: ZKCircuit
): ZKMembershipProof
```

**Parameters:**
- `pid` (string): 証明対象の住所PID
- `validPids` (string[]): 有効なPIDの配列（Merkle Treeの葉ノード）
- `circuit` (ZKCircuit): メンバーシップ証明用のZK回路

**Returns:**
- `ZKMembershipProof`: Merkle証明を含むZK-Membership Proof

**Example:**
```typescript
const proof = generateZKMembershipProof(
  'JP-13-113-01-T07-B12',
  ['JP-13-113-01-T07-B12', 'JP-14-201-05-T03-B08', ...],
  circuit
);
```

#### verifyZKMembershipProof

ZK-Membership Proofを検証します。

**Signature:**
```typescript
function verifyZKMembershipProof(
  proof: ZKMembershipProof,
  circuit: ZKCircuit,
  merkleRoot: string
): ZKProofVerificationResult
```

**Parameters:**
- `proof` (ZKMembershipProof): 検証するメンバーシップ証明
- `circuit` (ZKCircuit): 使用されたZK回路
- `merkleRoot` (string): 期待されるMerkle Root

**Returns:**
- `ZKProofVerificationResult`: 検証結果

---

### Pattern 2: ZK-Structure Proof

#### generateZKStructureProof

PIDの階層構造が正当であることを証明するZK-Structure Proofを生成します。

**Signature:**
```typescript
function generateZKStructureProof(
  pid: string,
  countryCode: string,
  hierarchyDepth: number,
  circuit: ZKCircuit
): ZKStructureProof
```

**Parameters:**
- `pid` (string): 検証対象の住所PID
- `countryCode` (string): 国コード（公開情報）
- `hierarchyDepth` (number): 階層の深度
- `circuit` (ZKCircuit): 構造証明用のZK回路

**Returns:**
- `ZKStructureProof`: PID構造証明

**Example:**
```typescript
const proof = generateZKStructureProof(
  'JP-13-113-01-T07-B12-BN02-R342',
  'JP',
  8,
  circuit
);
```

#### verifyZKStructureProof

ZK-Structure Proofを検証します。

**Signature:**
```typescript
function verifyZKStructureProof(
  proof: ZKStructureProof,
  circuit: ZKCircuit,
  expectedCountry?: string
): ZKProofVerificationResult
```

---

### Pattern 3: ZK-Selective Reveal Proof

#### generateZKSelectiveRevealProof

住所の一部フィールドのみを選択的に開示するZK-Selective Reveal Proofを生成します。

**Signature:**
```typescript
function generateZKSelectiveRevealProof(
  pid: string,
  fullAddress: AddressInput,
  fieldsToReveal: string[],
  circuit: ZKCircuit
): ZKSelectiveRevealProof
```

**Parameters:**
- `pid` (string): 住所PID
- `fullAddress` (AddressInput): 完全な住所データ（秘密情報）
- `fieldsToReveal` (string[]): 公開するフィールド名の配列
- `circuit` (ZKCircuit): 選択的開示用のZK回路

**Returns:**
- `ZKSelectiveRevealProof`: 部分開示証明

**Example:**
```typescript
const proof = generateZKSelectiveRevealProof(
  'JP-13-113-01',
  { country: 'JP', province: '13', city: 'Shibuya', postal_code: '150-0001' },
  ['country', 'postal_code'], // これらのみ公開
  circuit
);
// 結果: { country: 'JP', postal_code: '150-0001' } のみ開示
```

#### verifyZKSelectiveRevealProof

ZK-Selective Reveal Proofを検証し、開示されたデータを取得します。

**Signature:**
```typescript
function verifyZKSelectiveRevealProof(
  proof: ZKSelectiveRevealProof,
  circuit: ZKCircuit
): ZKProofVerificationResult & { revealedData?: Record<string, string> }
```

**Returns:**
- 検証結果と開示データ（`revealedData`フィールド）

---

### Pattern 4: ZK-Version Proof

#### generateZKVersionProof

住所更新時の新旧PID間の所有者一致を証明するZK-Version Proofを生成します。

**Signature:**
```typescript
function generateZKVersionProof(
  oldPid: string,
  newPid: string,
  userDid: string,
  circuit: ZKCircuit
): ZKVersionProof
```

**Parameters:**
- `oldPid` (string): 旧住所のPID（失効済み）
- `newPid` (string): 新住所のPID（現在有効）
- `userDid` (string): ユーザーのDID（所有者証明）
- `circuit` (ZKCircuit): バージョン証明用のZK回路

**Returns:**
- `ZKVersionProof`: 住所移行証明

**Example:**
```typescript
const proof = generateZKVersionProof(
  'JP-13-113-01-T07-B12',
  'JP-14-201-05-T03-B08',
  'did:key:user123',
  circuit
);
```

#### verifyZKVersionProof

ZK-Version Proofを検証します。失効リストと照合して旧PIDの失効状態も確認します。

**Signature:**
```typescript
function verifyZKVersionProof(
  proof: ZKVersionProof,
  circuit: ZKCircuit,
  revocationList?: RevocationList
): ZKProofVerificationResult
```

---

### Pattern 5: ZK-Locker Proof

#### generateZKLockerProof

ロッカー施設内のロッカーへのアクセス権を証明するZK-Locker Proofを生成します。

**Signature:**
```typescript
function generateZKLockerProof(
  lockerId: string,
  facilityId: string,
  availableLockers: string[],
  circuit: ZKCircuit,
  zone?: string
): ZKLockerProof
```

**Parameters:**
- `lockerId` (string): 具体的なロッカーID（秘密情報）
- `facilityId` (string): ロッカー施設ID（公開情報）
- `availableLockers` (string[]): 施設内の全ロッカーID
- `circuit` (ZKCircuit): ロッカー証明用のZK回路
- `zone` (string, optional): 配送ゾーン（公開情報）

**Returns:**
- `ZKLockerProof`: ロッカーアクセス証明

**Example:**
```typescript
const proof = generateZKLockerProof(
  'LOCKER-A-042',                 // 秘匿
  'FACILITY-SHIBUYA-STATION',     // 公開
  ['LOCKER-A-001', ..., 'LOCKER-A-100'],
  circuit,
  'KANTO-TOKYO-SHIBUYA'           // 公開
);
```

#### verifyZKLockerProof

ZK-Locker Proofを検証します。

**Signature:**
```typescript
function verifyZKLockerProof(
  proof: ZKLockerProof,
  circuit: ZKCircuit,
  expectedFacilityId?: string
): ZKProofVerificationResult
```

---

## ZKPパターン選択ガイド

適切なZKPパターンを選択するためのガイドライン：

| ユースケース | 推奨パターン | 理由 |
|------------|------------|------|
| ECサイトに住所を見せずに注文 | ZK-Membership | 住所の存在のみ証明 |
| PIDの正当性検証 | ZK-Structure | 階層構造の整合性証明 |
| ECには一部、配送業者には全部開示 | ZK-Selective Reveal | 開示範囲の柔軟な制御 |
| 引越し後の住所更新 | ZK-Version | 新旧PID間の所有権証明 |
| 匿名ロッカー受け取り | ZK-Locker | ロッカー番号秘匿で施設アクセス証明 |

複数のパターンを組み合わせることで、より複雑なプライバシー要件にも対応できます。
