import express from 'express';
import dotenv from 'dotenv';
import {
  validateAddress,
  formatAddress,
  getRequiredFields,
  createDataLoader,
} from '@vey/core';
import {
  createWebhookHandler,
  expressMiddleware,
} from '@vey/webhooks';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize data loader for country formats
const dataLoader = createDataLoader({
  dataPath: '../../data',
});

// Initialize webhook handler
const webhookHandler = createWebhookHandler({
  secret: process.env.WEBHOOK_SECRET || 'default-secret',
  tolerance: 300, // 5 minutes
  retries: {
    maxAttempts: 3,
    backoff: 'exponential',
    initialDelay: 1000,
    maxDelay: 60000,
  },
});

// Register webhook event handlers
webhookHandler.onAddressCreated(async (event, data, payload) => {
  console.log('Address created:', data.address_id);
  console.log('Address:', data.address);
  // Handle the event (e.g., sync to database, send notification)
});

webhookHandler.onAddressUpdate(async (event, data, payload) => {
  console.log('Address updated:', data.address_id);
  console.log('Changed fields:', data.changed_fields);
  // Handle the event
});

webhookHandler.onAddressDeleted(async (event, data, payload) => {
  console.log('Address deleted:', data.address_id);
  // Handle the event
});

webhookHandler.onDeliveryStatus(async (event, data, payload) => {
  console.log('Delivery status changed:', data.status);
  console.log('Tracking number:', data.tracking_number);
  // Handle the event
});

// Catch-all handler for any webhook event
webhookHandler.on('*', async (event, data, payload) => {
  console.log('Webhook received:', event, 'at', new Date(payload.timestamp));
});

// Routes

/**
 * GET / - Health check
 */
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Vey Address API - Express Example',
    endpoints: {
      validate: '/api/address/validate',
      format: '/api/address/format',
      required: '/api/address/required/:country',
      webhooks: '/api/webhooks',
    },
  });
});

/**
 * POST /api/address/validate - Validate an address
 */
app.post('/api/address/validate', async (req, res) => {
  try {
    const { address, country } = req.body;

    if (!address || !country) {
      return res.status(400).json({
        error: 'Missing required fields: address and country',
      });
    }

    // Load country format
    const countryFormat = await dataLoader.loadCountryData(country);
    if (!countryFormat) {
      return res.status(404).json({
        error: `Country format not found: ${country}`,
      });
    }

    // Validate address
    const result = validateAddress(address, countryFormat);

    res.json({
      valid: result.valid,
      errors: result.errors,
      warnings: result.warnings,
      normalized: result.normalized,
    });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * POST /api/address/format - Format an address
 */
app.post('/api/address/format', async (req, res) => {
  try {
    const { address, country, options } = req.body;

    if (!address || !country) {
      return res.status(400).json({
        error: 'Missing required fields: address and country',
      });
    }

    // Load country format
    const countryFormat = await dataLoader.loadCountryData(country);
    if (!countryFormat) {
      return res.status(404).json({
        error: `Country format not found: ${country}`,
      });
    }

    // Format address
    const formatted = formatAddress(address, countryFormat, options);

    res.json({
      formatted,
      country: countryFormat.name.en,
    });
  } catch (error) {
    console.error('Formatting error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/address/required/:country - Get required fields for a country
 */
app.get('/api/address/required/:country', async (req, res) => {
  try {
    const { country } = req.params;

    // Load country format
    const countryFormat = await dataLoader.loadCountryData(country);
    if (!countryFormat) {
      return res.status(404).json({
        error: `Country format not found: ${country}`,
      });
    }

    // Get required fields
    const requiredFields = getRequiredFields(countryFormat);

    res.json({
      country: countryFormat.name.en,
      requiredFields,
      addressFormat: countryFormat.address_format,
    });
  } catch (error) {
    console.error('Required fields error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * POST /api/webhooks - Webhook endpoint
 */
app.post('/api/webhooks', expressMiddleware(webhookHandler));

/**
 * POST /api/webhooks/test - Test webhook endpoint (development only)
 */
if (process.env.NODE_ENV === 'development') {
  app.post('/api/webhooks/test', async (req, res) => {
    try {
      const { event, data } = req.body;

      if (!event || !data) {
        return res.status(400).json({
          error: 'Missing required fields: event and data',
        });
      }

      // Simulate webhook delivery
      const payload = {
        event,
        timestamp: new Date().toISOString(),
        data,
        signature: '',
      };

      const result = await webhookHandler.handle(payload);

      res.json({
        success: result.success,
        error: result.error,
        payload,
      });
    } catch (error) {
      console.error('Test webhook error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message,
      });
    }
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
  console.log(`📝 Webhook endpoint: http://localhost:${port}/api/webhooks`);
  if (process.env.NODE_ENV === 'development') {
    console.log(`🧪 Test webhook: http://localhost:${port}/api/webhooks/test`);
  }
});
