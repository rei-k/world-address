# 🌐 ConveyID Delivery Protocol Specification

**Version:** 1.1.0  
**Date:** 2026-01-02  
**Status:** Production Specification

---

## Executive Summary

**ConveyID** (e.g., `alice@convey`) is a global delivery ID protocol that enables users to initiate delivery requests as easily as sending an email, without exposing their physical addresses.

- **Sender**: Simply enters a ConveyID in one line (外向き: "宛先コード" / "Destination Code")
- **Recipient**: Selects a delivery address from their address book
- **Physical Address**: Only disclosed to the delivery carrier (ZKP-compatible)

This protocol allows deliveries worldwide without requiring address exchange.

### One-Line Summary

> **ConveyID is the world's first "email-like delivery protocol" that fundamentally improves international delivery UX and security through address privacy, gradual ZKP introduction, mutual consent, and global ID support.**

### Version 1.1.0 Updates

**New in v1.1.0** (2026-01-02):
- ✅ **Delivery Trust Levels**: 3-tier delivery history system (Basic/Continuous/Verified)
- ✅ **First-Time Delivery Exception Routes**: Official support for new users
- ✅ **Responsibility Boundaries**: Clear snapshot and liability definitions
- ✅ **Gradual ZKP Introduction**: 3-phase approach (Signature → Merkle → Full ZKP)
- ✅ **User-Facing Terminology**: Simplified external terminology mapping
- ✅ **Ecosystem Dependencies**: Explicit documentation of Vey uniqueness

---

## Table of Contents

