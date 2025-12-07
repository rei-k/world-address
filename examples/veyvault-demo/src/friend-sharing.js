#!/usr/bin/env node

/**
 * Veyvault Demo - Friend Sharing & QR Code
 * 
 * Demonstrates:
 * - Sharing addresses with friends
 * - QR code generation (simulated)
 * - Friend permissions management
 * - Privacy-preserving address sharing
 */

import {
  encodePID,
  decodePID,
  createZKCircuit,
  generateZKSelectiveRevealProof,
  verifyZKSelectiveRevealProof,
} from '@vey/core';

// Simulated user data
const users = {
  alice: {
    did: 'did:key:alice',
    name: 'Alice',
    addresses: [
      {
        id: 'addr_1',
        label: 'Home',
        country: 'JP',
        province: '東京都',
        admin1: '13',
        city: '渋谷区',
        admin2: '113',
        postal_code: '150-0001',
        street_address: '神宮前1-1-1',
        building: 'Tower Mansion',
        room: '1001',
      },
    ],
  },
  bob: {
    did: 'did:key:bob',
    name: 'Bob',
    addresses: [],
  },
};

// Friend management
class FriendManager {
  constructor(userId) {
    this.userId = userId;
    this.friends = new Map();
    this.sharedAddresses = new Map();
  }

  /**
   * Add a friend
   */
  addFriend(friendDid, friendName) {
    const friendId = `friend_${this.friends.size + 1}`;
    this.friends.set(friendId, {
      id: friendId,
      did: friendDid,
      name: friendName,
      addedAt: new Date().toISOString(),
    });
    return friendId;
  }

  /**
   * Share address with friend
   */
  shareAddress(friendId, address, permissions = {}) {
    const shareId = `share_${this.sharedAddresses.size + 1}`;
    
    // Generate PID for the address
    const pid = encodePID({
      country: address.country,
      admin1: address.admin1,
      admin2: address.admin2,
    });

    // Default permissions
    const defaultPermissions = {
      canView: true,
      canSendPackages: true,
      fieldsRevealed: ['city', 'postal_code'], // Partial disclosure
      expiresAt: null, // Never expires by default
    };

    const share = {
      id: shareId,
      friendId,
      addressId: address.id,
      addressLabel: address.label,
      pid,
      permissions: { ...defaultPermissions, ...permissions },
      sharedAt: new Date().toISOString(),
    };

    this.sharedAddresses.set(shareId, share);
    return share;
  }

  /**
   * Get shared addresses for a friend
   */
  getSharedAddresses(friendId) {
    return Array.from(this.sharedAddresses.values())
      .filter(share => share.friendId === friendId);
  }

  /**
   * Revoke address sharing
   */
  revokeSharing(shareId) {
    return this.sharedAddresses.delete(shareId);
  }

  /**
   * List all friends
   */
  listFriends() {
    return Array.from(this.friends.values());
  }

  /**
   * Display friends and shared addresses
   */
  display() {
    const friends = this.listFriends();

    if (friends.length === 0) {
      console.log('👥 No friends yet');
      return;
    }

    console.log(`\n👥 Friends List (${friends.length})`);
    console.log('═'.repeat(60));

    friends.forEach((friend, index) => {
      console.log(`\n${index + 1}. ${friend.name}`);
      console.log('─'.repeat(60));
      console.log(`   DID: ${friend.did}`);
      console.log(`   Added: ${new Date(friend.addedAt).toLocaleString()}`);

      // Get shared addresses
      const shared = this.getSharedAddresses(friend.id);
      if (shared.length > 0) {
        console.log(`   Shared Addresses: ${shared.length}`);
        shared.forEach((share, idx) => {
          console.log(`     ${idx + 1}. ${share.addressLabel}`);
          console.log(`        PID: ${share.pid}`);
          console.log(`        Fields: ${share.permissions.fieldsRevealed.join(', ')}`);
        });
      } else {
        console.log('   Shared Addresses: None');
      }
    });

    console.log('\n' + '═'.repeat(60));
  }
}

// QR Code simulator (in real app, this would generate actual QR codes)
class QRCodeGenerator {
  static generateAddressQR(address, permissions = {}) {
    const pid = encodePID({
      country: address.country,
      admin1: address.admin1,
      admin2: address.admin2,
    });

    const qrData = {
      type: 'veyvault_address',
      version: '1.0',
      pid,
      permissions: {
        canSendPackages: permissions.canSendPackages || true,
        fieldsRevealed: permissions.fieldsRevealed || ['city'],
        validUntil: permissions.expiresAt || null,
      },
      timestamp: new Date().toISOString(),
    };

    // Simulate QR code as ASCII art
    const qrCodeAscii = `
    ████████  ██████████  ████████
    ██    ██  ██  ██  ██  ██    ██
    ██  ████  ████████    ██  ████
    ████████  ██    ████  ████████
    ██    ██  ██  ██  ██  ██    ██
    ██  ████  ██████████  ██  ████
    ████████  ██  ██  ██  ████████
    `;

    return {
      data: qrData,
      ascii: qrCodeAscii,
      url: `veyvault://address?pid=${pid}`,
    };
  }

  static displayQR(qrCode) {
    console.log('\n📱 QR Code Generated');
    console.log('═'.repeat(60));
    console.log(qrCode.ascii);
    console.log('─'.repeat(60));
    console.log('Type:', qrCode.data.type);
    console.log('PID:', qrCode.data.pid);
    console.log('Permissions:', JSON.stringify(qrCode.data.permissions, null, 2));
    console.log('URL:', qrCode.url);
    console.log('═'.repeat(60));
  }
}

