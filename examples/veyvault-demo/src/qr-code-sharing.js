#!/usr/bin/env node

/**
 * Veyvault Demo - QR Code Address Sharing
 * 
 * Demonstrates QR code generation for address sharing:
 * - Generate QR codes for addresses
 * - Share addresses via QR with privacy controls
 * - Selective disclosure with QR codes
 * - NFC-ready format (same payload can be used for NFC)
 */

import {
  encodePID,
  createZKCircuit,
  generateZKSelectiveRevealProof,
  verifyZKSelectiveRevealProof,
  createDIDDocument,
} from '@vey/core';

/**
 * Generate QR code data for address sharing
 * 
 * In a real implementation, you would use a QR code library like 'qrcode'
 * to generate actual QR codes. This demo shows the data structure.
 */
function generateQRCodeData(options) {
  const {
    pid,
    did,
    revealedFields = [],
    fullAddress = {},
    expiresAt = null,
    purpose = 'address_sharing',
  } = options;

  // Create ZK proof for selective disclosure
  const circuit = createZKCircuit(
    'qr-sharing-v1',
    'QR Address Sharing',
    'Share address via QR code with privacy'
  );

  const proof = generateZKSelectiveRevealProof(
    pid,
    fullAddress,
    revealedFields,
    circuit
  );

  // QR code payload (can also be used for NFC)
  const qrPayload = {
    version: '1.0',
    type: 'vey-address-qr',
    did,
    pid,
    zkProof: proof,
    revealedFields,
    purpose,
    expiresAt: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default: 7 days
    createdAt: new Date().toISOString(),
  };

  return qrPayload;
}

/**
 * Scan and verify QR code data
 */
function scanQRCode(qrPayload) {
  console.log('📱 Scanning QR code...');
  
  // Verify QR code is not expired
  const expiresAt = new Date(qrPayload.expiresAt);
  const now = new Date();
  
  if (now > expiresAt) {
    console.error('❌ QR code expired');
    return { valid: false, error: 'QR code expired' };
  }
  
  // Verify ZK proof
  const circuit = createZKCircuit(
    'qr-sharing-v1',
    'QR Address Sharing',
    'Share address via QR code with privacy'
  );
  
  const verifyResult = verifyZKSelectiveRevealProof(qrPayload.zkProof, circuit);
  
  if (!verifyResult.valid) {
    console.error('❌ Invalid ZK proof');
    return { valid: false, error: 'Invalid ZK proof' };
  }
  
  console.log('✅ QR code verified');
  console.log(`   PID: ${qrPayload.pid}`);
  console.log(`   Purpose: ${qrPayload.purpose}`);
  console.log(`   Expires: ${qrPayload.expiresAt}`);
  
  return {
    valid: true,
    did: qrPayload.did,
    pid: qrPayload.pid,
    revealedData: verifyResult.revealedData,
    revealedFields: qrPayload.revealedFields,
  };
}

/**
 * Display QR code as ASCII art (for demo purposes)
 * In production, use a real QR code library
 */
function displayQRCode(qrPayload) {
  const dataString = JSON.stringify(qrPayload);
  const shortHash = Buffer.from(dataString).toString('base64').substring(0, 20);
  
  console.log('\n┌─────────────────────────┐');
  console.log('│ ▄▄▄▄▄ ▄  ▄ ▄▄▄▄▄       │');
  console.log('│ █   █ ██▄  █   █       │');
  console.log('│ █▄▄▄█ █ █▄ █▄▄▄█       │');
  console.log('│ ▄▄▄▄▄▄▄█▄█▄█ ▄ ▄       │');
  console.log('│ ▄  ▄█▄  ▄▄ █▄▄▄█       │');
  console.log('│ ▄▄▄▄▄ █▄ █ ▄ ▄ ▄       │');
  console.log('│ █   █  █ ██▄▄▄██       │');
  console.log('│ █▄▄▄█ ▄█▄ ▄█ ▄▄▄       │');
  console.log('└─────────────────────────┘');
  console.log(`   QR Code: ${shortHash}...`);
  console.log('\n📱 Scan with Veyvault app');
}

