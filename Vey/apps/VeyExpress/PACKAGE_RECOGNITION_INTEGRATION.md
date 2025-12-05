# VeyExpress 荷物認識統合 / Package Recognition Integration

**VeyExpress**における荷物撮影による送り状生成機能の統合ガイドです。

This guide describes how to integrate package recognition for waybill generation in VeyExpress.

---

## 概要 / Overview

VeyExpressは以下のAI画像認識機能を統合します：

1. **荷物サイズ推定** - 単眼カメラから3Dサイズを推定
2. **送り状自動生成** - サイズ・重量・配送先から送り状を生成
3. **QRコード送り状** - ラベルレス配送を実現

---

## 実装例 / Implementation Example

### React Component

```typescript
// components/PackageAnalysis.tsx
import React, { useState } from 'react';
import { VeyVisionClient } from '@vey/vision-sdk';

const client = new VeyVisionClient({
  apiKey: process.env.NEXT_PUBLIC_VEY_API_KEY
});

export function PackageAnalysis() {
  const [packagePhoto, setPackagePhoto] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [packageInfo, setPackageInfo] = useState<any>(null);

  const handlePhotoCapture = async (file: File) => {
    setPackagePhoto(file);
    setAnalyzing(true);

    try {
      const result = await client.package.analyze({
        image: file,
        referenceObject: 'a4_paper',
        options: {
          estimateSize: true,
          estimateWeight: true,
          generateWaybill: true
        },
        shipmentDetails: {
          recipientPID: 'JP-13-101-01',
          serviceType: 'standard'
        }
      });

      setPackageInfo(result.data);
    } catch (error) {
      console.error('Package analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="package-analysis">
      <h2>荷物を撮影して送り状生成</h2>
      
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => e.target.files && handlePhotoCapture(e.target.files[0])}
      />

      {analyzing && <div>AI解析中...</div>}

      {packageInfo && (
        <div className="package-result">
          <h3>荷物情報</h3>
          <p>サイズ: {packageInfo.packageInfo.dimensions.height.value}×{packageInfo.packageInfo.dimensions.width.value}×{packageInfo.packageInfo.dimensions.depth.value} cm</p>
          <p>推定重量: {packageInfo.packageInfo.estimatedWeight.value} kg</p>
          
          <h3>送り状</h3>
          <p>追跡番号: {packageInfo.waybill.trackingNumber}</p>
          <img src={packageInfo.waybill.qrCode} alt="QR Code" />
        </div>
      )}
    </div>
  );
}
```

---

## まとめ / Summary

- ✅ 荷物サイズ自動推定
- ✅ ラベルレス配送
- ✅ 送り状生成時間を95%削減

詳細は [AI Image Recognition Documentation](../../../docs/ai/image-recognition-capabilities.md) をご覧ください。
