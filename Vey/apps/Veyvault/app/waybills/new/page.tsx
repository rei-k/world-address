'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Address, Friend, Carrier, Waybill } from '@/src/types';
import { createWaybill, getCarriers, submitDeliveryRequest, createGoogleWalletPass, createAppleWalletPass } from '@/src/services/waybill.service';
import { getFriends } from '@/src/services/friends.service';

export default function NewWaybillPage() {
  const router = useRouter();
  const [step, setStep] = useState<'select' | 'package' | 'carrier' | 'confirm'>('select');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);

  const [senderId, setSenderId] = useState('');
  const [senderType, setSenderType] = useState<'self' | 'friend'>('self');
  const [receiverId, setReceiverId] = useState('');
  const [receiverType, setReceiverType] = useState<'self' | 'friend'>('self');

  const [packageInfo, setPackageInfo] = useState({
    weight: '',
    length: '',
    width: '',
    height: '',
    description: '',
    value: '',
    currency: 'JPY',
  });

  const [selectedCarrier, setSelectedCarrier] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [pickupDate, setPickupDate] = useState('');

  const [createdWaybill, setCreatedWaybill] = useState<Waybill | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const userId = 'current-user-id';
      
      const [friendsList, carriersList] = await Promise.all([
        getFriends(userId),
        getCarriers(),
      ]);

      setFriends(friendsList.filter(f => f.status === 'accepted' && f.canSendTo));
      setCarriers(carriersList);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateWaybill() {
    try {
      const userId = 'current-user-id';
      
      const waybill = await createWaybill({
        senderId,
        receiverId,
        senderType,
        receiverType,
        packageInfo: {
          weight: parseFloat(packageInfo.weight) || undefined,
          dimensions: packageInfo.length ? {
            length: parseFloat(packageInfo.length),
            width: parseFloat(packageInfo.width),
            height: parseFloat(packageInfo.height),
          } : undefined,
          description: packageInfo.description || undefined,
          value: parseFloat(packageInfo.value) || undefined,
          currency: packageInfo.currency,
        },
      }, userId);

      setCreatedWaybill(waybill);
      setStep('carrier');
    } catch (error) {
      console.error('Failed to create waybill:', error);
      alert('Failed to create waybill');
    }
  }

  async function handleSubmitDelivery() {
    if (!createdWaybill) return;

    try {
      const userId = 'current-user-id';
      
      await submitDeliveryRequest({
        waybillId: createdWaybill.id,
        carrierId: selectedCarrier,
        carrierServiceId: selectedService,
        pickupDate: pickupDate ? new Date(pickupDate) : undefined,
      }, userId);

      router.push('/waybills');
    } catch (error) {
      console.error('Failed to submit delivery:', error);
      alert('Failed to submit delivery request');
    }
  }

  async function handleSaveToWallet(type: 'google' | 'apple') {
    if (!createdWaybill) return;

    try {
      const userId = 'current-user-id';
      
      const pass = type === 'google'
        ? await createGoogleWalletPass(createdWaybill.id, userId)
        : await createAppleWalletPass(createdWaybill.id, userId);

      window.open(pass.passUrl, '_blank');
    } catch (error) {
      console.error(`Failed to create ${type} wallet pass:`, error);
      alert(`Failed to create ${type} wallet pass`);
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '40px', textAlign: 'center' }}>
        <p style={{ color: '#6b7280' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '32px' }}>
        Create Waybill
      </h1>

      <div style={{ marginBottom: '32px', display: 'flex', gap: '12px' }}>
        {['select', 'package', 'carrier', 'confirm'].map((s, i) => (
          <div
            key={s}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: step === s ? '#3b82f6' : '#e5e7eb',
              color: step === s ? 'white' : '#6b7280',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
          </div>
        ))}
      </div>

      {step === 'select' && (
        <div>
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              Select Sender
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="radio"
                  checked={senderType === 'self'}
                  onChange={() => setSenderType('self')}
                />
                <span>Send from my address</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="radio"
                  checked={senderType === 'friend'}
                  onChange={() => setSenderType('friend')}
                />
                <span>Send from friend's address (privacy protected)</span>
              </label>
            </div>
            {senderType === 'friend' && friends.length === 0 && (
              <p style={{ color: '#dc2626', fontSize: '14px' }}>
                You don't have any friends yet. Please add friends first.
              </p>
            )}
            {senderType === 'friend' && friends.length > 0 && (
              <select
                value={senderId}
                onChange={(e) => setSenderId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                }}
              >
                <option value="">Select a friend</option>
                {friends.map((friend) => (
                  <option key={friend.id} value={friend.friendId}>
                    {friend.friendName} (🔐 Privacy protected)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              Select Receiver
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="radio"
                  checked={receiverType === 'self'}
                  onChange={() => setReceiverType('self')}
                />
                <span>Send to my address</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="radio"
                  checked={receiverType === 'friend'}
                  onChange={() => setReceiverType('friend')}
                />
                <span>Send to friend's address (privacy protected)</span>
              </label>
            </div>
            {receiverType === 'friend' && friends.length === 0 && (
              <p style={{ color: '#dc2626', fontSize: '14px' }}>
                You don't have any friends yet. Please add friends first.
              </p>
            )}
            {receiverType === 'friend' && friends.length > 0 && (
              <select
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                }}
              >
                <option value="">Select a friend</option>
                {friends.map((friend) => (
                  <option key={friend.id} value={friend.friendId}>
                    {friend.friendName} (🔐 Privacy protected)
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            onClick={() => setStep('package')}
            disabled={!senderId && !receiverId}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Next: Package Info
          </button>
        </div>
      )}

      {step === 'package' && (
        <div>
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              Package Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={packageInfo.weight}
                  onChange={(e) => setPackageInfo({ ...packageInfo, weight: e.target.value })}
                  placeholder="1.5"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                    Length (cm)
                  </label>
                  <input
                    type="number"
                    value={packageInfo.length}
                    onChange={(e) => setPackageInfo({ ...packageInfo, length: e.target.value })}
                    placeholder="30"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                    Width (cm)
                  </label>
                  <input
                    type="number"
                    value={packageInfo.width}
                    onChange={(e) => setPackageInfo({ ...packageInfo, width: e.target.value })}
                    placeholder="20"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={packageInfo.height}
                    onChange={(e) => setPackageInfo({ ...packageInfo, height: e.target.value })}
                    placeholder="10"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Description
                </label>
                <textarea
                  value={packageInfo.description}
                  onChange={(e) => setPackageInfo({ ...packageInfo, description: e.target.value })}
                  placeholder="Books, clothing, etc."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    resize: 'vertical',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Declared Value
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    value={packageInfo.value}
                    onChange={(e) => setPackageInfo({ ...packageInfo, value: e.target.value })}
                    placeholder="10000"
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                    }}
                  />
                  <select
                    value={packageInfo.currency}
                    onChange={(e) => setPackageInfo({ ...packageInfo, currency: e.target.value })}
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                    }}
                  >
                    <option value="JPY">JPY</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setStep('select')}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Back
            </button>
            <button
              onClick={handleCreateWaybill}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              Create Waybill & Continue
            </button>
          </div>
        </div>
      )}

      {step === 'carrier' && createdWaybill && (
        <div>
          <div className="card" style={{ marginBottom: '24px', backgroundColor: '#f0fdf4' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#166534' }}>
              ✓ Waybill Created Successfully!
            </h3>
            <p style={{ fontSize: '14px', color: '#166534', marginBottom: '12px' }}>
              QR Code for VeyPOS: <code style={{ padding: '2px 6px', backgroundColor: '#dcfce7', borderRadius: '4px' }}>{createdWaybill.id.slice(0, 12)}</code>
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleSaveToWallet('google')}
                className="btn btn-secondary"
                style={{ fontSize: '14px', padding: '8px 16px' }}
              >
                💳 Save to Google Wallet
              </button>
              <button
                onClick={() => handleSaveToWallet('apple')}
                className="btn btn-secondary"
                style={{ fontSize: '14px', padding: '8px 16px' }}
              >
                💳 Save to Apple Wallet
              </button>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              Select Carrier
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {carriers.map((carrier) => (
                <div
                  key={carrier.id}
                  className="card"
                  style={{
                    cursor: 'pointer',
                    border: selectedCarrier === carrier.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  }}
                  onClick={() => setSelectedCarrier(carrier.id)}
                >
                  <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                    {carrier.name}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {carrier.services.map((service) => (
                      <label
                        key={service.id}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
                      >
                        <input
                          type="radio"
                          name="service"
                          checked={selectedService === service.id}
                          onChange={() => {
                            setSelectedCarrier(carrier.id);
                            setSelectedService(service.id);
                          }}
                        />
                        <span>
                          {service.name} - {service.estimatedDays} days
                          {service.price && ` (${service.price.currency} ${service.price.amount})`}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              Pickup Date (Optional)
            </label>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => router.push('/waybills')}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Skip & Save Draft
            </button>
            <button
              onClick={handleSubmitDelivery}
              disabled={!selectedCarrier || !selectedService}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              Submit to Carrier
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
