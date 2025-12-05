'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import AddressCard from '../components/AddressCard';
import type { Address } from '../../src/types';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'home' | 'work' | 'other'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'type' | 'label'>('recent');

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

  const handleSetDefault = async (id: string) => {
    try {
      // TODO: API call to set default
      setAddresses(addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === id
      })));
      alert('Default address updated. This address will be used for hotel check-ins, financial institutions, etc.');
    } catch (error) {
      console.error('Error setting default:', error);
      alert('Failed to update default address');
    }
  };

  // Filter and sort addresses
  const filteredAndSortedAddresses = useMemo(() => {
    let result = addresses;

    // Apply type filter
    if (filterType !== 'all') {
      result = result.filter(addr => addr.type === filterType);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(addr =>
        addr.pid.toLowerCase().includes(query) ||
        addr.label?.toLowerCase().includes(query) ||
        addr.type.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        case 'type':
          return a.type.localeCompare(b.type);
        case 'label':
          return (a.label || '').localeCompare(b.label || '');
        default:
          return 0;
      }
    });

    return result;
  }, [addresses, filterType, searchQuery, sortBy]);

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
            Manage your addresses from all 257 countries
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
        <>
          {/* Search and Filters */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {/* Search Input */}
              <div style={{ flex: '1 1 300px' }}>
                <input
                  type="text"
                  placeholder="🔍 Search by PID, label, or type..."
                  className="form-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Type Filter */}
              <div style={{ flex: '0 0 150px' }}>
                <select
                  className="form-select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  style={{ width: '100%' }}
                >
                  <option value="all">All Types</option>
                  <option value="home">🏠 Home</option>
                  <option value="work">🏢 Work</option>
                  <option value="other">📍 Other</option>
                </select>
              </div>

              {/* Sort By */}
              <div style={{ flex: '0 0 150px' }}>
                <select
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  style={{ width: '100%' }}
                >
                  <option value="recent">Recent</option>
                  <option value="type">Type</option>
                  <option value="label">Label</option>
                </select>
              </div>
            </div>

            {/* Filter Summary */}
            <div style={{ marginTop: '12px', fontSize: '14px', color: '#6b7280' }}>
              Showing {filteredAndSortedAddresses.length} of {addresses.length} addresses
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          </div>

          {/* Address List */}
          {filteredAndSortedAddresses.length === 0 ? (
            <div className="card text-center" style={{ padding: '60px 40px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>
                No matching addresses
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                Try adjusting your search or filters
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                }}
                className="btn btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid">
              {filteredAndSortedAddresses.map(address => (
                <AddressCard
                  key={address.id}
                  address={address}
                  onDelete={handleDelete}
                  onSetPrimary={handleSetPrimary}
                  onSetDefault={handleSetDefault}
                />
              ))}
            </div>
          )}
        </>
      )}

      <div className="card" style={{ marginTop: '40px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
          💡 Tips
        </h3>
        <ul style={{ listStyle: 'disc', paddingLeft: '24px', color: '#6b7280' }}>
          <li style={{ marginBottom: '8px' }}>
            Use search to quickly find addresses by PID, label, or type
          </li>
          <li style={{ marginBottom: '8px' }}>
            Filter addresses by type (Home, Work, Other) for easier management
          </li>
          <li style={{ marginBottom: '8px' }}>
            Sort by recent, type, or label to organize your addresses
          </li>
          <li style={{ marginBottom: '8px' }}>
            Generate QR codes and barcodes for your addresses to share securely
          </li>
          <li style={{ marginBottom: '8px' }}>
            Set a primary address for quick checkout on e-commerce sites
          </li>
          <li>
            ⭐ Set a default address to auto-fill your information for hotel check-ins, financial institutions, etc.
          </li>
        </ul>
      </div>
    </div>
  );
}
