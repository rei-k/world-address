/**
 * Country Registry - Centralized country and continent data management
 * 
 * Provides:
 * - Country metadata with flags
 * - Continent-based organization
 * - Filtering and search capabilities
 */

import type { Continent, ContinentInfo, CountryOption } from './veyform';

/**
 * Country metadata registry
 * Auto-generated from data/ directory structure
 */
export interface CountryMetadata {
  code: string; // ISO alpha-2
  alpha3?: string; // ISO alpha-3
  numeric?: string; // ISO numeric
  name: {
    en: string;
    local?: string;
  };
  continent: Continent;
  subregion: string;
  flag: string;
  hasData: boolean;
  dataPath: string;
}

/**
 * Continent registry with countries
 */
export class CountryRegistry {
  private static countries: Map<string, CountryMetadata> = new Map();
  private static continents: Map<Continent, Set<string>> = new Map();
  private static initialized = false;

  /**
   * Initialize registry with country data
   */
  static init(): void {
    if (this.initialized) return;

    // Africa
    this.registerCountry('DZ', { name: 'Algeria', continent: 'africa', subregion: 'Northern Africa' });
    this.registerCountry('AO', { name: 'Angola', continent: 'africa', subregion: 'Central Africa' });
    this.registerCountry('BJ', { name: 'Benin', continent: 'africa', subregion: 'West Africa' });
    this.registerCountry('BW', { name: 'Botswana', continent: 'africa', subregion: 'Southern Africa' });
    this.registerCountry('BF', { name: 'Burkina Faso', continent: 'africa', subregion: 'West Africa' });
    this.registerCountry('BI', { name: 'Burundi', continent: 'africa', subregion: 'Eastern Africa' });
    this.registerCountry('CM', { name: 'Cameroon', continent: 'africa', subregion: 'Central Africa' });
    this.registerCountry('CV', { name: 'Cape Verde', continent: 'africa', subregion: 'West Africa' });
    this.registerCountry('CF', { name: 'Central African Republic', continent: 'africa', subregion: 'Central Africa' });
    this.registerCountry('TD', { name: 'Chad', continent: 'africa', subregion: 'Central Africa' });
    this.registerCountry('KM', { name: 'Comoros', continent: 'africa', subregion: 'Eastern Africa' });
    this.registerCountry('CG', { name: 'Republic of the Congo', continent: 'africa', subregion: 'Central Africa' });
    this.registerCountry('CD', { name: 'Democratic Republic of the Congo', continent: 'africa', subregion: 'Central Africa' });
    this.registerCountry('CI', { name: 'Côte d\'Ivoire', continent: 'africa', subregion: 'West Africa' });
    this.registerCountry('DJ', { name: 'Djibouti', continent: 'africa', subregion: 'Eastern Africa' });
    this.registerCountry('EG', { name: 'Egypt', continent: 'africa', subregion: 'Northern Africa' });
    this.registerCountry('GQ', { name: 'Equatorial Guinea', continent: 'africa', subregion: 'Central Africa' });
    this.registerCountry('ER', { name: 'Eritrea', continent: 'africa', subregion: 'Eastern Africa' });
    this.registerCountry('ET', { name: 'Ethiopia', continent: 'africa', subregion: 'Eastern Africa' });
    this.registerCountry('GA', { name: 'Gabon', continent: 'africa', subregion: 'Central Africa' });
    this.registerCountry('GM', { name: 'The Gambia', continent: 'africa', subregion: 'West Africa' });
    this.registerCountry('GH', { name: 'Ghana', continent: 'africa', subregion: 'West Africa' });
    this.registerCountry('GN', { name: 'Guinea', continent: 'africa', subregion: 'West Africa' });
    this.registerCountry('GW', { name: 'Guinea-Bissau', continent: 'africa', subregion: 'West Africa' });
    this.registerCountry('KE', { name: 'Kenya', continent: 'africa', subregion: 'Eastern Africa' });
    this.registerCountry('LS', { name: 'Lesotho', continent: 'africa', subregion: 'Southern Africa' });
    this.registerCountry('LR', { name: 'Liberia', continent: 'africa', subregion: 'West Africa' });
    this.registerCountry('LY', { name: 'Libya', continent: 'africa', subregion: 'Northern Africa' });
    this.registerCountry('MG', { name: 'Madagascar', continent: 'africa', subregion: 'Eastern Africa' });
    this.registerCountry('MW', { name: 'Malawi', continent: 'africa', subregion: 'Eastern Africa' });
    this.registerCountry('ML', { name: 'Mali', continent: 'africa', subregion: 'West Africa' });
    this.registerCountry('MR', { name: 'Mauritania', continent: 'africa', subregion: 'West Africa' });
    this.registerCountry('MU', { name: 'Mauritius', continent: 'africa', subregion: 'Eastern Africa' });
    this.registerCountry('MA', { name: 'Morocco', continent: 'africa', subregion: 'Northern Africa' });
    this.registerCountry('MZ', { name: 'Mozambique', continent: 'africa', subregion: 'Eastern Africa' });
    this.registerCountry('NA', { name: 'Namibia', continent: 'africa', subregion: 'Southern Africa' });
    this.registerCountry('NE', { name: 'Niger', continent: 'africa', subregion: 'West Africa' });
    this.registerCountry('NG', { name: 'Nigeria', continent: 'africa', subregion: 'West Africa' });
    this.registerCountry('RW', { name: 'Rwanda', continent: 'africa', subregion: 'Eastern Africa' });
    this.registerCountry('ST', { name: 'São Tomé and Príncipe', continent: 'africa', subregion: 'Central Africa' });
    this.registerCountry('SN', { name: 'Senegal', continent: 'africa', subregion: 'West Africa' });
    this.registerCountry('SC', { name: 'Seychelles', continent: 'africa', subregion: 'Eastern Africa' });
    this.registerCountry('SL', { name: 'Sierra Leone', continent: 'africa', subregion: 'West Africa' });
    this.registerCountry('SO', { name: 'Somalia', continent: 'africa', subregion: 'Eastern Africa' });
    this.registerCountry('ZA', { name: 'South Africa', continent: 'africa', subregion: 'Southern Africa' });
    this.registerCountry('SS', { name: 'South Sudan', continent: 'africa', subregion: 'Northern Africa' });
    this.registerCountry('SD', { name: 'Sudan', continent: 'africa', subregion: 'Northern Africa' });
    this.registerCountry('SZ', { name: 'Eswatini', continent: 'africa', subregion: 'Southern Africa' });
    this.registerCountry('TZ', { name: 'Tanzania', continent: 'africa', subregion: 'Eastern Africa' });
    this.registerCountry('TG', { name: 'Togo', continent: 'africa', subregion: 'West Africa' });
    this.registerCountry('TN', { name: 'Tunisia', continent: 'africa', subregion: 'Northern Africa' });
    this.registerCountry('UG', { name: 'Uganda', continent: 'africa', subregion: 'Eastern Africa' });
    this.registerCountry('ZM', { name: 'Zambia', continent: 'africa', subregion: 'Eastern Africa' });
    this.registerCountry('ZW', { name: 'Zimbabwe', continent: 'africa', subregion: 'Eastern Africa' });

    // Americas
    this.registerCountry('AR', { name: 'Argentina', continent: 'americas', subregion: 'South America' });
    this.registerCountry('BO', { name: 'Bolivia', continent: 'americas', subregion: 'South America' });
    this.registerCountry('BR', { name: 'Brazil', continent: 'americas', subregion: 'South America' });
    this.registerCountry('CL', { name: 'Chile', continent: 'americas', subregion: 'South America' });
    this.registerCountry('CO', { name: 'Colombia', continent: 'americas', subregion: 'South America' });
    this.registerCountry('EC', { name: 'Ecuador', continent: 'americas', subregion: 'South America' });
    this.registerCountry('GY', { name: 'Guyana', continent: 'americas', subregion: 'South America' });
    this.registerCountry('PE', { name: 'Peru', continent: 'americas', subregion: 'South America' });
    this.registerCountry('PY', { name: 'Paraguay', continent: 'americas', subregion: 'South America' });
    this.registerCountry('SR', { name: 'Suriname', continent: 'americas', subregion: 'South America' });
    this.registerCountry('UY', { name: 'Uruguay', continent: 'americas', subregion: 'South America' });
    this.registerCountry('VE', { name: 'Venezuela', continent: 'americas', subregion: 'South America' });
    this.registerCountry('CA', { name: 'Canada', continent: 'americas', subregion: 'North America' });
    this.registerCountry('MX', { name: 'Mexico', continent: 'americas', subregion: 'North America' });
    this.registerCountry('US', { name: 'United States', continent: 'americas', subregion: 'North America' });
    this.registerCountry('BZ', { name: 'Belize', continent: 'americas', subregion: 'Central America' });
    this.registerCountry('CR', { name: 'Costa Rica', continent: 'americas', subregion: 'Central America' });
    this.registerCountry('GT', { name: 'Guatemala', continent: 'americas', subregion: 'Central America' });
    this.registerCountry('HN', { name: 'Honduras', continent: 'americas', subregion: 'Central America' });
    this.registerCountry('NI', { name: 'Nicaragua', continent: 'americas', subregion: 'Central America' });
    this.registerCountry('PA', { name: 'Panama', continent: 'americas', subregion: 'Central America' });
    this.registerCountry('SV', { name: 'El Salvador', continent: 'americas', subregion: 'Central America' });

    // Asia
    this.registerCountry('CN', { name: 'China', nameLocal: '中国', continent: 'asia', subregion: 'East Asia' });
    this.registerCountry('JP', { name: 'Japan', nameLocal: '日本', continent: 'asia', subregion: 'East Asia' });
    this.registerCountry('KR', { name: 'South Korea', nameLocal: '대한민국', continent: 'asia', subregion: 'East Asia' });
    this.registerCountry('KP', { name: 'North Korea', continent: 'asia', subregion: 'East Asia' });
    this.registerCountry('MN', { name: 'Mongolia', continent: 'asia', subregion: 'East Asia' });
    this.registerCountry('TW', { name: 'Taiwan', nameLocal: '台灣', continent: 'asia', subregion: 'East Asia' });
    this.registerCountry('HK', { name: 'Hong Kong', nameLocal: '香港', continent: 'asia', subregion: 'East Asia' });
    this.registerCountry('MO', { name: 'Macao', continent: 'asia', subregion: 'East Asia' });
    this.registerCountry('BN', { name: 'Brunei', continent: 'asia', subregion: 'Southeast Asia' });
    this.registerCountry('ID', { name: 'Indonesia', continent: 'asia', subregion: 'Southeast Asia' });
    this.registerCountry('KH', { name: 'Cambodia', continent: 'asia', subregion: 'Southeast Asia' });
    this.registerCountry('LA', { name: 'Laos', continent: 'asia', subregion: 'Southeast Asia' });
    this.registerCountry('MM', { name: 'Myanmar', continent: 'asia', subregion: 'Southeast Asia' });
    this.registerCountry('MY', { name: 'Malaysia', continent: 'asia', subregion: 'Southeast Asia' });
    this.registerCountry('PH', { name: 'Philippines', continent: 'asia', subregion: 'Southeast Asia' });
    this.registerCountry('SG', { name: 'Singapore', continent: 'asia', subregion: 'Southeast Asia' });
    this.registerCountry('TH', { name: 'Thailand', continent: 'asia', subregion: 'Southeast Asia' });
    this.registerCountry('TL', { name: 'Timor-Leste', continent: 'asia', subregion: 'Southeast Asia' });
    this.registerCountry('VN', { name: 'Vietnam', continent: 'asia', subregion: 'Southeast Asia' });
    this.registerCountry('AF', { name: 'Afghanistan', continent: 'asia', subregion: 'South Asia' });
    this.registerCountry('BD', { name: 'Bangladesh', continent: 'asia', subregion: 'South Asia' });
    this.registerCountry('BT', { name: 'Bhutan', continent: 'asia', subregion: 'South Asia' });
    this.registerCountry('IN', { name: 'India', continent: 'asia', subregion: 'South Asia' });
    this.registerCountry('LK', { name: 'Sri Lanka', continent: 'asia', subregion: 'South Asia' });
    this.registerCountry('MV', { name: 'Maldives', continent: 'asia', subregion: 'South Asia' });
    this.registerCountry('NP', { name: 'Nepal', continent: 'asia', subregion: 'South Asia' });
    this.registerCountry('PK', { name: 'Pakistan', continent: 'asia', subregion: 'South Asia' });
    this.registerCountry('KZ', { name: 'Kazakhstan', continent: 'asia', subregion: 'Central Asia' });
    this.registerCountry('KG', { name: 'Kyrgyzstan', continent: 'asia', subregion: 'Central Asia' });
    this.registerCountry('TJ', { name: 'Tajikistan', continent: 'asia', subregion: 'Central Asia' });
    this.registerCountry('TM', { name: 'Turkmenistan', continent: 'asia', subregion: 'Central Asia' });
    this.registerCountry('UZ', { name: 'Uzbekistan', continent: 'asia', subregion: 'Central Asia' });
    this.registerCountry('AE', { name: 'United Arab Emirates', continent: 'asia', subregion: 'West Asia' });
    this.registerCountry('BH', { name: 'Bahrain', continent: 'asia', subregion: 'West Asia' });
    this.registerCountry('IL', { name: 'Israel', continent: 'asia', subregion: 'West Asia' });
    this.registerCountry('IQ', { name: 'Iraq', continent: 'asia', subregion: 'West Asia' });
    this.registerCountry('IR', { name: 'Iran', continent: 'asia', subregion: 'West Asia' });
    this.registerCountry('JO', { name: 'Jordan', continent: 'asia', subregion: 'West Asia' });
    this.registerCountry('KW', { name: 'Kuwait', continent: 'asia', subregion: 'West Asia' });
    this.registerCountry('LB', { name: 'Lebanon', continent: 'asia', subregion: 'West Asia' });
    this.registerCountry('OM', { name: 'Oman', continent: 'asia', subregion: 'West Asia' });
    this.registerCountry('PS', { name: 'Palestine', continent: 'asia', subregion: 'West Asia' });
    this.registerCountry('QA', { name: 'Qatar', continent: 'asia', subregion: 'West Asia' });
    this.registerCountry('SA', { name: 'Saudi Arabia', continent: 'asia', subregion: 'West Asia' });
    this.registerCountry('SY', { name: 'Syria', continent: 'asia', subregion: 'West Asia' });
    this.registerCountry('TR', { name: 'Turkey', continent: 'asia', subregion: 'West Asia' });
    this.registerCountry('YE', { name: 'Yemen', continent: 'asia', subregion: 'West Asia' });
    this.registerCountry('AM', { name: 'Armenia', continent: 'asia', subregion: 'Caucasus' });
    this.registerCountry('AZ', { name: 'Azerbaijan', continent: 'asia', subregion: 'Caucasus' });
    this.registerCountry('GE', { name: 'Georgia', continent: 'asia', subregion: 'Caucasus' });

    // Europe
    this.registerCountry('AT', { name: 'Austria', continent: 'europe', subregion: 'Western Europe' });
    this.registerCountry('BE', { name: 'Belgium', continent: 'europe', subregion: 'Western Europe' });
    this.registerCountry('CH', { name: 'Switzerland', continent: 'europe', subregion: 'Western Europe' });
    this.registerCountry('DE', { name: 'Germany', continent: 'europe', subregion: 'Western Europe' });
    this.registerCountry('FR', { name: 'France', continent: 'europe', subregion: 'Western Europe' });
    this.registerCountry('LI', { name: 'Liechtenstein', continent: 'europe', subregion: 'Western Europe' });
    this.registerCountry('LU', { name: 'Luxembourg', continent: 'europe', subregion: 'Western Europe' });
    this.registerCountry('MC', { name: 'Monaco', continent: 'europe', subregion: 'Western Europe' });
    this.registerCountry('NL', { name: 'Netherlands', continent: 'europe', subregion: 'Western Europe' });
    this.registerCountry('DK', { name: 'Denmark', continent: 'europe', subregion: 'Northern Europe' });
    this.registerCountry('EE', { name: 'Estonia', continent: 'europe', subregion: 'Northern Europe' });
    this.registerCountry('FI', { name: 'Finland', continent: 'europe', subregion: 'Northern Europe' });
    this.registerCountry('GB', { name: 'United Kingdom', continent: 'europe', subregion: 'Northern Europe' });
    this.registerCountry('IE', { name: 'Ireland', continent: 'europe', subregion: 'Northern Europe' });
    this.registerCountry('IS', { name: 'Iceland', continent: 'europe', subregion: 'Northern Europe' });
    this.registerCountry('LT', { name: 'Lithuania', continent: 'europe', subregion: 'Northern Europe' });
    this.registerCountry('LV', { name: 'Latvia', continent: 'europe', subregion: 'Northern Europe' });
    this.registerCountry('NO', { name: 'Norway', continent: 'europe', subregion: 'Northern Europe' });
    this.registerCountry('SE', { name: 'Sweden', continent: 'europe', subregion: 'Northern Europe' });
    this.registerCountry('BG', { name: 'Bulgaria', continent: 'europe', subregion: 'Eastern Europe' });
    this.registerCountry('BY', { name: 'Belarus', continent: 'europe', subregion: 'Eastern Europe' });
    this.registerCountry('CZ', { name: 'Czech Republic', continent: 'europe', subregion: 'Eastern Europe' });
    this.registerCountry('HU', { name: 'Hungary', continent: 'europe', subregion: 'Eastern Europe' });
    this.registerCountry('MD', { name: 'Moldova', continent: 'europe', subregion: 'Eastern Europe' });
    this.registerCountry('PL', { name: 'Poland', continent: 'europe', subregion: 'Eastern Europe' });
    this.registerCountry('RO', { name: 'Romania', continent: 'europe', subregion: 'Eastern Europe' });
    this.registerCountry('RU', { name: 'Russia', continent: 'europe', subregion: 'Eastern Europe' });
    this.registerCountry('SK', { name: 'Slovakia', continent: 'europe', subregion: 'Eastern Europe' });
    this.registerCountry('UA', { name: 'Ukraine', continent: 'europe', subregion: 'Eastern Europe' });
    this.registerCountry('AD', { name: 'Andorra', continent: 'europe', subregion: 'Southern Europe' });
    this.registerCountry('AL', { name: 'Albania', continent: 'europe', subregion: 'Southeastern Europe' });
    this.registerCountry('BA', { name: 'Bosnia and Herzegovina', continent: 'europe', subregion: 'Southeastern Europe' });
    this.registerCountry('CY', { name: 'Cyprus', continent: 'europe', subregion: 'Southern Europe' });
    this.registerCountry('ES', { name: 'Spain', continent: 'europe', subregion: 'Southern Europe' });
    this.registerCountry('GR', { name: 'Greece', continent: 'europe', subregion: 'Southern Europe' });
    this.registerCountry('HR', { name: 'Croatia', continent: 'europe', subregion: 'Southeastern Europe' });
    this.registerCountry('IT', { name: 'Italy', continent: 'europe', subregion: 'Southern Europe' });
    this.registerCountry('ME', { name: 'Montenegro', continent: 'europe', subregion: 'Southeastern Europe' });
    this.registerCountry('MK', { name: 'North Macedonia', continent: 'europe', subregion: 'Southeastern Europe' });
    this.registerCountry('MT', { name: 'Malta', continent: 'europe', subregion: 'Southern Europe' });
    this.registerCountry('PT', { name: 'Portugal', continent: 'europe', subregion: 'Southern Europe' });
    this.registerCountry('RS', { name: 'Serbia', continent: 'europe', subregion: 'Southeastern Europe' });
    this.registerCountry('SI', { name: 'Slovenia', continent: 'europe', subregion: 'Southeastern Europe' });
    this.registerCountry('SM', { name: 'San Marino', continent: 'europe', subregion: 'Southern Europe' });
    this.registerCountry('VA', { name: 'Vatican City', continent: 'europe', subregion: 'Southern Europe' });

    // Oceania
    this.registerCountry('AU', { name: 'Australia', continent: 'oceania', subregion: 'Australia and New Zealand' });
    this.registerCountry('NZ', { name: 'New Zealand', continent: 'oceania', subregion: 'Australia and New Zealand' });
    this.registerCountry('FJ', { name: 'Fiji', continent: 'oceania', subregion: 'Melanesia' });
    this.registerCountry('PG', { name: 'Papua New Guinea', continent: 'oceania', subregion: 'Melanesia' });
    this.registerCountry('SB', { name: 'Solomon Islands', continent: 'oceania', subregion: 'Melanesia' });
    this.registerCountry('VU', { name: 'Vanuatu', continent: 'oceania', subregion: 'Melanesia' });
    this.registerCountry('FM', { name: 'Federated States of Micronesia', continent: 'oceania', subregion: 'Micronesia' });
    this.registerCountry('KI', { name: 'Kiribati', continent: 'oceania', subregion: 'Micronesia' });
    this.registerCountry('MH', { name: 'Marshall Islands', continent: 'oceania', subregion: 'Micronesia' });
    this.registerCountry('NR', { name: 'Nauru', continent: 'oceania', subregion: 'Micronesia' });
    this.registerCountry('PW', { name: 'Palau', continent: 'oceania', subregion: 'Micronesia' });
    this.registerCountry('TO', { name: 'Tonga', continent: 'oceania', subregion: 'Polynesia' });
    this.registerCountry('TV', { name: 'Tuvalu', continent: 'oceania', subregion: 'Polynesia' });
    this.registerCountry('WS', { name: 'Samoa', continent: 'oceania', subregion: 'Polynesia' });

    this.initialized = true;
  }

