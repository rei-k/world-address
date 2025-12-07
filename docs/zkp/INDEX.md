# ZKP（ゼロ知識証明）アドレスプロトコル - ドキュメント索引

## 📚 完全なドキュメントリスト

### 1. 概要・導入

| ドキュメント | 説明 | 対象読者 |
|------------|------|---------|
| [README.md](./README.md) | ZKPアドレスプロトコルの全体概要 | すべての人 |
| [5つのZKPパターン図](./diagrams/zkp-patterns.svg) | 5つのZKPパターンの詳細図 | 技術者・アーキテクト |
| [エコシステム全体図](./diagrams/ecosystem-overview.svg) | システム全体の構成図 | すべての人 |

### 2. システムアーキテクチャ

| ドキュメント | 説明 | 対象読者 |
|------------|------|---------|
| [アーキテクチャ図](./diagrams/architecture.svg) | 5層アーキテクチャの詳細 | アーキテクト・開発者 |
| [データフローシーケンス図](./diagrams/data-flow-sequence.svg) | EC注文から配送までの完全フロー | 開発者・プロダクトマネージャー |

### 3. 実装ガイド

| ドキュメント | 説明 | 対象読者 |
|------------|------|---------|
| [実装ガイド](./implementation-guide.md) | ステップバイステップの実装手順 | 開発者 |
| [ZKP API仕様](../zkp-api.md) | 詳細なAPI仕様 | 開発者 |
| [実装例](../examples/zkp/) | サンプルコード集 | 開発者 |

### 4. セキュリティ

| ドキュメント | 説明 | 対象読者 |
|------------|------|---------|
| [セキュリティガイド](./security-guide.md) | セキュリティのベストプラクティス | セキュリティエンジニア・開発者 |

### 5. ユースケース

| ドキュメント | 説明 | 対象読者 |
|------------|------|---------|
| [ユースケース集](./use-cases.md) | 実際の利用シナリオ6例 | プロダクトマネージャー・ビジネス |

### 6. 運用・デプロイ

| ドキュメント | 説明 | 対象読者 |
|------------|------|---------|
| [デプロイメントガイド](./deployment-guide.md) | 本番環境へのデプロイ手順 | DevOps・インフラエンジニア |
| [運用ガイド](./operations-guide.md) | 監視とメンテナンス | SRE・運用担当者 |

---

## 🎯 目的別ガイド

### ZKPアドレスプロトコルを理解したい

1. [README.md](./README.md) - 概要を把握
2. [エコシステム全体図](./diagrams/ecosystem-overview.svg) - ビジュアルで理解
3. [ユースケース集](./use-cases.md) - 実際の利用シーンを確認

### 実装を始めたい開発者

1. [実装ガイド](./implementation-guide.md) - 開発環境のセットアップ
2. [ZKP API仕様](../zkp-api.md) - API詳細
3. [実装例](../examples/zkp/) - サンプルコード
4. [アーキテクチャ図](./diagrams/architecture.svg) - システム構造の把握

### セキュリティを確保したい

