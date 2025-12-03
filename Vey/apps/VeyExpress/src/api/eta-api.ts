/**
 * ETA (Estimated Time of Arrival) API
 * Predict delivery times using AI
 */

import { APIResponse, GeoCoordinates, RiskScore } from '../types';

export interface ETARequest {
  origin: GeoCoordinates;
  destination: GeoCoordinates;
  carrierId: string;
  serviceId: string;
  packageWeight?: number;
  scheduledPickup?: Date;
}

export interface ETAPrediction {
  estimatedDelivery: Date;
  confidence: number; // 0-100
  alternativeEstimates: {
    optimistic: Date;
    pessimistic: Date;
  };
  factors: ETAFactor[];
  riskScore?: RiskScore;
}

export interface ETAFactor {
  type: 'weather' | 'traffic' | 'holidays' | 'carrier_performance' | 'distance' | 'customs';
  impact: number; // hours
  description: string;
}

export class ETAAPI {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Get ETA prediction for a delivery
   */
  async getETA(request: ETARequest): Promise<APIResponse<ETAPrediction>> {
    const response = await fetch(`${this.baseUrl}/eta/predict`, {
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
   * Get ETA for existing tracking number
   */
  async getETAByTracking(trackingNumber: string): Promise<APIResponse<ETAPrediction>> {
    const response = await fetch(`${this.baseUrl}/eta/tracking/${trackingNumber}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }

  /**
   * Update ETA based on real-time data
   */
  async refreshETA(trackingNumber: string): Promise<APIResponse<ETAPrediction>> {
    const response = await fetch(`${this.baseUrl}/eta/tracking/${trackingNumber}/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }
}
