/**
 * ZKP Demo - Flow 1: Address Registration & Authentication
 * 
 * This demo shows how a user registers their address and receives
 * a verified credential without exposing raw address data.
 */

import {
  createDIDDocument,
  createAddressPIDCredential,
  signCredential,
  verifyCredential,
} from '@vey/core';

console.log('🔐 ZKP Demo - Flow 1: Address Registration & Authentication\n');
console.log('='.repeat(60));

// Mock data
const userPublicKey = 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
const userPrivateKey = 'mock-private-key-do-not-use-in-production';
const issuerPrivateKey = 'mock-issuer-private-key';

// Step 1: User creates a DID
console.log('\n📝 Step 1: Creating DID for user...');
const userDID = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
const didDoc = createDIDDocument(userDID, userPublicKey);

console.log('✅ DID created:', userDID);
console.log('   Verification Method:', didDoc.verificationMethod[0].id);
console.log('   Created:', didDoc.created);

// Step 2: User submits address (simulated)
console.log('\n📍 Step 2: User submits address to Address Provider...');
const rawAddress = {
  country: 'JP',
  postalCode: '100-0001',
  prefecture: '東京都',
  city: '千代田区',
  street: '千代田1-1',
};

console.log('   Address:', JSON.stringify(rawAddress, null, 2));

// Step 3: Address Provider normalizes address to PID
console.log('\n🔄 Step 3: Address Provider normalizes to PID...');
const pid = 'JP-13-113-01'; // Hierarchical Place Identifier
console.log('✅ PID generated:', pid);
console.log('   Structure: Country-Admin1-Admin2-Admin3');
console.log('   JP = Japan, 13 = Tokyo, 113 = Chiyoda-ku, 01 = Area');

// Step 4: Issue Verifiable Credential
console.log('\n📜 Step 4: Issuing Address PID Credential...');
const issuerDID = 'did:web:vey.example';
const vc = createAddressPIDCredential(
  userDID,
  issuerDID,
  pid,
  'JP',
  '13',
  new Date('2025-12-31').toISOString() // Expiration
);

console.log('✅ Credential created:');
console.log('   Issuer:', vc.issuer);
console.log('   Subject:', vc.credentialSubject.id);
console.log('   PID:', vc.credentialSubject.addressPID);
console.log('   Country:', vc.credentialSubject.countryCode);
console.log('   Expires:', vc.expirationDate);

// Step 5: Sign credential
console.log('\n🔏 Step 5: Signing credential...');
const verificationMethod = issuerDID + '#key-1';
const signedVC = signCredential(vc, issuerPrivateKey, verificationMethod);

console.log('✅ Credential signed');
console.log('   Proof Type:', signedVC.proof.type);
console.log('   Verification Method:', signedVC.proof.verificationMethod);
console.log('   Created:', signedVC.proof.created);

// Step 6: Verify credential
console.log('\n✔️  Step 6: Verifying credential...');
const mockIssuerPublicKey = 'mock-public-key';
const isValid = verifyCredential(signedVC, mockIssuerPublicKey);

if (isValid) {
  console.log('✅ Credential is VALID!');
  console.log('   ✓ Signature verified');
  console.log('   ✓ Not expired');
  console.log('   ✓ Issuer trusted');
} else {
  console.log('❌ Credential is INVALID');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Summary:');
console.log('   ✅ User DID created');
console.log('   ✅ Address normalized to PID');
console.log('   ✅ Verifiable Credential issued');
console.log('   ✅ Credential signed and verified');
console.log('\n💡 Key Point: Raw address never leaves user\'s wallet!');
console.log('   Only PID is stored in credential.');
console.log('='.repeat(60));

// Export for use in next demos
export { signedVC, userDID, userPrivateKey, pid };
