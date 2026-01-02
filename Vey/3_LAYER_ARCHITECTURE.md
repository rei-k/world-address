# Vey 3層アーキテクチャ仕様 / Vey 3-Layer Architecture Specification

**Version:** 1.0.0  
**Date:** 2026-01-02  
**Status:** Final Specification

---

## 📋 目次 / Table of Contents

- [設計思想 / Design Philosophy](#設計思想--design-philosophy)
- [3層構造の概要 / 3-Layer Overview](#3層構造の概要--3-layer-overview)
- [第1層：通信プロトコル / Layer 1: Communication Protocol](#第1層通信プロトコル--layer-1-communication-protocol)
- [第2層：住所帳 / Layer 2: Address Book](#第2層住所帳--layer-2-address-book)
- [第3層：ゼロ知識証明 / Layer 3: Zero-Knowledge Proof](#第3層ゼロ知識証明--layer-3-zero-knowledge-proof)
- [なぜ3層が必要か / Why 3 Layers](#なぜ3層が必要か--why-3-layers)
- [利用条件 / Prerequisites](#利用条件--prerequisites)
- [実装ガイド / Implementation Guide](#実装ガイド--implementation-guide)

---

## 🎯 設計思想 / Design Philosophy

### 一文で言える設計思想 / Design Philosophy in One Sentence

> **「配送は通信で動かし、信頼は住所帳で感じさせ、その裏側だけをゼロ知識で支える」**
>
> **"Delivery via protocol, trust via address book, proof via ZKP behind the scenes"**

### Veyの本質 / The Essence of Vey

**Veyは暗号プロジェクトではなく、配送インフラです。**

**Vey is delivery infrastructure, not a cryptography project.**

ゼロ知識証明（ZKP）は重要な技術ですが、それはあくまで裏側の技術です。ユーザーが意識すべきは「住所を教えずに配送できる」という結果であり、ZKPという技術用語ではありません。

Zero-Knowledge Proof (ZKP) is an important technology, but it's a behind-the-scenes technology. Users should focus on the result — "delivery without revealing addresses" — not the technical term "ZKP".

---

## 🏗️ 3層構造の概要 / 3-Layer Overview

Veyエコシステムは、役割を明確に分離した3つの層で構成されています：

The Vey ecosystem consists of three layers with clearly separated roles:

```
┌─────────────────────────────────────────────────────────┐
│                    Vey Ecosystem                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  👤 人間の信頼 / Human Trust                             │
│  ┌───────────────────────────────────────────────────┐ │
│  │  第2層：住所帳 (Address Book)                       │ │
│  │  • UX・人間的な信頼                                  │
│  │  • 「この人には以前も送った」                          │
│  │  • ニックネーム・タグ・メモ管理                        │
│  └───────────────────────────────────────────────────┘ │
│          ↑ サポート / Support                          │
│  🔐 技術的信頼 / Technical Trust                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  第3層：ゼロ知識証明 (ZKP)                          │ │
│  │  • 事実の裏取り専用                                  │
│  │  • 配送実績の証明                                   │
│  │  • ユーザーに見せない技術                            │
│  └───────────────────────────────────────────────────┘ │
│          ↑ 証明 / Proof                                │
│  ⚙️ 実務 / Operation                                    │
│  ┌───────────────────────────────────────────────────┐ │
│  │  第1層：通信プロトコル (Communication Protocol)       │ │
│  │  • 配送を動かす中核                                  │
│  │  • 単純・高速・確実                                  │
│  │  • ZKPは使わない                                    │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 層の特徴 / Layer Characteristics

| 層 / Layer | 優先順位 / Priority | ユーザー認知 / User Awareness | 技術的複雑さ / Complexity |
|-----------|-------------------|----------------------------|------------------------|
| **第1層：通信プロトコル** | 最高（必須） | 意識しない | 低 (Simple) |
| **第2層：住所帳** | 高 | 常に意識する | 低 (User-friendly) |
| **第3層：ZKP** | 中（オプション） | 意識しない | 高 (Complex) |

---

## 📡 第1層：通信プロトコル / Layer 1: Communication Protocol

### 役割 / Role

**配送を動かす中核**  
**The core that makes delivery work**

送り状作成と配送実行の本体。配送が「送れる」ことを最優先します。

The core of waybill creation and delivery execution. Priority is "ability to send".

### 設計方針 / Design Principles

1. **単純 / Simple**: 余計な機能を入れない
2. **高速 / Fast**: レスポンスタイムを最小化
3. **確実 / Reliable**: 配送が確実に動く

### 技術的特徴 / Technical Features

- **ZKPは使わない / No ZKP**: 通信層では暗号証明を使用しない
- **優先順位 / Priority**: 配送の成立が最優先
- **プロトコル / Protocol**: ConveyID プロトコル（メールのようなID）

### フロー / Flow

```
送り手 → Delivery ID 入力
    ↓
Vey → 実住所を解決 (Address Resolution)
    ↓
配送業者 → ラストマイル配送 (Last-mile Delivery)
```

### 実装 / Implementation

- **ConveyID プロトコル**: `alice@convey` のような配送ID
- **住所解決サービス**: Delivery IDを実住所に変換
- **配送業者API連携**: 実際の配送を実行

**詳細ドキュメント / Detailed Documentation**:
- [CONVEY_PROTOCOL.md](./CONVEY_PROTOCOL.md)

---

## 👥 第2層：住所帳 / Layer 2: Address Book

### 役割 / Role

**UXと関係性の層**  
**UX and relationship layer**

人間が「安心して送れる」ための層。技術的な信頼ではなく、人間の記憶・関係性の拡張です。

A layer for humans to "feel safe sending". Not technical trust, but an extension of human memory and relationships.

### 本質 / Essence

**メールの「連絡先帳」と同じ立ち位置**  
**Same position as email's "contacts"**

メールで連絡先を管理するように、配送先も住所帳で管理します。

Just as you manage contacts for email, manage delivery destinations with an address book.

### 機能 / Features

1. **関係性管理 / Relationship Management**
   - 「この人には以前も送った」
   - "I've sent to this person before"

2. **識別情報 / Identification**
   - 「このDelivery IDは◯◯さん」
   - "This Delivery ID is Mr./Ms. XX"

3. **メモ管理 / Note Management**
   - ニックネーム・タグ・メモ
   - Nicknames, tags, notes

### UX表現 / UX Presentation

技術用語を使わず、人間的な言葉で表現します：

Use human-friendly language, not technical terms:

| ❌ 技術用語 | ✅ 人間的な表現 |
|-----------|--------------|
| "ZKP検証済み" | "配達実績あり" |
| "ゼロ知識証明" | "確認済み" |
| "Merkle tree" | （表示しない） |
| "Proof verification" | "信頼できる配送先" |

### 実装 / Implementation

- **Veyvault アプリケーション**: クラウド住所帳
- **QR/NFC共有**: 住所を見せずに友達追加
- **配送履歴**: 過去の配送記録の表示（ZKPは裏側）

**詳細ドキュメント / Detailed Documentation**:
- [apps/Veyvault/README.md](./apps/Veyvault/README.md)

---

## 🔐 第3層：ゼロ知識証明 / Layer 3: Zero-Knowledge Proof

### 役割 / Role

**信頼の下支え（オプション）**  
**Trust support (Optional)**

住所帳を裏側から補強するためだけに使います。ユーザーには見せない技術です。

Used only to reinforce the address book from behind the scenes. Technology invisible to users.

### 使いどころ / Use Cases

1. **配送実績の証明 / Delivery History Proof**
   - 「このDelivery IDは実在住所に到達した実績がある」
   - "This Delivery ID has reached a real address"

2. **信頼性の証明 / Reliability Proof**
   - 「捨てIDや架空住所ではない」
   - "Not a disposable ID or fake address"

3. **出荷元の証明 / Sender Proof**
   - 「この出荷元は過去に正常配送している」
   - "This sender has successfully delivered before"

### 重要な制約 / Important Constraints

**ユーザーにZKPを意識させない**  
**Don't make users aware of ZKP**

1. UIでは技術用語を出さない
2. 表の言葉は「配達実績あり」「確認済み」
3. 裏側でZKPを使う

**Do not use technical terms in UI**

### 表示例 / Display Examples

```
✅ 配達実績あり (Delivery History Confirmed)
✅ 確認済み (Verified)
✅ 信頼できる配送先 (Trusted Destination)
```

### 実装 / Implementation

- **ZKP回路**: Circom + Groth16
- **5つの証明パターン**:
  1. Membership Proof（所属証明）
  2. Structure Proof（構造証明）
  3. Selective Reveal Proof（選択的開示）
  4. Version Proof（バージョン証明）
  5. Locker Proof（ロッカー証明）

**詳細ドキュメント / Detailed Documentation**:
- [ZKP_COMPLETION_REPORT.md](../ZKP_COMPLETION_REPORT.md)
- [docs/zkp/COMPLETE_IMPLEMENTATION.md](../docs/zkp/COMPLETE_IMPLEMENTATION.md)

---

## 🤔 なぜ3層が必要か / Why 3 Layers

### 単一層の問題点 / Single Layer Problems

#### 通信だけ / Protocol Only
- ❌ 匿名すぎて不安
- ❌ 初回取引に弱い
- ❌ 信頼関係が構築できない

#### 住所帳だけ / Address Book Only
- ❌ 個人的な信頼に閉じる
- ❌ 新規・第三者に弱い
- ❌ 技術的な証明がない

#### ZKPだけ / ZKP Only
- ❌ 重い・複雑
- ❌ 分かりにくい
- ❌ 日常配送には過剰

### 3層の組み合わせ効果 / Combined Effect of 3 Layers

**👉 3つを組み合わせることで欠点が消える**  
**👉 Combining all three eliminates weaknesses**

```
第1層（通信）: 配送を確実に動かす
    ↓
第3層（ZKP）: 技術的な信頼を提供
    ↓
第2層（住所帳）: 人間が安心して使える
```

### Veyらしい全体像 / The Vey Way

```
[人間の信頼 / Human Trust]
   相手の住所帳 (Address Book)
         ↑ サポート
[技術的信頼 / Technical Trust]
   ZKP（配送実績の証明）
         ↑ 証明
[実務 / Operation]
   配送通信プロトコル (Delivery Protocol)

下に行くほど機械的・自動
上に行くほど人間的・感覚的

Bottom: Machine-driven, automated
Top: Human-driven, intuitive
```

---

## ✅ 利用条件 / Prerequisites

Veyの配送システムを利用するには、以下の条件が必要です：

To use the Vey delivery system, the following conditions are required:

### Veyvaultに配送実績があること / Delivery History in Veyvault

以下いずれかで「実際に届いた履歴」があること：

Have "actual delivery history" through one of the following:

1. **VeyPOS を使った配送**
   - 店舗・POSシステムからの配送実績
   - Delivery history from store/POS system

2. **Veyform を使った住所入力による配送**
   - フォーム経由の住所入力と配送
   - Address input and delivery via forms

### 前提条件の意味 / Meaning of Prerequisites

**→ 「実在住所に到達したことがある」という事実が前提**  
**→ Prerequisite: "Has reached a real address before"**

この前提により、ZKP層が「配送実績あり」を証明できます。

This prerequisite allows the ZKP layer to prove "delivery history confirmed".

---

## 🛠️ 実装ガイド / Implementation Guide

### アプリケーション開発者向け / For Application Developers

#### 第1層（通信）の実装 / Layer 1 Implementation

```typescript
import { ConveyIDResolver } from '@vey/core';

// Delivery ID を実住所に解決
const address = await ConveyIDResolver.resolve('alice@convey');

// 配送業者APIに送信
await deliveryCarrier.ship({
  to: address,
  from: senderAddress,
  package: packageInfo
});
```

#### 第2層（住所帳）の実装 / Layer 2 Implementation

```typescript
import { Veyvault } from '@vey/veyvault';

// ユーザーの住所帳を取得
const addressBook = await Veyvault.getAddressBook(userId);

// 友達リストを表示（ZKP情報は裏側）
const friends = addressBook.getFriends();
friends.forEach(friend => {
  console.log(`${friend.nickname} - ${friend.deliveryId}`);
  // UI: "配達実績あり" と表示（ZKPは見せない）
  if (friend.isVerified) {
    console.log('✅ 配達実績あり');
  }
});
```

#### 第3層（ZKP）の実装 / Layer 3 Implementation

```typescript
import { generateCircomMembershipProof } from '@vey/core/zkp-circuits';

// 裏側でZKP証明を生成（UIには見せない）
const { proof, publicSignals } = await generateCircomMembershipProof(
  customerAddress,
  deliverableAddresses
);

// 証明を検証
const isValid = await verifyCircomMembershipProof(proof, publicSignals);

// UIには結果だけを表示
return {
  deliveryId: 'alice@convey',
  verified: isValid,
  displayText: isValid ? '配達実績あり' : '未確認'
};
```

### UX設計者向け / For UX Designers

#### 表の言葉（UIで使う） / User-Facing Language

| 状況 / Situation | 表示テキスト / Display Text |
|-----------------|--------------------------|
| ZKP検証成功 | "配達実績あり" / "Delivery History Confirmed" |
| ZKP検証成功 | "確認済み" / "Verified" |
| ZKP検証成功 | "信頼できる配送先" / "Trusted Destination" |
| ZKP検証失敗 | "未確認" / "Unverified" |
| 配送実績なし | "初回配送" / "First Delivery" |

#### 裏の技術（UIで使わない） / Technical Terms (Not in UI)

- ❌ "Zero-Knowledge Proof"
- ❌ "ZKP"
- ❌ "ゼロ知識証明"
- ❌ "Merkle tree"
- ❌ "Proof verification"

---

## 🎯 まとめ / Summary

### Veyの設計思想を一言で / Vey Design Philosophy in One Sentence

> **「配送は通信で動かし、信頼は住所帳で感じさせ、その裏側だけをゼロ知識で支える」**
>
> **"Delivery via protocol, trust via address book, proof via ZKP behind the scenes"**

### 各層の役割 / Role of Each Layer

1. **通信プロトコル**: 配送を確実に動かす（必須）
2. **住所帳**: 人間が安心して使える（推奨）
3. **ZKP**: 技術的な信頼を裏側で支える（オプション）

**Protocol**: Make delivery work reliably (Required)  
**Address Book**: Make humans feel safe (Recommended)  
**ZKP**: Support technical trust behind the scenes (Optional)

### Veyの本質 / The Essence of Vey

**Veyは暗号プロジェクトではなく、配送インフラ**

**Vey is delivery infrastructure, not a crypto project**

---

## 📚 関連ドキュメント / Related Documentation

- [ConveyID Protocol Specification](./CONVEY_PROTOCOL.md) - 第1層の詳細
- [Veyvault Application](./apps/Veyvault/README.md) - 第2層の実装
- [ZKP Implementation](../docs/zkp/COMPLETE_IMPLEMENTATION.md) - 第3層の技術詳細
- [Vey Ecosystem Overview](./README.md) - エコシステム全体

---

## 📞 お問い合わせ / Contact

**質問・フィードバック / Questions & Feedback**:
- GitHub Issues: [world-address Issues](https://github.com/rei-k/world-address/issues)
- Email: vey-team@example.com

---

## ⚖️ ライセンス / License

MIT License - See [LICENSE](../LICENSE)

Copyright (c) 2024-2026 Vey Team & Contributors
