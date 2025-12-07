# ConveyID Protocol Architecture Diagrams

This document contains detailed architectural and flow diagrams for the ConveyID Delivery Protocol.

---

## State Transition Diagram

```
DRAFT → PENDING_RECIPIENT_CONFIRM → PENDING_SENDER_CONFIRM → CONFIRMED → DISPATCHED → IN_TRANSIT → DELIVERED
```

**Detailed State Machine:**

```
┌─────────┐
│  DRAFT  │ ← Order created by sender
└────┬────┘
     │
     ▼
┌───────────────────────┐
│ PENDING_RECIPIENT_    │ ← Notification sent to recipient
│     CONFIRM           │
└───┬───────────────────┘
    │
    │ Recipient selects address (PID)
    │
    ▼
┌───────────────────────┐
│ PENDING_SENDER_       │ ← Shipping cost calculated
│     CONFIRM           │
└───┬───────────────────┘
    │
    │ Sender confirms and pays
    │
    ▼
┌─────────────┐
│  CONFIRMED  │ ← Payment processed
└─────┬───────┘
      │
      │ Address disclosed to carrier
      │
      ▼
┌────────────┐
│ DISPATCHED │ ← Package shipped
└─────┬──────┘
      │
      ▼
┌────────────┐
│ IN_TRANSIT │ ← Package in delivery
└─────┬──────┘
      │
      ▼
┌────────────┐
│ DELIVERED  │ ← Delivery complete!
└────────────┘
```

---

## Protocol Layer Architecture

```
┌────────────────────────────────────────────────┐
│ Layer 7: Application Layer                    │
│ E-Commerce | Social Media | Messaging Apps    │
└────────────────────────────────────────────────┘
                     │
┌────────────────────▼───────────────────────────┐
│ Layer 6: ConveyID Protocol Layer               │
│ ID Parser | Delivery Manager | Payment Handler│
└────────────────────────────────────────────────┘
                     │
┌────────────────────▼───────────────────────────┐
│ Layer 5: Privacy & Security Layer              │
│ ZKP Engine | Encryption | Access Control      │
└────────────────────────────────────────────────┘
                     │
┌────────────────────▼───────────────────────────┐
│ Layer 4: Address Resolution Layer              │
│ PID Resolver | Namespace Router               │
└────────────────────────────────────────────────┘
                     │
┌────────────────────▼───────────────────────────┐
│ Layer 3: Carrier Integration Layer             │
│ FedEx API | DHL API | UPS API                 │
└────────────────────────────────────────────────┘
                     │
┌────────────────────▼───────────────────────────┐
│ Layer 2: Data Persistence Layer                │
│ User DB | Address Vault | Delivery History    │
└────────────────────────────────────────────────┘
```

---

## Namespace Resolution

```
           ┌─────────────┐
           │   .convey   │  (Root namespace)
           └──────┬──────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼───┐   ┌────▼────┐   ┌───▼────┐
│@convey│   │@jp.convey│  │@us.convey│
│(Global)│   │ (Japan) │  │  (USA)  │
└───┬───┘   └────┬────┘  └───┬────┘
    │            │            │
┌───▼───┐   ┌───▼───┐   ┌───▼───┐
│.store │   │ .work │   │ .gift │
└───────┘   └───────┘   └───────┘
```

---

## Data Flow: Address Privacy Protection

```
Sender              ConveyID System         Recipient         Carrier
  │                       │                     │               │
  │ alice@convey          │                     │               │
  │──────────────────────>│                     │               │
  │                       │                     │               │
  │                       │ Notification        │               │
  │                       │────────────────────>│               │
  │                       │                     │               │
  │                       │  Select PID: home   │               │
  │                       │<────────────────────│               │
  │                       │                     │               │
  │                       │ Resolve PID         │               │
  │                       │ (Decrypt address)   │               │
  │                       │─────────┐           │               │
  │                       │         │           │               │
  │                       │<────────┘           │               │
  │                       │                     │               │
  │                       │ Physical address    │               │
  │                       │─────────────────────────────────────>│
  │                       │                     │               │
```

**Privacy Guarantee**: Sender NEVER sees the physical address.

---

## ZKP Distance Proof Flow

```
Recipient Device     ZKP Service      ConveyID API     Carrier API
      │                   │                │              │
      │ Generate proof    │                │              │
      │ "60-120km range"  │                │              │
      ├──────────────────>│                │              │
      │                   │                │              │
      │  Signed proof     │                │              │
      │<──────────────────┤                │              │
      │                   │                │              │
      │ Submit proof      │                │              │
      ├──────────────────────────────────>│              │
      │                   │                │              │
      │                   │ Verify proof   │              │
      │                   │<───────────────┤              │
      │                   │                │              │
      │                   │                │ Get rate for │
      │                   │                │ 60-120km     │
      │                   │                ├─────────────>│
      │                   │                │              │
      │                   │                │  Rate: $15.50│
      │                   │                │<─────────────┤
      │                   │                │              │
      │ Cost: $15.50      │                │              │
      │<──────────────────────────────────┤              │
      │                   │                │              │
```

---

## E-Commerce Integration Architecture

```
┌────────────────────────────────────────────┐
│        E-Commerce Platform                 │
│  ┌──────────┐    ┌──────────┐    ┌──────┐│
│  │ Product  │───>│   Cart   │───>│Checkout││
│  └──────────┘    └──────────┘    └───┬──┘│
└───────────────────────────────────────┼───┘
                                        │
                                   REST API
                                        │
┌───────────────────────────────────────▼───┐
│        ConveyID Service                   │
│  ┌───────────┐  ┌──────────┐  ┌────────┐ │
│  │  Order    │─>│ Address  │─>│Carrier │ │
│  │  Manager  │  │ Resolver │  │ API    │ │
│  └───────────┘  └──────────┘  └────────┘ │
└───────────────────────────────────────────┘
```

---

## Security Architecture Layers

```
┌────────────────────────────────────────────────┐
│ Network Security (WAF, DDoS, TLS 1.3)         │
└────────────────────────────────────────────────┘
┌────────────────────────────────────────────────┐
│ Authentication (OAuth2, MFA, JWT)             │
└────────────────────────────────────────────────┘
┌────────────────────────────────────────────────┐
│ Data Protection (AES-256, ZKP, Key Rotation)  │
└────────────────────────────────────────────────┘
┌────────────────────────────────────────────────┐
│ Application Security (Input Validation, CSRF) │
└────────────────────────────────────────────────┘
┌────────────────────────────────────────────────┐
│ Monitoring & Audit (Logging, Anomaly Detect)  │
└────────────────────────────────────────────────┘
```

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-12-07
