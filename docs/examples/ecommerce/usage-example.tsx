/**
 * Usage Example - VeybookCheckout Integration
 * 
 * This file demonstrates how to integrate the VeybookCheckout component
 * into your e-commerce application.
 */

import React, { useState, useEffect } from 'react';
import { VeybookCheckout } from './VeybookCheckout';

// ============================================================================
// Example 1: Basic Usage
// ============================================================================

export function BasicCheckoutExample() {
  const [cart] = useState([
    {
      productId: 'prod_001',
      name: 'ワイヤレスイヤホン',
      price: 8980,
      quantity: 1,
      image: '/images/earphones.jpg',
      weight: 0.2
    },
    {
      productId: 'prod_002',
      name: 'スマートウォッチ',
      price: 25800,
      quantity: 1,
      image: '/images/smartwatch.jpg',
      weight: 0.15
    }
  ]);

  const handleCheckoutComplete = (orderId: string, trackingNumber: string) => {
    console.log('✅ Order completed!');
    console.log('Order ID:', orderId);
    console.log('Tracking Number:', trackingNumber);
    
    // Redirect to order confirmation page
    window.location.href = `/orders/${orderId}`;
  };

  const handleCheckoutCancel = () => {
    console.log('❌ Checkout cancelled');
    window.location.href = '/cart';
  };

  return (
    <div className="checkout-page">
      <h1>チェックアウト</h1>
      <VeybookCheckout
        cart={cart}
        onComplete={handleCheckoutComplete}
        onCancel={handleCheckoutCancel}
      />
    </div>
  );
}

// ============================================================================
// Example 2: With Cart State Management
// ============================================================================

export function CartStateExample() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart from API on mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cart');
      const data = await response.json();
      setCart(data.items);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>カートを読み込み中...</div>;
  }

  if (cart.length === 0) {
    return (
      <div className="empty-cart">
        <h2>カートが空です</h2>
        <button onClick={() => window.location.href = '/'}>
          ショッピングを続ける
        </button>
      </div>
    );
  }

  return (
    <VeybookCheckout
      cart={cart}
      onComplete={(orderId, trackingNumber) => {
        // Clear cart after successful checkout
        setCart([]);
        localStorage.removeItem('cart');
        window.location.href = `/orders/${orderId}`;
      }}
    />
  );
}

// ============================================================================
// Example 3: With Analytics Tracking
// ============================================================================

export function AnalyticsExample() {
  const [cart] = useState([
    {
      productId: 'prod_001',
      name: 'Product A',
      price: 1000,
      quantity: 2
    }
  ]);

  const trackCheckoutStart = () => {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', 'begin_checkout', {
        currency: 'JPY',
        value: getTotalValue(cart),
        items: cart.map(item => ({
          item_id: item.productId,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      });
    }

    // Custom analytics
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'checkout_started',
        timestamp: new Date().toISOString(),
        cart_value: getTotalValue(cart),
        items_count: cart.length
      })
    });
  };

  const trackCheckoutComplete = (orderId: string) => {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', 'purchase', {
        transaction_id: orderId,
        value: getTotalValue(cart),
        currency: 'JPY',
        items: cart.map(item => ({
          item_id: item.productId,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      });
    }

    // Custom analytics
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'checkout_completed',
        order_id: orderId,
        timestamp: new Date().toISOString(),
        cart_value: getTotalValue(cart)
      })
    });
  };

  useEffect(() => {
    trackCheckoutStart();
  }, []);

  return (
    <VeybookCheckout
      cart={cart}
      onComplete={(orderId, trackingNumber) => {
        trackCheckoutComplete(orderId);
        window.location.href = `/orders/${orderId}`;
      }}
    />
  );
}

// ============================================================================
// Example 4: With Custom Error Handling
// ============================================================================

