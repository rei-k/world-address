/**
 * VeyExpress Complete Example
 * Complete usage example showing all features
 */

import {
  createVeyExpress,
  // API functions
  trackShipment,
  generateWaybill,
  getShippingQuote,
  calculateETA,
  optimizeRoute,
  // Services
  generateQRCode,
  normalizeAddress,
  validateAddress,
  // Plugin generators
  generateWooCommercePlugin,
  generateMagentoExtension,
} from '@vey/veyexpress';

async function completeExample() {
  // 1. Initialize VeyExpress SDK
  const vey = createVeyExpress('your-api-key');

  // 2. Validate and normalize address (254 countries supported)
  const rawAddress = {
    country: 'JP',
    postalCode: '100-0001',
    state: '東京都',
    city: '千代田区',
    addressLine1: '千代田1-1',
    recipient: '山田太郎',
    phone: '+81-3-1234-5678',
  };

  const validation = await validateAddress(rawAddress);
  console.log('Address validation:', validation);

  const normalized = await normalizeAddress(rawAddress, 'JP');
  console.log('Normalized address PID:', normalized.pid);

  // 3. Get shipping quotes from multiple carriers
  const quotes = await getShippingQuote(
    {
      country: 'US',
      postalCode: '10001',
      state: 'NY',
      city: 'New York',
    },
    {
      country: 'JP',
      postalCode: '100-0001',
      state: '東京都',
      city: '千代田区',
    },
    {
      weight: 2.5,
      dimensions: { length: 30, width: 20, height: 15 },
      value: 100,
    }
  );

  console.log('Shipping quotes:', quotes);

  // 4. Generate waybill
  const waybill = await generateWaybill({
    orderId: 'ORD-12345',
    carrier: quotes.carriers[0].carrierId,
    origin: rawAddress,
    destination: normalized,
    packageDetails: {
      weight: 2.5,
      dimensions: { length: 30, width: 20, height: 15 },
      value: 100,
    },
  });

  console.log('Waybill generated:', waybill.trackingNumber);

  // 5. Track shipment in real-time
  const tracking = await trackShipment(waybill.trackingNumber);
  console.log('Tracking status:', tracking.status);
  console.log('Current location:', tracking.currentLocation);
  console.log('Events:', tracking.events);

  // 6. Calculate ETA with AI prediction
  const eta = await calculateETA(waybill.trackingNumber);
  console.log('Estimated delivery:', eta.estimatedDelivery);
  console.log('Confidence:', eta.confidence);
  console.log('Risk factors:', eta.factors);

  // 7. Optimize delivery route
  const route = await optimizeRoute({
    origin: rawAddress,
    destinations: [normalized, /* more addresses */],
    optimizationCriteria: 'time', // or 'cost' or 'carbon'
  });

  console.log('Optimized route:', route);

  // 8. Generate QR code for pickup
  const qrCode = await generateQRCode({
    type: 'PERSONAL',
    id: waybill.trackingNumber,
    displayName: '山田太郎',
    addressPID: normalized.pid,
    nfcEnabled: true,
  });

  console.log('QR code generated:', qrCode.qrCodeId);
  console.log('QR image:', qrCode.qrCodeImage);

  // 9. Multi-language support
  const japaneseLabels = vey.getAddressFieldLabels('ja');
  console.log('Japanese labels:', japaneseLabels);

  // 10. Generate Shopify plugin
  const shopifyPlugin = await generateWooCommercePlugin({
    pluginName: 'VeyExpress for WooCommerce',
    pluginSlug: 'veyexpress-woocommerce',
    version: '1.0.0',
    author: 'VeyExpress Team',
    description: 'Complete shipping solution with 254-country support',
  });

  console.log('WooCommerce plugin files:', Object.keys(shopifyPlugin.files));

  // 11. Generate Magento extension
  const magentoExtension = await generateMagentoExtension({
    moduleName: 'VeyExpress_Shipping',
    version: '1.0.0',
    author: 'VeyExpress Team',
    description: 'VeyExpress shipping for Magento 2',
  });

  console.log('Magento extension files:', Object.keys(magentoExtension.files));

  // 12. Bulk shipment processing
  const bulkShipments = [
    { orderId: 'ORD-001', origin: rawAddress, destination: normalized },
    { orderId: 'ORD-002', origin: rawAddress, destination: normalized },
    // ... up to 10,000 shipments
  ];

  const bulkResult = await vey.processBulkShipments(bulkShipments);
  console.log('Bulk processing result:', bulkResult);

  // 13. Purchase shipping insurance
  const insurance = await vey.purchaseInsurance({
    trackingNumber: waybill.trackingNumber,
    value: 100,
    coverageType: 'standard',
  });

  console.log('Insurance policy:', insurance.policyId);

  // 14. Cross-border customs calculation
  const customs = await vey.calculateCustoms({
    origin: 'US',
    destination: 'JP',
    itemValue: 100,
    hsCode: '8471.30.0100',
  });

  console.log('Customs duties:', customs.importDuty);
  console.log('VAT:', customs.vat);
  console.log('Total landed cost:', customs.totalCost);

  // 15. Real-time notifications
  await vey.subscribeToTracking(waybill.trackingNumber, {
    channels: ['email', 'sms', 'push'],
    events: ['shipped', 'in_transit', 'out_for_delivery', 'delivered'],
    recipient: {
      email: 'customer@example.com',
      phone: '+81-90-1234-5678',
    },
  });

  console.log('Subscribed to tracking notifications');
}

// Run the complete example
completeExample().catch(console.error);
