# ZKP Address Protocol

## 概要 (Overview)

ZKPアドレスプロトコルは、ゼロ知識証明（Zero-Knowledge Proof）を活用した、プライバシー保護型の住所管理・配送システムです。

このプロトコルは4つの主要なフローと5つのZKPパターンで構成されています：

### 4つの主要フロー
1. **住所登録・認証フロー** - ユーザーが住所を登録し、検証済みの住所クレデンシャルを取得
2. **配送依頼・送り状発行フロー** - ECサイトが配送先の有効性をZK証明で確認
3. **配送実行・追跡フロー** - キャリアが必要な範囲でのみ住所情報にアクセス
4. **住所更新・失効フロー** - 住所変更時の安全な更新と旧住所の失効

### 5つのZKPパターン (5 ZKP Patterns)

VeyformプロトコルではZKP（ゼロ知識証明）を5つのパターンで活用し、用途に応じた最適な証明を提供します：

#### 1. ZK-Membership Proof（住所存在証明）
- **用途**: 住所が有効な住所セットに含まれることだけを証明し、住所そのものは公開しない
- **技術**: Merkle Tree + zk-SNARK / Bulletproofs
- **特徴**: 
  - 住所がGAPクラウド住所帳に登録済みであることを証明
  - 具体的な住所内容は秘匿
  - ECサイトには「有効な配送先である」ことのみ通知

#### 2. ZK-Structure Proof（PID階層証明）
- **用途**: 住所のPID（階層的住所ID）が正しい構造を持つことを証明
- **技術**: Halo2 / PLONK / zk-SNARK
- **特徴**:
  - 国 → 都道府県 → 市区町村 → 丁目... の階層構造が正当であることを証明
  - 住所写像論（Address Mapping Framework）の中核
  - 各国固有の階層ルールに対応

#### 3. ZK-Selective Reveal Proof（部分公開証明）
- **用途**: ユーザーが選択したフィールドのみを開示し、残りは秘匿
- **技術**: SD-JWT (Selective Disclosure JWT) + zk-SNARK
- **特徴**:
  - ECサイトには「国」と「郵便番号範囲」だけ公開
  - 配送業者には完全な住所を公開
  - 友達には「市区町村」と「受け取りロッカーID」だけ公開
  - ユーザー主権で開示範囲をコントロール

#### 4. ZK-Version Proof（住所更新証明）
- **用途**: 引越し後、旧PIDと新PIDの所有者が同一であることを証明
- **技術**: zk-SNARK
- **特徴**:
  - 住所変更前後の整合性を保証
  - 旧住所の失効と新住所の有効性を同時に証明
  - QR/NFCで引越し後も継続利用可能

#### 5. ZK-Locker Proof（ロッカー所属証明）
- **用途**: 特定のロッカー施設内のロッカーにアクセス権があることを証明
- **技術**: ZK-Membership (Merkle Tree + zk-SNARK)
- **特徴**:
  - どのロッカーかは秘匿したまま、施設内ロッカーへのアクセス権を証明
  - 匿名受け取りの実現
  - PUDO (Pick Up Drop Off) ポイント管理に活用

## アーキテクチャ (Architecture)

### 主要な役割 (Key Roles)

#### 1. ユーザー (User)
- 自分の生住所を保持する本人
- DID（分散型識別子）とウォレットで鍵を管理
- 配送時にどの住所を使うか選択・承認

#### 2. アドレスプロバイダ (Address Provider)
- 住所の正規化とPID発行を担う中核的な住所基盤
- AMF（Address Mapping Framework）による住所階層化
- ZK証明の生成と検証サービスを提供

#### 3. ECサイト/サービス事業者
- ユーザーから配送依頼を受けるが、生住所は見ない
- ZK証明で「正しい配送先である」ことのみ確認
- PIDトークンとZK証明のみを保持

#### 4. 配送業者 (Carrier)
- 実際に荷物を配送する事業者
- ラストワンマイルでのみ必要に応じて生住所にアクセス
- アクセスログが監査のために記録される

---

## 5つのZKPパターンの組み合わせ (Combining 5 ZKP Patterns)

### パターン別用途マトリクス

