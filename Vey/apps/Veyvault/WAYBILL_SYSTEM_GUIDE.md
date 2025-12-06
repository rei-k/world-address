# Waybill (Shipping Label) System - Complete Guide

## Overview

The Vey Waybill System is a world-class shipping label creation and management system that integrates with multiple international carriers. It supports all major carriers and provides intelligent carrier selection, automated failover, and comprehensive tracking capabilities.

## Supported Carriers

### Global Carriers
- **UPS (United Parcel Service)** - North America, Europe, Asia
- **FedEx** - Worldwide coverage
- **DHL Express** - International express delivery

### Regional Carriers
- **SF Express (顺丰速运)** - China and Hong Kong
- **JD Logistics (京东物流)** - China domestic
- **Yamato Transport (ヤマト運輸)** - Japan domestic

## Key Features

### 1. Multi-Carrier Support
- Single unified API for all carriers
- Automatic carrier selection based on route
- Performance-based carrier recommendations
- Intelligent fallback mechanisms

### 2. Standardized Waybill Formats
- Unified data model across carriers
- Automatic format conversion
- Support for international addresses
- Customs and duty handling

### 3. Smart Carrier Selection
- Route-based carrier filtering
- Cost optimization
- Delivery time optimization
- Reliability scoring
- Feature-based filtering

### 4. Vey Series Integration
- **VeyPOS**: QR code integration for pickup
- **VeyStore**: E-commerce waybill generation
- **VeyFinance**: Payment and insurance handling
- **Veyvault**: Secure address management with ZKP

### 5. Advanced Features
- Real-time tracking across all carriers
- Webhook notifications for status updates
- Batch waybill generation
- Performance monitoring
- Automatic retry with exponential backoff
- Circuit breaker pattern for failing carriers

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Vey Applications                         │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐  │
│  │ VeyStore │  │  VeyPOS  │  │ VeyFinance│  │ Veyvault │  │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └────┬─────┘  │
└───────┼─────────────┼───────────────┼──────────────┼────────┘
        │             │               │              │
        └─────────────┴───────────────┴──────────────┘
                              │
        ┌─────────────────────┴────────────────────────┐
        │      Waybill Multi-Carrier Service           │
        │  - Smart carrier selection                   │
        │  - Format conversion                         │
        │  - Performance monitoring                    │
        └────────────┬─────────────────────────────────┘
                     │
        ┌────────────┴─────────────────────────────────┐
        │          Carrier Registry                     │
        │  - Dynamic carrier registration               │
        │  - Performance metrics                        │
        │  - Recommendations                            │
        └────────────┬─────────────────────────────────┘
                     │
    ┌────────────────┼────────────────┬────────────┬───────┐
    │                │                │            │       │
┌───▼───┐    ┌──────▼──┐    ┌───────▼──┐  ┌──────▼──┐  │
│  UPS  │    │  FedEx  │    │   DHL    │  │  Yamato │ ...
│Adapter│    │ Adapter │    │  Adapter │  │ Adapter │
└───────┘    └─────────┘    └──────────┘  └─────────┘
```

## Usage Examples

### 1. Basic Waybill Creation

```typescript
import { createWaybill } from './services/waybill.service';

const waybill = await createWaybill({
  senderId: 'addr-123',
  receiverId: 'addr-456',
  senderType: 'self',
  receiverType: 'friend',
  packageInfo: {
    weight: 2.5,
    dimensions: {
      length: 30,
      width: 20,
      height: 10
    },
    description: 'Electronics',
    value: 5000,
    currency: 'JPY'
  }
}, userId);
```

### 2. Get Carrier Recommendations

```typescript
import { getCarrierRecommendations } from './services/waybill-multi-carrier.service';

const recommendations = await getCarrierRecommendations(
  waybill,
  senderAddress,
  recipientAddress,
  {
    maxCost: 3000,
    maxDeliveryDays: 3,
    serviceType: 'EXPRESS'
  }
);

// Returns sorted list of carriers by score
recommendations.forEach(rec => {
  console.log(`${rec.carrierName}: ${rec.score}/100`);
  console.log(`  Cost: ${rec.estimatedCost}`);
  console.log(`  Days: ${rec.estimatedDays}`);
  console.log(`  Confidence: ${rec.confidence}%`);
});
```

### 3. Submit with Smart Carrier Selection

```typescript
import { submitDeliveryWithSmartSelection } from './services/waybill-multi-carrier.service';

