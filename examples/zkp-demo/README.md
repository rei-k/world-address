# ZKP Demo Examples

This directory contains working examples demonstrating the ZKP Address Protocol in action.

## 📋 Available Examples

| Example | Description | Complexity |
|---------|-------------|------------|
| [basic-flow.ts](./basic-flow.ts) | Complete registration to delivery flow | ⭐ Beginner |
| [ecommerce-flow.ts](./ecommerce-flow.ts) | E-commerce checkout with ZKP | ⭐⭐ Intermediate |
| [locker-pickup.ts](./locker-pickup.ts) | Anonymous locker pickup | ⭐⭐ Intermediate |
| [address-migration.ts](./address-migration.ts) | Handle address changes | ⭐⭐ Intermediate |
| [friend-sharing.ts](./friend-sharing.ts) | Selective disclosure to friends | ⭐ Beginner |
| [integration-test.ts](./integration-test.ts) | Full integration test suite | ⭐⭐⭐ Advanced |

## 🚀 Quick Start

### Prerequisites

```bash
# Install dependencies
npm install @vey/core
```

### Running Examples

Each example is a standalone TypeScript file that you can run directly:

```bash
# Run basic flow example
npx tsx basic-flow.ts

# Run e-commerce example
npx tsx ecommerce-flow.ts

# Run locker pickup example
npx tsx locker-pickup.ts
```

### With Node.js

```bash
# Compile TypeScript first
npx tsc basic-flow.ts

# Run compiled JavaScript
node basic-flow.js
```

## 📚 Example Descriptions

### basic-flow.ts

**What it demonstrates:**
- Creating DID documents
- Registering addresses and getting credentials
- Generating and verifying ZK proofs
- Creating waybills
- Tracking delivery

**Output:**
```
✅ DID Document created
✅ Address credential issued
✅ Credential verified
✅ ZK proof generated
✅ Shipping request validated
✅ Waybill created: WB-001
✅ Package delivered
```

---

### ecommerce-flow.ts

**What it demonstrates:**
- Privacy-preserving checkout
- Merchant validates shipping destination without seeing address
- Multiple shipping conditions
- Order creation with PID token

**Scenario:**
1. User browses e-commerce site
2. User adds items to cart
3. At checkout, user proves valid shipping address with ZKP
4. Merchant verifies proof and creates order
5. Only carrier sees actual address at delivery time

**Output:**
```
🛍️  E-commerce Checkout Flow
================================

📦 Cart: 2 items, Total: $99.99
🔐 Generating privacy proof...
✅ Merchant verified valid shipping destination
✅ Order created: ORDER-12345
✅ PID token: JP-13-113-01
⏳ Merchant knows: Valid address in Japan
❌ Merchant does NOT know: Exact street address
```

---

### locker-pickup.ts

**What it demonstrates:**
- Anonymous locker access
- Facility-level verification
- ZK-Locker pattern
- PUDO (Pick Up Drop Off) use case

**Scenario:**
1. User orders package to locker
2. User proves they have a locker at the facility
3. Facility verifies proof without knowing which locker
4. User collects package anonymously

**Output:**
```
📫 Locker Pickup Flow
======================

🏢 Facility: FACILITY-SHIBUYA-STATION
🔐 Generating locker proof...
✅ Access granted to facility
✅ Locker verified (identity anonymous)
📦 Package ready for pickup
```

---

### address-migration.ts

**What it demonstrates:**
- Handling address changes (moving)
- Creating revocation entries
- Generating version proofs
- Maintaining continuity across moves

**Scenario:**
1. User moves from Tokyo to Osaka
2. Old address is revoked
3. New address is registered
4. Version proof links old and new PIDs
5. User maintains access to services

**Output:**
```
🏠 Address Migration Flow
==========================

📍 Old Address: JP-13-113-01 (Tokyo)
📍 New Address: JP-27-101-03 (Osaka)
🔐 Creating revocation entry...
✅ Old address revoked
✅ New address registered
✅ Version proof generated
✅ Continuity verified
✅ User can still use QR/NFC credentials
```

---

### friend-sharing.ts

**What it demonstrates:**
- Selective disclosure
- Sharing partial address with friends
- ZK-Selective Reveal pattern
- User-controlled privacy

**Scenario:**
1. User wants to share address with friend
2. User reveals only city and locker ID
3. Friend can send packages to locker
4. Full address remains private

**Output:**
```
👥 Friend Sharing Flow
=======================

🔓 Sharing with friend...
✅ Revealed: { city: 'Shibuya', locker_id: 'LOCKER-A-042' }
❌ Hidden: street address, building, room number
✅ Friend can send packages to locker
🔐 Privacy maintained
```

---

### integration-test.ts

**What it demonstrates:**
- Complete end-to-end flows
- All 4 main flows combined
- All 5 ZKP patterns
- Error handling
- Edge cases

**Includes:**
- ✅ Registration flow
- ✅ Shipping request flow
- ✅ Delivery flow
- ✅ Revocation flow
- ✅ Membership proofs
- ✅ Structure proofs
- ✅ Selective reveal proofs
- ✅ Version proofs
- ✅ Locker proofs

---

## 🔧 Customization

Each example can be customized by modifying the configuration:

```typescript
// Example: Change country and address
const CONFIG = {
  country: 'US', // Change to 'JP', 'GB', etc.
  pid: 'US-CA-90210',
  userDid: 'did:key:your-did',
  // ... more config
};
```

## 📖 Learning Path

**Recommended order:**

1. **Start here**: `basic-flow.ts` - Understand fundamentals
2. **Next**: `friend-sharing.ts` - Learn selective disclosure
3. **Then**: `ecommerce-flow.ts` - Real-world use case
4. **Advanced**: `locker-pickup.ts` - Complex pattern
5. **Advanced**: `address-migration.ts` - Lifecycle management
6. **Expert**: `integration-test.ts` - Full test suite

## 🧪 Testing

Run all examples as tests:

```bash
# Run integration tests
npm test -- examples/zkp-demo/integration-test.ts

# Or use the test script
npm run test:zkp-examples
```

## 🛠️ Development

### Adding New Examples

1. Create new `.ts` file in this directory
2. Follow the existing pattern:
   ```typescript
   import { /* functions */ } from '@vey/core';
   
   async function main() {
     console.log('🚀 Example Name');
     // ... example code
   }
   
   main().catch(console.error);
   ```
3. Update this README with description
4. Add to test suite

### Code Style

- Use emoji for visual clarity 🎨
- Add comments explaining each step
- Console.log key events
- Handle errors gracefully

## 📚 Additional Resources

- [ZKP Developer Guide](../../docs/zkp/developer-guide.md)
- [ZKP API Reference](../../docs/zkp-api.md)
- [ZKP Protocol Overview](../../docs/zkp-protocol.md)

## 🤝 Contributing

Found an issue or have a suggestion?

1. Open an issue on GitHub
2. Submit a pull request
3. Share your own example

## 📝 License

MIT License - see [LICENSE](../../LICENSE) for details
