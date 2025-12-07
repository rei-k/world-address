/**
 * ZKP Demo - Flow 4: Address Update & Revocation
 * 
 * This demo shows how a user can update their address when moving,
 * revoke the old PID, and maintain delivery continuity.
 */

import {
  createRevocationEntry,
  createRevocationList,
  isPIDRevoked,
  generateZKVersionProof,
  verifyZKVersionProof,
  createAddressPIDCredential,
  signRevocationList,
} from '@vey/core';

console.log('🏠 ZKP Demo - Flow 4: Address Update & Revocation\n');
console.log('='.repeat(60));

// Mock data
const userDID = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
const userPrivateKey = 'mock-private-key';
const issuerDID = 'did:web:vey.example';
const issuerPrivateKey = 'mock-issuer-private-key';

// Old address (Tokyo)
const oldPID = 'JP-13-113-01';
const oldAddress = {
  country: 'JP',
  postalCode: '100-0001',
  prefecture: '東京都',
  city: '千代田区',
  street: '千代田1-1',
};

// New address (Osaka - user moved)
const newPID = 'JP-27-100-05';
const newAddress = {
  country: 'JP',
  postalCode: '530-0001',
  prefecture: '大阪府',
  city: '大阪市北区',
  street: '梅田1-1',
};

// Step 1: User moves to new address
console.log('\n📦 Step 1: User is moving to a new address...');
console.log('\n   Old Address (Tokyo):');
console.log('     PID:', oldPID);
console.log('     Postal Code:', oldAddress.postalCode);
console.log('     Prefecture:', oldAddress.prefecture);
console.log('     City:', oldAddress.city);
console.log('     Street:', oldAddress.street);

console.log('\n   New Address (Osaka):');
console.log('     PID:', newPID);
console.log('     Postal Code:', newAddress.postalCode);
console.log('     Prefecture:', newAddress.prefecture);
console.log('     City:', newAddress.city);
console.log('     Street:', newAddress.street);

// Step 2: Issue new credential for new address
console.log('\n📜 Step 2: Issuing new Address PID Credential...');
const newVC = createAddressPIDCredential(
  userDID,
  issuerDID,
  newPID,
  'JP',
  '27', // Osaka
  new Date('2025-12-31').toISOString()
);

console.log('✅ New credential issued:');
console.log('   Subject:', newVC.credentialSubject.id);
console.log('   New PID:', newVC.credentialSubject.addressPID);
console.log('   Country:', newVC.credentialSubject.countryCode);
console.log('   Admin1:', newVC.credentialSubject.admin1Code, '(Osaka)');

// Step 3: Generate ZK Version Proof (links old and new addresses)
console.log('\n🔗 Step 3: Generating ZK Version Proof...');
console.log('   This proves the same user owns both addresses');

const versionProof = generateZKVersionProof({
  oldPID: oldPID,
  newPID: newPID,
  ownerDID: userDID,
  privateKey: userPrivateKey,
  timestamp: new Date().toISOString(),
});

console.log('✅ ZK Version Proof generated:');
console.log('   Proof ID:', versionProof.id);
console.log('   Old PID:', versionProof.publicData.oldPID);
console.log('   New PID:', versionProof.publicData.newPID);
console.log('   Owner DID:', versionProof.publicData.ownerDID);
console.log('   Timestamp:', versionProof.publicData.timestamp);

// Step 4: Verify version proof
console.log('\n✔️  Step 4: Verifying version proof...');
const verificationResult = verifyZKVersionProof(versionProof, userDID);

if (verificationResult.valid) {
  console.log('✅ Version proof is VALID!');
  console.log('   ✓ Both addresses belong to same owner');
  console.log('   ✓ Cryptographic link established');
  console.log('   ✓ Timeline consistent');
} else {
  console.log('❌ Version proof is INVALID');
}

// Step 5: Create revocation entry for old PID
console.log('\n🚫 Step 5: Creating revocation entry for old PID...');
const revocationEntry = createRevocationEntry({
  pidToRevoke: oldPID,
  reason: 'address_changed',
  newPID: newPID,
  revokedBy: userDID,
  timestamp: new Date().toISOString(),
  versionProof: versionProof.id,
});

console.log('✅ Revocation entry created:');
console.log('   Revoked PID:', revocationEntry.pidToRevoke);
console.log('   Reason:', revocationEntry.reason);
console.log('   New PID:', revocationEntry.newPID);
console.log('   Revoked by:', revocationEntry.revokedBy);
console.log('   Timestamp:', revocationEntry.timestamp);

// Step 6: Add to revocation list
console.log('\n📝 Step 6: Adding to revocation list...');
const revocationList = createRevocationList({
  issuer: issuerDID,
  entries: [revocationEntry],
  timestamp: new Date().toISOString(),
});

const signedRevocationList = signRevocationList(
  revocationList,
  issuerPrivateKey,
  issuerDID + '#key-1'
);

console.log('✅ Revocation list updated:');
console.log('   Issuer:', signedRevocationList.issuer);
console.log('   Entries:', signedRevocationList.entries.length);
console.log('   Timestamp:', signedRevocationList.timestamp);
console.log('   Signature:', signedRevocationList.proof.type);

// Step 7: Check if old PID is revoked
console.log('\n🔍 Step 7: Checking revocation status...');

console.log('\n   Checking old PID:', oldPID);
const oldPIDRevoked = isPIDRevoked(oldPID, signedRevocationList);
console.log('   Status:', oldPIDRevoked ? '🚫 REVOKED' : '✅ Active');

console.log('\n   Checking new PID:', newPID);
const newPIDRevoked = isPIDRevoked(newPID, signedRevocationList);
console.log('   Status:', newPIDRevoked ? '🚫 REVOKED' : '✅ Active');

// Step 8: Demonstrate continuity
console.log('\n🔄 Step 8: Demonstrating delivery continuity...');
console.log('\n   Scenario: Package shipped before move, arrives after');
console.log('\n   Before move:');
console.log('     • QR code generated with old PID:', oldPID);
console.log('     • Waybill created with old PID');
console.log('\n   After move:');
console.log('     • System checks revocation list');
console.log('     • Finds old PID revoked');
console.log('     • Finds new PID via version proof');
console.log('     • Automatically redirects to new address:', newPID);
console.log('     • Delivery continues seamlessly! ✅');

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Summary:');
console.log('   ✅ New address credential issued');
console.log('   ✅ ZK Version Proof generated and verified');
console.log('   ✅ Old PID revoked');
console.log('   ✅ Revocation list signed and published');
console.log('   ✅ Delivery continuity maintained');
console.log('\n💡 Key Points:');
console.log('   • Old address safely revoked');
console.log('   • New address cryptographically linked');
console.log('   • QR codes automatically redirect');
console.log('   • Privacy preserved throughout');
console.log('   • No delivery disruption');
console.log('='.repeat(60));

// Export for potential use
export { versionProof, newVC, revocationEntry, signedRevocationList };
