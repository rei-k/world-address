# VeyStore AI画像認識統合 / VeyStore AI Image Recognition Integration

**VeyStore**におけるAI画像認識機能の統合ガイドです。

This guide describes how to integrate AI image recognition features in VeyStore.

---

## 概要 / Overview

VeyStoreは以下のAI画像認識機能を統合します：

1. **商品画像自動タグ付け** - 商品登録時の手作業を90%削減
2. **不正出品自動チェック** - プラットフォームコンプライアンス強化

---

## 商品画像自動タグ付け / Automatic Product Tagging

### 機能概要

商品画像から以下の情報を自動抽出します：

- **カテゴリ**: 衣類、家電、食品など
- **素材**: 綿、ポリエステル、金属など
- **色**: 主要色とカラーパレット
- **サイズ推定**: 高さ・幅・奥行き
- **多言語説明**: 日本語、英語、中国語など

### 実装例

#### React Component

```typescript
// components/ProductUpload.tsx
import React, { useState } from 'react';
import { VeyVisionClient } from '@vey/vision-sdk';

const client = new VeyVisionClient({
  apiKey: process.env.NEXT_PUBLIC_VEY_API_KEY
});

export function ProductUpload() {
  const [image, setImage] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiTags, setAiTags] = useState<any>(null);

  const handleImageUpload = async (file: File) => {
    setImage(file);
    setAnalyzing(true);

    try {
      // AI画像解析
      const result = await client.product.analyze({
        image: file,
        options: {
          detectCategory: true,
          detectMaterial: true,
          detectColor: true,
          estimateSize: true,
          generateDescription: true,
          languages: ['ja', 'en', 'zh']
        }
      });

      setAiTags(result.data);
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveProduct = async () => {
    // Extract product name from description
    // Handle multiple languages and empty descriptions
    let productName = 'Untitled Product';
    if (aiTags.descriptions.ja) {
      const sentences = aiTags.descriptions.ja.split(/[。.]/);
      productName = sentences[0] || productName;
    } else if (aiTags.descriptions.en) {
      const sentences = aiTags.descriptions.en.split(/[.]/);
      productName = sentences[0] || productName;
    }
    
    const product = {
      name: productName.substring(0, 100), // Limit length
      category: aiTags.category.primary,
      subcategory: aiTags.category.secondary,
      material: aiTags.material.map(m => m.name).join(', '),
      colors: aiTags.colors.map(c => c.name),
      descriptions: aiTags.descriptions,
      seoTags: aiTags.seoTags,
      images: [image],
      // ユーザーが手動で修正可能
      manualOverride: false
    };

    await saveProduct(product);
  };

  return (
    <div className="product-upload">
      <h2>商品を登録</h2>
      
      {/* 画像アップロード */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
      />

      {/* AI解析中 */}
      {analyzing && (
        <div className="analyzing">
          <span>AI解析中...</span>
        </div>
      )}

      {/* AI解析結果 */}
      {aiTags && (
        <div className="ai-results">
          <h3>AI解析結果</h3>
          
          {/* カテゴリ */}
          <div className="category">
            <label>カテゴリ:</label>
            <span>{aiTags.category.primary} &gt; {aiTags.category.secondary}</span>
            <span className="confidence">信頼度: {(aiTags.category.confidence * 100).toFixed(0)}%</span>
          </div>

          {/* 素材 */}
          <div className="material">
            <label>素材:</label>
            <span>{aiTags.material.map(m => `${m.name} ${m.percentage}%`).join(', ')}</span>
          </div>

          {/* 色 */}
          <div className="colors">
            <label>カラー:</label>
            <div className="color-palette">
              {aiTags.colors.map((color, i) => (
                <div key={i} className="color-swatch">
                  <div
                    className="swatch"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span>{color.name}</span>
                  <span>{color.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* 商品説明 */}
          <div className="descriptions">
            <label>商品説明:</label>
            <div className="lang-tabs">
              <button>日本語</button>
              <button>English</button>
              <button>中文</button>
            </div>
            <textarea
              defaultValue={aiTags.descriptions.ja}
              rows={4}
            />
          </div>

          {/* SEOタグ */}
          <div className="seo-tags">
            <label>SEOタグ:</label>
            <div className="tags">
              {aiTags.seoTags.map((tag, i) => (
                <span key={i} className="tag">{tag}</span>
              ))}
            </div>
          </div>

          {/* 保存ボタン */}
          <button onClick={handleSaveProduct} className="save-btn">
            商品を保存
          </button>
        </div>
      )}
    </div>
  );
}
```

