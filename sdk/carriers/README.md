# @vey/carriers

Carrier integration SDK for Digital Handshake Logistics system. Provides unified interface for integrating with logistics carriers including SF Express (顺丰速运), JD Logistics (京东物流), and more.

## Features

- 🚚 **Unified API**: Single interface for multiple carriers
- 🔐 **Digital Handshake**: QR/NFC-based pickup and delivery confirmation
- 📍 **Address Standardization**: Convert addresses to carrier-specific formats
- 📦 **Pre-validation**: Check delivery possibility before courier arrival
- 🔄 **Real-time Tracking**: Integrated tracking with webhook support
- 🌍 **Chinese Logistics**: Specialized support for China's 4-tier address system

## Supported Carriers

- ✅ SF Express (顺丰速运) - China's premium logistics provider
- ✅ JD Logistics (京东物流) - E-commerce logistics specialist
- 🚧 China Post (中国邮政) - Coming soon
- 🚧 YTO Express (圆通速递) - Coming soon
- 🚧 ZTO Express (中通快递) - Coming soon

## Installation

```bash
npm install @vey/carriers
```

## Quick Start

### Basic Usage

```typescript
import { SFExpressAdapter } from '@vey/carriers';

// Initialize carrier adapter
const carrier = new SFExpressAdapter({
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
  customerId: 'your-customer-id',
  environment: 'production' // or 'sandbox'
});

// Validate shipment before creating order
const validation = await carrier.validateShipment({
  sender: {
    name: '张三',
    phone: '13800138000',
    address: {
      country: 'CN',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      street: '建国路1号',
      building: 'A座',
      unit: '1单元',
      room: '101室'
    }
  },
  recipient: {
    name: '李四',
    phone: '13900139000',
    address: {
      country: 'CN',
      province: '上海市',
      city: '上海市',
      district: '浦东新区',
      street: '陆家嘴环路1000号',
      postalCode: '200120'
    }
  },
  items: [
    {
      name: '电子产品',
      quantity: 1,
      weight: 2.5,
      value: 5000,
      currency: 'CNY'
    }
  ],
  paymentMethod: 'SENDER_PAY'
});

if (validation.deliverable) {
  console.log('可配送！预估费用:', validation.estimatedCost);
} else {
  console.log('不可配送:', validation.reason);
}
```

### Create Pickup Order

```typescript
// Create pickup order
const order = await carrier.createPickupOrder({
  shipment: {
    sender: { /* ... */ },
    recipient: { /* ... */ },
    items: [ /* ... */ ]
  },
  pickupTime: 'ASAP', // or specific Date
  paymentMethod: 'SENDER_PAY'
});

console.log('运单号:', order.waybillNumber);
console.log('追踪链接:', order.trackingUrl);
```

### Track Shipment

```typescript
const tracking = await carrier.trackShipment(order.waybillNumber);

console.log('当前状态:', tracking.currentStatus);
console.log('当前位置:', tracking.currentLocation);

tracking.events.forEach(event => {
  console.log(`${event.timestamp}: ${event.description} - ${event.location}`);
});
```

## Digital Handshake Protocol

### Generate Pickup Token

```typescript
import { createPickupToken } from '@vey/carriers';

const token = createPickupToken(
  order.waybillNumber,
  order.orderId,
  'SF_EXPRESS',
  privateKey,
  publicKey
);

// Display as QR code
console.log('QR Code Token:', token);
```

### Verify Handshake Token

```typescript
import { verifyHandshakeToken } from '@vey/carriers';

// Courier scans QR code
const verification = verifyHandshakeToken(scannedToken, privateKey, publicKey);

if (verification.valid) {
  console.log('Token verified!');
  console.log('Waybill:', verification.token.waybillNumber);
  
  // Proceed with pickup
  await confirmPickup(verification.token);
} else {
  console.log('Invalid token:', verification.reason);
}
```

## Address Standardization

```typescript
import { AddressMapper } from '@vey/carriers';

// Parse Chinese address string
const parsed = AddressMapper.parseChinaAddress(
  '北京市朝阳区建国路1号A座101室 100000'
);

// Normalize to structured format
const normalized = AddressMapper.normalize({
  country: 'CN',
  province: '北京市',
  city: '北京市',
  district: '朝阳区',
  street: '建国路1号',
  building: 'A座',
  room: '101室'
});

// Convert to SF Express format
const sfAddress = AddressMapper.toSFFormat(normalized);

// Convert to JD Logistics format
const jdAddress = AddressMapper.toJDFormat(normalized);
```

