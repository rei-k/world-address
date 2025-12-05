'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in (simplified for now)
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
          Veyvault
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Securely manage your addresses with end-to-end encryption
        </p>
      </header>

      {!isLoggedIn ? (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>
            Welcome to Veyvault
          </h2>
          <p style={{ marginBottom: '24px', color: '#6b7280' }}>
            Your secure cloud address vault for all your addresses worldwide. Support for 257 countries with multi-language input.
          </p>
          <div className="flex gap-4">
            <Link href="/login" className="btn btn-primary">
              Sign In
            </Link>
            <Link href="/register" className="btn btn-secondary">
              Create Account
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3">
          <Link href="/dashboard" className="card" style={{ cursor: 'pointer' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              📊 Dashboard
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              View your account overview and recent activity
            </p>
          </Link>

          <Link href="/addresses" className="card" style={{ cursor: 'pointer' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              📝 Address Book
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Manage your addresses from all countries
            </p>
          </Link>

          <Link href="/settings" className="card" style={{ cursor: 'pointer' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              ⚙️ Settings
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Manage your account settings and preferences
            </p>
          </Link>

          <Link href="/qr" className="card" style={{ cursor: 'pointer' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              📱 QR Codes
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Generate and scan QR codes for sharing
            </p>
          </Link>

          <Link href="/friends" className="card" style={{ cursor: 'pointer' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              👥 Friends
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Manage your friends and sharing permissions
            </p>
          </Link>

          <Link href="/sites" className="card" style={{ cursor: 'pointer' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              🔗 Connected Sites
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Manage site access permissions
            </p>
          </Link>
        </div>
      )}

      <div style={{ marginTop: '60px', borderTop: '1px solid #e5e7eb', paddingTop: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>
          Key Features
        </h2>
        <div className="grid grid-cols-3">
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
              🌍 257 Countries Supported
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Complete address support for all countries worldwide
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
              🔐 End-to-End Encryption
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Your addresses are encrypted and only you can access them
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
              🌐 Multi-Language Input
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Enter addresses in native language or English with auto-translation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
