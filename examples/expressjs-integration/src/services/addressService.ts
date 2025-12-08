import { Address } from '../types/index.js';
import { triggerWebhook } from './webhookService.js';

// In-memory storage (replace with database in production)
const addresses: Map<string, Address> = new Map();
let idCounter = 1;

/**
 * Generate a unique ID for addresses
 */
function generateId(): string {
  return `addr_${idCounter++}`;
}

/**
 * Get all addresses
 */
export function getAllAddresses(): Address[] {
  return Array.from(addresses.values());
}

/**
 * Get address by ID
 */
export function getAddressById(id: string): Address | undefined {
  return addresses.get(id);
}

/**
 * Create a new address
 */
export async function createAddress(addressData: Omit<Address, 'id' | 'created_at' | 'updated_at'>): Promise<Address> {
  const id = generateId();
  const now = new Date();
  
  const address: Address = {
    ...addressData,
    id,
    created_at: now,
    updated_at: now
  };

  addresses.set(id, address);

  // Trigger webhook
  await triggerWebhook('address.created', address);

  return address;
}

/**
 * Update an address
 */
export async function updateAddress(id: string, updates: Partial<Address>): Promise<Address | null> {
  const address = addresses.get(id);
  
  if (!address) {
    return null;
  }

  const updatedAddress: Address = {
    ...address,
    ...updates,
    id, // Ensure ID cannot be changed
    created_at: address.created_at, // Preserve creation time
    updated_at: new Date()
  };

  addresses.set(id, updatedAddress);

  // Trigger webhook
  await triggerWebhook('address.updated', updatedAddress);

  return updatedAddress;
}

/**
 * Delete an address
 */
export async function deleteAddress(id: string): Promise<boolean> {
  const address = addresses.get(id);
  
  if (!address) {
    return false;
  }

  addresses.delete(id);

  // Trigger webhook
  await triggerWebhook('address.deleted', address);

  return true;
}

/**
 * Search addresses (simple implementation)
 */
export function searchAddresses(query: string): Address[] {
  const lowerQuery = query.toLowerCase();
  
  return Array.from(addresses.values()).filter(address => {
    return (
      address.country?.toLowerCase().includes(lowerQuery) ||
      address.city?.toLowerCase().includes(lowerQuery) ||
      address.province?.toLowerCase().includes(lowerQuery) ||
      address.street_address?.toLowerCase().includes(lowerQuery) ||
      address.recipient?.toLowerCase().includes(lowerQuery)
    );
  });
}
