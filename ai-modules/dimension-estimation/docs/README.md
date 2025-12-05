# Dimension Estimation Module - 荷物寸法・重量推定

荷物画像からサイズ・重量を推定し、料金を自動算出するモジュール

Package dimension and weight estimation module for automatic pricing calculation

---

## 概要 / Overview

### 目的 / Purpose

荷物の画像から寸法（長さ、幅、高さ）と重量を自動推定し、配送料金の自動算出とVeyLockerボックスサイズへの自動マッピングを実現します。

This module automatically estimates package dimensions (length, width, height) and weight from images, enabling automatic shipping cost calculation and VeyLocker box size mapping.

### 主要機能 / Key Features

- ✅ **画像ベース寸法推定** - Image-based dimension estimation
  - 3次元寸法の自動計測（±5cm精度）
  - Automatic 3D measurement (±5cm accuracy)
- ✅ **重量予測** - Weight prediction
  - AIによる重量推定（±10%精度）
  - AI-powered weight estimation (±10% accuracy)
- ✅ **VeyLockerマッピング** - VeyLocker box mapping
  - 最適なボックスサイズの自動選択
  - Automatic optimal box size selection
- ✅ **料金自動算出** - Automatic price calculation
  - 寸法・重量から配送料金を自動計算
  - Auto-calculate shipping cost from dimensions/weight
- ✅ **トラブル防止** - Prevent billing disputes
  - サイズ・重量違いによる追加請求をほぼゼロに
  - Eliminate size/weight mismatch charges

---

## アーキテクチャ / Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Dimension Estimation Module                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐      ┌──────────────┐                │
│  │ Image Input  │─────▶│ Preprocessor │                │
│  └──────────────┘      └──────────────┘                │
│                              │                           │
│                              ▼                           │
│  ┌──────────────┐      ┌──────────────┐                │
│  │Reference Obj │◀─────│  Calibration │                │
│  │  Detection   │      │   Detection  │                │
│  └──────────────┘      └──────────────┘                │
│        │                                                 │
│        ▼                                                 │
│  ┌──────────────┐      ┌──────────────┐                │
│  │   Dimension  │─────▶│  CNN Model   │                │
│  │  Estimator   │      │  (YOLOv8)    │                │
│  └──────────────┘      └──────────────┘                │
│        │                                                 │
│        ▼                                                 │
│  ┌──────────────┐      ┌──────────────┐                │
│  │    Weight    │─────▶│  ML Model    │                │
│  │  Predictor   │      │  (Regression)│                │
│  └──────────────┘      └──────────────┘                │
│        │                                                 │
│        ▼                                                 │
│  ┌──────────────┐      ┌──────────────┐                │
│  │Box Size Map  │─────▶│VeyLocker API │                │
│  └──────────────┘      └──────────────┘                │
│        │                                                 │
│        ▼                                                 │
│  ┌──────────────┐                                       │
│  │Price Calc    │                                       │
│  └──────────────┘                                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 使用方法 / Usage

### 基本的な使い方 / Basic Usage

```typescript
import { DimensionEstimator } from '@vey/dimension-estimation';
import fs from 'fs';

// Initialize estimator
const estimator = new DimensionEstimator({
  calibrationMethod: 'reference-object', // or 'ar-marker', 'multi-view'
  weightModel: 'ml-regression', // or 'density-based'
  unit: 'metric' // or 'imperial'
});

// Estimate package dimensions
const imageBuffer = fs.readFileSync('package.jpg');
const result = await estimator.estimate(imageBuffer);

console.log(result);
/*
{
  dimensions: {
    length: 30.2,  // cm
    width: 20.5,   // cm
    height: 15.1,  // cm
    unit: 'cm'
  },
  weight: {
    estimated: 2.5,  // kg
    confidence: 0.87,
    unit: 'kg'
  },
  volume: 9.35,  // liters
  veyLockerBox: 'M',  // S, M, L, XL
  shippingCost: {
    carrier: 'auto',
    price: 850,  // JPY
    currency: 'JPY'
  },
  confidence: 0.92,
  processingTime: 0.8
}
*/
```

