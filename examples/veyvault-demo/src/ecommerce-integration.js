#!/usr/bin/env node

/**
 * Veyvault Demo - E-commerce Integration
 * 
 * Demonstrates:
 * - One-click checkout with Veyvault
 * - Address selection without re-entering
 * - Privacy-preserving payment flow
 * - Multiple saved addresses
 */

import {
  encodePID,
  createZKCircuit,
  generateZKProof,
  verifyZKProof,
  validateShippingRequest,
  createZKPWaybill,
} from '@vey/core';

// Simulated Veyvault user
const user = {
  did: 'did:key:alice',
  name: 'Alice',
  savedAddresses: [
    {
      id: 'addr_1',
      label: 'Home',
      isPrimary: true,
      country: 'JP',
      admin1: '13',
      admin2: '113',
      province: '東京都',
      city: '渋谷区',
      postal_code: '150-0001',
      street_address: '神宮前1-1-1',
    },
    {
      id: 'addr_2',
      label: 'Office',
      isPrimary: false,
      country: 'JP',
      admin1: '13',
      admin2: '101',
      province: '東京都',
      city: '千代田区',
      postal_code: '100-0001',
      street_address: '千代田1-1',
    },
    {
      id: 'addr_3',
      label: "Mom's House",
      isPrimary: false,
      country: 'JP',
      admin1: '27',
      admin2: '102',
      province: '大阪府',
      city: '大阪市北区',
      postal_code: '530-0001',
      street_address: '梅田1-1-1',
    },
  ],
};

// E-commerce site
const ecommerceSite = {
  did: 'did:web:amazone-shop.example',
  name: 'Amazone Shop',
  shippingRequirements: {
    allowedCountries: ['JP', 'US'],
    allowedRegions: ['13', '27', 'CA'], // Tokyo, Osaka, California
  },
};

// Shopping cart
class ShoppingCart {
  constructor() {
    this.items = [];
  }

  addItem(product, quantity = 1) {
    const existingItem = this.items.find(item => item.product.id === product.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({ product, quantity });
    }
  }

  getTotal() {
    return this.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  }

  display() {
    console.log('\n🛒 Shopping Cart');
    console.log('═'.repeat(60));
    
    if (this.items.length === 0) {
      console.log('Cart is empty');
      return;
    }

    this.items.forEach((item, index) => {
      console.log(`${index + 1}. ${item.product.name}`);
      console.log(`   Price: $${item.product.price.toFixed(2)} × ${item.quantity}`);
      console.log(`   Subtotal: $${(item.product.price * item.quantity).toFixed(2)}`);
    });

    console.log('─'.repeat(60));
    console.log(`Total: $${this.getTotal().toFixed(2)}`);
    console.log('═'.repeat(60));
  }
}

// Address selector UI (simulated)
class AddressSelector {
  static selectAddress(addresses) {
    console.log('\n📍 Select Shipping Address');
    console.log('═'.repeat(60));

    addresses.forEach((addr, index) => {
      const primary = addr.isPrimary ? ' ⭐ PRIMARY' : '';
      console.log(`${index + 1}. ${addr.label}${primary}`);
      console.log(`   ${addr.city}, ${addr.province}`);
      console.log(`   ${addr.postal_code}`);
      console.log();
    });

    // In real app, user would click/select
    // For demo, we'll use the primary address
    const selected = addresses.find(addr => addr.isPrimary) || addresses[0];
    console.log(`✅ Selected: ${selected.label}`);
    console.log('═'.repeat(60));

    return selected;
  }
}

// Checkout flow
class VeyvaultCheckout {
  constructor(merchantDid, shippingRequirements) {
    this.merchantDid = merchantDid;
    this.shippingRequirements = shippingRequirements;
    this.circuit = createZKCircuit(
      'veyvault-checkout-v1',
      'Veyvault Checkout',
      'Privacy-preserving e-commerce checkout'
    );
  }

  /**
   * Process one-click checkout
   */
  async processCheckout(user, selectedAddress, cart) {
    console.log('\n💳 Processing Veyvault Checkout');
    console.log('═'.repeat(60));

    // Step 1: Generate PID
    const pid = encodePID({
      country: selectedAddress.country,
      admin1: selectedAddress.admin1,
      admin2: selectedAddress.admin2,
    });

    console.log('\nStep 1: Generate Address PID');
    console.log(`   PID: ${pid}`);

    // Step 2: Generate ZK proof
    console.log('\nStep 2: Generate Privacy Proof');
    const proof = generateZKProof(
      pid,
      this.shippingRequirements,
      this.circuit,
      {
        country: selectedAddress.country,
        admin1: selectedAddress.admin1,
      }
    );
    console.log('   ✅ Proof generated');
    console.log(`   Type: ${proof.proofType}`);

    // Step 3: Merchant verifies proof
    console.log('\nStep 3: Merchant Verification');
    const verification = verifyZKProof(proof, this.circuit);
    
    if (!verification.valid) {
      console.log('   ❌ Verification failed');
      return { success: false, error: verification.error };
    }

    console.log('   ✅ Valid shipping destination confirmed');

    // Step 4: Validate shipping request
    console.log('\nStep 4: Validate Shipping Request');
    const shippingRequest = {
      pid,
      userSignature: `sig-${Date.now()}`,
      conditions: this.shippingRequirements,
      requesterId: this.merchantDid,
      timestamp: new Date().toISOString(),
    };

    const validation = validateShippingRequest(
      shippingRequest,
      this.circuit,
      selectedAddress
    );

    if (!validation.valid) {
      console.log('   ❌ Validation failed');
      return { success: false, error: validation.error };
    }

    console.log('   ✅ Shipping request validated');

    // Step 5: Create order
    console.log('\nStep 5: Create Order');
    const orderId = `ORDER-${Date.now()}`;
    const trackingNumber = `TN-${Date.now()}`;

    const order = {
      orderId,
      merchantId: this.merchantDid,
      userId: user.did,
      items: cart.items,
      total: cart.getTotal(),
      pidToken: validation.pidToken,
      zkProof: validation.zkProof,
      createdAt: new Date().toISOString(),
    };

    console.log(`   ✅ Order created: ${orderId}`);
    console.log(`   Total: $${order.total.toFixed(2)}`);

    // Step 6: Create waybill
    console.log('\nStep 6: Generate Waybill');
    const waybillId = `WB-${Date.now()}`;
    const waybill = createZKPWaybill(
      waybillId,
      pid,
      validation.zkProof,
      trackingNumber,
      {
        parcelWeight: 2.5,
        parcelSize: '60',
        carrierInfo: {
          id: 'carrier-fast',
          name: 'Fast Delivery Co.',
        },
      }
    );

    console.log(`   ✅ Waybill: ${waybillId}`);
    console.log(`   Tracking: ${trackingNumber}`);

    console.log('\n═'.repeat(60));

    return {
      success: true,
      order,
      waybill,
      trackingNumber,
    };
  }

