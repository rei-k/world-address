# アクセシビリティガイドライン / Accessibility Guidelines

このドキュメントは、Alipay Mini Program と WeChat Mini Program におけるアクセシビリティガイドラインを定義します。

**原則**: すべてのユーザーが利用可能なUI

---

## アクセシビリティの原則 / Accessibility Principles

### WCAG 2.1 準拠 / WCAG 2.1 Compliance

レベルAA準拠を目指します:

```typescript
interface WCAGCompliance {
  level: 'AA';
  
  principles: {
    perceivable: '知覚可能';      // 情報とUIコンポーネントは知覚可能であること
    operable: '操作可能';         // UIコンポーネントとナビゲーションは操作可能であること
    understandable: '理解可能';   // 情報とUIの操作は理解可能であること
    robust: '堅牢';              // コンテンツは堅牢であること
  };
}
```

---

## 色とコントラスト / Color and Contrast

### コントラスト比 / Contrast Ratio

```typescript
interface ContrastRequirements {
  // WCAG AA基準
  normalText: {
    minimum: 4.5;      // 通常テキスト
    enhanced: 7.0;     // AAA基準（推奨）
  };
  
  largeText: {
    minimum: 3.0;      // 大きなテキスト（18pt以上、または14pt太字以上）
    enhanced: 4.5;     // AAA基準（推奨）
  };
  
  uiComponents: {
    minimum: 3.0;      // UIコンポーネント（ボタン、入力欄等）
  };
}
```

### 適合例 / Compliant Examples

#### Alipay Mini Program

```css
/* ✅ 良い例: コントラスト比 7.02:1 */
.primary-text {
  color: #000000;              /* 黒 */
  background: #FFFFFF;         /* 白 */
}

/* ✅ 良い例: コントラスト比 4.59:1 */
.primary-button {
  color: #FFFFFF;              /* 白 */
  background: #1677FF;         /* Alipayブルー */
}

/* ❌ 悪い例: コントラスト比 2.91:1（不十分） */
.low-contrast {
  color: #BFBFBF;              /* 薄いグレー */
  background: #FFFFFF;         /* 白 */
}
```

#### WeChat Mini Program

```css
/* ✅ 良い例: コントラスト比 4.67:1 */
.primary-button {
  color: #FFFFFF;              /* 白 */
  background: #07C160;         /* WeChatグリーン */
}

/* ✅ 良い例: コントラスト比 7.02:1 */
.primary-text {
  color: #181818;              /* ほぼ黒 */
  background: #FFFFFF;         /* 白 */
}
```

### 色に依存しないデザイン / Color-Independent Design

色だけに頼らず、アイコンやテキストで情報を伝える:

```typescript
interface ColorIndependentDesign {
  // ✅ 良い例: アイコン + 色
  successIndicator: {
    icon: '✓',
    color: '#52C41A',
    text: '成功',
  };
  
  // ✅ 良い例: 記号 + 色
  errorIndicator: {
    icon: '⚠',
    color: '#FF4D4F',
    text: 'エラー',
  };
  
  // ❌ 悪い例: 色だけ
  statusIndicator: {
    color: '#52C41A',  // 色覚異常者には識別困難
  };
}
```

---

## タッチターゲット / Touch Targets

### 最小タッチサイズ / Minimum Touch Size

```typescript
interface TouchTargetSize {
  // WCAG推奨サイズ
  minimum: {
    width: '88rpx',    // 44px
    height: '88rpx',   // 44px
  };
  
  // 推奨サイズ
  recommended: {
    width: '96rpx',    // 48px
    height: '96rpx',   // 48px
  };
  
  // 間隔
  spacing: {
    minimum: '16rpx',  // 8px - タッチターゲット間の最小間隔
  };
}
```

### 適用例 / Application Examples

```css
/* ✅ 良い例: 十分なタッチサイズ */
.touch-button {
  width: 96rpx;
  height: 96rpx;
  padding: 24rpx;
}

/* ✅ 良い例: 十分な間隔 */
.button-group {
  display: flex;
  gap: 16rpx;
}

/* ❌ 悪い例: 小さすぎるタッチターゲット */
.small-button {
  width: 40rpx;   /* 20px - 小さすぎる */
  height: 40rpx;  /* 20px - 小さすぎる */
}
```

---

## フォーカス管理 / Focus Management

### フォーカス表示 / Focus Indication