#### バックエンドAPI

```typescript
// pages/api/products/create.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { VeyVisionClient } from '@vey/vision-sdk';

const visionClient = new VeyVisionClient({
  apiKey: process.env.VEY_API_KEY
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { image, manualData } = req.body;

  try {
    // AI画像解析
    const aiResult = await visionClient.product.analyze({
      image,
      options: {
        detectCategory: true,
        detectMaterial: true,
        detectColor: true,
        generateDescription: true,
        languages: ['ja', 'en', 'zh']
      }
    });

    // 不正検出も同時実行
    const fraudResult = await visionClient.fraud.detect({
      image,
      detectionType: 'all',
      options: {
        checkCounterfeit: true,
        checkCopyright: true,
        checkProhibited: true
      }
    });

    // リスクが高い場合は拒否
    if (fraudResult.data.riskLevel === 'high') {
      return res.status(400).json({
        error: 'Product rejected',
        reason: fraudResult.data.violations
      });
    }

    // 商品データ作成
    const product = {
      ...aiResult.data,
      ...manualData, // ユーザーが手動で修正したデータで上書き
      fraudCheck: fraudResult.data,
      status: fraudResult.data.riskLevel === 'medium' ? 'pending_review' : 'approved'
    };

    // データベースに保存
    const savedProduct = await db.products.create(product);

    res.status(201).json({ product: savedProduct });
  } catch (error) {
    console.error('Product creation failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

## 不正出品自動チェック / Automatic Fraud Detection

### 機能概要

以下の不正を自動検出します：

- **偽造品**: ブランド品のコピー商品
- **著作権違反**: キャラクター画像の無断使用
- **危険物**: 武器、医薬品、規制品
- **画像転載**: 他サイトからの画像流用

### 実装例

#### 自動審査フロー

```typescript
// lib/fraud-detection.ts
import { VeyVisionClient } from '@vey/vision-sdk';

const client = new VeyVisionClient({
  apiKey: process.env.VEY_API_KEY
});

export async function validateProductListing(product: Product) {
  // すべての商品画像をチェック
  const fraudResults = await Promise.all(
    product.images.map(image =>
      client.fraud.detect({
        image: image.url,
        detectionType: 'all',
        options: {
          checkCounterfeit: true,
          checkCopyright: true,
          checkProhibited: true,
          checkImageQuality: true,
          brandWhitelist: ['Nike', 'Adidas', 'Apple'] // 許可ブランド
        }
      })
    )
  );

  // 最も高いリスクスコアを取得
  const maxRisk = Math.max(...fraudResults.map(r => r.data.riskScore));
  const highestRisk = fraudResults.find(r => r.data.riskScore === maxRisk);

  // リスクレベル別の処理
  if (highestRisk.data.riskLevel === 'high') {
    // 即座に削除
    await deleteProduct(product.id);
    
    // 出品者に通知
    await notifyUser({
      userId: product.sellerId,
      type: 'product_removed',
      reason: highestRisk.data.violations,
      message: '出品された商品が自動チェックにより削除されました。'
    });

    // ログ記録
    await logFraudDetection({
      productId: product.id,
      sellerId: product.sellerId,
      riskScore: maxRisk,
      violations: highestRisk.data.violations
    });

    return { status: 'rejected', reason: 'fraud_detected' };
  }

  if (highestRisk.data.riskLevel === 'medium') {
    // 人間審査待ち
    await queueForManualReview(product.id, {
      riskScore: maxRisk,
      violations: highestRisk.data.violations
    });

    // モデレーターに通知
    await notifyModerator({
      productId: product.id,
      sellerId: product.sellerId,
      riskFactors: highestRisk.data.violations
    });

    return { status: 'pending_review' };
  }

  // Low risk: 公開
  return { status: 'approved' };
}
```

#### 審査ダッシュボード

```typescript
// pages/admin/moderation.tsx
import React, { useEffect, useState } from 'react';

