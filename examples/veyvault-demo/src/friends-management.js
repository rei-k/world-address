#!/usr/bin/env node

/**
 * Veyvault Demo - Friends Management
 * 
 * Demonstrates friend management features:
 * - Add friends with QR/NFC code
 * - Share addresses with friends (selective disclosure)
 * - Manage friend permissions
 * - Generate delivery links for friends
 */

import {
  createQRCode,
  createFriendInvite,
  acceptFriendInvite,
  shareAddressWithFriend,
  revokeAddressSharing,
} from '@vey/core';

// Simple friends manager
class FriendsManager {
  constructor() {
    this.friends = new Map();
    this.sharedAddresses = new Map();
    this.nextId = 1;
  }

  /**
   * Generate QR code for friend invitation
   */
  generateInviteQR(userDID, userName) {
    const invite = createFriendInvite({
      userDID,
      userName,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      timestamp: new Date().toISOString(),
    });

    const qrCode = createQRCode({
      type: 'friend_invite',
      data: invite,
      version: 1,
    });

    return { invite, qrCode };
  }

  /**
   * Accept friend invitation
   */
  acceptInvite(inviteCode, myDID, myName) {
    const friendId = `friend_${this.nextId++}`;
    
    const friendship = acceptFriendInvite({
      inviteCode,
      acceptedBy: myDID,
      acceptedByName: myName,
      timestamp: new Date().toISOString(),
    });

    const friend = {
      id: friendId,
      did: friendship.friendDID,
      name: friendship.friendName,
      addedAt: new Date().toISOString(),
      status: 'active',
      permissions: {
        canSendGifts: true,
        canViewCity: true,
        canViewFullAddress: false,
      },
    };

    this.friends.set(friendId, friend);
    return friend;
  }

  /**
   * Share address with friend (selective disclosure)
   */
  shareAddress(friendId, addressPID, revealLevel = 'city') {
    const friend = this.friends.get(friendId);
    if (!friend) {
      throw new Error('Friend not found');
    }

    const sharedEntry = shareAddressWithFriend({
      friendDID: friend.did,
      addressPID,
      revealLevel, // 'country', 'city', 'locker', 'full'
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      permissions: friend.permissions,
      timestamp: new Date().toISOString(),
    });

    const shareId = `share_${friendId}_${Date.now()}`;
    this.sharedAddresses.set(shareId, {
      id: shareId,
      friendId,
      addressPID,
      revealLevel,
      sharedAt: new Date().toISOString(),
      expiresAt: sharedEntry.expiresAt,
      status: 'active',
    });

    return sharedEntry;
  }

  /**
   * Revoke address sharing
   */
  revokeSharing(shareId) {
    const share = this.sharedAddresses.get(shareId);
    if (!share) {
      return false;
    }

    const friend = this.friends.get(share.friendId);
    
    revokeAddressSharing({
      friendDID: friend.did,
      addressPID: share.addressPID,
      reason: 'user_requested',
      timestamp: new Date().toISOString(),
    });

    share.status = 'revoked';
    share.revokedAt = new Date().toISOString();
    
    return true;
  }

  /**
   * List all friends
   */
  listFriends() {
    return Array.from(this.friends.values());
  }

  /**
   * Get shared addresses for a friend
   */
  getSharedAddresses(friendId) {
    return Array.from(this.sharedAddresses.values())
      .filter(share => share.friendId === friendId && share.status === 'active');
  }

  /**
   * Display friends list
   */
  display() {
    const friends = this.listFriends();
    
    if (friends.length === 0) {
      console.log('👥 No friends added yet');
      return;
    }

    console.log(`\n👥 Friends List (${friends.length} friend${friends.length !== 1 ? 's' : ''})`);
    console.log('═'.repeat(60));
    
    friends.forEach((friend, index) => {
      console.log(`\n${index + 1}. ${friend.name} [${friend.id}]`);
      console.log('─'.repeat(60));
      console.log(`   DID: ${friend.did.substring(0, 30)}...`);
      console.log(`   Added: ${new Date(friend.addedAt).toLocaleDateString()}`);
      console.log(`   Status: ${friend.status}`);
      console.log('   Permissions:');
      console.log(`     • Can send gifts: ${friend.permissions.canSendGifts ? '✅' : '❌'}`);
      console.log(`     • Can view city: ${friend.permissions.canViewCity ? '✅' : '❌'}`);
      console.log(`     • Can view full address: ${friend.permissions.canViewFullAddress ? '✅' : '❌'}`);
      
      // Show shared addresses
      const shared = this.getSharedAddresses(friend.id);
      if (shared.length > 0) {
        console.log('   Shared Addresses:');
        shared.forEach(share => {
          console.log(`     • ${share.addressPID} (${share.revealLevel} level)`);
        });
      }
    });
    
    console.log('\n' + '═'.repeat(60));
  }
}

