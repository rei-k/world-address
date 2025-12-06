/**
 * Carrier Factory
 * Simplified carrier initialization and configuration
 */

import { CarrierAdapter } from './adapters/base';
import { SFExpressAdapter } from './adapters/sf-express';
import { JDLogisticsAdapter } from './adapters/jd-logistics';
import { UPSAdapter } from './adapters/ups';
import { FedExAdapter } from './adapters/fedex';
import { DHLExpressAdapter } from './adapters/dhl-express';
import { YamatoTransportAdapter } from './adapters/yamato-transport';
import { CarrierRegistry, CarrierMetadata, globalCarrierRegistry } from './registry';
import { CarrierConfig } from './types';

/**
 * Carrier type
 */
export type CarrierType =
  | 'sf-express'
  | 'jd-logistics'
  | 'ups'
  | 'fedex'
  | 'dhl-express'
  | 'yamato-transport';

/**
 * Carrier configuration map
 */
export interface CarrierConfigMap {
  'sf-express'?: CarrierConfig;
  'jd-logistics'?: CarrierConfig;
  'ups'?: CarrierConfig;
  'fedex'?: CarrierConfig;
  'dhl-express'?: CarrierConfig;
  'yamato-transport'?: CarrierConfig;
}

/**
 * Carrier Factory
 */
export class CarrierFactory {
  /**
   * Create a carrier adapter
   */
  static createCarrier(type: CarrierType, config: CarrierConfig): CarrierAdapter {
    switch (type) {
      case 'sf-express':
        return new SFExpressAdapter(config);
      
      case 'jd-logistics':
        return new JDLogisticsAdapter(config);
      
      case 'ups':
        return new UPSAdapter(config);
      
      case 'fedex':
        return new FedExAdapter(config);
      
      case 'dhl-express':
        return new DHLExpressAdapter(config);
      
      case 'yamato-transport':
        return new YamatoTransportAdapter(config);
      
      default:
        throw new Error(`Unknown carrier type: ${type}`);
    }
  }

  /**
   * Get carrier metadata
   */
  static getCarrierMetadata(type: CarrierType): CarrierMetadata {
    const metadata: Record<CarrierType, CarrierMetadata> = {
      'sf-express': {
        id: 'sf-express',
        name: 'SF Express (顺丰速运)',
        code: 'SF',
        regions: ['CN', 'HK', 'TW', 'MO'],
        services: ['STANDARD', 'EXPRESS', 'ECONOMY'],
        features: {
          tracking: true,
          pickup: true,
          international: true,
          insurance: true,
          cashOnDelivery: true
        },
        pricing: {
          currency: 'CNY',
          domesticBase: 12,
          internationalBase: 50
        }
      },
      'jd-logistics': {
        id: 'jd-logistics',
        name: 'JD Logistics (京东物流)',
        code: 'JD',
        regions: ['CN'],
        services: ['STANDARD', 'EXPRESS'],
        features: {
          tracking: true,
          pickup: true,
          international: false,
          insurance: true,
          cashOnDelivery: true
        },
        pricing: {
          currency: 'CNY',
          domesticBase: 10,
          internationalBase: 0
        }
      },
      'ups': {
        id: 'ups',
        name: 'UPS (United Parcel Service)',
        code: 'UPS',
        regions: ['US', 'CA', 'MX', 'GB', 'DE', 'FR', 'IT', 'ES', 'JP', 'CN', 'AU'],
        services: ['STANDARD', 'EXPRESS', 'ECONOMY'],
        features: {
          tracking: true,
          pickup: true,
          international: true,
          insurance: true,
          cashOnDelivery: false
        },
        pricing: {
          currency: 'USD',
          domesticBase: 15,
          internationalBase: 60
        }
      },
      'fedex': {
        id: 'fedex',
        name: 'FedEx',
        code: 'FEDEX',
        regions: ['US', 'CA', 'MX', 'GB', 'DE', 'FR', 'IT', 'ES', 'JP', 'CN', 'AU', 'BR', 'IN'],
        services: ['STANDARD', 'EXPRESS', 'ECONOMY'],
        features: {
          tracking: true,
          pickup: true,
          international: true,
          insurance: true,
          cashOnDelivery: false
        },
        pricing: {
          currency: 'USD',
          domesticBase: 12,
          internationalBase: 55
        }
      },
      'dhl-express': {
        id: 'dhl-express',
        name: 'DHL Express',
        code: 'DHL',
        regions: ['US', 'CA', 'MX', 'GB', 'DE', 'FR', 'IT', 'ES', 'JP', 'CN', 'AU', 'BR', 'IN', 'SG', 'TH', 'VN'],
        services: ['EXPRESS', 'ECONOMY'],
        features: {
          tracking: true,
          pickup: true,
          international: true,
          insurance: true,
          cashOnDelivery: false
        },
        pricing: {
          currency: 'USD',
          domesticBase: 20,
          internationalBase: 65
        }
      },
      'yamato-transport': {
        id: 'yamato-transport',
        name: 'Yamato Transport (ヤマト運輸)',
        code: 'YAMATO',
        regions: ['JP'],
        services: ['STANDARD', 'EXPRESS'],
        features: {
          tracking: true,
          pickup: true,
          international: false,
          insurance: true,
          cashOnDelivery: true
        },
        pricing: {
          currency: 'JPY',
          domesticBase: 1000,
          internationalBase: 0
        }
      }
    };

    return metadata[type];
  }

