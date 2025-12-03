# デザイントークン / Design Tokens

このドキュメントは、Alipay Mini Program と WeChat Mini Program で使用するデザイントークンを定義します。

---

## カラーパレット / Color Palette

### Alipay Mini Program

```typescript
interface AlipayColors {
  // プライマリーカラー / Primary Colors
  primary: {
    default: '#1677FF',      // Alipay ブルー
    light: '#4096FF',
    lighter: '#69B1FF',
    dark: '#0958D9',
    darker: '#003EB3',
  };
  
  // セカンダリーカラー / Secondary Colors
  secondary: {
    success: '#52C41A',
    warning: '#FAAD14',
    error: '#FF4D4F',
    info: '#1890FF',
  };
  
  // ニュートラルカラー / Neutral Colors
  neutral: {
    black: '#000000',
    gray900: '#262626',
    gray800: '#434343',
    gray700: '#595959',
    gray600: '#8C8C8C',
    gray500: '#BFBFBF',
    gray400: '#D9D9D9',
    gray300: '#E8E8E8',
    gray200: '#F0F0F0',
    gray100: '#F5F5F5',
    white: '#FFFFFF',
  };
  
  // 背景カラー / Background Colors
  background: {
    default: '#FFFFFF',
    light: '#F5F7FA',
    gradient: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  };
  
  // 特殊カラー / Special Colors
  special: {
    defaultAddressBg: '#E6F7FF',    // Default住所背景
    recommendedBg: '#FFF7E6',        // おすすめバッジ背景
    urgentWarning: '#FF4D4F',        // 緊急警告
    successGreen: '#52C41A',         // 成功
  };
}
```

### WeChat Mini Program

```typescript
interface WeChatColors {
  // プライマリーカラー / Primary Colors
  primary: {
    default: '#07C160',      // WeChat グリーン
    light: '#2AAE67',
    lighter: '#4DD98D',
    dark: '#059A4B',
    darker: '#037339',
  };
  
  // セカンダリーカラー / Secondary Colors
  secondary: {
    success: '#07C160',
    warning: '#FAAD14',
    error: '#FA5151',
    info: '#10AEFF',
  };
  
  // ニュートラルカラー / Neutral Colors
  neutral: {
    black: '#000000',
    gray900: '#181818',
    gray800: '#2E2E2E',
    gray700: '#5E5E5E',
    gray600: '#8E8E8E',
    gray500: '#B8B8B8',
    gray400: '#D8D8D8',
    gray300: '#EEEEEE',
    gray200: '#F4F4F4',
    gray100: '#F8F8F8',
    white: '#FFFFFF',
  };
  
  // 背景カラー / Background Colors
  background: {
    default: '#FFFFFF',
    light: '#F8F8F8',
    gradient: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  };
  
  // 特殊カラー / Special Colors
  special: {
    defaultAddressBg: '#E6FFF2',    // Default住所背景
    recommendedBg: '#FFF7E6',        // おすすめバッジ背景
    urgentWarning: '#FA5151',        // 緊急警告
    successGreen: '#07C160',         // 成功
  };
}
```

---

## タイポグラフィ / Typography

### フォントファミリー / Font Family

```typescript
interface FontFamily {
  // システムフォント / System Font
  system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  
  // 日本語フォント / Japanese Font
  japanese: '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Meiryo", sans-serif';
  
  // 中国語フォント / Chinese Font
  chinese: '"PingFang SC", "Microsoft YaHei", sans-serif';
  
  // 数字フォント / Number Font
  monospace: 'Menlo, Monaco, Consolas, "Courier New", monospace';
}
```

### フォントサイズ / Font Size

```typescript
interface FontSize {
  // rpx単位（WeChat & Alipay共通）
  xs: '20rpx',      // 10px
  sm: '24rpx',      // 12px
  base: '28rpx',    // 14px
  md: '32rpx',      // 16px
  lg: '36rpx',      // 18px
  xl: '40rpx',      // 20px
  xxl: '48rpx',     // 24px
  xxxl: '56rpx',    // 28px
  
  // 特殊用途 / Special Use
  heading1: '64rpx',  // 32px - ページタイトル
  heading2: '48rpx',  // 24px - セクションタイトル
  heading3: '36rpx',  // 18px - サブセクション
  body: '28rpx',      // 14px - 本文
  caption: '24rpx',   // 12px - キャプション
  button: '32rpx',    // 16px - ボタンラベル
}
```

