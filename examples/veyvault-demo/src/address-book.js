#!/usr/bin/env node

/**
 * Veyvault Demo - Address Book Management
 * 
 * Demonstrates core address book features:
 * - Add/edit/delete addresses
 * - Generate Address PIDs
 * - Normalize addresses
 * - Display address book
 */

import {
  encodePID,
  decodePID,
  getCountryInfo,
  normalizeAddress,
} from '@vey/core';

// Simple in-memory address book
class AddressBook {
  constructor() {
    this.addresses = new Map();
    this.nextId = 1;
  }

  /**
   * Add an address to the address book
   */
  addAddress(address, label = 'Home') {
    const id = `addr_${this.nextId++}`;
    
    // Normalize the address
    const normalized = normalizeAddress(address, address.country);
    
    // Generate PID
    const pidComponents = {
      country: address.country,
      admin1: address.admin1 || address.province,
      admin2: address.admin2 || address.city,
    };
    const pid = encodePID(pidComponents);
    
    // Store address entry
    const entry = {
      id,
      label,
      address: normalized,
      pid,
      country: address.country,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.addresses.set(id, entry);
    return entry;
  }

  /**
   * Get address by ID
   */
  getAddress(id) {
    return this.addresses.get(id);
  }

  /**
   * Update address label
   */
  updateLabel(id, newLabel) {
    const entry = this.addresses.get(id);
    if (entry) {
      entry.label = newLabel;
      entry.updatedAt = new Date().toISOString();
      return entry;
    }
    return null;
  }

  /**
   * Delete address
   */
  deleteAddress(id) {
    return this.addresses.delete(id);
  }

  /**
   * List all addresses
   */
  listAddresses() {
    return Array.from(this.addresses.values());
  }

  /**
   * Get addresses by country
   */
  getAddressesByCountry(countryCode) {
    return this.listAddresses().filter(entry => entry.country === countryCode);
  }

  /**
   * Display address book in a formatted way
   */
  display() {
    const addresses = this.listAddresses();
    
    if (addresses.length === 0) {
      console.log('📭 Address book is empty');
      return;
    }

    console.log(`\n📒 Address Book (${addresses.length} address${addresses.length !== 1 ? 'es' : ''})`);
    console.log('═'.repeat(60));
    
    addresses.forEach((entry, index) => {
      console.log(`\n${index + 1}. ${entry.label} [${entry.id}]`);
      console.log('─'.repeat(60));
      
      const country = getCountryInfo(entry.country);
      if (country) {
        console.log(`   Country: ${country.flag} ${country.name.en}`);
      }
      
      console.log(`   PID: ${entry.pid}`);
      
      // Display normalized address
      const addr = entry.address;
      if (addr.postal_code) console.log(`   Postal Code: ${addr.postal_code}`);
      if (addr.province) console.log(`   Province/State: ${addr.province}`);
      if (addr.city) console.log(`   City: ${addr.city}`);
      if (addr.street_address) console.log(`   Street: ${addr.street_address}`);
      
      console.log(`   Created: ${new Date(entry.createdAt).toLocaleString()}`);
    });
    
    console.log('\n' + '═'.repeat(60));
  }
}

// ============================================================================
// Demo Script
// ============================================================================

console.log('🌍 Veyvault Demo - Address Book Management\n');
console.log('='.repeat(60));

// Create address book
const addressBook = new AddressBook();

console.log('\n📝 Adding addresses to address book...\n');

// Add Japanese home address
const homeJP = addressBook.addAddress({
  country: 'JP',
  postal_code: '100-0001',
  province: '東京都',
  admin1: '13',
  city: '千代田区',
  admin2: '101',
  street_address: '千代田1-1'
}, 'Home (Tokyo)');

console.log('✅ Added:', homeJP.label);
console.log('   PID:', homeJP.pid);

// Add US work address
const workUS = addressBook.addAddress({
  country: 'US',
  postal_code: '20500',
  province: 'DC',
  admin1: 'DC',
  city: 'Washington',
  admin2: 'DC',
  street_address: '1600 Pennsylvania Avenue NW'
}, 'Work (Washington DC)');

console.log('✅ Added:', workUS.label);
console.log('   PID:', workUS.pid);

// Add parent's address in Japan
const parentJP = addressBook.addAddress({
  country: 'JP',
  postal_code: '150-0001',
  province: '東京都',
  admin1: '13',
  city: '渋谷区',
  admin2: '113',
  street_address: '神宮前1-1-1'
}, "Parent's House");

console.log('✅ Added:', parentJP.label);
console.log('   PID:', parentJP.pid);

// Display address book
addressBook.display();

// Demonstrate filtering
console.log('\n\n🔍 Filtering by Country\n');
console.log('Japanese addresses only:');
const jpAddresses = addressBook.getAddressesByCountry('JP');
jpAddresses.forEach(entry => {
  console.log(`  - ${entry.label}: ${entry.pid}`);
});

// Demonstrate update
console.log('\n\n✏️  Updating address label...\n');
addressBook.updateLabel(homeJP.id, 'Primary Residence (Tokyo)');
console.log('✅ Updated label:', addressBook.getAddress(homeJP.id).label);

// Demonstrate PID decoding
console.log('\n\n🔓 Decoding PID for privacy verification\n');
const decoded = decodePID(homeJP.pid);
console.log('PID:', homeJP.pid);
console.log('Decoded components:');
console.log('  Country:', decoded.country);
console.log('  Admin1 (Prefecture):', decoded.admin1);
console.log('  Admin2 (City/Ward):', decoded.admin2);
console.log('\n💡 Note: E-commerce sites can verify delivery capability');
console.log('    without ever seeing your full address!');

// Demonstrate deletion
console.log('\n\n🗑️  Deleting an address...\n');
console.log('Deleting:', workUS.label);
addressBook.deleteAddress(workUS.id);
console.log('✅ Address deleted');

// Display final state
addressBook.display();

// Statistics
console.log('\n\n📊 Address Book Statistics\n');
console.log('Total addresses:', addressBook.listAddresses().length);
console.log('Countries:', new Set(addressBook.listAddresses().map(e => e.country)).size);
console.log('Labels:', addressBook.listAddresses().map(e => e.label).join(', '));

console.log('\n\n' + '='.repeat(60));
console.log('✅ Address Book Demo completed!');
console.log('='.repeat(60));
console.log('\nKey Features Demonstrated:');
console.log('  ✓ Add multiple addresses with labels');
console.log('  ✓ Generate privacy-preserving PIDs');
console.log('  ✓ Normalize addresses by country');
console.log('  ✓ Filter addresses by country');
console.log('  ✓ Update address labels');
console.log('  ✓ Delete addresses');
console.log('  ✓ Display formatted address book');
console.log('\nNext Steps:');
console.log('  → Check Veyvault full spec: ../../Vey/apps/Veyvault/README.md');
console.log('  → See ZKP protocol guide: ../../docs/zkp-protocol.md\n');