export function ErrorHandlingExample() {
  const [cart] = useState([
    {
      productId: 'prod_001',
      name: 'Product A',
      price: 1000,
      quantity: 1
    }
  ]);
  const [error, setError] = useState<string | null>(null);

  const handleCheckoutError = (error: Error) => {
    console.error('Checkout error:', error);
    
    // Display user-friendly error message
    if (error.message.includes('delivery')) {
      setError('この地域には配送できません。別の住所を選択してください。');
    } else if (error.message.includes('payment')) {
      setError('決済処理に失敗しました。決済方法を確認してください。');
    } else {
      setError('エラーが発生しました。しばらくしてから再度お試しください。');
    }

    // Log to error tracking service
    if (typeof Sentry !== 'undefined') {
      Sentry.captureException(error);
    }
  };

  return (
    <div>
      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)}>閉じる</button>
        </div>
      )}
      
      <VeybookCheckout
        cart={cart}
        onComplete={(orderId) => {
          window.location.href = `/orders/${orderId}`;
        }}
      />
    </div>
  );
}

// ============================================================================
// Example 5: Next.js Page Integration
// ============================================================================

import { GetServerSideProps } from 'next';

interface CheckoutPageProps {
  cart: any[];
  user: any | null;
}

/**
 * Checkout Page Component
 * 
 * Server-side rendered checkout page that loads cart and user data
 * before rendering the VeybookCheckout component.
 */

export default function CheckoutPage({ cart, user }: CheckoutPageProps) {
  // Redirect to cart if empty
  useEffect(() => {
    if (cart.length === 0) {
      window.location.href = '/cart';
    }
  }, [cart]);

  return (
    <div className="container">
      <VeybookCheckout
        cart={cart}
        onComplete={(orderId, trackingNumber) => {
          // Redirect to order confirmation
          window.location.href = `/orders/${orderId}?tracking=${trackingNumber}`;
        }}
        onCancel={() => {
          window.location.href = '/cart';
        }}
      />
    </div>
  );
}

/**
 * Server-side data fetching for checkout page
 * 
 * Loads cart items and user session before rendering the page.
 * Redirects to cart page if cart is empty.
 * 
 * @param context - Next.js page context with request and response
 * @returns Props containing cart items and user data
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  
  // Get cart from session/cookie
  const cart = await getCartFromSession(req);
  
  // Get user if logged in
  const user = await getUserFromSession(req);

  return {
    props: {
      cart,
      user
    }
  };
};

// ============================================================================
// Example 6: With Discount Codes
// ============================================================================

export function DiscountCodeExample() {
  const [cart] = useState([
    {
      productId: 'prod_001',
      name: 'Product A',
      price: 10000,
      quantity: 1
    }
  ]);
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const applyDiscount = async () => {
    try {
      const response = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode })
      });

      const data = await response.json();
      
      if (data.valid) {
        setDiscount(data.amount);
        alert(`割引コードが適用されました: ¥${data.amount.toLocaleString()}引き`);
      } else {
        alert('無効な割引コードです');
      }
    } catch (error) {
      console.error('Failed to apply discount:', error);
    }
  };

  return (
    <div className="checkout-with-discount">
      <div className="discount-section">
        <input
          type="text"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
          placeholder="割引コードを入力"
        />
        <button onClick={applyDiscount}>適用</button>
      </div>

      {discount > 0 && (
        <div className="discount-applied">
          <p>割引: -¥{discount.toLocaleString()}</p>
        </div>
      )}

      <VeybookCheckout
        cart={cart}
        onComplete={(orderId) => {
          window.location.href = `/orders/${orderId}`;
        }}
      />
    </div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function getTotalValue(cart: any[]): number {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

async function getCartFromSession(req: any): Promise<any[]> {
  // Implementation depends on your session management
  // This is a placeholder
  return [];
}

async function getUserFromSession(req: any): Promise<any | null> {
  // Implementation depends on your authentication system
  // This is a placeholder
  return null;
}

// ============================================================================
// TypeScript Type Exports
// ============================================================================

export type { CartItem, VeybookUser, Address, PaymentMethod } from './VeybookCheckout';