  /**
   * Register a country in the registry
   */
  private static registerCountry(
    code: string,
    data: { name: string; nameLocal?: string; continent: Continent; subregion: string }
  ): void {
    const metadata: CountryMetadata = {
      code,
      name: {
        en: data.name,
        local: data.nameLocal
      },
      continent: data.continent,
      subregion: data.subregion,
      flag: this.getFlag(code),
      hasData: true,
      dataPath: `/data/${data.continent}/${data.subregion.toLowerCase().replace(/ /g, '_')}/${code}/${code}.yaml`
    };

    this.countries.set(code, metadata);

    // Add to continent index
    if (!this.continents.has(data.continent)) {
      this.continents.set(data.continent, new Set());
    }
    this.continents.get(data.continent)!.add(code);
  }

  /**
   * Get country flag emoji
   */
  private static getFlag(countryCode: string): string {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }

  /**
   * Get all countries
   */
  static getAllCountries(): CountryMetadata[] {
    this.init();
    return Array.from(this.countries.values());
  }

  /**
   * Get countries by continent
   */
  static getCountriesByContinent(continent: Continent): CountryMetadata[] {
    this.init();
    const codes = this.continents.get(continent) || new Set();
    return Array.from(codes)
      .map(code => this.countries.get(code)!)
      .filter(Boolean)
      .sort((a, b) => a.name.en.localeCompare(b.name.en));
  }

