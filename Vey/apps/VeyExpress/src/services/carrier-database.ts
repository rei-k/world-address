/**
 * Carrier Database Service
 * Provides utilities to load, query, and interact with the worldwide carriers database
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  WorldwideCarriersDatabase,
  CarrierData,
  CarrierQuery,
  CarrierRegion,
  CarrierService,
  ServiceType,
} from '../types/carrier-data';
import { CarrierType } from '../types';

/**
 * Load the worldwide carriers database
 * @param format - 'json' or 'yaml' (default: 'json')
 * @returns Worldwide carriers database
 */
export function loadCarriersDatabase(format: 'json' | 'yaml' = 'json'): WorldwideCarriersDatabase {
  const dataDir = path.join(__dirname, '../../data/carriers');
  const filePath = path.join(dataDir, `worldwide-carriers.${format}`);

  try {
    if (format === 'json') {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as WorldwideCarriersDatabase;
    } else {
      // For YAML, you would need to use a YAML parser
      // const yaml = require('js-yaml');
      // const content = fs.readFileSync(filePath, 'utf-8');
      // return yaml.load(content) as WorldwideCarriersDatabase;
      throw new Error('YAML loading not implemented. Please use JSON format.');
    }
  } catch (error) {
    throw new Error(
      `Failed to load carriers database: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Query carriers based on filters
 * @param query - Query parameters
 * @param database - Optional database instance (loads if not provided)
 * @returns Array of matching carriers
 */
export function queryCarriers(
  query: CarrierQuery,
  database?: WorldwideCarriersDatabase,
): CarrierData[] {
  const db = database || loadCarriersDatabase();
  let results = db.carriers;

  // Filter by country
  if (query.country) {
    results = results.filter((c) => c.country === query.country);
  }

  // Filter by region
  if (query.region) {
    results = results.filter((c) => c.region === query.region);
  }

  // Filter by type
  if (query.type) {
    results = results.filter((c) => c.type === query.type);
  }

  // Filter by international capability
  if (query.international !== undefined) {
    results = results.filter((c) => c.coverage.international === query.international);
  }

  // Filter by API availability
  if (query.api_available !== undefined) {
    results = results.filter((c) => c.api_available === query.api_available);
  }

  // Filter by capabilities
  if (query.capabilities) {
    results = results.filter((carrier) => {
      const caps = carrier.capabilities;
      return Object.entries(query.capabilities!).every(([key, value]) => {
        return caps[key as keyof typeof caps] === value;
      });
    });
  }

  return results;
}

/**
 * Get carrier by ID
 * @param carrierId - Carrier ID
 * @param database - Optional database instance
 * @returns Carrier data or undefined
 */
export function getCarrierById(
  carrierId: string,
  database?: WorldwideCarriersDatabase,
): CarrierData | undefined {
  const db = database || loadCarriersDatabase();
  return db.carriers.find((c) => c.id === carrierId);
}

/**
 * Get carrier by code
 * @param carrierCode - Carrier code
 * @param database - Optional database instance
 * @returns Carrier data or undefined
 */
export function getCarrierByCode(
  carrierCode: string,
  database?: WorldwideCarriersDatabase,
): CarrierData | undefined {
  const db = database || loadCarriersDatabase();
  return db.carriers.find((c) => c.code === carrierCode);
}

/**
 * Get all carriers for a specific country
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @param database - Optional database instance
 * @returns Array of carriers
 */
export function getCarriersByCountry(
  countryCode: string,
  database?: WorldwideCarriersDatabase,
): CarrierData[] {
  return queryCarriers({ country: countryCode }, database);
}

/**
 * Get all carriers for a specific region
 * @param region - Geographic region
 * @param database - Optional database instance
 * @returns Array of carriers
 */
export function getCarriersByRegion(
  region: CarrierRegion,
  database?: WorldwideCarriersDatabase,
): CarrierData[] {
  return queryCarriers({ region }, database);
}

/**
 * Get carriers that support international shipping
 * @param database - Optional database instance
 * @returns Array of carriers
 */
export function getInternationalCarriers(
  database?: WorldwideCarriersDatabase,
): CarrierData[] {
  return queryCarriers({ international: true }, database);
}

/**
 * Get carriers with API support
 * @param database - Optional database instance
 * @returns Array of carriers
 */
export function getAPICarriers(database?: WorldwideCarriersDatabase): CarrierData[] {
  return queryCarriers({ api_available: true }, database);
}

/**
 * Get carriers by type
 * @param type - Carrier type
 * @param database - Optional database instance
 * @returns Array of carriers
 */
export function getCarriersByType(
  type: CarrierType | 'instant',
  database?: WorldwideCarriersDatabase,
): CarrierData[] {
  return queryCarriers({ type }, database);
}

/**
 * Find carriers that can ship between two countries
 * @param originCountry - Origin country code
 * @param destinationCountry - Destination country code
 * @param database - Optional database instance
 * @returns Array of carriers
 */
export function findCarriersForRoute(
  originCountry: string,
  destinationCountry: string,
  database?: WorldwideCarriersDatabase,
): CarrierData[] {
  const db = database || loadCarriersDatabase();

  // If same country, return domestic carriers
  if (originCountry === destinationCountry) {
    return db.carriers.filter(
      (c) => c.country === originCountry && c.coverage.domestic === true,
    );
  }

  // For international, get carriers that:
  // 1. Operate in origin country OR are global
  // 2. Support international shipping
  return db.carriers.filter((c) => {
    const operatesInOrigin = c.country === originCountry || c.coverage.international === true;
    const supportsInternational = c.coverage.international === true;
    return operatesInOrigin && supportsInternational;
  });
}

/**
 * Get carrier statistics
 * @param database - Optional database instance
 * @returns Statistics object
 */
export function getCarrierStatistics(database?: WorldwideCarriersDatabase) {
  const db = database || loadCarriersDatabase();

  const stats = {
    total_carriers: db.total_carriers,
    by_region: {} as Record<CarrierRegion, number>,
    by_type: {} as Record<string, number>,
    with_api: 0,
    international: 0,
    with_tracking: 0,
    with_lockers: 0,
  };

  // Count by region
  db.regions.forEach((region) => {
    stats.by_region[region] = db.carriers.filter((c) => c.region === region).length;
  });

  // Count by type
  db.carriers.forEach((carrier) => {
    stats.by_type[carrier.type] = (stats.by_type[carrier.type] || 0) + 1;
  });

  // Count capabilities
  stats.with_api = db.carriers.filter((c) => c.api_available).length;
  stats.international = db.carriers.filter((c) => c.coverage.international).length;
  stats.with_tracking = db.carriers.filter((c) => c.capabilities.tracking).length;
  stats.with_lockers = db.carriers.filter((c) => c.capabilities.lockers).length;

  return stats;
}

/**
 * Search carriers by name (fuzzy search)
 * @param searchTerm - Search term
 * @param database - Optional database instance
 * @returns Array of matching carriers
 */
export function searchCarriersByName(
  searchTerm: string,
  database?: WorldwideCarriersDatabase,
): CarrierData[] {
  const db = database || loadCarriersDatabase();
  const term = searchTerm.toLowerCase();

  return db.carriers.filter((carrier) => {
    const enName = carrier.name.en.toLowerCase();
    const localName = carrier.name.local.toLowerCase();
    return enName.includes(term) || localName.includes(term);
  });
}

/**
 * Get services for a carrier
 * @param carrierCode - Carrier code
 * @param serviceType - Optional service type filter
 * @param database - Optional database instance
 * @returns Array of services
 */
export function getCarrierServices(
  carrierCode: string,
  serviceType?: ServiceType,
  database?: WorldwideCarriersDatabase,
): CarrierService[] {
  const carrier = getCarrierByCode(carrierCode, database);
  if (!carrier) {
    return [];
  }

  if (serviceType) {
    return carrier.services.filter((s) => s.type === serviceType);
  }

  return carrier.services;
}

/**
 * Export all carrier utilities
 */
export default {
  loadCarriersDatabase,
  queryCarriers,
  getCarrierById,
  getCarrierByCode,
  getCarriersByCountry,
  getCarriersByRegion,
  getInternationalCarriers,
  getAPICarriers,
  getCarriersByType,
  findCarriersForRoute,
  getCarrierStatistics,
  searchCarriersByName,
  getCarrierServices,
};