### フォントウェイト / Font Weight

```typescript
interface FontWeight {
  thin: 100,
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
}
```

### 行の高さ / Line Height

```typescript
interface LineHeight {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2.0,
}
```

---

## スペーシング / Spacing

```typescript
interface Spacing {
  // rpx単位（WeChat & Alipay共通）
  xs: '8rpx',       // 4px
  sm: '16rpx',      // 8px
  md: '24rpx',      // 12px
  base: '32rpx',    // 16px
  lg: '40rpx',      // 20px
  xl: '48rpx',      // 24px
  xxl: '64rpx',     // 32px
  xxxl: '96rpx',    // 48px
  
  // コンポーネント固有 / Component Specific
  component: {
    padding: {
      small: '16rpx 24rpx',     // ボタン小
      medium: '24rpx 32rpx',    // ボタン中
      large: '32rpx 48rpx',     // ボタン大
      card: '32rpx',            // カード内余白
      page: '32rpx',            // ページ内余白
    };
    
    margin: {
      small: '16rpx',
      medium: '24rpx',
      large: '32rpx',
      section: '48rpx',         // セクション間
    };
    
    gap: {
      small: '8rpx',
      medium: '16rpx',
      large: '24rpx',
    };
  };
}
```

---

## ボーダー / Border

```typescript
interface Border {
  // 幅 / Width
  width: {
    none: '0',
    thin: '1rpx',      // 0.5px
    default: '2rpx',   // 1px
    thick: '4rpx',     // 2px
  };
  
  // 半径 / Radius
  radius: {
    none: '0',
    small: '8rpx',     // 4px
    default: '16rpx',  // 8px
    medium: '24rpx',   // 12px
    large: '32rpx',    // 16px
    xlarge: '48rpx',   // 24px
    circle: '50%',
    pill: '9999rpx',
  };
  
  // スタイル / Style
  style: {
    solid: 'solid',
    dashed: 'dashed',
    dotted: 'dotted',
  };
}
```

---

## シャドウ / Shadow

```typescript
interface Shadow {
  // Alipay Mini Program
  alipay: {
    small: '0 2rpx 4rpx rgba(0, 0, 0, 0.1)',
    medium: '0 4rpx 8rpx rgba(0, 0, 0, 0.12)',
    large: '0 8rpx 16rpx rgba(0, 0, 0, 0.15)',
    xlarge: '0 16rpx 32rpx rgba(0, 0, 0, 0.2)',
    
    // 特殊シャドウ / Special Shadows
    button: '0 4rpx 8rpx rgba(22, 119, 255, 0.2)',
    buttonHover: '0 2rpx 4rpx rgba(22, 119, 255, 0.15)',
    card: '0 2rpx 8rpx rgba(0, 0, 0, 0.08)',
  };
  
  // WeChat Mini Program
  wechat: {
    small: '0 2rpx 4rpx rgba(0, 0, 0, 0.1)',
    medium: '0 4rpx 8rpx rgba(0, 0, 0, 0.12)',
    large: '0 8rpx 16rpx rgba(0, 0, 0, 0.15)',
    xlarge: '0 16rpx 32rpx rgba(0, 0, 0, 0.2)',
    
    // 特殊シャドウ / Special Shadows
    button: '0 4rpx 8rpx rgba(7, 193, 96, 0.2)',
    buttonHover: '0 2rpx 4rpx rgba(7, 193, 96, 0.15)',
    card: '0 2rpx 8rpx rgba(0, 0, 0, 0.08)',
  };
}
```

---

## トランジション / Transition

```typescript
interface Transition {
  // 期間 / Duration
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  };
  
  // イージング / Easing
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    
    // カスタムベジェ / Custom Bezier
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  };
  
  // プロパティ / Property
  property: {
    all: 'all',
    opacity: 'opacity',
    transform: 'transform',
    background: 'background-color',
    color: 'color',
    border: 'border-color',
  };
}
```

