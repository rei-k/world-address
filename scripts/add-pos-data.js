#!/usr/bin/env node

/**
 * Script to add POS (Point of Sale) data to all country YAML files
 *
 * This script adds the 'pos' section to country YAML files that don't have it yet.
 * The data includes currency, tax, receipt requirements, fiscal regulations, and locale information.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Currency data for all countries (ISO 4217)
// Source: International Organization for Standardization (ISO) and various financial databases
const CURRENCY_DATA = {
  // Africa
  DZ: { code: 'DZD', symbol: 'د.ج', decimal_places: 2 },
  AO: { code: 'AOA', symbol: 'Kz', decimal_places: 2 },
  BJ: { code: 'XOF', symbol: 'CFA', decimal_places: 0 },
  BW: { code: 'BWP', symbol: 'P', decimal_places: 2 },
  BF: { code: 'XOF', symbol: 'CFA', decimal_places: 0 },
  BI: { code: 'BIF', symbol: 'FBu', decimal_places: 0 },
  CM: { code: 'XAF', symbol: 'FCFA', decimal_places: 0 },
  CV: { code: 'CVE', symbol: '$', decimal_places: 2 },
  CF: { code: 'XAF', symbol: 'FCFA', decimal_places: 0 },
  TD: { code: 'XAF', symbol: 'FCFA', decimal_places: 0 },
  KM: { code: 'KMF', symbol: 'CF', decimal_places: 0 },
  CG: { code: 'XAF', symbol: 'FCFA', decimal_places: 0 },
  CD: { code: 'CDF', symbol: 'FC', decimal_places: 2 },
  CI: { code: 'XOF', symbol: 'CFA', decimal_places: 0 },
  DJ: { code: 'DJF', symbol: 'Fdj', decimal_places: 0 },
  EG: { code: 'EGP', symbol: 'E£', decimal_places: 2 },
  GQ: { code: 'XAF', symbol: 'FCFA', decimal_places: 0 },
  ER: { code: 'ERN', symbol: 'Nfk', decimal_places: 2 },
  SZ: { code: 'SZL', symbol: 'L', decimal_places: 2 },
  ET: { code: 'ETB', symbol: 'Br', decimal_places: 2 },
  GA: { code: 'XAF', symbol: 'FCFA', decimal_places: 0 },
  GM: { code: 'GMD', symbol: 'D', decimal_places: 2 },
  GH: { code: 'GHS', symbol: 'GH₵', decimal_places: 2 },
  GN: { code: 'GNF', symbol: 'FG', decimal_places: 0 },
  GW: { code: 'XOF', symbol: 'CFA', decimal_places: 0 },
  KE: { code: 'KES', symbol: 'KSh', decimal_places: 2 },
  LS: { code: 'LSL', symbol: 'L', decimal_places: 2 },
  LR: { code: 'LRD', symbol: '$', decimal_places: 2 },
  LY: { code: 'LYD', symbol: 'ل.د', decimal_places: 3 },
  MG: { code: 'MGA', symbol: 'Ar', decimal_places: 2 },
  MW: { code: 'MWK', symbol: 'MK', decimal_places: 2 },
  ML: { code: 'XOF', symbol: 'CFA', decimal_places: 0 },
  MR: { code: 'MRU', symbol: 'UM', decimal_places: 2 },
  MU: { code: 'MUR', symbol: '₨', decimal_places: 2 },
  MA: { code: 'MAD', symbol: 'د.م.', decimal_places: 2 },
  MZ: { code: 'MZN', symbol: 'MT', decimal_places: 2 },
  NA: { code: 'NAD', symbol: '$', decimal_places: 2 },
  NE: { code: 'XOF', symbol: 'CFA', decimal_places: 0 },
  NG: { code: 'NGN', symbol: '₦', decimal_places: 2 },
  RW: { code: 'RWF', symbol: 'FRw', decimal_places: 0 },
  ST: { code: 'STN', symbol: 'Db', decimal_places: 2 },
  SN: { code: 'XOF', symbol: 'CFA', decimal_places: 0 },
  SC: { code: 'SCR', symbol: '₨', decimal_places: 2 },
  SL: { code: 'SLL', symbol: 'Le', decimal_places: 2 },
  SO: { code: 'SOS', symbol: 'Sh', decimal_places: 2 },
  ZA: { code: 'ZAR', symbol: 'R', decimal_places: 2 },
  SS: { code: 'SSP', symbol: '£', decimal_places: 2 },
  SD: { code: 'SDG', symbol: 'ج.س.', decimal_places: 2 },
  TZ: { code: 'TZS', symbol: 'TSh', decimal_places: 2 },
  TG: { code: 'XOF', symbol: 'CFA', decimal_places: 0 },
  TN: { code: 'TND', symbol: 'د.ت', decimal_places: 3 },
  UG: { code: 'UGX', symbol: 'USh', decimal_places: 0 },
  ZM: { code: 'ZMW', symbol: 'ZK', decimal_places: 2 },
  ZW: { code: 'ZWL', symbol: '$', decimal_places: 2 },
  EH: { code: 'MAD', symbol: 'د.م.', decimal_places: 2 },

  // Americas
  AR: { code: 'ARS', symbol: '$', decimal_places: 2 },
  BS: { code: 'BSD', symbol: '$', decimal_places: 2 },
  BB: { code: 'BBD', symbol: '$', decimal_places: 2 },
  BZ: { code: 'BZD', symbol: 'BZ$', decimal_places: 2 },
  BO: { code: 'BOB', symbol: 'Bs.', decimal_places: 2 },
  BR: { code: 'BRL', symbol: 'R$', decimal_places: 2 },
  CA: { code: 'CAD', symbol: '$', decimal_places: 2 },
  CL: { code: 'CLP', symbol: '$', decimal_places: 0 },
  CO: { code: 'COP', symbol: '$', decimal_places: 2 },
  CR: { code: 'CRC', symbol: '₡', decimal_places: 2 },
  CU: { code: 'CUP', symbol: '$', decimal_places: 2 },
  DM: { code: 'XCD', symbol: '$', decimal_places: 2 },
  DO: { code: 'DOP', symbol: 'RD$', decimal_places: 2 },
  EC: { code: 'USD', symbol: '$', decimal_places: 2 },
  SV: { code: 'USD', symbol: '$', decimal_places: 2 },
  GD: { code: 'XCD', symbol: '$', decimal_places: 2 },
  GT: { code: 'GTQ', symbol: 'Q', decimal_places: 2 },
  GY: { code: 'GYD', symbol: '$', decimal_places: 2 },
  HT: { code: 'HTG', symbol: 'G', decimal_places: 2 },
  HN: { code: 'HNL', symbol: 'L', decimal_places: 2 },
  JM: { code: 'JMD', symbol: 'J$', decimal_places: 2 },
  MX: { code: 'MXN', symbol: '$', decimal_places: 2 },
  NI: { code: 'NIO', symbol: 'C$', decimal_places: 2 },
  PA: { code: 'PAB', symbol: 'B/.', decimal_places: 2 },
  PY: { code: 'PYG', symbol: '₲', decimal_places: 0 },
  PE: { code: 'PEN', symbol: 'S/.', decimal_places: 2 },
  KN: { code: 'XCD', symbol: '$', decimal_places: 2 },
  LC: { code: 'XCD', symbol: '$', decimal_places: 2 },
  VC: { code: 'XCD', symbol: '$', decimal_places: 2 },
  SR: { code: 'SRD', symbol: '$', decimal_places: 2 },
  TT: { code: 'TTD', symbol: 'TT$', decimal_places: 2 },
  US: { code: 'USD', symbol: '$', decimal_places: 2 },
  UY: { code: 'UYU', symbol: '$U', decimal_places: 2 },
  VE: { code: 'VES', symbol: 'Bs.S', decimal_places: 2 },
  AG: { code: 'XCD', symbol: '$', decimal_places: 2 },

  // US Territories
  PR: { code: 'USD', symbol: '$', decimal_places: 2 },
  VI: { code: 'USD', symbol: '$', decimal_places: 2 },
  GU: { code: 'USD', symbol: '$', decimal_places: 2 },
  AS: { code: 'USD', symbol: '$', decimal_places: 2 },
  MP: { code: 'USD', symbol: '$', decimal_places: 2 },
  UM: { code: 'USD', symbol: '$', decimal_places: 2 },

  // Asia
  AF: { code: 'AFN', symbol: '؋', decimal_places: 2 },
  AM: { code: 'AMD', symbol: '֏', decimal_places: 2 },
  AZ: { code: 'AZN', symbol: '₼', decimal_places: 2 },
  BH: { code: 'BHD', symbol: '.د.ب', decimal_places: 3 },
  BD: { code: 'BDT', symbol: '৳', decimal_places: 2 },
  BT: { code: 'BTN', symbol: 'Nu.', decimal_places: 2 },
  BN: { code: 'BND', symbol: '$', decimal_places: 2 },
  KH: { code: 'KHR', symbol: '៛', decimal_places: 2 },
  CN: { code: 'CNY', symbol: '¥', decimal_places: 2 },
  GE: { code: 'GEL', symbol: '₾', decimal_places: 2 },
  HK: { code: 'HKD', symbol: 'HK$', decimal_places: 2 },
  IN: { code: 'INR', symbol: '₹', decimal_places: 2 },
  ID: { code: 'IDR', symbol: 'Rp', decimal_places: 2 },
  IR: { code: 'IRR', symbol: '﷼', decimal_places: 2 },
  IQ: { code: 'IQD', symbol: 'ع.د', decimal_places: 3 },
  IL: { code: 'ILS', symbol: '₪', decimal_places: 2 },
  JP: { code: 'JPY', symbol: '¥', decimal_places: 0 },
  JO: { code: 'JOD', symbol: 'د.ا', decimal_places: 3 },
  KZ: { code: 'KZT', symbol: '₸', decimal_places: 2 },
  KP: { code: 'KPW', symbol: '₩', decimal_places: 2 },
  KR: { code: 'KRW', symbol: '₩', decimal_places: 0 },
  KW: { code: 'KWD', symbol: 'د.ك', decimal_places: 3 },
  KG: { code: 'KGS', symbol: 'с', decimal_places: 2 },
  LA: { code: 'LAK', symbol: '₭', decimal_places: 2 },
  LB: { code: 'LBP', symbol: 'ل.ل', decimal_places: 2 },
  MO: { code: 'MOP', symbol: 'MOP$', decimal_places: 2 },
  MY: { code: 'MYR', symbol: 'RM', decimal_places: 2 },
  MV: { code: 'MVR', symbol: '.ރ', decimal_places: 2 },
  MN: { code: 'MNT', symbol: '₮', decimal_places: 2 },
  MM: { code: 'MMK', symbol: 'K', decimal_places: 2 },
  NP: { code: 'NPR', symbol: '₨', decimal_places: 2 },
  OM: { code: 'OMR', symbol: 'ر.ع.', decimal_places: 3 },
  PK: { code: 'PKR', symbol: '₨', decimal_places: 2 },
  PS: { code: 'ILS', symbol: '₪', decimal_places: 2 },
  PH: { code: 'PHP', symbol: '₱', decimal_places: 2 },
  QA: { code: 'QAR', symbol: 'ر.ق', decimal_places: 2 },
  SA: { code: 'SAR', symbol: 'ر.س', decimal_places: 2 },
  SG: { code: 'SGD', symbol: 'S$', decimal_places: 2 },
  LK: { code: 'LKR', symbol: 'Rs', decimal_places: 2 },
  SY: { code: 'SYP', symbol: '£S', decimal_places: 2 },
  TW: { code: 'TWD', symbol: 'NT$', decimal_places: 2 },
  TJ: { code: 'TJS', symbol: 'ЅМ', decimal_places: 2 },
  TH: { code: 'THB', symbol: '฿', decimal_places: 2 },
  TL: { code: 'USD', symbol: '$', decimal_places: 2 },
  TR: { code: 'TRY', symbol: '₺', decimal_places: 2 },
  TM: { code: 'TMT', symbol: 'm', decimal_places: 2 },
  AE: { code: 'AED', symbol: 'د.إ', decimal_places: 2 },
  UZ: { code: 'UZS', symbol: 'soʻm', decimal_places: 2 },
  VN: { code: 'VND', symbol: '₫', decimal_places: 0 },
  YE: { code: 'YER', symbol: '﷼', decimal_places: 2 },

  // Europe
  AL: { code: 'ALL', symbol: 'L', decimal_places: 2 },
  AD: { code: 'EUR', symbol: '€', decimal_places: 2 },
  AT: { code: 'EUR', symbol: '€', decimal_places: 2 },
  BY: { code: 'BYN', symbol: 'Br', decimal_places: 2 },
  BE: { code: 'EUR', symbol: '€', decimal_places: 2 },
  BA: { code: 'BAM', symbol: 'KM', decimal_places: 2 },
  BG: { code: 'BGN', symbol: 'лв', decimal_places: 2 },
  HR: { code: 'EUR', symbol: '€', decimal_places: 2 },
  CY: { code: 'EUR', symbol: '€', decimal_places: 2 },
  CZ: { code: 'CZK', symbol: 'Kč', decimal_places: 2 },
  DK: { code: 'DKK', symbol: 'kr', decimal_places: 2 },
  EE: { code: 'EUR', symbol: '€', decimal_places: 2 },
  FI: { code: 'EUR', symbol: '€', decimal_places: 2 },
  FR: { code: 'EUR', symbol: '€', decimal_places: 2 },
  DE: { code: 'EUR', symbol: '€', decimal_places: 2 },
  GR: { code: 'EUR', symbol: '€', decimal_places: 2 },
  HU: { code: 'HUF', symbol: 'Ft', decimal_places: 2 },
  IS: { code: 'ISK', symbol: 'kr', decimal_places: 0 },
  IE: { code: 'EUR', symbol: '€', decimal_places: 2 },
  IT: { code: 'EUR', symbol: '€', decimal_places: 2 },
  XK: { code: 'EUR', symbol: '€', decimal_places: 2 },
  LV: { code: 'EUR', symbol: '€', decimal_places: 2 },
  LI: { code: 'CHF', symbol: 'Fr', decimal_places: 2 },
  LT: { code: 'EUR', symbol: '€', decimal_places: 2 },
  LU: { code: 'EUR', symbol: '€', decimal_places: 2 },
  MT: { code: 'EUR', symbol: '€', decimal_places: 2 },
  MD: { code: 'MDL', symbol: 'L', decimal_places: 2 },
  MC: { code: 'EUR', symbol: '€', decimal_places: 2 },
  ME: { code: 'EUR', symbol: '€', decimal_places: 2 },
  NL: { code: 'EUR', symbol: '€', decimal_places: 2 },
  MK: { code: 'MKD', symbol: 'ден', decimal_places: 2 },
  NO: { code: 'NOK', symbol: 'kr', decimal_places: 2 },
  PL: { code: 'PLN', symbol: 'zł', decimal_places: 2 },
  PT: { code: 'EUR', symbol: '€', decimal_places: 2 },
  RO: { code: 'RON', symbol: 'lei', decimal_places: 2 },
  RU: { code: 'RUB', symbol: '₽', decimal_places: 2 },
  SM: { code: 'EUR', symbol: '€', decimal_places: 2 },
  RS: { code: 'RSD', symbol: 'дин', decimal_places: 2 },
  SK: { code: 'EUR', symbol: '€', decimal_places: 2 },
  SI: { code: 'EUR', symbol: '€', decimal_places: 2 },
  ES: { code: 'EUR', symbol: '€', decimal_places: 2 },
  SE: { code: 'SEK', symbol: 'kr', decimal_places: 2 },
  CH: { code: 'CHF', symbol: 'Fr', decimal_places: 2 },
  UA: { code: 'UAH', symbol: '₴', decimal_places: 2 },
  GB: { code: 'GBP', symbol: '£', decimal_places: 2 },
  VA: { code: 'EUR', symbol: '€', decimal_places: 2 },

  // European territories
  AX: { code: 'EUR', symbol: '€', decimal_places: 2 },
  FO: { code: 'DKK', symbol: 'kr', decimal_places: 2 },
  GI: { code: 'GIP', symbol: '£', decimal_places: 2 },
  GG: { code: 'GBP', symbol: '£', decimal_places: 2 },
  IM: { code: 'GBP', symbol: '£', decimal_places: 2 },
  JE: { code: 'GBP', symbol: '£', decimal_places: 2 },
  SJ: { code: 'NOK', symbol: 'kr', decimal_places: 2 },
  GL: { code: 'DKK', symbol: 'kr', decimal_places: 2 },

  // French territories
  BL: { code: 'EUR', symbol: '€', decimal_places: 2 },
  GF: { code: 'EUR', symbol: '€', decimal_places: 2 },
  GP: { code: 'EUR', symbol: '€', decimal_places: 2 },
  MF: { code: 'EUR', symbol: '€', decimal_places: 2 },
  MQ: { code: 'EUR', symbol: '€', decimal_places: 2 },
  NC: { code: 'XPF', symbol: '₣', decimal_places: 0 },
  PF: { code: 'XPF', symbol: '₣', decimal_places: 0 },
  PM: { code: 'EUR', symbol: '€', decimal_places: 2 },
  RE: { code: 'EUR', symbol: '€', decimal_places: 2 },
  TF: { code: 'EUR', symbol: '€', decimal_places: 2 },
  WF: { code: 'XPF', symbol: '₣', decimal_places: 0 },
  YT: { code: 'EUR', symbol: '€', decimal_places: 2 },

  // Caribbean territories
  AI: { code: 'XCD', symbol: '$', decimal_places: 2 },
  AW: { code: 'AWG', symbol: 'ƒ', decimal_places: 2 },
  BM: { code: 'BMD', symbol: '$', decimal_places: 2 },
  BQ: { code: 'USD', symbol: '$', decimal_places: 2 },
  KY: { code: 'KYD', symbol: '$', decimal_places: 2 },
  CW: { code: 'ANG', symbol: 'ƒ', decimal_places: 2 },
  FK: { code: 'FKP', symbol: '£', decimal_places: 2 },
  MS: { code: 'XCD', symbol: '$', decimal_places: 2 },
  SX: { code: 'ANG', symbol: 'ƒ', decimal_places: 2 },
  TC: { code: 'USD', symbol: '$', decimal_places: 2 },
  VG: { code: 'USD', symbol: '$', decimal_places: 2 },

  // Oceania
  AU: { code: 'AUD', symbol: '$', decimal_places: 2 },
  CK: { code: 'NZD', symbol: '$', decimal_places: 2 },
  FJ: { code: 'FJD', symbol: '$', decimal_places: 2 },
  KI: { code: 'AUD', symbol: '$', decimal_places: 2 },
  MH: { code: 'USD', symbol: '$', decimal_places: 2 },
  FM: { code: 'USD', symbol: '$', decimal_places: 2 },
  NR: { code: 'AUD', symbol: '$', decimal_places: 2 },
  NZ: { code: 'NZD', symbol: '$', decimal_places: 2 },
  NU: { code: 'NZD', symbol: '$', decimal_places: 2 },
  PW: { code: 'USD', symbol: '$', decimal_places: 2 },
  PG: { code: 'PGK', symbol: 'K', decimal_places: 2 },
  WS: { code: 'WST', symbol: 'T', decimal_places: 2 },
  SB: { code: 'SBD', symbol: '$', decimal_places: 2 },
  TK: { code: 'NZD', symbol: '$', decimal_places: 2 },
  TO: { code: 'TOP', symbol: 'T$', decimal_places: 2 },
  TV: { code: 'AUD', symbol: '$', decimal_places: 2 },
  VU: { code: 'VUV', symbol: 'Vt', decimal_places: 0 },

  // Pacific territories
  CC: { code: 'AUD', symbol: '$', decimal_places: 2 },
  CX: { code: 'AUD', symbol: '$', decimal_places: 2 },
  HM: { code: 'AUD', symbol: '$', decimal_places: 2 },
  NF: { code: 'AUD', symbol: '$', decimal_places: 2 },

  // Antarctica
  AQ: { code: 'USD', symbol: '$', decimal_places: 2 },
  BV: { code: 'NOK', symbol: 'kr', decimal_places: 2 },
  GS: { code: 'GBP', symbol: '£', decimal_places: 2 },
  IO: { code: 'USD', symbol: '$', decimal_places: 2 },
  PN: { code: 'NZD', symbol: '$', decimal_places: 2 },
  SH: { code: 'SHP', symbol: '£', decimal_places: 2 },
};

// Timezone mapping for countries
const TIMEZONE_DATA = {
  // Major timezones by region
  DZ: 'Africa/Algiers',
  AO: 'Africa/Luanda',
  BJ: 'Africa/Porto-Novo',
  BW: 'Africa/Gaborone',
  BF: 'Africa/Ouagadougou',
  BI: 'Africa/Bujumbura',
  CM: 'Africa/Douala',
  CV: 'Atlantic/Cape_Verde',
  CF: 'Africa/Bangui',
  TD: 'Africa/Ndjamena',
  KM: 'Indian/Comoro',
  CG: 'Africa/Brazzaville',
  CD: 'Africa/Kinshasa',
  CI: 'Africa/Abidjan',
  DJ: 'Africa/Djibouti',
  EG: 'Africa/Cairo',
  GQ: 'Africa/Malabo',
  ER: 'Africa/Asmara',
  SZ: 'Africa/Mbabane',
  ET: 'Africa/Addis_Ababa',
  GA: 'Africa/Libreville',
  GM: 'Africa/Banjul',
  GH: 'Africa/Accra',
  GN: 'Africa/Conakry',
  GW: 'Africa/Bissau',
  KE: 'Africa/Nairobi',
  LS: 'Africa/Maseru',
  LR: 'Africa/Monrovia',
  LY: 'Africa/Tripoli',
  MG: 'Indian/Antananarivo',
  MW: 'Africa/Blantyre',
  ML: 'Africa/Bamako',
  MR: 'Africa/Nouakchott',
  MU: 'Indian/Mauritius',
  MA: 'Africa/Casablanca',
  MZ: 'Africa/Maputo',
  NA: 'Africa/Windhoek',
  NE: 'Africa/Niamey',
  NG: 'Africa/Lagos',
  RW: 'Africa/Kigali',
  ST: 'Africa/Sao_Tome',
  SN: 'Africa/Dakar',
  SC: 'Indian/Mahe',
  SL: 'Africa/Freetown',
  SO: 'Africa/Mogadishu',
  ZA: 'Africa/Johannesburg',
  SS: 'Africa/Juba',
  SD: 'Africa/Khartoum',
  TZ: 'Africa/Dar_es_Salaam',
  TG: 'Africa/Lome',
  TN: 'Africa/Tunis',
  UG: 'Africa/Kampala',
  ZM: 'Africa/Lusaka',
  ZW: 'Africa/Harare',
  EH: 'Africa/El_Aaiun',

  // Americas
  AR: 'America/Argentina/Buenos_Aires',
  BS: 'America/Nassau',
  BB: 'America/Barbados',
  BZ: 'America/Belize',
  BO: 'America/La_Paz',
  BR: 'America/Sao_Paulo',
  CA: 'America/Toronto',
  CL: 'America/Santiago',
  CO: 'America/Bogota',
  CR: 'America/Costa_Rica',
  CU: 'America/Havana',
  DM: 'America/Dominica',
  DO: 'America/Santo_Domingo',
  EC: 'America/Guayaquil',
  SV: 'America/El_Salvador',
  GD: 'America/Grenada',
  GT: 'America/Guatemala',
  GY: 'America/Guyana',
  HT: 'America/Port-au-Prince',
  HN: 'America/Tegucigalpa',
  JM: 'America/Jamaica',
  MX: 'America/Mexico_City',
  NI: 'America/Managua',
  PA: 'America/Panama',
  PY: 'America/Asuncion',
  PE: 'America/Lima',
  KN: 'America/St_Kitts',
  LC: 'America/St_Lucia',
  VC: 'America/St_Vincent',
  SR: 'America/Paramaribo',
  TT: 'America/Port_of_Spain',
  US: 'America/New_York',
  UY: 'America/Montevideo',
  VE: 'America/Caracas',
  AG: 'America/Antigua',
  PR: 'America/Puerto_Rico',
  VI: 'America/St_Thomas',
  GU: 'Pacific/Guam',
  AS: 'Pacific/Pago_Pago',
  MP: 'Pacific/Saipan',
  UM: 'Pacific/Wake',

  // Asia
  AF: 'Asia/Kabul',
  AM: 'Asia/Yerevan',
  AZ: 'Asia/Baku',
  BH: 'Asia/Bahrain',
  BD: 'Asia/Dhaka',
  BT: 'Asia/Thimphu',
  BN: 'Asia/Brunei',
  KH: 'Asia/Phnom_Penh',
  CN: 'Asia/Shanghai',
  GE: 'Asia/Tbilisi',
  HK: 'Asia/Hong_Kong',
  IN: 'Asia/Kolkata',
  ID: 'Asia/Jakarta',
  IR: 'Asia/Tehran',
  IQ: 'Asia/Baghdad',
  IL: 'Asia/Jerusalem',
  JP: 'Asia/Tokyo',
  JO: 'Asia/Amman',
  KZ: 'Asia/Almaty',
  KP: 'Asia/Pyongyang',
  KR: 'Asia/Seoul',
  KW: 'Asia/Kuwait',
  KG: 'Asia/Bishkek',
  LA: 'Asia/Vientiane',
  LB: 'Asia/Beirut',
  MO: 'Asia/Macau',
  MY: 'Asia/Kuala_Lumpur',
  MV: 'Indian/Maldives',
  MN: 'Asia/Ulaanbaatar',
  MM: 'Asia/Yangon',
  NP: 'Asia/Kathmandu',
  OM: 'Asia/Muscat',
  PK: 'Asia/Karachi',
  PS: 'Asia/Gaza',
  PH: 'Asia/Manila',
  QA: 'Asia/Qatar',
  SA: 'Asia/Riyadh',
  SG: 'Asia/Singapore',
  LK: 'Asia/Colombo',
  SY: 'Asia/Damascus',
  TW: 'Asia/Taipei',
  TJ: 'Asia/Dushanbe',
  TH: 'Asia/Bangkok',
  TL: 'Asia/Dili',
  TR: 'Europe/Istanbul',
  TM: 'Asia/Ashgabat',
  AE: 'Asia/Dubai',
  UZ: 'Asia/Tashkent',
  VN: 'Asia/Ho_Chi_Minh',
  YE: 'Asia/Aden',

  // Europe
  AL: 'Europe/Tirane',
  AD: 'Europe/Andorra',
  AT: 'Europe/Vienna',
  BY: 'Europe/Minsk',
  BE: 'Europe/Brussels',
  BA: 'Europe/Sarajevo',
  BG: 'Europe/Sofia',
  HR: 'Europe/Zagreb',
  CY: 'Asia/Nicosia',
  CZ: 'Europe/Prague',
  DK: 'Europe/Copenhagen',
  EE: 'Europe/Tallinn',
  FI: 'Europe/Helsinki',
  FR: 'Europe/Paris',
  DE: 'Europe/Berlin',
  GR: 'Europe/Athens',
  HU: 'Europe/Budapest',
  IS: 'Atlantic/Reykjavik',
  IE: 'Europe/Dublin',
  IT: 'Europe/Rome',
  XK: 'Europe/Belgrade',
  LV: 'Europe/Riga',
  LI: 'Europe/Vaduz',
  LT: 'Europe/Vilnius',
  LU: 'Europe/Luxembourg',
  MT: 'Europe/Malta',
  MD: 'Europe/Chisinau',
  MC: 'Europe/Monaco',
  ME: 'Europe/Podgorica',
  NL: 'Europe/Amsterdam',
  MK: 'Europe/Skopje',
  NO: 'Europe/Oslo',
  PL: 'Europe/Warsaw',
  PT: 'Europe/Lisbon',
  RO: 'Europe/Bucharest',
  RU: 'Europe/Moscow',
  SM: 'Europe/San_Marino',
  RS: 'Europe/Belgrade',
  SK: 'Europe/Bratislava',
  SI: 'Europe/Ljubljana',
  ES: 'Europe/Madrid',
  SE: 'Europe/Stockholm',
  CH: 'Europe/Zurich',
  UA: 'Europe/Kiev',
  GB: 'Europe/London',
  VA: 'Europe/Vatican',
  AX: 'Europe/Mariehamn',
  FO: 'Atlantic/Faroe',
  GI: 'Europe/Gibraltar',
  GG: 'Europe/Guernsey',
  IM: 'Europe/Isle_of_Man',
  JE: 'Europe/Jersey',
  SJ: 'Arctic/Longyearbyen',
  GL: 'America/Godthab',
  BL: 'America/St_Barthelemy',
  GF: 'America/Cayenne',
  GP: 'America/Guadeloupe',
  MF: 'America/Marigot',
  MQ: 'America/Martinique',
  NC: 'Pacific/Noumea',
  PF: 'Pacific/Tahiti',
  PM: 'America/Miquelon',
  RE: 'Indian/Reunion',
  TF: 'Indian/Kerguelen',
  WF: 'Pacific/Wallis',
  YT: 'Indian/Mayotte',
  AI: 'America/Anguilla',
  AW: 'America/Aruba',
  BM: 'Atlantic/Bermuda',
  BQ: 'America/Kralendijk',
  KY: 'America/Cayman',
  CW: 'America/Curacao',
  FK: 'Atlantic/Stanley',
  MS: 'America/Montserrat',
  SX: 'America/Lower_Princes',
  TC: 'America/Grand_Turk',
  VG: 'America/Tortola',

  // Oceania
  AU: 'Australia/Sydney',
  CK: 'Pacific/Rarotonga',
  FJ: 'Pacific/Fiji',
  KI: 'Pacific/Tarawa',
  MH: 'Pacific/Majuro',
  FM: 'Pacific/Pohnpei',
  NR: 'Pacific/Nauru',
  NZ: 'Pacific/Auckland',
  NU: 'Pacific/Niue',
  PW: 'Pacific/Palau',
  PG: 'Pacific/Port_Moresby',
  WS: 'Pacific/Apia',
  SB: 'Pacific/Guadalcanal',
  TK: 'Pacific/Fakaofo',
  TO: 'Pacific/Tongatapu',
  TV: 'Pacific/Funafuti',
  VU: 'Pacific/Efate',
  CC: 'Indian/Cocos',
  CX: 'Indian/Christmas',
  HM: 'Indian/Kerguelen',
  NF: 'Pacific/Norfolk',

  // Antarctica
  AQ: 'Antarctica/McMurdo',
  BV: 'Antarctica/Troll',
  GS: 'Atlantic/South_Georgia',
  IO: 'Indian/Chagos',
  PN: 'Pacific/Pitcairn',
  SH: 'Atlantic/St_Helena',
};

/**
 * Get default POS data template for a country
 */
