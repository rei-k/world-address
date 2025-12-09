/**
 * Carrier Database Usage Examples
 * Demonstrates how to use the worldwide carriers database
 */

import {
  loadCarriersDatabase,
  queryCarriers,
  getCarrierById,
  getCarrierByCode,
  getCarriersByCountry,
  getInternationalCarriers,
  findCarriersForRoute,
  getCarrierStatistics,
  searchCarriersByName,
} from '../services/carrier-database';

// ============================================================================
// Example 1: Load the entire database
// ============================================================================

console.log('=== Example 1: Load Carriers Database ===');
const database = loadCarriersDatabase();
console.log(`Total carriers: ${database.total_carriers}`);
console.log(`Regions: ${database.regions.join(', ')}`);
console.log(`Version: ${database.version}`);

// ============================================================================
// Example 2: Get carrier by code
// ============================================================================

console.log('\n=== Example 2: Get Carrier by Code ===');
const yamato = getCarrierByCode('yamato');
if (yamato) {
  console.log(`Carrier: ${yamato.name.en} (${yamato.name.local})`);
  console.log(`Country: ${yamato.country}`);
  console.log(`Type: ${yamato.type}`);
  console.log(`Website: ${yamato.website}`);
  console.log(`Services: ${yamato.services.map((s) => s.name).join(', ')}`);
  console.log(`API Available: ${yamato.api_available}`);
}

// ============================================================================
// Example 3: Get all carriers for a country
// ============================================================================

console.log('\n=== Example 3: Get Carriers by Country ===');
const jpCarriers = getCarriersByCountry('JP');
console.log(`Japanese carriers (${jpCarriers.length}):`);
jpCarriers.forEach((carrier) => {
  console.log(`  - ${carrier.name.en} (${carrier.code})`);
});

// ============================================================================
// Example 4: Get international carriers
// ============================================================================

console.log('\n=== Example 4: International Carriers ===');
const internationalCarriers = getInternationalCarriers();
console.log(`Carriers with international shipping: ${internationalCarriers.length}`);
console.log('Sample carriers:');
internationalCarriers.slice(0, 5).forEach((carrier) => {
  console.log(`  - ${carrier.name.en} (${carrier.country})`);
});

// ============================================================================
// Example 5: Find carriers for a specific route
// ============================================================================

console.log('\n=== Example 5: Find Carriers for Route ===');
const usToJpCarriers = findCarriersForRoute('US', 'JP');
console.log(`Carriers that can ship from US to JP: ${usToJpCarriers.length}`);
usToJpCarriers.slice(0, 5).forEach((carrier) => {
  console.log(`  - ${carrier.name.en} (${carrier.code})`);
});

// ============================================================================
// Example 6: Query carriers with filters
// ============================================================================

console.log('\n=== Example 6: Query Carriers with Filters ===');

// Find express carriers in Asia with API support
const asianExpressWithAPI = queryCarriers({
  region: 'asia',
  type: 'express',
  api_available: true,
});
console.log(`Asian express carriers with API (${asianExpressWithAPI.length}):`);
asianExpressWithAPI.slice(0, 5).forEach((carrier) => {
  console.log(`  - ${carrier.name.en} (${carrier.country})`);
});

// Find carriers with locker support
const carriersWithLockers = queryCarriers({
  capabilities: {
    lockers: true,
  },
});
console.log(`\nCarriers with locker support: ${carriersWithLockers.length}`);
carriersWithLockers.slice(0, 5).forEach((carrier) => {
  console.log(`  - ${carrier.name.en} (${carrier.code})`);
});

// ============================================================================
// Example 7: Search carriers by name
// ============================================================================

console.log('\n=== Example 7: Search Carriers by Name ===');
const postCarriers = searchCarriersByName('post');
console.log(`Carriers with 'post' in name: ${postCarriers.length}`);
postCarriers.slice(0, 5).forEach((carrier) => {
  console.log(`  - ${carrier.name.en} (${carrier.country})`);
});

// ============================================================================
// Example 8: Get carrier statistics
// ============================================================================

