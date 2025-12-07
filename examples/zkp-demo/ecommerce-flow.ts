/**
 * E-commerce Checkout Flow with ZKP
 * 
 * Demonstrates privacy-preserving e-commerce checkout where:
 * - User proves valid shipping address without revealing it
 * - Merchant verifies shipping destination
 * - Order created with PID token (not actual address)
 * - Only carrier sees actual address at delivery time
 */

import {
  createDIDDocument,
  createAddressPIDCredential,
  signCredential,
  createZKCircuit,
  generateZKProof,
  verifyZKProof,
  validateShippingRequest,
  createZKPWaybill,
} from '@vey/core';

// Configuration
const CONFIG = {
  user: {
    did: 'did:key:user-alice',
    publicKey: 'alice-public-key',
    privateKey: 'alice-private-key',
    address: {
      country: 'JP',
      province: '13',
      city: 'Shibuya',
      postal_code: '150-0001',
      street_address: 'Dogenzaka 1-2-3',
      building: 'Tech Tower',
      room: '1001',
    },
    pid: 'JP-13-113-01',
  },
  merchant: {
    did: 'did:web:amazone-shop.example',
    name: 'Amazone Shop',
    shippingRequirements: {
      allowedCountries: ['JP', 'US'],
      allowedRegions: ['13', 'CA'], // Tokyo or California
    },
  },
  provider: {
    did: 'did:web:vey.example',
    publicKey: 'vey-public-key',
    privateKey: 'vey-private-key',
  },
  cart: {
    items: [
      { name: 'Laptop', quantity: 1, price: 79.99 },
      { name: 'Mouse', quantity: 1, price: 20.00 },
    ],
  },
};

