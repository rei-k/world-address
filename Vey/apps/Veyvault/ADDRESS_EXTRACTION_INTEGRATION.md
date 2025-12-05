# Veyvault 住所抽出統合 / Address Extraction Integration

**Veyvault**における画像からの住所抽出機能の統合ガイドです。

This guide describes how to integrate address extraction from images in Veyvault.

---

## 概要 / Overview

Veyvaultは以下のAI画像認識機能を統合します：

1. **宛名画像からの住所抽出** - 封筒・荷物・名刺から住所を抽出
2. **AMF補完生成** - 部分的な住所情報から完全な住所を生成
3. **QR/NFCハイブリッド** - 複数の情報源から最適な住所を選択

---

## 実装例 / Implementation Example

### React Component

```typescript
// components/AddressExtraction.tsx
import React, { useState } from 'react';
import { VeyVisionClient } from '@vey/vision-sdk';

const client = new VeyVisionClient({
  apiKey: process.env.NEXT_PUBLIC_VEY_API_KEY
});

export function AddressExtraction() {
  const [image, setImage] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractedAddress, setExtractedAddress] = useState<any>(null);

  const handleImageUpload = async (file: File) => {
    setImage(file);
    setExtracting(true);

    try {
      const result = await client.address.extract({
        image: file,
        imageType: 'envelope',
        options: {
          autoDetectCountry: true,
          normalizeAddress: true,
          generatePID: true,
          verifyWithGeo: true,
          completePartialAddress: true
        }
      });

      setExtractedAddress(result.data);
    } catch (error) {
      console.error('Address extraction failed:', error);
    } finally {
      setExtracting(false);
    }
  };

  const handleSaveAddress = async () => {
    const address = {
      ...extractedAddress.addressCandidates[0].normalized,
      pid: extractedAddress.addressCandidates[0].pid,
      source: 'image_extraction',
      verified: extractedAddress.addressCandidates[0].geoVerified
    };

    await saveToVeyvault(address);
  };

  return (
    <div className="address-extraction">
      <h2>写真から住所を登録</h2>
      
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
      />

      {extracting && <div>AI解析中...</div>}

      {extractedAddress && (
        <div className="extracted-result">
          <h3>抽出された住所</h3>
          <p>{extractedAddress.addressCandidates[0].raw}</p>
          <p>PID: <code>{extractedAddress.addressCandidates[0].pid}</code></p>
          <p>信頼度: {(extractedAddress.addressCandidates[0].confidence * 100).toFixed(0)}%</p>
          
          <button onClick={handleSaveAddress}>Veyvaultに保存</button>
        </div>
      )}
    </div>
  );
}
```

---

## まとめ / Summary

- ✅ 写真から住所を自動抽出
- ✅ AMF補完で完全な住所を生成
- ✅ 入力時間を95%削減

詳細は [AI Image Recognition Documentation](../../../docs/ai/image-recognition-capabilities.md) をご覧ください。