| 用途 | 証明タイプ | 使用するZKP | 公開される情報 |
|------|-----------|------------|-------------|
| 住所を登録済みか証明（ECに住所を出さない） | 所属証明 | ZK-Membership + Merkle-SNARK | Merkle Root のみ |
| 住所階層（PID）が正しいか証明 | 構造整合性 | ZK-Structure (Halo2/PLONK) | 国コード、階層深度 |
| ECには住所の一部だけ出す | 部分開示 | ZK-Selective Reveal (SD-JWT + zk) | ユーザー選択フィールド |
| 配送業者には住所を100%出す | 例外開示 | Revealモード（ZKP不要） | 完全な住所 |
| 引越し後もQR/NFCで証明可能にする | 履歴整合性 | ZK-Version Proof | 旧PID、新PID |
| ロッカー受け取りを匿名で行う | 包含証明 | ZK-Locker (ZK-Membership) | 施設ID、Merkle Root |

### 実際の配送フローでの使用例

#### STEP 1: ユーザー登録
```typescript
// 住所をGAP（クラウド住所帳）に登録
// → Merkle Tree に含まれる
const membershipProof = generateZKMembershipProof(
  userPid,
  allValidPids,
  membershipCircuit
);
```

#### STEP 2: ECサイトで注文
```typescript
// 「住所が登録されている」ことだけZKPで証明
// → ECに住所は出ない（国・郵便番号レベルだけ出すことも可）
const selectiveProof = generateZKSelectiveRevealProof(
  userPid,
  fullAddress,
  ['country', 'postal_code'], // 公開するフィールド
  selectiveCircuit
);
```

#### STEP 3: 配送業者に開示
```typescript
// 配送業者にだけ「完全な住所情報」を自動開示
// → ここではZKP不要（アクセス制御ポリシーで管理）
const resolution = resolvePID(
  { pid: userPid, requesterId: carrierDid },
  accessPolicy,
  fullAddress
);
```

#### STEP 4: 配送完了記録
```typescript
// 配送された住所の階層が正しく構造的に整合していたことをZKPで記録
const structureProof = generateZKStructureProof(
  userPid,
  'JP',
  8, // 階層深度
  structureCircuit
);
```

### ロッカー受け取りのユースケース

```typescript
// 1. ユーザーがロッカーを予約
const lockerProof = generateZKLockerProof(
  'LOCKER-A-042', // 具体的なロッカーID（秘匿）
  'FACILITY-SHIBUYA-STATION', // 施設ID（公開）
  availableLockers,
  lockerCircuit,
  'KANTO-TOKYO-SHIBUYA' // ゾーン（公開）
);

// 2. ECサイトには施設IDだけ通知
// 「渋谷駅のどこかのロッカーで受け取る」とだけ分かる

// 3. 配送業者は施設に配達
// 具体的なロッカー番号は受取人のQRコード/NFCで開示
```

### 引越し時のシナリオ

```typescript
// 1. 旧住所の失効エントリ作成
const revocationEntry = createRevocationEntry(
  oldPid,
  'address_change',
  newPid
);

// 2. バージョン証明生成（所有者が同一であることを証明）
const versionProof = generateZKVersionProof(
  oldPid,
  newPid,
  userDid,
  versionCircuit
);

// 3. 古いQR/NFCでも新住所に自動リダイレクト
// （ZK-Version Proofで正当性が保証される）
```

---

## フロー詳細 (Flow Details)

### Flow 1: 住所登録・認証 (Address Registration & Authentication)

```typescript
import { 
  createDIDDocument, 
  createAddressPIDCredential,
  signCredential 
} from '@vey/core';

// 1. ユーザーのDIDドキュメント作成
const userDid = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
const publicKey = 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
const didDocument = createDIDDocument(userDid, publicKey);

// 2. 住所を正規化してPID生成（内部処理）
const pid = 'JP-13-113-01-T07-B12-BN02-R342';

// 3. Address PID Verifiable Credential発行
const issuerDid = 'did:web:vey.example';
const addressVC = createAddressPIDCredential(
  userDid,
  issuerDid,
  pid,
  'JP',
  '13',
  new Date('2025-12-31').toISOString()
);

// 4. VCに署名
const signedVC = signCredential(
  addressVC,
  'private-key-here',
  `${issuerDid}#key-1`
);
```

### Flow 2: 配送依頼・送り状発行 (Shipping Request & Waybill Generation)

```typescript
import {
  createZKCircuit,
  validateShippingRequest,
  createZKPWaybill
} from '@vey/core';

