'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardStats {
  addressCount: number;
  friendCount: number;
  deliveryCount: number;
  connectedSites: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    addressCount: 0,
    friendCount: 0,
    deliveryCount: 0,
    connectedSites: 0,
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    // TODO: Load dashboard data from API
    const mockStats: DashboardStats = {
      addressCount: 3,
      friendCount: 5,
      deliveryCount: 12,
      connectedSites: 4,
    };
    setStats(mockStats);

    const mockActivity = [
      { id: 1, type: 'address', action: 'Added new address', time: '2 hours ago' },
      { id: 2, type: 'qr', action: 'QR code scanned', time: '5 hours ago' },
      { id: 3, type: 'friend', action: 'Friend request accepted', time: '1 day ago' },
    ];
    setRecentActivity(mockActivity);
  }, []);

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <div className="flex-between mb-6">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
            Dashboard
          </h1>
          <p style={{ color: '#6b7280' }}>
            Welcome back! Here's your account overview.
          </p>
        </div>
        <Link href="/" className="btn btn-secondary">
          ← Back
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 mb-6">
        <Link href="/addresses" className="card" style={{ cursor: 'pointer' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2563eb', marginBottom: '8px' }}>
            {stats.addressCount}
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>
            📝 Saved Addresses
          </div>
        </Link>

        <Link href="/friends" className="card" style={{ cursor: 'pointer' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
            {stats.friendCount}
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>
            👥 Friends
          </div>
        </Link>

        <div className="card">
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>
            {stats.deliveryCount}
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>
            📦 Total Deliveries
          </div>
        </div>

        <Link href="/sites" className="card" style={{ cursor: 'pointer' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '8px' }}>
            {stats.connectedSites}
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>
            🔗 Connected Sites
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          Recent Activity
        </h3>

        {recentActivity.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
            No recent activity
          </p>
        ) : (
          <div>
            {recentActivity.map(activity => (
              <div
                key={activity.id}
                style={{
                  padding: '12px',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                    {activity.action}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    {activity.time}
                  </div>
                </div>
                <div style={{ fontSize: '20px' }}>
                  {activity.type === 'address' && '📝'}
                  {activity.type === 'qr' && '📱'}
                  {activity.type === 'friend' && '👥'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          Quick Actions
        </h3>
        <div className="grid grid-cols-3">
          <Link href="/addresses/new" className="btn btn-primary">
            + Add Address
          </Link>
          <Link href="/qr" className="btn btn-secondary">
            📱 Generate QR
          </Link>
          <Link href="/settings" className="btn btn-secondary">
            ⚙️ Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
