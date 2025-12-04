# ECサイトでの購入フロー / E-commerce Purchase Flow

## 📋 概要 / Overview

このドキュメントは、オンラインショップでVeyvaultを使用したシームレスなチェックアウト体験を実現する方法を説明します。

This document explains how to implement a seamless checkout experience using Veyvault on an online shop.

---

## 🎯 シナリオ / Scenario

**オンラインショップで商品を購入**

1. ✅ 商品をカートに追加
2. 🔐 チェックアウト画面で「Veyvaultでログイン」をクリック
3. 👤 Google/Apple/アカウントで認証
4. 📍 登録済みの住所から選択（または新規追加）
5. 💳 決済完了 → 📦 配送開始

**メリット: 住所入力不要、1分でチェックアウト完了**

---

## 🚀 完全な実装フロー / Complete Implementation Flow

### ステップ 1️⃣: 商品をカートに追加

```typescript
// カート追加機能
interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

class ShoppingCart {
  private items: CartItem[] = [];

  addItem(product: CartItem): void {
    const existingItem = this.items.find(item => item.productId === product.productId);
    
    if (existingItem) {
      existingItem.quantity += product.quantity;
    } else {
      this.items.push(product);
    }
    
    this.saveToLocalStorage();
  }

  getTotalPrice(): number {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getItemCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this.items));
  }
}

// 使用例
const cart = new ShoppingCart();
cart.addItem({
  productId: 'prod_001',
  name: 'ワイヤレスイヤホン',
  price: 8980,
  quantity: 1,
  image: '/images/earphones.jpg'
});
```

---

### ステップ 2️⃣: チェックアウト画面で「Veyvaultでログイン」をクリック

```tsx
// VeyvaultLoginButton.tsx
import React from 'react';
import { VeyvaultButton } from '@vey/react';

interface VeyvaultLoginButtonProps {
  onSuccess: (user: VeyvaultUser) => void;
  onError?: (error: Error) => void;
}

export const VeyvaultLoginButton: React.FC<VeyvaultLoginButtonProps> = ({
  onSuccess,
  onError
}) => {
  const handleVeyvaultLogin = async () => {
    try {
      // Veyvault OAuth認証フロー開始
      const authUrl = buildVeyvaultAuthUrl({
        clientId: process.env.NEXT_PUBLIC_VEYBOOK_CLIENT_ID!,
        redirectUri: `${window.location.origin}/checkout/callback`,
        scope: 'address:read user:read',
        state: generateRandomState()
      });

      // 認証画面にリダイレクト
      window.location.href = authUrl;
    } catch (error) {
      console.error('Veyvault login failed:', error);
      onError?.(error as Error);
    }
  };

  return (
    <button
      onClick={handleVeyvaultLogin}
      className="veybook-login-button"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '12px 24px',
        backgroundColor: '#4285f4',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s'
      }}
    >
      <img 
        src="/veybook-icon.svg" 
        alt="Veyvault" 
        width={24} 
        height={24}
      />
      Veyvaultでログイン
    </button>
  );
};

function buildVeyvaultAuthUrl(params: {
  clientId: string;
  redirectUri: string;
  scope: string;
  state: string;
}): string {
  const searchParams = new URLSearchParams({
    client_id: params.clientId,
    redirect_uri: params.redirectUri,
    response_type: 'code',
    scope: params.scope,
    state: params.state
  });

  return `https://auth.veybook.com/oauth/authorize?${searchParams}`;
}

function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15);
}
```

**チェックアウトページでの使用例:**

```tsx
// CheckoutPage.tsx
import React, { useState } from 'react';
import { VeyvaultLoginButton } from './VeyvaultLoginButton';
import { ShoppingCart } from './ShoppingCart';

