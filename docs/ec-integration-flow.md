# ECサイト統合フロー / E-Commerce Integration Flow

## 概要 / Overview

世界中の住所フォームとチェックアウトを成立させるための完全な統合フローを説明します。

このフローでは以下の5つのステップで住所と決済を処理します：

1. **住所入力またはQR照合**
2. **ソーシャルログイン**
3. **住所・決済登録**
4. **権限付与**
5. **配送準備**

## 完全フロー図 / Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    ECサイト チェックアウトフロー                    │
└─────────────────────────────────────────────────────────────────┘

1️⃣ 住所入力 or QR照合
   ┌─────────────┐        ┌─────────────┐
   │ 手動入力    │   OR   │ QRスキャン   │
   │ フォーム    │        │ (既存住所)   │
   └──────┬──────┘        └──────┬──────┘
          │                      │
          └──────────┬───────────┘
                     ▼
            ┌─────────────────┐
            │ Address         │
            │ Normalization   │──── PID生成
            │ API             │
            └────────┬────────┘
                     │
                     ▼
              [ PID: JP-13-113-01 ]

2️⃣ ソーシャルログイン
                     │
                     ▼
          ┌──────────────────┐
          │ Google認証       │
          │ or オリジナルID   │
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │ DID生成          │
          │ (did:key:user123)│
          └────────┬─────────┘
                   │
                   ▼

3️⃣ 住所・決済登録画面
          ┌────────────────────────┐
          │ 登録済住所一覧          │
          │ - Default住所表示      │
          │ - 新規住所追加         │
          │ - 決済方法登録         │
          └──────────┬─────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
   ┌─────────────┐      ┌─────────────┐
   │ GAP/PID     │      │ Payment     │
   │ Verify API  │      │ Token API   │
   └──────┬──────┘      └──────┬──────┘
          │                     │
          └──────────┬──────────┘
                     │
                     ▼

4️⃣ 権限付与
          ┌──────────────────┐
          │ 住所＋決済の      │
          │ 権限リンク付与    │
          └────────┬─────────┘
                   │
                   ▼
          [ 買い物可能状態 ]

5️⃣ 配送準備
                   │
                   ▼
          ┌──────────────────┐
          │ Waybill API      │
          │ 送り状生成       │
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │ 物流業者への     │
          │ PID変換済住所    │
          │ フル公開提出     │
          │ (ラストワンマイル)│
          └──────────────────┘
```

## ステップ詳細 / Step Details

### ステップ1: 住所入力またはQR照合

ユーザーが住所を入力するか、既存の住所をQRコードで照合します。

#### パターンA: 手動入力

**フロントエンド (React)**:
```tsx
import { useState } from 'react';
import { VeyProvider, AddressForm } from '@vey/react';

function CheckoutPage() {
  const [normalizedAddress, setNormalizedAddress] = useState(null);
  
  return (
    <VeyProvider config={{ apiKey: process.env.NEXT_PUBLIC_VEY_API_KEY }}>
      <h2>配送先住所を入力してください</h2>
      <AddressForm
        countryCode="JP"
        onSubmit={async (address, validation) => {
          if (validation.valid) {
            setNormalizedAddress(address);
            // 次のステップへ
            proceedToLogin(address);
          }
        }}
      />
    </VeyProvider>
  );
}
```

**バックエンド (Node.js / Next.js API Route)**:
```typescript
// pages/api/address/normalize.ts
import { VeyClient } from '@vey/nodejs';