// 1. ZK回路の定義
const circuit = createZKCircuit(
  'address-validation-v1',
  'Address Validation Circuit',
  'Validates address against shipping conditions'
);

// 2. 配送条件の設定
const shippingCondition = {
  allowedCountries: ['JP'],
  allowedRegions: ['13', '14', '27'], // 東京、神奈川、大阪
  prohibitedAreas: [], // 配送不可エリア
};

// 3. 配送リクエストの検証とZK証明生成
const request = {
  pid: 'JP-13-113-01-T07-B12-BN02-R342',
  userSignature: 'user-signature-here',
  conditions: shippingCondition,
  requesterId: 'did:web:ec-site.example',
  timestamp: new Date().toISOString(),
};

const fullAddress = {
  country: 'JP',
  province: '13',
  city: '渋谷区',
  street_address: '道玄坂1-2-3',
  // ... 完全な住所データ
};

const response = validateShippingRequest(request, circuit, fullAddress);

if (response.valid && response.zkProof) {
  // 4. ZKP付き送り状の作成
  const waybill = createZKPWaybill(
    'WB-2024-001',
    request.pid,
    response.zkProof,
    'TN-20241202-001',
    {
      parcelWeight: 2.5,
      parcelSize: '60',
      carrierZone: 'KANTO-01',
      senderName: 'Sender Name',
      recipientName: 'Recipient Name',
      carrierInfo: { id: 'carrier-1', name: 'Yamato Transport' }
    }
  );
}
```

### Flow 3: 配送実行・追跡 (Delivery Execution & Tracking)

```typescript
import {
  validateAccessPolicy,
  resolvePID,
  createAuditLogEntry,
  createTrackingEvent
} from '@vey/core';

// 1. アクセス制御ポリシーの定義
const accessPolicy = {
  id: 'policy-001',
  principal: 'did:web:carrier.example', // キャリアのDID
  resource: 'JP-13-113-01-*', // アクセス可能なPIDパターン
  action: 'resolve',
  expiresAt: new Date('2024-12-31').toISOString(),
};

// 2. PID解決リクエスト（キャリアから）
const resolutionRequest = {
  pid: 'JP-13-113-01-T07-B12-BN02-R342',
  requesterId: 'did:web:carrier.example',
  accessToken: 'access-token-here',
  reason: 'last-mile-delivery',
  timestamp: new Date().toISOString(),
};

// 3. アクセス権限を検証してPIDを解決
const resolutionResponse = resolvePID(
  resolutionRequest,
  accessPolicy,
  fullAddress
);

if (resolutionResponse.success) {
  // 4. 監査ログを記録
  const auditLog = createAuditLogEntry(
    resolutionRequest.pid,
    resolutionRequest.requesterId,
    'resolve',
    'success',
    { reason: resolutionRequest.reason }
  );

  // 5. 配送追跡イベントの記録
  const trackingEvent = createTrackingEvent(
    'TN-20241202-001',
    'out_for_delivery',
    '配達員が配達に向かっています',
    { country: 'JP', admin1: '13', city: '渋谷区' }
  );
}
```

### Flow 4: 住所更新・失効 (Address Update & Revocation)

```typescript
import {
  createRevocationEntry,
  createRevocationList,
  isPIDRevoked,
  signRevocationList
} from '@vey/core';

// 1. 住所変更時：旧PIDの失効エントリ作成
const oldPid = 'JP-13-113-01-T07-B12-BN02-R342';
const newPid = 'JP-14-201-05-T03-B08-BN01-R201';

const revocationEntry = createRevocationEntry(
  oldPid,
  'address_change',
  newPid
);

// 2. 失効リストの更新
const issuerDid = 'did:web:vey.example';
const revocationList = createRevocationList(
  issuerDid,
  [revocationEntry]
);

// 3. 失効リストに署名
const signedRevocationList = signRevocationList(
  revocationList,
  'private-key-here',
  `${issuerDid}#key-1`
);

