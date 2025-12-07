/**
 * Address Migration Flow (Moving to New Address)
 * 
 * Demonstrates handling address changes while maintaining continuity:
 * - User moves to new address
 * - Old address is revoked
 * - New address is registered
 * - Version proof links old and new PIDs
 * - User maintains access to services
 */

import {
  createDIDDocument,
  createAddressPIDCredential,
  signCredential,
  createRevocationEntry,
  createRevocationList,
  isPIDRevoked,
  getNewPID,
  signRevocationList,
  createZKCircuit,
  generateZKVersionProof,
  verifyZKVersionProof,
} from '@vey/core';

// Configuration
const CONFIG = {
  user: {
    did: 'did:key:user-charlie',
    name: 'Charlie',
    publicKey: 'charlie-public-key',
    privateKey: 'charlie-private-key',
    oldAddress: {
      pid: 'JP-13-113-01',
      country: 'JP',
      province: '13',
      city: 'Bunkyo-ku',
      description: 'Tokyo (Old)',
    },
    newAddress: {
      pid: 'JP-27-101-03',
      country: 'JP',
      province: '27',
      city: 'Kita-ku',
      description: 'Osaka (New)',
    },
  },
  provider: {
    did: 'did:web:vey.example',
    publicKey: 'vey-public-key',
    privateKey: 'vey-private-key',
  },
};