// ============================================================================
// Demo Script
// ============================================================================

console.log('👥 Veyvault Demo - Friend Sharing & QR Code\n');
console.log('='.repeat(60));

// Alice's friend manager
const aliceFriends = new FriendManager(users.alice.did);

console.log('\n📝 Scenario: Alice wants to share her address with Bob\n');

// Step 1: Alice adds Bob as a friend
console.log('Step 1: Alice adds Bob as friend');
console.log('─'.repeat(60));
const bobFriendId = aliceFriends.addFriend(users.bob.did, users.bob.name);
console.log(`✅ ${users.bob.name} added as friend`);
console.log(`   Friend ID: ${bobFriendId}`);

// Step 2: Alice shares her home address with Bob
console.log('\n\nStep 2: Alice shares home address with Bob');
console.log('─'.repeat(60));

const homeAddress = users.alice.addresses[0];

// Alice chooses what to reveal
const sharePermissions = {
  canSendPackages: true,
  fieldsRevealed: ['city', 'postal_code'], // Only reveal city and postal code
};

const share = aliceFriends.shareAddress(bobFriendId, homeAddress, sharePermissions);

console.log('✅ Address shared with selective disclosure');
console.log(`   PID: ${share.pid}`);
console.log(`   Fields revealed: ${sharePermissions.fieldsRevealed.join(', ')}`);
console.log(`   Can send packages: ${sharePermissions.canSendPackages}`);

// Step 3: Generate ZK proof for selective disclosure
console.log('\n\nStep 3: Generate privacy proof');
console.log('─'.repeat(60));

const circuit = createZKCircuit(
  'veyvault-sharing-v1',
  'Veyvault Address Sharing',
  'Privacy-preserving address sharing with selective disclosure'
);

const proof = generateZKSelectiveRevealProof(
  share.pid,
  homeAddress,
  sharePermissions.fieldsRevealed,
  circuit
);

console.log('✅ ZK Proof generated');
console.log(`   Pattern: ${proof.patternType}`);
console.log(`   Fields revealed: ${proof.revealedFields.join(', ')}`);

// Step 4: Bob receives and verifies the proof
console.log('\n\nStep 4: Bob receives and verifies');
console.log('─'.repeat(60));

const verification = verifyZKSelectiveRevealProof(proof, circuit);

console.log('✅ Proof verified by Bob');
console.log('\n📋 Bob can see:');
Object.entries(verification.revealedData).forEach(([field, value]) => {
  console.log(`   ✅ ${field}: ${value}`);
});

console.log('\n🔒 Bob CANNOT see:');
const hiddenFields = ['street_address', 'building', 'room', 'province'];
hiddenFields.forEach(field => {
  console.log(`   ❌ ${field}: [Hidden for privacy]`);
});

// Step 5: Generate QR code for sharing
console.log('\n\nStep 5: Generate QR code for easy sharing');
console.log('─'.repeat(60));

const qrCode = QRCodeGenerator.generateAddressQR(homeAddress, sharePermissions);
QRCodeGenerator.displayQR(qrCode);

// Step 6: Bob sends a package
console.log('\n\nStep 6: Bob sends a birthday gift');
console.log('─'.repeat(60));

console.log(`📦 ${users.bob.name} prepares a gift for ${users.alice.name}`);
console.log('\nUsing revealed information:');
console.log(`   City: ${verification.revealedData.city}`);
console.log(`   Postal Code: ${verification.revealedData.postal_code}`);
console.log('\n✅ Package sent to locker or privacy-preserving address');
console.log('   Alice will receive notification');
console.log('   Carrier will resolve full address at delivery time');

// Display friend list
aliceFriends.display();

// Demonstrate additional friend
console.log('\n\n👥 Adding another friend with different permissions\n');
console.log('─'.repeat(60));

const charlieId = aliceFriends.addFriend('did:key:charlie', 'Charlie');
console.log('✅ Added Charlie as friend');

// Share with Charlie but with more restricted permissions
const charlieShare = aliceFriends.shareAddress(charlieId, homeAddress, {
  canSendPackages: false, // Can only view, not send
  fieldsRevealed: ['city'], // Only city, no postal code
});

console.log('✅ Shared with Charlie (view only)');
console.log(`   Fields revealed: ${charlieShare.permissions.fieldsRevealed.join(', ')}`);
console.log(`   Can send packages: ${charlieShare.permissions.canSendPackages}`);

// Final display
aliceFriends.display();

// Summary
console.log('\n\n' + '='.repeat(60));
console.log('📊 Friend Sharing Summary');
console.log('='.repeat(60));
console.log('✅ Friends added: 2');
console.log('✅ Addresses shared: 2');
console.log('✅ Privacy maintained with selective disclosure');
console.log('✅ QR code generated for easy sharing');
console.log('✅ Different permission levels demonstrated');
console.log('\n💡 Key Features:');
console.log('   • Granular control over shared information');
console.log('   • Privacy-preserving proofs');
console.log('   • Friend-specific permissions');
console.log('   • QR code sharing support');
console.log('   • No raw addresses exposed to friends');
console.log('\n🎉 Veyvault makes address sharing safe and easy!');
console.log('='.repeat(60) + '\n');
