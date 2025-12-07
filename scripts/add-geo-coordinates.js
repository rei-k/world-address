#!/usr/bin/env node

/**
 * Script to add geo-coordinates to all country YAML files
 *
 * This script adds the 'geo' section to country YAML files that don't have it yet.
 * The coordinates are approximate country centers based on geographic data.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Special regions and territories (using identifiers from the files)
const SPECIAL_REGION_COORDINATES = {
  // Chile overseas territories
  Easter_Island: { lat: -27.1127, lon: -109.3497, name: 'Easter Island' },
  Desventuradas: { lat: -26.3453, lon: -80.0762, name: 'Desventuradas Islands' },
  Juan_Fernandez: { lat: -33.6348, lon: -78.8311, name: 'Juan Fernández Islands' },

  // Spanish special regions
  'ES-CN': { lat: 28.2916, lon: -16.6291, name: 'Canary Islands' },
  'ES-CE/ES-ML': { lat: 35.8894, lon: -5.3213, name: 'Ceuta and Melilla' },

  // Portuguese regions
  'PT-20': { lat: 38.5244, lon: -28.0631, name: 'Azores' },
  'PT-30': { lat: 32.7607, lon: -16.9595, name: 'Madeira' },

  // Indonesian special regions
  Papua: { lat: -4.2699, lon: 138.0804, name: 'Papua' },

  // Indian union territories
  Andaman_Nicobar: { lat: 11.7401, lon: 92.6586, name: 'Andaman and Nicobar Islands' },
  Lakshadweep: { lat: 10.5667, lon: 72.6417, name: 'Lakshadweep' },

  // Caucasus disputed territories
  AB: { lat: 43.0015, lon: 41.0234, name: 'Abkhazia' },
  SO: { lat: 42.2256, lon: 43.9665, name: 'South Ossetia' },

  // Antarctica claims
  AR_CLAIM: { lat: -69.0, lon: -55.0, name: 'Argentine Antarctica' },
  AT: { lat: -70.0, lon: 135.0, name: 'Australian Antarctic Territory' },
  BAT: { lat: -73.0, lon: -60.0, name: 'British Antarctic Territory' },
  CL_CLAIM: { lat: -75.0, lon: -71.0, name: 'Chilean Antarctic Territory' },
  FR_ADELIE: { lat: -66.6667, lon: 140.0, name: 'Adélie Land' },
  NO_PB: { lat: -68.8, lon: -90.5833, name: 'Peter I Island' },
  NO_QML: { lat: -72.0, lon: 5.0, name: 'Queen Maud Land' },
  NZ_ROSS: { lat: -80.0, lon: 175.0, name: 'Ross Dependency' },
  UNCLAIMED: { lat: -80.0, lon: -120.0, name: 'Marie Byrd Land (Unclaimed)' },

  // Antarctica stations
  AU_CASEY: { lat: -66.2818, lon: 110.5275, name: 'Casey Station' },
  AU_DAVIS: { lat: -68.5767, lon: 77.9674, name: 'Davis Station' },
  AU_MAWSON: { lat: -67.605, lon: 62.8708, name: 'Mawson Station' },
  CN_ZHONGSHAN: { lat: -69.3733, lon: 76.3711, name: 'Zhongshan Station' },
  DE_NEUMAYER: { lat: -70.6661, lon: -8.2667, name: 'Neumayer Station III' },
  IN_BHARATI: { lat: -69.4083, lon: 76.1833, name: 'Bharati Station' },
  IN_MAITRI: { lat: -70.7653, lon: 11.7378, name: 'Maitri Station' },
  IT_ZUCCHELLI: { lat: -74.6947, lon: 164.1169, name: 'Mario Zucchelli Station' },
  JP_SYOWA: { lat: -69.0033, lon: 39.59, name: 'Syowa Station' },
  KR_SEJONG: { lat: -62.2236, lon: -58.7861, name: 'King Sejong Station' },
  RU_VOSTOK: { lat: -78.4644, lon: 106.8378, name: 'Vostok Station' },
  US_MCMURDO: { lat: -77.8467, lon: 166.6686, name: 'McMurdo Station' },
};

// Country center coordinates (latitude, longitude) based on geographic data
// Source: Natural Earth Data and OpenStreetMap
const COUNTRY_COORDINATES = {
  // Africa
  DZ: { lat: 28.0339, lon: 1.6596, name: 'Algeria' },
  AO: { lat: -11.2027, lon: 17.8739, name: 'Angola' },
  BJ: { lat: 9.3077, lon: 2.3158, name: 'Benin' },
  BW: { lat: -22.3285, lon: 24.6849, name: 'Botswana' },
  BF: { lat: 12.2383, lon: -1.5616, name: 'Burkina Faso' },
  BI: { lat: -3.3731, lon: 29.9189, name: 'Burundi' },
  CM: { lat: 7.3697, lon: 12.3547, name: 'Cameroon' },
  CV: { lat: 16.5388, lon: -23.0418, name: 'Cape Verde' },
  CF: { lat: 6.6111, lon: 20.9394, name: 'Central African Republic' },
  TD: { lat: 15.4542, lon: 18.7322, name: 'Chad' },
  KM: { lat: -11.6455, lon: 43.3333, name: 'Comoros' },
  CG: { lat: -0.228, lon: 15.8277, name: 'Republic of the Congo' },
  CD: { lat: -4.0383, lon: 21.7587, name: 'Democratic Republic of the Congo' },
  CI: { lat: 7.54, lon: -5.5471, name: "Côte d'Ivoire" },
  DJ: { lat: 11.8251, lon: 42.5903, name: 'Djibouti' },
  EG: { lat: 26.8206, lon: 30.8025, name: 'Egypt' },
  GQ: { lat: 1.6508, lon: 10.2679, name: 'Equatorial Guinea' },
  ER: { lat: 15.1794, lon: 39.7823, name: 'Eritrea' },
  SZ: { lat: -26.5225, lon: 31.4659, name: 'Eswatini' },
  ET: { lat: 9.145, lon: 40.4897, name: 'Ethiopia' },
  GA: { lat: -0.8037, lon: 11.6094, name: 'Gabon' },
  GM: { lat: 13.4432, lon: -15.3101, name: 'The Gambia' },
  GH: { lat: 7.9465, lon: -1.0232, name: 'Ghana' },
  GN: { lat: 9.9456, lon: -9.6966, name: 'Guinea' },
  GW: { lat: 11.8037, lon: -15.1804, name: 'Guinea-Bissau' },
  KE: { lat: -0.0236, lon: 37.9062, name: 'Kenya' },
  LS: { lat: -29.61, lon: 28.2336, name: 'Lesotho' },
  LR: { lat: 6.4281, lon: -9.4295, name: 'Liberia' },
  LY: { lat: 26.3351, lon: 17.2283, name: 'Libya' },
  MG: { lat: -18.7669, lon: 46.8691, name: 'Madagascar' },
  MW: { lat: -13.2543, lon: 34.3015, name: 'Malawi' },
  ML: { lat: 17.5707, lon: -3.9962, name: 'Mali' },
  MR: { lat: 21.0079, lon: -10.9408, name: 'Mauritania' },
  MU: { lat: -20.3484, lon: 57.5522, name: 'Mauritius' },
  MA: { lat: 31.7917, lon: -7.0926, name: 'Morocco' },
  MZ: { lat: -18.6657, lon: 35.5296, name: 'Mozambique' },
  NA: { lat: -22.9576, lon: 18.4904, name: 'Namibia' },
  NE: { lat: 17.6078, lon: 8.0817, name: 'Niger' },
  NG: { lat: 9.082, lon: 8.6753, name: 'Nigeria' },
  RW: { lat: -1.9403, lon: 29.8739, name: 'Rwanda' },
  ST: { lat: 0.1864, lon: 6.6131, name: 'São Tomé and Príncipe' },
  SN: { lat: 14.4974, lon: -14.4524, name: 'Senegal' },
  SC: { lat: -4.6796, lon: 55.492, name: 'Seychelles' },
  SL: { lat: 8.4606, lon: -11.7799, name: 'Sierra Leone' },
  SO: { lat: 5.1521, lon: 46.1996, name: 'Somalia' },
  ZA: { lat: -30.5595, lon: 22.9375, name: 'South Africa' },
  SS: { lat: 6.877, lon: 31.307, name: 'South Sudan' },
  SD: { lat: 12.8628, lon: 30.2176, name: 'Sudan' },
  TZ: { lat: -6.369, lon: 34.8888, name: 'Tanzania' },
  TG: { lat: 8.6195, lon: 0.8248, name: 'Togo' },
  TN: { lat: 33.8869, lon: 9.5375, name: 'Tunisia' },
  UG: { lat: 1.3733, lon: 32.2903, name: 'Uganda' },
  ZM: { lat: -13.1339, lon: 27.8493, name: 'Zambia' },
  ZW: { lat: -19.0154, lon: 29.1549, name: 'Zimbabwe' },
  EH: { lat: 24.2155, lon: -12.8858, name: 'Western Sahara' },

  // Americas
  AR: { lat: -38.4161, lon: -63.6167, name: 'Argentina' },
  BS: { lat: 25.0343, lon: -77.3963, name: 'The Bahamas' },
  BB: { lat: 13.1939, lon: -59.5432, name: 'Barbados' },
  BZ: { lat: 17.1899, lon: -88.4976, name: 'Belize' },
  BO: { lat: -16.2902, lon: -63.5887, name: 'Bolivia' },
  BR: { lat: -14.235, lon: -51.9253, name: 'Brazil' },
  CA: { lat: 56.1304, lon: -106.3468, name: 'Canada' },
  CL: { lat: -35.6751, lon: -71.543, name: 'Chile' },
  CO: { lat: 4.5709, lon: -74.2973, name: 'Colombia' },
  CR: { lat: 9.7489, lon: -83.7534, name: 'Costa Rica' },
  CU: { lat: 21.5218, lon: -77.7812, name: 'Cuba' },
  DM: { lat: 15.415, lon: -61.371, name: 'Dominica' },
  DO: { lat: 18.7357, lon: -70.1627, name: 'Dominican Republic' },
  EC: { lat: -1.8312, lon: -78.1834, name: 'Ecuador' },
  SV: { lat: 13.7942, lon: -88.8965, name: 'El Salvador' },
  GD: { lat: 12.1165, lon: -61.679, name: 'Grenada' },
  GT: { lat: 15.7835, lon: -90.2308, name: 'Guatemala' },
  GY: { lat: 4.8604, lon: -58.9302, name: 'Guyana' },
  HT: { lat: 18.9712, lon: -72.2852, name: 'Haiti' },
  HN: { lat: 15.2, lon: -86.2419, name: 'Honduras' },
  JM: { lat: 18.1096, lon: -77.2975, name: 'Jamaica' },
  MX: { lat: 23.6345, lon: -102.5528, name: 'Mexico' },
  NI: { lat: 12.8654, lon: -85.2072, name: 'Nicaragua' },
  PA: { lat: 8.538, lon: -80.7821, name: 'Panama' },
  PY: { lat: -23.4425, lon: -58.4438, name: 'Paraguay' },
  PE: { lat: -9.19, lon: -75.0152, name: 'Peru' },
  KN: { lat: 17.3578, lon: -62.783, name: 'Saint Kitts and Nevis' },
  LC: { lat: 13.9094, lon: -60.9789, name: 'Saint Lucia' },
  VC: { lat: 12.9843, lon: -61.2872, name: 'Saint Vincent and the Grenadines' },
  SR: { lat: 3.9193, lon: -56.0278, name: 'Suriname' },
  TT: { lat: 10.6918, lon: -61.2225, name: 'Trinidad and Tobago' },
  US: { lat: 37.0902, lon: -95.7129, name: 'United States' },
  UY: { lat: -32.5228, lon: -55.7658, name: 'Uruguay' },
  VE: { lat: 6.4238, lon: -66.5897, name: 'Venezuela' },
  AG: { lat: 17.0608, lon: -61.7964, name: 'Antigua and Barbuda' },

  // US Territories
  AS: { lat: -14.271, lon: -170.1322, name: 'American Samoa' },
  GU: { lat: 13.4443, lon: 144.7937, name: 'Guam' },
  MP: { lat: 15.0979, lon: 145.6739, name: 'Northern Mariana Islands' },
  PR: { lat: 18.2208, lon: -66.5901, name: 'Puerto Rico' },
  VI: { lat: 18.3358, lon: -64.8963, name: 'United States Virgin Islands' },
  UM: { lat: 19.2823, lon: 166.647, name: 'United States Minor Outlying Islands' },

  // Asia
  AF: { lat: 33.9391, lon: 67.71, name: 'Afghanistan' },
  AM: { lat: 40.0691, lon: 45.0382, name: 'Armenia' },
  AZ: { lat: 40.1431, lon: 47.5769, name: 'Azerbaijan' },
  BH: { lat: 26.0667, lon: 50.5577, name: 'Bahrain' },
  BD: { lat: 23.685, lon: 90.3563, name: 'Bangladesh' },
  BT: { lat: 27.5142, lon: 90.4336, name: 'Bhutan' },
  BN: { lat: 4.5353, lon: 114.7277, name: 'Brunei' },
  KH: { lat: 12.5657, lon: 104.991, name: 'Cambodia' },
  CN: { lat: 35.8617, lon: 104.1954, name: 'China' },
  GE: { lat: 42.3154, lon: 43.3569, name: 'Georgia' },
  HK: { lat: 22.3193, lon: 114.1694, name: 'Hong Kong' },
  IN: { lat: 20.5937, lon: 78.9629, name: 'India' },
  ID: { lat: -0.7893, lon: 113.9213, name: 'Indonesia' },
  IR: { lat: 32.4279, lon: 53.688, name: 'Iran' },
  IQ: { lat: 33.2232, lon: 43.6793, name: 'Iraq' },
  IL: { lat: 31.0461, lon: 34.8516, name: 'Israel' },
  JP: { lat: 36.2048, lon: 138.2529, name: 'Japan' },
  JO: { lat: 30.5852, lon: 36.2384, name: 'Jordan' },
  KZ: { lat: 48.0196, lon: 66.9237, name: 'Kazakhstan' },
  KW: { lat: 29.3117, lon: 47.4818, name: 'Kuwait' },
  KG: { lat: 41.2044, lon: 74.7661, name: 'Kyrgyzstan' },
  LA: { lat: 19.8563, lon: 102.4955, name: 'Laos' },
  LB: { lat: 33.8547, lon: 35.8623, name: 'Lebanon' },
  MO: { lat: 22.1987, lon: 113.5439, name: 'Macao' },
  MY: { lat: 4.2105, lon: 101.9758, name: 'Malaysia' },
  MV: { lat: 3.2028, lon: 73.2207, name: 'Maldives' },
  MN: { lat: 46.8625, lon: 103.8467, name: 'Mongolia' },
  MM: { lat: 21.9162, lon: 95.956, name: 'Myanmar' },
  NP: { lat: 28.3949, lon: 84.124, name: 'Nepal' },
  KP: { lat: 40.3399, lon: 127.5101, name: 'North Korea' },
  OM: { lat: 21.4735, lon: 55.9754, name: 'Oman' },
  PK: { lat: 30.3753, lon: 69.3451, name: 'Pakistan' },
  PS: { lat: 31.9522, lon: 35.2332, name: 'Palestine' },
  PH: { lat: 12.8797, lon: 121.774, name: 'Philippines' },
  QA: { lat: 25.3548, lon: 51.1839, name: 'Qatar' },
  SA: { lat: 23.8859, lon: 45.0792, name: 'Saudi Arabia' },
  SG: { lat: 1.3521, lon: 103.8198, name: 'Singapore' },
  KR: { lat: 35.9078, lon: 127.7669, name: 'South Korea' },
  LK: { lat: 7.8731, lon: 80.7718, name: 'Sri Lanka' },
  SY: { lat: 34.8021, lon: 38.9968, name: 'Syria' },
  TW: { lat: 23.6978, lon: 120.9605, name: 'Taiwan' },
  TJ: { lat: 38.861, lon: 71.2761, name: 'Tajikistan' },
  TH: { lat: 15.87, lon: 100.9925, name: 'Thailand' },
  TL: { lat: -8.8742, lon: 125.7275, name: 'Timor-Leste' },
  TR: { lat: 38.9637, lon: 35.2433, name: 'Turkey' },
  TM: { lat: 38.9697, lon: 59.5563, name: 'Turkmenistan' },
  AE: { lat: 23.4241, lon: 53.8478, name: 'United Arab Emirates' },
  UZ: { lat: 41.3775, lon: 64.5853, name: 'Uzbekistan' },
  VN: { lat: 14.0583, lon: 108.2772, name: 'Vietnam' },
  YE: { lat: 15.5527, lon: 48.5164, name: 'Yemen' },

  // Europe
  AL: { lat: 41.1533, lon: 20.1683, name: 'Albania' },
  AD: { lat: 42.5063, lon: 1.5218, name: 'Andorra' },
  AT: { lat: 47.5162, lon: 14.5501, name: 'Austria' },
  BY: { lat: 53.7098, lon: 27.9534, name: 'Belarus' },
  BE: { lat: 50.5039, lon: 4.4699, name: 'Belgium' },
  BA: { lat: 43.9159, lon: 17.6791, name: 'Bosnia and Herzegovina' },
  BG: { lat: 42.7339, lon: 25.4858, name: 'Bulgaria' },
  HR: { lat: 45.1, lon: 15.2, name: 'Croatia' },
  CY: { lat: 35.1264, lon: 33.4299, name: 'Cyprus' },
  CZ: { lat: 49.8175, lon: 15.473, name: 'Czech Republic' },
  DK: { lat: 56.2639, lon: 9.5018, name: 'Denmark' },
  EE: { lat: 58.5953, lon: 25.0136, name: 'Estonia' },
  FI: { lat: 61.9241, lon: 25.7482, name: 'Finland' },
  FR: { lat: 46.2276, lon: 2.2137, name: 'France' },
  DE: { lat: 51.1657, lon: 10.4515, name: 'Germany' },
  GR: { lat: 39.0742, lon: 21.8243, name: 'Greece' },
  HU: { lat: 47.1625, lon: 19.5033, name: 'Hungary' },
  IS: { lat: 64.9631, lon: -19.0208, name: 'Iceland' },
  IE: { lat: 53.4129, lon: -8.2439, name: 'Ireland' },
  IT: { lat: 41.8719, lon: 12.5674, name: 'Italy' },
  XK: { lat: 42.6026, lon: 20.903, name: 'Kosovo' },
  LV: { lat: 56.8796, lon: 24.6032, name: 'Latvia' },
  LI: { lat: 47.166, lon: 9.5554, name: 'Liechtenstein' },
  LT: { lat: 55.1694, lon: 23.8813, name: 'Lithuania' },
  LU: { lat: 49.8153, lon: 6.1296, name: 'Luxembourg' },
  MT: { lat: 35.9375, lon: 14.3754, name: 'Malta' },
  MD: { lat: 47.4116, lon: 28.3699, name: 'Moldova' },
  MC: { lat: 43.7384, lon: 7.4246, name: 'Monaco' },
  ME: { lat: 42.7087, lon: 19.3744, name: 'Montenegro' },
  NL: { lat: 52.1326, lon: 5.2913, name: 'Netherlands' },
  MK: { lat: 41.6086, lon: 21.7453, name: 'North Macedonia' },
  NO: { lat: 60.472, lon: 8.4689, name: 'Norway' },
  PL: { lat: 51.9194, lon: 19.1451, name: 'Poland' },
  PT: { lat: 39.3999, lon: -8.2245, name: 'Portugal' },
  RO: { lat: 45.9432, lon: 24.9668, name: 'Romania' },
  RU: { lat: 61.524, lon: 105.3188, name: 'Russia' },
  SM: { lat: 43.9424, lon: 12.4578, name: 'San Marino' },
  RS: { lat: 44.0165, lon: 21.0059, name: 'Serbia' },
  SK: { lat: 48.669, lon: 19.699, name: 'Slovakia' },
  SI: { lat: 46.1512, lon: 14.9955, name: 'Slovenia' },
  ES: { lat: 40.4637, lon: -3.7492, name: 'Spain' },
  SE: { lat: 60.1282, lon: 18.6435, name: 'Sweden' },
  CH: { lat: 46.8182, lon: 8.2275, name: 'Switzerland' },
  UA: { lat: 48.3794, lon: 31.1656, name: 'Ukraine' },
  GB: { lat: 55.3781, lon: -3.436, name: 'United Kingdom' },
  VA: { lat: 41.9029, lon: 12.4534, name: 'Vatican City' },

  // British territories
  AI: { lat: 18.2206, lon: -63.0686, name: 'Anguilla' },
  BM: { lat: 32.3078, lon: -64.7505, name: 'Bermuda' },
  IO: { lat: -6.3432, lon: 71.8765, name: 'British Indian Ocean Territory' },
  VG: { lat: 18.4207, lon: -64.6399, name: 'British Virgin Islands' },
  KY: { lat: 19.3133, lon: -81.2546, name: 'Cayman Islands' },
  FK: { lat: -51.7963, lon: -59.5236, name: 'Falkland Islands' },
  GI: { lat: 36.1408, lon: -5.3536, name: 'Gibraltar' },
  MS: { lat: 16.7425, lon: -62.1874, name: 'Montserrat' },
  PN: { lat: -24.3768, lon: -128.3242, name: 'Pitcairn Islands' },
  SH: { lat: -15.965, lon: -5.7089, name: 'Saint Helena, Ascension and Tristan da Cunha' },
  GS: { lat: -54.4296, lon: -36.5879, name: 'South Georgia and the South Sandwich Islands' },
  TC: { lat: 21.694, lon: -71.7979, name: 'Turks and Caicos Islands' },
  GG: { lat: 49.4657, lon: -2.5853, name: 'Guernsey' },
  IM: { lat: 54.2361, lon: -4.5481, name: 'Isle of Man' },
  JE: { lat: 49.2144, lon: -2.1313, name: 'Jersey' },

  // French territories
  GF: { lat: 3.9339, lon: -53.1258, name: 'French Guiana' },
  GP: { lat: 16.265, lon: -61.551, name: 'Guadeloupe' },
  MQ: { lat: 14.6415, lon: -61.0242, name: 'Martinique' },
  YT: { lat: -12.8275, lon: 45.1662, name: 'Mayotte' },
  NC: { lat: -20.9043, lon: 165.618, name: 'New Caledonia' },
  PF: { lat: -17.6797, lon: -149.4068, name: 'French Polynesia' },
  PM: { lat: 46.9419, lon: -56.2711, name: 'Saint Pierre and Miquelon' },
  RE: { lat: -21.1151, lon: 55.5364, name: 'Réunion' },
  BL: { lat: 17.9, lon: -62.8333, name: 'Saint Barthélemy' },
  MF: { lat: 18.0708, lon: -63.0501, name: 'Saint Martin' },
  WF: { lat: -13.7687, lon: -177.1561, name: 'Wallis and Futuna' },
  TF: { lat: -49.2804, lon: 69.3486, name: 'French Southern and Antarctic Lands' },

  // Danish territories
  FO: { lat: 61.8926, lon: -6.9118, name: 'Faroe Islands' },
  GL: { lat: 71.7069, lon: -42.6043, name: 'Greenland' },

  // Finnish territories
  AX: { lat: 60.1785, lon: 19.9156, name: 'Åland Islands' },

  // Dutch territories
  AW: { lat: 12.5211, lon: -69.9683, name: 'Aruba' },
  BQ: { lat: 12.1784, lon: -68.2385, name: 'Caribbean Netherlands' },
  CW: { lat: 12.1696, lon: -68.99, name: 'Curaçao' },
  SX: { lat: 18.0425, lon: -63.0548, name: 'Sint Maarten' },

  // Norwegian territories
  BV: { lat: -54.4208, lon: 3.3464, name: 'Bouvet Island' },
  SJ: { lat: 77.5536, lon: 23.6703, name: 'Svalbard and Jan Mayen' },

  // Oceania
  AU: { lat: -25.2744, lon: 133.7751, name: 'Australia' },
  NZ: { lat: -40.9006, lon: 174.886, name: 'New Zealand' },
  FJ: { lat: -17.7134, lon: 178.065, name: 'Fiji' },
  PG: { lat: -6.315, lon: 143.9555, name: 'Papua New Guinea' },
  SB: { lat: -9.6457, lon: 160.1562, name: 'Solomon Islands' },
  VU: { lat: -15.3767, lon: 166.9592, name: 'Vanuatu' },
  FM: { lat: 7.4256, lon: 150.5508, name: 'Federated States of Micronesia' },
  KI: { lat: -3.3704, lon: -168.734, name: 'Kiribati' },
  MH: { lat: 7.1315, lon: 171.1845, name: 'Marshall Islands' },
  NR: { lat: -0.5228, lon: 166.9315, name: 'Nauru' },
  PW: { lat: 7.515, lon: 134.5825, name: 'Palau' },
  TO: { lat: -21.179, lon: -175.1982, name: 'Tonga' },
  TV: { lat: -7.1095, lon: 177.6493, name: 'Tuvalu' },
  WS: { lat: -13.759, lon: -172.1046, name: 'Samoa' },

  // Australian territories
  CC: { lat: -12.1642, lon: 96.871, name: 'Cocos (Keeling) Islands' },
  CX: { lat: -10.4475, lon: 105.6904, name: 'Christmas Island' },
  HM: { lat: -53.0818, lon: 73.5042, name: 'Heard Island and McDonald Islands' },
  NF: { lat: -29.0408, lon: 167.9547, name: 'Norfolk Island' },

  // NZ territories
  CK: { lat: -21.2367, lon: -159.7777, name: 'Cook Islands' },
  NU: { lat: -19.0544, lon: -169.8672, name: 'Niue' },
  TK: { lat: -8.9671, lon: -171.8555, name: 'Tokelau' },

  // Antarctica
  AQ: { lat: -75.2509, lon: 0.0, name: 'Antarctica' },
};

function findYamlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip libaddressinput directory
      if (!filePath.includes('libaddressinput')) {
        findYamlFiles(filePath, fileList);
      }
    } else if (file.endsWith('.yaml')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function addGeoCoordinates() {
  const dataDir = path.join(__dirname, '..', 'data');
  const yamlFiles = findYamlFiles(dataDir);

  let updatedCount = 0;
  let skippedCount = 0;
  let notFoundCount = 0;

  // Generate timestamp once for consistency
  const timestamp = new Date().toISOString();

  console.log(`📍 Processing ${yamlFiles.length} YAML files...`);
  console.log('');

  yamlFiles.forEach((filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = yaml.load(content);

      // Skip if geo section already exists
      if (data.geo) {
        skippedCount++;
        return;
      }

      // Skip meta and schema files
      const fileName = path.basename(filePath, '.yaml');
      if (fileName === 'meta' || fileName === 'schema') {
        skippedCount++;
        return;
      }

      // Get country code or identifier
      let countryCode = data.iso_codes?.alpha2;
      let coords;

      // Check if it's a special region code (contains hyphen or slash)
      if (countryCode && (countryCode.includes('-') || countryCode.includes('/'))) {
        coords = SPECIAL_REGION_COORDINATES[countryCode];
        if (!coords) {
          console.log(
            `⚠️  No coordinates found for special region code: ${countryCode} (${filePath})`,
          );
          notFoundCount++;
          return;
        }
      } else if (countryCode) {
        // Regular country code
        coords = COUNTRY_COORDINATES[countryCode];
        if (!coords) {
          console.log(`⚠️  No coordinates found for country code: ${countryCode} (${filePath})`);
          notFoundCount++;
          return;
        }
      } else {
        // No country code, try special region identifier by filename
        const fileName = path.basename(filePath, '.yaml');
        coords = SPECIAL_REGION_COORDINATES[fileName];

        if (!coords) {
          console.log(`⚠️  No coordinates found for special region: ${fileName} (${filePath})`);
          notFoundCount++;
          return;
        }

        countryCode = fileName;
      }

      // Validate coordinates have required properties
      if (!coords || typeof coords.lat !== 'number' || typeof coords.lon !== 'number') {
        console.log(`⚠️  Invalid coordinates for: ${countryCode} (${filePath})`);
        notFoundCount++;
        return;
      }

      // Add geo section
      data.geo = {
        center: {
          latitude: coords.lat,
          longitude: coords.lon,
          accuracy: 1000,
          source: 'database',
          captured_at: timestamp,
        },
      };

      // Convert back to YAML
      const newContent = yaml.dump(data, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        quotingType: '"',
        forceQuotes: false,
      });

      // Write back to file
      fs.writeFileSync(filePath, newContent, 'utf8');

      updatedCount++;
      console.log(`✅ Updated: ${countryCode} - ${coords.name}`);
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  });

  console.log('');
  console.log('📊 Summary:');
  console.log(`   ✅ Updated: ${updatedCount} files`);
  console.log(`   ⏭️  Skipped (already has geo): ${skippedCount} files`);
  console.log(`   ⚠️  Not found in database: ${notFoundCount} files`);
  console.log(`   📁 Total processed: ${yamlFiles.length} files`);
}

// Run the script
addGeoCoordinates();
