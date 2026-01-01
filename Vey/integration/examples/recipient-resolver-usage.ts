/**
 * Recipient Resolver Usage Example
 * 
 * Demonstrates how to use the RecipientResolver module to handle
 * delivery recipient determination (email-like functionality).
 */

import {
  RecipientResolver,
  createRecipientResolver,
  createDefaultAcceptancePolicy,
  createPermissiveAcceptancePolicy,
  createStrictAcceptancePolicy,
  createDefaultAddressSelectionRules,
  mergeAcceptancePolicies,
  type DeliveryAcceptancePolicy,
  type AddressSelectionRule,
  type DeliveryRequestInfo,
} from '../src/recipient-resolver';

import { parseConveyID } from '../src/convey-protocol';
import type { AddressRegistration } from '../src/zkp-integration';

// ============================================================================
// Example 1: Validate Recipient ConveyID
// ============================================================================

function example1_validateRecipient() {
  console.log('\n=== Example 1: Validate Recipient ConveyID ===\n');
  
  const resolver = createRecipientResolver();
  
  // Valid ConveyIDs
  const validIds = [
    'alice@convey',
    'shop@convey.store',
    'john.doe@convey.work',
    'warehouse.tokyo@jp.convey',
  ];
  
  console.log('Valid ConveyIDs:');
  validIds.forEach(id => {
    const result = resolver.validateRecipient(id);
    console.log(`  ${id}: ${result.valid ? '✓' : '✗'}`);
    if (result.conveyId) {
      console.log(`    → Local: ${result.conveyId.localPart}, Namespace: ${result.conveyId.namespace}`);
    }
  });
  
  // Invalid ConveyIDs
  const invalidIds = [
    'invalid',
    'no-at-sign',
    '@convey',
    'user@',
    'system@convey', // reserved
  ];
  
  console.log('\nInvalid ConveyIDs:');
  invalidIds.forEach(id => {
    const result = resolver.validateRecipient(id);
    console.log(`  ${id}: ${result.valid ? '✓' : '✗'}`);
    if (result.error) {
      console.log(`    → Error: ${result.error}`);
    }
  });
}

// ============================================================================
// Example 2: Check Delivery Acceptance Policy
// ============================================================================

function example2_checkAcceptancePolicy() {
  console.log('\n=== Example 2: Check Delivery Acceptance Policy ===\n');
  
  const resolver = createRecipientResolver();
  
  // Create a delivery request
  const request: DeliveryRequestInfo = {
    from: parseConveyID('bob@convey'),
    to: parseConveyID('alice@convey'),
    package: {
      weight: 5.5,
      value: 10000,
      currency: 'JPY',
    },
    requestedAt: new Date().toISOString(),
  };
  
  // Test with different policies
  
  // 1. Default policy (requires manual approval)
  console.log('1. Default Policy (Manual Approval):');
  const defaultPolicy = createDefaultAcceptancePolicy();
  const result1 = resolver.shouldAcceptDelivery(request, defaultPolicy);
  console.log(`   Accepted: ${result1.accepted}`);
  console.log(`   Reason: ${result1.reason}`);
  console.log(`   Requires Manual: ${result1.requiresManualApproval}`);
  
  // 2. Permissive policy (auto-accept from verified)
  console.log('\n2. Permissive Policy:');
  const permissivePolicy = createPermissiveAcceptancePolicy();
  resolver.addVerifiedSender('bob@convey');
  const result2 = resolver.shouldAcceptDelivery(request, permissivePolicy);
  console.log(`   Accepted: ${result2.accepted}`);
  console.log(`   Reason: ${result2.reason}`);
  console.log(`   Auto-accepted: ${result2.autoAccepted}`);
  
  // 3. Strict policy (rejects anonymous)
  console.log('\n3. Strict Policy:');
  const strictPolicy = createStrictAcceptancePolicy();
  const anonymousRequest: DeliveryRequestInfo = {
    ...request,
    from: parseConveyID('sender@anonymous.convey'),
  };
  const result3 = resolver.shouldAcceptDelivery(anonymousRequest, strictPolicy);
  console.log(`   Accepted: ${result3.accepted}`);
  console.log(`   Reason: ${result3.reason}`);
  
  // 4. Custom policy with restrictions
  console.log('\n4. Custom Policy (Weight & Namespace Restrictions):');
  const customPolicy: DeliveryAcceptancePolicy = {
    autoAcceptFriends: true,
    autoAcceptVerified: false,
    requireManualApproval: false,
    blockedSenders: [],
    allowedNamespaces: ['convey', 'convey.store'],
    maxWeight: 10,
    maxValue: 50000,
  };
  
  const heavyRequest: DeliveryRequestInfo = {
    ...request,
    package: { weight: 15, value: 5000, currency: 'JPY' },
  };
  const result4 = resolver.shouldAcceptDelivery(heavyRequest, customPolicy);
  console.log(`   Accepted: ${result4.accepted}`);
  console.log(`   Reason: ${result4.reason}`);
}

// ============================================================================
// Example 3: Address Selection with Rules
// ============================================================================