  /**
   * Get country by code
   */
  static getCountry(code: string): CountryMetadata | undefined {
    this.init();
    return this.countries.get(code.toUpperCase());
  }

  /**
   * Search countries by name
   */
  static searchCountries(query: string, language: 'en' | 'local' = 'en'): CountryMetadata[] {
    this.init();
    const lowerQuery = query.toLowerCase();
    return Array.from(this.countries.values())
      .filter(country => {
        const name = language === 'local' && country.name.local
          ? country.name.local
          : country.name.en;
        return name.toLowerCase().includes(lowerQuery);
      })
      .sort((a, b) => a.name.en.localeCompare(b.name.en));
  }

  /**
   * Get continent info
   */
  static getContinentInfo(continent: Continent): ContinentInfo {
    this.init();
    const countries = this.getCountriesByContinent(continent).map(c => c.code);
    
    const continentNames = {
      africa: { en: 'Africa', ja: 'アフリカ', zh: '非洲', ko: '아프리카' },
      americas: { en: 'Americas', ja: 'アメリカ大陸', zh: '美洲', ko: '아메리카' },
      antarctica: { en: 'Antarctica', ja: '南極', zh: '南极洲', ko: '남극' },
      asia: { en: 'Asia', ja: 'アジア', zh: '亚洲', ko: '아시아' },
      europe: { en: 'Europe', ja: 'ヨーロッパ', zh: '欧洲', ko: '유럽' },
      oceania: { en: 'Oceania', ja: 'オセアニア', zh: '大洋洲', ko: '오세아니아' }
    };

    return {
      code: continent,
      name: continentNames[continent],
      countries
    };
  }

