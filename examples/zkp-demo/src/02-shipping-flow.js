/**
 * ZKP Demo - Flow 2: Shipping Request & Waybill Generation
 * 
 * This demo shows how an e-commerce site can verify delivery capability
 * using Zero-Knowledge Proofs without seeing the actual address.
 */

import {
  createZKCircuit,
  generateZKProof,
  verifyZKProof,
  validateShippingRequest,
  createZKPWaybill,
} from '@vey/core';

console.log('🚚 ZKP Demo - Flow 2: Shipping Request & Waybill Generation\n');
console.log('='.repeat(60));

// Mock data (from Flow 1)
const userDID = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
const userPrivateKey = 'mock-private-key';
const pid = 'JP-13-113-01';

// Simulated credential
const addressVC = {
  issuer: 'did:web:vey.example',
  credentialSubject: {
    id: userDID,
    addressPID: pid,
    countryCode: 'JP',
    admin1Code: '13',
  },
  expirationDate: new Date('2025-12-31').toISOString(),
};

// Step 1: User adds items to cart and proceeds to checkout
console.log('\n🛒 Step 1: User proceeds to checkout...');
console.log('   Cart: 3 items, Total: ¥15,000');
console.log('   Selected shipping: Standard (3-5 days)');

// Step 2: Create ZK circuit for membership proof
console.log('\n🔐 Step 2: Creating ZK Circuit for membership proof...');
const circuit = createZKCircuit({
  type: 'membership',
  statement: 'Address is valid for delivery to Japan',
  publicInputs: ['countryCode', 'admin1Code'],
  privateInputs: ['fullPID', 'admin2Code', 'admin3Code'],
});

console.log('✅ ZK Circuit created:');
console.log('   Type:', circuit.type);
console.log('   Statement:', circuit.statement);
console.log('   Public Inputs:', circuit.publicInputs.join(', '));
console.log('   Private Inputs:', circuit.privateInputs.join(', '));

// Step 3: Generate Zero-Knowledge Proof
console.log('\n🔏 Step 3: Generating Zero-Knowledge Proof...');
const zkProof = generateZKProof(circuit, addressVC, userPrivateKey);

console.log('✅ ZK Proof generated:');
console.log('   Proof ID:', zkProof.id);
console.log('   Circuit Type:', zkProof.circuitType);
console.log('   Public Inputs:', JSON.stringify(zkProof.publicInputs, null, 2));
console.log('   Proof Size:', zkProof.proofData.length, 'characters');
console.log('   Generated:', zkProof.timestamp);

// What the merchant sees vs. what's hidden
console.log('\n👀 What the merchant can see:');
console.log('   ✅ Country: JP (Japan)');
console.log('   ✅ Admin1: 13 (Tokyo)');
console.log('\n🔒 What remains hidden:');
console.log('   🔐 Full PID: JP-13-113-01');
console.log('   🔐 City: Chiyoda-ku');
console.log('   🔐 Street: Chiyoda 1-1');

// Step 4: Submit shipping request to merchant
console.log('\n📤 Step 4: Submitting shipping request to merchant...');
const shippingRequest = {
  orderId: 'ORDER-12345',
  zkProof: zkProof,
  pidToken: 'encrypted-pid-token-abc123', // Encrypted PID for carrier
  publicData: {
    countryCode: 'JP',
    admin1Code: '13',
  },
  shippingMethod: 'standard',
};

console.log('   Order ID:', shippingRequest.orderId);
console.log('   ZK Proof included: ✅');
console.log('   PID Token (encrypted): ✅');

// Step 5: Merchant validates shipping request
console.log('\n✔️  Step 5: Merchant validates shipping request...');
const validation = validateShippingRequest(shippingRequest);

if (validation.valid) {
  console.log('✅ Shipping request is VALID!');
  console.log('   ✓ ZK Proof verified');
  console.log('   ✓ Address can receive deliveries in JP-13');
  console.log('   ✓ No specific address seen by merchant');
} else {
  console.log('❌ Shipping request is INVALID');
  console.log('   Errors:', validation.errors);
}

// Step 6: Create ZKP-enabled waybill
console.log('\n📋 Step 6: Creating ZKP-enabled waybill...');
const waybill = createZKPWaybill({
  orderId: 'ORDER-12345',
  pidToken: shippingRequest.pidToken,
  zkProof: zkProof,
  carrierAccessPolicy: {
    canRevealPID: true,
    accessLevel: 'full',
    allowedCarriers: ['yamato', 'sagawa', 'japan-post'],
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  metadata: {
    weight: 2.5,
    dimensions: { length: 30, width: 20, height: 15 },
    value: 15000,
    currency: 'JPY',
  },
});

console.log('✅ ZKP Waybill created:');
console.log('   Waybill ID:', waybill.id);
console.log('   Order ID:', waybill.orderId);
console.log('   Carrier Access: Limited to JP carriers');
console.log('   Access Level:', waybill.carrierAccessPolicy.accessLevel);
console.log('   Expires:', new Date(waybill.carrierAccessPolicy.expiresAt).toLocaleDateString());
console.log('   ZK Proof ID:', waybill.zkProofId);

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Summary:');
console.log('   ✅ ZK Circuit created');
console.log('   ✅ Zero-Knowledge Proof generated');
console.log('   ✅ Shipping request validated');
console.log('   ✅ ZKP Waybill created');
console.log('\n💡 Key Points:');
console.log('   • Merchant verified delivery capability');
console.log('   • Merchant NEVER saw full address');
console.log('   • Only country + prefecture revealed');
console.log('   • Carrier will access full address when needed');
console.log('='.repeat(60));

// Export for use in next demo
export { waybill, zkProof, shippingRequest };
