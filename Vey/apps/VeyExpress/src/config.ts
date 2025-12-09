/**
 * VeyExpress Configuration
 * Central configuration for the platform
 */

export const VeyExpressConfig = {
  // API Configuration
  api: {
    baseUrl: {
      production: 'https://api.veyexpress.com/v1',
      sandbox: 'https://sandbox-api.veyexpress.com/v1',
    },
    version: '1.0.0',
    timeout: 30000, // 30 seconds
    retries: 3,
  },

  // Supported Countries (254)
  countries: {
    total: 254,
    validated: 254,
    // Major countries with full implementation
    featured: ['US', 'JP', 'GB', 'DE', 'FR', 'CN', 'IN', 'BR', 'AU', 'CA'],
  },

  // Carrier Configuration
  carriers: {
    // Comprehensive carrier database
    // See: ./data/carriers/worldwide-carriers.yaml
    // Total carriers: 65 from 52 countries across 6 regions
    database: {
      path: './data/carriers/worldwide-carriers.json',
      version: '1.0.0',
      total: 65,
      regions: ['asia', 'americas', 'europe', 'oceania', 'middle_east', 'africa'],
    },
    // Legacy supported carriers list (maintained for backward compatibility)
    supported: [
      // United States
      'usps',
      'fedex',
      'ups',
      'dhl_us',
      // Japan
      'yamato',
      'sagawa',
      'japan_post',
      // China
      'sf_express',
      'jd_logistics',
      // Global
      'dhl',
      'tnt',
      'aramex',
    ],
    defaultTimeout: 5000,
    maxConcurrentRequests: 10,
  },

  // Integration Limits
  integrations: {
    maxPerAccount: 50,
    syncInterval: {
      min: 5, // minutes
      default: 15,
      max: 1440, // 24 hours
    },
    webhookTimeout: 10000, // 10 seconds
  },

  // Rate Limiting
  rateLimit: {
    sandbox: {
      requestsPerMinute: 60,
      requestsPerDay: 10000,
    },
    production: {
      requestsPerMinute: 600,
      requestsPerDay: 100000,
    },
  },

  // Insurance Configuration
  insurance: {
    providers: ['aig', 'chubb', 'lloyd'],
    maxCoverage: {
      amount: 100000,
      currency: 'USD',
    },
    defaultCoverage: {
      basic: 100,
      standard: 500,
      premium: 2000,
    },
  },

  // Address Validation
  addressValidation: {
    enableAutoCorrection: true,
    enableGeocode: true,
    cacheEnabled: true,
    cacheTTL: 86400, // 24 hours
  },

  // Risk Scoring
  riskScoring: {
    enabled: true,
    thresholds: {
      low: 30,
      medium: 60,
      high: 80,
    },
    updateInterval: 3600, // 1 hour
  },

  // Warehouse Configuration
  warehouse: {
    defaultZones: ['receiving', 'storage', 'picking', 'packing', 'shipping'],
    maxZonesPerWarehouse: 20,
    inventoryUpdateInterval: 300, // 5 minutes
  },

  // Analytics
  analytics: {
    enabled: true,
    retentionDays: 365,
    aggregationInterval: 3600, // 1 hour
  },

  // Security
  security: {
    encryption: {
      algorithm: 'AES-256-GCM',
      keyRotationDays: 90,
    },
    auditLog: {
      enabled: true,
      retentionDays: 730, // 2 years
      sensitiveFields: ['address', 'phone', 'email'],
    },
    compliance: {
      gdpr: true,
      ccpa: true,
      dataRetention: 2555, // 7 years
    },
  },

  // Features
  features: {
    multiLanguage: true,
    qrGeneration: true,
    nfcSupport: true,
    aiPrediction: true,
    routeOptimization: true,
    customsCalculation: true,
    carbonTracking: true,
  },

  // UI Configuration
  ui: {
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'ja', 'zh', 'es', 'fr', 'de', 'pt', 'ar'],
    theme: {
      primary: '#0066CC',
      secondary: '#00A3E0',
      success: '#28A745',
      warning: '#FFC107',
      error: '#DC3545',
    },
    map: {
      defaultZoom: 10,
      maxMarkers: 1000,
      clusterThreshold: 50,
    },
  },

  // Webhook Configuration
  webhooks: {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    timeout: 10000, // 10 seconds
    signatureAlgorithm: 'HMAC-SHA256',
  },

  // Plugin Configuration
  plugins: {
    shopify: {
      apiVersion: '2024-01',
      scopes: [
        'read_orders',
        'write_orders',
        'read_shipping',
        'write_shipping',
        'read_fulfillments',
        'write_fulfillments',
      ],
    },
    woocommerce: {
      apiVersion: 'v3',
    },
    magento: {
      apiVersion: '2.4',
    },
  },

  // Monitoring
  monitoring: {
    healthCheckInterval: 60000, // 1 minute
    metricsInterval: 300000, // 5 minutes
    alertThresholds: {
      errorRate: 0.01, // 1%
      responseTime: 2000, // 2 seconds
      availability: 0.999, // 99.9%
    },
  },
};

export default VeyExpressConfig;
