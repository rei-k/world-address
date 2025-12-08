# Vey Integration API Reference

Complete API documentation for the Vey Integration SDK.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Classes](#core-classes)
  - [ZKPIntegration](#zkpintegration)
  - [ConveyProtocol](#conveyprotocol)
  - [DeliveryFlow](#deliveryflow)
- [Types](#types)
- [Examples](#examples)

---

## Installation

```bash
npm install @vey/integration @vey/core
```

```bash
yarn add @vey/integration @vey/core
```

```bash
pnpm add @vey/integration @vey/core
```

---

## Quick Start

### Basic E-Commerce Integration

```typescript
import {
  createSandboxIntegration,
  createConveyProtocol,
  createDeliveryFlow,
} from '@vey/integration';

// 1. Initialize ZKP integration
const integration = await createSandboxIntegration('your_api_key');

// 2. Create ConveyProtocol instance
const convey = createConveyProtocol(integration);

// 3. Register user with ConveyID
await convey.registerUser('alice', 'convey', 'Alice', {
  autoAcceptFriends: false,
  autoAcceptVerified: true,
  requireManualApproval: false,
  blockedSenders: [],
});

// 4. Add address (encrypted, privacy-preserving)
await convey.addAddress({
  userDid: integration.getUserDid(),
  pid: 'JP-13-113-01',
  countryCode: 'JP',
  hierarchyDepth: 3,
  fullAddress: {
    country: 'Japan',
    province: 'Tokyo',
    city: 'Shibuya',
    postalCode: '150-0001',
    street: 'Jingumae 1-2-3',
  },
});

// 5. Ready to receive deliveries!
```

---

## Core Classes

### ZKPIntegration

Main class for ZKP Address Protocol integration.

#### Constructor

```typescript
new ZKPIntegration(config: ZKPIntegrationConfig)
```

**Parameters:**
- `config.apiEndpoint` - API endpoint URL
- `config.apiKey` - API authentication key
- `config.environment` - 'sandbox' or 'production'
- `config.enableCircuits` - Enable circom circuits (default: false)
- `config.proofTimeout` - Proof generation timeout in ms (default: 30000)

#### Methods

##### `initialize()`

Initialize the integration with user identity.

```typescript
await integration.initialize(existingKeyPair?: { privateKey: string; publicKey: string })
```

**Returns:** `Promise<void>`

---

##### `registerAddress()`

Register a new address with ZKP credentials.

```typescript
await integration.registerAddress(registration: AddressRegistration)
```

**Parameters:**
```typescript
interface AddressRegistration {
  userDid: string;
  pid: string;
  countryCode: string;
  hierarchyDepth: number;
  fullAddress: {
    country: string;
    province?: string;
    city?: string;
    postalCode?: string;
    street?: string;
    building?: string;
    room?: string;
    recipient?: string;
  };
}
```

**Returns:** `Promise<VerifiableCredential>`

**Example:**
```typescript
const credential = await integration.registerAddress({
  userDid: integration.getUserDid(),
  pid: 'JP-13-113-01-T07-B12-R401',
  countryCode: 'JP',
  hierarchyDepth: 7,
  fullAddress: {
    country: 'Japan',
    province: 'Tokyo',
    city: 'Shibuya',
    postalCode: '150-0001',
    street: 'Jingumae 1-2-3',
    building: 'Shibuya Building 4F',
    room: '401',
    recipient: 'Alice Tanaka',
  },
});
```

---

##### `generateMembershipProof()`

Generate membership proof without revealing the actual address.

```typescript
await integration.generateMembershipProof(
  userPid: string,
  validPidSet: string[]
)
```

**Returns:** `Promise<{ proof: ZKProof; publicSignals: string[] }>`

**Example:**
```typescript
const { proof, publicSignals } = await integration.generateMembershipProof(
  'JP-13-113-01',
  ['JP-13-113-01', 'JP-27-100-05', 'US-CA-SF-001']
);
```

---

##### `generateSelectiveRevealProof()`

Generate proof revealing only selected fields.

```typescript
await integration.generateSelectiveRevealProof(
  fullAddress: AddressRegistration['fullAddress'],
  revealFields: (keyof AddressRegistration['fullAddress'])[]
)
```

**Returns:** `Promise<{ proof: ZKProof; publicSignals: string[]; revealedData: Partial<typeof fullAddress> }>`

**Example:**
```typescript
const { proof, publicSignals, revealedData } = await integration.generateSelectiveRevealProof(
  {
    country: 'Japan',
    province: 'Tokyo',
    city: 'Shibuya',
    postalCode: '150-0001',
    street: 'Jingumae 1-2-3',
  },
  ['country', 'postalCode'] // Only reveal these fields
);

console.log(revealedData); // { country: 'Japan', postalCode: '150-0001' }
```

---

##### `generateLockerProof()`

Generate locker access proof without revealing which locker.

```typescript
await integration.generateLockerProof(
  lockerId: string,
  facilityId: string,
  availableLockers: string[]
)
```

**Returns:** `Promise<{ proof: ZKProof; publicSignals: string[] }>`

**Example:**
```typescript
const { proof, publicSignals } = await integration.generateLockerProof(
  'LOCKER-A-015',
  'FACILITY-SHIBUYA-STATION',
  ['LOCKER-A-001', 'LOCKER-A-015', 'LOCKER-B-003']
);
```

---

##### `generateVersionProof()`

Generate proof for address migration (moving to new address).

```typescript
await integration.generateVersionProof(
  oldPid: string,
  newPid: string,
  userSecret: string
)
```

**Returns:** `Promise<{ proof: ZKProof; publicSignals: string[] }>`

**Example:**
```typescript
const { proof, publicSignals } = await integration.generateVersionProof(
  'JP-13-113-01', // Old address
  'JP-27-100-05', // New address
  'user_secret_key'
);
```

---

##### `verifyProof()`

Verify any ZKP proof.

```typescript
await integration.verifyProof(
  proof: ZKProof,
  publicSignals: string[],
  proofType: 'membership' | 'selective-reveal' | 'locker' | 'version'
)
```

**Returns:** `Promise<boolean>`

---

##### `handleDeliveryRequest()`

Handle ConveyID delivery request.

```typescript
await integration.handleDeliveryRequest(
  request: ConveyDeliveryRequest,
  userAddresses: AddressRegistration[]
)
```

**Returns:** `Promise<DeliveryAcceptance>`

---

##### `grantCarrierAccess()`

Grant carrier access to full address for delivery.

```typescript
await integration.grantCarrierAccess(
  waybillNumber: string,
  carrierDid: string,
  addressPid: string,
  fullAddress: AddressRegistration['fullAddress']
)
```

**Returns:** `Promise<CarrierAccess>`

---

##### `revokeAddress()`

Revoke address credential (e.g., after moving).

```typescript
await integration.revokeAddress(pid: string, reason: string)
```

**Returns:** `Promise<void>`

---

### ConveyProtocol

Protocol for email-like delivery using ConveyID.

#### Constructor

```typescript
new ConveyProtocol(zkpIntegration: ZKPIntegration)
```

#### Methods

##### `registerUser()`

Register user with ConveyID.

```typescript
await convey.registerUser(
  localPart: string,
  namespace: string,
  displayName: string,
  acceptancePolicy: DeliveryAcceptancePolicy
)
```

**Returns:** `Promise<ConveyUser>`

**Example:**
```typescript
const user = await convey.registerUser(
  'alice',
  'convey',
  'Alice Tanaka',
  {
    autoAcceptFriends: false,
    autoAcceptVerified: true,
    requireManualApproval: false,
    blockedSenders: [],
  }
);

console.log(user.conveyId.full); // 'alice@convey'
```

---

##### `addAddress()`

Add address to user's address book.

```typescript
await convey.addAddress(address: AddressRegistration)
```

**Returns:** `Promise<void>`

---

##### `sendDeliveryRequest()`

Send delivery request to recipient's ConveyID.

```typescript
await convey.sendDeliveryRequest(
  recipientConveyId: string,
  packageDetails: ConveyDeliveryRequest['package'],
  message?: string,
  preferences?: ConveyDeliveryRequest['preferences']
)
```

**Returns:** `Promise<DeliveryRequest>`

**Example:**
```typescript
const request = await convey.sendDeliveryRequest(
  'bob@convey',
  {
    weight: 1.5,
    dimensions: { length: 30, width: 20, height: 15 },
    value: 5000,
    currency: 'JPY',
  },
  'Thanks for your order!',
  {
    requireSignature: true,
    allowLocker: true,
  }
);
```

---

##### `acceptDeliveryRequest()`

Accept delivery request and generate ZKP proof.

```typescript
await convey.acceptDeliveryRequest(
  requestId: string,
  selectedAddressIndex?: number
)
```

**Returns:** `Promise<DeliveryResponse>`

**Example:**
```typescript
const response = await convey.acceptDeliveryRequest(request.id, 0);
console.log(response.zkpProof?.type); // 'selective-reveal'
```

---

##### `rejectDeliveryRequest()`

Reject delivery request.

```typescript
await convey.rejectDeliveryRequest(requestId: string, reason: string)
```

**Returns:** `Promise<DeliveryResponse>`

---

##### `getPendingRequests()`

Get all pending delivery requests.

```typescript
convey.getPendingRequests()
```

**Returns:** `DeliveryRequest[]`

---

##### `blockSender()` / `unblockSender()`

Block or unblock a sender by ConveyID.

```typescript
convey.blockSender(conveyId: string)
convey.unblockSender(conveyId: string)
```

**Returns:** `void`

---

### DeliveryFlow

Manages complete delivery lifecycle.

#### Constructor

```typescript
new DeliveryFlow(zkpIntegration: ZKPIntegration, conveyProtocol: ConveyProtocol)
```

#### Methods

##### `getShippingQuotes()`

Get shipping quotes from multiple carriers.

```typescript
await deliveryFlow.getShippingQuotes(
  fromPid: string,
  toPid: string,
  packageDetails: Waybill['package']
)
```

**Returns:** `Promise<ShippingQuote[]>`

**Example:**
```typescript
const quotes = await deliveryFlow.getShippingQuotes(
  'JP-13-113-01',
  'JP-27-100-05',
  {
    weight: 2.5,
    dimensions: { length: 40, width: 30, height: 20 },
    value: 10000,
    currency: 'JPY',
  }
);

// Sort by price
quotes.sort((a, b) => a.price - b.price);
console.log(`Cheapest: ${quotes[0].carrier.name} - ¥${quotes[0].price}`);
```

---

##### `createWaybill()`

Create waybill for delivery.

```typescript
await deliveryFlow.createWaybill(
  deliveryRequest: DeliveryRequest,
  deliveryResponse: DeliveryResponse,
  selectedQuote: ShippingQuote
)
```

**Returns:** `Promise<Waybill>`

---

##### `grantCarrierAccess()`

Grant carrier access to recipient's address.

```typescript
await deliveryFlow.grantCarrierAccess(
  waybillNumber: string,
  recipientPid: string,
  recipientAddress: AddressRegistration['fullAddress']
)
```

**Returns:** `Promise<CarrierAccess>`

---

##### `addTrackingEvent()`

Add tracking event.

```typescript
await deliveryFlow.addTrackingEvent(
  waybillNumber: string,
  event: Omit<TrackingEvent, 'id' | 'waybillNumber'>
)
```

**Returns:** `Promise<TrackingEvent>`

**Example:**
```typescript
await deliveryFlow.addTrackingEvent(waybillNumber, {
  type: 'in_transit',
  description: 'Package in transit',
  location: 'Tokyo Distribution Center',
  timestamp: new Date().toISOString(),
});
```

---

##### `getTracking()`

Get tracking information.

```typescript
deliveryFlow.getTracking(waybillNumber: string)
```

**Returns:** `{ waybill: Waybill; events: TrackingEvent[] }`

---

##### `completeDelivery()`

Complete delivery.

```typescript
await deliveryFlow.completeDelivery(
  waybillNumber: string,
  completion: Omit<DeliveryCompletion, 'waybillNumber'>
)
```

**Returns:** `Promise<DeliveryCompletion>`

---

## Convenience Functions

### `parseConveyID()`

Parse ConveyID string into components.

```typescript
import { parseConveyID } from '@vey/integration';

const id = parseConveyID('alice@convey');
console.log(id.localPart); // 'alice'
console.log(id.namespace);  // 'convey'
console.log(id.full);       // 'alice@convey'
```

---

### `formatConveyID()`

Format ConveyID from components.

```typescript
import { formatConveyID } from '@vey/integration';

const id = formatConveyID('alice', 'convey');
console.log(id); // 'alice@convey'
```

---

### `isValidConveyID()`

Validate ConveyID format.

```typescript
import { isValidConveyID } from '@vey/integration';

console.log(isValidConveyID('alice@convey')); // true
console.log(isValidConveyID('invalid'));      // false
```

---

### `generateConveyID()`

Generate ConveyID from username and purpose.

```typescript
import { generateConveyID } from '@vey/integration';

const personalId = generateConveyID('alice', 'personal');  // 'alice@convey'
const storeId = generateConveyID('shop', 'store');        // 'shop@convey.store'
const workId = generateConveyID('company', 'work');       // 'company@convey.work'
const anonId = generateConveyID('anon123', 'anonymous');  // 'anon123@anonymous.convey'
```

---

## Examples

See the [examples directory](./examples/) for complete examples:

- [E-Commerce Checkout](./examples/ecommerce-checkout.ts) - Complete checkout flow
- More examples coming soon!

---

## Support

- **Documentation**: https://docs.vey.com
- **API Reference**: https://api.vey.com/docs
- **GitHub**: https://github.com/rei-k/world-address-yaml
- **Issues**: https://github.com/rei-k/world-address-yaml/issues

---

## License

MIT License - See [LICENSE](../../../LICENSE)
