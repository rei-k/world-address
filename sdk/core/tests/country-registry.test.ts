/**
 * @vey/core - Tests for country-registry module
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CountryRegistry } from '../src/country-registry';
import type { Continent } from '../src/veyform';

describe('CountryRegistry', () => {
  beforeEach(() => {
    // Initialize the registry
    CountryRegistry.init();
  });

  describe('initialization', () => {
    it('should initialize without errors', () => {
      expect(() => CountryRegistry.init()).not.toThrow();
    });

    it('should be idempotent', () => {
      CountryRegistry.init();
      CountryRegistry.init();
      CountryRegistry.init();
      // Should not throw or cause issues
      expect(CountryRegistry.getAllCountries().length).toBeGreaterThan(0);
    });
  });

  describe('getAllCountries', () => {
    it('should return array of countries', () => {
      const countries = CountryRegistry.getAllCountries();
      expect(Array.isArray(countries)).toBe(true);
      expect(countries.length).toBeGreaterThan(0);
    });

    it('should return country metadata with required fields', () => {
      const countries = CountryRegistry.getAllCountries();
      const japan = countries.find(c => c.code === 'JP');
      
      expect(japan).toBeDefined();
      expect(japan!.code).toBe('JP');
      expect(japan!.name.en).toBe('Japan');
      expect(japan!.name.local).toBe('日本');
      expect(japan!.continent).toBe('asia');
      expect(japan!.subregion).toBeDefined();
      expect(japan!.flag).toBeDefined();
      expect(japan!.hasData).toBe(true);
      expect(japan!.dataPath).toBeDefined();
    });

    it('should include countries from all continents', () => {
      const countries = CountryRegistry.getAllCountries();
      
      const continents = new Set(countries.map(c => c.continent));
      expect(continents.has('africa')).toBe(true);
      expect(continents.has('americas')).toBe(true);
      expect(continents.has('asia')).toBe(true);
      expect(continents.has('europe')).toBe(true);
      expect(continents.has('oceania')).toBe(true);
    });
  });

  describe('getCountriesByContinent', () => {
    it('should return countries for Africa', () => {
      const countries = CountryRegistry.getCountriesByContinent('africa');
      expect(Array.isArray(countries)).toBe(true);
      expect(countries.length).toBeGreaterThan(0);
      
      const egypt = countries.find(c => c.code === 'EG');
      expect(egypt).toBeDefined();
      expect(egypt!.name.en).toBe('Egypt');
    });

    it('should return countries for Americas', () => {
      const countries = CountryRegistry.getCountriesByContinent('americas');
      expect(countries.length).toBeGreaterThan(0);
      
      const usa = countries.find(c => c.code === 'US');
      expect(usa).toBeDefined();
      expect(usa!.name.en).toBe('United States');
    });

    it('should return countries for Asia', () => {
      const countries = CountryRegistry.getCountriesByContinent('asia');
      expect(countries.length).toBeGreaterThan(0);
      
      const japan = countries.find(c => c.code === 'JP');
      expect(japan).toBeDefined();
      expect(japan!.name.local).toBe('日本');
    });

    it('should return countries for Europe', () => {
      const countries = CountryRegistry.getCountriesByContinent('europe');
      expect(countries.length).toBeGreaterThan(0);
      
      const germany = countries.find(c => c.code === 'DE');
      expect(germany).toBeDefined();
    });

    it('should return countries for Oceania', () => {
      const countries = CountryRegistry.getCountriesByContinent('oceania');
      expect(countries.length).toBeGreaterThan(0);
      
      const australia = countries.find(c => c.code === 'AU');
      expect(australia).toBeDefined();
    });

    it('should return countries sorted by name', () => {
      const countries = CountryRegistry.getCountriesByContinent('asia');
      
      for (let i = 1; i < countries.length; i++) {
        const prev = countries[i - 1].name.en;
        const curr = countries[i].name.en;
        expect(prev.localeCompare(curr)).toBeLessThanOrEqual(0);
      }
    });

    it('should return empty array for Antarctica', () => {
      const countries = CountryRegistry.getCountriesByContinent('antarctica');
      expect(Array.isArray(countries)).toBe(true);
      expect(countries.length).toBe(0);
    });
  });

  describe('getCountry', () => {
    it('should get country by code', () => {
      const japan = CountryRegistry.getCountry('JP');
      expect(japan).toBeDefined();
      expect(japan!.code).toBe('JP');
      expect(japan!.name.en).toBe('Japan');
    });

    it('should handle lowercase codes', () => {
      const usa = CountryRegistry.getCountry('us');
      expect(usa).toBeDefined();
      expect(usa!.code).toBe('US');
    });

    it('should return undefined for invalid code', () => {
      const invalid = CountryRegistry.getCountry('XX');
      expect(invalid).toBeUndefined();
    });

    it('should get multiple countries', () => {
      const countries = ['US', 'JP', 'GB', 'FR', 'DE'];
      
      for (const code of countries) {
        const country = CountryRegistry.getCountry(code);
        expect(country).toBeDefined();
        expect(country!.code).toBe(code);
      }
    });
  });

  describe('searchCountries', () => {
    it('should search by English name', () => {
      const results = CountryRegistry.searchCountries('Japan');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].code).toBe('JP');
    });

    it('should search case-insensitively', () => {
      const lower = CountryRegistry.searchCountries('japan');
      const upper = CountryRegistry.searchCountries('JAPAN');
      const mixed = CountryRegistry.searchCountries('JaPaN');
      
      expect(lower.length).toBeGreaterThan(0);
      expect(upper.length).toBeGreaterThan(0);
      expect(mixed.length).toBeGreaterThan(0);
    });

    it('should search by partial name', () => {
      const results = CountryRegistry.searchCountries('united');
      expect(results.length).toBeGreaterThan(0);
      
      const codes = results.map(c => c.code);
      expect(codes).toContain('US'); // United States
      expect(codes).toContain('GB'); // United Kingdom
      expect(codes).toContain('AE'); // United Arab Emirates
    });

    it('should search by local name', () => {
      const results = CountryRegistry.searchCountries('日本', 'local');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].code).toBe('JP');
    });

    it('should return empty array for no matches', () => {
      const results = CountryRegistry.searchCountries('NonexistentCountry');
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it('should return results sorted alphabetically', () => {
      const results = CountryRegistry.searchCountries('a');
      
      for (let i = 1; i < results.length; i++) {
        const prev = results[i - 1].name.en;
        const curr = results[i].name.en;
        expect(prev.localeCompare(curr)).toBeLessThanOrEqual(0);
      }
    });
  });

  describe('getContinentInfo', () => {
    it('should get continent info for Asia', () => {
      const asia = CountryRegistry.getContinentInfo('asia');
      expect(asia).toBeDefined();
      expect(asia.code).toBe('asia');
      expect(asia.name.en).toBe('Asia');
      expect(asia.name.ja).toBe('アジア');
      expect(asia.name.zh).toBe('亚洲');
      expect(asia.name.ko).toBe('아시아');
      expect(Array.isArray(asia.countries)).toBe(true);
      expect(asia.countries.length).toBeGreaterThan(0);
    });

    it('should get continent info for all continents', () => {
      const continents: Continent[] = ['africa', 'americas', 'asia', 'europe', 'oceania', 'antarctica'];
      
      for (const continent of continents) {
        const info = CountryRegistry.getContinentInfo(continent);
        expect(info).toBeDefined();
        expect(info.code).toBe(continent);
        expect(info.name.en).toBeDefined();
        expect(Array.isArray(info.countries)).toBe(true);
      }
    });

    it('should include correct countries in continent', () => {
      const asia = CountryRegistry.getContinentInfo('asia');
      expect(asia.countries).toContain('JP');
      expect(asia.countries).toContain('CN');
      expect(asia.countries).toContain('KR');
      expect(asia.countries).toContain('IN');
    });
  });

  describe('getAllContinents', () => {
    it('should return all continent info', () => {
      const continents = CountryRegistry.getAllContinents();
      expect(Array.isArray(continents)).toBe(true);
      expect(continents.length).toBe(6);
      
      const codes = continents.map(c => c.code);
      expect(codes).toContain('africa');
      expect(codes).toContain('americas');
      expect(codes).toContain('asia');
      expect(codes).toContain('europe');
      expect(codes).toContain('oceania');
      expect(codes).toContain('antarctica');
    });

    it('should have multi-language names', () => {
      const continents = CountryRegistry.getAllContinents();
      
      for (const continent of continents) {
        expect(continent.name.en).toBeDefined();
        expect(continent.name.ja).toBeDefined();
        expect(continent.name.zh).toBeDefined();
        expect(continent.name.ko).toBeDefined();
      }
    });
  });

  describe('toCountryOption', () => {
    it('should convert metadata to CountryOption', () => {
      const japan = CountryRegistry.getCountry('JP')!;
      const option = CountryRegistry.toCountryOption(japan);
      
      expect(option.code).toBe('JP');
      expect(option.name).toBe('Japan');
      expect(option.nameLocal).toBe('日本');
      expect(option.flag).toBeDefined();
      expect(option.continent).toBe('asia');
      expect(option.subregion).toBeDefined();
    });

    it('should handle countries without local name', () => {
      const usa = CountryRegistry.getCountry('US')!;
      const option = CountryRegistry.toCountryOption(usa);
      
      expect(option.code).toBe('US');
      expect(option.name).toBe('United States');
    });
  });

  describe('getPopularCountries', () => {
    it('should return popular countries', () => {
      const popular = CountryRegistry.getPopularCountries();
      expect(Array.isArray(popular)).toBe(true);
      expect(popular.length).toBeGreaterThan(0);
      
      const codes = popular.map(c => c.code);
      expect(codes).toContain('US');
      expect(codes).toContain('JP');
      expect(codes).toContain('GB');
      expect(codes).toContain('DE');
      expect(codes).toContain('FR');
    });

    it('should return valid country metadata', () => {
      const popular = CountryRegistry.getPopularCountries();
      
      for (const country of popular) {
        expect(country.code).toBeDefined();
        expect(country.name.en).toBeDefined();
        expect(country.continent).toBeDefined();
      }
    });
  });

  describe('getRecommendedSet', () => {
    it('should get East Asia set', () => {
      const eastAsia = CountryRegistry.getRecommendedSet('east_asia');
      expect(Array.isArray(eastAsia)).toBe(true);
      expect(eastAsia.length).toBeGreaterThan(0);
      
      const codes = eastAsia.map(c => c.code);
      expect(codes).toContain('JP');
      expect(codes).toContain('CN');
      expect(codes).toContain('KR');
    });

    it('should get North America set', () => {
      const northAmerica = CountryRegistry.getRecommendedSet('north_america');
      expect(northAmerica.length).toBeGreaterThan(0);
      
      const codes = northAmerica.map(c => c.code);
      expect(codes).toContain('US');
      expect(codes).toContain('CA');
      expect(codes).toContain('MX');
    });

    it('should get Europe set', () => {
      const europe = CountryRegistry.getRecommendedSet('europe');
      expect(europe.length).toBeGreaterThan(0);
      
      const codes = europe.map(c => c.code);
      expect(codes).toContain('GB');
      expect(codes).toContain('DE');
      expect(codes).toContain('FR');
    });

    it('should get Southeast Asia set', () => {
      const southeastAsia = CountryRegistry.getRecommendedSet('southeast_asia');
      expect(southeastAsia.length).toBeGreaterThan(0);
      
      const codes = southeastAsia.map(c => c.code);
      expect(codes).toContain('SG');
      expect(codes).toContain('TH');
    });

    it('should get all countries set', () => {
      const all = CountryRegistry.getRecommendedSet('all');
      const allCountries = CountryRegistry.getAllCountries();
      
      expect(all.length).toBe(allCountries.length);
    });

    it('should return valid country metadata for each set', () => {
      const sets = ['east_asia', 'north_america', 'europe', 'southeast_asia'] as const;
      
      for (const setName of sets) {
        const countries = CountryRegistry.getRecommendedSet(setName);
        
        for (const country of countries) {
          expect(country.code).toBeDefined();
          expect(country.name.en).toBeDefined();
          expect(country.continent).toBeDefined();
        }
      }
    });
  });

  describe('country flag generation', () => {
    it('should generate correct flags', () => {
      const japan = CountryRegistry.getCountry('JP');
      expect(japan!.flag).toBe('🇯🇵');
      
      const usa = CountryRegistry.getCountry('US');
      expect(usa!.flag).toBe('🇺🇸');
      
      const gb = CountryRegistry.getCountry('GB');
      expect(gb!.flag).toBe('🇬🇧');
    });
  });

  describe('data path generation', () => {
    it('should generate correct data paths', () => {
      const japan = CountryRegistry.getCountry('JP');
      expect(japan!.dataPath).toMatch(/\/data\/asia\/.*\/JP\/JP\.yaml$/);
      
      const usa = CountryRegistry.getCountry('US');
      expect(usa!.dataPath).toMatch(/\/data\/americas\/.*\/US\/US\.yaml$/);
    });
  });
});
