'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AddressCard from '../../components/AddressCard';
import type { Address } from '../../../src/types';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    // Mock data for now
    const mockAddresses: Address[] = [];
    setAddresses(mockAddresses);
    setLoading(false);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      // TODO: API call to delete
      setAddresses(addresses.filter(addr => addr.id !== id));
      alert('Address deleted successfully');
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address');
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      // TODO: API call to set primary
      setAddresses(addresses.map(addr => ({
        ...addr,
        isPrimary: addr.id === id
      })));
      alert('Primary address updated');
    } catch (error) {
      console.error('Error setting primary:', error);
      alert('Failed to update primary address');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '40px' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <div className="flex-between mb-6">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
            Address Book
          </h1>
          <p style={{ color: '#6b7280' }}>
            Manage your addresses from all countries
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/" className="btn btn-secondary">
            ← Back
          </Link>
          <Link href="/addresses/new" className="btn btn-primary">
            + Add New Address
          </Link>
        </div>
      </div>

      {addresses.length === 0 ? (
        <div className="card text-center" style={{ padding: '60px 40px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>
            No addresses yet
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Get started by adding your first address. We support all 257 countries worldwide.
          </p>
          <Link href="/addresses/new" className="btn btn-primary">
            Add Your First Address
          </Link>
        </div>
      ) : (
        <div className="grid">
          {addresses.map(address => (
            <AddressCard
              key={address.id}
              address={address}
              onDelete={handleDelete}
              onSetPrimary={handleSetPrimary}
            />
          ))}
        </div>
      )}

      <div className="card" style={{ marginTop: '40px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
          💡 Tips
        </h3>
        <ul style={{ listStyle: 'disc', paddingLeft: '24px', color: '#6b7280' }}>
          <li style={{ marginBottom: '8px' }}>
            You can add addresses in both native language and English
          </li>
          <li style={{ marginBottom: '8px' }}>
            Postal codes are automatically validated for each country
          </li>
          <li style={{ marginBottom: '8px' }}>
            Generate QR codes for your addresses to share securely
          </li>
          <li>
            Set a primary address for quick checkout on e-commerce sites
          </li>
        </ul>
      </div>
    </div>
  );
}
