# Vey 統合ガイド / Vey Integration Guide

このディレクトリには、Veyエコシステムとの統合に関するガイドとサンプルコードが含まれています。

This directory contains guides and sample code for integrating with the Vey ecosystem.

---

## 📚 統合ガイド / Integration Guides

### 1. ECサイト統合 / E-commerce Integration

Veyvault連携でワンクリックチェックアウトを実現

```javascript
// Veyvault統合ボタンの実装
import { VeyvaultButton } from '@vey/react';

function CheckoutPage() {
  return (
    <VeyvaultButton
      onSelect={(addressToken) => {
        // addressTokenを使用してチェックアウト処理
        processCheckout({ addressToken });
      }}
      onError={(error) => {
        console.error('Veyvault error:', error);
      }}
    />
  );
}
```

### 2. 配送業者統合 / Carrier Integration

VeyExpressを使用した配送統合

```javascript
// 配送業者の選択と料金計算
const carriers = await veyClient.deliveries.selectCarrier({
  fromPid: 'JP-13-113-01',
  toPid: 'JP-27-100-05',
  weight: 2.5,
  dimensions: { length: 30, width: 20, height: 15 }
});

// 最安の配送業者を選択
const cheapest = carriers[0];
console.log(`${cheapest.name}: ¥${cheapest.price}`);
```

### 3. 決済統合 / Payment Integration

VeyFinanceを使用した決済処理

```javascript
// 決済処理
const payment = await veyClient.payments.create({
  amount: 2750,
  currency: 'JPY',
  paymentMethod: 'credit_card',
  paymentToken: 'tok_xyz789',
  orderId: 'order_123'
});

if (payment.status === 'succeeded') {
  console.log('決済完了');
}
```

---

## 🔌 SDK統合例 / SDK Integration Examples

### JavaScript/TypeScript

```bash
npm install @vey/core @vey/react
```

```typescript
import { VeyClient } from '@vey/core';
import { VeyProvider, useVeyAddress } from '@vey/react';

const client = new VeyClient({
  apiKey: process.env.VEY_API_KEY
});

function App() {
  return (
    <VeyProvider client={client}>
      <YourComponents />
    </VeyProvider>
  );
}
```

### Python

```bash
pip install vey-sdk
```

```python
from vey import VeyClient

client = VeyClient(api_key=os.getenv('VEY_API_KEY'))

address = client.addresses.create(
    country='JP',
    postal_code='150-0001',
    address_line1='神宮前1-2-3'
)
```

### PHP

```bash
composer require vey/vey-php
```

```php
use Vey\VeyClient;

$client = new VeyClient(['api_key' => getenv('VEY_API_KEY')]);

$address = $client->addresses->create([
    'country' => 'JP',
    'postal_code' => '150-0001',
    'address_line1' => '神宮前1-2-3'
]);
```

---

## 🔔 Webhook統合 / Webhook Integration

### Webhookエンドポイントの設定

```javascript
const express = require('express');
const crypto = require('crypto');

app.post('/webhook', (req, res) => {
  // 署名検証
  const signature = req.headers['x-vey-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!verifySignature(payload, signature, webhookSecret)) {
    return res.status(401).send('Invalid signature');
  }
  
  // イベント処理
  const event = req.body;
  
  switch (event.type) {
    case 'vey.order.shipped':
      handleOrderShipped(event.data);
      break;
    case 'vey.delivery.delivered':
      handleDeliveryCompleted(event.data);
      break;
  }
  
  res.status(200).send('OK');
});

function verifySignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

---

## 🔐 認証統合 / Authentication Integration

### OAuth 2.0フロー

```javascript
// 1. 認証URLへリダイレクト
const authUrl = `https://auth.vey.com/oauth/authorize?` +
  `client_id=${clientId}&` +
  `redirect_uri=${redirectUri}&` +
  `response_type=code&` +
  `scope=address:read order:write`;

window.location.href = authUrl;

// 2. コールバック処理
app.get('/callback', async (req, res) => {
  const { code } = req.query;
  
  // トークン取得
  const response = await fetch('https://auth.vey.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri
    })
  });
  
  const { access_token } = await response.json();
  
  // APIアクセス
  const veyClient = new VeyClient({ accessToken: access_token });
});
```

---

## 📊 分析統合 / Analytics Integration

### VeyAnalyticsダッシュボード埋め込み

```html
<iframe
  src="https://analytics.vey.com/embed/dashboard?key=your_key"
  width="100%"
  height="600px"
  frameborder="0"
></iframe>
```

```javascript
// カスタム分析データの送信
await veyClient.analytics.track({
  event: 'order_completed',
  properties: {
    order_id: 'order_123',
    total: 2750,
    items_count: 3
  }
});
```

---

## 🧪 テスト環境 / Test Environment

### サンドボックス環境

```javascript
const client = new VeyClient({
  apiKey: 'test_api_key',
  environment: 'sandbox'  // or 'production'
});
```

### テストデータ

```javascript
// テスト用住所
const testAddress = {
  country: 'JP',
  postalCode: '000-0000',  // テスト用郵便番号
  admin1: 'テスト都道府県',
  admin2: 'テスト市区町村',
  addressLine1: 'テスト町1-2-3'
};

// テスト用クレジットカード番号
const testCard = {
  number: '4242424242424242',  // Stripeテストカード
  exp_month: 12,
  exp_year: 2030,
  cvc: '123'
};
```

---

## 📖 API リファレンス / API Reference

詳細なAPI仕様は以下をご覧ください:

- [REST API](../diagrams/technical-integration.md#rest-api仕様)
- [GraphQL API](../diagrams/technical-integration.md#graphql-api仕様)
- [gRPC API](../diagrams/technical-integration.md#grpc-api仕様)

---

## 🆘 サポート / Support

- **ドキュメント**: https://docs.vey.com
- **API リファレンス**: https://api.vey.com/docs
- **サポート**: support@vey.com
- **GitHub**: https://github.com/rei-k/world-address-yaml

---

**最終更新 / Last Updated**: 2025-12-03