  /**
   * Initialize multiple carriers and register them
   */
  static initializeCarriers(
    configs: CarrierConfigMap,
    registry: CarrierRegistry = globalCarrierRegistry
  ): CarrierRegistry {
    Object.entries(configs).forEach(([type, config]) => {
      if (config) {
        const carrierType = type as CarrierType;
        const adapter = this.createCarrier(carrierType, config);
        const metadata = this.getCarrierMetadata(carrierType);
        registry.registerCarrier(metadata, adapter, config);
      }
    });

    return registry;
  }

  /**
   * Create carrier from environment variables
   */
  static createFromEnv(type: CarrierType): CarrierAdapter {
    const envPrefix = type.toUpperCase().replace(/-/g, '_');
    
    const config: CarrierConfig = {
      apiKey: process.env[`${envPrefix}_API_KEY`] || '',
      apiSecret: process.env[`${envPrefix}_API_SECRET`] || '',
      customerId: process.env[`${envPrefix}_CUSTOMER_ID`],
      environment: (process.env[`${envPrefix}_ENV`] as 'sandbox' | 'production') || 'sandbox',
      timeout: parseInt(process.env[`${envPrefix}_TIMEOUT`] || '30000'),
      retries: parseInt(process.env[`${envPrefix}_RETRIES`] || '3')
    };

    return this.createCarrier(type, config);
  }

  /**
   * Initialize all carriers from environment variables
   */
  static initializeFromEnv(
    registry: CarrierRegistry = globalCarrierRegistry
  ): CarrierRegistry {
    const carrierTypes: CarrierType[] = [
      'sf-express',
      'jd-logistics',
      'ups',
      'fedex',
      'dhl-express',
      'yamato-transport'
    ];

    carrierTypes.forEach(type => {
      try {
        const envPrefix = type.toUpperCase().replace(/-/g, '_');
        if (process.env[`${envPrefix}_API_KEY`]) {
          const adapter = this.createFromEnv(type);
          const metadata = this.getCarrierMetadata(type);
          
          const config: CarrierConfig = {
            apiKey: process.env[`${envPrefix}_API_KEY`] || '',
            apiSecret: process.env[`${envPrefix}_API_SECRET`] || '',
            customerId: process.env[`${envPrefix}_CUSTOMER_ID`],
            environment: (process.env[`${envPrefix}_ENV`] as 'sandbox' | 'production') || 'sandbox'
          };
          
          registry.registerCarrier(metadata, adapter, config);
        }
      } catch (error) {
        console.warn(`Failed to initialize ${type}:`, error);
      }
    });

    return registry;
  }

  /**
   * Get available carrier types
   */
  static getAvailableCarriers(): CarrierType[] {
    return [
      'sf-express',
      'jd-logistics',
      'ups',
      'fedex',
      'dhl-express',
      'yamato-transport'
    ];
  }

  /**
   * Get carriers for a specific region
   */
  static getCarriersForRegion(countryCode: string): CarrierType[] {
    const carriers = this.getAvailableCarriers();
    
    return carriers.filter(type => {
      const metadata = this.getCarrierMetadata(type);
      return metadata.regions.includes(countryCode);
    });
  }

  /**
   * Get carriers with specific features
   */
  static getCarriersWithFeatures(features: string[]): CarrierType[] {
    const carriers = this.getAvailableCarriers();
    
    return carriers.filter(type => {
      const metadata = this.getCarrierMetadata(type);
      return features.every(
        feature => metadata.features[feature as keyof typeof metadata.features]
      );
    });
  }
}

/**
 * Quick initialization helper
 */
export function initCarriers(configs: CarrierConfigMap): CarrierRegistry {
  return CarrierFactory.initializeCarriers(configs);
}

/**
 * Quick carrier creation helper
 */
export function createCarrier(type: CarrierType, config: CarrierConfig): CarrierAdapter {
  return CarrierFactory.createCarrier(type, config);
}
