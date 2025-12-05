# World Address Design System

## Overview

This design system provides guidelines and components for building consistent, accessible, and beautiful interfaces across the World Address ecosystem.

## Color Palette

### Primary Colors

```css
:root {
  /* Primary Brand Colors */
  --vey-primary: #2563EB;          /* Vey Blue */
  --vey-primary-hover: #1D4ED8;
  --vey-primary-light: #DBEAFE;
  --vey-primary-dark: #1E40AF;
  
  /* Secondary Colors */
  --vey-secondary: #7C3AED;        /* Vey Purple */
  --vey-secondary-hover: #6D28D9;
  --vey-secondary-light: #EDE9FE;
  --vey-secondary-dark: #5B21B6;
  
  /* Accent Colors */
  --vey-accent: #10B981;           /* Success Green */
  --vey-warning: #F59E0B;          /* Warning Orange */
  --vey-error: #EF4444;            /* Error Red */
  --vey-info: #3B82F6;             /* Info Blue */
}
```

### Neutral Colors

```css
:root {
  /* Grayscale */
  --vey-gray-50: #F9FAFB;
  --vey-gray-100: #F3F4F6;
  --vey-gray-200: #E5E7EB;
  --vey-gray-300: #D1D5DB;
  --vey-gray-400: #9CA3AF;
  --vey-gray-500: #6B7280;
  --vey-gray-600: #4B5563;
  --vey-gray-700: #374151;
  --vey-gray-800: #1F2937;
  --vey-gray-900: #111827;
}
```

### Semantic Colors

```css
:root {
  /* Status Colors */
  --vey-success: #10B981;
  --vey-success-bg: #D1FAE5;
  --vey-success-text: #065F46;
  
  --vey-warning: #F59E0B;
  --vey-warning-bg: #FEF3C7;
  --vey-warning-text: #92400E;
  
  --vey-error: #EF4444;
  --vey-error-bg: #FEE2E2;
  --vey-error-text: #991B1B;
  
  --vey-info: #3B82F6;
  --vey-info-bg: #DBEAFE;
  --vey-info-text: #1E40AF;
}
```

## Typography

### Font Families

```css
:root {
  /* Primary Font Stack */
  --vey-font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                   'Helvetica Neue', Arial, 'Noto Sans', sans-serif,
                   'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
                   'Noto Color Emoji';
  
  /* Monospace Font Stack */
  --vey-font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono',
                   Consolas, 'Courier New', monospace;
  
  /* Japanese Font Stack */
  --vey-font-ja: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN',
                 'Yu Gothic', YuGothic, 'Meiryo', sans-serif;
  
  /* Chinese Font Stack */
  --vey-font-zh: 'PingFang SC', 'Microsoft YaHei', 'Source Han Sans SC', sans-serif;
  
  /* Korean Font Stack */
  --vey-font-ko: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
}
```

### Font Sizes

```css
:root {
  --vey-text-xs: 0.75rem;    /* 12px */
  --vey-text-sm: 0.875rem;   /* 14px */
  --vey-text-base: 1rem;     /* 16px */
  --vey-text-lg: 1.125rem;   /* 18px */
  --vey-text-xl: 1.25rem;    /* 20px */
  --vey-text-2xl: 1.5rem;    /* 24px */
  --vey-text-3xl: 1.875rem;  /* 30px */
  --vey-text-4xl: 2.25rem;   /* 36px */
  --vey-text-5xl: 3rem;      /* 48px */
}
```

### Font Weights

```css
:root {
  --vey-font-light: 300;
  --vey-font-normal: 400;
  --vey-font-medium: 500;
  --vey-font-semibold: 600;
  --vey-font-bold: 700;
  --vey-font-extrabold: 800;
}
```

## Spacing System

Based on 8px grid system:

```css
:root {
  --vey-space-0: 0;
  --vey-space-1: 0.25rem;   /* 4px */
  --vey-space-2: 0.5rem;    /* 8px */
  --vey-space-3: 0.75rem;   /* 12px */
  --vey-space-4: 1rem;      /* 16px */
  --vey-space-5: 1.25rem;   /* 20px */
  --vey-space-6: 1.5rem;    /* 24px */
  --vey-space-8: 2rem;      /* 32px */
  --vey-space-10: 2.5rem;   /* 40px */
  --vey-space-12: 3rem;     /* 48px */
  --vey-space-16: 4rem;     /* 64px */
  --vey-space-20: 5rem;     /* 80px */
  --vey-space-24: 6rem;     /* 96px */
}
```

