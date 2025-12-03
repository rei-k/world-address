/**
 * VeyExpress SDK - Basic Usage Example
 */

import { createVeyExpress } from '../src/sdk';

async function basicExample() {
  const vey = createVeyExpress('your-api-key', 'sandbox');

  console.log('=== VeyExpress Basic Example ===\n');

  // Address Validation
  const address = {
    country: 'US',
    addressLine1: '1600 Pennsylvania Avenue NW',
    locality: 'Washington',
    administrativeArea: 'DC',
    postalCode: '20500',
    recipient: 'John Doe',
  };

  const validation = await vey.validateAddress(address);
  console.log('Address valid:', validation.valid);

  // Get shipping quotes
  const quotes = await vey.getShippingQuote(address, address, {
    weight: 2.5,
    dimensions: { length: 30, width: 20, height: 15 },
    value: 150,
  });
  console.log('Quotes received:', quotes.quotes.length);

  // Track shipment
  const tracking = await vey.trackShipment('TRACK123');
  console.log('Status:', tracking.status);

  console.log('\n=== Complete ===');
}

export default basicExample;
