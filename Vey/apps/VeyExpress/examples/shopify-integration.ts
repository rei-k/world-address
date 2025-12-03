/**
 * VeyExpress - Shopify Integration Example
 */

import { ShopifyPluginGenerator } from '../src/sdk/plugins/shopify';

async function shopifyExample() {
  console.log('=== Shopify Integration ===\n');

  const generator = new ShopifyPluginGenerator('vey-api-key', {
    apiKey: 'shopify-key',
    apiSecret: 'shopify-secret',
    scopes: ['read_orders', 'write_shipping'],
    redirectUrl: 'https://yourapp.com',
  });

  const manifest = generator.generateApp();
  console.log('App:', manifest.name);
  console.log('Features:', manifest.features.length);

  const carrierService = generator.generateCarrierService();
  console.log('Carrier Service:', carrierService.name);

  console.log('\n=== Complete ===');
}

export default shopifyExample;
