'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { DeliveryRequest } from '@/src/types';
import { getDeliveryHistory } from '@/src/services/waybill.service';

export default function WaybillsPage() {
  const [deliveries, setDeliveries] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'in_transit' | 'delivered'>('all');

  useEffect(() => {
    loadDeliveries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function loadDeliveries() {
    try {
      setLoading(true);
      const userId = 'current-user-id';
      const filterStatus = filter === 'all' ? undefined : filter;
      const history = await getDeliveryHistory(userId, { status: filterStatus });
      setDeliveries(history);
    } catch (error) {
      console.error('Failed to load deliveries:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
            📦 Delivery Management
          </h1>
          <p style={{ color: '#6b7280' }}>
            Create and track your deliveries
          </p>
        </div>
        <Link href="/waybills/new" className="btn btn-primary">
          ➕ Create Waybill
        </Link>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setFilter('all')}
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: '14px' }}
        >
          All
        </button>
        <button
          onClick={() => setFilter('new')}
          className={`btn ${filter === 'new' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: '14px' }}
        >
          📋 New
        </button>
        <button
          onClick={() => setFilter('in_transit')}
          className={`btn ${filter === 'in_transit' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: '14px' }}
        >
          🚚 In Transit
        </button>
        <button
          onClick={() => setFilter('delivered')}
          className={`btn ${filter === 'delivered' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: '14px' }}
        >
          ✅ Delivered
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#6b7280' }}>Loading deliveries...</p>
        </div>
      ) : deliveries.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>📦</p>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            No deliveries yet
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Create your first waybill to start tracking deliveries
          </p>
          <Link href="/waybills/new" className="btn btn-primary">
            Create Waybill
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {deliveries.map((delivery) => (
            <div key={delivery.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600' }}>
                      {delivery.trackingNumber || `Waybill #${delivery.waybillId.slice(0, 8)}`}
                    </h3>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: statusColors[delivery.status]?.bg || '#f3f4f6',
                        color: statusColors[delivery.status]?.text || '#6b7280',
                      }}
                    >
                      {getStatusEmoji(delivery.status)} {delivery.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                    <p>Carrier: {delivery.carrierId}</p>
                    {delivery.estimatedDelivery && (
                      <p>
                        Est. Delivery: {new Date(delivery.estimatedDelivery).toLocaleDateString()}
                      </p>
                    )}
                    {delivery.actualDelivery && (
                      <p>
                        Delivered: {new Date(delivery.actualDelivery).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {delivery.cost && (
                    <p style={{ fontSize: '14px', fontWeight: '500' }}>
                      Cost: {delivery.cost.currency} {delivery.cost.amount.toFixed(2)}
                    </p>
                  )}
                </div>
                <Link
                  href={`/waybills/${delivery.id}`}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