async function main() {
  console.log('🏠 Address Migration Flow (Moving)\n');
  console.log('='.repeat(60));
  
  // ============================================================================
  // Scenario
  // ============================================================================
  console.log('\n📖 Scenario');
  console.log('-'.repeat(60));
  console.log(`👤 ${CONFIG.user.name} is moving:`);
  console.log(`   From: ${CONFIG.user.oldAddress.description}`);
  console.log(`   To: ${CONFIG.user.newAddress.description}`);
  console.log('\n🎯 Goals:');
  console.log('   - Revoke old address');
  console.log('   - Register new address');
  console.log('   - Maintain continuity (same user)');
  console.log('   - Keep using QR/NFC credentials');
  
  // ============================================================================
  // Step 1: User Currently Has Old Address
  // ============================================================================
  console.log('\n📍 Step 1: Current Address (Before Move)');
  console.log('-'.repeat(60));
  
  const didDoc = createDIDDocument(CONFIG.user.did, CONFIG.user.publicKey);
  
  // Old address credential
  const oldCredential = createAddressPIDCredential(
    CONFIG.user.did,
    CONFIG.provider.did,
    CONFIG.user.oldAddress.pid,
    CONFIG.user.oldAddress.country,
    CONFIG.user.oldAddress.province
  );
  
  const signedOldCredential = signCredential(
    oldCredential,
    CONFIG.provider.privateKey,
    `${CONFIG.provider.did}#key-1`
  );
  
  console.log('✅ Current address registered:');
  console.log(`   - PID: ${CONFIG.user.oldAddress.pid}`);
  console.log(`   - Location: ${CONFIG.user.oldAddress.description}`);
  console.log(`   - Status: Active`);
  
  // ============================================================================
  // Step 2: User Moves to New Address
  // ============================================================================
  console.log('\n📦 Step 2: Moving Day');
  console.log('-'.repeat(60));
  
  console.log(`🚚 ${CONFIG.user.name} moves to new address`);
  console.log(`   - New location: ${CONFIG.user.newAddress.description}`);
  console.log(`   - New PID: ${CONFIG.user.newAddress.pid}`);
  
  // ============================================================================
  // Step 3: Verify New Address
  // ============================================================================
  console.log('\n📍 Step 3: Verify New Address');
  console.log('-'.repeat(60));
  
  console.log('⏳ Submitting new address for verification...');
  
  // Provider verifies new address
  const newCredential = createAddressPIDCredential(
    CONFIG.user.did,
    CONFIG.provider.did,
    CONFIG.user.newAddress.pid,
    CONFIG.user.newAddress.country,
    CONFIG.user.newAddress.province
  );
  
  const signedNewCredential = signCredential(
    newCredential,
    CONFIG.provider.privateKey,
    `${CONFIG.provider.did}#key-1`
  );
  
  console.log('✅ New address verified and credential issued');
  console.log(`   - New PID: ${CONFIG.user.newAddress.pid}`);
  console.log(`   - Status: Active`);
  
  // ============================================================================
  // Step 4: Create Revocation Entry for Old Address
  // ============================================================================
  console.log('\n🔒 Step 4: Revoke Old Address');
  console.log('-'.repeat(60));
  
  console.log('⏳ Creating revocation entry...');
  
  // Create revocation entry
  const revocationEntry = createRevocationEntry(
    CONFIG.user.oldAddress.pid,
    'address_change',
    CONFIG.user.newAddress.pid // Link to new PID
  );
  
  console.log('✅ Revocation entry created');
  console.log(`   - Old PID: ${revocationEntry.pid}`);
  console.log(`   - Reason: ${revocationEntry.reason}`);
  console.log(`   - New PID: ${revocationEntry.newPid}`);
  console.log(`   - Revoked at: ${revocationEntry.revokedAt}`);
  
  // ============================================================================
  // Step 5: Update Revocation List
  // ============================================================================
  console.log('\n📋 Step 5: Update Revocation List');
  console.log('-'.repeat(60));
  
  // Create revocation list
  const revocationList = createRevocationList(
    CONFIG.provider.did,
    [revocationEntry]
  );
  
  console.log('✅ Revocation list updated');
  console.log(`   - Issuer: ${revocationList.issuer}`);
  console.log(`   - Version: ${revocationList.version}`);
  console.log(`   - Entries: ${revocationList.entries.length}`);
  
  // Sign revocation list
  const signedRevocationList = signRevocationList(
    revocationList,
    CONFIG.provider.privateKey,
    `${CONFIG.provider.did}#key-1`
  );
  
  console.log('✅ Revocation list signed');
  
  // ============================================================================
  // Step 6: Verify Revocation
  // ============================================================================
  console.log('\n✔️  Step 6: Verify Revocation');
  console.log('-'.repeat(60));
  
  // Check if old PID is revoked
  const isOldRevoked = isPIDRevoked(
    CONFIG.user.oldAddress.pid,
    signedRevocationList
  );
  
  console.log(`Old PID (${CONFIG.user.oldAddress.pid}):`);
  console.log(`   - Revoked: ${isOldRevoked ? '✅ Yes' : '❌ No'}`);
  
  if (isOldRevoked) {
    const newPid = getNewPID(CONFIG.user.oldAddress.pid, signedRevocationList);
    console.log(`   - New PID: ${newPid}`);
  }
  
  // Check if new PID is revoked
  const isNewRevoked = isPIDRevoked(
    CONFIG.user.newAddress.pid,
    signedRevocationList
  );
  
  console.log(`\nNew PID (${CONFIG.user.newAddress.pid}):`);
  console.log(`   - Revoked: ${isNewRevoked ? '❌ Yes' : '✅ No'}`);
  console.log(`   - Status: Active`);
  
  // ============================================================================
  // Step 7: Generate Version Proof
  // ============================================================================
  console.log('\n🔐 Step 7: Generate Version Proof');
  console.log('-'.repeat(60));
  
  console.log('⏳ Generating version proof...');
  console.log('   - Proves old and new PIDs belong to same user');
  console.log('   - Enables service continuity');
  
  // Create circuit
  const circuit = createZKCircuit(
    'version-proof-v1',
    'Version Proof Circuit',
    'Proves ownership continuity across address updates'
  );
  
  // Generate version proof
  const versionProof = generateZKVersionProof(
    CONFIG.user.oldAddress.pid,
    CONFIG.user.newAddress.pid,
    CONFIG.user.did,
    circuit
  );
  
  console.log('✅ Version proof generated');
  console.log(`   - Pattern: ${versionProof.patternType}`);
  console.log(`   - Old PID: ${versionProof.oldPid}`);
  console.log(`   - New PID: ${versionProof.newPid}`);
  console.log(`   - Migration time: ${versionProof.migrationTimestamp}`);
  
  // ============================================================================
  // Step 8: Verify Version Proof
  // ============================================================================
  console.log('\n✔️  Step 8: Verify Version Proof');
  console.log('-'.repeat(60));
  
  console.log('⏳ Verifying version proof...');
  
  // Verify the version proof
  const verificationResult = verifyZKVersionProof(
    versionProof,
    circuit,
    signedRevocationList
  );
  
  if (!verificationResult.valid) {
    console.error('❌ Verification failed!');
    console.error(`   Error: ${verificationResult.error}`);
    return;
  }
  
  console.log('✅ Version proof verified successfully');
  console.log('   - Old PID is revoked (as expected)');
  console.log('   - New PID is valid');
  console.log('   - Same user owns both PIDs');
  console.log('   - Continuity proven');
  
  // ============================================================================
  // Step 9: Service Continuity
  // ============================================================================
  console.log('\n🔄 Step 9: Service Continuity');
  console.log('-'.repeat(60));
  
  console.log('✅ User can now:');
  console.log('   - Continue using services with new PID');
  console.log('   - Update QR/NFC credentials');
  console.log('   - Maintain subscription continuity');
  console.log('   - Access historical data');
  
  console.log('\n📱 QR/NFC Credentials:');
  console.log('   - Old QR code: Shows migration to new PID');
  console.log('   - New QR code: Active with new address');
  console.log('   - Version proof: Links old and new');
  
  // ============================================================================
  // Use Cases
  // ============================================================================
  console.log('\n💡 Use Cases');
  console.log('='.repeat(60));
  
  console.log('\n1️⃣  Subscription Services:');
  console.log('   - Streaming service maintains account');
  console.log('   - Version proof confirms same user');
  console.log('   - No need to re-subscribe');
  
  console.log('\n2️⃣  Delivery Preferences:');
  console.log('   - Saved delivery preferences transfer');
  console.log('   - Delivery history maintained');
  console.log('   - Trusted recipient status preserved');
  
  console.log('\n3️⃣  E-commerce:');
  console.log('   - Shopping cart and wishlist transfer');
  console.log('   - Order history accessible');
  console.log('   - Loyalty points maintained');
  
  console.log('\n4️⃣  Social Connections:');
  console.log('   - Friends can find you at new address');
  console.log('   - Shared lockers update automatically');
  console.log('   - Address book syncs with version proof');
  
  // ============================================================================
  // Summary
  // ============================================================================
  console.log('\n' + '='.repeat(60));
  console.log('📊 Address Migration Summary');
  console.log('='.repeat(60));
  console.log('✅ Old address revoked successfully');
  console.log('✅ New address registered and verified');
  console.log('✅ Version proof generated');
  console.log('✅ Continuity maintained across move');
  console.log('✅ Services can verify same user');
  console.log('✅ QR/NFC credentials updated');
  console.log('\n🎉 Seamless address migration complete!');
  
  // ============================================================================
  // Comparison
  // ============================================================================
  console.log('\n📊 Comparison: ZKP vs Traditional Migration');
  console.log('='.repeat(60));
  
  console.log('\n❌ Traditional Address Update:');
  console.log('   - Update address on every service manually');
  console.log('   - No proof of continuity');
  console.log('   - Risk of losing access');
  console.log('   - No audit trail');
  console.log('   - Subscriptions may be lost');
  
  console.log('\n✅ ZKP Address Migration (This Example):');
  console.log('   - Single update with version proof');
  console.log('   - Cryptographic proof of continuity');
  console.log('   - Services auto-verify same user');
  console.log('   - Complete audit trail');
  console.log('   - No service disruption');
  console.log('   - QR/NFC automatically updated');
  
  console.log('\n🔒 Result: Moving made easy with ZKP!');
}

// Run the example
main().catch(console.error);

export default main;