function getDefaultPOSData(countryCode) {
  const currency = CURRENCY_DATA[countryCode];
  const timezone = TIMEZONE_DATA[countryCode];

  if (!currency) {
    console.warn(`Warning: No currency data found for ${countryCode}`);
    return null;
  }

  // Default tax configuration (simplified - countries have varying tax systems)
  const taxType = [
    'AT',
    'BE',
    'BG',
    'HR',
    'CY',
    'CZ',
    'DK',
    'EE',
    'FI',
    'FR',
    'DE',
    'GR',
    'HU',
    'IE',
    'IT',
    'LV',
    'LT',
    'LU',
    'MT',
    'NL',
    'PL',
    'PT',
    'RO',
    'SK',
    'SI',
    'ES',
    'SE',
    'GB',
  ].includes(countryCode)
    ? 'VAT'
    : ['AU', 'NZ', 'SG', 'IN', 'MY', 'CA'].includes(countryCode)
      ? 'GST'
      : ['US'].includes(countryCode)
        ? 'Sales Tax'
        : 'VAT';

  // Standard tax rate (default 0 - should be updated with actual rates)
  const standardRate = null;

  return {
    currency: {
      code: currency.code,
      symbol: currency.symbol,
      symbol_position: 'before',
      decimal_places: currency.decimal_places,
      decimal_separator: '.',
      thousands_separator: ',',
    },
    tax: {
      type: taxType,
      rate: {
        standard: standardRate,
      },
      included_in_price: true,
      invoice_requirement: 'optional',
    },
    receipt: {
      required_fields: ['business_name', 'date', 'items', 'total'],
      paper_width: '80mm',
      electronic_allowed: true,
      retention_period: '5 years',
    },
    fiscal: {
      fiscal_device_required: false,
      registration_required: false,
      reporting_frequency: 'varies',
    },
    payment_methods: [
      {
        type: 'cash',
        name: 'Cash',
        prevalence: 'high',
      },
      {
        type: 'credit_card',
        name: 'Credit Card',
        prevalence: 'high',
      },
    ],
    locale: {
      date_format: 'YYYY-MM-DD',
      time_format: '24h',
      timezone: timezone || 'UTC',
      week_start: 'monday',
    },
    business_hours: {
      typical_open: '09:00',
      typical_close: '18:00',
      sunday_trading: true,
      public_holidays_trading: false,
    },
  };
}

