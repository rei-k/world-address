/**
 * VeyExpress Comprehensive Usage Examples
 * Demonstrates best practices and common use cases
 */

import { createVeyExpress, VeyExpressSDK } from '../src/sdk';
import { Address } from '../src/types';

// ============================================================================
// Basic Setup
// ============================================================================

/**
 * Example 1: Initialize SDK with environment configuration
 */
function example1_InitializeSDK() {
  console.log('\n=== Example 1: Initialize SDK ===\n');
  
  // For sandbox testing
  const sandboxSDK = createVeyExpress('sk_test_abc123', 'sandbox');
  console.log('✓ Sandbox SDK initialized');
  
  // For production
  const prodSDK = createVeyExpress('sk_live_xyz789', 'production');
  console.log('✓ Production SDK initialized');
  
  return sandboxSDK;
}

/**
 * Example 2: Validate and normalize addresses
 */
async function example2_ValidateAddress(sdk: VeyExpressSDK) {
  console.log('\n=== Example 2: Address Validation ===\n');
  
  const address: Address = {
    country: 'US',
    addressLine1: '1600 Pennsylvania Ave',
    locality: 'Washington',
    administrativeArea: 'DC',
    postalCode: '20500',
    recipient: 'John Doe',
    email: 'john@example.com',
    phone: '+1-555-0123',
  };
  
  const result = await sdk.validateAddress(address);
  
  if (result.valid) {
    console.log('✓ Address is valid');
    console.log('Normalized address:', result.normalized);
  } else {
    console.log('✗ Address validation failed');
    console.log('Errors:', result.errors);
  }
  
  if (result.warnings && result.warnings.length > 0) {
    console.log('Warnings:', result.warnings);
  }
}

/**
 * Example 3: Get shipping quotes from multiple carriers
 */
async function example3_GetShippingQuotes(sdk: VeyExpressSDK) {
  console.log('\n=== Example 3: Get Shipping Quotes ===\n');
  
  const origin: Address = {
    country: 'US',
    administrativeArea: 'CA',
    locality: 'San Francisco',
    postalCode: '94102',
    addressLine1: '123 Market St',
    recipient: 'Sender Corp',
  };
  
  const destination: Address = {
    country: 'JP',
    administrativeArea: '東京都',
    locality: '渋谷区',
    postalCode: '150-0041',
    addressLine1: '神南1-2-3',
    recipient: '山田太郎',
  };
  
  const packageInfo = {
    weight: 2.5, // kg
    dimensions: {
      length: 30, // cm
      width: 20,
      height: 15,
    },
    value: 150, // USD
  };
  
  try {
    const quotes = await sdk.getShippingQuote(origin, destination, packageInfo);
    
    console.log('Available carriers:');
    quotes.options.forEach((option, index) => {
      console.log(`\n${index + 1}. ${option.carrier.name}`);
      console.log(`   Price: ${option.price.amount} ${option.price.currency}`);
      console.log(`   Estimated days: ${option.estimatedDays}`);
      console.log(`   Service: ${option.service.name}`);
    });
    
    console.log('\nRecommended carrier:', quotes.recommended.carrier.name);
    console.log('Reason:', quotes.recommended.reason);
    
  } catch (error) {
    console.error('Failed to get quotes:', error);
  }
}

/**
 * Example 4: Track a shipment
 */
async function example4_TrackShipment(sdk: VeyExpressSDK) {
  console.log('\n=== Example 4: Track Shipment ===\n');
  
  const trackingNumber = 'DHL-123456789';
  
  try {
    const shipment = await sdk.trackShipment(trackingNumber);
    
    console.log('Tracking Number:', shipment.trackingNumber);
    console.log('Status:', shipment.status);
    console.log('Origin:', shipment.origin.locality);
    console.log('Destination:', shipment.destination.locality);
    console.log('Carrier:', shipment.carrier.name);
    
    console.log('\nTimeline:');
    console.log('Created:', shipment.timeline.createdAt);
    console.log('Estimated delivery:', shipment.timeline.estimatedDelivery);
    
    if (shipment.timeline.deliveredAt) {
      console.log('Delivered:', shipment.timeline.deliveredAt);
    }
    
    console.log('\nRecent events:');
    shipment.timeline.events.slice(-3).forEach(event => {
      console.log(`- ${event.timestamp}: ${event.description}`);
    });
    
  } catch (error) {
    console.error('Failed to track shipment:', error);
  }
}

