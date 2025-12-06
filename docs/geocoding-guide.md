# Geocoding & Reverse Geocoding Guide

## Overview

The `@vey/core` SDK now includes built-in geocoding and reverse geocoding functionality using OpenStreetMap's Nominatim API. This allows you to:

- **Forward Geocoding**: Convert addresses to geographic coordinates (latitude/longitude)
- **Reverse Geocoding**: Convert geographic coordinates to formatted addresses
- **Auto-detection**: Automatically determine whether to perform forward or reverse geocoding

## Features

### ✅ Implemented Features

- 🗺️ Forward geocoding (address → coordinates)
- 🔄 Reverse geocoding (coordinates → address)
- 💾 Built-in caching to reduce API calls
- 🌍 Support for 269 countries
- 🆓 Free to use (OpenStreetMap Nominatim)
- 🔒 No API key required
- 📊 Confidence scoring for results
- 🎯 Alternative results for ambiguous queries

### 🔧 Technical Details

- **API Provider**: OpenStreetMap Nominatim
- **Rate Limiting**: Please respect Nominatim's usage policy (1 request/second)
- **Caching**: Automatic caching of results to minimize API calls
- **Network Required**: Internet access required for geocoding operations

## Installation

Currently in local development. Follow the main SDK setup:

```bash
cd world-address-yaml/sdk/core
npm install
npm run build
```

## API Reference

### Forward Geocoding

Convert an address to geographic coordinates.

```typescript
import { forwardGeocode } from '@vey/core';

const result = await forwardGeocode({
  address: {
    street_address: '1-1-1 Chiyoda',
    city: 'Chiyoda-ku',
    province: 'Tokyo',
    postal_code: '100-0001',
    country: 'JP'
  }
});

if (result.success) {
  console.log(result.coordinates);
  // { latitude: 35.6812, longitude: 139.7671, source: 'nominatim' }
  console.log(`Confidence: ${result.confidence}`);
}
```

### Reverse Geocoding

Convert geographic coordinates to an address.

```typescript
import { reverseGeocode } from '@vey/core';

const result = await reverseGeocode({
  coordinates: {
    latitude: 35.6812,
    longitude: 139.7671
  }
});

if (result.success) {
  console.log(result.address);
  // {
  //   country: 'JP',
  //   province: 'Tokyo',
  //   city: 'Chiyoda-ku',
  //   street_address: '1-1-1 Chiyoda',
  //   postal_code: '100-0001'
  // }
}
```

### Auto-detect Geocoding

Automatically determine forward or reverse geocoding based on input.

```typescript
import { geocode } from '@vey/core';

// Forward geocoding (has address)
const forward = await geocode({
  address: { city: 'Tokyo', country: 'JP' }
});

// Reverse geocoding (has coordinates)
const reverse = await geocode({
  coordinates: { latitude: 35.6812, longitude: 139.7671 }
});
```

### Cache Management

```typescript
import { 
  clearGeocodingCache, 
  getGeocodingCacheStats 
} from '@vey/core';

// Clear all cached geocoding results
clearGeocodingCache();

// Get cache statistics
const stats = getGeocodingCacheStats();
console.log(`Cache size: ${stats.size}`);
console.log(`Cached keys: ${stats.keys.join(', ')}`);
```

## Usage Examples

### Example 1: Address to Map Coordinates

```typescript
import { forwardGeocode, createGeoAddress } from '@vey/core';

async function showAddressOnMap(address) {
  const result = await forwardGeocode({ address });
  
  if (!result.success) {
    console.error('Geocoding failed:', result.error);
    return;
  }
  
  // Create a GeoAddress with coordinates
  const geoAddress = createGeoAddress(
    'JP-13-101-01',
    result.coordinates
  );
  
  // Use coordinates to display on map
  showMap(result.coordinates.latitude, result.coordinates.longitude);
}
```

### Example 2: User Location to Address