- [1. Basic Concept](#1-basic-concept)
- [2. ConveyID Format](#2-conveyid-format)
- [3. Delivery Flow](#3-delivery-flow)
- [4. Privacy Protection with ZKP](#4-privacy-protection-with-zkp)
- [5. Delivery Acceptance Policies](#5-delivery-acceptance-policies)
- [6. Address Selection Rules](#6-address-selection-rules)
- [7. Anonymous Delivery Mode](#7-anonymous-delivery-mode)
- [8. Command Grammar](#8-command-grammar)
- [9. Timeout Management](#9-timeout-management)
- [10. Encrypted Delivery History](#10-encrypted-delivery-history)
- [11. Wallet Integration](#11-wallet-integration)
- [12. Social and Business Value](#12-social-and-business-value)
- [13. Implementation Guidelines](#13-implementation-guidelines)
- [14. API Specification](#14-api-specification)
- [15. Security Considerations](#15-security-considerations)
- [16. Delivery Trust Levels (NEW v1.1.0)](#16-delivery-trust-levels-new-v110)
- [17. First-Time Delivery Exceptions (NEW v1.1.0)](#17-first-time-delivery-exceptions-new-v110)
- [18. Responsibility Boundaries (NEW v1.1.0)](#18-responsibility-boundaries-new-v110)
- [19. Gradual ZKP Introduction (NEW v1.1.0)](#19-gradual-zkp-introduction-new-v110)
- [20. Terminology Mapping (NEW v1.1.0)](#20-terminology-mapping-new-v110)

---

## 1. Basic Concept

### Email-Like Delivery ID Protocol

ConveyID completely eliminates the need for address input and exchange traditionally required for deliveries, allowing delivery initiation with a simple command:

```
send this to alice@convey
```

**Key Features:**
- **Sender**: One-line input only
- **Recipient**: Select one address from address book
- **Physical Address**: Only disclosed to delivery carrier (ZKP-compatible)

**Global Capability:** Send packages anywhere in the world without knowing the address.

---

## 2. ConveyID Format

### 2.1 Basic Format

ConveyID follows the format:

```
<local-part>@<namespace>
```

**Examples:**
- `alice@convey`
- `shop@convey.store`
- `taro@jp.convey`

### 2.2 Namespace Structure

Multiple namespaces serve different purposes:

| Namespace | Purpose | Use Case |
|-----------|---------|----------|
| `@convey` | Global standard | Universal delivery |
| `@jp.convey` | Japan-specific | Domestic delivery priority in Japan |
| `@us.convey` | US-specific | Domestic delivery priority in USA |
| `@eu.convey` | EU-specific | EU delivery regulations |
| `@convey.store` | E-commerce | Online shop deliveries |
| `@convey.work` | Business | B2B deliveries |
| `@anonymous.convey` | Anonymous | Anonymous gift receiving |
| `@returns.convey` | Returns | Return shipment processing |
| `@gift.convey` | Gifts | Gift delivery specialized |

### 2.3 Hierarchical Structure

ConveyID supports hierarchical namespaces:

```
user@subdomain.convey
organization.department@convey.work
warehouse.location@convey.store
```

This enables **email-like scalability**.

---

## 3. Delivery Flow

### 3.1 State Machine

```
DRAFT → PENDING_RECIPIENT_CONFIRM → PENDING_SENDER_CONFIRM → CONFIRMED → DISPATCHED → IN_TRANSIT → DELIVERED
```

### 3.2 Detailed Flow (Mutual Consent Model)

#### Step 1: Sender Initiates

```
send to alice@convey
```

**State:** `DRAFT`

- Sender inputs ConveyID
- System creates a delivery order draft
- Notification sent to recipient

#### Step 2: Recipient Receives Notification

**Notification Message:**
```
"You have a delivery request. Will you accept? Please select an address."
```

**State:** `PENDING_RECIPIENT_CONFIRM`

#### Step 3: Recipient Selects Address

Recipient chooses one PID (Privacy ID for address mapping):

- **home** - Home address
- **office** - Office address
- **locker** - Package locker
- **friend** - Friend's address
- **hotel** - Temporary accommodation

**Automated Rules (Optional):**
```yaml
weekday_daytime: office
night_time: locker
international: home
weekend: home
```

**State:** `PENDING_SENDER_CONFIRM`

#### Step 4: Sender Confirms

Sender reviews:
- Estimated shipping cost
- Delivery timeframe
- Package contents

**State:** `CONFIRMED`

#### Step 5: Carrier Receives Address

Physical address is disclosed **only to the delivery carrier** (or via ZKP distance proof).

**State:** `DISPATCHED`

#### Step 6-7: Delivery Completion

**States:** `IN_TRANSIT` → `DELIVERED`

### 3.3 State Transition Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         ConveyID Delivery Flow                       │
└──────────────────────────────────────────────────────────────────────┘

┌─────────┐
│  DRAFT  │ Sender inputs ConveyID
└────┬────┘
     │
     ▼
┌─────────────────────────┐
│ PENDING_RECIPIENT_CONFIRM │ Recipient receives notification
└────┬────────────────────┘
     │
     ▼ Recipient selects address (PID)
┌─────────────────────────┐
│ PENDING_SENDER_CONFIRM  │ Sender reviews shipping cost
└────┬────────────────────┘
     │
     ▼ Sender confirms
┌─────────┐
│CONFIRMED│ Payment processed
└────┬────┘
     │
     ▼ Address disclosed to carrier
┌───────────┐
│DISPATCHED │ Package shipped
└────┬──────┘
     │
     ▼
┌───────────┐
│IN_TRANSIT │ Package in delivery
└────┬──────┘
     │
     ▼
┌───────────┐
│ DELIVERED │ Delivery complete
└───────────┘
```

---

## 4. Privacy Protection with ZKP

### 4.1 Principle

ConveyID **does not hold addresses**. Addresses are managed internally via **PID (Privacy ID for address mapping)** and resolved to the delivery carrier only when necessary.

### 4.2 ZKP (Zero-Knowledge Proof) Applications

#### 4.2.1 Delivery Feasibility Proof

Prove delivery capability **without revealing address**:

```
"This delivery is possible without revealing the exact address"
```

#### 4.2.2 Distance Range Disclosure

For shipping cost calculation, disclose **distance range only**:

```
"Distance: 60–120 km range"
"Same prefecture: Yes"
"International: No"
```

**Example ZKP Protocol:**
```json
{
  "proof_type": "distance_range",
  "range": {
    "min_km": 60,
    "max_km": 120
  },
  "same_country": true,
  "same_region": true,
  "proof": "0x..."
}
```

#### 4.2.3 Address Non-Disclosure

```
EC Site / SNS → Cannot see address
Sender → Cannot see address
Convey Server → Only encrypted metadata
Delivery Carrier → Minimum necessary information only
```

### 4.3 World's First "Privacy-Protected Delivery"

This establishes the world's first privacy-protected delivery system, compliant with international regulations (GDPR, etc.).

---

## 5. Delivery Acceptance Policies

### 5.1 Recipient Defense Mechanism

Recipients can set policies on their ConveyID to control what deliveries they accept:

```yaml
conveyid: alice@convey
policies:
  accepts: friends-only  # or 'anyone'
  international: true
  max_weight_kg: 5
  max_value_usd: 500
  allow_anonymous: true
  auto_reject:
    - expensive_items
    - hazardous_materials
    - perishables
  whitelist:
    - bob@convey
    - shop@convey.store
  blacklist:
    - spam@convey
```

### 5.2 Policy Examples

#### Conservative Policy
```yaml
accepts: friends-only
international: false
max_weight_kg: 2
allow_anonymous: false
```

#### Open Policy
```yaml
accepts: anyone
international: true
max_weight_kg: 20
allow_anonymous: true
```

#### Business Policy
```yaml
accepts: verified-businesses
international: true
max_weight_kg: 30
require_signature: true
```

### 5.3 Spam Delivery Prevention

Similar to **email spam filters**, ConveyID implements **delivery filtering**:

- Spam deliveries
- Harassment deliveries
- High-value unsolicited items
- Dangerous goods

All automatically blocked or flagged for review.

---

## 6. Address Selection Rules

### 6.1 Manual Selection

Recipient manually selects from registered addresses:

```
1. Home (123 Main St, Tokyo)
2. Office (456 Business Ave, Tokyo)
3. Locker (Station 7, Shibuya)
4. Friend's House (789 Friend St, Yokohama)
```

### 6.2 Automated Selection Rules

Define rules for automatic address selection:

```yaml
auto_selection_rules:
  - condition: weekday AND time_range(9:00, 18:00)
    address_pid: office
    
  - condition: night_time OR weekend
    address_pid: locker
    
  - condition: international_delivery
    address_pid: home
    
  - condition: large_package
    address_pid: warehouse
    
  - default: home
```

### 6.3 Context-Aware Selection

```javascript
// Pseudocode example
function selectAddress(delivery, recipient) {
  const now = new Date();
  const rules = recipient.autoSelectionRules;
  
  for (const rule of rules) {
    if (evaluateCondition(rule.condition, delivery, now)) {
      return rule.address_pid;
    }
  }
  
  return recipient.defaultAddress;
}
```

### 6.4 Smart Recommendations

The system can suggest optimal addresses based on:

- Time of delivery
- Package size
- Sender location
- Delivery urgency
- Weather conditions
- User's calendar/location data (with permission)

---

## 7. Anonymous Delivery Mode

### 7.1 Concept

```
anonymous@convey
```

Sender's personal information is hidden during delivery.

### 7.2 Use Cases

- **Anonymous Gifts**: Birthday surprises, congratulations
- **Privacy Protection**: Sensitive support, charity donations
- **Corporate Gifts**: Company promotional items
- **Secret Santa**: Holiday gift exchanges

### 7.3 Information Masking

```yaml
sender_info:
  name: "Anonymous Sender"
  email: hidden
  phone: hidden
  message: "Happy Birthday! From a friend."
  
visible_to_recipient:
  - Generic sender identifier
  - Gift message (optional)
  - Tracking number
  
hidden_from_recipient:
  - Sender's real name
  - Contact information
  - Payment details
```

### 7.4 Optional Reveal

Sender can allow recipient to respond:

```
Allow recipient to send thank you: Yes/No
Reveal identity after delivery: Yes/No (with delay option)
```

---

## 8. Command Grammar

### 8.1 EBNF Definition

```ebnf
Command     ::= Action ItemSpec Destination Options?
Action      ::= "send" | "ship" | "deliver"
ItemSpec    ::= Text | URL | SKU | FileRef | Quantity Item
Destination ::= "to" ConveyID
ConveyID    ::= LocalPart "@" Namespace
LocalPart   ::= AlphaNum+
Namespace   ::= Domain ("." Domain)*
Domain      ::= AlphaNum+
Options     ::= Option ("," Option)*
Option      ::= "urgent" | "signature-required" | "insurance:" Amount | "anonymous"
Quantity    ::= Number "x"
Item        ::= Text
Amount      ::= Number Currency
Currency    ::= "USD" | "EUR" | "JPY" | etc.
```

### 8.2 Example Commands

```
send this to alice@convey
send "birthday gift" to bob@convey, anonymous
ship SKU12345 to customer@convey.store, urgent
deliver 3x "coffee beans" to shop@jp.convey, signature-required
send package to friend@convey, insurance:100USD
```

### 8.3 Parsing Implementation

```javascript
// Pseudocode parser
function parseConveyCommand(commandString) {
  const pattern = /^(send|ship|deliver)\s+(.+?)\s+to\s+([a-z0-9]+@[a-z0-9.]+)(,\s*(.+))?$/i;
  const match = commandString.match(pattern);
  
  if (!match) {
    throw new Error('Invalid ConveyID command');
  }
  
  return {
    action: match[1],
    item: match[2],
    conveyId: match[3],
    options: match[5] ? parseOptions(match[5]) : []
  };
}
```

### 8.4 No NLP Required

The formal grammar allows **simple pattern matching** without natural language processing, enabling easy implementation across all EC/SNS platforms.

---

## 9. Timeout Management

### 9.1 Automatic Cancellation Rules

```yaml
timeouts:
  recipient_confirmation: 24h  # Recipient must select address within 24 hours
  sender_confirmation: 48h     # Sender must confirm cost within 48 hours
  payment_completion: 1h       # Payment must complete within 1 hour after confirmation
  carrier_pickup: 72h          # Carrier must pick up within 72 hours
```

### 9.2 Timeout Actions

```
PENDING_RECIPIENT_CONFIRM + 24h → AUTO_CANCELLED
PENDING_SENDER_CONFIRM + 48h → AUTO_EXPIRED
CONFIRMED (unpaid) + 1h → AUTO_CANCELLED
DISPATCHED (not picked up) + 72h → ALERT_SENDER
```

### 9.3 Notification Schedule

```
Recipient hasn't responded:
  - 12h: Reminder notification
  - 20h: Urgent reminder
  - 24h: Auto-cancel notification

Sender hasn't confirmed:
  - 24h: Reminder notification
  - 40h: Final warning
  - 48h: Auto-expiry notification
```

### 9.4 Grace Period

Optional grace period for special cases:

```yaml
grace_period:
  enabled: true
  duration: 2h
  notification: "Order will expire in 2 hours. Do you need more time?"
```

---

## 10. Encrypted Delivery History

### 10.1 End-to-End Encryption

Delivery history is encrypted and can only be opened by **sender and recipient**.

```
EC / SNS → Cannot see contents
Convey Server → Only encrypted metadata
Delivery Carrier → Minimum necessary information only
```

### 10.2 Encryption Scheme

```javascript
// Simplified encryption model
{
  "order_id": "uuid",
  "encrypted_data": {
    "item_description": encrypt(data, sender_key + recipient_key),
    "sender_message": encrypt(message, sender_key + recipient_key),
    "delivery_photos": encrypt(photos, sender_key + recipient_key)
  },
  "metadata": {
    "timestamp": "2025-12-07T10:00:00Z",
    "status": "DELIVERED",
    "tracking_hash": "hash_of_tracking_number"
  }
}
```

### 10.3 Key Management

```yaml
key_management:
  method: "Diffie-Hellman"
  sender_public_key: "pub_key_sender"
  recipient_public_key: "pub_key_recipient"
  shared_secret: derive(sender_private, recipient_public)
  encryption: "AES-256-GCM"
```

### 10.4 GDPR Compliance

```yaml
gdpr_compliance:
  data_minimization: true
  right_to_erasure: supported
  data_portability: supported
  encryption_at_rest: true
  encryption_in_transit: true
  retention_period: "7_years_or_user_defined"
```

---

## 11. Wallet Integration

### 11.1 NFC/QR Support

ConveyID can be stored in digital wallets for seamless delivery operations:

```
Google Wallet / Apple Wallet Integration
```

### 11.2 Use Cases

#### Convenience Store Pickup
```
1. Customer scans QR code at pickup terminal
2. Terminal reads ConveyID from wallet
3. Package automatically retrieved
```

#### Locker Pickup
```
1. Tap phone (NFC) on locker
2. ConveyID authenticates
3. Locker opens
```

#### Hotel Check-in
```
1. Show digital ConveyID at front desk
2. Hotel staff scans QR
3. Packages delivered to room
```

#### International Shipping Label
```
1. Sender initiates delivery
2. Generate QR code with encrypted ConveyID
3. Print shipping label with QR
4. Carrier scans QR for address resolution
```

### 11.3 Wallet Data Format

```json
{
  "type": "conveyid.delivery",
  "version": "1.0",
  "conveyid": "alice@convey",
  "display_name": "Alice Johnson",
  "qr_code": "data:image/png;base64,...",
  "nfc_data": {
    "ndef_message": "...",
    "tech_list": ["android.nfc.tech.Ndef"]
  },
  "preferences": {
    "default_address_pid": "home",
    "notification_enabled": true
  }
}
```

### 11.4 Security

```yaml
wallet_security:
  authentication: "biometric_or_pin"
  token_expiry: "5_minutes"
  one_time_qr: true  # QR code regenerates after each use
  geofencing: optional  # Only works within certain locations
```

---

## 12. Social and Business Value

### 12.1 Global Delivery ID Standard

**Stripe equivalent for deliveries**: Just as Stripe standardized PaymentID, ConveyID standardizes DeliveryID.

### 12.2 Form Elimination

**Fundamentally improves UX** for e-commerce worldwide by eliminating address input forms.

### 12.3 International Delivery Barriers Removed

Integration with **AMF × world-address** enables seamless cross-border deliveries.

### 12.4 Privacy-First Society

Create a society where **addresses don't need to be publicly shared**, balancing privacy and logistics.

### 12.5 Universal Application

Supports all delivery types:
- **B2C**: Business to Consumer
- **C2C**: Consumer to Consumer  
- **D2C**: Direct to Consumer
- **Friend Gifts**: Personal deliveries

**Nearly all deliveries** can be unified under one protocol.

### 12.6 Market Impact

```
Global E-commerce Checkout Forms: -80% input time
International Shipping Barriers: -60% complexity
Address Privacy Breaches: -95% risk
Delivery Spam: -90% with policies
Lost Deliveries: -40% with smart addressing
```

---

## 13. Implementation Guidelines

### 13.1 Integration Checklist for E-Commerce

```markdown
- [ ] Add "Send with ConveyID" button at checkout
- [ ] Implement ConveyID input field with validation
- [ ] Integrate with ConveyID API for order creation
- [ ] Handle recipient confirmation webhooks
- [ ] Display shipping cost after address confirmation
- [ ] Process payment after mutual consent
- [ ] Send order status updates
- [ ] Handle cancellations and refunds
```

### 13.2 Integration Checklist for Social Platforms

```markdown
- [ ] Add "Send Gift" feature with ConveyID
- [ ] Allow users to share their ConveyID in profiles
- [ ] Implement privacy controls for ConveyID visibility
- [ ] Support anonymous gift sending
- [ ] Integrate delivery notifications
- [ ] Add delivery history to user timeline
```

### 13.3 Implementation Phases

#### Phase 1: Basic Protocol (MVP)
- ConveyID registration and validation
- Basic delivery flow (DRAFT → DELIVERED)
- Simple address selection
- Standard notifications

#### Phase 2: Advanced Features
- ZKP distance proofs
- Automated address selection rules
- Delivery policies and filtering
- Anonymous delivery mode

#### Phase 3: Enterprise Features
- Wallet integration (NFC/QR)
- Multi-carrier support
- Advanced analytics
- White-label solutions

#### Phase 4: Global Scale
- Multi-language support
- Multi-currency support
- Regional namespace management
- Regulatory compliance automation

---

## 14. API Specification

### 14.1 REST API Endpoints

#### Create Delivery Order
```http
POST /api/v1/deliveries
Content-Type: application/json

{
  "recipient_conveyid": "alice@convey",
  "item_description": "Birthday gift",
  "item_value_usd": 50,
  "weight_kg": 1.2,
  "dimensions_cm": {
    "length": 30,
    "width": 20,
    "height": 10
  },
  "options": {
    "anonymous": false,
    "urgent": false,
    "insurance": 100
  }
}

Response: 201 Created
{
  "order_id": "ord_abc123",
  "status": "DRAFT",
  "recipient_conveyid": "alice@convey",
  "created_at": "2025-12-07T10:00:00Z",
  "expires_at": "2025-12-08T10:00:00Z"
}
```

#### Get Delivery Status
```http
GET /api/v1/deliveries/{order_id}

Response: 200 OK
{
  "order_id": "ord_abc123",
  "status": "PENDING_RECIPIENT_CONFIRM",
  "recipient_conveyid": "alice@convey",
  "sender_conveyid": "bob@convey",
  "created_at": "2025-12-07T10:00:00Z",
  "estimated_cost_usd": null,
  "estimated_delivery_date": null
}
```

#### Confirm Address (Recipient)
```http
POST /api/v1/deliveries/{order_id}/confirm-address
Content-Type: application/json

{
  "address_pid": "home"
}

Response: 200 OK
{
  "order_id": "ord_abc123",
  "status": "PENDING_SENDER_CONFIRM",
  "estimated_cost_usd": 15.50,
  "estimated_delivery_date": "2025-12-10"
}
```

#### Confirm Order (Sender)
```http
POST /api/v1/deliveries/{order_id}/confirm

Response: 200 OK
{
  "order_id": "ord_abc123",
  "status": "CONFIRMED",
  "payment_url": "https://pay.convey/ord_abc123",
  "total_cost_usd": 15.50
}
```

### 14.2 Webhook Events

```javascript
// Webhook payload structure
{
  "event": "delivery.status_changed",
  "timestamp": "2025-12-07T10:00:00Z",
  "data": {
    "order_id": "ord_abc123",
    "old_status": "CONFIRMED",
    "new_status": "DISPATCHED",
    "tracking_number": "1Z999AA10123456784"
  }
}
```

**Event Types:**
- `delivery.created`
- `delivery.status_changed`
- `delivery.address_confirmed`
- `delivery.payment_completed`
- `delivery.dispatched`
- `delivery.in_transit`
- `delivery.delivered`
- `delivery.cancelled`
- `delivery.failed`

### 14.3 SDK Examples

#### JavaScript/TypeScript
```typescript
import { ConveyClient } from '@convey/sdk';

const convey = new ConveyClient({ apiKey: 'your_api_key' });

// Create delivery
const order = await convey.deliveries.create({
  recipientConveyId: 'alice@convey',
  itemDescription: 'Birthday gift',
  itemValueUsd: 50,
  weightKg: 1.2
});

// Listen for status changes
convey.webhooks.on('delivery.status_changed', (event) => {
  console.log(`Order ${event.data.order_id} is now ${event.data.new_status}`);
});
```

#### Python
```python
from convey import ConveyClient

convey = ConveyClient(api_key='your_api_key')

# Create delivery
order = convey.deliveries.create(
    recipient_conveyid='alice@convey',
    item_description='Birthday gift',
    item_value_usd=50,
    weight_kg=1.2
)

# Get delivery status
status = convey.deliveries.get(order.order_id)
print(f"Status: {status.status}")
```

---

## 15. Security Considerations

### 15.1 Authentication and Authorization

```yaml
authentication:
  method: "OAuth 2.0 + OpenID Connect"
  mfa_required: true
  session_timeout: "15_minutes"
  refresh_token_rotation: enabled

authorization:
  model: "RBAC (Role-Based Access Control)"
  roles:
    - user
    - business
    - carrier
    - admin
  scopes:
    - "delivery:create"
    - "delivery:read"
    - "delivery:update"
    - "address:read"
    - "address:write"
```

### 15.2 Rate Limiting

```yaml
rate_limits:
  tier_free:
    requests_per_minute: 60
    deliveries_per_day: 10
  tier_pro:
    requests_per_minute: 300
    deliveries_per_day: 100
  tier_enterprise:
    requests_per_minute: 1000
    deliveries_per_day: unlimited
```

### 15.3 Data Protection

```yaml
data_protection:
  encryption_at_rest: "AES-256"
  encryption_in_transit: "TLS 1.3"
  key_rotation: "quarterly"
  backup_encryption: true
  geo_redundancy: true
  compliance:
    - GDPR
    - CCPA
    - SOC2
    - ISO27001
```

### 15.4 Fraud Prevention

```yaml
fraud_prevention:
  address_verification: enabled
  velocity_checks: enabled
  suspicious_pattern_detection: ml_based
  blacklist_check: enabled
  device_fingerprinting: enabled
  behavior_analysis: enabled
```

### 15.5 Audit Logging

```yaml
audit_logging:
  events_logged:
    - delivery_created
    - address_accessed
    - payment_processed
    - status_changed
    - policy_modified
  retention_period: "7_years"
  immutable_storage: true
  real_time_monitoring: true
```

---

## Appendix A: ConveyID vs Traditional Delivery

| Aspect | Traditional Delivery | ConveyID Protocol |
|--------|---------------------|-------------------|
| Address Input | Full address required | One-line ID only |
| Privacy | Address exposed to sender | Address never exposed |
| International | Complex forms | Same simple process |
| Updates | Manual address changes | Automatic via PID mapping |
| Spam Control | None | Policy-based filtering |
| Anonymous Sending | Difficult | Built-in support |
| Integration Effort | High (custom forms) | Low (standard protocol) |
| User Experience | 5-10 minutes checkout | 10 seconds checkout |

---

## Appendix B: Use Case Scenarios

### Scenario 1: International Gift
```
Alice (USA) wants to send a birthday gift to Bob (Japan)

1. Alice: "send birthday-gift to bob@jp.convey"
2. Bob receives notification on phone
3. Bob selects "home" address (Alice never sees it)
4. Alice sees estimated cost: $45
5. Alice confirms payment
6. Package ships automatically
7. Bob receives gift
```

### Scenario 2: E-Commerce Checkout
```
Customer buying from online store

1. Customer at checkout sees "Enter ConveyID"
2. Customer types: "customer@convey"
3. Store creates delivery request
4. Customer confirms home address via phone notification
5. Store sees shipping cost, adds to total
6. Customer completes payment
7. Order dispatched
```

### Scenario 3: Anonymous Donation
```
Donor wants to send supplies anonymously

1. Donor: "send supplies to shelter@convey, anonymous"
2. Shelter receives notification
3. Shelter selects warehouse address
4. Donor confirms without revealing identity
5. Supplies delivered with note: "From a friend"
```

### Scenario 4: Business Delivery
```
Company sending documents to remote employee

1. HR: "send documents to employee@company.convey.work"
2. Employee auto-rule selects current hotel address
3. HR confirms, company pays
4. Documents delivered to hotel front desk
5. Employee picks up with QR code from wallet
```

---

## Appendix C: Technical Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ConveyID System Architecture                │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Sender     │         │  Recipient   │         │   Carrier    │
│  Interface   │         │  Interface   │         │  Interface   │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │
       │ HTTPS/REST            │ HTTPS/REST            │ API
       ▼                        ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API Gateway                             │
│                    (Authentication & Rate Limiting)             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                          │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │  Delivery   │  │   Address    │  │    Notification     │   │
│  │  Service    │  │   Service    │  │     Service         │   │
│  └─────────────┘  └──────────────┘  └─────────────────────┘   │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │  Payment    │  │  ZKP Proof   │  │      Policy         │   │
│  │  Service    │  │   Service    │  │     Service         │   │
│  └─────────────┘  └──────────────┘  └─────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │   User DB    │  │  Address DB  │  │  Delivery History DB │ │
│  │  (PostgreSQL)│  │  (Encrypted) │  │    (Encrypted)       │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │  Cache       │  │  Queue       │  │   Object Storage     │ │
│  │  (Redis)     │  │  (RabbitMQ)  │  │   (S3/MinIO)        │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │  Payment     │  │  SMS/Email   │  │   Carrier APIs       │ │
│  │  Gateway     │  │  Provider    │  │   (FedEx, DHL, etc.) │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Appendix D: Regulatory Compliance

### GDPR Compliance

```yaml
gdpr:
  lawful_basis: "Consent & Contract"
  data_minimization: true
  purpose_limitation: "Delivery coordination only"
  storage_limitation: "7 years or until user deletion request"
  accuracy: "User-maintained addresses"
  integrity_confidentiality: "End-to-end encryption"
  rights_supported:
    - right_to_access
    - right_to_rectification
    - right_to_erasure
    - right_to_restrict_processing
    - right_to_data_portability
    - right_to_object
```

### International Standards

```yaml
compliance:
  iso_27001: "Information Security Management"
  soc2_type2: "Service Organization Controls"
  pci_dss: "Payment Card Industry (if handling cards)"
  wcag_aa: "Web Content Accessibility"
  gdpr: "EU Data Protection"
  ccpa: "California Consumer Privacy Act"
  pipeda: "Canada Personal Information Protection"
  appi: "Japan Act on Protection of Personal Information"
```

---

## 16. Delivery Trust Levels (NEW v1.1.0)

### Overview

ConveyID v1.1.0 introduces a 3-tier delivery trust system to differentiate between first-time deliveries and established delivery relationships.

### Trust Levels

```typescript
export enum DeliveryTrustLevel {
  NONE = 0,      // No delivery history
  BASIC = 1,     // At least 1 successful delivery
  CONTINUOUS = 2, // 3+ deliveries in last 90 days
  VERIFIED = 3,   // Direct delivery with ID verification
}
```

### Level Determination

| Level | Criteria | UI Display | Benefits |
|-------|----------|------------|----------|
| **None (0)** | No delivery history | `新規` / `New` | Standard rates, requires approval |
| **Basic (1)** | 1+ successful delivery | `✓ 配送実績あり` | Standard service |
| **Continuous (2)** | 3+ deliveries (90 days) | `✓✓ 継続配送先` | 5-10% discount, priority |
| **Verified (3)** | Direct + ID verified | `✓✓✓ 本人確認済み` | 10-15% discount, premium |

### Implementation

```typescript
interface DeliveryHistoryRecord {
  addressId: string;
  trustLevel: DeliveryTrustLevel;
  totalDeliveries: number;
  recentDeliveries: number;
  directDeliveries: number;
  verifiedDeliveries: number;
  firstDeliveryDate: string;
  lastDeliveryDate: string;
  lastDeliveryWithinDays: number;
}

function calculateDeliveryTrustLevel(
  history: DeliveryHistoryRecord
): DeliveryTrustLevel {
  if (history.totalDeliveries === 0) return DeliveryTrustLevel.NONE;
  
  if (
    history.recentDeliveries >= 3 &&
    history.directDeliveries >= history.totalDeliveries * 0.9 &&
    history.verifiedDeliveries >= history.totalDeliveries * 0.5 &&
    history.lastDeliveryWithinDays <= 90
  ) {
    return DeliveryTrustLevel.VERIFIED;
  }
  
  if (
    history.recentDeliveries >= 3 &&
    history.lastDeliveryWithinDays <= 90
  ) {
    return DeliveryTrustLevel.CONTINUOUS;
  }
  
  return DeliveryTrustLevel.BASIC;
}
```

**See Also**: [Delivery Trust System Documentation](./DELIVERY_TRUST_SYSTEM.md)

---

## 17. First-Time Delivery Exceptions (NEW v1.1.0)

### Problem

Without delivery history, new users face barriers to receiving deliveries. This creates a "cold start" problem.

### Solution: 4 Official Exception Routes

#### Route 1: Recipient Pre-Approval

```
1. Sender creates delivery request
2. Recipient receives "First-Time Delivery" notification
3. Recipient explicitly approves (address + approval button)
4. Delivery proceeds
```

**Security**:
- ✅ Explicit recipient consent
- ✅ Sender identity verification via ConveyID
- ✅ Item description disclosed upfront

#### Route 2: Depot/Locker Delivery

```
1. Sender creates delivery request
2. Recipient selects public locker as destination
3. Carrier delivers to locker
4. Recipient picks up from locker
```

**Benefits**:
- 🏢 No home address disclosure
- 🔐 Privacy protection
- ⏰ 24/7 pickup availability

#### Route 3: One-Time Address Token

```
1. Sender creates delivery request
2. Recipient issues one-time address token
3. Address disclosed to carrier only (encrypted)
4. Token auto-deleted after delivery
```

**Security**:
- 🔐 Encrypted temporary token
- ⏱️ Expires in 24-72 hours
- 🗑️ Auto-deleted after use
- 👁️ Access logging

#### Route 4: Friend/Acquaintance Introduction

```
1. Existing user introduces new user
2. Trust level inherited (1 level lower)
3. New user's first delivery approved
4. Valid for first 3-5 deliveries
```

**Trust Inheritance**:
- 📊 Introducer must be Level 2+
- 🔄 New user starts 1 level lower
- ⏱️ Valid for 90 days

### API Example

```typescript
interface FirstTimeDeliveryRequest {
  requestId: string;
  senderConveyId: string;
  recipientConveyId: string;
  itemDescription: string;
  requiresApproval: true;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  exceptionRoute: 'approval' | 'locker' | 'one_time' | 'introduction';
}
```

**See Also**: [Delivery Trust System - Exception Routes](./DELIVERY_TRUST_SYSTEM.md#初回配送例外ルート--first-time-delivery-exception-routes)

---

## 18. Responsibility Boundaries (NEW v1.1.0)

### Problem

Unclear responsibility boundaries lead to disputes about:
- Misdeliveries
- Address changes during transit
- Rejected deliveries

### Solution: Clear Boundary Definitions

#### Boundary 1: Snapshot at Delivery ID Resolution

```typescript
interface DeliverySnapshot {
  snapshotId: string;
  deliveryId: string;
  resolvedAddress: string; // encrypted
  resolvedAt: string;
  validUntil: string;
  addressVersion: number;
  snapshotHash: string; // immutable proof
}
```

**Principle:**
> "Address information at Delivery ID resolution time is frozen as a snapshot"

**Responsibility:**
- ✅ Vey responsible for correct address resolution
- ✅ Address changes after snapshot apply to next delivery only
- ✅ Snapshot is immutable

#### Boundary 2: Carrier Responsibility After Dispatch

```
┌─────────────────┐
│  Delivery ID    │  ← Vey Responsibility
│  Resolution     │     (Address resolution)
└────────┬────────┘
         │ 📸 Snapshot
         ▼
┌─────────────────┐
│  Address        │  ← Vey Responsibility
│  Transmission   │     (Address transmission)
└────────┬────────┘
         │ 🚚 Dispatch
         ▼
┌─────────────────┐
│  Physical       │  ← Carrier Responsibility
│  Delivery       │     (Physical delivery)
└─────────────────┘
```

**Carrier Responsibilities:**
- 📦 Physical delivery execution
- 🚚 Tracking updates
- 📞 Recipient communication
- 🔄 Redelivery attempts

**Outside Vey's Responsibility:**
- ❌ Delivery delays (weather, traffic)
- ❌ Package damage (transit accidents)
- ❌ Recipient absence
- ❌ Address changes after dispatch

#### Boundary 3: Address Changes Apply to Next Delivery

**Principle:**
> "Address changes do not affect in-transit orders"

**Implementation:**

```typescript
interface AddressChangePolicy {
  effectiveFrom: 'next_delivery';
  inTransitDeliveries: 'use_old_address';
  notifyUser: true;
  warningMessage: string;
}
```

**User Notification:**
```
⚠️ Address Change Notice

New address will be used from next delivery.

In-transit orders (2):
  • Order #12345 → Old Address
  • Order #12346 → Old Address

Future orders → New Address

[OK]
```

#### Boundary 4: Rejected Delivery Responsibility

| Rejection Reason | Responsible Party | Shipping Refund | Item Refund |
|------------------|-------------------|-----------------|-------------|
| Recipient refused (no reason) | Recipient | None | None |
| Incorrect address (Vey's fault) | Vey | Full | Full |
| Incorrect address (Sender's fault) | Sender | None | Full (to sender) |
| Unable to deliver (Carrier's fault) | Carrier | Full | Full |
| Recipient absent (redeliver possible) | Shared | Partial | None |

**See Also**: [Delivery Trust System - Responsibility Boundaries](./DELIVERY_TRUST_SYSTEM.md#責任境界の定義--responsibility-boundaries)

---

## 19. Gradual ZKP Introduction (NEW v1.1.0)

### Problem

Full ZKP implementation from day one creates heavy operational burden and delays launch.

### Solution: 3-Phase Gradual Introduction

#### Phase 1: Signature + Log Proof (MVP - 6 months)

**Timeline:** MVP ~ First 6 months  
**Technical Requirements:** Low  
**Security Level:** Basic

```typescript
interface SignatureProof {
  deliveryId: string;
  signature: string; // Ed25519
  signerDid: string; // Carrier DID
  dataHash: string;
  timestamp: string;
  type: 'signature_proof';
}
```

**Benefits:**
- ✅ Easy to implement
- ✅ Low operational cost
- ✅ Tamper-proof records
- ✅ Integrates with existing systems

**Limitations:**
- ⚠️ Limited privacy protection
- ⚠️ Address encrypted but not hidden

#### Phase 2: Merkle Inclusion Proof (6-12 months)

**Timeline:** 6-12 months  
**Technical Requirements:** Medium  
**Security Level:** Enhanced

```typescript
interface MerkleInclusionProof {
  deliveryId: string;
  merkleRoot: string;
  merklePath: string[];
  leafHash: string;
  treeDepth: number;
  type: 'merkle_proof';
}
```

**Benefits:**
- ✅ Proves membership in delivery set
- ✅ Hides individual delivery details
- ✅ Efficient verification
- ✅ Blockchain integration possible

**Limitations:**
- ⚠️ Not full ZKP
- ⚠️ Some information may leak

#### Phase 3: Full ZKP (zk-SNARK) (After 1 year)

**Timeline:** 1+ years  
**Technical Requirements:** High  
**Security Level:** Maximum

```typescript
interface ZKSNARKProof {
  deliveryId: string;
  proof: string; // zk-SNARK proof
  publicSignals: string[];
  verificationKeyHash: string;
  circuitType: 'membership' | 'structure' | 'selective_reveal';
  type: 'zksnark_proof';
}
```

**Benefits:**
- ✅ Maximum privacy protection
- ✅ Address completely hidden
- ✅ Selective disclosure
- ✅ International compliance

**Requirements:**
- 🔐 Trusted Setup Ceremony
- 🧪 Formal Circuit Verification
- 🛡️ External Security Audit
- 💻 High-performance proof servers

### Migration Strategy

```
Phase 1 (MVP)     Phase 2 (Growth)   Phase 3 (Mature)
[0-6 months]      [6-12 months]      [12+ months]
     │                  │                  │
     ▼                  ▼                  ▼
Signature+Log      Merkle Tree         Full ZKP
✓ Low cost         ✓ Better privacy    ✓ Best privacy
✓ Fast launch      ✓ Medium cost       ✓ Higher cost
```

**Parallel Operation:**
```
Month 0-6:   Phase 1 only
Month 6-12:  Phase 1 + Phase 2 (hybrid)
Month 12-18: Phase 1 + Phase 2 + Phase 3 (hybrid)
Month 18+:   Phase 2 + Phase 3 (Phase 1 deprecation)
```

**See Also**: [Delivery Trust System - ZKP Gradual Introduction](./DELIVERY_TRUST_SYSTEM.md#zkp段階導入--gradual-zkp-introduction)

---

## 20. Terminology Mapping (NEW v1.1.0)

### Problem

Internal technical terminology creates high explanation cost for non-technical users.

### Solution: Separate Internal and External Terminology

| Internal Term | External (Japanese) | External (English) | Usage Context |
|---------------|--------------------|--------------------|---------------|
| **Delivery ID** | 宛先コード | Destination Code | UI, Documentation |
| **ConveyID** | 配送アドレス | Delivery Address | UI, Marketing |
| **ZKP** | ー (not displayed) | ー (not displayed) | Internal only |
| **実在性証明** | 配送実績 | Delivery History | UI, User-facing |
| **PID** | 住所番号 | Address Number | Internal only |
| **Merkle Tree** | 配送記録 | Delivery Records | Internal only |
| **zk-SNARK** | 高度な暗号化 | Advanced Encryption | Docs (simplified) |
| **Commitment** | 保証証明 | Proof of Guarantee | Internal only |
| **Verification Key** | 検証コード | Verification Code | Technical docs only |
| **Trusted Setup** | セキュリティ設定 | Security Setup | Admin interface |

### UI/UX Guidelines

#### ❌ Avoid These Expressions

```
✗ "Generating ZKP proof..."
✗ "Registering to Merkle tree..."
✗ "Select PID-A"
✗ "Verifying commitment hash..."
```

#### ✅ Use These Instead

```
✓ "Confirming delivery address..."
✓ "Checking delivery history..."
✓ "Select address"
✓ "Verifying delivery records..."
```

### Documentation Usage

**Technical Documentation** (Internal terminology):
- 📘 Developer Guides
- 📗 API Reference
- 📕 Architecture Diagrams

**User Documentation** (External terminology):
- 📙 User Guides
- 📔 FAQ
- 📰 Marketing Materials

**See Also**: [Delivery Trust System - Terminology Mapping](./DELIVERY_TRUST_SYSTEM.md#用語対応表--terminology-mapping)

---

## Appendix E: Glossary

| Term | Definition |
|------|------------|
| **ConveyID** | A unique delivery identifier in the format `user@namespace` |
| **PID** | Privacy ID - Internal identifier mapping to physical addresses |
| **ZKP** | Zero-Knowledge Proof - Cryptographic proof without revealing data |
| **EBNF** | Extended Backus-Naur Form - Formal grammar notation |
| **Namespace** | Domain portion of ConveyID (e.g., `@convey`, `@jp.convey`) |
| **Delivery Policy** | User-defined rules for accepting deliveries |
| **Auto-Selection** | Automatic address selection based on predefined rules |
| **Anonymous Mode** | Delivery without revealing sender's identity |
| **Mutual Consent** | Both sender and recipient must confirm before delivery |
| **Address PID** | Privacy-preserving identifier for a physical address |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-07 | Initial comprehensive specification |
| 1.1.0 | 2026-01-02 | Added delivery trust levels, first-time exceptions, responsibility boundaries, gradual ZKP, terminology mapping |

---

## License

This specification is released under the **MIT License**.

```
Copyright (c) 2025 Vey Ecosystem

Permission is hereby granted, free of charge, to any person obtaining a copy
of this specification and associated documentation files...
```

---

## Contact and Contribution

For questions, suggestions, or contributions to this specification:

- **GitHub**: https://github.com/rei-k/world-address
- **Email**: convey-protocol@vey.world
- **Specification Discussion**: https://github.com/rei-k/world-address/discussions

---

**End of ConveyID Delivery Protocol Specification v1.0.0**