// 4. ZK証明時に失効チェック
const isRevoked = isPIDRevoked(oldPid, signedRevocationList);
if (isRevoked) {
  // この住所は使用できません
  console.log('This address has been revoked');
  
  // 新しいPIDを取得
  const newPidFromList = getNewPID(oldPid, signedRevocationList);
  console.log('New PID:', newPidFromList);
}
```

## 技術スタック (Technology Stack)

### ZKP レイヤー
- **ZK Proof System**: Groth16 / PLONK / Halo2 / Bulletproofs
- **5つのZKPパターン**:
  1. ZK-Membership Proof (Merkle Tree + SNARK)
  2. ZK-Structure Proof (Halo2/PLONK)
  3. ZK-Selective Reveal Proof (SD-JWT + zk-SNARK)
  4. ZK-Version Proof (zk-SNARK)
  5. ZK-Locker Proof (ZK-Membership)
- **回路**: 国コード、地域コード、座標範囲判定、配送可否フラグ、失効リスト非包含証明、階層整合性
- **Prover**: アドレスプロバイダ側マイクロサービス
- **Verifier**: EC・キャリア向け軽量ライブラリ

### ID・鍵管理
- **DID**: W3C Decentralized Identifiers (did:key, did:web, etc.)
- **VC**: W3C Verifiable Credentials
- **ユーザー鍵管理**: モバイルアプリ内ウォレット、WebAuthn
- **サーバー側KMS**: HSM, Cloud KMS

### 住所正規化・PID
- **AMF**: Address Mapping Framework
- **階層化**: 国 → 都道府県 → 市区町村 → 町丁目 → 番地 → 建物 → 部屋
- **PID形式**: `<Country>-<Admin1>-<Admin2>-<Locality>-<Sublocality>-<Block>-<Building>-<Unit>`

### API・プロトコル
- **EC向けAPI**: 配送可否チェック、送り状発行
- **キャリア向けAPI**: PID解決、ZK検証
- **イベント通知**: Webhook、配送ステータス通知

### セキュリティ
- **通信**: TLS 1.3、mTLS
- **監査**: すべてのPID解決アクセスをログ記録
- **レート制限**: API保護
- **WAF**: Bot対策、DDoS対策

## セキュリティとプライバシー

### プライバシー保護の原則

1. **最小権限の原則**: 各ステークホルダーは必要最小限の情報のみアクセス
2. **ZK証明による検証**: 生住所を公開せずに配送可能性を証明
3. **監査可能性**: すべてのアクセスを記録し、不正利用を検出
4. **ユーザー主権**: ユーザーが自分の住所データを管理

### データアクセスレベル

| ステークホルダー | アクセス可能なデータ | 目的 |
|-----------------|---------------------|------|
| ユーザー | 完全な生住所、全PID | 自己管理 |
| アドレスプロバイダ | 完全な生住所、PID、VC | 正規化、証明生成 |
| ECサイト | PIDトークン、ZK証明 | 配送可否確認 |
| キャリア（中継） | PIDトークン、配送ゾーン | ルーティング |
| キャリア（配達員） | 完全な生住所 | 実配送 |

## 実装ステップ（ロードマップ）

### MVP (v1.0)
- [x] AMF + PID + API基盤
- [x] 基本的なDID/VC対応
- [x] シンプルな配送条件検証

### v2.0
- [x] 5つのZKPパターン実装（Membership, Structure, Selective Reveal, Version, Locker）
- [x] 実際のZK回路実装基盤（Groth16/PLONK/Halo2）
- [x] 国コード・都道府県レベルの配送可否ZK証明
- [x] 基本的な失効リスト
- [x] Merkle Tree ベースのメンバーシップ証明
- [x] SD-JWT による部分開示機能

### v3.0
- [ ] ポリゴン内判定のZK化
- [ ] 危険区域除外の高度な制約
- [ ] Accumulator ベースの失効リスト最適化
- [ ] zk-STARKs による高速検証

### v4.0
- [ ] DID/VC完全連携
- [ ] マルチキャリア対応
- [ ] ユーザー主権型住所VC
- [ ] クロスボーダー配送対応

---

## 5つのZKPパターンAPI使用例

### Pattern 1: ZK-Membership Proof

```typescript
import { 
  generateZKMembershipProof, 
  verifyZKMembershipProof,
  createZKCircuit 
} from '@vey/core';

// 1. 回路定義
const circuit = createZKCircuit(
  'membership-circuit-v1',
  'Address Membership Circuit'
);