### 参照物体を使用した精度向上 / Using Reference Objects

```typescript
// 既知のサイズの参照物体（例: A4用紙、クレジットカード）を配置
const result = await estimator.estimate(imageBuffer, {
  referenceObject: {
    type: 'a4-paper',  // or 'credit-card', 'qr-code'
    dimensions: {
      length: 29.7,  // cm
      width: 21.0    // cm
    }
  }
});

// 精度が向上
console.log(result.confidence); // 0.97+
```

### VeyLockerボックスマッピング / VeyLocker Box Mapping

```typescript
import { mapToVeyLockerBox } from '@vey/dimension-estimation';

const dimensions = {
  length: 40,
  width: 30,
  height: 25
};

const boxMapping = mapToVeyLockerBox(dimensions);

console.log(boxMapping);
/*
{
  recommendedBox: 'L',
  alternatives: ['XL'],
  utilization: 0.78,  // 78% space utilization
  available: true,
  pricing: {
    basePrice: 1200,
    currency: 'JPY'
  }
}
*/
```

### 配送料金の自動計算 / Automatic Shipping Cost Calculation

```typescript
import { calculateShippingCost } from '@vey/dimension-estimation';

const cost = await calculateShippingCost({
  dimensions: result.dimensions,
  weight: result.weight.estimated,
  origin: { country: 'JP', postalCode: '100-0001' },
  destination: { country: 'JP', postalCode: '150-0001' },
  carrier: 'auto' // Auto-select cheapest carrier
});

console.log(cost);
/*
{
  carrier: 'Yamato',
  service: 'Standard',
  price: 850,
  currency: 'JPY',
  estimatedDelivery: '2024-12-07',
  alternatives: [
    { carrier: 'Sagawa', price: 900 },
    { carrier: 'Japan Post', price: 920 }
  ]
}
*/
```

### バッチ処理 / Batch Processing

```typescript
const packages = [
  fs.readFileSync('package1.jpg'),
  fs.readFileSync('package2.jpg'),
  fs.readFileSync('package3.jpg')
];

const results = await estimator.estimateBatch(packages, {
  parallel: true,
  maxConcurrent: 3
});

results.forEach((result, index) => {
  console.log(`Package ${index + 1}:`, {
    size: result.veyLockerBox,
    weight: result.weight.estimated,
    cost: result.shippingCost.price
  });
});
```

---

## API リファレンス / API Reference

### DimensionEstimator クラス

#### Constructor

```typescript
new DimensionEstimator(options?: EstimatorOptions)
```

**Options:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `calibrationMethod` | `'reference-object' \| 'ar-marker' \| 'multi-view'` | `'reference-object'` | 校正方法 |
| `weightModel` | `'ml-regression' \| 'density-based'` | `'ml-regression'` | 重量推定モデル |
| `unit` | `'metric' \| 'imperial'` | `'metric'` | 単位系 |
| `confidenceThreshold` | `number` | `0.8` | 最小信頼度 |
| `useGPU` | `boolean` | `false` | GPU使用 |

#### Methods

##### estimate()

```typescript
estimate(image: Buffer | string, options?: EstimateOptions): Promise<EstimationResult>
```

画像から荷物の寸法と重量を推定します。

**Parameters:**
- `image`: 画像バッファまたはファイルパス
- `options`: 推定オプション

**Returns:** `EstimationResult`

##### estimateBatch()

```typescript
estimateBatch(images: (Buffer | string)[], options?: BatchOptions): Promise<EstimationResult[]>
```

複数の画像を一括処理します。

---

## 型定義 / Type Definitions