const result = await submitDeliveryWithSmartSelection(
  waybill,
  senderAddress,
  recipientAddress,
  {
    preferredCarrierId: 'yamato-transport',
    maxCost: 2000,
    serviceType: 'STANDARD'
  }
);

console.log(`Using carrier: ${result.carrierName}`);
console.log(`Tracking number: ${result.deliveryRequest.trackingNumber}`);
```

### 4. Compare Rates Across Carriers

```typescript
import { getMultiCarrierRateQuotes } from './services/waybill-multi-carrier.service';

const quotes = await getMultiCarrierRateQuotes(
  waybill,
  senderAddress,
  recipientAddress
);

// Returns quotes sorted by price
quotes.forEach(quote => {
  console.log(`${quote.carrierName}: ${quote.amount} ${quote.currency}`);
  console.log(`  Estimated delivery: ${quote.estimatedDays} days`);
});
```

### 5. Track Shipment

```typescript
import { trackShipmentUnified } from './services/waybill-multi-carrier.service';

const tracking = await trackShipmentUnified(
  'yamato-transport',
  'TRK123456789'
);

console.log(`Status: ${tracking.status}`);
console.log(`Location: ${tracking.currentLocation}`);

tracking.events.forEach(event => {
  console.log(`${event.timestamp}: ${event.description}`);
});
```

### 6. Batch Waybill Creation

```typescript
import { createWaybillsBatch } from './services/waybill.service';

const requests = [
  { senderId: 'addr-1', receiverId: 'addr-2', ... },
  { senderId: 'addr-1', receiverId: 'addr-3', ... },
  { senderId: 'addr-1', receiverId: 'addr-4', ... },
];

const waybills = await createWaybillsBatch(requests, userId);
```

### 7. Initialize Custom Carriers

```typescript
import { CarrierFactory, globalCarrierRegistry } from '@vey/carriers';

// Initialize specific carriers
CarrierFactory.initializeCarriers({
  'ups': {
    apiKey: 'your-ups-api-key',
    apiSecret: 'your-ups-secret',
    customerId: 'your-ups-account',
    environment: 'production'
  },
  'fedex': {
    apiKey: 'your-fedex-key',
    apiSecret: 'your-fedex-secret',
    customerId: 'your-fedex-account',
    environment: 'production'
  }
});
```

## Carrier-Specific Features

### UPS
- ✅ OAuth 2.0 authentication
- ✅ Address validation
- ✅ Signature required
- ✅ Insurance up to $50,000
- ✅ Saturday delivery
- ✅ International shipping

### FedEx
- ✅ Real-time rate quotes
- ✅ Pickup scheduling
- ✅ Hold at location
- ✅ Signature options
- ✅ International documents
- ✅ Freight shipping

### DHL Express
- ✅ Worldwide coverage
- ✅ Express delivery (1-3 days)
- ✅ Customs clearance support
- ✅ Dangerous goods handling
- ✅ Temperature controlled
- ✅ Signature on delivery

### SF Express (顺丰速运)
- ✅ China domestic & international
- ✅ Same-day delivery (selected cities)
- ✅ Cold chain logistics
- ✅ Insurance coverage
- ✅ Cash on delivery
- ✅ Pickup points

### JD Logistics (京东物流)
- ✅ E-commerce integration
- ✅ Fast delivery network
- ✅ Warehouse services
- ✅ White glove delivery
- ✅ Installation services
- ✅ Reverse logistics

### Yamato Transport (ヤマト運輸)
- ✅ Japan's #1 delivery service
- ✅ Cool delivery (refrigerated/frozen)
- ✅ Time-specified delivery
- ✅ Compact packages
- ✅ Cash on delivery
- ✅ Redelivery service

## Error Handling

The system includes comprehensive error handling:

```typescript
try {
  const result = await submitDeliveryWithSmartSelection(...);
} catch (error) {
  if (error.message === 'No suitable carriers found') {
    // Handle no available carriers
  } else if (error.message === 'All carriers failed') {
    // Handle all carrier failures
  } else {
    // Handle other errors
  }
}
```

## Performance Monitoring

Monitor carrier performance in real-time:

```typescript
import { getCarrierPerformanceMetrics } from './services/waybill-multi-carrier.service';

const metrics = getCarrierPerformanceMetrics();

metrics.forEach(metric => {
  console.log(`${metric.carrierId}:`);
  console.log(`  Success rate: ${metric.successRate}%`);
  console.log(`  Avg response time: ${metric.avgResponseTime}ms`);
  console.log(`  Total requests: ${metric.totalRequests}`);
});
```

## Webhook Integration

Subscribe to waybill events:

```typescript
import { subscribeToWebhooks } from './services/waybill.service';