## Border Radius

```css
:root {
  --vey-radius-none: 0;
  --vey-radius-sm: 0.125rem;   /* 2px */
  --vey-radius-base: 0.25rem;  /* 4px */
  --vey-radius-md: 0.375rem;   /* 6px */
  --vey-radius-lg: 0.5rem;     /* 8px */
  --vey-radius-xl: 0.75rem;    /* 12px */
  --vey-radius-2xl: 1rem;      /* 16px */
  --vey-radius-full: 9999px;
}
```

## Shadows

```css
:root {
  --vey-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --vey-shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
                     0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --vey-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                   0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --vey-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                   0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --vey-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
                   0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --vey-shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
```

## Components

### Button Styles

```css
/* Primary Button */
.vey-button-primary {
  background-color: var(--vey-primary);
  color: white;
  padding: var(--vey-space-3) var(--vey-space-6);
  border-radius: var(--vey-radius-lg);
  font-weight: var(--vey-font-medium);
  transition: all 0.2s ease;
  box-shadow: var(--vey-shadow-sm);
}

.vey-button-primary:hover {
  background-color: var(--vey-primary-hover);
  box-shadow: var(--vey-shadow-md);
  transform: translateY(-1px);
}

/* Secondary Button */
.vey-button-secondary {
  background-color: white;
  color: var(--vey-primary);
  border: 2px solid var(--vey-primary);
  padding: var(--vey-space-3) var(--vey-space-6);
  border-radius: var(--vey-radius-lg);
  font-weight: var(--vey-font-medium);
  transition: all 0.2s ease;
}

.vey-button-secondary:hover {
  background-color: var(--vey-primary-light);
  transform: translateY(-1px);
}

/* Ghost Button */
.vey-button-ghost {
  background-color: transparent;
  color: var(--vey-gray-700);
  padding: var(--vey-space-3) var(--vey-space-6);
  border-radius: var(--vey-radius-lg);
  font-weight: var(--vey-font-medium);
  transition: all 0.2s ease;
}

.vey-button-ghost:hover {
  background-color: var(--vey-gray-100);
}
```

### Card Styles

```css
.vey-card {
  background-color: white;
  border-radius: var(--vey-radius-xl);
  padding: var(--vey-space-6);
  box-shadow: var(--vey-shadow-base);
  border: 1px solid var(--vey-gray-200);
  transition: all 0.3s ease;
}

.vey-card:hover {
  box-shadow: var(--vey-shadow-lg);
  transform: translateY(-2px);
}

.vey-card-header {
  margin-bottom: var(--vey-space-4);
  padding-bottom: var(--vey-space-4);
  border-bottom: 1px solid var(--vey-gray-200);
}

.vey-card-title {
  font-size: var(--vey-text-xl);
  font-weight: var(--vey-font-semibold);
  color: var(--vey-gray-900);
}

.vey-card-body {
  color: var(--vey-gray-700);
  line-height: 1.6;
}
```

### Input Styles

```css
.vey-input {
  width: 100%;
  padding: var(--vey-space-3) var(--vey-space-4);
  border: 1px solid var(--vey-gray-300);
  border-radius: var(--vey-radius-lg);
  font-size: var(--vey-text-base);
  color: var(--vey-gray-900);
  background-color: white;
  transition: all 0.2s ease;
}

.vey-input:focus {
  outline: none;
  border-color: var(--vey-primary);
  box-shadow: 0 0 0 3px var(--vey-primary-light);
}

.vey-input:disabled {
  background-color: var(--vey-gray-100);
  cursor: not-allowed;
}

.vey-input-error {
  border-color: var(--vey-error);
}

.vey-input-error:focus {
  box-shadow: 0 0 0 3px var(--vey-error-bg);
}
```

### Badge Styles

```css
.vey-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--vey-space-1) var(--vey-space-3);
  border-radius: var(--vey-radius-full);
  font-size: var(--vey-text-xs);
  font-weight: var(--vey-font-medium);
  line-height: 1;
}

.vey-badge-success {
  background-color: var(--vey-success-bg);
  color: var(--vey-success-text);
}

.vey-badge-warning {
  background-color: var(--vey-warning-bg);
  color: var(--vey-warning-text);
}

.vey-badge-error {
  background-color: var(--vey-error-bg);
  color: var(--vey-error-text);
}

.vey-badge-info {
  background-color: var(--vey-info-bg);
  color: var(--vey-info-text);
}
```