1. [セキュリティガイド](./security-guide.md) - ベストプラクティス
2. [データフローシーケンス図](./diagrams/data-flow-sequence.svg) - データの流れを確認
3. [監査ログ実装例](./security-guide.md#監査とコンプライアンス)

### 本番環境にデプロイしたい

1. [デプロイメントガイド](./deployment-guide.md) - デプロイ手順
2. [運用ガイド](./operations-guide.md) - 監視とメンテナンス
3. [セキュリティガイド](./security-guide.md) - セキュリティチェックリスト

---

## 📊 ダイアグラム一覧

### 1. エコシステム全体図
**ファイル**: `diagrams/ecosystem-overview.svg`

全体像を俯瞰するための包括的なダイアグラム
- ユーザー、アドレスプロバイダ、ECサイト、配送業者の関係
- 5つのZKPパターン
- セキュリティ層
- データストレージ層

### 2. システムアーキテクチャ図
**ファイル**: `diagrams/architecture.svg`

5層アーキテクチャの詳細
- Layer 1: ユーザーインターフェース
- Layer 2: アプリケーションロジック
- Layer 3: ZKPプロトコル（★コア機能★）
- Layer 4: ID・クレデンシャル
- Layer 5: データ層

### 3. 5つのZKPパターン詳細図
**ファイル**: `diagrams/zkp-patterns.svg`

各ZKPパターンの詳細説明
- Pattern 1: ZK-Membership Proof（住所存在証明）
- Pattern 2: ZK-Structure Proof（PID階層証明）
- Pattern 3: ZK-Selective Reveal Proof（部分公開証明）
- Pattern 4: ZK-Version Proof（住所更新証明）
- Pattern 5: ZK-Locker Proof（ロッカー所属証明）

### 4. データフローシーケンス図
**ファイル**: `diagrams/data-flow-sequence.svg`

EC注文から配送完了までの完全なシーケンス
- フェーズ1: 住所登録・認証
- フェーズ2: EC注文・ZK証明生成
- フェーズ3: 決済・送り状発行
- フェーズ4: 配送実行・PID解決
- フェーズ5: 配送追跡
- フェーズ6: 住所更新（オプション）

---

## 🔑 重要な概念

### PID (Place ID)
階層的住所識別子。例: `JP-13-113-01-T07-B12-BN02-R342`
- 国 → 都道府県 → 市区町村 → ... の階層構造
- プライバシーを保護しながら住所を一意に識別

### ZKP (Zero-Knowledge Proof)
ゼロ知識証明。情報そのものを公開せずに、その情報の性質を証明する技術
- 住所が有効であることを証明（住所自体は秘匿）
- 配送可能性を証明（詳細な住所は非公開）

### DID (Decentralized Identifier)
分散型識別子。例: `did:web:vey.example`
- 中央集権的な認証局に依存しない
- ユーザーが自分のIDを管理

### VC (Verifiable Credential)
検証可能資格証明
- デジタル署名により改ざん検知可能
- 住所が正規に検証されたことを証明

### Merkle Tree
効率的なメンバーシップ証明のためのデータ構造
- 100万アドレスに対応
- 証明生成・検証が高速

---

## 🚀 クイックスタート

### 1. 開発者向け

```bash
# リポジトリのクローン
git clone https://github.com/rei-k/world-address.git
cd world-address

# 依存関係のインストール
npm install

# SDKの使用例
cd sdk/core
npm install
npm run build

# サンプル実行
npx tsx docs/examples/zkp/complete-flow.ts
```

### 2. ECサイト統合

```typescript
import { VeyAddressClient } from '@vey/core';

const client = new VeyAddressClient({
  providerUrl: 'https://address-provider.vey.example',
  apiKey: process.env.VEY_API_KEY,
});

// チェックアウト時の住所検証
const result = await client.validateShipping({
  pidToken: userPidToken,
  conditions: {
    allowedCountries: ['JP'],
    allowedRegions: ['13', '14'],
  },
});

if (result.valid) {
  // 注文確定（ZK証明のみを保存）
  await saveOrder({
    pidToken: result.pidToken,
    zkProof: result.zkProof,
  });
}
```

### 3. 配送業者統合

```typescript
import { VeyCarrierClient } from '@vey/carrier-sdk';

const client = new VeyCarrierClient({
  did: 'did:web:carrier.example',
  privateKey: process.env.CARRIER_PRIVATE_KEY,
});

// ラストワンマイル配送時のPID解決
const address = await client.resolvePID({
  pidToken,
  reason: 'last-mile-delivery',
});

// 配送ナビゲーションに住所を設定
await deliveryNav.setDestination(address);
```

---

## 📖 用語集

### AMF (Address Mapping Framework)
住所写像論。世界中の住所を階層的に正規化するフレームワーク

### Groth16
zk-SNARKの効率的な実装。証明サイズが小さく検証が高速

### PLONK
Universal Setup可能なzk-SNARK。Trusted Setupの簡略化

### Halo2
Recursive zk-SNARKs。Trusted Setup不要

### SD-JWT (Selective Disclosure JWT)
選択的開示JWT。一部のクレームのみを開示可能

### Trusted Setup
ZK証明システムの初期化儀式。セキュリティの基盤

### Witness
ZK証明の秘密入力。証明者のみが知る情報

---

## 🆘 サポート

### 技術的な質問
- GitHub Issues: https://github.com/rei-k/world-address/issues
- ドキュメント: https://docs.vey.example

### コミュニティ
- Discord: https://discord.gg/vey
- Stack Overflow: タグ `vey-zkp`

### 商用サポート
- Email: enterprise@vey.example
- Website: https://vey.example/enterprise

---

## 📝 ライセンス

MIT License

---

## 🔄 更新履歴

### 2024-12-07
- 包括的なZKPドキュメント作成
- 5つのZKPパターンの詳細図追加
- システムアーキテクチャ図追加
- データフローシーケンス図追加
- 実装ガイド作成
- セキュリティガイド作成
- ユースケース集作成
- エコシステム全体図追加

---

**最終更新**: 2024-12-07

**作成者**: Vey Development Team