await subscribeToWebhooks({
  userId: 'user-123',
  url: 'https://your-app.com/webhooks/waybill',
  events: [
    'waybill.created',
    'waybill.submitted',
    'delivery.picked_up',
    'delivery.in_transit',
    'delivery.delivered'
  ],
  secret: 'your-webhook-secret'
});
```

## VeyPOS Integration

Generate QR codes for pickup:

```typescript
import { generateVeyPOSQRCode } from './services/waybill.service';

const qrCode = generateVeyPOSQRCode(waybill);

// Display QR code at pickup location
// Courier scans QR code to confirm pickup
```

## Wallet Pass Generation

Create Google Wallet and Apple Wallet passes:

```typescript
import { 
  createGoogleWalletPass,
  createAppleWalletPass 
} from './services/waybill.service';

// Google Wallet
const googlePass = await createGoogleWalletPass(waybillId, userId);
// User can add to Google Wallet app

// Apple Wallet
const applePass = await createAppleWalletPass(waybillId, userId);
// User can add to Apple Wallet app
```

## Security

### ZKP (Zero-Knowledge Proof) Integration

Friend addresses are protected using ZKP:

```typescript
// When sending to a friend, address is not revealed
const waybill = await createWaybill({
  senderId: 'my-address-123',
  receiverId: 'friend-address-456',
  senderType: 'self',
  receiverType: 'friend', // ZKP token generated
  ...
}, userId);

// ZKP token proves delivery capability without revealing address
console.log(waybill.receiverZkpToken); // zkp_friend-address-456_1701234567890
```

## Best Practices

### 1. Always Handle Carrier Failures
Use smart selection with fallback carriers.

### 2. Monitor Performance
Track carrier success rates and switch if reliability drops.

### 3. Validate Addresses First
Use carrier address validation before creating shipments.

### 4. Cache Rate Quotes
Rate quotes are expensive - cache for 1-2 hours.

### 5. Use Webhooks
Don't poll for tracking updates - use webhooks.

### 6. Test in Sandbox
All carriers support sandbox environments for testing.

## Environment Variables

```bash
# UPS
UPS_API_KEY=your-api-key
UPS_API_SECRET=your-api-secret
UPS_CUSTOMER_ID=your-account-number
UPS_ENV=production

# FedEx
FEDEX_API_KEY=your-api-key
FEDEX_API_SECRET=your-api-secret
FEDEX_CUSTOMER_ID=your-account-number
FEDEX_ENV=production

# DHL Express
DHL_EXPRESS_API_KEY=your-api-key
DHL_EXPRESS_API_SECRET=your-api-secret
DHL_EXPRESS_CUSTOMER_ID=your-account-number
DHL_EXPRESS_ENV=production

# SF Express
SF_EXPRESS_API_KEY=your-api-key
SF_EXPRESS_API_SECRET=your-api-secret
SF_EXPRESS_CUSTOMER_ID=your-customer-code
SF_EXPRESS_ENV=production

# JD Logistics
JD_LOGISTICS_API_KEY=your-api-key
JD_LOGISTICS_API_SECRET=your-api-secret
JD_LOGISTICS_CUSTOMER_ID=your-customer-code
JD_LOGISTICS_ENV=production

# Yamato Transport
YAMATO_TRANSPORT_API_KEY=your-api-key
YAMATO_TRANSPORT_API_SECRET=your-api-secret
YAMATO_TRANSPORT_CUSTOMER_ID=your-customer-code
YAMATO_TRANSPORT_ENV=production
```

## Troubleshooting

### Carrier Not Available
Check if carrier supports your route:
```typescript
const carriers = await getAvailableCarriers('JP', 'US');
```

### High Costs
Compare rates across carriers:
```typescript
const quotes = await getMultiCarrierRateQuotes(...);
```

### Delivery Failures
Check carrier performance metrics and switch to more reliable carrier.

### API Timeouts
Carriers have different timeout settings. Adjust in config:
```typescript
{
  timeout: 60000, // 60 seconds for slower carriers
  retries: 5 // Increase retries
}
```

## Support

For issues or questions:
- GitHub Issues: https://github.com/rei-k/world-address-yaml/issues
- Documentation: https://github.com/rei-k/world-address-yaml/tree/main/docs
- Email: support@vey.com
