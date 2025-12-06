# Carrier SDK Examples

This directory contains practical examples demonstrating how to use the Carrier SDK.

## Running Examples

```bash
# Install dependencies
npm install

# Set up environment variables (optional)
export UPS_API_KEY=your-key
export UPS_API_SECRET=your-secret
export UPS_CUSTOMER_ID=your-account

export FEDEX_API_KEY=your-key
export FEDEX_API_SECRET=your-secret
export FEDEX_CUSTOMER_ID=your-account

# Run examples
npx ts-node examples/usage-examples.ts
```

## Examples Included

### 1. UPS Integration
- Shipment validation
- Rate quotes
- Pickup order creation
- Shipment tracking

### 2. Smart Carrier Selection
- Initialize multiple carriers
- Get AI-powered recommendations
- Automatic carrier selection
- Fallback handling

### 3. Rate Comparison
- Compare costs across carriers
- Find cheapest option
- Consider delivery time

### 4. Performance Monitoring
- Track carrier success rates
- Monitor response times
- Identify reliable carriers

## Example Shipment Data

The examples use a sample international shipment from Los Angeles, USA to Tokyo, Japan:

```typescript
{
  sender: {
    name: 'John Doe',
    phone: '5551234567',
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
    address: {
      country: 'JP',
      province: '東京都',
      city: '渋谷区',
      street: '道玄坂1-2-3',
      postalCode: '150-0043'
    }
  },
  items: [{
    name: 'Electronics',
    weight: 2.5,
    value: 500,
    currency: 'USD'
  }]
}
```

## Customizing Examples

You can modify the examples to test different scenarios:

1. **Change origin/destination**: Update the sender/recipient addresses
2. **Test different carriers**: Add more carriers to the registry
3. **Adjust criteria**: Change maxCost, maxDeliveryDays, serviceType
4. **Test error handling**: Use invalid addresses or credentials

## Testing with Sandbox

All carriers support sandbox/test environments. The examples use sandbox by default to avoid real API charges.

To switch to production:
```typescript
{
  environment: 'production' // Change from 'sandbox'
}
```

## Support

For questions or issues:
- Documentation: `../README.md`
- GitHub Issues: https://github.com/rei-k/world-address-yaml/issues