```typescript
interface EstimationResult {
  dimensions: Dimensions;
  weight: WeightEstimate;
  volume: number;
  veyLockerBox: VeyLockerBoxSize;
  shippingCost: ShippingCost;
  confidence: number;
  processingTime: number;
  errors?: string[];
}

interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'inch';
}

interface WeightEstimate {
  estimated: number;
  confidence: number;
  unit: 'kg' | 'lb';
  method: 'ml' | 'density' | 'manual';
}

type VeyLockerBoxSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

interface ShippingCost {
  carrier: string;
  service: string;
  price: number;
  currency: string;
  estimatedDelivery?: string;
  alternatives?: CarrierOption[];
}

interface EstimateOptions {
  referenceObject?: ReferenceObject;
  manualWeight?: number;
  destination?: Address;
  preferredCarrier?: string;
}

interface ReferenceObject {
  type: 'a4-paper' | 'credit-card' | 'qr-code' | 'custom';
  dimensions?: {
    length: number;
    width: number;
    height?: number;
  };
}
```

---

## VeyLockerボックスサイズ / VeyLocker Box Sizes

```typescript
const VEYLOCKER_BOX_SIZES = {
  XS: {
    dimensions: { length: 20, width: 15, height: 10 },
    maxWeight: 2,
    basePrice: 500
  },
  S: {
    dimensions: { length: 30, width: 20, height: 15 },
    maxWeight: 5,
    basePrice: 700
  },
  M: {
    dimensions: { length: 40, width: 30, height: 25 },
    maxWeight: 10,
    basePrice: 1200
  },
  L: {
    dimensions: { length: 60, width: 40, height: 40 },
    maxWeight: 20,
    basePrice: 1800
  },
  XL: {
    dimensions: { length: 80, width: 60, height: 60 },
    maxWeight: 30,
    basePrice: 2500
  },
  XXL: {
    dimensions: { length: 120, width: 80, height: 80 },
    maxWeight: 50,
    basePrice: 3500
  }
};
```

---

## 推定アルゴリズム / Estimation Algorithms

### 1. 参照物体ベース / Reference Object-based

最も精度の高い方法。既知のサイズの物体を参照として使用。

**精度**: ±2-5cm (95%+信頼度)

```typescript
// A4用紙を参照物体として使用
const result = await estimator.estimate(image, {
  referenceObject: {
    type: 'a4-paper',
    dimensions: { length: 29.7, width: 21.0 }
  }
});
```

### 2. ARマーカーベース / AR Marker-based

ARマーカーを使用した自動校正。

**精度**: ±5cm

```typescript
// QRコードマーカーを使用
const result = await estimator.estimate(image, {
  calibrationMethod: 'ar-marker',
  referenceObject: {
    type: 'qr-code',
    dimensions: { length: 5, width: 5 } // cm
  }
});
```

### 3. マルチビュー / Multi-view

複数の角度から撮影した画像を使用。

**精度**: ±3-7cm

```typescript
const images = [
  fs.readFileSync('front.jpg'),
  fs.readFileSync('side.jpg'),
  fs.readFileSync('top.jpg')
];

const result = await estimator.estimateMultiView(images);
```

---

## 重量推定モデル / Weight Estimation Models

### 1. 機械学習回帰 / ML Regression

CNNベースの重量推定モデル。

**精度**: ±10-15%

**学習データ**:
- 100,000+ package images with actual weights
- Various package types (boxes, envelopes, irregular shapes)

```typescript
const estimator = new DimensionEstimator({
  weightModel: 'ml-regression'
});
```

### 2. 密度ベース / Density-based

体積と推定密度から重量を計算。

**精度**: ±20-30%

```typescript
const estimator = new DimensionEstimator({
  weightModel: 'density-based',
  defaultDensity: 0.3 // kg/L (typical cardboard box)
});
```

---

## パフォーマンス / Performance

### ベンチマーク結果

```
テスト環境: 
- GPU: NVIDIA RTX 3070
- CPU: Intel i7-10700K
- RAM: 16GB
- 画像サイズ: 1920x1080px

結果:
┌──────────────────┬──────────┬─────────────┬──────────┐
│ 方法             │ 平均時間 │ 精度        │ メモリ   │
├──────────────────┼──────────┼─────────────┼──────────┤
│ Reference Object │ 0.8秒    │ ±2-5cm      │ 300MB    │
│ AR Marker        │ 0.6秒    │ ±5cm        │ 250MB    │
│ Multi-view       │ 2.1秒    │ ±3-7cm      │ 450MB    │
│ Weight (ML)      │ 0.5秒    │ ±10-15%     │ 200MB    │
│ Weight (Density) │ 0.1秒    │ ±20-30%     │ 50MB     │
└──────────────────┴──────────┴─────────────┴──────────┘
```