---

## アニメーション / Animation

```typescript
interface Animation {
  // フェードイン / Fade In
  fadeIn: {
    duration: '300ms',
    easing: 'ease-in-out',
    keyframes: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
  };
  
  // スライドイン / Slide In
  slideInRight: {
    duration: '300ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    keyframes: {
      from: { transform: 'translateX(100%)' },
      to: { transform: 'translateX(0)' },
    },
  };
  
  // スケール / Scale
  scaleUp: {
    duration: '200ms',
    easing: 'ease-out',
    keyframes: {
      from: { transform: 'scale(0.95)' },
      to: { transform: 'scale(1)' },
    },
  };
  
  // バウンス / Bounce
  bounce: {
    duration: '600ms',
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    keyframes: {
      '0%': { transform: 'scale(1)' },
      '50%': { transform: 'scale(1.1)' },
      '100%': { transform: 'scale(1)' },
    },
  };
}
```

---

## アイコンサイズ / Icon Size

```typescript
interface IconSize {
  xs: '16rpx',      // 8px
  sm: '20rpx',      // 10px
  base: '24rpx',    // 12px
  md: '32rpx',      // 16px
  lg: '40rpx',      // 20px
  xl: '48rpx',      // 24px
  xxl: '64rpx',     // 32px
  xxxl: '96rpx',    // 48px
}
```

---

## ボタンスタイル / Button Styles

```typescript
interface ButtonStyles {
  // プライマリーボタン / Primary Button
  primary: {
    alipay: {
      background: '#1677FF',
      color: '#FFFFFF',
      border: 'none',
      shadow: '0 4rpx 8rpx rgba(22, 119, 255, 0.2)',
      hover: {
        background: '#0958D9',
        shadow: '0 2rpx 4rpx rgba(22, 119, 255, 0.15)',
      },
    },
    wechat: {
      background: '#07C160',
      color: '#FFFFFF',
      border: 'none',
      shadow: '0 4rpx 8rpx rgba(7, 193, 96, 0.2)',
      hover: {
        background: '#059A4B',
        shadow: '0 2rpx 4rpx rgba(7, 193, 96, 0.15)',
      },
    },
  };
  
  // セカンダリーボタン / Secondary Button
  secondary: {
    alipay: {
      background: '#FFFFFF',
      color: '#1677FF',
      border: '2rpx solid #1677FF',
      shadow: 'none',
      hover: {
        background: '#F0F5FF',
      },
    },
    wechat: {
      background: '#FFFFFF',
      color: '#07C160',
      border: '2rpx solid #07C160',
      shadow: 'none',
      hover: {
        background: '#E6FFF2',
      },
    },
  };
  
  // 無効ボタン / Disabled Button
  disabled: {
    background: '#F5F5F5',
    color: '#BFBFBF',
    border: '2rpx solid #D9D9D9',
    shadow: 'none',
    cursor: 'not-allowed',
  };
  
  // サイズ / Size
  size: {
    small: {
      height: '64rpx',    // 32px
      padding: '16rpx 24rpx',
      fontSize: '24rpx',  // 12px
      borderRadius: '32rpx',
    },
    medium: {
      height: '80rpx',    // 40px
      padding: '24rpx 32rpx',
      fontSize: '28rpx',  // 14px
      borderRadius: '40rpx',
    },
    large: {
      height: '96rpx',    // 48px
      padding: '32rpx 48rpx',
      fontSize: '32rpx',  // 16px
      borderRadius: '48rpx',
    },
  };
}
```

---

## カードスタイル / Card Styles