// ============================================================================
// Demo Script
// ============================================================================

console.log('👥 Veyvault Demo - Friends Management\n');
console.log('='.repeat(60));

// Create friends manager
const friendsManager = new FriendsManager();

console.log('\n📱 Step 1: Generating friend invitation QR code...\n');

const userDID = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
const userName = 'Alice';

const { invite, qrCode } = friendsManager.generateInviteQR(userDID, userName);

console.log('✅ Friend invitation created:');
console.log('   User:', userName);
console.log('   DID:', userDID);
console.log('   Invite Code:', invite.code);
console.log('   Expires:', new Date(invite.expiresAt).toLocaleDateString());
console.log('\n📲 QR Code generated:');
console.log('   Type:', qrCode.type);
console.log('   Version:', qrCode.version);
console.log('   QR Data:', qrCode.data.substring(0, 50) + '...');
console.log('\n💡 Friend can scan this QR code to send you gifts!');

console.log('\n\n👋 Step 2: Friend (Bob) accepts invitation...\n');

const bobDID = 'did:key:z6MkBobXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
const bobName = 'Bob';

const friend = friendsManager.acceptInvite(invite.code, bobDID, bobName);

console.log('✅ Friend added:');
console.log('   Name:', friend.name);
console.log('   DID:', friend.did);
console.log('   Permissions:', friend.permissions);

console.log('\n\n📍 Step 3: Sharing address with friend (city-level)...\n');

const addressPID = 'JP-13-113-01'; // Tokyo, Chiyoda-ku

const shared = friendsManager.shareAddress(friend.id, addressPID, 'city');

console.log('✅ Address shared:');
console.log('   Friend:', friend.name);
console.log('   Address PID:', addressPID);
console.log('   Reveal Level:', 'city');
console.log('   Expires:', new Date(shared.expiresAt).toLocaleDateString());
console.log('\n💡 What Bob can see:');
console.log('   ✅ Country: Japan');
console.log('   ✅ City: Tokyo, Chiyoda-ku');
console.log('   🔒 Street: Hidden');
console.log('   🔒 Building: Hidden');
console.log('\n💡 Bob can now send you gifts delivered to your city!');

console.log('\n\n👥 Step 4: Adding another friend (Carol)...\n');

const { invite: carolInvite } = friendsManager.generateInviteQR(userDID, userName);
const carolDID = 'did:key:z6MkCarolXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
const carolName = 'Carol';

const carol = friendsManager.acceptInvite(carolInvite.code, carolDID, carolName);

console.log('✅ Friend added:', carol.name);

// Share different address with Carol at locker level
const lockerAddress = 'JP-27-100-05-LOCKER-123'; // Osaka with locker
const sharedWithCarol = friendsManager.shareAddress(carol.id, lockerAddress, 'locker');

console.log('✅ Address shared with', carol.name, 'at locker level');
console.log('   Locker ID: LOCKER-123');
console.log('   💡 Carol can send gifts to your locker anonymously!');

// Display friends list
friendsManager.display();

console.log('\n\n🔒 Step 5: Revoking address sharing...\n');

const shares = friendsManager.getSharedAddresses(friend.id);
if (shares.length > 0) {
  const revokeSuccess = friendsManager.revokeSharing(shares[0].id);
  if (revokeSuccess) {
    console.log('✅ Address sharing revoked for', friend.name);
    console.log('   Address PID:', addressPID);
    console.log('   💡', friend.name, 'can no longer send gifts to this address');
  }
}

// Display final state
console.log('\n\n📊 Friends Management Summary\n');
console.log('Total friends:', friendsManager.listFriends().length);
console.log('Active address shares:', 
  Array.from(friendsManager.sharedAddresses.values())
    .filter(s => s.status === 'active').length
);
console.log('Revoked shares:', 
  Array.from(friendsManager.sharedAddresses.values())
    .filter(s => s.status === 'revoked').length
);

console.log('\n\n' + '='.repeat(60));
console.log('✅ Friends Management Demo completed!');
console.log('='.repeat(60));
console.log('\nKey Features Demonstrated:');
console.log('  ✓ Generate QR codes for friend invitations');
console.log('  ✓ Accept friend requests');
console.log('  ✓ Selective address disclosure (city/locker level)');
console.log('  ✓ Manage friend permissions');
console.log('  ✓ Revoke address sharing');
console.log('  ✓ Anonymous gift delivery via lockers');
console.log('\nNext Steps:');
console.log('  → Try address-book demo: npm run address-book');
console.log('  → See ZKP demo: ../zkp-demo/README.md\n');