```typescript
import { reverseGeocode } from '@vey/core';

async function getAddressFromLocation() {
  // Get user's current location
  navigator.geolocation.getCurrentPosition(async (position) => {
    const result = await reverseGeocode({
      coordinates: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }
    });
    
    if (result.success) {
      console.log('Your address:', result.address);
      // Auto-fill form with detected address
      fillAddressForm(result.address);
    }
  });
}
```

### Example 3: Address Verification with Geo-Insurance

Combine geocoding with geo-insurance for delivery verification.

```typescript
import { 
  forwardGeocode, 
  verifyAddressWithGeo 
} from '@vey/core';

async function verifyDeliveryLocation(
  registeredAddress,
  driverCoordinates
) {
  // Geocode the registered address
  const geocoded = await forwardGeocode({
    address: registeredAddress
  });
  
  if (!geocoded.success) {
    return { valid: false, error: 'Could not geocode address' };
  }
  
  // Create GeoAddress
  const geoAddress = {
    pid: 'JP-13-101-01',
    center: geocoded.coordinates
  };
  
  // Verify driver is at the correct location
  const verification = verifyAddressWithGeo(
    geoAddress,
    driverCoordinates,
    { toleranceMeters: 100 }
  );
  
  return verification;
}
```

### Example 4: Bulk Geocoding with Caching

```typescript
import { forwardGeocode, getGeocodingCacheStats } from '@vey/core';

async function geocodeMultipleAddresses(addresses) {
  const results = [];
  
  for (const address of addresses) {
    const result = await forwardGeocode({ address });
    results.push(result);
    
    // Respect rate limiting (1 request/second)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Check cache efficiency
  const stats = getGeocodingCacheStats();
  console.log(`Geocoded ${addresses.length} addresses`);
  console.log(`Cache hits: ${stats.size} entries`);
  
  return results;
}
```

### Example 5: Search Nearby Addresses

```typescript
import { 
  reverseGeocode,
  calculateDistance,
  createBoundsFromRadius 
} from '@vey/core';

async function findNearbyAddresses(centerCoords, radiusMeters) {
  // Create search bounds
  const bounds = createBoundsFromRadius(centerCoords, radiusMeters);
  
  // Reverse geocode center point
  const centerAddress = await reverseGeocode({
    coordinates: centerCoords
  });
  
  return {
    center: centerAddress.address,
    bounds,
    radius: radiusMeters
  };
}
```

## Type Definitions

### GeocodingRequest

```typescript
interface GeocodingRequest {
  /** Address input for forward geocoding */
  address?: AddressInput;
  /** PID for PID-based geocoding */
  pid?: string;
  /** Coordinates for reverse geocoding */
  coordinates?: GeoCoordinates;
  /** Preferred language for results */
  language?: string;
}
```

### GeocodingResult

```typescript
interface GeocodingResult {
  /** Success status */
  success: boolean;
  /** Resolved coordinates (for forward geocoding) */
  coordinates?: GeoCoordinates;
  /** Resolved address (for reverse geocoding) */
  address?: AddressInput;
  /** Resolved PID */
  pid?: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Alternative results */
  alternatives?: Array<{
    coordinates?: GeoCoordinates;
    address?: AddressInput;
    pid?: string;
    confidence: number;
  }>;
  /** Error message if failed */
  error?: string;
}
```

### GeoCoordinates

```typescript
interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;  // meters
  source?: GeoSource;
}

type GeoSource =
  | 'gps'
  | 'geocoder'
  | 'nominatim'
  | 'manual'
  | 'database'
  | 'device'
  | 'unknown';
```

## Best Practices

### 1. Rate Limiting

OpenStreetMap Nominatim has a usage policy of 1 request per second. Always respect this:

```typescript
async function geocodeWithRateLimit(address) {
  const result = await forwardGeocode({ address });
  await new Promise(resolve => setTimeout(resolve, 1000));
  return result;
}
```

