/**
 * VeyExpress API Module
 * Main exports for all API services
 */

export * from './tracking-api';
export * from './waybill-api';
export * from './eta-api';
export * from './route-api';
export * from './vehicle-tracking-api';
export * from './returns-api';
export * from './comparison-api';
export * from './insurance-api';

import { TrackingAPI } from './tracking-api';
import { WaybillAPI } from './waybill-api';
import { ETAAPI } from './eta-api';
import { RouteAPI } from './route-api';
import { VehicleTrackingAPI } from './vehicle-tracking-api';
import { ReturnsAPI } from './returns-api';
import { ComparisonAPI } from './comparison-api';
import { InsuranceAPI } from './insurance-api';

/**
 * VeyExpress API Client
 * Unified client for all VeyExpress APIs
 */
export class VeyExpressAPI {
  public tracking: TrackingAPI;
  public waybill: WaybillAPI;
  public eta: ETAAPI;
  public route: RouteAPI;
  public vehicleTracking: VehicleTrackingAPI;
  public returns: ReturnsAPI;
  public comparison: ComparisonAPI;
  public insurance: InsuranceAPI;

  constructor(
    apiKey: string,
    options?: {
      baseUrl?: string;
      environment?: 'sandbox' | 'production';
    }
  ) {
    const baseUrl = options?.baseUrl || 
      (options?.environment === 'production' 
        ? 'https://api.veyexpress.com/v1'
        : 'https://sandbox-api.veyexpress.com/v1');

    this.tracking = new TrackingAPI(baseUrl, apiKey);
    this.waybill = new WaybillAPI(baseUrl, apiKey);
    this.eta = new ETAAPI(baseUrl, apiKey);
    this.route = new RouteAPI(baseUrl, apiKey);
    this.vehicleTracking = new VehicleTrackingAPI(baseUrl, apiKey);
    this.returns = new ReturnsAPI(baseUrl, apiKey);
    this.comparison = new ComparisonAPI(baseUrl, apiKey);
    this.insurance = new InsuranceAPI(baseUrl, apiKey);
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      // Simple ping to check if API is accessible
      const response = await fetch(`${this.tracking['baseUrl']}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
