/**
 * Base Carrier Adapter Interface
 */

import {
  Shipment,
  ValidationResult,
  PickupOrder,
  OrderResult,
  TrackingInfo,
  CancelResult,
  CarrierConfig
} from '../types';

export abstract class CarrierAdapter {
  protected config: CarrierConfig;
  protected baseUrl: string;

  constructor(config: CarrierConfig) {
    this.config = config;
    this.baseUrl = this.getBaseUrl();
  }

  /**
   * Get API base URL based on environment
   */
  protected abstract getBaseUrl(): string;

  /**
   * Validate shipment before creating order
   */
  abstract validateShipment(shipment: Shipment): Promise<ValidationResult>;

  /**
   * Create pickup order
   */
  abstract createPickupOrder(order: PickupOrder): Promise<OrderResult>;

  /**
   * Track shipment by waybill number
   */
  abstract trackShipment(waybillNumber: string): Promise<TrackingInfo>;

  /**
   * Cancel order
   */
  abstract cancelOrder(waybillNumber: string, reason?: string): Promise<CancelResult>;

  /**
   * Get quote/estimate for shipment
   */
  abstract getQuote(shipment: Shipment): Promise<{
    amount: number;
    currency: string;
    estimatedDays: number;
  }>;

  /**
   * Make authenticated API request
   */
  protected abstract makeRequest(
    endpoint: string,
    method: string,
    data?: any
  ): Promise<any>;

  /**
   * Generate request signature
   */
  protected abstract generateSignature(data: any): string;
}
