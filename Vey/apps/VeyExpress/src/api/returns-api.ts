/**
 * Returns API
 * Manage returns and reverse logistics
 */

import { APIResponse, Address, DeliveryOrder } from '../types';

export interface ReturnRequest {
  originalOrderId: string;
  reason: string;
  items: ReturnItem[];
  pickupAddress?: Address;
  returnMethod: 'pickup' | 'dropoff' | 'mail';
  refundMethod?: 'original' | 'credit' | 'exchange';
}

export interface ReturnItem {
  sku: string;
  quantity: number;
  condition: 'unopened' | 'opened' | 'defective' | 'damaged';
  photos?: string[];
}

export interface ReturnLabel {
  returnId: string;
  trackingNumber: string;
  qrCode: string;
  pdfUrl: string;
  expiresAt: Date;
}

export class ReturnsAPI {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Create a return request
   */
  async createReturn(request: ReturnRequest): Promise<APIResponse<{ returnId: string }>> {
    const response = await fetch(`${this.baseUrl}/returns`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  /**
   * Generate return label
   */
  async generateReturnLabel(returnId: string): Promise<APIResponse<ReturnLabel>> {
    const response = await fetch(`${this.baseUrl}/returns/${returnId}/label`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }

  /**
   * Track return shipment
   */
  async trackReturn(returnId: string): Promise<APIResponse<DeliveryOrder>> {
    const response = await fetch(`${this.baseUrl}/returns/${returnId}/track`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }

  /**
   * Get return status
   */
  async getReturnStatus(returnId: string): Promise<APIResponse<{
    status: 'pending' | 'label_generated' | 'in_transit' | 'received' | 'processed' | 'refunded';
    refundAmount?: number;
    refundDate?: Date;
  }>> {
    const response = await fetch(`${this.baseUrl}/returns/${returnId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }
}
