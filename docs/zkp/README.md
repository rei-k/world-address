# ZKP（ゼロ知識証明）アドレスプロトコル - 完全ガイド

## 目次

1. [概要](#概要)
2. [5つのZKPパターン](#5つのzkpパターン)
3. [システムアーキテクチャ](#システムアーキテクチャ)
4. [実装ガイド](#実装ガイド)
5. [ユースケース](#ユースケース)
6. [技術仕様](#技術仕様)
7. [デプロイメント](#デプロイメント)

---

## 概要

### ZKPアドレスプロトコルとは

ZKPアドレスプロトコルは、**ゼロ知識証明（Zero-Knowledge Proof）** 技術を活用した、プライバシー保護型の住所管理・配送システムです。このシステムにより、ユーザーの住所情報を秘匿したまま、配送の実行可能性を証明することができます。

### 主な特徴

- 🔐 **プライバシー保護**: 住所情報を公開せずに配送可能性を証明
- 🎯 **選択的開示**: ユーザーが必要な情報のみを開示
- 🔄 **引越し対応**: 住所変更時も継続してサービス利用可能
- 📦 **匿名配送**: ロッカー受取で完全な匿名性を実現
- ✅ **検証可能**: すべての証明は数学的に検証可能

### アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────────┐
│                    ZKP Address Protocol                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  User    │  │  Address │  │ EC Site  │  │ Carrier  │      │
│  │          │  │ Provider │  │          │  │          │      │
│  │ • DID    │  │          │  │          │  │          │      │
│  │ • Wallet │  │ • AMF    │  │ • Orders │  │ • Delivery│     │
│  │ • QR/NFC │  │ • ZKP    │  │ • Payment│  │ • Tracking│     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│       │             │              │              │            │
│       │             │              │              │            │
│       └─────────────┴──────────────┴──────────────┘            │
│                     │                                           │
│            ┌────────▼─────────┐                                │
│            │  ZKP Protocol    │                                │
│            │  5 Patterns      │                                │
│            │                  │                                │
│            │ 1. Membership    │                                │
│            │ 2. Structure     │                                │
│            │ 3. Selective     │                                │
│            │ 4. Version       │                                │
│            │ 5. Locker        │                                │
│            └──────────────────┘                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5つのZKPパターン

### パターン1: ZK-Membership Proof（住所存在証明）

**目的**: 住所が有効な住所セットに含まれることを証明

**技術**: Merkle Tree + zk-SNARK / Bulletproofs

**使用例**:
```typescript
// ECサイトに住所を見せずに「有効な配送先である」ことを証明
const proof = generateZKMembershipProof(
  userPid,
  allValidPids,
  circuit
);
// → ECサイトには Merkle Root のみ公開
```

**メリット**:
- ✅ 住所の具体的な内容は秘匿
- ✅ 登録済み住所であることを証明
- ✅ 軽量な検証プロセス

### パターン2: ZK-Structure Proof（PID階層証明）

**目的**: 住所のPID（階層的住所ID）が正しい構造を持つことを証明

**技術**: Halo2 / PLONK / zk-SNARK

**使用例**:
```typescript
// 国→都道府県→市区町村の階層構造が正当であることを証明
const proof = generateZKStructureProof(
  'JP-13-113-01-T07-B12-BN02-R342',
  'JP',  // 国コード（公開）
  8,     // 階層深度（公開）
  circuit
);
```

**メリット**:
- ✅ 住所写像論（AMF）の中核
- ✅ 各国固有の階層ルールに対応
- ✅ 配送ルーティングの最適化

### パターン3: ZK-Selective Reveal Proof（部分公開証明）

**目的**: ユーザーが選択したフィールドのみを開示

**技術**: SD-JWT (Selective Disclosure JWT) + zk-SNARK

**使用例**:
```typescript
// ECサイトには国と郵便番号だけ、配送業者には完全な住所を開示
const proof = generateZKSelectiveRevealProof(
  userPid,
  fullAddress,
  ['country', 'postal_code'], // ECサイトに公開
  circuit
);
// → ECサイト: { country: 'JP', postal_code: '150-0001' } のみ
// → 配送業者: 完全な住所（アクセス制御による）
```

**メリット**:
- ✅ ユーザー主権で開示範囲をコントロール
- ✅ 相手に応じた柔軟な開示
- ✅ GDPR/CCPA準拠

### パターン4: ZK-Version Proof（住所更新証明）

**目的**: 引越し後、旧PIDと新PIDの所有者が同一であることを証明

**技術**: zk-SNARK

**使用例**:
```typescript
// 引越し前後の整合性を保証
const proof = generateZKVersionProof(
  oldPid, // 旧住所PID
  newPid, // 新住所PID
  userDid,
  circuit
);
// → 旧住所の失効と新住所の有効性を同時に証明
// → QR/NFCで引越し後も継続利用可能
```

**メリット**:
- ✅ 住所変更時の継続性保証
- ✅ 旧住所の自動失効
- ✅ サービス断絶なし

### パターン5: ZK-Locker Proof（ロッカー所属証明）

**目的**: 特定のロッカー施設内のロッカーにアクセス権があることを証明

**技術**: ZK-Membership (Merkle Tree + zk-SNARK)

**使用例**:
```typescript
// どのロッカーかは秘匿したまま、施設内アクセス権を証明
const proof = generateZKLockerProof(
  'LOCKER-A-042',              // 具体的なロッカーID（秘匿）
  'FACILITY-SHIBUYA-STATION',  // 施設ID（公開）
  availableLockers,
  circuit,
  'KANTO-TOKYO-SHIBUYA'        // ゾーン（公開）
);
// → 配送業者は施設に配達
// → 具体的なロッカー番号は受取人のQR/NFCで開示
```

**メリット**:
- ✅ 匿名受け取りの実現
- ✅ PUDO（Pick Up Drop Off）ポイント管理
- ✅ プライバシー保護配送

---

## システムアーキテクチャ

### 主要コンポーネント

```
┌─────────────────────────────────────────────────────────────────┐
│                     Architecture Layers                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 1: User Interface                                        │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ • Mobile App (iOS/Android)                                │ │
│  │ • Web App (React/Vue)                                     │ │
│  │ • Mini-Program (WeChat/Alipay)                            │ │
│  │ • QR/NFC Reader                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                           │                                      │
│  Layer 2: Application Logic                                     │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ • Address Management (Veyvault)                           │ │
│  │ • E-Commerce Platform (VeyStore)                          │ │
│  │ • Delivery Management (VeyExpress)                        │ │
│  │ • Analytics (VeyAnalytics)                                │ │
│  └───────────────────────────────────────────────────────────┘ │
│                           │                                      │
│  Layer 3: ZKP Protocol                                          │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │ │
│  │ │ Prover      │ │ Verifier    │ │ Circuit     │         │ │
│  │ │             │ │             │ │ Management  │         │ │
│  │ │ • Generate  │ │ • Verify    │ │ • Groth16   │         │ │
│  │ │   Proof     │ │   Proof     │ │ • PLONK     │         │ │
│  │ │ • Witness   │ │ • Public    │ │ • Halo2     │         │ │
│  │ │   Creation  │ │   Inputs    │ │ • Circuits  │         │ │
│  │ └─────────────┘ └─────────────┘ └─────────────┘         │ │
│  └───────────────────────────────────────────────────────────┘ │
│                           │                                      │
│  Layer 4: Identity & Credentials                                │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ • DID (Decentralized Identifiers)                         │ │
│  │ • VC (Verifiable Credentials)                             │ │
│  │ • Revocation Lists                                        │ │
│  │ • Key Management (KMS/HSM)                                │ │
│  └───────────────────────────────────────────────────────────┘ │
│                           │                                      │
│  Layer 5: Data Layer                                            │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ • Address Database (PostgreSQL)                           │ │
│  │ • PID Registry (Redis)                                    │ │
│  │ • Audit Logs (MongoDB)                                    │ │
│  │ • Merkle Tree Storage                                     │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### セキュリティ層

```
┌─────────────────────────────────────────────────────────────────┐
│                    Security Architecture                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Transport Security (TLS 1.3, mTLS)                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Authentication & Authorization                            │  │
│  │ • OAuth 2.0 / OpenID Connect                             │  │
│  │ • DID-based Authentication                               │  │
│  │ • Role-Based Access Control (RBAC)                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Data Protection                                          │  │
│  │ • Zero-Knowledge Proofs (5 Patterns)                     │  │
│  │ • End-to-End Encryption (E2EE)                           │  │
│  │ • AES-256 Encryption at Rest                             │  │
│  │ • Field-Level Encryption                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Audit & Monitoring                                       │  │
│  │ • Access Logging (all PID resolutions)                   │  │
│  │ • Anomaly Detection                                      │  │
│  │ • Real-time Monitoring                                   │  │
│  │ • Compliance Reporting (GDPR/CCPA)                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 実装ガイド

実装の詳細については、以下のドキュメントを参照してください：

- [実装ガイド](./implementation-guide.md) - ステップバイステップの実装手順
- [API仕様](../zkp-api.md) - 詳細なAPI仕様
- [セキュリティガイド](./security-guide.md) - セキュリティのベストプラクティス

---

## ユースケース

### 1. EC配送での利用

**シナリオ**: オンラインショッピングで商品を購入

```
1. ユーザーが商品をカートに追加
2. チェックアウト時にVeyvaultから住所を選択
3. ZK-Membership Proofで配送可能性を証明（住所は非公開）
4. ECサイトは証明のみを保存（生住所は見ない）
5. 配送業者には必要時にのみ住所を開示
```

**使用パターン**: 
- ZK-Membership Proof（注文時）
- ZK-Selective Reveal Proof（配送業者への開示）

### 2. 匿名ロッカー配送

**シナリオ**: プライバシーを重視した配送

```
1. ユーザーが近隣のロッカー施設を選択
2. 特定のロッカーを予約
3. ZK-Locker Proofで施設内アクセス権を証明（ロッカー番号は秘匿）
4. 配送業者は施設まで配達
5. 受取時にQR/NFCで具体的なロッカー番号を開示
```

**使用パターン**:
- ZK-Locker Proof（予約時）
- QR/NFC（受取時）

### 3. 引越し時の住所更新

**シナリオ**: 引越し後も継続してサービス利用

```
1. ユーザーが新住所を登録
2. ZK-Version Proofで旧PIDと新PIDの所有者一致を証明
3. 旧PIDを失効リストに追加
4. 既存のQR/NFCコードは新住所に自動リダイレクト
5. サービス断絶なく継続利用
```

**使用パターン**:
- ZK-Version Proof（移行時）
- Revocation List（旧住所失効）

---

## 技術仕様

### ZKP技術スタック

| コンポーネント | 技術 | 用途 |
|--------------|------|------|
| Proof System | Groth16, PLONK, Halo2 | ZK証明の生成と検証 |
| Circuit Language | Circom | ZK回路の定義 |
| Membership | Merkle Tree + zk-SNARK | 集合所属証明 |
| Selective Disclosure | SD-JWT | 部分開示 |
| Identity | W3C DID/VC | 分散型識別子 |
| Signature | Ed25519, ECDSA | デジタル署名 |

### パフォーマンス指標

| 指標 | 値 |
|------|-----|
| 証明生成時間 | < 1秒 |
| 証明検証時間 | < 100ms |
| 証明サイズ | < 1KB |
| Merkle Tree深度 | 20層（100万アドレス対応） |

---

## デプロイメント

デプロイメントの詳細については、以下のドキュメントを参照してください：

- [デプロイメントガイド](./deployment-guide.md) - 本番環境へのデプロイ手順
- [運用ガイド](./operations-guide.md) - 運用とメンテナンス

---

## 関連リソース

### ドキュメント
- [ZKPプロトコル詳細](../zkp-protocol.md)
- [ZKP API仕様](../zkp-api.md)
- [実装例](../examples/zkp/)

### 外部リソース
- [W3C DID Core](https://www.w3.org/TR/did-core/)
- [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/)
- [Circom Documentation](https://docs.circom.io/)
- [snarkjs](https://github.com/iden3/snarkjs)

---

## ライセンス

MIT License

---

**最終更新**: 2024-12-07