```typescript
interface CardStyles {
  // デフォルトカード / Default Card
  default: {
    background: '#FFFFFF',
    border: '2rpx solid #E8E8E8',
    borderRadius: '16rpx',
    shadow: '0 2rpx 8rpx rgba(0, 0, 0, 0.08)',
    padding: '32rpx',
  };
  
  // ハイライトカード / Highlighted Card
  highlighted: {
    alipay: {
      background: '#E6F7FF',
      border: '2rpx solid #1677FF',
      borderRadius: '16rpx',
      shadow: '0 4rpx 12rpx rgba(22, 119, 255, 0.15)',
      padding: '32rpx',
    },
    wechat: {
      background: '#E6FFF2',
      border: '2rpx solid #07C160',
      borderRadius: '16rpx',
      shadow: '0 4rpx 12rpx rgba(7, 193, 96, 0.15)',
      padding: '32rpx',
    },
  };
  
  // リストアイテム / List Item
  listItem: {
    background: '#FFFFFF',
    border: 'none',
    borderBottom: '1rpx solid #E8E8E8',
    borderRadius: '0',
    shadow: 'none',
    padding: '24rpx 32rpx',
  };
}
```

---

## インプットスタイル / Input Styles

```typescript
interface InputStyles {
  // テキスト入力 / Text Input
  textInput: {
    height: '80rpx',     // 40px
    padding: '0 24rpx',
    fontSize: '28rpx',   // 14px
    background: '#FFFFFF',
    border: '2rpx solid #D9D9D9',
    borderRadius: '8rpx',
    
    focus: {
      alipay: {
        border: '2rpx solid #1677FF',
        shadow: '0 0 0 4rpx rgba(22, 119, 255, 0.1)',
      },
      wechat: {
        border: '2rpx solid #07C160',
        shadow: '0 0 0 4rpx rgba(7, 193, 96, 0.1)',
      },
    },
    
    disabled: {
      background: '#F5F5F5',
      color: '#BFBFBF',
      cursor: 'not-allowed',
    },
  };
  
  // 検索ボックス / Search Box
  searchBox: {
    height: '64rpx',     // 32px
    padding: '0 24rpx 0 48rpx',  // 左側にアイコン
    fontSize: '28rpx',   // 14px
    background: '#F5F5F5',
    border: 'none',
    borderRadius: '32rpx',
    
    icon: {
      position: 'absolute',
      left: '16rpx',
      size: '24rpx',
      color: '#8C8C8C',
    },
  };
}
```

---

## バッジスタイル / Badge Styles

```typescript
interface BadgeStyles {
  // 通知バッジ / Notification Badge
  notification: {
    background: '#FF4D4F',
    color: '#FFFFFF',
    fontSize: '20rpx',   // 10px
    padding: '4rpx 8rpx',
    borderRadius: '999rpx',
    minWidth: '32rpx',
    height: '32rpx',
  };
  
  // ステータスバッジ / Status Badge
  status: {
    active: {
      alipay: {
        background: '#E6F7FF',
        color: '#1677FF',
        border: '1rpx solid #1677FF',
      },
      wechat: {
        background: '#E6FFF2',
        color: '#07C160',
        border: '1rpx solid #07C160',
      },
    },
    
    success: {
      background: '#F6FFED',
      color: '#52C41A',
      border: '1rpx solid #52C41A',
    },
    
    warning: {
      background: '#FFFBE6',
      color: '#FAAD14',
      border: '1rpx solid #FAAD14',
    },
    
    error: {
      background: '#FFF1F0',
      color: '#FF4D4F',
      border: '1rpx solid #FF4D4F',
    },
    
    default: {
      background: '#F5F5F5',
      color: '#8C8C8C',
      border: '1rpx solid #D9D9D9',
    },
  };
}
```

---

## プログレスバースタイル / Progress Bar Styles

```typescript
interface ProgressBarStyles {
  // デフォルト / Default
  default: {
    height: '12rpx',
    backgroundColor: '#F0F0F0',
    borderRadius: '6rpx',
    
    active: {
      alipay: '#1677FF',
      wechat: '#07C160',
    },
  };
  
  // 太いバー / Thick Bar
  thick: {
    height: '24rpx',
    backgroundColor: '#F0F0F0',
    borderRadius: '12rpx',
    
    active: {
      alipay: '#1677FF',
      wechat: '#07C160',
    },
  };
  
  // 緊急 / Urgent
  urgent: {
    height: '12rpx',
    backgroundColor: '#FFF1F0',
    borderRadius: '6rpx',
    active: '#FF4D4F',
  };
}
```

