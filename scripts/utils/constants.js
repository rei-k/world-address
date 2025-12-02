/**
 * Constants for libaddressinput fetcher
 */

// Base URL for Google's libaddressinput API
const BASE_URL = 'https://chromium-i18n.appspot.com/ssl-address';

// ISO 3166-1 alpha-2 country codes organized by region
const COUNTRY_CODES = {
  // Africa
  africa: [
    'AO', 'BF', 'BI', 'BJ', 'BW', 'CD', 'CF', 'CG', 'CI', 'CM',
    'CV', 'DJ', 'DZ', 'EG', 'ER', 'ET', 'GA', 'GH', 'GM', 'GN',
    'GQ', 'GW', 'KE', 'KM', 'LR', 'LS', 'LY', 'MA', 'MG', 'ML',
    'MR', 'MU', 'MW', 'MZ', 'NA', 'NE', 'NG', 'RW', 'SC', 'SD',
    'SL', 'SN', 'SO', 'SS', 'ST', 'SZ', 'TD', 'TG', 'TN', 'TZ',
    'UG', 'ZA', 'ZM', 'ZW',
  ],

  // Americas
  americas: [
    'AG', 'AR', 'BB', 'BO', 'BR', 'BS', 'BZ', 'CA', 'CL', 'CO',
    'CR', 'CU', 'DM', 'DO', 'EC', 'GD', 'GT', 'GY', 'HN', 'HT',
    'JM', 'KN', 'LC', 'MX', 'NI', 'PA', 'PE', 'PY', 'SR', 'SV',
    'TT', 'US', 'UY', 'VC', 'VE',
  ],

  // Asia
  asia: [
    'AE', 'AF', 'AM', 'AZ', 'BD', 'BH', 'BN', 'BT', 'CN', 'GE',
    'HK', 'ID', 'IL', 'IN', 'IQ', 'IR', 'JO', 'JP', 'KG', 'KH',
    'KP', 'KR', 'KW', 'KZ', 'LA', 'LB', 'LK', 'MM', 'MN', 'MO',
    'MV', 'MY', 'NP', 'OM', 'PH', 'PK', 'PS', 'QA', 'SA', 'SG',
    'SY', 'TH', 'TJ', 'TL', 'TM', 'TR', 'TW', 'UZ', 'VN', 'YE',
  ],

  // Europe
  europe: [
    'AD', 'AL', 'AT', 'BA', 'BE', 'BG', 'BY', 'CH', 'CY', 'CZ',
    'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GB', 'GR', 'HR', 'HU',
    'IE', 'IS', 'IT', 'LI', 'LT', 'LU', 'LV', 'MC', 'MD', 'ME',
    'MK', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'RS', 'RU', 'SE',
    'SI', 'SK', 'SM', 'UA', 'VA', 'XK',
  ],

  // Oceania
  oceania: [
    'AU', 'FJ', 'FM', 'KI', 'MH', 'NR', 'NZ', 'PG', 'PW', 'SB',
    'TO', 'TV', 'VU', 'WS',
  ],

  // Special territories and dependencies
  territories: [
    'AS', 'AI', 'AQ', 'BM', 'BQ', 'CC', 'CK', 'CW', 'CX', 'FK',
    'FO', 'GF', 'GG', 'GI', 'GL', 'GP', 'GS', 'GU', 'HM', 'IM',
    'IO', 'JE', 'KY', 'MQ', 'MS', 'MP', 'NC', 'NF', 'NU', 'PF',
    'PM', 'PN', 'PR', 'RE', 'SH', 'SX', 'TC', 'TK', 'VI', 'VG',
    'WF', 'YT',
  ],
};

// Flatten all country codes
const ALL_COUNTRY_CODES = Object.values(COUNTRY_CODES).flat();

// Additional fields to extract from libaddressinput data
const ADDITIONAL_FIELDS = [
  'id',
  'sub_isoids',
  'sub_lnames',
  'sub_mores',
  'sub_zips',
  'sub_zipexs',
];

// Request configuration
const REQUEST_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
  exponentialBackoff: true,
};

// Rate limiting configuration
const RATE_LIMIT = {
  delay: 100, // ms between requests
  batchSize: 10, // number of concurrent requests
};

module.exports = {
  BASE_URL,
  COUNTRY_CODES,
  ALL_COUNTRY_CODES,
  ADDITIONAL_FIELDS,
  REQUEST_CONFIG,
  RATE_LIMIT,
};
