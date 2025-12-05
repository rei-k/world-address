/**
 * Simple test to debug geocoding API calls
 */

import { forwardGeocode } from '../src/geocode';

async function test() {
  try {
    const result = await forwardGeocode({
      address: {
        city: 'Tokyo',
        country: 'JP',
      },
    });
    
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