---

## レスポンシブブレークポイント / Responsive Breakpoints

```typescript
interface Breakpoints {
  // rpx単位（WeChat & Alipay共通）
  // 一般的なデバイスサイズに基づく
  xs: '0rpx',       // 0px - 超小型デバイス（〜320px）
  sm: '640rpx',     // 320px - 小型デバイス（321px〜）
  md: '750rpx',     // 375px - 中型デバイス（一般的なスマートフォン）
  lg: '1024rpx',    // 512px - 大型デバイス（タブレット）
  xl: '1280rpx',    // 640px - 超大型デバイス（横向きタブレット）
  xxl: '1536rpx',   // 768px - デスクトップ（稀）
}
```

---

## Z-Index / Z-Index

```typescript
interface ZIndex {
  base: 1,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
}
```

---

## 使用例 / Usage Examples

### ACSS/WXSS での使用 / Usage in ACSS/WXSS

```css
/* Alipay Mini Program (ACSS) */
.primary-button {
  background: #1677FF;
  color: #FFFFFF;
  font-size: 32rpx;
  padding: 24rpx 32rpx;
  border-radius: 40rpx;
  box-shadow: 0 4rpx 8rpx rgba(22, 119, 255, 0.2);
}

.primary-button-hover {
  background: #0958D9;
  box-shadow: 0 2rpx 4rpx rgba(22, 119, 255, 0.15);
}

/* WeChat Mini Program (WXSS) */
.primary-button {
  background: #07C160;
  color: #FFFFFF;
  font-size: 32rpx;
  padding: 24rpx 32rpx;
  border-radius: 40rpx;
  box-shadow: 0 4rpx 8rpx rgba(7, 193, 96, 0.2);
}

.primary-button-hover {
  background: #059A4B;
  box-shadow: 0 2rpx 4rpx rgba(7, 193, 96, 0.15);
}
```

### TypeScript での使用 / Usage in TypeScript

```typescript
// design-tokens.ts
export const designTokens = {
  colors: {
    alipay: {
      primary: '#1677FF',
      success: '#52C41A',
      warning: '#FAAD14',
      error: '#FF4D4F',
    },
    wechat: {
      primary: '#07C160',
      success: '#07C160',
      warning: '#FAAD14',
      error: '#FA5151',
    },
  },
  
  spacing: {
    xs: '8rpx',
    sm: '16rpx',
    md: '24rpx',
    base: '32rpx',
    lg: '40rpx',
    xl: '48rpx',
  },
  
  fontSize: {
    xs: '20rpx',
    sm: '24rpx',
    base: '28rpx',
    md: '32rpx',
    lg: '36rpx',
    xl: '40rpx',
  },
};

// コンポーネントでの使用
import { designTokens } from './design-tokens';

Page({
  data: {
    primaryColor: designTokens.colors.alipay.primary,
    buttonPadding: designTokens.spacing.base,
    buttonFontSize: designTokens.fontSize.md,
  },
});
```

---

## まとめ / Summary

### デザイントークンの利点 / Benefits of Design Tokens

1. **一貫性**: すべての画面で統一されたデザイン
2. **保守性**: 一箇所の変更で全体に反映
3. **スケーラビリティ**: 新しいコンポーネントの追加が容易
4. **プラットフォーム対応**: Alipay/WeChat両方に対応
5. **開発効率**: デザイナーと開発者の協業が円滑

### 更新ルール / Update Rules

- デザイントークンの変更は、必ずこのドキュメントを更新
- 新しいトークンを追加する際は、命名規則に従う
- プラットフォーム固有のトークンは、明確にラベル付け

---

## 関連ドキュメント / Related Documents

- [UI/UX Design](./UI-UX-DESIGN.md)
- [Alipay UI Navigation](./alipay/docs/UI-NAVIGATION.md)
- [WeChat UI Navigation](./wechat/docs/UI-NAVIGATION.md)

---

## ライセンス / License

MIT License