```typescript
interface FocusIndication {
  // フォーカスリング
  focusRing: {
    alipay: {
      outline: '4rpx solid #1677FF',
      outlineOffset: '4rpx',
      borderRadius: '8rpx',
    },
    wechat: {
      outline: '4rpx solid #07C160',
      outlineOffset: '4rpx',
      borderRadius: '8rpx',
    },
  };
  
  // 最小コントラスト比
  minContrast: 3.0;  // WCAG 2.1 AA
}
```

### フォーカス順序 / Focus Order

```typescript
interface FocusOrder {
  // 論理的な順序
  logicalOrder: {
    principle: '左から右、上から下';
    
    example: [
      'scan-button',         // 1. スキャンボタン
      'search-button',       // 2. 検索ボタン
      'menu-overview',       // 3. メニュー: 最近
      'menu-addresses',      // 4. メニュー: 住所
      'menu-payments',       // 5. メニュー: 決済
      // ...
    ];
  };
  
  // モーダル内でのフォーカストラップ
  modalFocusTrap: {
    enabled: true,
    returnFocusOnClose: true,
    initialFocus: 'first-focusable-element',
  };
}
```

---

## スクリーンリーダー対応 / Screen Reader Support

### ARIA属性 / ARIA Attributes

```typescript
interface ARIAAttributes {
  // ボタン
  button: {
    role: 'button',
    ariaLabel: '住所を検索',
    ariaPressed: false,
    ariaDisabled: false,
  };
  
  // リンク
  link: {
    role: 'link',
    ariaLabel: '友達の住所を表示',
  };
  
  // 検索ボックス
  searchBox: {
    role: 'searchbox',
    ariaLabel: '住所を検索',
    ariaPlaceholder: '名前 / 国 / タグ / グループ',
  };
  
  // プログレスバー
  progressBar: {
    role: 'progressbar',
    ariaValueMin: 0,
    ariaValueMax: 100,
    ariaValueNow: 75,
    ariaLabel: '受取期限まで残り75%',
  };
  
  // モーダル
  modal: {
    role: 'dialog',
    ariaModal: true,
    ariaLabelledBy: 'modal-title',
    ariaDescribedBy: 'modal-description',
  };
}
```

### AXML/WXML実装例 / AXML/WXML Implementation

#### Alipay (AXML)

```xml
<!-- ボタン -->
<button 
  class="scan-button"
  aria-label="QRコードをスキャン"
  aria-describedby="scan-description"
  onTap="handleScan"
>
  <icon type="scan" size="40" aria-hidden="true" />
  <text id="scan-description">QRコードまたはNFCをスキャンしてギフトを受け取る</text>
</button>

<!-- 検索ボックス -->
<input
  class="search-input"
  placeholder="名前 / 国 / タグ / グループ"
  aria-label="住所を検索"
  role="searchbox"
  value="{{searchQuery}}"
  onInput="handleSearchInput"
/>

<!-- プログレスバー -->
<progress
  percent="{{remainingPercentage}}"
  aria-label="受取期限まで残り{{remainingPercentage}}%"
  aria-valuemin="0"
  aria-valuemax="100"
  aria-valuenow="{{remainingPercentage}}"
/>
```

#### WeChat (WXML)

```xml
<!-- ボタン -->
<button 
  class="scan-button"
  aria-label="QRコードをスキャン"
  aria-describedby="scan-description"
  bindtap="handleScan"
>
  <icon type="scan" size="40" aria-hidden="true" />
  <text id="scan-description">QRコードまたはNFCをスキャンしてギフトを受け取る</text>
</button>

<!-- 検索ボックス -->
<input
  class="search-input"
  placeholder="名前 / 国 / タグ / グループ"
  aria-label="住所を検索"
  role="searchbox"
  value="{{searchQuery}}"
  bindinput="handleSearchInput"
/>

<!-- プログレスバー -->
<progress
  percent="{{remainingPercentage}}"
  aria-label="受取期限まで残り{{remainingPercentage}}%"
  aria-valuemin="0"
  aria-valuemax="100"
  aria-valuenow="{{remainingPercentage}}"
/>
```

---

## 代替テキスト / Alternative Text

### 画像の代替テキスト / Image Alt Text

```typescript
interface ImageAltText {
  // 情報を含む画像
  informative: {
    src: '/assets/gift-icon.png',
    alt: 'ギフトアイコン - 友達からのプレゼント',
  };
  
  // 装飾的な画像
  decorative: {
    src: '/assets/decoration.png',
    alt: '',  // 空文字列（スクリーンリーダーで読み上げない）
    ariaHidden: true,
  };
  
  // 機能的な画像
  functional: {
    src: '/assets/search-icon.png',
    alt: '検索',
    role: 'button',
  };
}
```

