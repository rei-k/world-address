# Recipient Resolver Module

**Email-like Delivery Recipient Determination**

The Recipient Resolver module provides email-like functionality for determining and validating delivery recipients in the ConveyID protocol. Just like email systems resolve recipients and apply delivery rules, this module handles recipient validation, acceptance policies, and address selection for package deliveries.

## Overview

The module extracts and organizes all recipient-related functionality from the ConveyID protocol into a clean, independent interface that mimics how email systems work:

- **Recipient Validation** - Like validating email addresses
- **Delivery Acceptance** - Like spam filters and email rules
- **Address Selection** - Like automatic folder organization
- **Contact Management** - Like address books and contact lists

## Key Features

### 🔍 Recipient Validation

Validate ConveyID format and check for reserved names:

```typescript
import { createRecipientResolver } from '@vey/integration';

const resolver = createRecipientResolver();
const result = resolver.validateRecipient('alice@convey');

if (result.valid) {
  console.log(`Valid ConveyID: ${result.conveyId.full}`);
} else {
  console.error(`Invalid: ${result.error}`);
}
```

### 🛡️ Delivery Acceptance Policies

Define rules for accepting or rejecting deliveries (like email filters):

```typescript
import { createStrictAcceptancePolicy } from '@vey/integration';

const policy = createStrictAcceptancePolicy();
// Requires manual approval for all deliveries
// Rejects anonymous senders

const acceptance = resolver.shouldAcceptDelivery(request, policy);
console.log(`Accepted: ${acceptance.accepted}`);
console.log(`Reason: ${acceptance.reason}`);
```

Available policy presets:
- `createDefaultAcceptancePolicy()` - Requires manual approval for all
- `createPermissiveAcceptancePolicy()` - Auto-accepts from friends/verified
- `createStrictAcceptancePolicy()` - Maximum security, rejects anonymous
- Custom policies with weight/value limits, namespace filters, country restrictions

### 📍 Smart Address Selection

Automatically select delivery addresses based on rules (like email folder rules):

```typescript
import { createDefaultAddressSelectionRules } from '@vey/integration';

const rules = createDefaultAddressSelectionRules();
// - Office during weekday daytime (9am-5pm)
// - Locker during night time (10pm-6am)
// - Home on weekends
// - Home for international deliveries

const selectedAddress = resolver.selectDeliveryAddress(
  request,
  addresses,
  rules
);
```

### 👥 Contact Management

Manage verified senders and friends (like contact lists):

```typescript
// Add verified senders
resolver.addVerifiedSender('shop@convey.store');
resolver.addVerifiedSender('courier@convey');

// Add friends
resolver.addFriend('bob@convey');
resolver.addFriend('alice@convey');

// Check status
if (resolver.isVerifiedSender(senderId)) {
  // Auto-accept delivery
}
```

## Architecture

### Module Structure

```
recipient-resolver.ts
├── Types & Interfaces
│   ├── DeliveryAcceptancePolicy
│   ├── AddressSelectionRule
│   ├── RecipientValidationResult
│   └── DeliveryAcceptanceResult
├── RecipientResolver Class
│   ├── validateRecipient()
│   ├── shouldAcceptDelivery()
│   ├── selectDeliveryAddress()
│   ├── addVerifiedSender()
│   └── addFriend()
└── Utility Functions
    ├── createDefaultAcceptancePolicy()
    ├── createDefaultAddressSelectionRules()
    └── mergeAcceptancePolicies()
```

### Integration with ConveyProtocol

The `ConveyProtocol` class now uses `RecipientResolver` internally:

```typescript
import { ConveyProtocol, createZKPIntegration } from '@vey/integration';

const zkp = createZKPIntegration({ environment: 'sandbox' });
const protocol = new ConveyProtocol(zkp);

// RecipientResolver is used automatically for:
// - Validating recipient ConveyIDs in sendDeliveryRequest()
// - Checking acceptance policies in receiveDeliveryRequest()
// - Selecting addresses in acceptDeliveryRequest()

// You can also access it directly:
const resolver = protocol.getRecipientResolver();
resolver.addVerifiedSender('shop@convey.store');
```

## Usage Examples

### Example 1: Basic Validation

```typescript
import { createRecipientResolver } from '@vey/integration';

const resolver = createRecipientResolver();

// Valid ConveyIDs
const valid = [
  'alice@convey',           // ✓
  'shop@convey.store',      // ✓
  'user.name@jp.convey',    // ✓
];

// Invalid ConveyIDs
const invalid = [
  'no-at-sign',             // ✗ Missing @
  '@convey',                // ✗ Missing local part
  'system@convey',          // ✗ Reserved name
];
```

### Example 2: Custom Acceptance Policy

```typescript
import type { DeliveryAcceptancePolicy } from '@vey/integration';

const customPolicy: DeliveryAcceptancePolicy = {
  autoAcceptFriends: true,
  autoAcceptVerified: true,
  requireManualApproval: false,
  blockedSenders: ['spam@convey'],
  allowedNamespaces: ['convey', 'convey.store'],
  maxWeight: 10, // kg
  maxValue: 50000, // JPY
  allowedCountries: ['JP', 'US', 'UK'],
};

const result = resolver.shouldAcceptDelivery(request, customPolicy);
```

### Example 3: Custom Address Selection Rules