function example3_addressSelection() {
  console.log('\n=== Example 3: Address Selection with Rules ===\n');
  
  const resolver = createRecipientResolver();
  
  // Mock addresses (normally from ZKP integration)
  const addresses: AddressRegistration[] = [
    {
      userDid: 'did:example:alice',
      pid: 'pid_home_001',
      countryCode: 'JP',
      hierarchyDepth: 4,
      fullAddress: {
        country: 'Japan',
        province: 'Tokyo',
        city: 'Shibuya',
        postalCode: '150-0001',
        street: '1-1-1 Shibuya',
        recipient: 'Alice',
      },
    },
    {
      userDid: 'did:example:alice',
      pid: 'pid_office_002',
      countryCode: 'JP',
      hierarchyDepth: 5,
      fullAddress: {
        country: 'Japan',
        province: 'Tokyo',
        city: 'Chiyoda',
        postalCode: '100-0001',
        street: '1-1-1 Marunouchi',
        building: 'Office Tower',
        recipient: 'Alice',
      },
    },
    {
      userDid: 'did:example:alice',
      pid: 'pid_locker_003',
      countryCode: 'JP',
      hierarchyDepth: 3,
      fullAddress: {
        country: 'Japan',
        province: 'Tokyo',
        city: 'Shibuya',
        postalCode: '150-0002',
        street: 'Shibuya Station Locker #123',
        recipient: 'Alice',
      },
    },
  ];
  
  // Create address selection rules
  const rules = createDefaultAddressSelectionRules();
  
  // Test 1: Weekday daytime (should select office)
  console.log('1. Weekday Daytime Delivery:');
  const weekdayRequest: DeliveryRequestInfo = {
    from: parseConveyID('shop@convey.store'),
    to: parseConveyID('alice@convey'),
    package: { weight: 2, value: 5000, currency: 'JPY' },
    requestedAt: new Date('2025-01-06T14:00:00Z').toISOString(), // Monday 2pm
  };
  const selected1 = resolver.selectDeliveryAddress(weekdayRequest, addresses, rules);
  console.log(`   Selected: ${selected1?.pid}`);
  console.log(`   Address: ${selected1?.fullAddress.city}, ${selected1?.fullAddress.street}`);
  
  // Test 2: Night time (should select locker)
  console.log('\n2. Night Time Delivery:');
  const nightRequest: DeliveryRequestInfo = {
    ...weekdayRequest,
    requestedAt: new Date('2025-01-06T23:00:00Z').toISOString(), // Monday 11pm
  };
  const selected2 = resolver.selectDeliveryAddress(nightRequest, addresses, rules);
  console.log(`   Selected: ${selected2?.pid}`);
  console.log(`   Address: ${selected2?.fullAddress.city}, ${selected2?.fullAddress.street}`);
  
  // Test 3: Weekend (should select home)
  console.log('\n3. Weekend Delivery:');
  const weekendRequest: DeliveryRequestInfo = {
    ...weekdayRequest,
    requestedAt: new Date('2025-01-04T10:00:00Z').toISOString(), // Saturday 10am
  };
  const selected3 = resolver.selectDeliveryAddress(weekendRequest, addresses, rules);
  console.log(`   Selected: ${selected3?.pid}`);
  console.log(`   Address: ${selected3?.fullAddress.city}, ${selected3?.fullAddress.street}`);
  
  // Test 4: No rules (should select first address)
  console.log('\n4. No Rules (Default Selection):');
  const selected4 = resolver.selectDeliveryAddress(weekdayRequest, addresses);
  console.log(`   Selected: ${selected4?.pid}`);
  console.log(`   Address: ${selected4?.fullAddress.city}, ${selected4?.fullAddress.street}`);
}

// ============================================================================
// Example 4: Manage Verified Senders and Friends
// ============================================================================

function example4_manageLists() {
  console.log('\n=== Example 4: Manage Verified Senders and Friends ===\n');
  
  const resolver = createRecipientResolver();
  
  // Add verified senders
  resolver.addVerifiedSender('shop1@convey.store');
  resolver.addVerifiedSender('shop2@convey.store');
  resolver.addVerifiedSender('courier@convey');
  
  console.log('Verified Senders:');
  resolver.getVerifiedSenders().forEach(sender => {
    console.log(`  - ${sender}`);
  });
  
  // Add friends
  resolver.addFriend('bob@convey');
  resolver.addFriend('charlie@convey');
  
  console.log('\nFriends:');
  resolver.getFriends().forEach(friend => {
    console.log(`  - ${friend}`);
  });
  
  // Check if senders are verified/friends
  console.log('\nChecks:');
  console.log(`  shop1@convey.store is verified: ${resolver.isVerifiedSender('shop1@convey.store')}`);
  console.log(`  bob@convey is friend: ${resolver.isFriend('bob@convey')}`);
  console.log(`  unknown@convey is verified: ${resolver.isVerifiedSender('unknown@convey')}`);
  
  // Remove a verified sender
  resolver.removeVerifiedSender('shop2@convey.store');
  console.log('\nAfter removing shop2@convey.store:');
  console.log(`  shop2@convey.store is verified: ${resolver.isVerifiedSender('shop2@convey.store')}`);
}

