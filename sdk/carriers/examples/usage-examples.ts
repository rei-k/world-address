/**
 * Carrier SDK Examples
 * Demonstrates how to use different carriers
 */

import {
  UPSAdapter,
  FedExAdapter,
  DHLExpressAdapter,
  SFExpressAdapter,
  JDLogisticsAdapter,
  YamatoTransportAdapter,
  globalCarrierRegistry,
  CarrierFactory,
  Shipment
} from '../src';

// Example shipment data
const exampleShipment: Shipment = {
  sender: {
    name: 'John Doe',
    phone: '5551234567',
    email: 'john@example.com',
    company: 'ACME Corp',
    address: {
      country: 'US',
      province: 'CA',
      city: 'Los Angeles',
      street: '123 Main Street',
      postalCode: '90001'
    }
  },
  recipient: {
    name: 'Jane Smith',
    phone: '5559876543',
    email: 'jane@example.com',
    address: {
      country: 'JP',
      province: '東京都',
      city: '渋谷区',
      street: '道玄坂1-2-3',
      postalCode: '150-0043'
    }
  },
  items: [
    {
      name: 'Electronics',
      quantity: 1,
      weight: 2.5,
      value: 500,
      currency: 'USD',
      description: 'Laptop computer'
    }
  ],
  deliveryRequirement: 'EXPRESS',
  paymentMethod: 'SENDER_PAY',
  notes: 'Fragile - Handle with care'
};

/**
 * Example 1: Using UPS
 */
async function example1_UPS() {
  console.log('\n=== Example 1: UPS ===\n');
  
  const ups = new UPSAdapter({
    apiKey: process.env.UPS_API_KEY || 'test-key',
    apiSecret: process.env.UPS_API_SECRET || 'test-secret',
    customerId: process.env.UPS_CUSTOMER_ID || 'test-customer',
    environment: 'sandbox'
  });

  try {
    // Validate shipment
    const validation = await ups.validateShipment(exampleShipment);
    console.log('Validation result:', validation);

    if (validation.deliverable) {
      // Get quote
      const quote = await ups.getQuote(exampleShipment);
      console.log('Quote:', quote);

      // Create pickup order
      const order = await ups.createPickupOrder({
        shipment: exampleShipment,
        pickupTime: 'ASAP',
        paymentMethod: 'SENDER_PAY'
      });
      console.log('Order created:', order);

      // Track shipment
      const tracking = await ups.trackShipment(order.trackingNumber!);
      console.log('Tracking:', tracking);
    }
  } catch (error) {
    console.error('UPS error:', error);
  }
}

/**
 * Example 5: Using Carrier Registry for Smart Selection
 */
async function example5_SmartSelection() {
  console.log('\n=== Example 5: Smart Carrier Selection ===\n');
  
  // Initialize carriers
  CarrierFactory.initializeCarriers({
    'ups': {
      apiKey: process.env.UPS_API_KEY || 'test',
      apiSecret: process.env.UPS_API_SECRET || 'test',
      customerId: process.env.UPS_CUSTOMER_ID || 'test',
      environment: 'sandbox'
    },
    'fedex': {
      apiKey: process.env.FEDEX_API_KEY || 'test',
      apiSecret: process.env.FEDEX_API_SECRET || 'test',
      customerId: process.env.FEDEX_CUSTOMER_ID || 'test',
      environment: 'sandbox'
    }
  });

  try {
    // Get recommendations
    const recommendations = await globalCarrierRegistry.getRecommendations(
      exampleShipment,
      {
        origin: 'US',
        destination: 'JP',
        maxCost: 150,
        maxDeliveryDays: 5,
        serviceType: 'EXPRESS'
      }
    );

    console.log('\nCarrier Recommendations:');
    recommendations.forEach((rec, index) => {
      console.log(`\n${index + 1}. ${rec.carrierName}`);
      console.log(`   Score: ${rec.score}/100`);
      console.log(`   Cost: $${rec.estimatedCost}`);
      console.log(`   Days: ${rec.estimatedDays}`);
      console.log(`   Confidence: ${rec.confidence}%`);
    });
  } catch (error) {
    console.error('Smart selection error:', error);
  }
}

// Main function
async function main() {
  console.log('='.repeat(60));
  console.log('Carrier SDK Examples');
  console.log('='.repeat(60));

  // Run example
  await example5_SmartSelection();

  console.log('\n' + '='.repeat(60));
  console.log('Examples completed');
  console.log('='.repeat(60) + '\n');
}

if (require.main === module) {
  main().catch(console.error);
}

export { example1_UPS, example5_SmartSelection };