export function ModerationDashboard() {
  const [pendingReviews, setPendingReviews] = useState([]);

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const fetchPendingReviews = async () => {
    const response = await fetch('/api/admin/pending-reviews');
    const data = await response.json();
    setPendingReviews(data.reviews);
  };

  const handleApprove = async (productId: string) => {
    await fetch(`/api/admin/products/${productId}/approve`, {
      method: 'POST'
    });
    fetchPendingReviews();
  };

  const handleReject = async (productId: string, reason: string) => {
    await fetch(`/api/admin/products/${productId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
    fetchPendingReviews();
  };

  return (
    <div className="moderation-dashboard">
      <h1>商品審査ダッシュボード</h1>
      
      <div className="stats">
        <div className="stat">
          <label>審査待ち:</label>
          <span>{pendingReviews.length}</span>
        </div>
      </div>

      <div className="review-list">
        {pendingReviews.map(review => (
          <div key={review.productId} className="review-item">
            <div className="product-info">
              <img src={review.product.images[0]} alt="" />
              <div>
                <h3>{review.product.name}</h3>
                <p>出品者: {review.seller.name}</p>
              </div>
            </div>

            <div className="fraud-analysis">
              <div className="risk-score">
                <label>リスクスコア:</label>
                <span className={`score ${review.riskLevel}`}>
                  {review.riskScore}/100
                </span>
              </div>

              <div className="violations">
                <label>検出された問題:</label>
                <ul>
                  {review.violations.map((v, i) => (
                    <li key={i}>
                      <span className="type">{v.type}</span>
                      <span className="confidence">{(v.confidence * 100).toFixed(0)}%</span>
                      <span className="details">{v.details.evidence}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="actions">
              <button
                onClick={() => handleApprove(review.productId)}
                className="approve-btn"
              >
                承認
              </button>
              <button
                onClick={() => handleReject(review.productId, review.violations[0].type)}
                className="reject-btn"
              >
                拒否
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Shopifyアプリ統合 / Shopify App Integration

### VeyStore AI Tagging

Shopifyアプリとして提供される商品タグ付け機能。

#### インストール

```bash
# Shopify App Storeからインストール
https://apps.shopify.com/veystore-ai-tagging
```

#### 使用方法

1. アプリをインストール
2. VeyアカウントとAPIキーを設定
3. 商品管理画面で「AI Tagging」ボタンをクリック
4. 自動タグ付け結果を確認・修正
5. 保存

#### プログラマティック統合

```javascript
// Shopify Liquid Template
{% if product.metafields.vey.ai_tags %}
  <div class="ai-tags">
    <h4>AIが抽出した情報:</h4>
    <ul>
      <li>カテゴリ: {{ product.metafields.vey.ai_tags.category }}</li>
      <li>素材: {{ product.metafields.vey.ai_tags.material }}</li>
      <li>カラー: {{ product.metafields.vey.ai_tags.colors | join: ', ' }}</li>
    </ul>
  </div>
{% endif %}
```

### VeyStore Fraud Shield

Shopifyアプリとして提供される不正検出機能。

#### 設定

```javascript
// config/vey-fraud-shield.json
{
  "autoRemove": true,
  "riskThreshold": 70,
  "brandWhitelist": ["Nike", "Adidas", "Apple"],
  "notifications": {
    "email": "admin@example.com",
    "slack": "https://hooks.slack.com/..."
  }
}
```

---

## バルク処理 / Bulk Processing

既存商品の一括タグ付け。

```typescript
// scripts/bulk-tag-products.ts
import { VeyVisionClient } from '@vey/vision-sdk';

const client = new VeyVisionClient({
  apiKey: process.env.VEY_API_KEY
});

async function bulkTagProducts(productIds: string[]) {
  const results = [];

  for (const productId of productIds) {
    const product = await db.products.findById(productId);
    
    try {
      const aiResult = await client.product.analyze({
        imageUrl: product.images[0],
        options: {
          detectCategory: true,
          detectMaterial: true,
          detectColor: true,
          generateDescription: true,
          languages: ['ja', 'en']
        }
      });

      // 商品を更新
      await db.products.update(productId, {
        aiTags: aiResult.data,
        descriptions: {
          ...product.descriptions,
          ...aiResult.data.descriptions
        },
        seoTags: aiResult.data.seoTags
      });

      results.push({ productId, status: 'success' });
    } catch (error) {
      results.push({ productId, status: 'failed', error: error.message });
    }

    // レート制限を考慮して待機
    await sleep(100);
  }

  return results;
}

// 使用例
const productIds = await db.products.findAll({ aiTagged: false }).map(p => p.id);
const results = await bulkTagProducts(productIds);
console.log(`${results.filter(r => r.status === 'success').length} products tagged`);
```

---

## まとめ / Summary

VeyStoreのAI画像認識統合により：

- ✅ 商品登録時間を90%削減
- ✅ SEO最適化された多言語商品説明
- ✅ 不正出品を自動検出・削除
- ✅ プラットフォームの信頼性向上
- ✅ Shopifyアプリとして簡単導入

詳細は [AI Image Recognition Documentation](../../../docs/ai/image-recognition-capabilities.md) をご覧ください。