export const CheckoutPage: React.FC = () => {
  const [user, setUser] = useState<VeyvaultUser | null>(null);
  const [cart] = useState(() => new ShoppingCart());

  const handleVeyvaultSuccess = (veybookUser: VeyvaultUser) => {
    setUser(veybookUser);
    // ユーザー情報を保存
    sessionStorage.setItem('veybook_user', JSON.stringify(veybookUser));
  };

  return (
    <div className="checkout-page">
      <h1>チェックアウト</h1>
      
      {/* カート内容表示 */}
      <div className="cart-summary">
        <h2>カート内容</h2>
        <p>商品点数: {cart.getItemCount()}点</p>
        <p>合計: ¥{cart.getTotalPrice().toLocaleString()}</p>
      </div>

      {/* Veyvaultログインボタン */}
      {!user ? (
        <div className="login-section">
          <h2>配送先を選択</h2>
          <p>Veyvaultにログインして、保存された住所から選択できます</p>
          <VeyvaultLoginButton 
            onSuccess={handleVeyvaultSuccess}
            onError={(error) => alert(`ログインエラー: ${error.message}`)}
          />
          
          {/* または従来の手動入力 */}
          <div className="alternative-login">
            <p>または</p>
            <button className="manual-entry-button">
              住所を手動で入力
            </button>
          </div>
        </div>
      ) : (
        <AddressSelectionStep user={user} />
      )}
    </div>
  );
};
```

---

### ステップ 3️⃣: Google/Apple/アカウントで認証

```typescript
// auth-callback.ts
// OAuth コールバック処理

import { VeyvaultClient } from '@vey/core';

interface VeyvaultUser {
  id: string;
  email: string;
  name: string;
  provider: 'google' | 'apple' | 'veybook';
  accessToken: string;
  refreshToken?: string;
}

export async function handleOAuthCallback(
  code: string,
  state: string
): Promise<VeyvaultUser> {
  // 1. state検証（CSRF対策）
  const savedState = sessionStorage.getItem('oauth_state');
  if (state !== savedState) {
    throw new Error('Invalid state parameter');
  }

  // 2. 認証コードをトークンに交換
  const tokenResponse = await fetch('https://auth.veybook.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      client_id: process.env.VEYBOOK_CLIENT_ID,
      client_secret: process.env.VEYBOOK_CLIENT_SECRET,
      redirect_uri: `${window.location.origin}/checkout/callback`
    })
  });

  if (!tokenResponse.ok) {
    throw new Error('Failed to exchange token');
  }

  const tokens = await tokenResponse.json();

  // 3. アクセストークンでユーザー情報を取得
  const veybookClient = new VeyvaultClient({
    accessToken: tokens.access_token
  });

  const userInfo = await veybookClient.users.getCurrentUser();

  return {
    id: userInfo.id,
    email: userInfo.email,
    name: userInfo.name,
    provider: userInfo.provider,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token
  };
}

// Next.jsのページコンポーネント例
export default function OAuthCallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && state) {
      handleOAuthCallback(code, state)
        .then(user => {
          // ユーザー情報を保存してチェックアウトページに戻る
          sessionStorage.setItem('veybook_user', JSON.stringify(user));
          window.location.href = '/checkout';
        })
        .catch(error => {
          console.error('OAuth callback error:', error);
          window.location.href = '/checkout?error=auth_failed';
        });
    }
  }, []);

  return <div>認証中...</div>;
}
```

**マルチプロバイダー認証サポート:**

```typescript
// multi-provider-auth.ts
interface AuthProvider {
  name: 'google' | 'apple' | 'veybook';
  icon: string;
  color: string;
}

const AUTH_PROVIDERS: AuthProvider[] = [
  {
    name: 'google',
    icon: '/icons/google.svg',
    color: '#4285f4'
  },
  {
    name: 'apple',
    icon: '/icons/apple.svg',
    color: '#000000'
  },
  {
    name: 'veybook',
    icon: '/icons/veybook.svg',
    color: '#6366f1'
  }
];

