/**
 * Tracking API
 * Real-time package tracking across all carriers
 */

import {
  DeliveryOrder,
  APIResponse,
  DeliveryEvent,
  GeoCoordinates,
} from '../types';

export class TrackingAPI {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Track a package by tracking number
   */
  async trackPackage(trackingNumber: string): Promise<APIResponse<DeliveryOrder>> {
    const response = await fetch(`${this.baseUrl}/tracking/${trackingNumber}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }

  /**
   * Track multiple packages
   */
  async trackMultiplePackages(trackingNumbers: string[]): Promise<APIResponse<DeliveryOrder[]>> {
    const response = await fetch(`${this.baseUrl}/tracking/bulk`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ trackingNumbers }),
    });
    return response.json();
  }

  /**
   * Get real-time location of a package
   */
  async getPackageLocation(trackingNumber: string): Promise<APIResponse<GeoCoordinates>> {
    const response = await fetch(`${this.baseUrl}/tracking/${trackingNumber}/location`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }

  /**
   * Get delivery events history
   */
  async getDeliveryEvents(trackingNumber: string): Promise<APIResponse<DeliveryEvent[]>> {
    const response = await fetch(`${this.baseUrl}/tracking/${trackingNumber}/events`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }

  /**
   * Subscribe to tracking updates via webhook
   */
  async subscribeToUpdates(
    trackingNumber: string,
    webhookUrl: string
  ): Promise<APIResponse<{ subscriptionId: string }>> {
    const response = await fetch(`${this.baseUrl}/tracking/${trackingNumber}/subscribe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ webhookUrl }),
    });
    return response.json();
  }
}