// ============================================================================
// Example 5: Merge Multiple Policies
// ============================================================================

function example5_mergePolicies() {
  console.log('\n=== Example 5: Merge Multiple Policies ===\n');
  
  // Personal policy
  const personalPolicy: DeliveryAcceptancePolicy = {
    autoAcceptFriends: true,
    autoAcceptVerified: true,
    requireManualApproval: false,
    blockedSenders: ['spam@convey'],
    allowedNamespaces: undefined,
  };
  
  // Company policy (more restrictive)
  const companyPolicy: DeliveryAcceptancePolicy = {
    autoAcceptFriends: false,
    autoAcceptVerified: true,
    requireManualApproval: true,
    blockedSenders: ['competitor@convey'],
    allowedNamespaces: ['convey.work', 'convey'],
    maxWeight: 20,
  };
  
  // Privacy policy
  const privacyPolicy: DeliveryAcceptancePolicy = {
    autoAcceptFriends: true,
    autoAcceptVerified: false,
    requireManualApproval: false,
    blockedSenders: [],
    rejectAnonymous: true,
  };
  
  // Merge policies (more restrictive rules take precedence)
  const mergedPolicy = mergeAcceptancePolicies(personalPolicy, companyPolicy, privacyPolicy);
  
  console.log('Merged Policy (Most Restrictive):');
  console.log(`  Auto-accept friends: ${mergedPolicy.autoAcceptFriends}`);
  console.log(`  Auto-accept verified: ${mergedPolicy.autoAcceptVerified}`);
  console.log(`  Require manual approval: ${mergedPolicy.requireManualApproval}`);
  console.log(`  Reject anonymous: ${mergedPolicy.rejectAnonymous}`);
  console.log(`  Blocked senders: ${mergedPolicy.blockedSenders.join(', ')}`);
  console.log(`  Allowed namespaces: ${mergedPolicy.allowedNamespaces?.join(', ') || 'any'}`);
  console.log(`  Max weight: ${mergedPolicy.maxWeight || 'unlimited'}`);
}

// ============================================================================
// Example 6: Custom Address Selection Rules
// ============================================================================

function example6_customRules() {
  console.log('\n=== Example 6: Custom Address Selection Rules ===\n');
  
  const resolver = createRecipientResolver();
  
  // Mock addresses
  const addresses: AddressRegistration[] = [
    {
      userDid: 'did:example:alice',
      pid: 'pid_home_001',
      countryCode: 'JP',
      hierarchyDepth: 4,
      fullAddress: { country: 'Japan', city: 'Tokyo', recipient: 'Alice', street: 'Home' },
    },
    {
      userDid: 'did:example:alice',
      pid: 'pid_office_002',
      countryCode: 'JP',
      hierarchyDepth: 5,
      fullAddress: { country: 'Japan', city: 'Tokyo', recipient: 'Alice', street: 'Office' },
    },
  ];
  
  // Custom rules for valuable packages
  const customRules: AddressSelectionRule[] = [
    {
      name: 'high_value_office',
      priority: 100,
      condition: {
        valueRange: { min: 50000 }, // Packages over 50,000 yen
        dayOfWeek: [1, 2, 3, 4, 5], // Weekdays
        timeRange: { start: '09:00', end: '18:00' },
      },
      selectAddress: 'office', // Deliver to office for signature
    },
    {
      name: 'store_deliveries_home',
      priority: 90,
      condition: {
        senderNamespace: ['convey.store'],
      },
      selectAddress: 'home',
    },
  ];
  
  // Test with high-value package on weekday
  const highValueRequest: DeliveryRequestInfo = {
    from: parseConveyID('jewelry@convey'),
    to: parseConveyID('alice@convey'),
    package: { weight: 0.5, value: 100000, currency: 'JPY' },
    requestedAt: new Date('2025-01-06T15:00:00Z').toISOString(),
  };
  
  const selected = resolver.selectDeliveryAddress(highValueRequest, addresses, customRules);
  console.log('High-value Package (Weekday 3pm):');
  console.log(`  Selected: ${selected?.pid}`);
  console.log(`  Address: ${selected?.fullAddress.street}`);
  console.log(`  Reason: High value → office for signature`);
}

// ============================================================================
// Run All Examples
// ============================================================================

function runAllExamples() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║   Recipient Resolver Usage Examples                          ║');
  console.log('║   Email-like Delivery Recipient Determination                ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  
  example1_validateRecipient();
  example2_checkAcceptancePolicy();
  example3_addressSelection();
  example4_manageLists();
  example5_mergePolicies();
  example6_customRules();
  
  console.log('\n✓ All examples completed successfully!\n');
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
}

export {
  example1_validateRecipient,
  example2_checkAcceptancePolicy,
  example3_addressSelection,
  example4_manageLists,
  example5_mergePolicies,
  example6_customRules,
  runAllExamples,
};
