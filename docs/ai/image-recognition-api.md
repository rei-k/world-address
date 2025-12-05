# 画像認識API仕様 / Image Recognition API Specification

このドキュメントでは、AI画像認識機能のAPI仕様について説明します。

This document describes the API specifications for AI image recognition capabilities.

---

## 目次 / Table of Contents

1. [API概要](#api概要--api-overview)
2. [認証](#認証--authentication)
3. [商品画像タグ付けAPI](#商品画像タグ付けapi--product-tagging-api)
4. [不正検出API](#不正検出api--fraud-detection-api)
5. [KYC画像認識API](#kyc画像認識api--kyc-recognition-api)
6. [住所抽出API](#住所抽出api--address-extraction-api)
7. [荷物認識API](#荷物認識api--package-recognition-api)
8. [エラーハンドリング](#エラーハンドリング--error-handling)
9. [レート制限](#レート制限--rate-limiting)

---

## API概要 / API Overview

### ベースURL

```
Production: https://api.vey.world/v1/vision  (Planned - Not yet available)
Staging: https://api-staging.vey.world/v1/vision  (Planned - Not yet available)
```

**Note**: These are planned API endpoints. Implementation will be available in a future release.

### 対応形式

- **リクエスト**: `multipart/form-data`, `application/json`
- **レスポンス**: `application/json`
- **画像形式**: JPEG, PNG, WebP, HEIF
- **最大ファイルサイズ**: 10MB

---

## 認証 / Authentication

全てのAPIエンドポイントは認証が必要です。

### APIキー認証

```http
Authorization: Bearer YOUR_API_KEY
```

### 取得方法

```bash
# Vey Developer Consoleでアカウント作成
https://developer.vey.world/api-keys
```

---

## 商品画像タグ付けAPI / Product Tagging API

### エンドポイント

```
POST /vision/product/analyze
```

### リクエスト

#### Multipart Form Data

```http
POST /vision/product/analyze HTTP/1.1
Host: api.vey.world
Authorization: Bearer YOUR_API_KEY
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="image"; filename="product.jpg"
Content-Type: image/jpeg

[Binary image data]
------WebKitFormBoundary
Content-Disposition: form-data; name="options"

{
  "detectCategory": true,
  "detectMaterial": true,
  "detectColor": true,
  "estimateSize": true,
  "generateDescription": true,
  "languages": ["ja", "en", "zh"]
}
------WebKitFormBoundary--
```

#### JSON (with image URL)

```json
{
  "imageUrl": "https://example.com/product.jpg",
  "options": {
    "detectCategory": true,
    "detectMaterial": true,
    "detectColor": true,
    "estimateSize": true,
    "generateDescription": true,
    "languages": ["ja", "en", "zh"]
  }
}
```

### レスポンス

```json
{
  "success": true,
  "data": {
    "category": {
      "primary": "Apparel",
      "secondary": "T-Shirts",
      "tertiary": "Men's Clothing",
      "confidence": 0.92
    },
    "material": [
      {
        "name": "Cotton",
        "percentage": 100,
        "confidence": 0.88
      }
    ],
    "colors": [
      {
        "name": "Navy Blue",
        "hex": "#001F3F",
        "rgb": [0, 31, 63],
        "percentage": 85,
        "isPrimary": true
      },
      {
        "name": "White",
        "hex": "#FFFFFF",
        "rgb": [255, 255, 255],
        "percentage": 15,
        "isPrimary": false
      }
    ],
    "dimensions": {
      "height": { "value": 70, "unit": "cm" },
      "width": { "value": 50, "unit": "cm" },
      "depth": { "value": 2, "unit": "cm" },
      "confidence": 0.75
    },
    "estimatedWeight": {
      "value": 180,
      "unit": "g",
      "confidence": 0.70
    },
    "descriptions": {
      "ja": "この商品は、コットン100%の半袖Tシャツです。カラーはネイビーブルーで、シンプルなデザインが特徴です。",
      "en": "This product is a 100% cotton short-sleeve T-shirt. The color is navy blue with a simple design.",
      "zh": "本产品是100%棉质短袖T恤。颜色为海军蓝，设计简洁。"
    },
    "seoTags": [
      "cotton t-shirt",
      "navy blue",
      "men's apparel",
      "casual wear",
      "short sleeve"
    ]
  },
  "processing": {
    "imageId": "img_1a2b3c4d5e6f",
    "processingTime": 1.23,
    "timestamp": "2024-12-05T03:15:00Z"
  }
}
```

### TypeScript型定義

```typescript
interface ProductAnalysisRequest {
  image?: File;
  imageUrl?: string;
  options?: {
    detectCategory?: boolean;
    detectMaterial?: boolean;
    detectColor?: boolean;
    estimateSize?: boolean;
    generateDescription?: boolean;
    languages?: string[];
  };
}

interface ProductAnalysisResponse {
  success: boolean;
  data: {
    category: {
      primary: string;
      secondary: string;
      tertiary: string;
      confidence: number;
    };
    material: Array<{
      name: string;
      percentage: number;
      confidence: number;
    }>;
    colors: Array<{
      name: string;
      hex: string;
      rgb: [number, number, number];
      percentage: number;
      isPrimary: boolean;
    }>;
    dimensions: {
      height: { value: number; unit: string };
      width: { value: number; unit: string };
      depth: { value: number; unit: string };
      confidence: number;
    };
    estimatedWeight: {
      value: number;
      unit: string;
      confidence: number;
    };
    descriptions: Record<string, string>;
    seoTags: string[];
  };
  processing: {
    imageId: string;
    processingTime: number;
    timestamp: string;
  };
}
```

---

## 不正検出API / Fraud Detection API

### エンドポイント

```
POST /vision/fraud/detect
```

### リクエスト

```json
{
  "image": "[base64 encoded image]",
  "detectionType": "counterfeit",
  "options": {
    "checkCounterfeit": true,
    "checkCopyright": true,
    "checkProhibited": true,
    "checkImageQuality": true,
    "brandWhitelist": ["Nike", "Adidas"]
  }
}
```

### レスポンス

```json
{
  "success": true,
  "data": {
    "riskLevel": "high",
    "riskScore": 94,
    "violations": [
      {
        "type": "counterfeit",
        "severity": "critical",
        "confidence": 0.94,
        "details": {
          "brand": "Louis Vuitton",
          "evidence": "Logo pattern mismatch",
          "authenticComparison": {
            "similarity": 0.45,
            "differences": [
              "Stitching pattern irregular",
              "Font spacing incorrect",
              "Material texture mismatch"
            ]
          }
        }
      },
      {
        "type": "copyright",
        "severity": "high",
        "confidence": 0.88,
        "details": {
          "source": "stock photo website",
          "evidence": "Watermark detected",
          "matchedUrl": "https://example.com/stock-photo-12345"
        }
      }
    ],
    "recommendation": {
      "action": "remove",
      "reason": "High risk of counterfeit product",
      "requiresHumanReview": true
    }
  },
  "processing": {
    "imageId": "img_fraud_7g8h9i0j",
    "processingTime": 0.89,
    "timestamp": "2024-12-05T03:20:00Z"
  }
}
```

### TypeScript型定義

```typescript
interface FraudDetectionRequest {
  image: string | File;
  detectionType: 'counterfeit' | 'copyright' | 'prohibited' | 'all';
  options?: {
    checkCounterfeit?: boolean;
    checkCopyright?: boolean;
    checkProhibited?: boolean;
    checkImageQuality?: boolean;
    brandWhitelist?: string[];
  };
}

interface FraudDetectionResponse {
  success: boolean;
  data: {
    riskLevel: 'low' | 'medium' | 'high';
    riskScore: number;
    violations: Array<{
      type: 'counterfeit' | 'copyright' | 'prohibited';
      severity: 'low' | 'medium' | 'high' | 'critical';
      confidence: number;
      details: any;
    }>;
    recommendation: {
      action: 'approve' | 'review' | 'remove';
      reason: string;
      requiresHumanReview: boolean;
    };
  };
  processing: {
    imageId: string;
    processingTime: number;
    timestamp: string;
  };
}
```

---

## KYC画像認識API / KYC Recognition API

### エンドポイント

```
POST /vision/kyc/extract
```

### リクエスト

```json
{
  "documentType": "driver_license",
  "country": "JP",
  "images": {
    "front": "[base64 encoded front image]",
    "back": "[base64 encoded back image]",
    "selfie": "[base64 encoded selfie]"
  },
  "options": {
    "extractPersonalInfo": true,
    "extractAddress": true,
    "verifyAuthenticity": true,
    "performFaceMatch": true,
    "normalizeAddress": true
  }
}
```

### レスポンス

```json
{
  "success": true,
  "data": {
    "documentType": "driver_license",
    "country": "JP",
    "extractedData": {
      "personalInfo": {
        "fullName": "山田 太郎",
        "firstName": "太郎",
        "lastName": "山田",
        "dateOfBirth": "1990-01-15",
        "gender": "M",
        "nationality": "Japanese"
      },
      "documentInfo": {
        "licenseNumber": "123456789012",
        "issueDate": "2020-01-15",
        "expiryDate": "2025-01-15",
        "issuingAuthority": "Tokyo Metropolitan Police"
      },
      "address": {
        "raw": "東京都渋谷区渋谷1-2-3",
        "normalized": {
          "country": "JP",
          "admin1": "Tokyo",
          "admin1Code": "13",
          "admin2": "Shibuya-ku",
          "admin2Code": "113",
          "locality": "Shibuya",
          "streetAddress": "1-2-3",
          "postalCode": "150-0002"
        },
        "pid": "JP-13-113-01-T01-B02-BN03",
        "geoCoordinates": {
          "latitude": 35.6595,
          "longitude": 139.7004,
          "accuracy": 10
        }
      }
    },
    "verification": {
      "authenticityScore": 0.96,
      "fraudIndicators": [],
      "securityFeatures": {
        "hologramDetected": true,
        "uvPrintDetected": true,
        "microTextDetected": true
      },
      "faceMatch": {
        "matched": true,
        "confidence": 0.94,
        "livenessDetected": true
      }
    },
    "verifiableCredential": {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      "type": ["VerifiableCredential", "AddressPIDCredential"],
      "issuer": "did:web:vey.world",
      "issuanceDate": "2024-12-05T03:25:00Z",
      "credentialSubject": {
        "id": "did:key:user123",
        "addressPID": "JP-13-113-01-T01-B02-BN03",
        "country": "JP",
        "admin1": "13"
      },
      "proof": {
        "type": "Ed25519Signature2020",
        "created": "2024-12-05T03:25:00Z",
        "proofPurpose": "assertionMethod",
        "verificationMethod": "did:web:vey.world#key-1",
        "proofValue": "..."
      }
    }
  },
  "processing": {
    "imageId": "img_kyc_k1l2m3n4",
    "processingTime": 2.45,
    "timestamp": "2024-12-05T03:25:00Z"
  }
}
```

---

## 住所抽出API / Address Extraction API

### エンドポイント

```
POST /vision/address/extract
```

### リクエスト

```json
{
  "image": "[base64 encoded image]",
  "imageType": "envelope",
  "options": {
    "autoDetectCountry": true,
    "normalizeAddress": true,
    "generatePID": true,
    "verifyWithGeo": true,
    "completePartialAddress": true
  }
}
```

### レスポンス

```json
{
  "success": true,
  "data": {
    "extractedText": "〒150-0002\n東京都渋谷区渋谷1-2-3\nヴェイマンション101号室\n山田太郎 様",
    "addressCandidates": [
      {
        "raw": "東京都渋谷区渋谷1-2-3 ヴェイマンション101号室",
        "normalized": {
          "country": "JP",
          "postalCode": "150-0002",
          "admin1": "Tokyo",
          "admin1Code": "13",
          "admin2": "Shibuya-ku",
          "admin2Code": "113",
          "locality": "Shibuya",
          "sublocality": "1-chome",
          "block": "2",
          "building": "Vey Mansion",
          "unit": "101"
        },
        "pid": "JP-13-113-01-T01-B02-BN-VEY-R101",
        "confidence": 0.95,
        "completed": true,
        "completedFields": ["admin1", "admin2"],
        "geoVerified": true,
        "geoCoordinates": {
          "latitude": 35.6595,
          "longitude": 139.7004,
          "accuracy": 5
        }
      }
    ],
    "recipient": {
      "name": "山田太郎",
      "honorific": "様"
    }
  },
  "processing": {
    "imageId": "img_addr_o5p6q7r8",
    "processingTime": 1.67,
    "timestamp": "2024-12-05T03:30:00Z"
  }
}
```

---

## 荷物認識API / Package Recognition API

### エンドポイント

```
POST /vision/package/analyze
```

### リクエスト

```json
{
  "image": "[base64 encoded image]",
  "referenceObject": "a4_paper",
  "options": {
    "estimateSize": true,
    "estimateWeight": true,
    "detectDamage": true,
    "detectHazardLabels": true,
    "generateWaybill": true
  },
  "shipmentDetails": {
    "recipientPID": "JP-13-101-01",
    "serviceType": "standard",
    "insuranceValue": 10000
  }
}
```

### レスポンス

```json
{
  "success": true,
  "data": {
    "packageInfo": {
      "dimensions": {
        "height": { "value": 30, "unit": "cm", "confidence": 0.92 },
        "width": { "value": 40, "unit": "cm", "confidence": 0.94 },
        "depth": { "value": 20, "unit": "cm", "confidence": 0.89 },
        "volume": { "value": 24000, "unit": "cm3" }
      },
      "estimatedWeight": {
        "value": 2.5,
        "unit": "kg",
        "confidence": 0.75,
        "method": "volume_based"
      },
      "condition": {
        "damageDetected": false,
        "hazardLabelsDetected": false
      }
    },
    "shippingOptions": [
      {
        "carrier": "Yamato Transport",
        "carrierCode": "JP_YAMATO",
        "serviceType": "standard",
        "estimatedCost": {
          "amount": 1200,
          "currency": "JPY"
        },
        "estimatedDelivery": {
          "min": "2024-12-06",
          "max": "2024-12-07"
        },
        "recommended": true,
        "features": ["tracking", "insurance", "signature"]
      },
      {
        "carrier": "Japan Post",
        "carrierCode": "JP_POST",
        "serviceType": "express",
        "estimatedCost": {
          "amount": 1800,
          "currency": "JPY"
        },
        "estimatedDelivery": {
          "min": "2024-12-06",
          "max": "2024-12-06"
        },
        "recommended": false,
        "features": ["tracking", "insurance", "next_day"]
      }
    ],
    "waybill": {
      "waybillId": "WB-2024-1205-001",
      "trackingNumber": "1234-5678-9012",
      "qrCode": "data:image/png;base64,...",
      "zkpEnabled": true,
      "zkpProof": {
        "proofId": "zkp_s9t0u1v2",
        "deliveryConditions": {
          "allowedCountries": ["JP"],
          "allowedRegions": ["13", "14", "27"]
        },
        "privacyLevel": "delivery_time_only"
      }
    }
  },
  "processing": {
    "imageId": "img_pkg_w3x4y5z6",
    "processingTime": 2.12,
    "timestamp": "2024-12-05T03:35:00Z"
  }
}
```

---

## エラーハンドリング / Error Handling

### エラーレスポンス形式

```json
{
  "success": false,
  "error": {
    "code": "INVALID_IMAGE_FORMAT",
    "message": "The uploaded image format is not supported. Please use JPEG, PNG, or WebP.",
    "details": {
      "receivedFormat": "BMP",
      "supportedFormats": ["JPEG", "PNG", "WebP", "HEIF"]
    },
    "timestamp": "2024-12-05T03:40:00Z",
    "requestId": "req_a1b2c3d4e5f6"
  }
}
```

### エラーコード一覧

| コード | HTTP Status | 説明 |
|--------|-------------|------|
| `INVALID_API_KEY` | 401 | APIキーが無効または期限切れ |
| `RATE_LIMIT_EXCEEDED` | 429 | レート制限を超過 |
| `INVALID_IMAGE_FORMAT` | 400 | サポートされていない画像形式 |
| `IMAGE_TOO_LARGE` | 400 | 画像サイズが10MBを超過 |
| `IMAGE_TOO_SMALL` | 400 | 画像解像度が低すぎる（最低200x200px） |
| `PROCESSING_FAILED` | 500 | 画像処理中にエラーが発生 |
| `OCR_FAILED` | 500 | OCR処理に失敗 |
| `NO_TEXT_DETECTED` | 400 | 画像内にテキストが検出されなかった |
| `NO_FACE_DETECTED` | 400 | 顔が検出されなかった（KYC） |
| `INSUFFICIENT_CONFIDENCE` | 400 | 信頼度スコアが閾値未満 |

---

## レート制限 / Rate Limiting

### プラン別制限

| プラン | リクエスト/分 | リクエスト/日 | 月額料金 |
|--------|--------------|--------------|---------|
| Free | 10 | 1,000 | $0 |
| Basic | 100 | 10,000 | $99 |
| Pro | 1,000 | 100,000 | $499 |
| Enterprise | カスタム | カスタム | カスタム |

### レート制限ヘッダー

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1701763200
```

---

## SDKサンプルコード / SDK Examples

### TypeScript / JavaScript

```typescript
import { VeyVisionClient } from '@vey/vision-sdk';

const client = new VeyVisionClient({
  apiKey: process.env.VEY_API_KEY
});

// 商品画像タグ付け
const productTags = await client.product.analyze({
  image: productImageFile,
  options: {
    detectCategory: true,
    detectMaterial: true,
    detectColor: true,
    generateDescription: true,
    languages: ['ja', 'en']
  }
});

console.log(productTags.data.category);
console.log(productTags.data.descriptions.ja);

// KYC画像認識
const kycResult = await client.kyc.extract({
  documentType: 'driver_license',
  country: 'JP',
  images: {
    front: licenseImageFront,
    back: licenseImageBack,
    selfie: selfieImage
  },
  options: {
    extractPersonalInfo: true,
    extractAddress: true,
    normalizeAddress: true,
    performFaceMatch: true
  }
});

console.log(kycResult.data.extractedData.address.pid);
console.log(kycResult.data.verification.faceMatch.matched);

// 住所抽出
const addressResult = await client.address.extract({
  image: envelopeImage,
  imageType: 'envelope',
  options: {
    normalizeAddress: true,
    generatePID: true,
    completePartialAddress: true
  }
});

console.log(addressResult.data.addressCandidates[0].pid);

// 荷物認識
const packageResult = await client.package.analyze({
  image: packagePhoto,
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

console.log(packageResult.data.waybill.trackingNumber);
console.log(packageResult.data.waybill.qrCode);
```

### Python

```python
from vey_vision import VeyVisionClient

client = VeyVisionClient(api_key=os.getenv('VEY_API_KEY'))

# 商品画像タグ付け
with open('product.jpg', 'rb') as f:
    product_tags = client.product.analyze(
        image=f,
        options={
            'detectCategory': True,
            'detectMaterial': True,
            'detectColor': True,
            'generateDescription': True,
            'languages': ['ja', 'en']
        }
    )

print(product_tags['data']['category'])
print(product_tags['data']['descriptions']['ja'])

# KYC画像認識
kyc_result = client.kyc.extract(
    document_type='driver_license',
    country='JP',
    images={
        'front': open('license_front.jpg', 'rb'),
        'back': open('license_back.jpg', 'rb'),
        'selfie': open('selfie.jpg', 'rb')
    },
    options={
        'extractPersonalInfo': True,
        'extractAddress': True,
        'normalizeAddress': True,
        'performFaceMatch': True
    }
)

print(kyc_result['data']['extractedData']['address']['pid'])
print(kyc_result['data']['verification']['faceMatch']['matched'])
```

### cURL

```bash
# 商品画像タグ付け
curl -X POST https://api.vey.world/v1/vision/product/analyze \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "image=@product.jpg" \
  -F 'options={"detectCategory":true,"detectColor":true}'

# KYC画像認識
curl -X POST https://api.vey.world/v1/vision/kyc/extract \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "driver_license",
    "country": "JP",
    "images": {
      "front": "data:image/jpeg;base64,...",
      "selfie": "data:image/jpeg;base64,..."
    },
    "options": {
      "extractAddress": true,
      "normalizeAddress": true,
      "performFaceMatch": true
    }
  }'
```

---

## Webhook通知 / Webhook Notifications

### Webhook設定

```http
POST /vision/webhooks
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "url": "https://your-server.com/webhooks/vey-vision",
  "events": [
    "fraud.detected",
    "kyc.completed",
    "processing.completed"
  ],
  "secret": "your_webhook_secret"
}
```

### Webhookペイロード例

```json
{
  "event": "fraud.detected",
  "timestamp": "2024-12-05T03:45:00Z",
  "data": {
    "imageId": "img_fraud_abc123",
    "riskLevel": "high",
    "violations": [
      {
        "type": "counterfeit",
        "confidence": 0.94
      }
    ],
    "productId": "prod_xyz789",
    "action": "product_removed"
  },
  "signature": "sha256=..."
}
```

---

## まとめ / Summary

このAPI仕様により、以下の機能を簡単に統合できます：

- ✅ 商品画像の自動タグ付け
- ✅ 不正出品の自動検出
- ✅ KYC本人確認の自動化
- ✅ 画像からの住所抽出
- ✅ 荷物認識と送り状生成

詳細なドキュメントは [Vey Developer Portal](https://developer.vey.world) をご覧ください。

---

**🚀 Build the Future of Commerce with Vey Vision API**
