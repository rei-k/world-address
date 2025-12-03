/**
 * VeyExpress SDK
 * One-code SDK with Stripe-level ease of integration
 */

import { VeyExpressAPI } from '../api';
import { Address, DeliveryOrder, SDKConfig, ComparisonResult } from '../types';
import { AddressProtocolService } from '../services/address-protocol';
import { CarrierVerificationService } from '../services/carrier-verification';

export class VeyExpressSDK {
  private api: VeyExpressAPI;
  private addressService: AddressProtocolService;
  private verificationService: CarrierVerificationService;
  private config: SDKConfig;

  constructor(apiKey: string, options?: Partial<SDKConfig>) {
    this.config = {
      apiKey,
      environment: options?.environment || 'sandbox',
      version: '1.0.0',
      options: options?.options,
    };

    this.api = new VeyExpressAPI(apiKey, {
      environment: this.config.environment,
    });

    this.addressService = new AddressProtocolService();
    this.verificationService = new CarrierVerificationService();
  }

  async getShippingQuote(
    origin: Address,
    destination: Address,
    packageInfo: { weight: number; dimensions: { length: number; width: number; height: number }; value: number }
  ): Promise<ComparisonResult> {
    const result = await this.api.comparison.compareCarriers({ origin, destination, package: packageInfo });
    if (!result.success || !result.data) throw new Error(result.error?.message || 'Failed to get quotes');
    return result.data;
  }

  async trackShipment(trackingNumber: string): Promise<DeliveryOrder> {
    const result = await this.api.tracking.trackPackage(trackingNumber);
    if (!result.success || !result.data) throw new Error(result.error?.message || 'Failed to track shipment');
    return result.data;
  }

  async validateAddress(address: Address) {
    const validation = this.addressService.validateAddress(address);
    if (validation.valid) {
      const normalized = await this.addressService.normalizeAddress(address);
      return { valid: true, normalized, errors: [], warnings: validation.warnings };
    }
    return { valid: false, errors: validation.errors, warnings: validation.warnings };
  }

  getSupportedCountries(): string[] {
    return this.addressService.getSupportedCountries();
  }

  async testConnection(): Promise<boolean> {
    return this.api.testConnection();
  }
}

export function createVeyExpress(apiKey: string, environment?: 'sandbox' | 'production') {
  return new VeyExpressSDK(apiKey, { environment });
}

export default VeyExpressSDK;