// 2. 証明生成
const validPids = [
  'JP-13-113-01-T07-B12',
  'JP-14-201-05-T03-B08',
  'US-CA-90210-W01-S05',
  // ... その他の有効PID
];

const proof = generateZKMembershipProof(
  userPid,
  validPids,
  circuit
);

// 3. 検証
const result = verifyZKMembershipProof(
  proof,
  circuit,
  proof.merkleRoot
);

console.log('住所は有効:', result.valid);
// 具体的な住所は秘匿されたまま
```

### Pattern 2: ZK-Structure Proof

```typescript
import { 
  generateZKStructureProof, 
  verifyZKStructureProof 
} from '@vey/core';

// PIDの階層構造が正しいことを証明
const structureProof = generateZKStructureProof(
  'JP-13-113-01-T07-B12-BN02-R342',
  'JP',    // 国コード（公開）
  8,       // 階層深度（公開）
  circuit
);

const isValidStructure = verifyZKStructureProof(
  structureProof,
  circuit,
  'JP' // 期待する国コード
);

console.log('PID構造は正当:', isValidStructure.valid);
// 階層の整合性が証明される
```

### Pattern 3: ZK-Selective Reveal Proof

```typescript
import { 
  generateZKSelectiveRevealProof, 
  verifyZKSelectiveRevealProof 
} from '@vey/core';

// 完全な住所（秘密情報）
const fullAddress = {
  country: 'JP',
  province: '13',
  city: 'Shibuya',
  postal_code: '150-0001',
  street_address: 'Dogenzaka 1-2-3',
  building: 'ABC Building',
  room: '501'
};

// ECサイトには国と郵便番号だけ公開
const selectiveProof = generateZKSelectiveRevealProof(
  userPid,
  fullAddress,
  ['country', 'postal_code'], // 公開するフィールド
  circuit
);

const verificationResult = verifyZKSelectiveRevealProof(
  selectiveProof,
  circuit
);

console.log('公開データ:', verificationResult.revealedData);
// { country: 'JP', postal_code: '150-0001' } のみ開示
// 残りの住所情報は秘匿
```

### Pattern 4: ZK-Version Proof

```typescript
import { 
  generateZKVersionProof, 
  verifyZKVersionProof 
} from '@vey/core';

// 引越し前後のPID
const oldPid = 'JP-13-113-01-T07-B12';
const newPid = 'JP-14-201-05-T03-B08';

// 所有者が同一であることを証明
const versionProof = generateZKVersionProof(
  oldPid,
  newPid,
  userDid,
  circuit
);

// 失効リストと照合して検証
const isValidTransition = verifyZKVersionProof(
  versionProof,
  circuit,
  revocationList
);

console.log('住所移行は正当:', isValidTransition.valid);
// 引越し後も継続してサービス利用可能
```

### Pattern 5: ZK-Locker Proof

```typescript
import { 
  generateZKLockerProof, 
  verifyZKLockerProof 
} from '@vey/core';

// ロッカー施設の全ロッカーID
const availableLockers = [
  'LOCKER-A-001',
  'LOCKER-A-002',
  // ...
  'LOCKER-A-100'
];

// 特定のロッカーへのアクセス権を証明
// （どのロッカーかは秘匿）
const lockerProof = generateZKLockerProof(
  'LOCKER-A-042',               // 実際のロッカーID（秘匿）
  'FACILITY-SHIBUYA-STATION',   // 施設ID（公開）
  availableLockers,
  circuit,
  'KANTO-TOKYO-SHIBUYA'         // ゾーン（公開）
);

const hasAccess = verifyZKLockerProof(
  lockerProof,
  circuit,
  'FACILITY-SHIBUYA-STATION'
);

console.log('ロッカーアクセス権:', hasAccess.valid);
// 具体的なロッカー番号は秘匿したまま
// 施設へのアクセス権が証明される
```

---

## API リファレンス

詳細なAPI仕様については、[API Documentation](./API.md) を参照してください。

## サンプルコード

実装例とユースケースについては、[Examples](../examples/zkp/) を参照してください。

## ライセンス

MIT License

## 参考文献

- [W3C Decentralized Identifiers](https://www.w3.org/TR/did-core/)
- [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/)
- [zk-SNARKs](https://z.cash/technology/zksnarks/)
- [Address Mapping Framework (AMF)](../schema/README.md)