console.log('\n=== Example 8: Carrier Statistics ===');
const stats = getCarrierStatistics();
console.log('Database statistics:');
console.log(`  Total carriers: ${stats.total_carriers}`);
console.log(`  Carriers with API: ${stats.with_api}`);
console.log(`  International carriers: ${stats.international}`);
console.log(`  Carriers with tracking: ${stats.with_tracking}`);
console.log(`  Carriers with lockers: ${stats.with_lockers}`);
console.log('\nBy region:');
Object.entries(stats.by_region).forEach(([region, count]) => {
  console.log(`  ${region}: ${count}`);
});
console.log('\nBy type:');
Object.entries(stats.by_type).forEach(([type, count]) => {
  console.log(`  ${type}: ${count}`);
});

// ============================================================================
// Example 9: Get specific carrier services
// ============================================================================

console.log('\n=== Example 9: Carrier Services ===');
const fedex = getCarrierByCode('fedex');
if (fedex) {
  console.log(`FedEx Services (${fedex.services.length}):`);
  fedex.services.forEach((service) => {
    const deliveryInfo = service.delivery_days
      ? `${service.delivery_days} days`
      : service.delivery_hours
        ? `${service.delivery_hours} hours`
        : 'N/A';
    console.log(`  - ${service.name} (${service.type}): ${deliveryInfo}`);
    if (service.countries_covered) {
      console.log(`    Coverage: ${service.countries_covered} countries`);
    }
  });
}

// ============================================================================
// Example 10: Compare carriers for specific capabilities
// ============================================================================

console.log('\n=== Example 10: Carriers with Advanced Capabilities ===');

// Carriers with cold chain support
const coldChainCarriers = queryCarriers({
  capabilities: {
    cold_chain: true,
  } as any,
});
console.log(`Carriers with cold chain support: ${coldChainCarriers.length}`);

// Carriers with dangerous goods support
const dangerousGoodsCarriers = queryCarriers({
  capabilities: {
    dangerous_goods: true,
  } as any,
});
console.log(`Carriers with dangerous goods support: ${dangerousGoodsCarriers.length}`);

// Carriers with customs clearance
const customsCarriers = queryCarriers({
  capabilities: {
    customs_clearance: true,
  } as any,
});
console.log(`Carriers with customs clearance: ${customsCarriers.length}`);

// ============================================================================
// Example 11: Get carrier by ID
// ============================================================================

console.log('\n=== Example 11: Get Carrier by ID ===');
const dhl = getCarrierById('dhl_express');
if (dhl) {
  console.log(`Carrier: ${dhl.name.en}`);
  console.log(`Founded: ${dhl.founded}`);
  console.log(`Type: ${dhl.type}`);
  console.log(`International coverage: ${dhl.coverage.international}`);
}

// ============================================================================
// Example 12: Practical use case - E-commerce integration
// ============================================================================

console.log('\n=== Example 12: E-commerce Integration Scenario ===');

interface ShipmentRequest {
  origin: string;
  destination: string;
  weight_kg: number;
  requiresTracking: boolean;
  requiresInsurance: boolean;
}

function findSuitableCarriers(request: ShipmentRequest) {
  // Find carriers that can handle the route
  const routeCarriers = findCarriersForRoute(request.origin, request.destination);

  // Filter by requirements
  const suitableCarriers = routeCarriers.filter((carrier) => {
    const caps = carrier.capabilities;

    // Check tracking requirement
    if (request.requiresTracking && !caps.tracking) {
      return false;
    }

    // Check insurance requirement
    if (request.requiresInsurance && !caps.insurance) {
      return false;
    }

    return true;
  });

  return suitableCarriers;
}

const shipmentRequest: ShipmentRequest = {
  origin: 'US',
  destination: 'JP',
  weight_kg: 2.5,
  requiresTracking: true,
  requiresInsurance: true,
};

const suitable = findSuitableCarriers(shipmentRequest);
console.log(`\nShipment from ${shipmentRequest.origin} to ${shipmentRequest.destination}:`);
console.log(`  Weight: ${shipmentRequest.weight_kg}kg`);
console.log(`  Requires tracking: ${shipmentRequest.requiresTracking}`);
console.log(`  Requires insurance: ${shipmentRequest.requiresInsurance}`);
console.log(`\nSuitable carriers (${suitable.length}):`);
suitable.slice(0, 5).forEach((carrier) => {
  console.log(`  - ${carrier.name.en} (${carrier.code})`);
  console.log(`    Type: ${carrier.type}`);
  console.log(`    API available: ${carrier.api_available}`);
});

console.log('\n=== Examples Complete ===');
