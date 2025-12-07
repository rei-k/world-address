/**
 * Friend Address Sharing with Selective Disclosure
 * 
 * Demonstrates sharing partial address information with friends:
 * - User controls what information to reveal
 * - Friend receives only selected fields
 * - Full address remains private
 * - Perfect for sending gifts or packages
 */

import {
  createZKCircuit,
  generateZKSelectiveRevealProof,
  verifyZKSelectiveRevealProof,
} from '@vey/core';

// Configuration
const CONFIG = {
  user: {
    did: 'did:key:user-alice',
    name: 'Alice',
    pid: 'JP-13-113-01-T07-B12',
    fullAddress: {
      country: 'JP',
      province: '13',
      city: 'Shibuya',
      district: 'Dogenzaka',
      postal_code: '150-0001',
      street_address: 'Dogenzaka 1-2-3',
      building: 'Tech Tower',
      floor: '10',
      room: '1001',
      locker_id: 'LOCKER-A-042',
    },
  },
  friend: {
    did: 'did:key:user-bob',
    name: 'Bob',
  },
};

async function main() {
  console.log('👥 Friend Address Sharing with Selective Disclosure\n');
  console.log('='.repeat(60));
  
  // ============================================================================
  // Scenario
  // ============================================================================
  console.log('\n📖 Scenario');
  console.log('-'.repeat(60));
  console.log(`👤 ${CONFIG.user.name} wants to share address with friend ${CONFIG.friend.name}`);
  console.log('🎁 Bob wants to send a birthday gift');
  console.log('🔐 Alice uses selective disclosure to maintain privacy');
  console.log('   - Reveals: City and locker ID');
  console.log('   - Hides: Street address, building, room number');
  
  // ============================================================================
  // Step 1: Alice's Full Address
  // ============================================================================
  console.log('\n📍 Step 1: Alice\'s Full Address (Private)');
  console.log('-'.repeat(60));
  
  console.log('Full address (only Alice knows):');
  console.log(`   Country: ${CONFIG.user.fullAddress.country}`);
  console.log(`   Province: ${CONFIG.user.fullAddress.province}`);
  console.log(`   City: ${CONFIG.user.fullAddress.city}`);
  console.log(`   District: ${CONFIG.user.fullAddress.district}`);
  console.log(`   Postal Code: ${CONFIG.user.fullAddress.postal_code}`);
  console.log(`   Street: ${CONFIG.user.fullAddress.street_address}`);
  console.log(`   Building: ${CONFIG.user.fullAddress.building}`);
  console.log(`   Floor: ${CONFIG.user.fullAddress.floor}`);
  console.log(`   Room: ${CONFIG.user.fullAddress.room}`);
  console.log(`   Locker: ${CONFIG.user.fullAddress.locker_id}`);
  
  // ============================================================================
  // Step 2: Create Selective Disclosure Proof
  // ============================================================================
  console.log('\n🔐 Step 2: Create Selective Disclosure');
  console.log('-'.repeat(60));
  
  // Create circuit
  const circuit = createZKCircuit(
    'selective-reveal-v1',
    'Selective Disclosure Circuit',
    'Reveals only selected address fields'
  );
  
  // Alice chooses what to reveal to Bob
  const fieldsToReveal = ['city', 'locker_id'];
  
  console.log('Alice chooses to reveal:');
  fieldsToReveal.forEach((field, index) => {
    console.log(`   ${index + 1}. ${field}`);
  });
  
  console.log('\n⏳ Generating selective disclosure proof...');
  
  // Generate proof
  const proof = generateZKSelectiveRevealProof(
    CONFIG.user.pid,
    CONFIG.user.fullAddress,
    fieldsToReveal,
    circuit
  );
  
  console.log('✅ Proof generated');
  console.log(`   - Pattern: ${proof.patternType}`);
  console.log(`   - Fields revealed: ${proof.revealedFields.join(', ')}`);
  console.log(`   - Disclosure nonce: ${proof.disclosureNonce.substring(0, 16)}...`);
  
  // ============================================================================
  // Step 3: Alice Shares with Bob
  // ============================================================================
  console.log('\n📤 Step 3: Share with Friend');
  console.log('-'.repeat(60));
  
  console.log(`👤 Alice sends proof to ${CONFIG.friend.name}`);
  console.log('   - Via secure message');
  console.log('   - Or QR code / NFC');
  console.log('   - Or Vey app');
  
  // ============================================================================
  // Step 4: Bob Verifies and Sees Revealed Data
  // ============================================================================
  console.log('\n✔️  Step 4: Bob Receives and Verifies');
  console.log('-'.repeat(60));
  
  console.log(`👤 ${CONFIG.friend.name} receives proof`);
  console.log('⏳ Verifying proof...');
  
  // Bob verifies the proof
  const verificationResult = verifyZKSelectiveRevealProof(proof, circuit);
  
  if (!verificationResult.valid) {
    console.error('❌ Verification failed!');
    console.error(`   Error: ${verificationResult.error}`);
    return;
  }
  
  console.log('✅ Proof verified successfully');
  console.log('\n📋 Bob can see:');
  Object.entries(verificationResult.revealedData).forEach(([field, value]) => {
    console.log(`   ✅ ${field}: ${value}`);
  });
  
  console.log('\n🔒 Bob CANNOT see:');
  const hiddenFields = Object.keys(CONFIG.user.fullAddress).filter(
    field => !fieldsToReveal.includes(field)
  );
  hiddenFields.forEach(field => {
    console.log(`   ❌ ${field}: [Hidden]`);
  });
  
  // ============================================================================
  // Step 5: Bob Sends Package to Locker
  // ============================================================================
  console.log('\n📦 Step 5: Send Package to Locker');
  console.log('-'.repeat(60));
  
  console.log(`🎁 ${CONFIG.friend.name} prepares birthday gift`);
  console.log('📮 Sends to:');
  console.log(`   City: ${verificationResult.revealedData.city}`);
  console.log(`   Locker: ${verificationResult.revealedData.locker_id}`);
  console.log('\n✅ Package sent successfully');
  console.log(`   - Bob used locker for delivery`);
  console.log(`   - Bob still doesn't know exact address`);
  console.log(`   - Alice's privacy maintained`);
  
  // ============================================================================
  // Different Sharing Scenarios
  // ============================================================================
  console.log('\n💡 Different Sharing Scenarios');
  console.log('='.repeat(60));
  
  // Scenario 1: Share with E-commerce (minimal info)
  console.log('\n1️⃣  Share with E-commerce (Shipping Estimate):');
  const ecommerceFields = ['country', 'postal_code'];
  const ecommerceProof = generateZKSelectiveRevealProof(
    CONFIG.user.pid,
    CONFIG.user.fullAddress,
    ecommerceFields,
    circuit
  );
  const ecommerceResult = verifyZKSelectiveRevealProof(ecommerceProof, circuit);
  console.log('   Revealed:');
  Object.entries(ecommerceResult.revealedData).forEach(([field, value]) => {
    console.log(`      - ${field}: ${value}`);
  });
  console.log('   Purpose: Calculate shipping cost');
  
  // Scenario 2: Share with Close Friend (more details)
  console.log('\n2️⃣  Share with Close Friend (More Details):');
  const closeFriendFields = ['city', 'district', 'locker_id'];
  const closeFriendProof = generateZKSelectiveRevealProof(
    CONFIG.user.pid,
    CONFIG.user.fullAddress,
    closeFriendFields,
    circuit
  );
  const closeFriendResult = verifyZKSelectiveRevealProof(closeFriendProof, circuit);
  console.log('   Revealed:');
  Object.entries(closeFriendResult.revealedData).forEach(([field, value]) => {
    console.log(`      - ${field}: ${value}`);
  });
  console.log('   Purpose: Send gifts to locker');
  
  // Scenario 3: Share with Delivery Analytics (aggregate data)
  console.log('\n3️⃣  Share for Analytics (Aggregate):');
  const analyticsFields = ['country', 'province', 'city'];
  const analyticsProof = generateZKSelectiveRevealProof(
    CONFIG.user.pid,
    CONFIG.user.fullAddress,
    analyticsFields,
    circuit
  );
  const analyticsResult = verifyZKSelectiveRevealProof(analyticsProof, circuit);
  console.log('   Revealed:');
  Object.entries(analyticsResult.revealedData).forEach(([field, value]) => {
    console.log(`      - ${field}: ${value}`);
  });
  console.log('   Purpose: Regional delivery statistics');
  
  // ============================================================================
  // Summary
  // ============================================================================
  console.log('\n' + '='.repeat(60));
  console.log('📊 Selective Disclosure Summary');
  console.log('='.repeat(60));
  console.log('✅ User controls what information to reveal');
  console.log('✅ Different levels of disclosure for different purposes');
  console.log('✅ Privacy maintained while enabling functionality');
  console.log('✅ Friends can send packages without full address');
  console.log('✅ ZK proof ensures data integrity');
  console.log('\n🎉 Privacy-preserving friend sharing complete!');
  
  // ============================================================================
  // Comparison
  // ============================================================================
  console.log('\n📊 Comparison: Selective vs Full Disclosure');
  console.log('='.repeat(60));
  
  console.log('\n❌ Traditional Address Sharing:');
  console.log('   - Share full address or nothing');
  console.log('   - No granular control');
  console.log('   - Once shared, cannot control usage');
  console.log('   - Privacy concerns');
  
  console.log('\n✅ Selective Disclosure (This Example):');
  console.log('   - Choose exactly what to reveal');
  console.log('   - Different disclosure levels for different people');
  console.log('   - Cryptographic proof of data integrity');
  console.log('   - Maximum privacy with full functionality');
  console.log('   - Can use locker for anonymous pickup');
  
  console.log('\n🔒 Result: You control your data!');
}

// Run the example
main().catch(console.error);

export default main;
