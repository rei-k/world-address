/**
 * Complete E-Commerce Integration Example
 * 
 * This example demonstrates a full e-commerce checkout flow using
 * ZKP Address Protocol with ConveyID delivery system.
 * 
 * Scenario:
 * 1. Customer browses an online store
 * 2. Customer adds items to cart
 * 3. At checkout, customer enters ConveyID instead of address
 * 4. Store sends delivery request to customer's ConveyID
 * 5. Customer accepts and selects delivery address (with ZKP proof)
 * 6. Store gets shipping quotes and creates waybill
 * 7. Carrier gets minimal address information for delivery
 * 8. Customer and store track delivery progress
 */

import {
  createSandboxIntegration,
  type ZKPIntegration,
  type AddressRegistration,
} from '../src/zkp-integration';

import {
  createConveyProtocol,
  generateConveyID,
  type ConveyProtocol,
  type DeliveryRequest,
} from '../src/convey-protocol';

import {
  createDeliveryFlow,
  executeCompleteDeliveryWorkflow,
  type DeliveryFlow,
} from '../src/delivery-flow';

// ============================================================================
// Example Data
// ============================================================================

/**
 * Example customer data
 */
const customerData = {
  name: 'Alice Tanaka',
  email: 'alice@example.com',
  conveyId: 'alice@convey',
  address: {
    country: 'Japan',
    province: 'Tokyo',
    city: 'Shibuya',
    postalCode: '150-0001',
    street: 'Jingumae 1-2-3',
    building: 'Shibuya Building 4F',
    room: '401',
    recipient: 'Alice Tanaka',
  },
};

/**
 * Example store data
 */
const storeData = {
  name: 'Cool Gadgets Store',
  conveyId: 'coolgadgets@convey.store',
};

/**
 * Example shopping cart
 */
const shoppingCart = {
  items: [
    { id: 'prod-001', name: 'Wireless Earbuds', price: 5980, quantity: 1 },
    { id: 'prod-002', name: 'Phone Case', price: 1980, quantity: 2 },
  ],
  total: 9940,
  currency: 'JPY',
};

// ============================================================================
// Main Example
// ============================================================================

