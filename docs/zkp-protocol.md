# ZKP Address Protocol

## 概要 (Overview)

ZKPアドレスプロトコルは、ゼロ知識証明（Zero-Knowledge Proof）を活用した、プライバシー保護型の住所管理・配送システムです。

このプロトコルは4つの主要なフローで構成されています：

1. **住所登録・認証フロー** - ユーザーが住所を登録し、検証済みの住所クレデンシャルを取得
2. **配送依頼・送り状発行フロー** - ECサイトが配送先の有効性をZK証明で確認
3. **配送実行・追跡フロー** - キャリアが必要な範囲でのみ住所情報にアクセス
4. **住所更新・失効フロー** - 住所変更時の安全な更新と旧住所の失効

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
- **ZK Proof System**: Groth16 / PLONK / Halo2
- **回路**: 国コード、地域コード、座標範囲判定、配送可否フラグ、失効リスト非包含証明
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
- [ ] 実際のZK回路実装（Groth16/PLONK）
- [ ] 国コード・都道府県レベルの配送可否ZK証明
- [ ] 基本的な失効リスト

### v3.0
- [ ] ポリゴン内判定のZK化
- [ ] 危険区域除外の高度な制約
- [ ] Merkle Tree / Accumulatorベースの失効リスト

### v4.0
- [ ] DID/VC完全連携
- [ ] マルチキャリア対応
- [ ] ユーザー主権型住所VC
- [ ] クロスボーダー配送対応

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