  /**
   * Get all continent info
   */
  static getAllContinents(): ContinentInfo[] {
    this.init();
    const continents: Continent[] = ['africa', 'americas', 'asia', 'europe', 'oceania', 'antarctica'];
    return continents.map(c => this.getContinentInfo(c));
  }

  /**
   * Convert to CountryOption format
   */
  static toCountryOption(metadata: CountryMetadata): CountryOption {
    return {
      code: metadata.code,
      name: metadata.name.en,
      nameLocal: metadata.name.local,
      flag: metadata.flag,
      continent: metadata.continent,
      subregion: metadata.subregion
    };
  }

  /**
   * Get popular countries (recommended set)
   */
  static getPopularCountries(): CountryMetadata[] {
    this.init();
    const popular = ['US', 'GB', 'CA', 'AU', 'JP', 'CN', 'KR', 'DE', 'FR', 'IT', 'ES', 'BR', 'IN', 'SG'];
    return popular
      .map(code => this.countries.get(code)!)
      .filter(Boolean);
  }

  /**
   * Get recommended sets
   */
  static getRecommendedSet(setName: 'east_asia' | 'north_america' | 'europe' | 'southeast_asia' | 'all'): CountryMetadata[] {
    this.init();
    const sets = {
      east_asia: ['JP', 'CN', 'KR', 'TW', 'HK', 'MO'],
      north_america: ['US', 'CA', 'MX'],
      europe: ['GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI'],
      southeast_asia: ['SG', 'MY', 'TH', 'ID', 'PH', 'VN'],
      all: Array.from(this.countries.keys())
    };

    return (sets[setName] || [])
      .map(code => this.countries.get(code)!)
      .filter(Boolean);
  }
}
