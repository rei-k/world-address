# @vey/carriers

World-class carrier integration SDK for the Vey logistics ecosystem. Provides a unified interface for integrating with major international and regional logistics carriers.

## Features

- 🚚 **Unified API**: Single interface for all carriers (UPS, FedEx, DHL, SF Express, Yamato, etc.)
- 🤖 **Smart Selection**: AI-powered carrier recommendations based on route, cost, and speed
- 🔐 **Digital Handshake**: QR/NFC-based pickup and delivery confirmation
- 📍 **Address Standardization**: Convert addresses to carrier-specific formats
- 📦 **Pre-validation**: Check delivery possibility before courier arrival
- 🔄 **Real-time Tracking**: Unified tracking across all carriers
- 🌍 **Global Coverage**: Support for 6+ major carriers covering 200+ countries
- 📊 **Performance Monitoring**: Track carrier reliability and response times
- 🔁 **Automatic Fallback**: Intelligent failover when carriers are unavailable
- 💰 **Rate Comparison**: Compare costs across multiple carriers in real-time

## Supported Carriers

### Global Carriers
- ✅ **UPS** (United Parcel Service) - North America, Europe, Asia, 220+ countries
- ✅ **FedEx** - Worldwide express delivery, 220+ countries
- ✅ **DHL Express** - International express shipping, 220+ countries

### Regional Carriers

#### China
- ✅ **SF Express** (顺丰速运) - China's premium logistics provider
- ✅ **JD Logistics** (京东物流) - E-commerce logistics specialist

#### Japan
- ✅ **Yamato Transport** (ヤマト運輸) - Japan's #1 delivery service

### Coming Soon
- 🚧 **China Post** (中国邮政)
- 🚧 **Japan Post** (日本郵便)
- 🚧 **Royal Mail** (UK)
- 🚧 **USPS** (United States)
- 🚧 **Canada Post**

## Installation

```bash
npm install @vey/carriers
```

## Quick Start

### Installation

```bash
npm install @vey/carriers
```

### Basic Usage - UPS

```typescript
import { UPSAdapter } from '@vey/carriers';

// Initialize UPS adapter
const ups = new UPSAdapter({
  apiKey: 'your-ups-api-key',
  apiSecret: 'your-ups-secret',
  customerId: 'your-ups-account',
  environment: 'production'
});

// Create shipment
const order = await ups.createPickupOrder({
  shipment: {
    sender: {
      name: 'John Doe',
      phone: '5551234567',
      address: {
        country: 'US',
        province: 'CA',
        city: 'Los Angeles',
        street: '123 Main St',
        postalCode: '90001'
      }
    },
    recipient: {
      name: 'Jane Smith',
      phone: '5559876543',
      address: {
        country: 'US',
        province: 'NY',
        city: 'New York',
        street: '456 Broadway',
        postalCode: '10001'
      }
    },
    items: [
      {
        name: 'Electronics',
        quantity: 1,
        weight: 2.5,
        value: 500,
        currency: 'USD'
      }
    ],
    paymentMethod: 'SENDER_PAY'
  },
  pickupTime: 'ASAP',
  paymentMethod: 'SENDER_PAY'
});

console.log('Tracking:', order.trackingNumber);
console.log('Label:', order.labelUrl);
```

### Smart Carrier Selection

```typescript
import { globalCarrierRegistry, CarrierFactory } from '@vey/carriers';

// Initialize multiple carriers
CarrierFactory.initializeCarriers({
  'ups': { apiKey: '...', apiSecret: '...', customerId: '...', environment: 'production' },
  'fedex': { apiKey: '...', apiSecret: '...', customerId: '...', environment: 'production' },
  'dhl-express': { apiKey: '...', apiSecret: '...', customerId: '...', environment: 'production' }
});

// Get recommendations
const recommendations = await globalCarrierRegistry.getRecommendations(shipment, {
  origin: 'US',
  destination: 'JP',
  maxCost: 100,
  maxDeliveryDays: 5
});

// Use best carrier
const { result, carrierName } = await globalCarrierRegistry.createShipmentWithBestCarrier(
  shipment,
  pickupOrder
);

console.log(`Shipped with ${carrierName}: ${result.trackingNumber}`);
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
