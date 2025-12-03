/**
 * Comparison API
 * Compare carriers, services, and prices
 */

import { APIResponse, Carrier, ServiceLevel, Money, Address } from '../types';

export interface ComparisonRequest {
  origin: Address;
  destination: Address;
  package: {
    weight: number;
    dimensions: { length: number; width: number; height: number };
    value: number;
  };
  requirements?: {
    maxDeliveryDays?: number;
    insurance?: boolean;
    signature?: boolean;
    tracking?: boolean;
  };
}

export interface CarrierQuote {
  carrier: Carrier;
  service: ServiceLevel;
  price: Money;
  deliveryDays: number;
  estimatedDelivery: Date;
  features: string[];
  rating: number; // 0-5
  carbonFootprint?: number; // kg CO2
}

export interface ComparisonResult {
  quotes: CarrierQuote[];
  recommendations: {
    cheapest: CarrierQuote;
    fastest: CarrierQuote;
    bestValue: CarrierQuote;
    greenest?: CarrierQuote;
  };
}

export class ComparisonAPI {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Compare all available carriers and services
   */
  async compareCarriers(request: ComparisonRequest): Promise<APIResponse<ComparisonResult>> {
    const response = await fetch(`${this.baseUrl}/compare`, {
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
   * Compare specific carriers
   */
  async compareSpecificCarriers(
    request: ComparisonRequest,
    carrierIds: string[]
  ): Promise<APIResponse<ComparisonResult>> {
    const response = await fetch(`${this.baseUrl}/compare/specific`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...request, carrierIds }),
    });
    return response.json();
  }

  /**
   * Get carrier performance metrics
   */
  async getCarrierPerformance(carrierId: string): Promise<APIResponse<{
    rating: number;
    onTimeDelivery: number;
    customerSatisfaction: number;
    claimRate: number;
    averageDeliveryTime: number;
  }>> {
    const response = await fetch(`${this.baseUrl}/compare/carrier/${carrierId}/performance`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }
}
