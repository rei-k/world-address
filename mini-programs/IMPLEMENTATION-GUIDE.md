# UI/UX 実装ガイド / UI/UX Implementation Guide

このドキュメントは、検索・スキャン中心の思想に基づくUI/UX設計の実装ガイドです。

**設計コンセプト**: 「Searchable. Scannable. Revocable. Compatible.」

---

## 概要 / Overview

### 設計思想 / Design Philosophy

**住所は書かせない。入力させない。**

すべての操作を4動作だけで完結:

1. **Search** - 検索
2. **Scan** - スキャン  
3. **Select** - 選択
4. **Confirm** - 確認

### 主要な特徴 / Key Features

- ✅ **入力フォーム不要**: 住所・決済情報の入力画面が存在しない
- ✅ **検索中心**: 友達住所のみを検索で選択
- ✅ **スキャン対応**: QR/NFCでシームレスな体験
- ✅ **提出権管理**: 生データではなく権限のみ扱う
- ✅ **失効の徹底**: 解除されたデータは3層から即座に排除
- ✅ **AI統合**: すべての操作でAIがサポート

---

## ドキュメント構成 / Documentation Structure

### 1. UI/UX設計 / UI/UX Design

**[UI-UX-DESIGN.md](./UI-UX-DESIGN.md)**

全体的なUI/UX設計思想と画面構成を定義:

- 左サイドメニュー構成
- ホーム画面（Scan + Search）
- 住所検索画面（縦一列、Default pinned）
- 決済トークン選択画面（入力不要）
- ギフト受取設定画面（期限ゲージ）
- Waybillプレビュー画面（互換性チェック）
- 権限管理画面（解除のみ）
- ナビゲーションフロー
- TypeScript型定義

### 2. Alipay実装 / Alipay Implementation

**[alipay/docs/UI-NAVIGATION.md](./alipay/docs/UI-NAVIGATION.md)**

Alipay Mini Program固有の実装詳細:

- Ant Design Mini コンポーネント
- AXML/ACSS/JS 実装例
- Alipay API統合（my.scan等）
- 芝麻信用連携
- Alipayブルー (#1677FF) テーマ

### 3. WeChat実装 / WeChat Implementation

**[wechat/docs/UI-NAVIGATION.md](./wechat/docs/UI-NAVIGATION.md)**

WeChat Mini Program固有の実装詳細:

- WeUI コンポーネント
- WXML/WXSS/JS 実装例
- WeChat API統合（wx.scanCode等）
- Template Message
- 友達共有機能
- WeChatグリーン (#07C160) テーマ

### 4. デザイントークン / Design Tokens

**[DESIGN-TOKENS.md](./DESIGN-TOKENS.md)**

プラットフォーム全体で使用するデザイン定数:

- カラーパレット（Alipay & WeChat）
- タイポグラフィ（フォント、サイズ、ウェイト）
- スペーシング（余白、間隔）
- ボーダー（幅、半径、スタイル）
- シャドウ（ボタン、カード）
- トランジション & アニメーション
- ボタンスタイル
- カードスタイル
- インプットスタイル
- バッジスタイル

### 5. アクセシビリティ / Accessibility

**[ACCESSIBILITY.md](./ACCESSIBILITY.md)**

WCAG 2.1 AA準拠のアクセシビリティガイドライン:

- 色とコントラスト（4.5:1以上）
- タッチターゲット（最小44×44pt）
- フォーカス管理
- スクリーンリーダー対応（ARIA属性）
- 代替テキスト
- キーボードナビゲーション
- エラーメッセージ
- テストチェックリスト

---

## クイックスタート / Quick Start

### Alipay Mini Program

```bash
# プロジェクト作成
cd mini-programs/alipay
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build
```

### WeChat Mini Program

```bash
# プロジェクト作成
cd mini-programs/wechat
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build
```

---

## 実装チェックリスト / Implementation Checklist

### 画面実装 / Screen Implementation

- [ ] **ホーム画面**
  - [ ] Scanボタン（QR/NFC）
  - [ ] Search Addressボタン
  - [ ] AI意図予測機能

- [ ] **住所検索画面**
  - [ ] 検索ボックス（名前/国/タグ/グループ）
  - [ ] Default住所（ピン固定）
  - [ ] 友達住所リスト（縦一列）
  - [ ] PID照合自動実行

- [ ] **決済トークン選択画面**
  - [ ] 保存済みトークン一覧
  - [ ] AI推薦トークン
  - [ ] カード番号入力欄なし

- [ ] **ギフト受取設定画面**
  - [ ] 期限ゲージ
  - [ ] 受取場所候補
  - [ ] 確定ボタン
  - [ ] 期限切れ自動キャンセル

- [ ] **Waybillプレビュー画面**
  - [ ] 宛先PID表示
  - [ ] 決済トークンID表示
  - [ ] 追跡ハッシュ表示
  - [ ] QRコード表示
  - [ ] 互換性チェック

- [ ] **権限管理画面**
  - [ ] アクティブな提出権一覧
  - [ ] 解除ボタン
  - [ ] AI抽出の解除理由
  - [ ] 解除済み一覧

### UI/UX要件 / UI/UX Requirements

- [ ] **認知負荷削減**
  - [ ] アイコン + 短いラベル
  - [ ] 一画面一アクション
  - [ ] 分岐の最小化

- [ ] **検索/スキャン中心**
  - [ ] 入力フォーム不要
  - [ ] 検索のみで完結
  - [ ] QR/NFC対応

- [ ] **提出権管理**
  - [ ] 生データ非表示
  - [ ] PIDのみ表示
  - [ ] 失効の3層排除

### デザイントークン / Design Tokens

- [ ] **カラー**
  - [ ] Alipayブルー (#1677FF)
  - [ ] WeChatグリーン (#07C160)
  - [ ] コントラスト比 4.5:1以上

- [ ] **タイポグラフィ**
  - [ ] 最小フォントサイズ 28rpx (14px)
  - [ ] 行間 1.5以上

- [ ] **スペーシング**
  - [ ] 一貫した余白
  - [ ] タッチターゲット最小 88rpx (44px)

### アクセシビリティ / Accessibility

- [ ] **WCAG 2.1 AA準拠**
  - [ ] コントラスト比チェック
  - [ ] タッチターゲットサイズ
  - [ ] フォーカス表示
  - [ ] ARIA属性

- [ ] **スクリーンリーダー**
  - [ ] 代替テキスト
  - [ ] role属性
  - [ ] aria-label

- [ ] **キーボード操作**
  - [ ] Tab移動
  - [ ] Enter/Space選択
  - [ ] Escapeキャンセル

---

## 実装例 / Implementation Examples

### ホーム画面 / Home Screen

#### Alipay (AXML)

```xml
<view class="home-container">
  <view class="scan-section">
    <button class="scan-button" onTap="handleScan">
      <icon type="scan" size="40" color="#1677FF" />
      <text class="scan-label">スキャン</text>
    </button>
  </view>
  
  <view class="search-section">
    <button class="search-button" onTap="handleSearchAddress">
      <icon type="search" size="24" color="#1677FF" />
      <text class="search-label">住所を検索</text>
    </button>
  </view>
</view>
```

#### WeChat (WXML)

```xml
<view class="home-container">
  <view class="scan-section">
    <button class="scan-button" bindtap="handleScan">
      <icon type="scan" size="40" color="#07C160" />
      <text class="scan-label">スキャン</text>
    </button>
  </view>
  
  <view class="search-section">
    <button class="search-button" bindtap="handleSearchAddress">
      <icon type="search" size="24" color="#07C160" />
      <text class="search-label">住所を検索</text>
    </button>
  </view>
</view>
```

### スタイル / Styles

#### Alipay (ACSS)

```css
.scan-button {
  width: 320rpx;
  height: 320rpx;
  border-radius: 160rpx;
  background: #1677FF;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 16rpx rgba(22, 119, 255, 0.3);
}
```

#### WeChat (WXSS)

```css
.scan-button {
  width: 320rpx;
  height: 320rpx;
  border-radius: 160rpx;
  background: #07C160;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 16rpx rgba(7, 193, 96, 0.3);
}

.scan-button::after {
  border: none;
}
```

---

## テスト / Testing

### ユニットテスト / Unit Tests

```typescript
// pages/home/index.test.js
describe('Home Screen', () => {
  it('should call handleScan when scan button is tapped', () => {
    const page = createPage();
    const spy = jest.spyOn(page, 'handleScan');
    
    page.onLoad();
    page.handleScan();
    
    expect(spy).toHaveBeenCalled();
  });
});
```

### アクセシビリティテスト / Accessibility Tests

```typescript
// accessibility.test.js
import { axe } from 'jest-axe';

describe('Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
  
  it('should have sufficient color contrast', () => {
    const button = document.querySelector('.primary-button');
    const contrast = getContrastRatio(button);
    expect(contrast).toBeGreaterThanOrEqual(4.5);
  });
});
```

---

## パフォーマンス / Performance

### 最適化のベストプラクティス / Optimization Best Practices

1. **画像最適化**
   - WebP形式を使用
   - 適切なサイズにリサイズ
   - 遅延読み込み

2. **コード分割**
   - ページごとに分割
   - 必要な時だけロード

3. **キャッシュ戦略**
   - 静的リソースをキャッシュ
   - APIレスポンスをキャッシュ

4. **レンダリング最適化**
   - 不要な再レンダリングを避ける
   - Virtual List使用

---

## デプロイ / Deployment

### Alipay Mini Program

```bash
# ビルド
npm run build

# Alipay開発者コンソールにアップロード
# https://open.alipay.com/
```

### WeChat Mini Program

```bash
# ビルド
npm run build

# WeChat開発者ツールでアップロード
# https://mp.weixin.qq.com/
```

---

## トラブルシューティング / Troubleshooting

### よくある問題 / Common Issues

1. **スキャンが動作しない**
   - カメラ権限を確認
   - HTTPS環境か確認

2. **コントラスト比不足**
   - Design Tokensを確認
   - カラーを調整

3. **タッチターゲットが小さい**
   - 最小サイズ88rpx (44px)を確認
   - パディングを追加

---

## 貢献 / Contributing

改善提案や不具合報告は、GitHubのIssueで受け付けています。

### 貢献ガイドライン / Contribution Guidelines

1. Issueを作成
2. フィーチャーブランチを作成
3. 変更を実装
4. テストを追加
5. Pull Requestを作成

---

## ライセンス / License

MIT License

---

## 関連リンク / Related Links

### 公式ドキュメント

- [Alipay Mini Program](https://opendocs.alipay.com/mini/developer)
- [WeChat Mini Program](https://developers.weixin.qq.com/miniprogram/dev/framework/)

### ツール

- [Ant Design Mini](https://mini.ant.design/)
- [WeUI](https://weui.io/)
- [axe-core](https://github.com/dequelabs/axe-core)

### リファレンス

- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design](https://material.io/design)

---

## サポート / Support

質問やサポートが必要な場合:

- GitHub Discussions
- Email: support@vey.example

---

最終更新: 2025-12-03
バージョン: 1.0.0
