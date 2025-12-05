'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AddressForm from '../../components/AddressForm';
import type { CreateAddressRequest } from '../../../src/types';

export default function NewAddressPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateAddressRequest) => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      console.log('Creating address:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Address created successfully!');
      router.push('/addresses');
    } catch (error) {
      console.error('Error creating address:', error);
      alert('Failed to create address. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/addresses');
  };

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <div className="mb-6">
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          Add New Address
        </h1>
        <p style={{ color: '#6b7280' }}>
          Enter your address in native language or English. We support all 257 countries worldwide.
        </p>
      </div>

      <AddressForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
