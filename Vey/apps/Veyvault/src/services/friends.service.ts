/**
 * Friends Service
 * Handles friend management and QR/NFC sharing
 */

import type { Friend, FriendInvitation } from '../types';

/**
 * Get user's friends list
 */
export async function getFriends(userId: string): Promise<Friend[]> {
  // TODO: Fetch from API
  // Mock data for now
  return [];
}

/**
 * Send friend request
 */
export async function sendFriendRequest(
  userId: string,
  friendEmail: string
): Promise<Friend> {
  const friend: Friend = {
    id: generateId(),
    userId,
    friendId: '', // Will be set when accepted
    friendName: '',
    friendEmail,
    status: 'pending',
    canSendTo: false,
    createdAt: new Date(),
  };

  // TODO: Send via API
  return friend;
}

/**
 * Accept friend request
 */
export async function acceptFriendRequest(
  userId: string,
  friendRequestId: string
): Promise<Friend> {
  // TODO: Update via API
  const friend: Friend = {
    id: friendRequestId,
    userId,
    friendId: generateId(),
    friendName: 'Friend Name',
    status: 'accepted',
    canSendTo: true,
    createdAt: new Date(),
  };

  return friend;
}

/**
 * Block friend
 */
export async function blockFriend(
  userId: string,
  friendId: string
): Promise<void> {
  // TODO: Update via API
}

/**
 * Generate QR/NFC invitation
 */
export async function generateInvitation(
  userId: string,
  userName: string
): Promise<FriendInvitation> {
  const invitationData = {
    inviterId: userId,
    inviterName: userName,
    timestamp: new Date().toISOString(),
    type: 'friend_request',
  };

  const qrCode = JSON.stringify(invitationData);
  const nfcData = Buffer.from(qrCode).toString('base64');

  const invitation: FriendInvitation = {
    inviterId: userId,
    inviterName: userName,
    qrCode,
    nfcData,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  };

  return invitation;
}

/**
 * Scan QR code to add friend
 */
export async function scanQRCode(
  userId: string,
  qrCode: string
): Promise<Friend> {
  try {
    const invitationData = JSON.parse(qrCode);
    
    const friend: Friend = {
      id: generateId(),
      userId,
      friendId: invitationData.inviterId,
      friendName: invitationData.inviterName,
      status: 'pending',
      canSendTo: false,
      createdAt: new Date(),
    };

    // TODO: Send friend request via API
    return friend;
  } catch (error) {
    throw new Error('Invalid QR code');
  }
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