---

## ベストプラクティス / Best Practices

### 1. 撮影のコツ

```typescript
// 良い例
const goodPractice = {
  lighting: 'uniform-bright',
  background: 'plain-contrasting',
  angle: 'straight-on',
  distance: '1-2 meters',
  referenceObject: 'included'
};

// 悪い例
const badPractice = {
  lighting: 'shadowy',
  background: 'cluttered',
  angle: 'tilted',
  distance: 'too-close',
  referenceObject: 'none'
};
```

### 2. 精度向上のヒント

```typescript
// 参照物体を常に含める
const result = await estimator.estimate(image, {
  referenceObject: {
    type: 'a4-paper',
    dimensions: { length: 29.7, width: 21.0 }
  }
});

// 複数角度から撮影（可能な場合）
const multiViewResult = await estimator.estimateMultiView([
  frontImage,
  sideImage,
  topImage
]);

// 手動重量を提供（計測済みの場合）
const accurateResult = await estimator.estimate(image, {
  manualWeight: 2.5 // kg
});
```

---

## トラブルシューティング / Troubleshooting

### 寸法の推定精度が低い

**原因と対策:**

1. **参照物体がない**
   ```typescript
   // 対策: A4用紙やクレジットカードを配置
   const result = await estimator.estimate(image, {
     referenceObject: { type: 'a4-paper' }
   });
   ```

2. **照明が不十分**
   ```typescript
   // 対策: 画像の前処理を有効化
   const result = await estimator.estimate(image, {
     preprocessing: {
       brightnessCorrection: true,
       contrastEnhancement: true
     }
   });
   ```

3. **荷物が背景と同化している**
   - 対策: コントラストの高い背景を使用

---

## 統合例 / Integration Examples

### VeyLocker統合

```typescript
import { DimensionEstimator } from '@vey/dimension-estimation';
import { VeyLocker } from '@vey/veylocker';

const estimator = new DimensionEstimator();
const locker = new VeyLocker();

async function findAvailableBox(packageImage: Buffer) {
  // 1. 寸法推定
  const estimation = await estimator.estimate(packageImage);
  
  // 2. 利用可能なボックスを検索
  const availableBoxes = await locker.findAvailableBoxes({
    size: estimation.veyLockerBox,
    location: 'Tokyo-Shibuya-01'
  });
  
  // 3. 予約
  if (availableBoxes.length > 0) {
    const reservation = await locker.reserve({
      boxId: availableBoxes[0].id,
      duration: 24, // hours
      estimatedSize: estimation.veyLockerBox
    });
    
    return reservation;
  }
  
  throw new Error('No available boxes');
}
```

### VeyExpress統合

```typescript
import { DimensionEstimator } from '@vey/dimension-estimation';
import { VeyExpress } from '@vey/veyexpress';

const estimator = new DimensionEstimator();
const express = new VeyExpress();

async function getShippingQuote(packageImage: Buffer, destination: Address) {
  // 1. 寸法・重量推定
  const estimation = await estimator.estimate(packageImage);
  
  // 2. 配送業者比較
  const quotes = await express.getQuotes({
    dimensions: estimation.dimensions,
    weight: estimation.weight.estimated,
    destination: destination
  });
  
  // 3. 最安値を返す
  return quotes.sort((a, b) => a.price - b.price)[0];
}
```

---

## セキュリティ / Security

### データプライバシー

- 画像データは処理後すぐに削除
- 寸法・重量データのみを保存
- E2E暗号化オプション対応

---

## ライセンス / License

MIT License

---

**📏 Dimension Estimation** - Accurate package measurement for smart logistics
