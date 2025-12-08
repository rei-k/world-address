/**
 * TypeScript type definitions for Next.js app
 */

export interface Address {
  id?: string;
  country: string;
  postal_code?: string;
  province?: string;
  city?: string;
  street_address?: string;
  recipient?: string;
  userId?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Webhook {
  id: string;
  url: string;
  events: WebhookEvent[];
  userId: string;
  created_at: Date;
  active: boolean;
}

export type WebhookEvent = 'address.created' | 'address.updated' | 'address.deleted';

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Address;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  address?: Address;
}