## JD Logistics Example

```typescript
import { JDLogisticsAdapter } from '@vey/carriers';

const jd = new JDLogisticsAdapter({
  apiKey: 'your-jd-api-key',
  apiSecret: 'your-jd-secret',
  customerId: 'your-customer-code',
  environment: 'production'
});

// Same API as SF Express
const validation = await jd.validateShipment(shipment);
const order = await jd.createPickupOrder(pickupOrder);
const tracking = await jd.trackShipment(waybillNumber);
```

## Advanced Features

### Custom Carrier Implementation

```typescript
import { CarrierAdapter } from '@vey/carriers';

class CustomCarrierAdapter extends CarrierAdapter {
  protected getBaseUrl(): string {
    return 'https://api.customcarrier.com';
  }

  async validateShipment(shipment: Shipment): Promise<ValidationResult> {
    // Implement validation logic
  }

  async createPickupOrder(order: PickupOrder): Promise<OrderResult> {
    // Implement order creation
  }

  async trackShipment(waybillNumber: string): Promise<TrackingInfo> {
    // Implement tracking
  }

  async cancelOrder(waybillNumber: string): Promise<CancelResult> {
    // Implement cancellation
  }

  async getQuote(shipment: Shipment): Promise<any> {
    // Implement quote calculation
  }

  protected async makeRequest(endpoint: string, method: string, data?: any): Promise<any> {
    // Implement API request
  }

  protected generateSignature(data: any): string {
    // Implement signature generation
  }
}
```

### Webhook Integration

```typescript
// Express.js example
app.post('/webhooks/sf-express', async (req, res) => {
  const event = req.body;
  
  switch (event.status) {
    case 'PICKED_UP':
      await notifyUser(event.waybillNumber, '荷物が集荷されました');
      break;
    case 'IN_TRANSIT':
      await notifyUser(event.waybillNumber, `輸送中: ${event.location}`);
      break;
    case 'DELIVERED':
      await notifyUser(event.waybillNumber, '配達完了');
      break;
  }
  
  res.json({ received: true });
});
```

## API Reference

### CarrierAdapter

Base class for all carrier adapters.

#### Methods

- `validateShipment(shipment: Shipment): Promise<ValidationResult>`
- `createPickupOrder(order: PickupOrder): Promise<OrderResult>`
- `trackShipment(waybillNumber: string): Promise<TrackingInfo>`
- `cancelOrder(waybillNumber: string, reason?: string): Promise<CancelResult>`
- `getQuote(shipment: Shipment): Promise<QuoteResult>`

### Types

```typescript
interface Shipment {
  sender: Sender;
  recipient: Recipient;
  items: CargoItem[];
  preferredPickupTime?: Date;
  deliveryRequirement?: 'STANDARD' | 'EXPRESS' | 'ECONOMY';
  paymentMethod: 'SENDER_PAY' | 'RECIPIENT_PAY' | 'THIRD_PARTY';
  insurance?: { value: number; currency: string };
  notes?: string;
}

interface ValidationResult {
  valid: boolean;
  deliverable: boolean;
  prohibitedItems: string[];
  estimatedCost?: { amount: number; currency: string };
  estimatedDeliveryTime?: { min: number; max: number };
  warnings?: string[];
  reason?: string;
}

enum TrackingStatus {
  ORDER_CREATED = 'ORDER_CREATED',
  PICKUP_SCHEDULED = 'PICKUP_SCHEDULED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  EXCEPTION = 'EXCEPTION',
  CANCELLED = 'CANCELLED'
}
```

## Environment Variables

```bash
# SF Express
SF_EXPRESS_API_KEY=your-api-key
SF_EXPRESS_API_SECRET=your-api-secret
SF_EXPRESS_CUSTOMER_ID=your-customer-id

# JD Logistics
JD_LOGISTICS_API_KEY=your-api-key
JD_LOGISTICS_API_SECRET=your-api-secret
JD_LOGISTICS_CUSTOMER_CODE=your-customer-code
```

## Testing

```bash
# Run tests
npm test

# Run tests in sandbox environment
SF_EXPRESS_ENV=sandbox npm test
```

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## Support

For issues and questions:
- GitHub Issues: https://github.com/rei-k/world-address-yaml/issues
- Documentation: https://github.com/rei-k/world-address-yaml/tree/main/docs