/**
 * Example 5: Validate addresses for 254 countries
 */
async function example5_MultiCountryValidation(sdk: VeyExpressSDK) {
  console.log('\n=== Example 5: Multi-Country Validation ===\n');
  
  const addresses = [
    {
      country: 'JP',
      addressLine1: '東京都渋谷区神南1-2-3',
      postalCode: '150-0041',
      recipient: '山田太郎',
    },
    {
      country: 'GB',
      addressLine1: '10 Downing Street',
      locality: 'London',
      postalCode: 'SW1A 2AA',
      recipient: 'John Smith',
    },
    {
      country: 'DE',
      addressLine1: 'Brandenburger Tor',
      locality: 'Berlin',
      postalCode: '10117',
      recipient: 'Max Mustermann',
    },
  ];
  
  for (const address of addresses) {
    const result = await sdk.validateAddress(address);
    console.log(`${address.country}: ${result.valid ? '✓ Valid' : '✗ Invalid'}`);
  }
}

/**
 * Example 6: Get supported countries
 */
function example6_GetSupportedCountries(sdk: VeyExpressSDK) {
  console.log('\n=== Example 6: Supported Countries ===\n');
  
  const countries = sdk.getSupportedCountries();
  console.log(`Total supported countries: ${countries.length}`);
  console.log('Sample countries:', countries.slice(0, 10).join(', '));
  
  // Check if specific country is supported
  const targetCountries = ['US', 'JP', 'CN', 'GB', 'DE'];
  console.log('\nChecking specific countries:');
  targetCountries.forEach(country => {
    const supported = countries.includes(country);
    console.log(`${country}: ${supported ? '✓' : '✗'}`);
  });
}

/**
 * Example 7: Error handling
 */
