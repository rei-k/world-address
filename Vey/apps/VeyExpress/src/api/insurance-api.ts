/**
 * Insurance API
 * Manage shipping insurance and claims
 */

import { APIResponse, Insurance, InsuranceClaim, Money } from '../types';

export interface InsuranceQuoteRequest {
  orderId: string;
  declaredValue: Money;
  coverageType: 'basic' | 'standard' | 'premium';
  origin: string; // country code
  destination: string; // country code
}

export interface InsuranceQuote {
  premium: Money;
  coverage: Money;
  deductible?: Money;
  provider: string;
  terms: string;
  validUntil: Date;
}

export class InsuranceAPI {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Get insurance quote
   */
  async getQuote(request: InsuranceQuoteRequest): Promise<APIResponse<InsuranceQuote>> {
    const response = await fetch(`${this.baseUrl}/insurance/quote`, {
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
   * Purchase insurance
   */
  async purchaseInsurance(
    quoteId: string,
    orderId: string
  ): Promise<APIResponse<Insurance>> {
    const response = await fetch(`${this.baseUrl}/insurance/purchase`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quoteId, orderId }),
    });
    return response.json();
  }

  /**
   * File an insurance claim
   */
  async fileClaim(
    insuranceId: string,
    claim: {
      reason: string;
      amount: Money;
      description: string;
      evidence: string[]; // URLs to photos, documents
    }
  ): Promise<APIResponse<InsuranceClaim>> {
    const response = await fetch(`${this.baseUrl}/insurance/${insuranceId}/claim`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(claim),
    });
    return response.json();
  }

  /**
   * Get claim status
   */
  async getClaimStatus(claimId: string): Promise<APIResponse<InsuranceClaim>> {
    const response = await fetch(`${this.baseUrl}/insurance/claim/${claimId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }

  /**
   * Get insurance policy details
   */
  async getInsurance(insuranceId: string): Promise<APIResponse<Insurance>> {
    const response = await fetch(`${this.baseUrl}/insurance/${insuranceId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }
}
