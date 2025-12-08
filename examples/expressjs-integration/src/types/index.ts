/**
 * TypeScript type definitions for the Express.js integration
 */

export interface Address {
  id?: string;
  country: string;
  postal_code?: string;
  province?: string;
  city?: string;
  street_address?: string;
  recipient?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Webhook {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  created_at: Date;
  active: boolean;
}

export type WebhookEvent = 'address.created' | 'address.updated' | 'address.deleted';

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Address;
}

export interface AuthUser {
  id: string;
  username: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: string;
}
