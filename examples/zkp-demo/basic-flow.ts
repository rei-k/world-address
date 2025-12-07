/**
 * Basic ZKP Address Protocol Flow
 * 
 * This example demonstrates the complete basic flow:
 * 1. User registration with DID
 * 2. Address credential issuance
 * 3. ZK proof generation for shipping
 * 4. Waybill creation
 * 5. Delivery tracking
 */

import {
  // Flow 1: Registration
  createDIDDocument,
  createAddressPIDCredential,
  signCredential,
  verifyCredential,
  // Flow 2: Shipping
  createZKCircuit,
  generateZKProof,
  verifyZKProof,
  validateShippingRequest,
  createZKPWaybill,
  // Flow 3: Delivery
  validateAccessPolicy,
  resolvePID,
  createAuditLogEntry,
  createTrackingEvent,
} from '@vey/core';

async function main() {
  console.log('🚀 Basic ZKP Address Protocol Flow\n');
  console.log('='.repeat(50));
  
  // ============================================================================
  // Step 1: User Registration
  // ============================================================================
  console.log('\n📝 Step 1: User Registration');
  console.log('-'.repeat(50));
  
  const userDid = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
  const userPublicKey = 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
  const userPrivateKey = 'mock-private-key-user';
  
  // Create DID Document
  const didDoc = createDIDDocument(userDid, userPublicKey);
  console.log('✅ DID Document created');
  console.log(`   - DID: ${didDoc.id}`);
  console.log(`   - Created: ${didDoc.created}`);
  
  // ============================================================================
  // Step 2: Address Verification & Credential Issuance
  // ============================================================================
  console.log('\n📍 Step 2: Address Verification');
  console.log('-'.repeat(50));
  
  const providerDid = 'did:web:vey.example';
  const providerPrivateKey = 'mock-private-key-provider';
  const providerPublicKey = 'mock-public-key-provider';
  
  // User's address data (submitted for verification)
  const addressData = {
    country: 'JP',
    province: '13',
    city: 'Shibuya',
    postal_code: '150-0001',
    street_address: 'Dogenzaka 1-2-3',
  };
  
  // Provider verifies and issues PID credential
  const pid = 'JP-13-113-01';
  const credential = createAddressPIDCredential(
    userDid,
    providerDid,
    pid,
    'JP',
    '13',
    new Date('2025-12-31').toISOString()
  );
  
  console.log('✅ Address verified and PID assigned');
  console.log(`   - PID: ${pid}`);
  console.log(`   - Country: ${addressData.country}`);
  console.log(`   - City: ${addressData.city}`);
  
  // Provider signs the credential
  const signedCredential = signCredential(
    credential,
    providerPrivateKey,
    `${providerDid}#key-1`
  );
  
  console.log('✅ Credential signed by provider');
  
  // User verifies the credential
  const isValid = verifyCredential(signedCredential, providerPublicKey);
  console.log(`✅ Credential verified: ${isValid}`);
  
  // ============================================================================
  // Step 3: E-commerce Checkout (Shipping Request)
  // ============================================================================
  console.log('\n🛍️  Step 3: E-commerce Checkout');
  console.log('-'.repeat(50));
  
  const merchantDid = 'did:web:ec-site.example';
  
  // Merchant defines shipping conditions
  const shippingConditions = {
    allowedCountries: ['JP'],
    allowedRegions: ['13'], // Tokyo only
  };
  
  console.log('📦 Merchant requirements:');
  console.log(`   - Countries: ${shippingConditions.allowedCountries.join(', ')}`);
  console.log(`   - Regions: ${shippingConditions.allowedRegions.join(', ')}`);
  
  // Create ZK circuit for shipping validation
  const circuit = createZKCircuit(
    'shipping-validation-v1',
    'Shipping Validation Circuit',
    'Validates shipping destination without revealing full address'
  );
  
  console.log('\n🔐 Generating ZK proof...');
  
  // User generates ZK proof
  const zkProof = generateZKProof(
    pid,
    shippingConditions,
    circuit,
    addressData
  );
  
  console.log('✅ ZK proof generated');
  console.log(`   - Circuit: ${zkProof.circuitId}`);
  console.log(`   - Proof type: ${zkProof.proofType}`);
  
  // Merchant verifies the proof
  const proofResult = verifyZKProof(zkProof, circuit);
  console.log(`✅ Merchant verified proof: ${proofResult.valid}`);
  
  // Validate shipping request
  const shippingRequest = {
    pid,
    userSignature: 'mock-user-signature',
    conditions: shippingConditions,
    requesterId: merchantDid,
    timestamp: new Date().toISOString(),
  };
  
  const validationResponse = validateShippingRequest(
    shippingRequest,
    circuit,
    addressData
  );
  
  console.log(`✅ Shipping request validated: ${validationResponse.valid}`);
  
  if (!validationResponse.valid) {
    console.error('❌ Validation failed:', validationResponse.error);
    return;
  }
  
  // ============================================================================
  // Step 4: Waybill Creation
  // ============================================================================
  console.log('\n📋 Step 4: Waybill Creation');
  console.log('-'.repeat(50));
  
  const waybillId = 'WB-' + Date.now();
  const trackingNumber = 'TN-' + Date.now();
  
  const waybill = createZKPWaybill(
    waybillId,
    pid,
    validationResponse.zkProof!,
    trackingNumber,
    {
      parcelWeight: 2.5,
      parcelSize: '60',
      carrierInfo: {
        id: 'carrier-001',
        name: 'Fast Delivery Co.',
      },
    }
  );
  
  console.log('✅ Waybill created');
  console.log(`   - Waybill ID: ${waybill.waybill_id}`);
  console.log(`   - Tracking #: ${waybill.trackingNumber}`);
  console.log(`   - Weight: ${waybill.parcel_weight}kg`);
  console.log(`   - Size: ${waybill.parcel_size}cm`);
  
  // ============================================================================
  // Step 5: Delivery (Carrier Access)
  // ============================================================================
  console.log('\n🚚 Step 5: Delivery Execution');
  console.log('-'.repeat(50));
  
  const carrierDid = 'did:web:carrier.example';
  
  // Define access policy
  const accessPolicy = {
    id: 'policy-tokyo-delivery',
    principal: carrierDid,
    resource: 'JP-13-*', // Tokyo addresses
    action: 'resolve',
  };
  
  // Validate carrier has permission
  const hasAccess = validateAccessPolicy(
    accessPolicy,
    carrierDid,
    'resolve'
  );
  
  console.log(`✅ Carrier access validated: ${hasAccess}`);
  
  if (hasAccess) {
    // Carrier resolves PID to actual address
    const resolutionRequest = {
      pid,
      requesterId: carrierDid,
      accessToken: 'mock-access-token',
      reason: 'delivery',
      timestamp: new Date().toISOString(),
    };
    
    const resolution = resolvePID(
      resolutionRequest,
      accessPolicy,
      addressData
    );
    
    if (resolution.success) {
      console.log('✅ Address resolved for delivery');
      console.log(`   - Country: ${resolution.address!.country}`);
      console.log(`   - City: ${resolution.address!.city}`);
      console.log(`   - Postal Code: ${resolution.address!.postal_code}`);
      
      // Create audit log
      const auditLog = createAuditLogEntry(
        pid,
        carrierDid,
        'resolve',
        'success',
        { reason: 'delivery', trackingNumber }
      );
      
      console.log('✅ Access logged for audit');
      console.log(`   - Log ID: ${auditLog.id}`);
      console.log(`   - Timestamp: ${auditLog.timestamp}`);
    }
  }
  
  // ============================================================================
  // Step 6: Delivery Tracking
  // ============================================================================
  console.log('\n📦 Step 6: Delivery Tracking');
  console.log('-'.repeat(50));
  
  // Create tracking events
  const events = [
    createTrackingEvent(
      trackingNumber,
      'picked_up',
      'Package picked up from sender',
      { country: 'JP', city: 'Shibuya' }
    ),
    createTrackingEvent(
      trackingNumber,
      'in_transit',
      'Package in transit',
      { country: 'JP' }
    ),
    createTrackingEvent(
      trackingNumber,
      'out_for_delivery',
      'Out for delivery',
      { country: 'JP', city: 'Shibuya' }
    ),
    createTrackingEvent(
      trackingNumber,
      'delivered',
      'Package delivered successfully',
      { country: 'JP', city: 'Shibuya' }
    ),
  ];
  
  events.forEach((event, index) => {
    console.log(`${index + 1}. [${event.type}] ${event.description}`);
  });
  
  console.log('\n✅ Delivery completed successfully!');
  
  // ============================================================================
  // Summary
  // ============================================================================
  console.log('\n' + '='.repeat(50));
  console.log('📊 Flow Summary');
  console.log('='.repeat(50));
  console.log('✅ User registered with DID');
  console.log('✅ Address verified and credential issued');
  console.log('✅ ZK proof generated for shipping');
  console.log('✅ Merchant validated without seeing address');
  console.log('✅ Waybill created with ZKP');
  console.log('✅ Carrier accessed address with audit log');
  console.log('✅ Package delivered and tracked');
  console.log('\n🎉 Complete privacy-preserving delivery!');
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

export default main;