const vey = new VeyClient({
  apiKey: process.env.VEY_API_KEY,
  environment: 'production'
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { address } = req.body;
    
    try {
      const normalized = await vey.address.normalize({
        raw_address: address
      });
      
      res.status(200).json(normalized);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

**レスポンス**:
```json
{
  "pid": "JP-13-113-01-T07-B12-BN02-R101",
  "normalized_address": {
    "country": "JP",
    "admin1": "13",
    "admin1_name": "東京都",
    "admin2": "113",
    "admin2_name": "渋谷区",
    "locality": "01",
    "locality_name": "神宮前",
    "postal_code": "150-0001",
    "full_address": "東京都渋谷区神宮前1-1-1 ビル名 101号室"
  },
  "validation": {
    "valid": true,
    "confidence": 0.95
  }
}
```

#### パターンB: QRコード照合

**フロントエンド (React)**:
```tsx
import { QRScanner } from '@vey/qr-nfc';

function QRAddressScanner() {
  const handleQRScan = async (qrData) => {
    // QRデータをバックエンドで検証
    const response = await fetch('/api/address/verify-qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qr_data: qrData })
    });
    
    const verified = await response.json();
    
    if (verified.verified) {
      // 既存住所として使用
      setAddress(verified.address);
      proceedToLogin(verified.address);
    }
  };
  
  return (
    <QRScanner
      onScan={handleQRScan}
      onError={(error) => console.error(error)}
    />
  );
}
```

**バックエンド (Node.js)**:
```typescript
// pages/api/address/verify-qr.ts
export default async function handler(req, res) {
  const { qr_data } = req.body;
  
  try {
    // QRデータからPIDと証明を抽出
    const decoded = decodeQRData(qr_data);
    
    // GAP/PID Verify APIで検証
    const verified = await vey.address.verify({
      pid: decoded.pid,
      verification_type: 'qr_code',
      proof: {
        qr_data: qr_data,
        signature: decoded.signature,
        timestamp: decoded.timestamp
      }
    });
    
    if (verified.verified) {
      res.status(200).json({
        verified: true,
        pid: decoded.pid,
        address: verified.address_preview // 住所プレビュー（詳細は非公開）
      });
    } else {
      res.status(400).json({ verified: false, error: 'Invalid QR code' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### ステップ2: ソーシャルログイン

住所が確定したら、ソーシャルログインまたはオリジナルID認証に進みます。

#### Google認証

**フロントエンド**:
```tsx
import { signIn, useSession } from 'next-auth/react';

function LoginStep({ address }) {
  const { data: session } = useSession();
  
  const handleGoogleLogin = async () => {
    await signIn('google', {
      callbackUrl: `/checkout/address-list?pid=${address.pid}`
    });
  };
  
  return (
    <div>
      <h2>ログインしてください</h2>
      <button onClick={handleGoogleLogin}>
        Googleでログイン
      </button>
    </div>
  );
}
```

**バックエンド (Next.js API with NextAuth)**:
```typescript
// pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { generateDID } from '@vey/core';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // ユーザーにDID生成
      const userDID = generateDID(user.email);
      
      // データベースに保存
      await db.user.upsert({
        where: { email: user.email },
        update: { did: userDID },
        create: {
          email: user.email,
          name: user.name,
          did: userDID
        }
      });
      
      return true;
    },
    async session({ session, token }) {
      // セッションにDIDを含める
      const user = await db.user.findUnique({
        where: { email: session.user.email }
      });
      
      session.user.did = user.did;
      return session;
    }
  }
});
```

### ステップ3: 住所・決済登録画面

ログイン後、ユーザーは登録済住所一覧画面に遷移します。

**フロントエンド**:
```tsx
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