### アイコンの代替テキスト / Icon Alt Text

```xml
<!-- ✅ 良い例: aria-labelで説明 -->
<icon 
  type="location" 
  size="20" 
  aria-label="住所"
/>

<!-- ✅ 良い例: 装飾的なアイコンは隠す -->
<icon 
  type="decoration" 
  size="16" 
  aria-hidden="true"
/>

<!-- ❌ 悪い例: 説明なし -->
<icon type="location" size="20" />
```

---

## キーボードナビゲーション / Keyboard Navigation

### キーボード操作 / Keyboard Operations

```typescript
interface KeyboardOperations {
  // 基本操作
  basic: {
    Tab: 'フォーカス移動（順方向）',
    ShiftTab: 'フォーカス移動（逆方向）',
    Enter: '選択/実行',
    Space: '選択/実行（ボタン）',
    Escape: 'キャンセル/閉じる',
  };
  
  // リスト操作
  list: {
    ArrowUp: '上の項目へ移動',
    ArrowDown: '下の項目へ移動',
    Home: '最初の項目へ移動',
    End: '最後の項目へ移動',
  };
  
  // モーダル操作
  modal: {
    Escape: 'モーダルを閉じる',
    Tab: 'モーダル内でフォーカス循環',
  };
}
```

### キーボードトラップの回避 / Avoid Keyboard Traps

```typescript
interface KeyboardTrapAvoidance {
  // モーダルでのフォーカストラップ
  modalFocusTrap: {
    // モーダル内でTabキーが循環
    firstElement: 'modal-close-button',
    lastElement: 'modal-confirm-button',
    
    // Escapeキーでモーダルを閉じる
    escapeToClose: true,
    
    // モーダルを閉じたら元の要素にフォーカスを戻す
    returnFocus: true,
  };
  
  // 検索ボックスでのフォーカス管理
  searchBox: {
    // 検索結果が表示されてもフォーカスはトラップしない
    allowNavigation: true,
    
    // Escapeキーで検索をクリア
    escapeToClear: true,
  };
}
```

---

## テキストとフォント / Text and Font

### 最小フォントサイズ / Minimum Font Size

```typescript
interface MinimumFontSize {
  // 推奨最小サイズ
  minimum: {
    body: '28rpx',      // 14px
    caption: '24rpx',   // 12px（最小）
  };
  
  // 行間
  lineHeight: {
    minimum: 1.5,       // 本文
    headings: 1.2,      // 見出し
  };
  
  // 段落間隔
  paragraphSpacing: {
    minimum: '32rpx',   // 16px
  };
}
```

### テキストのリサイズ / Text Resizing

```typescript
interface TextResizing {
  // 200%までのズームをサポート
  maxZoom: 2.0;
  
  // レイアウトの崩れを防ぐ
  responsive: {
    useRelativeUnits: true,   // rpx, rem等
    avoidFixedWidths: true,   // 固定幅を避ける
    allowTextWrapping: true,  // テキストの折り返しを許可
  };
}
```

---

## モーション / Motion

### アニメーションの制御 / Animation Control

```typescript
interface MotionControl {
  // アニメーション設定
  animation: {
    // デフォルトは有効
    enabled: true,
    
    // ユーザーが無効化できるようにする
    userControllable: true,
    
    // システム設定を尊重
    respectSystemPreferences: true,
  };
  
  // 点滅の回避
  avoidFlashing: {
    // 1秒間に3回以上の点滅を避ける
    maxFlashesPerSecond: 3,
    
    // 大きな面積での点滅を避ける
    avoidLargeAreaFlashing: true,
  };
}
```

### CSS実装例 / CSS Implementation

```css
/* アニメーション設定を尊重 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* デフォルトのアニメーション */
.slide-in {
  animation: slideIn 300ms ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
```

---

## エラーメッセージ / Error Messages

### アクセシブルなエラー表示 / Accessible Error Display

```typescript
interface AccessibleErrors {
  // エラーメッセージの要件
  errorMessage: {
    // 明確で具体的
    clear: '郵便番号の形式が正しくありません',
    
    // 解決方法を提示
    solution: '例: 100-0001',
    
    // 色以外の方法でも識別可能
    indicators: {
      icon: '⚠',
      color: '#FF4D4F',
      border: '2rpx solid #FF4D4F',
    },
    
    // スクリーンリーダーで読み上げ
    ariaLive: 'polite',
    role: 'alert',
  };
}
```