## Icons

We recommend using:
- **Heroicons** - https://heroicons.com/
- **Lucide** - https://lucide.dev/
- **Tabler Icons** - https://tabler.io/icons

### Icon Sizes

```css
:root {
  --vey-icon-xs: 1rem;     /* 16px */
  --vey-icon-sm: 1.25rem;  /* 20px */
  --vey-icon-base: 1.5rem; /* 24px */
  --vey-icon-lg: 2rem;     /* 32px */
  --vey-icon-xl: 2.5rem;   /* 40px */
}
```

## Animations

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Slide In */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Usage */
.vey-animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

.vey-animate-slideUp {
  animation: slideUp 0.4s ease-out;
}

.vey-animate-slideIn {
  animation: slideIn 0.4s ease-out;
}

.vey-animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

## Responsive Breakpoints

```css
:root {
  --vey-screen-sm: 640px;
  --vey-screen-md: 768px;
  --vey-screen-lg: 1024px;
  --vey-screen-xl: 1280px;
  --vey-screen-2xl: 1536px;
}

/* Usage in media queries */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

## Dark Mode Support

```css
/* Light mode (default) */
:root {
  --vey-bg-primary: #FFFFFF;
  --vey-bg-secondary: #F9FAFB;
  --vey-text-primary: #111827;
  --vey-text-secondary: #6B7280;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --vey-bg-primary: #111827;
    --vey-bg-secondary: #1F2937;
    --vey-text-primary: #F9FAFB;
    --vey-text-secondary: #9CA3AF;
  }
}

/* Manual dark mode with class */
.dark {
  --vey-bg-primary: #111827;
  --vey-bg-secondary: #1F2937;
  --vey-text-primary: #F9FAFB;
  --vey-text-secondary: #9CA3AF;
}
```

## Accessibility

### Focus Styles

```css
/* Keyboard focus visible */
*:focus-visible {
  outline: 2px solid var(--vey-primary);
  outline-offset: 2px;
}

/* Remove default outline */
*:focus {
  outline: none;
}
```

### Screen Reader Only

```css
.vey-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

## Usage Examples

### HTML Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vey Address Form</title>
  <link rel="stylesheet" href="vey-design-system.css">
</head>
<body>
  <div class="vey-card">
    <div class="vey-card-header">
      <h2 class="vey-card-title">Address Form</h2>
    </div>
    <div class="vey-card-body">
      <form>
        <div style="margin-bottom: var(--vey-space-4);">
          <label>Country</label>
          <input type="text" class="vey-input" placeholder="Japan">
        </div>
        <div style="margin-bottom: var(--vey-space-4);">
          <label>Postal Code</label>
          <input type="text" class="vey-input" placeholder="100-0001">
        </div>
        <button type="submit" class="vey-button-primary">
          Submit Address
        </button>
      </form>
    </div>
  </div>
</body>
</html>
```

### React Example

```tsx
import '@vey/design-system/styles.css';

function AddressCard({ address }) {
  return (
    <div className="vey-card vey-animate-slideUp">
      <div className="vey-card-header">
        <h3 className="vey-card-title">Delivery Address</h3>
        <span className="vey-badge vey-badge-success">Verified</span>
      </div>
      <div className="vey-card-body">
        <p>{address.street}</p>
        <p>{address.city}, {address.postalCode}</p>
        <p>{address.country}</p>
      </div>
    </div>
  );
}
```

## Integration with Existing Tools

### Tailwind CSS Integration

Our design system is compatible with Tailwind CSS. You can use our tokens as Tailwind theme extensions:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'vey-primary': '#2563EB',
        'vey-secondary': '#7C3AED',
        // ... more colors
      },
      fontFamily: {
        sans: ['var(--vey-font-sans)'],
        mono: ['var(--vey-font-mono)'],
      },
      spacing: {
        // Use our 8px grid system
      }
    }
  }
}
```

### Figma Design Files

Coming soon: Figma design files with all components, colors, and spacing defined.

## Resources

- [Component Library (Storybook)](./storybook) - Coming soon
- [Figma Design Kit](./figma) - Coming soon
- [Icon Library](./icons) - Coming soon

## Contributing

To contribute to the design system:
1. Follow the established design tokens
2. Maintain accessibility standards (WCAG 2.1 AA)
3. Test in multiple browsers and devices
4. Document new components thoroughly

## License

MIT License - See [LICENSE](../LICENSE) for details.
