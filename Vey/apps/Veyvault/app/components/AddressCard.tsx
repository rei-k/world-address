'use client';

import Link from 'next/link';
import type { Address } from '../../src/types';

interface AddressCardProps {
  address: Address;
  onDelete: (id: string) => void;
  onSetPrimary: (id: string) => void;
  onSetDefault?: (id: string) => void;
}

export default function AddressCard({
  address,
  onDelete,
  onSetPrimary,
  onSetDefault,
}: AddressCardProps) {
  return (
    <div className="card">
      <div className="flex-between mb-4">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>
              {address.type === 'home' && '🏠'}
              {address.type === 'work' && '🏢'}
              {address.type === 'other' && '📍'}
              {' '}
              {address.label || address.type.charAt(0).toUpperCase() + address.type.slice(1)}
            </h3>
            {address.isPrimary && (
              <span style={{
                background: '#dbeafe',
                color: '#1e40af',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
              }}>
                Primary
              </span>
            )}
            {address.isDefault && (
              <span style={{
                background: '#dcfce7',
                color: '#166534',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
              }}>
                ⭐ Default
              </span>
            )}
          </div>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            PID: {address.pid}
          </p>
        </div>
      </div>

      <div style={{ 
        background: '#f9fafb',
        padding: '12px',
        borderRadius: '6px',
        marginBottom: '16px',
        fontSize: '14px',
        color: '#374151',
      }}>
        <p>🔒 Encrypted address data</p>
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
          Your address is end-to-end encrypted and only you can view it
        </p>
      </div>

      <div className="flex gap-2">
        <Link href={`/addresses/edit/${address.id}`} className="btn btn-secondary">
          Edit
        </Link>
        <Link href={`/qr/${address.id}`} className="btn btn-secondary">
          QR/Barcode
        </Link>
        {!address.isPrimary && (
          <button
            onClick={() => onSetPrimary(address.id)}
            className="btn btn-secondary"
          >
            Set as Primary
          </button>
        )}
        {!address.isDefault && onSetDefault && (
          <button
            onClick={() => onSetDefault(address.id)}
            className="btn btn-secondary"
            title="Set as default for hotel check-ins, financial institutions, etc."
          >
            ⭐ Set as Default
          </button>
        )}
        <button
          onClick={() => onDelete(address.id)}
          className="btn btn-danger"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
