import { Address, WebhookEvent, WebhookPayload } from '@/types';

// In-memory storage (replace with database in production)
const addresses: Map<string, Address> = new Map();
const webhooks: Map<string, { url: string; events: WebhookEvent[]; userId: string; secret: string }> = new Map();

let addressIdCounter = 1;
let webhookIdCounter = 1;

/**
 * Address Service
 */
export const addressService = {
  getAll: (userId: string): Address[] => {
    return Array.from(addresses.values()).filter(addr => addr.userId === userId);
  },

  getById: (id: string, userId: string): Address | undefined => {
    const address = addresses.get(id);
    return address && address.userId === userId ? address : undefined;
  },

  create: async (data: Omit<Address, 'id' | 'created_at' | 'updated_at'>, userId: string): Promise<Address> => {
    const id = `addr_${addressIdCounter++}`;
    const now = new Date();
    
    const address: Address = {
      ...data,
      id,
      userId,
      created_at: now,
      updated_at: now
    };

    addresses.set(id, address);
    await webhookService.trigger('address.created', address, userId);
    
    return address;
  },

  update: async (id: string, updates: Partial<Address>, userId: string): Promise<Address | null> => {
    const address = addresses.get(id);
    
    if (!address || address.userId !== userId) {
      return null;
    }

    const updatedAddress: Address = {
      ...address,
      ...updates,
      id,
      userId,
      created_at: address.created_at,
      updated_at: new Date()
    };

    addresses.set(id, updatedAddress);
    await webhookService.trigger('address.updated', updatedAddress, userId);
    
    return updatedAddress;
  },

  delete: async (id: string, userId: string): Promise<boolean> => {
    const address = addresses.get(id);
    
    if (!address || address.userId !== userId) {
      return false;
    }

    addresses.delete(id);
    await webhookService.trigger('address.deleted', address, userId);
    
    return true;
  }
};

/**
 * Webhook Service
 */
export const webhookService = {
  register: (url: string, events: WebhookEvent[], userId: string, secret: string): { id: string } => {
    const id = `webhook_${webhookIdCounter++}`;
    webhooks.set(id, { url, events, userId, secret });
    return { id };
  },

  getAll: (userId: string) => {
    return Array.from(webhooks.entries())
      .filter(([_, webhook]) => webhook.userId === userId)
      .map(([id, webhook]) => ({ id, url: webhook.url, events: webhook.events }));
  },

  delete: (id: string, userId: string): boolean => {
    const webhook = webhooks.get(id);
    if (!webhook || webhook.userId !== userId) {
      return false;
    }
    return webhooks.delete(id);
  },

  trigger: async (event: WebhookEvent, data: Address, userId: string): Promise<void> => {
    const userWebhooks = Array.from(webhooks.entries())
      .filter(([_, webhook]) => webhook.userId === userId && webhook.events.includes(event));

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data
    };

    // Send webhooks in parallel
    await Promise.allSettled(
      userWebhooks.map(([_, webhook]) =>
        fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Event': event,
            'X-Webhook-Timestamp': payload.timestamp
          },
          body: JSON.stringify(payload)
        }).catch(err => console.error('Webhook delivery failed:', err))
      )
    );
  }
};

/**
 * Validation Service
 */
export async function validateAddress(address: Partial<Address>): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  if (!address.country) {
    errors.push('Country is required');
  }

  // In a real implementation, you would use @vey/core for country-specific validation
  // Example:
  // import { validateAddress as veyValidate, getCountryFormat } from '@vey/core';
  // const format = await getCountryFormat(address.country);
  // const result = veyValidate(address, format);

  return {
    valid: errors.length === 0,
    errors
  };
}
