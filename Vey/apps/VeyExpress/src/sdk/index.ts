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

  /**
   * Initialize VeyExpress SDK
   * @param apiKey - Your VeyExpress API key
   * @param options - Configuration options
   * @throws {Error} If API key is empty or invalid
   */
  constructor(apiKey: string, options?: Partial<SDKConfig>) {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('API key is required');
    }

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

  /**
   * Get shipping quotes from multiple carriers
   * @param origin - Origin address
   * @param destination - Destination address
   * @param packageInfo - Package details (weight, dimensions, value)
   * @returns Comparison result with quotes from different carriers
   * @throws {Error} If quote retrieval fails
   */
  async getShippingQuote(
    origin: Address,
    destination: Address,
    packageInfo: { weight: number; dimensions: { length: number; width: number; height: number }; value: number }
  ): Promise<ComparisonResult> {
    const result = await this.api.comparison.compareCarriers({ origin, destination, package: packageInfo });
    if (!result.success || !result.data) throw new Error(result.error?.message || 'Failed to get quotes');
    return result.data;
  }

  /**
   * Track a shipment by tracking number
   * @param trackingNumber - The tracking number to look up
   * @returns Delivery order with current status and tracking information
   * @throws {Error} If tracking fails
   */
  async trackShipment(trackingNumber: string): Promise<DeliveryOrder> {
    if (!trackingNumber || trackingNumber.trim() === '') {
      throw new Error('Tracking number is required');
    }
    const result = await this.api.tracking.trackPackage(trackingNumber);
    if (!result.success || !result.data) throw new Error(result.error?.message || 'Failed to track shipment');
    return result.data;
  }

  /**
   * Validate and normalize an address
   * @param address - Address to validate
   * @returns Validation result with normalized address if valid
   */
  async validateAddress(address: Address) {
    const validation = this.addressService.validateAddress(address);
    if (validation.valid) {
      const normalized = await this.addressService.normalizeAddress(address);
      return { valid: true, normalized, errors: [], warnings: validation.warnings };
    }
    return { valid: false, errors: validation.errors, warnings: validation.warnings };
  }

  /**
   * Get list of all supported countries
   * @returns Array of ISO 3166-1 alpha-2 country codes
   */
  getSupportedCountries(): string[] {
    return this.addressService.getSupportedCountries();
  }

  /**
   * Test connection to VeyExpress API
   * @returns True if connection is successful
   */
  async testConnection(): Promise<boolean> {
    try {
      return await this.api.testConnection();
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

/**
 * Create a VeyExpress SDK instance (convenience function)
 * @param apiKey - Your VeyExpress API key
 * @param environment - Environment to use (sandbox or production)
 * @returns VeyExpressSDK instance
 * @example
 * ```typescript
 * const vey = createVeyExpress('your-api-key', 'production');
 * const quotes = await vey.getShippingQuote(origin, destination, packageInfo);
 * ```
 */
export function createVeyExpress(apiKey: string, environment?: 'sandbox' | 'production') {
  return new VeyExpressSDK(apiKey, { environment });
}

export default VeyExpressSDK;
