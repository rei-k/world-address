import { forwardGeocode } from './dist/index.mjs';

const request = {
  address: {
    city: 'Tokyo',
    province: 'Tokyo',
    country: 'JP',
  },
};

try {
  const result = await forwardGeocode(request);
  console.log('Result:', JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Error:', error);
}