async function example7_ErrorHandling(sdk: VeyExpressSDK) {
  console.log('\n=== Example 7: Error Handling ===\n');
  
  // Test with invalid address
  try {
    const result = await sdk.validateAddress({
      country: '',
      addressLine1: '',
      recipient: '',
    });
    
    if (!result.valid) {
      console.log('Validation errors:', result.errors);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
  
  // Test with invalid tracking number
  try {
    await sdk.trackShipment('');
  } catch (error) {
    console.log('Expected error caught:', error instanceof Error ? error.message : error);
  }
}

/**
 * Example 8: Test API connection
 */
async function example8_TestConnection(sdk: VeyExpressSDK) {
  console.log('\n=== Example 8: Test Connection ===\n');
  
  const isConnected = await sdk.testConnection();
  
  if (isConnected) {
    console.log('✓ Successfully connected to VeyExpress API');
  } else {
    console.log('✗ Failed to connect to VeyExpress API');
    console.log('Please check:');
    console.log('- Your API key is valid');
    console.log('- Your network connection');
    console.log('- API service status');
  }
}

// ============================================================================
// Advanced Examples
// ============================================================================

/**
 * Example 9: International shipment with customs
 */
async function example9_InternationalShipment(sdk: VeyExpressSDK) {
  console.log('\n=== Example 9: International Shipment ===\n');
  
  const origin: Address = {
    country: 'JP',
    administrativeArea: '東京都',
    locality: '渋谷区',
    postalCode: '150-0041',
    addressLine1: '神南1-2-3',
    recipient: 'Tokyo Electronics Inc.',
    organization: 'Tokyo Electronics Inc.',
  };
  
  const destination: Address = {
    country: 'US',
    administrativeArea: 'CA',
    locality: 'Los Angeles',
    postalCode: '90001',
    addressLine1: '123 Main St',
    recipient: 'US Import Company',
    organization: 'US Import Company',
  };
  
  const packageInfo = {
    weight: 15.5,
    dimensions: { length: 60, width: 40, height: 40 },
    value: 2500,
  };
  
  try {
    const quotes = await sdk.getShippingQuote(origin, destination, packageInfo);
    
    console.log('International shipping options:');
    quotes.options.forEach(option => {
      console.log(`\n${option.carrier.name} - ${option.service.name}`);
      console.log(`  Base price: ${option.price.amount} ${option.price.currency}`);
      
      if (option.customsDuties) {
        console.log(`  Customs duties: ${option.customsDuties.amount} ${option.customsDuties.currency}`);
      }
      
      if (option.totalWithDuties) {
        console.log(`  Total: ${option.totalWithDuties.amount} ${option.totalWithDuties.currency}`);
      }
      
      console.log(`  Transit time: ${option.estimatedDays} days`);
    });
  } catch (error) {
    console.error('Error getting international quotes:', error);
  }
}

/**
 * Example 10: Complete workflow
 */
async function example10_CompleteWorkflow() {
  console.log('\n=== Example 10: Complete Workflow ===\n');
  
  // 1. Initialize SDK
  const sdk = createVeyExpress('sk_test_abc123', 'sandbox');
  console.log('1. SDK initialized');
  
  // 2. Test connection
  const connected = await sdk.testConnection();
  if (!connected) {
    throw new Error('Failed to connect to API');
  }
  console.log('2. API connection verified');
  
  // 3. Validate addresses
  const origin: Address = {
    country: 'US',
    addressLine1: '123 Sender St',
    locality: 'New York',
    administrativeArea: 'NY',
    postalCode: '10001',
    recipient: 'Sender Inc.',
  };
  
  const destination: Address = {
    country: 'JP',
    addressLine1: '東京都渋谷区神南1-2-3',
    postalCode: '150-0041',
    recipient: '受取人株式会社',
  };
  
  const originValidation = await sdk.validateAddress(origin);
  const destValidation = await sdk.validateAddress(destination);
  
  if (!originValidation.valid || !destValidation.valid) {
    throw new Error('Address validation failed');
  }
  console.log('3. Addresses validated');
  
  // 4. Get shipping quotes
  const quotes = await sdk.getShippingQuote(
    originValidation.normalized!,
    destValidation.normalized!,
    { weight: 2.5, dimensions: { length: 30, width: 20, height: 15 }, value: 100 }
  );
  console.log('4. Got shipping quotes from', quotes.options.length, 'carriers');
  
  // 5. Select best option
  const selected = quotes.recommended;
  console.log('5. Selected carrier:', selected.carrier.name);
  console.log('   Price:', selected.price.amount, selected.price.currency);
  console.log('   Estimated delivery:', selected.estimatedDays, 'days');
  
  console.log('\n✓ Workflow completed successfully!');
}

// ============================================================================
// Run Examples
// ============================================================================

async function runExamples() {
  try {
    const sdk = example1_InitializeSDK();
    
    await example2_ValidateAddress(sdk);
    await example3_GetShippingQuotes(sdk);
    await example4_TrackShipment(sdk);
    await example5_MultiCountryValidation(sdk);
    example6_GetSupportedCountries(sdk);
    await example7_ErrorHandling(sdk);
    await example8_TestConnection(sdk);
    await example9_InternationalShipment(sdk);
    await example10_CompleteWorkflow();
    
    console.log('\n✓ All examples completed!\n');
  } catch (error) {
    console.error('\n✗ Error running examples:', error);
  }
}

// Run if called directly
if (require.main === module) {
  runExamples();
}

export {
  example1_InitializeSDK,
  example2_ValidateAddress,
  example3_GetShippingQuotes,
  example4_TrackShipment,
  example5_MultiCountryValidation,
  example6_GetSupportedCountries,
  example7_ErrorHandling,
  example8_TestConnection,
  example9_InternationalShipment,
  example10_CompleteWorkflow,
};