  /**
   * Display what each party knows
   */
  displayPrivacyBreakdown(user, merchant, selectedAddress, order) {
    console.log('\n🔍 Privacy Breakdown');
    console.log('═'.repeat(60));

    console.log(`\n👤 ${user.name} knows:`);
    console.log('   ✅ Full address details');
    console.log(`   ✅ Order ID: ${order.orderId}`);
    console.log('   ✅ Shopping cart contents');

    console.log(`\n🏪 ${merchant} knows:`);
    console.log(`   ✅ Order ID: ${order.orderId}`);
    console.log(`   ✅ PID Token: ${order.pidToken}`);
    console.log('   ✅ Valid shipping destination (proof verified)');
    console.log('   ❌ Does NOT know: Street address');
    console.log('   ❌ Does NOT know: Building/room numbers');

    console.log('\n🚚 Carrier (will know at delivery):');
    console.log('   ⏳ Will resolve PID to full address');
    console.log(`   ⏳ Will see: ${selectedAddress.street_address}`);
    console.log('   ⏳ Access will be logged');

    console.log('\n═'.repeat(60));
  }
}

// ============================================================================
// Demo Script
// ============================================================================

console.log('🛍️  Veyvault Demo - E-commerce Integration\n');
console.log('='.repeat(60));

// Create shopping cart
const cart = new ShoppingCart();

console.log('\n📦 Adding items to cart...\n');

const products = [
  { id: 'prod_1', name: 'Laptop', price: 999.99 },
  { id: 'prod_2', name: 'Wireless Mouse', price: 29.99 },
  { id: 'prod_3', name: 'USB-C Cable', price: 19.99 },
];

products.forEach(product => {
  cart.addItem(product);
  console.log(`✅ Added: ${product.name} - $${product.price.toFixed(2)}`);
});

// Display cart
cart.display();

// Select shipping address
console.log(`\n\n👤 User: ${user.name}`);
console.log(`   Saved addresses: ${user.savedAddresses.length}`);

const selectedAddress = AddressSelector.selectAddress(user.savedAddresses);

// Process checkout
const checkout = new VeyvaultCheckout(
  ecommerceSite.did,
  ecommerceSite.shippingRequirements
);

console.log(`\n\n🏪 Merchant: ${ecommerceSite.name}`);
console.log('   Shipping requirements:');
console.log(`     Countries: ${ecommerceSite.shippingRequirements.allowedCountries.join(', ')}`);
console.log(`     Regions: ${ecommerceSite.shippingRequirements.allowedRegions.join(', ')}`);

// Execute checkout
const result = await checkout.processCheckout(user, selectedAddress, cart);

if (result.success) {
  console.log('\n\n✅ Checkout Completed Successfully!');
  console.log('═'.repeat(60));
  console.log(`Order ID: ${result.order.orderId}`);
  console.log(`Tracking Number: ${result.trackingNumber}`);
  console.log(`Total: $${result.order.total.toFixed(2)}`);
  console.log('═'.repeat(60));

  // Show privacy breakdown
  checkout.displayPrivacyBreakdown(
    user,
    ecommerceSite.name,
    selectedAddress,
    result.order
  );

  // Summary
  console.log('\n\n📊 Checkout Summary');
  console.log('═'.repeat(60));
  console.log('✅ Items ordered: ' + cart.items.length);
  console.log('✅ Payment processed (simulated)');
  console.log('✅ Shipping validated with ZKP');
  console.log('✅ Privacy maintained');
  console.log('✅ Waybill generated for carrier');
  console.log('\n💡 Benefits:');
  console.log('   • No need to re-enter address');
  console.log('   • One-click checkout experience');
  console.log('   • Privacy-preserving delivery');
  console.log('   • Merchant never sees full address');
  console.log('   • Carrier gets address only at delivery');
  console.log('\n🎉 Veyvault makes e-commerce checkout fast and private!');
} else {
  console.log('\n\n❌ Checkout Failed');
  console.log('Error:', result.error);
}

console.log('\n' + '='.repeat(60) + '\n');