/**
 * Get parent country code for special regions
 */
function getParentCountryCode(data, filePath) {
  // Check for parent_country field
  if (data.parent_country && data.parent_country.alpha2) {
    return data.parent_country.alpha2;
  }

  // Check for region_of field
  if (data.region_of) {
    // Map region names to country codes
    const regionMap = {
      Spain: 'ES',
      Portugal: 'PT',
      Indonesia: 'ID',
      India: 'IN',
      Chile: 'CL',
    };
    return regionMap[data.region_of];
  }

  // Check file path for parent country
  const pathParts = filePath.split(path.sep);
  const parentDir = pathParts[pathParts.length - 3];

  // If parent directory is a 2-letter code, use it
  if (parentDir && parentDir.length === 2 && parentDir === parentDir.toUpperCase()) {
    return parentDir;
  }

  return null;
}

/**
 * Add POS data to a country YAML file
 */
function addPOSToCountry(filePath) {
  try {
    // Skip metadata and schema files
    const fileName = path.basename(filePath);
    if (fileName === 'meta.yaml' || fileName === 'schema.yaml') {
      console.log(`⊘ Skipping ${fileName} (metadata/schema file)`);
      return false;
    }

    // Read the YAML file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(fileContent);

    // Skip if POS data already exists
    if (data.pos) {
      console.log(`✓ ${path.basename(filePath, '.yaml')} already has POS data`);
      return false;
    }

    // Get country code from file name or parent country
    let countryCode = path.basename(filePath, '.yaml');

    // For disputed territories in subregions, use Georgia's currency for Caucasus regions
    if (filePath.includes('/subregions/')) {
      if (countryCode === 'AB' || countryCode === 'SO') {
        // Caucasus disputed territories use Russian Ruble
        countryCode = 'RU';
        console.log(
          `  Using Russia (RU) for disputed territory ${path.basename(filePath, '.yaml')}`
        );
      }
    } else if (
      data.parent_country ||
      data.region_of ||
      filePath.includes('/regions/') ||
      filePath.includes('/overseas/')
    ) {
      // For special regions, try to get parent country code
      const parentCode = getParentCountryCode(data, filePath);
      if (parentCode) {
        console.log(`  Using parent country ${parentCode} for region ${countryCode}`);
        countryCode = parentCode;
      }
    }

    // For Antarctica stations and claims, use USD as default
    if (filePath.includes('/antarctica/')) {
      if (filePath.includes('/stations/')) {
        // Get operating country if available
        if (data.operating_country && data.operating_country.alpha2) {
          countryCode = data.operating_country.alpha2;
        } else {
          // Default to USD for stations
          countryCode = 'AQ';
        }
      } else if (filePath.includes('/claims/')) {
        // For claims, use the claim holder's currency
        const claimMap = {
          AR_CLAIM: 'AR',
          AT: 'AU',
          BAT: 'GB',
          CL_CLAIM: 'CL',
          FR_ADELIE: 'FR',
          NO_PB: 'NO',
          NO_QML: 'NO',
          NZ_ROSS: 'NZ',
          UNCLAIMED: 'AQ',
        };
        countryCode = claimMap[countryCode] || 'AQ';
      }
    }

    // Get default POS data
    const posData = getDefaultPOSData(countryCode);

    if (!posData) {
      console.log(
        `✗ Skipping ${path.basename(filePath, '.yaml')} - no currency data available for ${countryCode}`
      );
      return false;
    }

    // Add POS data to the country data
    data.pos = posData;

    // Write back to file
    const yamlContent = yaml.dump(data, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    });

    fs.writeFileSync(filePath, yamlContent, 'utf8');
    console.log(`✓ Added POS data to ${path.basename(filePath, '.yaml')}`);
    return true;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Recursively find all YAML files in a directory
 */
function findYAMLFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip certain directories
      if (
        !['libaddressinput', 'cloud-address-book', 'pos', 'node_modules', '.git'].includes(file)
      ) {
        findYAMLFiles(filePath, fileList);
      }
    } else if (file.endsWith('.yaml')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Main execution
 */
function main() {
  const dataDir = path.join(__dirname, '..', 'data');

  console.log('🏪 Adding POS data to all countries...\n');

  // Find all YAML files
  const yamlFiles = findYAMLFiles(dataDir);
  console.log(`Found ${yamlFiles.length} YAML files\n`);

  let updatedCount = 0;
  let skippedCount = 0;

  // Process each file
  yamlFiles.forEach((file) => {
    if (addPOSToCountry(file)) {
      updatedCount++;
    } else {
      skippedCount++;
    }
  });

  console.log('\n✅ Processing complete!');
  console.log(`   Updated: ${updatedCount}`);
  console.log(`   Skipped: ${skippedCount}`);
  console.log(`   Total:   ${yamlFiles.length}`);
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { getDefaultPOSData, addPOSToCountry };