### 2. Error Handling

Always check the success flag and handle errors:

```typescript
const result = await forwardGeocode({ address });

if (!result.success) {
  console.error('Geocoding failed:', result.error);
  // Fallback behavior
  return;
}

// Use result.coordinates
```

### 3. Caching

Leverage the built-in cache for repeated queries:

```typescript
// First call - hits API
const result1 = await forwardGeocode({ address });

// Second call - uses cache (instant)
const result2 = await forwardGeocode({ address });
```

### 4. User Agent

The SDK automatically sets a proper User-Agent header (`@vey/core geocoding client`) to comply with Nominatim's usage policy.

### 5. Confidence Checking

Use confidence scores to validate results:

```typescript
const result = await forwardGeocode({ address });

if (result.success && result.confidence > 0.7) {
  // High confidence result
  useCoordinates(result.coordinates);
} else {
  // Low confidence - ask user to verify
  askUserToConfirm(result);
}
```

## Integration with Existing Features

### With Address PID

```typescript
import { forwardGeocode, encodePID, normalizeAddress } from '@vey/core';

async function createGeocodedPID(address) {
  // Geocode address
  const geocoded = await forwardGeocode({ address });
  
  // Normalize address
  const normalized = normalizeAddress(address, address.country);
  
  // Generate PID
  const pid = encodePID(normalized);
  
  return {
    pid,
    coordinates: geocoded.coordinates,
    confidence: geocoded.confidence
  };
}
```

### With ZKP Protocol

```typescript
import { forwardGeocode, createAddressPIDCredential } from '@vey/core';

async function createGeoVerifiedCredential(address, userDID) {
  // Geocode to get coordinates
  const geocoded = await forwardGeocode({ address });
  
  if (!geocoded.success) {
    throw new Error('Cannot geocode address');
  }
  
  // Create credential with geo-verification
  const credential = createAddressPIDCredential(
    userDID,
    'did:web:vey.example',
    'JP-13-101-01',
    address.country
  );
  
  // Add geo metadata
  credential.credentialSubject.geoVerified = true;
  credential.credentialSubject.coordinates = geocoded.coordinates;
  
  return credential;
}
```

## Limitations

1. **Network Required**: Internet access is required for geocoding operations
2. **Rate Limiting**: 1 request per second (Nominatim policy)
3. **Accuracy**: Results depend on OpenStreetMap data quality
4. **Coverage**: May have limited data for some rural or remote areas
5. **Sandboxed Environments**: May not work in restricted network environments

## Troubleshooting

### Error: "fetch failed"

This usually means:
- Network connectivity issues
- Blocked by firewall/proxy
- Running in sandboxed environment without network access

### Low Confidence Scores

If you're getting low confidence scores:
- Provide more specific address details
- Include postal code and country
- Use full street addresses
- Check for typos in the address

### No Results Found

If geocoding returns no results:
- Verify the address is correctly formatted
- Try with less specific address (e.g., just city and country)
- Check if the location exists in OpenStreetMap data

## Future Enhancements

Planned improvements for geocoding functionality:

- [ ] Support for additional geocoding providers (Google Maps, Mapbox)
- [ ] Batch geocoding API
- [ ] Offline geocoding with local database
- [ ] Address autocomplete/suggestions
- [ ] Geocoding result ranking and filtering
- [ ] Multi-language support for results
- [ ] Custom geocoding provider integration

## License

This geocoding implementation uses OpenStreetMap Nominatim API, which is free to use under their [usage policy](https://operations.osmfoundation.org/policies/nominatim/).

Please ensure your usage complies with their terms of service.

## Related Documentation

- [Main README](../../README.md)
- [SDK Core Documentation](../core/README.md)
- [Geo-Insurance Documentation](./geo-insurance.md)
- [Address PID Specification](./address-pid.md)
- [ZKP Protocol](./zkp-protocol.md)