async function runEcommerceCheckoutExample() {
  console.log('='.repeat(80));
  console.log('E-COMMERCE CHECKOUT WITH ZKP ADDRESS PROTOCOL');
  console.log('='.repeat(80));
  console.log('');

  // ----------------------------------------------------------------------------
  // STEP 1: Customer Setup (Registration & Address Management)
  // ----------------------------------------------------------------------------
  console.log('📝 STEP 1: Customer Setup');
  console.log('-'.repeat(80));

  // Initialize customer's ZKP integration
  const customerZKP = await createSandboxIntegration('customer_api_key_123');
  console.log('✓ Customer ZKP integration initialized');
  console.log(`  DID: ${customerZKP.getUserDid()}`);

  // Create ConveyProtocol for customer
  const customerConvey = createConveyProtocol(customerZKP);
  
  // Register customer with ConveyID
  const customer = await customerConvey.registerUser(
    'alice',
    'convey',
    customerData.name,
    {
      autoAcceptFriends: false,
      autoAcceptVerified: true,
      requireManualApproval: false,
      blockedSenders: [],
    }
  );
  console.log('✓ Customer registered with ConveyID:', customer.conveyId.full);

  // Register customer's address
  const customerAddress: AddressRegistration = {
    userDid: customerZKP.getUserDid(),
    pid: 'JP-13-113-01-T07-B12-R401',
    countryCode: 'JP',
    hierarchyDepth: 7,
    fullAddress: {
      country: customerData.address.country,
      province: customerData.address.province,
      city: customerData.address.city,
      postalCode: customerData.address.postalCode,
      street: customerData.address.street,
      building: customerData.address.building,
      room: customerData.address.room,
      recipient: customerData.address.recipient,
    },
  };

  await customerConvey.addAddress(customerAddress);
  console.log('✓ Customer address registered (encrypted)');
  console.log(`  PID: ${customerAddress.pid}`);
  console.log('');

  // ----------------------------------------------------------------------------
  // STEP 2: Store Setup
  // ----------------------------------------------------------------------------
  console.log('🏪 STEP 2: Store Setup');
  console.log('-'.repeat(80));

  // Initialize store's ZKP integration
  const storeZKP = await createSandboxIntegration('store_api_key_456');
  console.log('✓ Store ZKP integration initialized');
  console.log(`  DID: ${storeZKP.getUserDid()}`);

  // Create ConveyProtocol for store
  const storeConvey = createConveyProtocol(storeZKP);
  
  await storeConvey.registerUser(
    'coolgadgets',
    'convey.store',
    storeData.name,
    {
      autoAcceptFriends: false,
      autoAcceptVerified: false,
      requireManualApproval: false,
      blockedSenders: [],
    }
  );
  console.log('✓ Store registered with ConveyID:', storeData.conveyId);
  console.log('');

  // ----------------------------------------------------------------------------
  // STEP 3: Checkout - Customer Enters ConveyID
  // ----------------------------------------------------------------------------
  console.log('🛒 STEP 3: Checkout Process');
  console.log('-'.repeat(80));
  
  console.log('Shopping Cart:');
  for (const item of shoppingCart.items) {
    console.log(`  - ${item.name} x${item.quantity}: ¥${item.price * item.quantity}`);
  }
  console.log(`  Total: ¥${shoppingCart.total}`);
  console.log('');

  console.log('✓ Customer enters ConveyID:', customerData.conveyId);
  console.log('  (No physical address needed!)');
  console.log('');

  // ----------------------------------------------------------------------------
  // STEP 4: Store Sends Delivery Request
  // ----------------------------------------------------------------------------
  console.log('📤 STEP 4: Store Sends Delivery Request');
  console.log('-'.repeat(80));

  // Calculate package details
  const packageDetails = {
    weight: 0.5, // kg
    dimensions: { length: 20, width: 15, height: 10 }, // cm
    value: shoppingCart.total,
    currency: shoppingCart.currency,
  };

  // Store sends delivery request to customer's ConveyID
  const deliveryRequest = await storeConvey.sendDeliveryRequest(
    customerData.conveyId,
    packageDetails,
    'Thank you for your order! Your Cool Gadgets are on the way.',
    {
      requireSignature: true,
      allowLocker: true,
    }
  );

  console.log('✓ Delivery request sent');
  console.log(`  Request ID: ${deliveryRequest.id}`);
  console.log(`  From: ${deliveryRequest.from.full}`);
  console.log(`  To: ${deliveryRequest.to.full}`);
  console.log(`  Package: ${packageDetails.weight}kg, ${packageDetails.dimensions.length}x${packageDetails.dimensions.width}x${packageDetails.dimensions.height}cm`);
  console.log('');

  // ----------------------------------------------------------------------------
  // STEP 5: Customer Receives and Accepts Request
  // ----------------------------------------------------------------------------
  console.log('📥 STEP 5: Customer Receives & Accepts Request');
  console.log('-'.repeat(80));

  // Customer receives delivery request
  await customerConvey.receiveDeliveryRequest(deliveryRequest);
  console.log('✓ Delivery request received by customer');

  // Customer views pending requests
  const pendingRequests = customerConvey.getPendingRequests();
  console.log(`  Pending requests: ${pendingRequests.length}`);

  // Customer accepts request and selects address
  const deliveryResponse = await customerConvey.acceptDeliveryRequest(
    deliveryRequest.id,
    0 // Select first address
  );

  console.log('✓ Customer accepted delivery request');
  console.log(`  Selected PID: ${deliveryResponse.selectedAddress?.pid}`);
  console.log(`  ZKP Proof Type: ${deliveryResponse.zkpProof?.type}`);
  console.log('  ⚡ Address remains private! Only ZKP proof shared.');
  console.log('');

  // ----------------------------------------------------------------------------
  // STEP 6: Shipping Quote & Waybill Creation
  // ----------------------------------------------------------------------------
  console.log('🚚 STEP 6: Shipping & Waybill Creation');
  console.log('-'.repeat(80));

  // Create delivery flow
  const deliveryFlow = createDeliveryFlow(storeZKP, storeConvey);

  // Execute complete delivery workflow
  const workflow = await executeCompleteDeliveryWorkflow(
    deliveryFlow,
    deliveryRequest,
    deliveryResponse,
    customerAddress
  );

  console.log('✓ Shipping quotes received:');
  for (let i = 0; i < Math.min(3, workflow.quotes.length); i++) {
    const quote = workflow.quotes[i];
    console.log(`  ${i + 1}. ${quote.carrier.name} - ${quote.service}: ¥${quote.price} (${quote.estimatedDays} days)`);
  }

  console.log('');
  console.log('✓ Waybill created:');
  console.log(`  Tracking Number: ${workflow.waybill.number}`);
  console.log(`  Carrier: ${workflow.waybill.carrier.name}`);
  console.log(`  Service: ${workflow.waybill.service}`);
  console.log(`  Status: ${workflow.waybill.status}`);
  console.log(`  Estimated Delivery: ${new Date(workflow.waybill.estimatedDeliveryAt).toLocaleDateString()}`);
  console.log('');

  // ----------------------------------------------------------------------------
  // STEP 7: Carrier Access (Privacy-Preserving)
  // ----------------------------------------------------------------------------
  console.log('🔐 STEP 7: Carrier Access (Privacy-Preserving)');
  console.log('-'.repeat(80));

  console.log('✓ Carrier granted access to delivery address:');
  console.log(`  Carrier: ${workflow.carrierAccess.carrierDid}`);
  console.log(`  Waybill: ${workflow.carrierAccess.waybillNumber}`);
  console.log(`  Access Time: ${workflow.carrierAccess.accessedAt}`);
  console.log(`  Purpose: ${workflow.carrierAccess.purpose}`);
  console.log(`  Accessed Fields: ${workflow.carrierAccess.accessedFields.join(', ')}`);
  console.log('');
  console.log('  ⚡ Address only revealed to carrier for delivery!');
  console.log('  ⚡ Store never sees customer\'s physical address!');
  console.log('');

  // ----------------------------------------------------------------------------
  // STEP 8: Tracking Updates
  // ----------------------------------------------------------------------------
  console.log('📍 STEP 8: Delivery Tracking');
  console.log('-'.repeat(80));

  // Simulate tracking events
  await deliveryFlow.addTrackingEvent(workflow.waybill.number, {
    type: 'in_transit',
    description: 'Package in transit to Tokyo',
    location: 'Osaka Distribution Center',
    timestamp: new Date(Date.now() + 1000).toISOString(),
  });

  await deliveryFlow.addTrackingEvent(workflow.waybill.number, {
    type: 'arrived_at_facility',
    description: 'Arrived at destination facility',
    location: 'Shibuya Distribution Center',
    timestamp: new Date(Date.now() + 2000).toISOString(),
  });

  await deliveryFlow.addTrackingEvent(workflow.waybill.number, {
    type: 'out_for_delivery',
    description: 'Out for delivery',
    location: 'Shibuya',
    timestamp: new Date(Date.now() + 3000).toISOString(),
  });

  // Get tracking information
  const tracking = deliveryFlow.getTracking(workflow.waybill.number);
  
  console.log('✓ Tracking Events:');
  for (const event of tracking.events) {
    const time = new Date(event.timestamp).toLocaleTimeString();
    console.log(`  [${time}] ${event.description}`);
    if (event.location) {
      console.log(`             Location: ${event.location}`);
    }
  }
  console.log('');

  // ----------------------------------------------------------------------------
  // STEP 9: Delivery Completion
  // ----------------------------------------------------------------------------
  console.log('✅ STEP 9: Delivery Completion');
  console.log('-'.repeat(80));

  // Complete delivery
  const completion = await deliveryFlow.completeDelivery(workflow.waybill.number, {
    status: 'delivered',
    deliveredAt: new Date(Date.now() + 4000).toISOString(),
    location: 'Shibuya Building 4F',
    signature: 'Alice Tanaka',
    notes: 'Delivered to recipient',
  });

  console.log('✓ Delivery completed successfully!');
  console.log(`  Waybill: ${completion.waybillNumber}`);
  console.log(`  Status: ${completion.status}`);
  console.log(`  Delivered At: ${new Date(completion.deliveredAt).toLocaleString()}`);
  console.log(`  Location: ${completion.location}`);
  console.log(`  Signature: ${completion.signature}`);
  console.log('');

  // Final tracking status
  const finalTracking = deliveryFlow.getTracking(workflow.waybill.number);
  console.log(`✓ Final Status: ${finalTracking.waybill.status.toUpperCase()}`);
  console.log('');

  // ----------------------------------------------------------------------------
  // Summary
  // ----------------------------------------------------------------------------
  console.log('='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log('');
  console.log('Privacy Benefits:');
  console.log('  ✓ Customer used ConveyID instead of physical address');
  console.log('  ✓ Store never saw customer\'s real address');
  console.log('  ✓ ZKP proof validated delivery capability without revealing address');
  console.log('  ✓ Carrier received address only when needed for delivery');
  console.log('  ✓ All access was logged and auditable');
  console.log('');
  console.log('User Experience Benefits:');
  console.log('  ✓ No need to type long addresses');
  console.log('  ✓ One ConveyID works for all deliveries');
  console.log('  ✓ Easy to manage multiple delivery addresses');
  console.log('  ✓ Real-time tracking with privacy');
  console.log('  ✓ Mutual consent for every delivery');
  console.log('');
  console.log('Security Benefits:');
  console.log('  ✓ Cryptographic proof of address ownership');
  console.log('  ✓ Zero-knowledge proofs protect privacy');
  console.log('  ✓ Decentralized identity (DID) for authentication');
  console.log('  ✓ Audit trail for all address access');
  console.log('  ✓ Revocable credentials');
  console.log('');
  console.log('='.repeat(80));
  console.log('✨ E-COMMERCE CHECKOUT COMPLETE! ✨');
  console.log('='.repeat(80));
}

// ============================================================================
// Run Example
// ============================================================================

if (require.main === module) {
  runEcommerceCheckoutExample()
    .then(() => {
      console.log('\n✓ Example completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Example failed:', error);
      process.exit(1);
    });
}

export { runEcommerceCheckoutExample };
