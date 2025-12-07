// Mock country format data (in real app, load from @vey/core or API)
const COUNTRY_FORMATS = {
  JP: {
    name: { en: 'Japan' },
    address_format: {
      order: ['recipient', 'postal_code', 'province', 'city', 'street_address', 'country'],
      postal_code: { required: true, regex: '^[0-9]{3}-[0-9]{4}$', example: '100-0001' },
      province: { required: true, type: 'Prefecture' },
      city: { required: true },
      street_address: { required: true },
    },
  },
  US: {
    name: { en: 'United States' },
    address_format: {
      order: ['recipient', 'street_address', 'city', 'province', 'postal_code', 'country'],
      postal_code: { required: true, regex: '^\\d{5}(-\\d{4})?$', example: '12345' },
      province: { required: true, type: 'State' },
      city: { required: true },
      street_address: { required: true },
    },
  },
  GB: {
    name: { en: 'United Kingdom' },
    address_format: {
      order: ['recipient', 'street_address', 'city', 'province', 'postal_code', 'country'],
      postal_code: { required: true, regex: '^[A-Z]{1,2}\\d[A-Z\\d]? ?\\d[A-Z]{2}$', example: 'SW1A 1AA' },
      city: { required: true },
      street_address: { required: true },
    },
  },
  FR: {
    name: { en: 'France' },
    address_format: {
      order: ['recipient', 'street_address', 'postal_code', 'city', 'country'],
      postal_code: { required: true, regex: '^\\d{5}$', example: '75001' },
      city: { required: true },
      street_address: { required: true },
    },
  },
  DE: {
    name: { en: 'Germany' },
    address_format: {
      order: ['recipient', 'street_address', 'postal_code', 'city', 'country'],
      postal_code: { required: true, regex: '^\\d{5}$', example: '10115' },
      city: { required: true },
      street_address: { required: true },
    },
  },
};