```typescript
import type { AddressSelectionRule } from '@vey/integration';

const customRules: AddressSelectionRule[] = [
  {
    name: 'high_value_office',
    priority: 100,
    condition: {
      valueRange: { min: 50000 },
      dayOfWeek: [1, 2, 3, 4, 5],
      timeRange: { start: '09:00', end: '18:00' },
    },
    selectAddress: 'office',
  },
  {
    name: 'international_home',
    priority: 90,
    condition: {
      isInternational: true,
    },
    selectAddress: 'home',
  },
];

const selected = resolver.selectDeliveryAddress(request, addresses, customRules);
```

### Example 4: Merge Multiple Policies

```typescript
import { mergeAcceptancePolicies } from '@vey/integration';

const personalPolicy = createPermissiveAcceptancePolicy();
const companyPolicy = createStrictAcceptancePolicy();

// Merged policy uses most restrictive rules
const merged = mergeAcceptancePolicies(personalPolicy, companyPolicy);
```

## API Reference

### RecipientResolver Class

#### `validateRecipient(recipientId: string): RecipientValidationResult`

Validates a ConveyID format and checks for reserved names.

**Parameters:**
- `recipientId` - ConveyID string (e.g., "alice@convey")

**Returns:**
- `RecipientValidationResult` with validation status and parsed ConveyID or error

#### `shouldAcceptDelivery(request: DeliveryRequestInfo, policy: DeliveryAcceptancePolicy): DeliveryAcceptanceResult`

Checks if a delivery should be accepted based on the policy.

**Parameters:**
- `request` - Delivery request information
- `policy` - Acceptance policy to apply

**Returns:**
- `DeliveryAcceptanceResult` with acceptance decision and reason

#### `selectDeliveryAddress(request: DeliveryRequestInfo, addresses: AddressRegistration[], rules?: AddressSelectionRule[]): AddressRegistration | null`

Selects the best delivery address based on rules.

**Parameters:**
- `request` - Delivery request information
- `addresses` - Available addresses
- `rules` - Optional address selection rules

**Returns:**
- Selected address or null if none available

#### Contact Management Methods

- `addVerifiedSender(conveyId: string): void`
- `removeVerifiedSender(conveyId: string): void`
- `isVerifiedSender(conveyId: string): boolean`
- `addFriend(conveyId: string): void`
- `removeFriend(conveyId: string): void`
- `isFriend(conveyId: string): boolean`
- `getVerifiedSenders(): string[]`
- `getFriends(): string[]`

### Utility Functions

#### `createRecipientResolver(): RecipientResolver`

Creates a new RecipientResolver instance.

#### `createDefaultAcceptancePolicy(): DeliveryAcceptancePolicy`

Creates default policy that requires manual approval for all deliveries.

#### `createPermissiveAcceptancePolicy(): DeliveryAcceptancePolicy`

Creates permissive policy that auto-accepts from friends and verified senders.

#### `createStrictAcceptancePolicy(): DeliveryAcceptancePolicy`

Creates strict policy with maximum security (rejects anonymous, requires approval).

#### `createDefaultAddressSelectionRules(): AddressSelectionRule[]`

Creates default address selection rules:
- Office during weekday daytime
- Locker during night time
- Home on weekends
- Home for international deliveries

#### `mergeAcceptancePolicies(...policies: DeliveryAcceptancePolicy[]): DeliveryAcceptancePolicy`

Merges multiple policies, with more restrictive rules taking precedence.

## Types

### DeliveryAcceptancePolicy

```typescript
interface DeliveryAcceptancePolicy {
  autoAcceptFriends: boolean;
  autoAcceptVerified: boolean;
  requireManualApproval: boolean;
  blockedSenders: string[];
  allowedNamespaces?: string[];
  maxWeight?: number;
  maxValue?: number;
  allowedCountries?: string[];
  rejectAnonymous?: boolean;
}
```

### AddressSelectionRule

```typescript
interface AddressSelectionRule {
  name: string;
  priority: number;
  condition: AddressCondition;
  selectAddress: string;
}
```

### AddressCondition

```typescript
interface AddressCondition {
  dayOfWeek?: number[];
  timeRange?: { start: string; end: string };
  weightRange?: { min?: number; max?: number };
  valueRange?: { min?: number; max?: number };
  senderNamespace?: string[];
  isInternational?: boolean;
  senderCountry?: string[];
}
```

## Running Examples

```bash
cd Vey/integration

# Install dependencies
npm install

# Run the example file
npm run example:recipient-resolver
```

Or use ts-node directly:

```bash
ts-node examples/recipient-resolver-usage.ts
```

## Why This Module Exists

Before this module, recipient determination logic was scattered throughout the `convey-protocol.ts` file, making it hard to:

1. Understand recipient-related functionality
2. Reuse recipient logic in other contexts
3. Test recipient determination independently
4. Extend with new recipient features

By extracting this functionality into a dedicated module, we achieve:

- **Separation of Concerns** - Recipient logic is independent
- **Reusability** - Can be used outside ConveyProtocol
- **Testability** - Easy to test recipient logic in isolation
- **Maintainability** - Clear structure for recipient features
- **Email-like Familiarity** - Developers understand email analogies

## Comparison to Email Systems

| Email System | RecipientResolver |
|--------------|-------------------|
| Email validation | ConveyID validation |
| Spam filters | Acceptance policies |
| Inbox rules | Address selection rules |
| Contact lists | Verified senders & friends |
| Blocked senders | Blocked ConveyIDs |
| Auto-folder organization | Auto-address selection |

## Contributing

When adding new recipient-related features, they should go in this module if they involve:

- Recipient validation or lookup
- Delivery acceptance decisions
- Address selection logic
- Contact/relationship management
- Recipient preferences or policies

## License

MIT License - see [LICENSE](../../../LICENSE) file for details.