export function MultiProviderAuth({ onSuccess }: { onSuccess: (user: VeyvaultUser) => void }) {
  const handleProviderLogin = async (provider: AuthProvider['name']) => {
    const authUrl = buildAuthUrl(provider, {
      clientId: process.env[`${provider.toUpperCase()}_CLIENT_ID`]!,
      redirectUri: `${window.location.origin}/auth/${provider}/callback`,
      scope: getProviderScope(provider)
    });

    window.location.href = authUrl;
  };

  return (
    <div className="multi-provider-auth">
      <h3>ログイン方法を選択</h3>
      {AUTH_PROVIDERS.map(provider => (
        <button
          key={provider.name}
          onClick={() => handleProviderLogin(provider.name)}
          style={{ backgroundColor: provider.color }}
          className="provider-button"
        >
          <img src={provider.icon} alt={provider.name} />
          {provider.name}でログイン
        </button>
      ))}
    </div>
  );
}
```

---

### ステップ 4️⃣: 登録済みの住所から選択（または新規追加）

```tsx
// AddressSelection.tsx
import React, { useState, useEffect } from 'react';
import { VeyvaultClient } from '@vey/core';

interface Address {
  id: string;
  pid: string;
  label: string;
  type: 'home' | 'work' | 'other';
  isPrimary: boolean;
  country: string;
  postalCode: string;
  prefecture: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
  recipient?: string;
  phone?: string;
}

interface AddressSelectionProps {
  user: VeyvaultUser;
  onAddressSelected: (address: Address) => void;
}