function AddressListPage() {
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  
  useEffect(() => {
    // 登録済住所を取得
    fetchAddresses();
    fetchPaymentMethods();
  }, [session]);
  
  const fetchAddresses = async () => {
    const response = await fetch('/api/user/addresses', {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    const data = await response.json();
    setAddresses(data.addresses);
    setDefaultAddress(data.default_address);
  };
  
  const handleAddNewAddress = async (newAddress) => {
    // 新規住所を正規化して登録
    const normalized = await fetch('/api/address/normalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: newAddress })
    }).then(r => r.json());
    
    // ユーザーの住所リストに追加
    await fetch('/api/user/addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify({
        pid: normalized.pid,
        normalized_address: normalized.normalized_address,
        is_default: false
      })
    });
    
    fetchAddresses();
  };
  
  const handleAddPaymentMethod = async (paymentData) => {
    // Payment Token APIで決済トークン作成
    const token = await fetch('/api/payment/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify({
        user_did: session.user.did,
        payment_method: paymentData
      })
    }).then(r => r.json());
    
    fetchPaymentMethods();
  };
  
  return (
    <div>
      <h2>登録済住所一覧</h2>
      
      <section>
        <h3>デフォルト住所</h3>
        {defaultAddress && (
          <AddressCard address={defaultAddress} isDefault />
        )}
      </section>
      
      <section>
        <h3>その他の住所</h3>
        {addresses.map(addr => (
          <AddressCard key={addr.pid} address={addr} />
        ))}
        <button onClick={() => setShowAddressForm(true)}>
          新規住所を追加
        </button>
      </section>
      
      <section>
        <h3>決済方法</h3>
        {paymentMethods.map(pm => (
          <PaymentMethodCard key={pm.id} method={pm} />
        ))}
        <button onClick={() => setShowPaymentForm(true)}>
          決済方法を追加
        </button>
      </section>
    </div>
  );
}
```

**バックエンド (住所登録)**:
```typescript
// pages/api/user/addresses.ts
export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  if (req.method === 'GET') {
    // 登録済住所を取得
    const addresses = await db.address.findMany({
      where: { user_did: session.user.did }
    });
    
    const defaultAddress = addresses.find(a => a.is_default);
    
    res.status(200).json({
      addresses: addresses.filter(a => !a.is_default),
      default_address: defaultAddress
    });
  } else if (req.method === 'POST') {
    // 新規住所を登録
    const { pid, normalized_address, is_default } = req.body;
    
    // GAP/PID Verify APIで住所を検証
    const verified = await vey.address.verify({
      pid: pid,
      verification_type: 'did',
      proof: {
        user_did: session.user.did,
        timestamp: new Date().toISOString()
      }
    });
    
    if (!verified.verified) {
      return res.status(400).json({ error: 'Invalid address' });
    }
    
    // データベースに保存
    const address = await db.address.create({
      data: {
        user_did: session.user.did,
        pid: pid,
        normalized_address: normalized_address,
        is_default: is_default,
        verified_at: new Date()
      }
    });
    
    res.status(201).json(address);
  }
}
```

**バックエンド (決済トークン作成)**:
```typescript
// pages/api/payment/token.ts
export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  if (req.method === 'POST') {
    const { user_did, payment_method } = req.body;
    
    try {
      // Payment Token APIで決済トークン作成
      const token = await vey.payment.createToken({
        user_did: user_did,
        payment_method: payment_method,
        wallet_integration: {
          google_wallet: true,
          apple_wallet: false
        }
      });
      
      // データベースに保存
      await db.paymentToken.create({
        data: {
          user_did: user_did,
          token_id: token.payment_token_id,
          provider: payment_method.provider,
          last4: payment_method.last4,
          brand: payment_method.brand,
          exp_month: payment_method.exp_month,
          exp_year: payment_method.exp_year,
          wallet_passes: token.wallet_passes
        }
      });
      
      res.status(201).json(token);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

### ステップ4: 権限付与

認証完了と同時に、住所＋決済の権限リンクが付与されます。

**バックエンド**:
```typescript
// pages/api/auth/grant-permissions.ts
export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { address_pid, payment_token_id } = req.body;
  
  // 権限リンクを作成
  const permission = await db.permission.create({
    data: {
      user_did: session.user.did,
      address_pid: address_pid,
      payment_token_id: payment_token_id,
      granted_at: new Date(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30日間有効
    }
  });
  
  res.status(201).json({
    permission_id: permission.id,
    status: 'granted',
    can_checkout: true
  });
}
```

### ステップ5: 配送準備

送り状を生成し、物流業者にPID変換済の住所を提出します。

**フロントエンド (チェックアウト完了)**:
```tsx
function CheckoutComplete({ cart, selectedAddress, paymentMethod }) {
  const handleCheckout = async () => {
    // 送り状生成
    const response = await fetch('/api/checkout/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender_pid: 'JP-13-113-01-T07-B12-BN02-R101', // 店舗住所
        recipient_pid: selectedAddress.pid,
        parcel: {
          weight: cart.totalWeight,
          dimensions: cart.dimensions,
          value: cart.totalValue,
          currency: 'JPY'
        },
        payment_token_id: paymentMethod.token_id
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // 注文完了画面へ
      router.push(`/order/${result.order_id}`);
    }
  };
  
  return (
    <button onClick={handleCheckout}>
      注文を確定する
    </button>
  );
}
```

**バックエンド**:
```typescript
// pages/api/checkout/complete.ts
export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { sender_pid, recipient_pid, parcel, payment_token_id } = req.body;
  
  try {
    // 1. 送り状生成
    const waybill = await vey.waybill.create({
      sender_pid: sender_pid,
      recipient_pid: recipient_pid,
      parcel: parcel,
      carrier: 'yamato',
      service_type: 'standard'
    });
    
    // 2. 決済処理
    const payment = await processPayment(payment_token_id, parcel.value);
    
    // 3. 注文を作成
    const order = await db.order.create({
      data: {
        user_did: session.user.did,
        waybill_id: waybill.waybill_id,
        tracking_number: waybill.tracking_number,
        sender_pid: sender_pid,
        recipient_pid: recipient_pid,
        payment_token_id: payment_token_id,
        payment_status: payment.status,
        total_amount: parcel.value,
        status: 'processing'
      }
    });
    
    // 4. Webhookを登録（配送追跡）
    await vey.webhook.register({
      url: `${process.env.APP_URL}/api/webhook/delivery`,
      events: ['delivery.status_changed', 'delivery.delivered'],
      metadata: {
        order_id: order.id
      }
    });
    
    res.status(200).json({
      success: true,
      order_id: order.id,
      tracking_number: waybill.tracking_number,
      estimated_delivery: waybill.carrier_info.estimated_delivery
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

**物流業者への住所開示（ラストワンマイル）**:

物流業者のシステムでは、配送時にのみフル住所が開示されます：

```typescript
// 物流業者側のシステム
async function getDeliveryAddress(waybill_id: string, carrier_api_key: string) {
  // キャリアAPIキーで認証
  const response = await fetch(`https://api.vey.example/v1/waybill/${waybill_id}/address`, {
    headers: {
      'Authorization': `Carrier ${carrier_api_key}`,
      'X-Carrier-ID': 'yamato'
    }
  });
  
  const data = await response.json();
  
  return {
    pid: data.pid,
    full_address: data.full_address, // ラストワンマイルでのみ開示
    recipient_name: data.recipient_name,
    phone_number: data.phone_number
  };
}
```

## Webhook処理 / Webhook Handling

配送ステータスの変更を受け取り、ユーザーに通知します。

**バックエンド**:
```typescript
// pages/api/webhook/delivery.ts
import { createWebhookHandler } from '@vey/webhooks';

const handler = createWebhookHandler({
  secret: process.env.VEY_WEBHOOK_SECRET,
});

handler.onDeliveryStatus(async (event, data, payload) => {
  const { waybill_id, tracking_number, status, location } = data;
  
  // 注文を更新
  const order = await db.order.findFirst({
    where: { waybill_id: waybill_id }
  });
  
  if (order) {
    await db.order.update({
      where: { id: order.id },
      data: {
        delivery_status: status,
        delivery_location: location.facility,
        updated_at: new Date()
      }
    });
    
    // ユーザーに通知
    await sendNotification(order.user_did, {
      title: '配送ステータス更新',
      body: `ご注文の商品は現在「${status}」です。`,
      tracking_number: tracking_number
    });
  }
});

export default handler.expressMiddleware();
```

## セキュリティ考慮事項 / Security Considerations

### 1. PID化による生住所の保護

ECサイトは生住所を保存せず、PIDのみを保存します。

```typescript
// ❌ 悪い例：生住所を保存
await db.order.create({
  data: {
    recipient_address: '東京都渋谷区神宮前1-1-1' // 生住所
  }
});

// ✅ 良い例：PIDのみを保存
await db.order.create({
  data: {
    recipient_pid: 'JP-13-113-01-T07-B12-BN02-R101' // PID
  }
});
```

### 2. 権限の時限管理

権限リンクに有効期限を設定します。

```typescript
const permission = await db.permission.create({
  data: {
    user_did: session.user.did,
    address_pid: address_pid,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30日間
  }
});
```

### 3. DIDベース認証

すべてのAPI呼び出しにDIDベース認証を使用します。

```typescript
const headers = {
  'Authorization': `DID ${userDid}`,
  'X-DID-Signature': signature,
  'X-DID-Challenge': challenge,
};
```

## まとめ / Summary

この統合フローにより：

✅ **住所が最初の画面で入力またはQRで照合される**

✅ **その状態でソーシャルログインへ進む**

✅ **認証トリガーで登録済住所一覧画面に遷移し、住所・決済を登録できる**

✅ **認証完了と同時に住所＋決済の権限リンクが付与され、買い物できる**

✅ **物流業者にはPID変換済の住所が最終的にフル公開提出される（ラストワンマイル）**

世界中のECサイトで統一的なチェックアウト体験を提供できます。