// ============================================================================
// Demo Scenarios
// ============================================================================

async function main() {
  console.log('📱 Veyvault QR Code Demo\n');
  console.log('='.repeat(60));

  // ============================================================================
  // Scenario 1: Share Full Address with Friend
  // ============================================================================
  console.log('\n📋 Scenario 1: Share Full Address with Friend');
  console.log('-'.repeat(60));

  const userDid = 'did:key:alice123';
  const alicePid = 'JP-13-113-01';
  const aliceAddress = {
    country: 'JP',
    province: '13',
    city: 'Shibuya',
    postal_code: '150-0001',
    street_address: 'Dogenzaka 1-2-3',
    building: 'Tech Tower',
    floor: '10',
    room: '1001',
  };

  console.log('\n👤 Alice wants to share her address with Bob');
  console.log('   Alice reveals: city, postal_code, and locker_id');
  console.log('   Alice hides: street_address, building, floor, room');

  const qrData1 = generateQRCodeData({
    pid: alicePid,
    did: userDid,
    revealedFields: ['city', 'postal_code'],
    fullAddress: aliceAddress,
    purpose: 'friend_sharing',
  });

  console.log('\n🔐 Generating QR code with selective disclosure...');
  displayQRCode(qrData1);

  console.log('\n📊 QR Code Contains:');
  console.log(`   - PID: ${qrData1.pid}`);
  console.log(`   - Revealed Fields: ${qrData1.revealedFields.join(', ')}`);
  console.log(`   - Expires: ${qrData1.expiresAt}`);
  console.log(`   - ZK Proof: ${qrData1.zkProof.proofType} proof included`);

  // Bob scans the QR code
  console.log('\n👥 Bob scans the QR code...');
  const scanResult1 = scanQRCode(qrData1);

  if (scanResult1.valid) {
    console.log('\n✅ Bob can now send packages!');
    console.log('   Revealed information:');
    Object.entries(scanResult1.revealedData || {}).forEach(([key, value]) => {
      console.log(`     - ${key}: ${value}`);
    });
    console.log('\n   Hidden information:');
    const hiddenFields = ['street_address', 'building', 'floor', 'room'];
    hiddenFields.forEach(field => {
      console.log(`     - ${field}: [HIDDEN]`);
    });
  }

  // ============================================================================
  // Scenario 2: QR Code for E-commerce Checkout
  // ============================================================================
  console.log('\n📋 Scenario 2: QR Code for E-commerce Checkout');
  console.log('-'.repeat(60));

  console.log('\n🛍️  Alice wants to checkout on an e-commerce site');
  console.log('   Instead of typing her address, she shows a QR code');

  const qrData2 = generateQRCodeData({
    pid: alicePid,
    did: userDid,
    revealedFields: ['country', 'postal_code'], // Minimal for shipping validation
    fullAddress: aliceAddress,
    purpose: 'ecommerce_checkout',
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
  });

  console.log('\n🔐 Generating checkout QR code...');
  displayQRCode(qrData2);

  console.log('\n📊 QR Code Contains:');
  console.log(`   - PID: ${qrData2.pid}`);
  console.log(`   - Revealed: ${qrData2.revealedFields.join(', ')}`);
  console.log(`   - Purpose: ${qrData2.purpose}`);
  console.log(`   - Expires: 15 minutes (short-lived for security)`);

  // Merchant scans the QR code
  console.log('\n🏪 Merchant scans QR code at checkout...');
  const scanResult2 = scanQRCode(qrData2);

  if (scanResult2.valid) {
    console.log('\n✅ Checkout successful!');
    console.log('   Merchant knows:');
    Object.entries(scanResult2.revealedData || {}).forEach(([key, value]) => {
      console.log(`     - ${key}: ${value}`);
    });
    console.log('   Merchant uses PID for delivery:');
    console.log(`     - PID Token: ${scanResult2.pid}`);
    console.log('   Full address disclosed only to carrier at delivery time');
  }

  // ============================================================================
  // Scenario 3: NFC Tag for Locker Pickup
  // ============================================================================
  console.log('\n📋 Scenario 3: NFC Tag for Locker Pickup');
  console.log('-'.repeat(60));

  const lockerAddress = {
    ...aliceAddress,
    locker_id: 'LOCKER-SHIBUYA-A-042',
  };

  console.log('\n📦 Alice ordered a package to a locker');
  console.log('   She uses NFC to authorize locker access');

  const nfcData = generateQRCodeData({
    pid: alicePid,
    did: userDid,
    revealedFields: ['locker_id'], // Only reveal locker ID
    fullAddress: lockerAddress,
    purpose: 'locker_access',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
  });

  console.log('\n🔐 Generating NFC payload (same format as QR)...');
  console.log('\n📱 NFC Tag Data:');
  console.log(`   - PID: ${nfcData.pid}`);
  console.log(`   - Revealed: locker_id only`);
  console.log(`   - Purpose: ${nfcData.purpose}`);
  console.log(`   - Type: ${nfcData.type} (compatible with NFC)`);

  // Locker system scans NFC
  console.log('\n🏢 Locker facility scans NFC tag...');
  const scanResult3 = scanQRCode(nfcData);

  if (scanResult3.valid) {
    console.log('\n✅ Locker access granted!');
    console.log('   Facility verified:');
    Object.entries(scanResult3.revealedData || {}).forEach(([key, value]) => {
      console.log(`     - ${key}: ${value}`);
    });
    console.log('   Alice can collect package anonymously');
  }

  // ============================================================================
  // Scenario 4: Time-Limited QR for Temporary Access
  // ============================================================================
  console.log('\n📋 Scenario 4: Time-Limited QR for Temporary Access');
  console.log('-'.repeat(60));

  console.log('\n⏱️  Alice shares a time-limited QR code with a delivery person');
  console.log('   QR code expires in 1 hour');

  const tempQRData = generateQRCodeData({
    pid: alicePid,
    did: userDid,
    revealedFields: ['building', 'floor'],
    fullAddress: aliceAddress,
    purpose: 'temporary_delivery',
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
  });

  console.log('\n🔐 Generating time-limited QR code...');
  displayQRCode(tempQRData);

  console.log('\n⏰ QR Code Properties:');
  console.log(`   - Expires: ${tempQRData.expiresAt}`);
  console.log(`   - Valid for: 1 hour`);
  console.log(`   - Purpose: ${tempQRData.purpose}`);
  console.log(`   - Auto-revokes after expiration`);

  // Test expiration (simulate expired QR code)
  console.log('\n🕐 Simulating QR code after 1 hour...');
  const expiredQRData = {
    ...tempQRData,
    expiresAt: new Date(Date.now() - 1000).toISOString(), // Already expired
  };

  const expiredScan = scanQRCode(expiredQRData);
  if (!expiredScan.valid) {
    console.log('✅ Expired QR code correctly rejected');
  }

  // ============================================================================
  // Summary
  // ============================================================================
  console.log('\n' + '='.repeat(60));
  console.log('📊 QR Code Demo Summary');
  console.log('='.repeat(60));
  console.log('\n✅ Demonstrated Features:');
  console.log('   1. Selective disclosure with QR codes');
  console.log('   2. E-commerce checkout via QR');
  console.log('   3. NFC-compatible format for locker access');
  console.log('   4. Time-limited QR codes with auto-expiration');
  console.log('\n🔐 Privacy Benefits:');
  console.log('   - Full address never exposed in QR code');
  console.log('   - Zero-Knowledge Proofs ensure validity');
  console.log('   - User controls what information to reveal');
  console.log('   - Time-limited access prevents misuse');
  console.log('\n💡 Use Cases:');
  console.log('   - Friend address sharing');
  console.log('   - E-commerce one-scan checkout');
  console.log('   - Locker pickup authorization');
  console.log('   - Temporary delivery access');
  console.log('\n🚀 Next Steps:');
  console.log('   - Integrate with real QR code library (e.g., qrcode npm package)');
  console.log('   - Add NFC writing capability for physical tags');
  console.log('   - Implement QR code scanner in mobile app');
  console.log('   - Add encryption for sensitive payloads');
  console.log('\n' + '='.repeat(60));
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { generateQRCodeData, scanQRCode, displayQRCode };
