/**
 * Locker Pickup Flow with ZKP
 * 
 * Demonstrates anonymous locker pickup where:
 * - User proves they have a locker at facility
 * - Facility verifies proof without knowing which locker
 * - Privacy-preserving package collection
 * - PUDO (Pick Up Drop Off) use case
 */

import {
  createZKCircuit,
  generateZKLockerProof,
  verifyZKLockerProof,
  createTrackingEvent,
} from '@vey/core';

// Configuration
const CONFIG = {
  user: {
    did: 'did:key:user-bob',
    lockerId: 'LOCKER-A-042',
    pid: 'JP-13-113-01-T07-B12',
  },
  facility: {
    id: 'FACILITY-SHIBUYA-STATION',
    name: 'Shibuya Station Locker Facility',
    zone: 'KANTO-TOKYO-SHIBUYA',
    availableLockers: [
      'LOCKER-A-001',
      'LOCKER-A-015',
      'LOCKER-A-042', // User's locker
      'LOCKER-A-099',
      'LOCKER-B-007',
      'LOCKER-B-015',
      'LOCKER-C-023',
    ],
  },
  package: {
    trackingNumber: 'TN-LOCKER-' + Date.now(),
    sender: 'Amazon Shop',
    weight: 1.5,
  },
};

async function main() {
  console.log('📫 Locker Pickup Flow with ZKP\n');
  console.log('='.repeat(60));
  
  // ============================================================================
  // Step 1: Package Arrives at Facility
  // ============================================================================
  console.log('\n📦 Step 1: Package Arrival');
  console.log('-'.repeat(60));
  
  console.log(`🏢 Facility: ${CONFIG.facility.name}`);
  console.log(`📍 Location: ${CONFIG.facility.zone}`);
  console.log(`📮 Total lockers: ${CONFIG.facility.availableLockers.length}`);
  
  // Package tracking event
  const arrivalEvent = createTrackingEvent(
    CONFIG.package.trackingNumber,
    'arrived_at_facility',
    `Package arrived at ${CONFIG.facility.name}`,
    {
      facilityId: CONFIG.facility.id,
      zone: CONFIG.facility.zone,
    }
  );
  
  console.log(`\n✅ Package arrived`);
  console.log(`   - Tracking: ${CONFIG.package.trackingNumber}`);
  console.log(`   - Sender: ${CONFIG.package.sender}`);
  console.log(`   - Weight: ${CONFIG.package.weight}kg`);
  console.log(`   - Time: ${arrivalEvent.timestamp}`);
  
  // ============================================================================
  // Step 2: User Receives Notification
  // ============================================================================
  console.log('\n📱 Step 2: User Notification');
  console.log('-'.repeat(60));
  
  console.log('✅ User receives notification:');
  console.log('   "Your package is ready for pickup"');
  console.log(`   Facility: ${CONFIG.facility.name}`);
  console.log('   Use your ZK proof to access locker');
  
  // ============================================================================
  // Step 3: Generate Locker ZK Proof
  // ============================================================================
  console.log('\n🔐 Step 3: Generate Locker Proof');
  console.log('-'.repeat(60));
  
  // Create circuit for locker access
  const circuit = createZKCircuit(
    'locker-access-v1',
    'Locker Access Validation',
    'Validates locker access without revealing which locker'
  );
  
  console.log('⏳ Generating ZK locker proof...');
  console.log('   - Proving access to facility');
  console.log('   - Hiding which specific locker');
  
  // User generates proof
  const lockerProof = generateZKLockerProof(
    CONFIG.user.lockerId,
    CONFIG.facility.id,
    CONFIG.facility.availableLockers,
    circuit,
    CONFIG.facility.zone
  );
  
  console.log('\n✅ ZK locker proof generated');
  console.log(`   - Facility ID: ${lockerProof.facilityId}`);
  console.log(`   - Zone: ${lockerProof.zone}`);
  console.log(`   - Locker ID: Hidden (anonymous)`);
  console.log(`   - Merkle Root: ${lockerProof.lockerSetRoot.substring(0, 16)}...`);
  
  // ============================================================================
  // Step 4: User Approaches Facility
  // ============================================================================
  console.log('\n🚶 Step 4: Facility Access');
  console.log('-'.repeat(60));
  
  console.log('👤 User arrives at facility');
  console.log('📱 User scans QR code / taps NFC');
  console.log('🔐 Sends ZK proof to facility system');
  
  // ============================================================================
  // Step 5: Facility Verifies Proof
  // ============================================================================
  console.log('\n✔️  Step 5: Facility Verification');
  console.log('-'.repeat(60));
  
  console.log('⏳ Facility verifying proof...');
  
  // Facility verifies the proof
  const verificationResult = verifyZKLockerProof(
    lockerProof,
    circuit,
    CONFIG.facility.id
  );
  
  if (!verificationResult.valid) {
    console.error('❌ Verification failed!');
    console.error(`   Error: ${verificationResult.error}`);
    console.error('   Access denied');
    return;
  }
  
  console.log('✅ Proof verified successfully');
  console.log('   - User has valid locker at this facility');
  console.log('   - Specific locker ID still hidden');
  console.log('   - Access granted');
  
  // ============================================================================
  // Step 6: Access Locker
  // ============================================================================
  console.log('\n🔓 Step 6: Locker Access');
  console.log('-'.repeat(60));
  
  console.log('🚪 Facility system unlocks locker');
  console.log(`   - Locker ${CONFIG.user.lockerId} opened`);
  console.log('   - User retrieves package');
  console.log('   - Locker relocked automatically');
  
  // Tracking event
  const pickupEvent = createTrackingEvent(
    CONFIG.package.trackingNumber,
    'picked_up',
    'Package picked up from locker',
    {
      facilityId: CONFIG.facility.id,
      zone: CONFIG.facility.zone,
    }
  );
  
  console.log(`\n✅ Package picked up at ${pickupEvent.timestamp}`);
  
  // ============================================================================
  // Step 7: Privacy Analysis
  // ============================================================================
  console.log('\n🔍 Step 7: Privacy Analysis');
  console.log('-'.repeat(60));
  
  console.log('\n👤 User knows:');
  console.log(`   ✅ Their locker: ${CONFIG.user.lockerId}`);
  console.log(`   ✅ Facility location: ${CONFIG.facility.name}`);
  console.log(`   ✅ Package details`);
  
  console.log('\n🏢 Facility system knows:');
  console.log('   ✅ Valid locker access (proof verified)');
  console.log(`   ✅ Zone: ${CONFIG.facility.zone}`);
  console.log(`   ✅ Time of access: ${pickupEvent.timestamp}`);
  console.log('   ❌ Does NOT know initially: Which locker (until opened)');
  console.log('   ✅ Knows after access: Locker A-042 opened');
  console.log('   - But cannot link to user identity');
  
  console.log('\n📦 Package sender knows:');
  console.log('   ✅ Package delivered to facility');
  console.log('   ✅ Package picked up (timestamp)');
  console.log('   ❌ Does NOT know: Specific locker');
  console.log('   ❌ Does NOT know: User identity');
  
  // ============================================================================
  // Use Cases
  // ============================================================================
  console.log('\n💡 Step 8: Use Cases');
  console.log('-'.repeat(60));
  
  console.log('\n1. Anonymous Package Pickup:');
  console.log('   - User picks up package without revealing identity');
  console.log('   - Useful for privacy-sensitive items');
  
  console.log('\n2. PUDO (Pick Up Drop Off) Points:');
  console.log('   - Network of lockers across city');
  console.log('   - Users can pick up from any facility');
  console.log('   - Privacy maintained at each location');
  
  console.log('\n3. Shared Locker Facilities:');
  console.log('   - Multiple users share same facility');
  console.log('   - Each proves access without revealing locker');
  console.log('   - Enhanced privacy in public spaces');
  
  console.log('\n4. Temporary Access:');
  console.log('   - User shares locker access with friend');
  console.log('   - Friend generates proof for pickup');
  console.log('   - No need to reveal locker number');
  
  // ============================================================================
  // Summary
  // ============================================================================
  console.log('\n' + '='.repeat(60));
  console.log('📊 Locker Pickup Summary');
  console.log('='.repeat(60));
  console.log('✅ User proved locker access anonymously');
  console.log('✅ Facility verified without knowing which locker');
  console.log('✅ Package picked up successfully');
  console.log('✅ Privacy maintained throughout');
  console.log('✅ Audit trail without personal data');
  console.log('\n🎉 Anonymous locker pickup complete!');
  
  // ============================================================================
  // Comparison
  // ============================================================================
  console.log('\n📊 Comparison: ZKP vs Traditional Locker');
  console.log('='.repeat(60));
  
  console.log('\n❌ Traditional Locker System:');
  console.log('   - User enters locker number');
  console.log('   - System logs: User X accessed Locker Y');
  console.log('   - Full tracking of user behavior');
  console.log('   - No privacy');
  
  console.log('\n✅ ZKP Locker System (This Example):');
  console.log('   - User proves access via ZK proof');
  console.log('   - System cannot link user to specific locker initially');
  console.log('   - Minimal data collection');
  console.log('   - Enhanced privacy');
  console.log('   - Still secure and auditable');
  
  console.log('\n🔒 Result: Privacy-preserving package pickup!');
}

// Run the example
main().catch(console.error);

export default main;