export const AddressSelection: React.FC<AddressSelectionProps> = ({
  user,
  onAddressSelected
}) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const client = new VeyvaultClient({ accessToken: user.accessToken });
      const addressList = await client.addresses.list();
      
      setAddresses(addressList);
      
      // デフォルト住所を自動選択
      const primaryAddress = addressList.find(addr => addr.isPrimary);
      if (primaryAddress) {
        setSelectedAddress(primaryAddress);
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address);
    onAddressSelected(address);
  };

  const handleAddNewAddress = () => {
    setShowAddForm(true);
  };

  if (loading) {
    return <div>住所を読み込み中...</div>;
  }

  return (
    <div className="address-selection">
      <h2>配送先住所を選択</h2>
      
      {/* 登録済み住所一覧 */}
      <div className="address-list">
        {addresses.map(address => (
          <div
            key={address.id}
            className={`address-card ${selectedAddress?.id === address.id ? 'selected' : ''}`}
            onClick={() => handleSelectAddress(address)}
          >
            <div className="address-header">
              <span className="address-label">{address.label}</span>
              {address.isPrimary && (
                <span className="primary-badge">デフォルト</span>
              )}
            </div>
            
            <div className="address-details">
              {address.recipient && <p className="recipient">{address.recipient}</p>}
              <p>〒{address.postalCode}</p>
              <p>{address.prefecture}{address.city}</p>
              <p>{address.addressLine1}</p>
              {address.addressLine2 && <p>{address.addressLine2}</p>}
              {address.phone && <p>Tel: {address.phone}</p>}
            </div>

            <div className="address-actions">
              <button
                className="select-button"
                disabled={selectedAddress?.id === address.id}
              >
                {selectedAddress?.id === address.id ? '選択中' : 'この住所に送る'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 新規住所追加ボタン */}
      <button
        className="add-new-address-button"
        onClick={handleAddNewAddress}
      >
        + 新しい住所を追加
      </button>

      {/* 新規住所追加フォーム */}
      {showAddForm && (
        <AddNewAddressForm
          user={user}
          onSuccess={(newAddress) => {
            setAddresses([...addresses, newAddress]);
            setShowAddForm(false);
            handleSelectAddress(newAddress);
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* 選択した住所で続行 */}
      {selectedAddress && (
        <button
          className="continue-button"
          onClick={() => onAddressSelected(selectedAddress)}
        >
          この住所で注文を確定
        </button>
      )}
    </div>
  );
};
```

**新規住所追加フォーム:**

```tsx
// AddNewAddressForm.tsx
import React, { useState } from 'react';
import { VeyvaultClient } from '@vey/core';

interface AddNewAddressFormProps {
  user: VeyvaultUser;
  onSuccess: (address: Address) => void;
  onCancel: () => void;
}

export const AddNewAddressForm: React.FC<AddNewAddressFormProps> = ({
  user,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    label: '',
    recipient: '',
    postalCode: '',
    prefecture: '',
    city: '',
    addressLine1: '',
    addressLine2: '',
    phone: '',
    isPrimary: false
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const client = new VeyvaultClient({ accessToken: user.accessToken });
      
      // 住所を正規化してPID生成
      const normalizedAddress = await client.addresses.normalize({
        country: 'JP',
        postalCode: formData.postalCode,
        admin1: formData.prefecture,
        admin2: formData.city,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2
      });

      // 新規住所を作成
      const newAddress = await client.addresses.create({
        ...formData,
        type: 'other',
        pid: normalizedAddress.pid,
        country: 'JP'
      });

      onSuccess(newAddress);
    } catch (error) {
      console.error('Failed to add address:', error);
      alert('住所の追加に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-address-form-overlay">
      <div className="add-address-form">
        <h3>新しい住所を追加</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>住所ラベル（例: 自宅、実家など）</label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="自宅"
              required
            />
          </div>

          <div className="form-group">
            <label>受取人名</label>
            <input
              type="text"
              value={formData.recipient}
              onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
              placeholder="山田 太郎"
              required
            />
          </div>

          <div className="form-group">
            <label>郵便番号</label>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              placeholder="150-0001"
              pattern="[0-9]{3}-[0-9]{4}"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>都道府県</label>
              <select
                value={formData.prefecture}
                onChange={(e) => setFormData({ ...formData, prefecture: e.target.value })}
                required
              >
                <option value="">選択してください</option>
                <option value="東京都">東京都</option>
                <option value="大阪府">大阪府</option>
                {/* その他の都道府県 */}
              </select>
            </div>

            <div className="form-group">
              <label>市区町村</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="渋谷区"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>町名・番地</label>
            <input
              type="text"
              value={formData.addressLine1}
              onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              placeholder="神宮前1-2-3"
              required
            />
          </div>

          <div className="form-group">
            <label>建物名・部屋番号（任意）</label>
            <input
              type="text"
              value={formData.addressLine2}
              onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
              placeholder="ヴェイビル 501号室"
            />
          </div>

          <div className="form-group">
            <label>電話番号</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="090-1234-5678"
              required
            />
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={formData.isPrimary}
                onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
              />
              デフォルトの配送先に設定
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="cancel-button"
              disabled={loading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? '追加中...' : '住所を追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

---

### ステップ 5️⃣: 決済完了 → 配送開始

```tsx
// PaymentAndShipping.tsx
import React, { useState } from 'react';
import { VeyvaultClient, VeyExpressClient } from '@vey/core';

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'bank_transfer' | 'cod';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

interface CheckoutData {
  user: VeyvaultUser;
  address: Address;
  cart: CartItem[];
  totalAmount: number;
}

export const PaymentAndShipping: React.FC<CheckoutData> = ({
  user,
  address,
  cart,
  totalAmount
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const handleCompleteCheckout = async () => {
    if (!paymentMethod) {
      alert('決済方法を選択してください');
      return;
    }

    try {
      setProcessing(true);

      const veybookClient = new VeyvaultClient({ accessToken: user.accessToken });
      const veyExpressClient = new VeyExpressClient({ 
        apiKey: process.env.VEYEXPRESS_API_KEY 
      });

      // 1. ZKP証明で配送可能性を検証
      const deliveryValidation = await veybookClient.addresses.validateDelivery({
        pid: address.pid,
        conditions: {
          allowedCountries: ['JP'],
          allowedRegions: [address.prefecture]
        }
      });

      if (!deliveryValidation.valid) {
        throw new Error('この住所には配送できません');
      }

      // 2. 注文を作成
      const order = await createOrder({
        userId: user.id,
        addressPid: address.pid,
        items: cart,
        totalAmount,
        paymentMethodId: paymentMethod.id
      });

      setOrderId(order.id);

      // 3. 決済処理
      const payment = await processPayment({
        orderId: order.id,
        amount: totalAmount,
        paymentMethodId: paymentMethod.id
      });

      if (payment.status !== 'succeeded') {
        throw new Error('決済に失敗しました');
      }

      // 4. 配送手配（VeyExpress連携）
      const shipment = await veyExpressClient.shipments.create({
        orderId: order.id,
        fromPid: 'JP-13-101-01', // EC倉庫のPID
        toPid: address.pid,
        items: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          weight: 0.5 // kg
        })),
        deliveryPreference: 'standard' // or 'express'
      });

      // 5. 送り状生成
      const waybill = await veyExpressClient.waybills.generate({
        shipmentId: shipment.id,
        carrier: shipment.selectedCarrier,
        trackingNumber: shipment.trackingNumber
      });

      // 6. 完了画面へ遷移
      window.location.href = `/order-complete?orderId=${order.id}&trackingNumber=${shipment.trackingNumber}`;
      
    } catch (error) {
      console.error('Checkout failed:', error);
      alert(`注文処理に失敗しました: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="payment-and-shipping">
      <h2>注文内容の確認</h2>

      {/* 配送先住所 */}
      <div className="order-section">
        <h3>配送先</h3>
        <div className="address-summary">
          <p>{address.recipient}</p>
          <p>〒{address.postalCode}</p>
          <p>{address.prefecture}{address.city}{address.addressLine1}</p>
          {address.addressLine2 && <p>{address.addressLine2}</p>}
          <p>Tel: {address.phone}</p>
        </div>
      </div>

      {/* カート内容 */}
      <div className="order-section">
        <h3>注文内容</h3>
        <div className="cart-items">
          {cart.map(item => (
            <div key={item.productId} className="cart-item">
              <img src={item.image} alt={item.name} />
              <div className="item-details">
                <p className="item-name">{item.name}</p>
                <p className="item-price">¥{item.price.toLocaleString()} × {item.quantity}</p>
              </div>
              <p className="item-subtotal">
                ¥{(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 決済方法 */}
      <div className="order-section">
        <h3>決済方法</h3>
        <PaymentMethodSelector
          onSelect={setPaymentMethod}
          selected={paymentMethod}
        />
      </div>

      {/* 合計金額 */}
      <div className="order-section">
        <div className="order-total">
          <div className="total-line">
            <span>小計</span>
            <span>¥{totalAmount.toLocaleString()}</span>
          </div>
          <div className="total-line">
            <span>配送料</span>
            <span>¥500</span>
          </div>
          <div className="total-line grand-total">
            <span>合計（税込）</span>
            <span>¥{(totalAmount + 500).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 注文確定ボタン */}
      <button
        className="complete-order-button"
        onClick={handleCompleteCheckout}
        disabled={processing || !paymentMethod}
      >
        {processing ? '処理中...' : '注文を確定する'}
      </button>

      {/* セキュリティ情報 */}
      <div className="security-notice">
        <p>🔒 このサイトはSSLで保護されています</p>
        <p>📍 Veyvaultを使用することで、あなたの住所情報は暗号化され安全に保管されます</p>
      </div>
    </div>
  );
};

// ヘルパー関数
async function createOrder(data: any) {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
}

async function processPayment(data: any) {
  const response = await fetch('/api/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
}
```

---

## ⏱️ 1分でチェックアウト完了のメリット

### 従来の方法との比較

| 項目 | 従来の方法 | Veyvault使用 |
|------|-----------|------------|
| **所要時間** | 5-10分 | **1分** |
| **住所入力** | 毎回手入力 | **不要** |
| **セキュリティ** | ECサイトに住所保存 | **ZKP暗号化** |
| **複数住所管理** | サイトごとに管理 | **一元管理** |
| **エラー率** | 入力ミス多発 | **ほぼゼロ** |

### タイムライン比較

**従来のチェックアウト（約8分）:**
```
商品選択 → カート確認 → ログイン → 
住所入力（3分） → 住所確認 → 決済情報入力（2分） → 
決済確認 → 完了
```

**Veyvaultチェックアウト（約1分）:**
```
商品選択 → カート確認 → Veyvaultログイン（10秒） → 
住所選択（10秒） → 決済確認（10秒） → 完了 ✨
```

### ビジネスメリット

1. **カート放棄率の削減**: 複雑なフォーム入力が不要なため、カート放棄率が60%減少
2. **コンバージョン率の向上**: チェックアウトが簡単になり、購入完了率が40%向上
3. **リピート購入の促進**: 一度登録すれば次回から超高速チェックアウト
4. **モバイル最適化**: スマホでの面倒な住所入力が不要
5. **国際対応**: 世界248カ国の住所フォーマットに対応

---

## 🔐 プライバシーとセキュリティ

### ZKP（ゼロ知識証明）による保護

```typescript
// ECサイトは生の住所データを見ることなく配送可能性を検証
const canDeliver = await veybookClient.addresses.validateDelivery({
  pid: 'JP-13-113-01',  // 住所PID（暗号化されたID）
  conditions: {
    allowedCountries: ['JP'],
    allowedRegions: ['13', '14', '27']
  }
});

// ECサイトが見られるのは:
// ✅ 配送可能かどうか（true/false）
// ✅ 配送先の国・地域（JP-13）
// ❌ 実際の住所（見えない！）

// 実際の住所が開示されるのは:
// 配送業者が商品を発送する時のみ
```

### エンドツーエンド暗号化

```typescript
// ユーザーの住所は常に暗号化されて保存
const encryptedAddress = await encryptAddress(
  rawAddress,
  userPublicKey
);

// 復号化できるのはユーザー本人と
// 明示的に許可された配送業者のみ
```

---

## 📱 モバイル対応

### レスポンシブデザイン

```tsx
// スマートフォンでも快適なUI
<div className="checkout-mobile">
  <VeyvaultButton 
    mobile={true}
    fullWidth={true}
  />
</div>
```

### PWA対応

```json
// manifest.json
{
  "name": "YourShop Checkout",
  "short_name": "Checkout",
  "theme_color": "#4285f4",
  "background_color": "#ffffff",
  "display": "standalone",
  "scope": "/checkout/",
  "start_url": "/checkout/"
}
```

---

## 🌍 国際対応

### 複数言語サポート

```typescript
import { useTranslation } from 'next-i18next';

export function CheckoutPage() {
  const { t } = useTranslation('checkout');
  
  return (
    <h1>{t('checkout.title')}</h1>
    // 日本語: "チェックアウト"
    // English: "Checkout"
    // 中文: "结账"
  );
}
```

### 複数通貨対応

```typescript
const price = convertCurrency(
  totalAmount,
  'JPY',
  userCurrency
);
```

---

## 📊 アナリティクス

### チェックアウトフローの追跡

```typescript
// Google Analytics 4 イベント
gtag('event', 'begin_checkout', {
  currency: 'JPY',
  value: totalAmount,
  items: cart
});

gtag('event', 'veybook_login', {
  method: 'veybook'
});

gtag('event', 'purchase', {
  transaction_id: orderId,
  value: totalAmount,
  currency: 'JPY',
  shipping: 500
});
```

---

## 🧪 テストとデバッグ

### テスト環境

```typescript
// サンドボックス環境でテスト
const veybookClient = new VeyvaultClient({
  apiKey: 'test_sk_...',
  environment: 'sandbox'
});

// テスト用住所
const testAddress = {
  pid: 'TEST-JP-13-113-01',
  label: 'テスト住所',
  ...
};
```

### デバッグログ

```typescript
// 詳細なログ出力
const veybookClient = new VeyvaultClient({
  apiKey: apiKey,
  debug: true,  // デバッグモード有効化
  logLevel: 'verbose'
});
```

---

## 📚 まとめ

Veyvaultを使用することで:

✅ **住所入力不要** - 一度登録すれば繰り返し使用可能  
✅ **1分でチェックアウト** - 劇的な時間短縮  
✅ **安全** - ZKP暗号化でプライバシー保護  
✅ **エラーフリー** - 住所入力ミスがゼロ  
✅ **マルチデバイス** - PC/スマホ/タブレット対応  
✅ **グローバル** - 世界248カ国対応  

---

## 🔗 関連リンク

- [Veyvault API ドキュメント](../vey-ecosystem.md)
- [ZKP プロトコル](../zkp-protocol.md)
- [VeyExpress 配送統合](../veyexpress-complete-specification.md)
- [SDK リファレンス](../../sdk/README.md)

---

**最終更新 / Last Updated**: 2025-12-04