async function main() {
  console.log('🛍️  E-commerce Checkout Flow with ZKP\n');
  console.log('='.repeat(60));
  
  // Calculate cart total
  const total = CONFIG.cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  
  // ============================================================================
  // Step 1: User Has Valid Address Credential
  // ============================================================================
  console.log('\n👤 Step 1: User Preparation');
  console.log('-'.repeat(60));
  
  const didDoc = createDIDDocument(CONFIG.user.did, CONFIG.user.publicKey);
  console.log(`✅ User: ${CONFIG.user.did}`);
  
  // User already has address credential from registration
  const credential = createAddressPIDCredential(
    CONFIG.user.did,
    CONFIG.provider.did,
    CONFIG.user.pid,
    CONFIG.user.address.country,
    CONFIG.user.address.province
  );
  
  const signedCredential = signCredential(
    credential,
    CONFIG.provider.privateKey,
    `${CONFIG.provider.did}#key-1`
  );
  
  console.log(`✅ Has valid address credential`);
  console.log(`   - PID: ${CONFIG.user.pid}`);
  
  // ============================================================================
  // Step 2: Shopping Cart
  // ============================================================================
  console.log('\n🛒 Step 2: Shopping Cart');
  console.log('-'.repeat(60));
  
  console.log(`📦 Cart for ${CONFIG.merchant.name}:`);
  CONFIG.cart.items.forEach((item, index) => {
    console.log(`   ${index + 1}. ${item.name} x${item.quantity} - $${item.price}`);
  });
  console.log(`   Total: $${total.toFixed(2)}`);
  
  // ============================================================================
  // Step 3: Checkout - Privacy Mode
  // ============================================================================
  console.log('\n💳 Step 3: Checkout (Privacy Mode)');
  console.log('-'.repeat(60));
  
  console.log('🔐 User selects "Pay with ZK Address"');
  console.log('   - Merchant will NOT see actual address');
  console.log('   - Merchant will only verify valid shipping destination');
  
  // Merchant requirements
  console.log('\n📋 Merchant shipping requirements:');
  console.log(`   - Countries: ${CONFIG.merchant.shippingRequirements.allowedCountries.join(', ')}`);
  console.log(`   - Regions: ${CONFIG.merchant.shippingRequirements.allowedRegions.join(', ')}`);
  
  // Create circuit
  const circuit = createZKCircuit(
    'ecommerce-checkout-v1',
    'E-commerce Checkout Validation',
    'Validates shipping destination for e-commerce checkout'
  );
  
  // ============================================================================
  // Step 4: Generate ZK Proof
  // ============================================================================
  console.log('\n🔒 Step 4: Generating ZK Proof');
  console.log('-'.repeat(60));
  
  console.log('⏳ Proving valid shipping destination...');
  
  const zkProof = generateZKProof(
    CONFIG.user.pid,
    CONFIG.merchant.shippingRequirements,
    circuit,
    {
      country: CONFIG.user.address.country,
      province: CONFIG.user.address.province,
    }
  );
  
  console.log('✅ ZK proof generated');
  console.log(`   - Proof type: ${zkProof.proofType}`);
  console.log(`   - Circuit: ${zkProof.circuitId}`);
  console.log('   - Address NOT revealed to merchant');
  
  // ============================================================================
  // Step 5: Merchant Verification
  // ============================================================================
  console.log('\n✔️  Step 5: Merchant Verification');
  console.log('-'.repeat(60));
  
  // Merchant receives and verifies proof
  const verificationResult = verifyZKProof(zkProof, circuit);
  
  if (!verificationResult.valid) {
    console.error('❌ Proof verification failed!');
    console.error(`   Error: ${verificationResult.error}`);
    return;
  }
  
  console.log('✅ Merchant verified proof successfully');
  console.log('   - Valid shipping destination confirmed');
  console.log('   - Address meets shipping requirements');
  
  // Validate full shipping request
  const shippingRequest = {
    pid: CONFIG.user.pid,
    userSignature: 'user-signature-' + Date.now(),
    conditions: CONFIG.merchant.shippingRequirements,
    requesterId: CONFIG.merchant.did,
    timestamp: new Date().toISOString(),
  };
  
  const validationResponse = validateShippingRequest(
    shippingRequest,
    circuit,
    CONFIG.user.address
  );
  
  if (!validationResponse.valid) {
    console.error('❌ Shipping validation failed!');
    console.error(`   Error: ${validationResponse.error}`);
    return;
  }
  
  console.log('✅ Shipping request validated');
  
  // ============================================================================
  // Step 6: Order Creation
  // ============================================================================
  console.log('\n📦 Step 6: Order Creation');
  console.log('-'.repeat(60));
  
  const orderId = 'ORDER-' + Date.now();
  const waybillId = 'WB-' + Date.now();
  const trackingNumber = 'TN-' + Date.now();
  
  // Create order with PID token (not actual address)
  const order = {
    orderId,
    merchantId: CONFIG.merchant.did,
    userId: CONFIG.user.did,
    items: CONFIG.cart.items,
    total,
    pidToken: validationResponse.pidToken,
    zkProof: validationResponse.zkProof,
    timestamp: new Date().toISOString(),
  };
  
  console.log('✅ Order created successfully');
  console.log(`   - Order ID: ${orderId}`);
  console.log(`   - PID Token: ${order.pidToken}`);
  console.log(`   - Total: $${total.toFixed(2)}`);
  
  // Create waybill
  const waybill = createZKPWaybill(
    waybillId,
    CONFIG.user.pid,
    validationResponse.zkProof!,
    trackingNumber,
    {
      parcelWeight: 3.5,
      parcelSize: '80',
      carrierInfo: {
        id: 'carrier-fast-delivery',
        name: 'Fast Delivery Co.',
      },
    }
  );
  
  console.log('✅ Waybill generated');
  console.log(`   - Waybill ID: ${waybillId}`);
  console.log(`   - Tracking Number: ${trackingNumber}`);
  
  // ============================================================================
  // Step 7: What Each Party Knows
  // ============================================================================
  console.log('\n🔍 Step 7: Privacy Breakdown');
  console.log('-'.repeat(60));
  
  console.log('\n👤 User knows:');
  console.log('   ✅ Full address details');
  console.log('   ✅ PID: ' + CONFIG.user.pid);
  console.log('   ✅ Order details');
  
  console.log('\n🏪 Merchant (' + CONFIG.merchant.name + ') knows:');
  console.log('   ✅ Order ID: ' + orderId);
  console.log('   ✅ PID Token: ' + order.pidToken);
  console.log('   ✅ Valid shipping destination (proof verified)');
  console.log('   ❌ Does NOT know: Actual street address');
  console.log('   ❌ Does NOT know: Building, room number');
  console.log('   ❌ Does NOT know: Exact location');
  
  console.log('\n🚚 Carrier (will know at delivery):');
  console.log('   ⏳ Will resolve PID to full address');
  console.log('   ⏳ Will see: ' + CONFIG.user.address.street_address);
  console.log('   ⏳ Access will be logged for audit');
  
  // ============================================================================
  // Summary
  // ============================================================================
  console.log('\n' + '='.repeat(60));
  console.log('📊 Checkout Summary');
  console.log('='.repeat(60));
  console.log('✅ User completed checkout with privacy');
  console.log('✅ Merchant verified valid shipping destination');
  console.log('✅ Order created without exposing address');
  console.log('✅ Waybill ready for carrier');
  console.log('✅ User controls what information is shared');
  console.log('\n🎉 Privacy-preserving e-commerce complete!');
  
  // ============================================================================
  // Comparison with Traditional Checkout
  // ============================================================================
  console.log('\n📊 Comparison: ZKP vs Traditional Checkout');
  console.log('='.repeat(60));
  
  console.log('\n❌ Traditional Checkout:');
  console.log('   - Merchant sees full address');
  console.log('   - Address stored in merchant database');
  console.log('   - Risk of data breach');
  console.log('   - User has no control after sharing');
  
  console.log('\n✅ ZKP Checkout (This Example):');
  console.log('   - Merchant only sees PID token');
  console.log('   - No actual address in merchant database');
  console.log('   - Minimal data exposure');
  console.log('   - User controls access via ZK proofs');
  console.log('   - Carrier accesses address only when needed');
  console.log('   - All access logged for audit');
  
  console.log('\n🔒 Result: Maximum privacy with full functionality!');
}

// Run the example
main().catch(console.error);

export default main;
