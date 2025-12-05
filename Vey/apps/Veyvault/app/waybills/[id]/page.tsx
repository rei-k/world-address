'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import type { DeliveryRequest, Waybill, WalletPass } from '@/src/types';
import { 
  createGoogleWalletPass, 
  createAppleWalletPass 
} from '@/src/services/waybill.service';

export default function WaybillDetailPage() {
  const params = useParams();
  const deliveryId = params.id as string;

  const [delivery, setDelivery] = useState<DeliveryRequest | null>(null);
  const [waybill, setWaybill] = useState<Waybill | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletPasses, setWalletPasses] = useState<{
    google?: WalletPass;
    apple?: WalletPass;
  }>({});
  const [generatingWallet, setGeneratingWallet] = useState<'google' | 'apple' | null>(null);

  useEffect(() => {
    loadDeliveryDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryId]);

  async function loadDeliveryDetails() {
    try {
      setLoading(true);
      // TODO: Fetch from API
      // Mock data for now
      const mockDelivery: DeliveryRequest = {
        id: deliveryId,
        userId: 'user-123',
        waybillId: `wb-${deliveryId}`,
        carrierId: '1',
        carrierServiceId: 's1',
        status: 'in_transit',
        trackingNumber: `VEY${Date.now().toString(36).toUpperCase()}`,
        pickupScheduled: new Date(Date.now() + 86400000),
        estimatedDelivery: new Date(Date.now() + 172800000),
        cost: {
          amount: 850,
          currency: 'JPY',
        },
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date(),
      };

      const mockWaybill: Waybill = {
        id: mockDelivery.waybillId,
        userId: 'user-123',
        senderId: 'addr-001',
        receiverId: 'addr-002',
        senderType: 'self',
        receiverType: 'friend',
        receiverZkpToken: 'zkp_addr-002_1234567890',
        qrCode: JSON.stringify({
          type: 'waybill',
          id: mockDelivery.waybillId,
          version: '1.0',
        }),
        status: 'submitted',
        packageInfo: {
          weight: 1.5,
          dimensions: { length: 30, width: 20, height: 10 },
          description: 'Gift package',
          value: 5000,
          currency: 'JPY',
        },
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date(),
      };

      setDelivery(mockDelivery);
      setWaybill(mockWaybill);
    } catch (error) {
      console.error('Failed to load delivery details:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateWalletPass(type: 'google' | 'apple') {
    if (!waybill) return;
    
    try {
      setGeneratingWallet(type);
      const pass = type === 'google'
        ? await createGoogleWalletPass(waybill.id, 'user-123')
        : await createAppleWalletPass(waybill.id, 'user-123');
      
      setWalletPasses(prev => ({ ...prev, [type]: pass }));
      
      // Open wallet pass URL
      window.open(pass.passUrl, '_blank');
    } catch (error) {
      console.error(`Failed to generate ${type} wallet pass:`, error);
      alert(`Failed to generate ${type} wallet pass`);
    } finally {
      setGeneratingWallet(null);
    }
  }

  const statusColors: Record<string, { bg: string; text: string }> = {
    new: { bg: '#dbeafe', text: '#1e40af' },
    accepted: { bg: '#fef3c7', text: '#92400e' },
    in_transit: { bg: '#e0e7ff', text: '#3730a3' },
    delivered: { bg: '#dcfce7', text: '#166534' },
    failed: { bg: '#fee2e2', text: '#991b1b' },
  };

  const getStatusEmoji = (status: string) => {
    const emojiMap: Record<string, string> = {
      new: '📋',
      accepted: '✅',
      in_transit: '🚚',
      delivered: '📦',
      failed: '❌',
    };
    return emojiMap[status] || '📄';
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '40px' }}>
        <p>Loading delivery details...</p>
      </div>
    );
  }

  if (!delivery || !waybill) {
    return (
      <div className="container" style={{ paddingTop: '40px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            Delivery Not Found
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            The requested delivery could not be found.
          </p>
          <Link href="/waybills" className="btn btn-primary">
            ← Back to Deliveries
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
            Delivery Details
          </h1>
          <p style={{ color: '#6b7280' }}>
            Tracking Number: {delivery.trackingNumber}
          </p>
        </div>
        <Link href="/waybills" className="btn btn-secondary">
          ← Back
        </Link>
      </div>

      {/* Status Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              backgroundColor: statusColors[delivery.status]?.bg || '#f3f4f6',
              color: statusColors[delivery.status]?.text || '#6b7280',
            }}
          >
            {getStatusEmoji(delivery.status)} {delivery.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Created</p>
            <p style={{ fontSize: '16px', fontWeight: '500' }}>
              {delivery.createdAt.toLocaleDateString()}
            </p>
          </div>
          {delivery.estimatedDelivery && (
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Est. Delivery</p>
              <p style={{ fontSize: '16px', fontWeight: '500' }}>
                {delivery.estimatedDelivery.toLocaleDateString()}
              </p>
            </div>
          )}
          {delivery.actualDelivery && (
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Delivered</p>
              <p style={{ fontSize: '16px', fontWeight: '500', color: '#166534' }}>
                {delivery.actualDelivery.toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ gap: '24px' }}>
        {/* Left Column */}
        <div>
          {/* Package Information */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              📦 Package Information
            </h3>
            {waybill.packageInfo && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>Weight</p>
                  <p style={{ fontSize: '16px', fontWeight: '500' }}>
                    {waybill.packageInfo.weight} kg
                  </p>
                </div>
                {waybill.packageInfo.dimensions && (
                  <div>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>Dimensions (L×W×H)</p>
                    <p style={{ fontSize: '16px', fontWeight: '500' }}>
                      {waybill.packageInfo.dimensions.length} × {waybill.packageInfo.dimensions.width} × {waybill.packageInfo.dimensions.height} cm
                    </p>
                  </div>
                )}
                {waybill.packageInfo.description && (
                  <div>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>Description</p>
                    <p style={{ fontSize: '16px', fontWeight: '500' }}>
                      {waybill.packageInfo.description}
                    </p>
                  </div>
                )}
                {waybill.packageInfo.value && (
                  <div>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>Declared Value</p>
                    <p style={{ fontSize: '16px', fontWeight: '500' }}>
                      {waybill.packageInfo.currency} {waybill.packageInfo.value.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Delivery Cost */}
          {delivery.cost && (
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                💰 Delivery Cost
              </h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>
                {delivery.cost.currency} {delivery.cost.amount.toLocaleString()}
              </p>
            </div>
          )}

          {/* Address Information */}
          <div className="card">
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              📍 Address Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>From</p>
                <p style={{ fontSize: '16px', fontWeight: '500' }}>
                  {waybill.senderType === 'self' ? 'Your Address' : 'Friend\'s Address (ZKP)'}
                </p>
                {waybill.senderType === 'friend' && (
                  <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                    🔐 Address protected by Zero-Knowledge Proof
                  </p>
                )}
              </div>
              <div>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>To</p>
                <p style={{ fontSize: '16px', fontWeight: '500' }}>
                  {waybill.receiverType === 'self' ? 'Your Address' : 'Friend\'s Address (ZKP)'}
                </p>
                {waybill.receiverType === 'friend' && (
                  <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                    🔐 Address protected by Zero-Knowledge Proof
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* QR Code */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              QR Code for VeyPOS
            </h3>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-block', padding: '16px', background: 'white', borderRadius: '8px' }}>
                <QRCodeSVG
                  value={waybill.qrCode}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p style={{ marginTop: '12px', fontSize: '14px', color: '#6b7280' }}>
                Scan this at VeyPOS for pickup
              </p>
            </div>
          </div>

          {/* Wallet Integration */}
          <div className="card">
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              💳 Add to Wallet
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
              Save this waybill to your mobile wallet for easy access
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Google Wallet */}
              <button
                onClick={() => handleGenerateWalletPass('google')}
                disabled={generatingWallet === 'google'}
                className="btn btn-primary"
                style={{
                  background: walletPasses.google ? '#10b981' : '#4285f4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {generatingWallet === 'google' ? (
                  <>⏳ Generating...</>
                ) : walletPasses.google ? (
                  <>✅ Added to Google Wallet</>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                      <path d="M21.8 10.5H21V10H12v4h5.7c-.8 2.4-3.1 4-5.7 4-3.3 0-6-2.7-6-6s2.7-6 6-6c1.5 0 2.9.6 4 1.5L18.7 4c-1.8-1.7-4.2-2.7-6.7-2.7-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10c0-.7-.1-1.3-.2-2z"/>
                    </svg>
                    Add to Google Wallet
                  </>
                )}
              </button>

              {/* Apple Wallet */}
              <button
                onClick={() => handleGenerateWalletPass('apple')}
                disabled={generatingWallet === 'apple'}
                className="btn"
                style={{
                  background: walletPasses.apple ? '#10b981' : '#000000',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {generatingWallet === 'apple' ? (
                  <>⏳ Generating...</>
                ) : walletPasses.apple ? (
                  <>✅ Added to Apple Wallet</>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    Add to Apple Wallet
                  </>
                )}
              </button>
            </div>

            {(walletPasses.google || walletPasses.apple) && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: '#dcfce7',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#166534',
              }}>
                ✅ Wallet pass created successfully! You can now access this waybill from your mobile wallet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tracking History */}
      <div className="card" style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          📊 Tracking History
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}>
              📋
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '16px', fontWeight: '500' }}>Waybill Created</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                {waybill.createdAt.toLocaleString()}
              </p>
            </div>
          </div>

          {delivery.pickupScheduled && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}>
                📅
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '16px', fontWeight: '500' }}>Pickup Scheduled</p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  {delivery.pickupScheduled.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {delivery.status === 'in_transit' && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#e0e7ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}>
                🚚
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '16px', fontWeight: '500' }}>In Transit</p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  Package is on the way
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
