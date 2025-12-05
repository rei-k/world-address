'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Friend } from '@/src/types';
import { getFriends, sendFriendRequest, acceptFriendRequest } from '@/src/services/friends.service';

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');

  useEffect(() => {
    loadFriends();
  }, []);

  async function loadFriends() {
    try {
      setLoading(true);
      const userId = 'current-user-id';
      const friendsList = await getFriends(userId);
      setFriends(friendsList);
    } catch (error) {
      console.error('Failed to load friends:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendInvite() {
    if (!friendEmail) return;

    try {
      const userId = 'current-user-id';
      await sendFriendRequest(userId, friendEmail);
      setFriendEmail('');
      setShowInviteModal(false);
      loadFriends();
    } catch (error) {
      console.error('Failed to send invite:', error);
    }
  }

  async function handleAcceptRequest(friendId: string) {
    try {
      const userId = 'current-user-id';
      await acceptFriendRequest(userId, friendId);
      loadFriends();
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  }

  const acceptedFriends = friends.filter((f) => f.status === 'accepted');
  const pendingRequests = friends.filter((f) => f.status === 'pending');

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
            👥 Friends
          </h1>
          <p style={{ color: '#6b7280' }}>
            Manage your friends and share addresses securely
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/qr" className="btn btn-secondary">
            📱 Scan QR Code
          </Link>
          <button onClick={() => setShowInviteModal(true)} className="btn btn-primary">
            ➕ Invite Friend
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#6b7280' }}>Loading friends...</p>
        </div>
      ) : (
        <>
          {pendingRequests.length > 0 && (
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
                Pending Requests ({pendingRequests.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pendingRequests.map((friend) => (
                  <div
                    key={friend.id}
                    className="card"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                        {friend.friendName || friend.friendEmail}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>
                        Waiting for acceptance
                      </p>
                    </div>
                    <button
                      onClick={() => handleAcceptRequest(friend.id)}
                      className="btn btn-primary"
                      style={{ padding: '8px 16px', fontSize: '14px' }}
                    >
                      Accept
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
              Friends ({acceptedFriends.length})
            </h2>
            {acceptedFriends.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ fontSize: '48px', marginBottom: '16px' }}>👥</p>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  No friends yet
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                  Invite friends to share addresses and send gifts securely
                </p>
                <button onClick={() => setShowInviteModal(true)} className="btn btn-primary">
                  Invite Your First Friend
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                {acceptedFriends.map((friend) => (
                  <div key={friend.id} className="card">
                    <div style={{ marginBottom: '12px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                        {friend.friendName}
                      </h3>
                      {friend.friendEmail && (
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>
                          {friend.friendEmail}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: friend.canSendTo ? '#dcfce7' : '#f3f4f6',
                          color: friend.canSendTo ? '#166534' : '#6b7280',
                        }}
                      >
                        {friend.canSendTo ? '✓ Can send to' : 'Cannot send to'}
                      </span>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: '#dbeafe',
                          color: '#1e40af',
                        }}
                      >
                        🔐 Privacy protected
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {showInviteModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowInviteModal(false)}
        >
          <div
            className="card"
            style={{ maxWidth: '500px', width: '90%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
              Invite Friend
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '14px' }}>
              Enter your friend's email address to send an invitation.
            </p>
            <div style={{ marginBottom: '20px' }}>
              <label
                htmlFor="friendEmail"
                style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}
              >
                Email Address
              </label>
              <input
                id="friendEmail"
                type="email"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                placeholder="friend@example.com"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowInviteModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleSendInvite} className="btn btn-primary">
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
