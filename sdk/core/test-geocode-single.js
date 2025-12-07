import { forwardGeocode } from './src/geocode.ts';

const request = {
  address: {
    city: 'Tokyo',
    province: 'Tokyo',
    country: 'JP',
  },
};

const result = await forwardGeocode(request);
console.log('Result:', JSON.stringify(result, null, 2));
