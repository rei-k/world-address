/**
 * Shopify Plugin Generator
 * Auto-generates Shopify App Store ready plugin from VeyExpress SDK
 */

import { VeyExpressSDK } from '../index';

/**
 * Shopify App Configuration
 */
export interface ShopifyAppConfig {
  apiKey: string;
  apiSecret: string;
  scopes: string[];
  redirectUrl: string;
}

/**
 * Generate Shopify App Plugin
 * This creates a complete Shopify app with shipping integration
 */
export class ShopifyPluginGenerator {
  private sdk: VeyExpressSDK;
  private config: ShopifyAppConfig;

  constructor(veyExpressApiKey: string, shopifyConfig: ShopifyAppConfig) {
    this.sdk = new VeyExpressSDK(veyExpressApiKey, { environment: 'production' });
    this.config = shopifyConfig;
  }

  /**
   * Generate complete Shopify app structure
   */
  generateApp(): ShopifyAppManifest {
    return {
      name: 'VeyExpress Shipping',
      version: '1.0.0',
      description: 'Multi-carrier shipping integration with 254 country support',
      author: 'VeyExpress',
      features: [
        'Multi-carrier rate comparison',
        'Real-time tracking',
        'Address validation for 254 countries',
        'Shipping insurance',
        'Return label generation',
      ],
      endpoints: this.generateEndpoints(),
      webhooks: this.generateWebhooks(),
      settings: this.generateSettings(),
    };
  }

  /**
   * Generate Shopify carrier service configuration
   */
  generateCarrierService(): CarrierServiceConfig {
    return {
      name: 'VeyExpress',
      callback_url: `${this.config.redirectUrl}/shipping/rates`,
      service_discovery: true,
      format: 'json',
    };
  }

  /**
   * Generate shipping rates endpoint handler
   */
  async handleRatesRequest(request: ShopifyRatesRequest): Promise<ShopifyRatesResponse> {
    const quotes = await this.sdk.getShippingQuote(
      this.convertShopifyAddress(request.rate.origin),
      this.convertShopifyAddress(request.rate.destination),
      {
        weight: request.rate.items.reduce((sum, item) => sum + item.grams, 0) / 1000,
        dimensions: { length: 10, width: 10, height: 10 }, // Default dimensions
        value: request.rate.items.reduce((sum, item) => sum + item.price, 0),
      }
    );

    return {
      rates: quotes.quotes.map(quote => ({
        service_name: `${quote.carrier.name} - ${quote.service.name}`,
        service_code: quote.service.id,
        total_price: (quote.price.amount * 100).toString(), // Convert to cents
        currency: quote.price.currency,
        description: quote.features.join(', '),
        min_delivery_date: quote.estimatedDelivery.toISOString().split('T')[0],
        max_delivery_date: quote.estimatedDelivery.toISOString().split('T')[0],
      })),
    };
  }

  private generateEndpoints(): Record<string, string> {
    return {
      rates: '/shipping/rates',
      tracking: '/shipping/tracking',
      labels: '/shipping/labels',
      returns: '/shipping/returns',
    };
  }

  private generateWebhooks(): WebhookEndpoint[] {
    return [
      {
        topic: 'orders/create',
        address: `${this.config.redirectUrl}/webhooks/orders/create`,
      },
      {
        topic: 'fulfillments/create',
        address: `${this.config.redirectUrl}/webhooks/fulfillments/create`,
      },
      {
        topic: 'fulfillments/update',
        address: `${this.config.redirectUrl}/webhooks/fulfillments/update`,
      },
    ];
  }

  private generateSettings(): AppSettings[] {
    return [
      {
        key: 'default_carrier',
        type: 'select',
        label: 'Default Carrier',
        options: ['auto', 'fedex', 'ups', 'usps', 'dhl'],
      },
      {
        key: 'enable_insurance',
        type: 'boolean',
        label: 'Enable Shipping Insurance',
        default: true,
      },
      {
        key: 'auto_fulfill',
        type: 'boolean',
        label: 'Auto-fulfill Orders',
        default: false,
      },
    ];
  }

  private convertShopifyAddress(shopifyAddr: any): any {
    return {
      country: shopifyAddr.country,
      administrativeArea: shopifyAddr.province,
      locality: shopifyAddr.city,
      postalCode: shopifyAddr.zip,
      addressLine1: shopifyAddr.address1,
      addressLine2: shopifyAddr.address2,
      recipient: shopifyAddr.name || '',
      phone: shopifyAddr.phone,
    };
  }
}

// Type definitions for Shopify integration
export interface ShopifyAppManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  features: string[];
  endpoints: Record<string, string>;
  webhooks: WebhookEndpoint[];
  settings: AppSettings[];
}

export interface CarrierServiceConfig {
  name: string;
  callback_url: string;
  service_discovery: boolean;
  format: string;
}

export interface ShopifyRatesRequest {
  rate: {
    origin: any;
    destination: any;
    items: Array<{ grams: number; price: number }>;
    currency: string;
  };
}

export interface ShopifyRatesResponse {
  rates: Array<{
    service_name: string;
    service_code: string;
    total_price: string;
    currency: string;
    description?: string;
    min_delivery_date?: string;
    max_delivery_date?: string;
  }>;
}

export interface WebhookEndpoint {
  topic: string;
  address: string;
}

export interface AppSettings {
  key: string;
  type: 'select' | 'boolean' | 'text' | 'number';
  label: string;
  options?: string[];
  default?: any;
}