### AXML/WXML実装例 / AXML/WXML Implementation

```xml
<!-- エラー表示 -->
<view 
  wx:if="{{hasError}}"
  class="error-message"
  role="alert"
  aria-live="polite"
>
  <icon type="warn" size="20" color="#FF4D4F" aria-hidden="true" />
  <view class="error-content">
    <text class="error-title">{{errorMessage}}</text>
    <text class="error-solution">{{errorSolution}}</text>
  </view>
</view>

<!-- エラーのある入力欄 -->
<input
  class="input {{hasError ? 'input-error' : ''}}"
  aria-invalid="{{hasError}}"
  aria-describedby="{{hasError ? 'error-message' : ''}}"
  value="{{inputValue}}"
  bindinput="handleInput"
/>

<text 
  wx:if="{{hasError}}"
  id="error-message"
  class="error-hint"
>
  {{errorHint}}
</text>
```

---

## テスト / Testing

### アクセシビリティテストツール / Accessibility Testing Tools

```typescript
interface AccessibilityTesting {
  // 自動テスト
  automated: {
    tools: [
      'axe-core',           // アクセシビリティ自動チェック
      'pa11y',              // コマンドラインツール
      'lighthouse',         // Chrome DevTools
    ],
    
    frequency: 'CI/CD パイプラインで毎回実行',
  };
  
  // 手動テスト
  manual: {
    tests: [
      'キーボードナビゲーション',
      'スクリーンリーダー（VoiceOver, TalkBack）',
      'カラーコントラスト',
      'テキストズーム（200%）',
      'モーションの無効化',
    ],
    
    frequency: 'リリース前に毎回実施',
  };
  
  // ユーザーテスト
  userTesting: {
    participants: [
      '視覚障害者',
      '聴覚障害者',
      '運動障害者',
      '認知障害者',
    ],
    
    frequency: '四半期ごと',
  };
}
```

### チェックリスト / Checklist

```typescript
interface AccessibilityChecklist {
  perception: {
    colorContrast: '✓ コントラスト比がWCAG AA基準を満たしているか',
    altText: '✓ すべての画像に適切な代替テキストがあるか',
    textSize: '✓ テキストサイズが最小基準を満たしているか',
    colorIndependence: '✓ 色だけに依存していないか',
  };
  
  operation: {
    keyboardNavigation: '✓ すべての機能がキーボードで操作可能か',
    touchTargets: '✓ タッチターゲットが十分な大きさか',
    focusIndicator: '✓ フォーカスインジケーターが明確か',
    noKeyboardTraps: '✓ キーボードトラップがないか',
  };
  
  understanding: {
    clearLabels: '✓ ラベルが明確か',
    errorMessages: '✓ エラーメッセージが具体的か',
    consistentNavigation: '✓ ナビゲーションが一貫しているか',
    predictableBehavior: '✓ 動作が予測可能か',
  };
  
  robustness: {
    ariaAttributes: '✓ 適切なARIA属性が設定されているか',
    semanticHTML: '✓ セマンティックなマークアップか',
    screenReaderSupport: '✓ スクリーンリーダーで正しく読み上げられるか',
  };
}
```

---

## まとめ / Summary

### アクセシビリティの重要性 / Importance of Accessibility

1. **インクルーシブデザイン**: すべてのユーザーが利用可能
2. **法的要件**: 多くの国でアクセシビリティは法的要件
3. **ビジネス価値**: より多くのユーザーにリーチ
4. **UX向上**: すべてのユーザーにとって使いやすい

### 継続的改善 / Continuous Improvement

- 定期的なアクセシビリティテスト
- ユーザーフィードバックの収集
- 新しいガイドラインへの対応
- チーム全体でのアクセシビリティ意識向上

---

## 関連ドキュメント / Related Documents

- [UI/UX Design](./UI-UX-DESIGN.md)
- [Design Tokens](./DESIGN-TOKENS.md)
- [Alipay UI Navigation](./alipay/docs/UI-NAVIGATION.md)
- [WeChat UI Navigation](./wechat/docs/UI-NAVIGATION.md)

---

## 参考資料 / References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Alipay Accessibility Guidelines](https://opendocs.alipay.com/mini/accessibility)
- [WeChat Accessibility Guidelines](https://developers.weixin.qq.com/miniprogram/dev/framework/accessibility/)

---

## ライセンス / License

MIT License
