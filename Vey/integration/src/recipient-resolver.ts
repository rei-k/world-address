/**
 * Recipient Resolver
 * 
 * Handles delivery recipient determination functionality similar to email addressing.
 * This module provides functionality to:
 * - Validate recipient ConveyIDs
 * - Apply delivery acceptance policies
 * - Resolve recipient addresses from address books
 * - Manage recipient preferences and rules
 * 
 * @example
 * // Validate a recipient
 * const resolver = new RecipientResolver();
 * const isValid = resolver.validateRecipient('alice@convey');
 * 
 * // Check if delivery is accepted based on policy
 * const accepted = resolver.shouldAcceptDelivery(request, policy);
 * 
 * // Select best address for delivery
 * const address = resolver.selectDeliveryAddress(request, addresses, rules);
 */

import { parseConveyID, formatConveyID, isValidConveyID, type ConveyID } from './convey-protocol';
import type { AddressRegistration } from './zkp-integration';

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Delivery acceptance policy
 * Defines rules for accepting or rejecting delivery requests
 */
export interface DeliveryAcceptancePolicy {
  /** Automatically accept from friends */
  autoAcceptFriends: boolean;
  /** Automatically accept from verified senders */
  autoAcceptVerified: boolean;
  /** Require manual approval for all */
  requireManualApproval: boolean;
  /** Blocked ConveyIDs */
  blockedSenders: string[];
  /** Allowed namespaces only */
  allowedNamespaces?: string[];
  /** Maximum package weight (kg) */
  maxWeight?: number;
  /** Maximum package value (currency units) */
  maxValue?: number;
  /** Allowed countries for international delivery */
  allowedCountries?: string[];
  /** Reject anonymous deliveries */
  rejectAnonymous?: boolean;
}

/**
 * Recipient information
 */
export interface RecipientInfo {
  /** ConveyID */
  conveyId: ConveyID;
  /** Display name */
  displayName?: string;
  /** Avatar URL */
  avatarUrl?: string;
  /** Email (optional) */
  email?: string;
  /** Phone (optional) */
  phone?: string;
}

/**
 * Address selection rule
 * Defines rules for automatically selecting delivery addresses
 */
export interface AddressSelectionRule {
  /** Rule name */
  name: string;
  /** Priority (higher = more important) */
  priority: number;
  /** Condition to check */
  condition: AddressCondition;
  /** Address label to select */
  selectAddress: string;
}

/**
 * Condition for address selection
 */
export interface AddressCondition {
  /** Day of week (0-6, 0 = Sunday) */
  dayOfWeek?: number[];
  /** Time range (HH:mm format) */
  timeRange?: { start: string; end: string };
  /** Package weight range (kg) */
  weightRange?: { min?: number; max?: number };
  /** Package value range */
  valueRange?: { min?: number; max?: number };
  /** Sender namespace */
  senderNamespace?: string[];
  /** Is international delivery */
  isInternational?: boolean;
  /** Sender country */
  senderCountry?: string[];
}

/**
 * Result of recipient validation
 */
export interface RecipientValidationResult {
  /** Is valid */
  valid: boolean;
  /** ConveyID (if valid) */
  conveyId?: ConveyID;
  /** Error message (if invalid) */
  error?: string;
  /** Warnings */
  warnings?: string[];
}

/**
 * Result of delivery acceptance check
 */
export interface DeliveryAcceptanceResult {
  /** Should accept */
  accepted: boolean;
  /** Reason for acceptance/rejection */
  reason: string;
  /** Requires manual approval */
  requiresManualApproval: boolean;
  /** Auto-selected based on policy */
  autoAccepted: boolean;
}

/**
 * Package details for delivery request
 */
export interface PackageDetails {
  weight: number;
  dimensions?: { length: number; width: number; height: number };
  value: number;
  currency: string;
  contents?: string;
  dangerous?: boolean;
}

/**
 * Delivery request information for recipient resolution
 */
export interface DeliveryRequestInfo {
  /** Sender ConveyID */
  from: ConveyID;
  /** Recipient ConveyID */
  to: ConveyID;
  /** Package details */
  package: PackageDetails;
  /** Optional message */
  message?: string;
  /** Request timestamp */
  requestedAt: string;
  /** Sender country */
  senderCountry?: string;
}

// ============================================================================
// RecipientResolver Class
// ============================================================================

/**
 * RecipientResolver
 * 
 * Main class for handling delivery recipient determination.
 * Similar to how email systems resolve recipients and apply delivery rules.
 */
export class RecipientResolver {
  private verifiedSenders: Set<string> = new Set();
  private friendList: Set<string> = new Set();

  /**
   * Validate recipient ConveyID
   * 
   * @param recipientId - ConveyID string (e.g., "alice@convey")
   * @returns Validation result with parsed ConveyID or error
   */
  validateRecipient(recipientId: string): RecipientValidationResult {
    try {
      // Validate format
      if (!isValidConveyID(recipientId)) {
        return {
          valid: false,
          error: 'Invalid ConveyID format',
        };
      }

      // Parse ConveyID
      const conveyId = parseConveyID(recipientId);

      // Check for reserved namespaces
      const reservedNamespaces = ['system', 'admin', 'root'];
      if (reservedNamespaces.includes(conveyId.localPart.toLowerCase())) {
        return {
          valid: false,
          error: 'Reserved ConveyID',
          warnings: ['This ConveyID is reserved for system use'],
        };
      }

      // Successful validation
      return {
        valid: true,
        conveyId,
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown validation error',
      };
    }
  }

  /**
   * Check if delivery should be accepted based on policy
   * 
   * @param request - Delivery request information
   * @param policy - Recipient's delivery acceptance policy
   * @returns Acceptance result with reason
   */
  shouldAcceptDelivery(
    request: DeliveryRequestInfo,
    policy: DeliveryAcceptancePolicy
  ): DeliveryAcceptanceResult {
    // Check if sender is blocked
    if (policy.blockedSenders.includes(request.from.full)) {
      return {
        accepted: false,
        reason: 'Sender is blocked',
        requiresManualApproval: false,
        autoAccepted: false,
      };
    }

    // Check namespace restrictions
    if (policy.allowedNamespaces && policy.allowedNamespaces.length > 0) {
      if (!policy.allowedNamespaces.includes(request.from.namespace)) {
        return {
          accepted: false,
          reason: 'Sender namespace not allowed',
          requiresManualApproval: false,
          autoAccepted: false,
        };
      }
    }

    // Check anonymous delivery policy
    if (policy.rejectAnonymous) {
      const anonymousNamespaces = ['anonymous.convey', 'gift.convey'];
      if (anonymousNamespaces.includes(request.from.namespace)) {
        return {
          accepted: false,
          reason: 'Anonymous deliveries not accepted',
          requiresManualApproval: false,
          autoAccepted: false,
        };
      }
    }

    // Check package weight limit
    if (policy.maxWeight && request.package.weight > policy.maxWeight) {
      return {
        accepted: false,
        reason: `Package exceeds maximum weight (${policy.maxWeight}kg)`,
        requiresManualApproval: false,
        autoAccepted: false,
      };
    }

    // Check package value limit
    if (policy.maxValue && request.package.value > policy.maxValue) {
      return {
        accepted: false,
        reason: `Package exceeds maximum value (${policy.maxValue} ${request.package.currency})`,
        requiresManualApproval: false,
        autoAccepted: false,
      };
    }

    // Check country restrictions for international delivery
    if (request.senderCountry && policy.allowedCountries) {
      if (!policy.allowedCountries.includes(request.senderCountry)) {
        return {
          accepted: false,
          reason: 'International delivery from this country not allowed',
          requiresManualApproval: false,
          autoAccepted: false,
        };
      }
    }

    // Check if manual approval is required
    if (policy.requireManualApproval) {
      return {
        accepted: false,
        reason: 'Manual approval required',
        requiresManualApproval: true,
        autoAccepted: false,
      };
    }

    // Auto-accept from friends
    if (policy.autoAcceptFriends && this.isFriend(request.from.full)) {
      return {
        accepted: true,
        reason: 'Auto-accepted from friend',
        requiresManualApproval: false,
        autoAccepted: true,
      };
    }

    // Auto-accept from verified senders
    if (policy.autoAcceptVerified && this.isVerifiedSender(request.from.full)) {
      return {
        accepted: true,
        reason: 'Auto-accepted from verified sender',
        requiresManualApproval: false,
        autoAccepted: true,
      };
    }

    // Default: requires manual approval
    return {
      accepted: false,
      reason: 'Requires recipient confirmation',
      requiresManualApproval: true,
      autoAccepted: false,
    };
  }

  /**
   * Select delivery address based on rules
   * 
   * @param request - Delivery request information
   * @param addresses - Available addresses
   * @param rules - Address selection rules
   * @returns Selected address or null
   */
  selectDeliveryAddress(
    request: DeliveryRequestInfo,
    addresses: AddressRegistration[],
    rules?: AddressSelectionRule[]
  ): AddressRegistration | null {
    if (addresses.length === 0) {
      return null;
    }

    // If no rules, return first address
    if (!rules || rules.length === 0) {
      return addresses[0];
    }

    // Sort rules by priority
    const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);

    // Check rules in priority order
    for (const rule of sortedRules) {
      if (this.matchesCondition(request, rule.condition)) {
        // Find address with matching PID or that matches the label pattern
        // Since AddressRegistration doesn't have a label field,
        // we match by index or assume labels map to addresses by order
        // In production, you would extend AddressRegistration to include a label field
        const addressIndex = this.getAddressIndexByLabel(rule.selectAddress, addresses);
        if (addressIndex >= 0 && addresses[addressIndex]) {
          return addresses[addressIndex];
        }
      }
    }

    // Default: return first address
    return addresses[0];
  }

  /**
   * Get address index by label
   * Helper method to map labels to address indices
   * In production, AddressRegistration should be extended to include a label field
   */
  private getAddressIndexByLabel(label: string, addresses: AddressRegistration[]): number {
    // Default mapping based on common labels
    const labelMap: Record<string, number> = {
      'home': 0,
      'office': 1,
      'locker': 2,
      'friend': 3,
      'hotel': 4,
    };
    
    return labelMap[label] ?? -1;
  }

  /**
   * Check if delivery request matches condition
   * 
   * @param request - Delivery request
   * @param condition - Condition to check
   * @returns True if matches
   */
  private matchesCondition(
    request: DeliveryRequestInfo,
    condition: AddressCondition
  ): boolean {
    const requestDate = new Date(request.requestedAt);

    // Check day of week
    if (condition.dayOfWeek) {
      const dayOfWeek = requestDate.getDay();
      if (!condition.dayOfWeek.includes(dayOfWeek)) {
        return false;
      }
    }

    // Check time range
    if (condition.timeRange) {
      const time = `${requestDate.getHours().toString().padStart(2, '0')}:${requestDate.getMinutes().toString().padStart(2, '0')}`;
      if (time < condition.timeRange.start || time > condition.timeRange.end) {
        return false;
      }
    }

    // Check weight range
    if (condition.weightRange) {
      if (condition.weightRange.min && request.package.weight < condition.weightRange.min) {
        return false;
      }
      if (condition.weightRange.max && request.package.weight > condition.weightRange.max) {
        return false;
      }
    }

    // Check value range
    if (condition.valueRange) {
      if (condition.valueRange.min && request.package.value < condition.valueRange.min) {
        return false;
      }
      if (condition.valueRange.max && request.package.value > condition.valueRange.max) {
        return false;
      }
    }

    // Check sender namespace
    if (condition.senderNamespace) {
      if (!condition.senderNamespace.includes(request.from.namespace)) {
        return false;
      }
    }

    // Check sender country
    if (condition.senderCountry && request.senderCountry) {
      if (!condition.senderCountry.includes(request.senderCountry)) {
        return false;
      }
    }

    // Check international delivery
    if (condition.isInternational !== undefined && request.senderCountry) {
      // In production, would compare sender and recipient countries
      // For now, just check if senderCountry is defined
      const isInternational = !!request.senderCountry;
      if (condition.isInternational !== isInternational) {
        return false;
      }
    }

    return true;
  }

  /**
   * Add verified sender
   */
  addVerifiedSender(conveyId: string): void {
    this.verifiedSenders.add(conveyId);
  }

  /**
   * Remove verified sender
   */
  removeVerifiedSender(conveyId: string): void {
    this.verifiedSenders.delete(conveyId);
  }

  /**
   * Check if sender is verified
   */
  isVerifiedSender(conveyId: string): boolean {
    return this.verifiedSenders.has(conveyId);
  }

  /**
   * Add friend
   */
  addFriend(conveyId: string): void {
    this.friendList.add(conveyId);
  }

  /**
   * Remove friend
   */
  removeFriend(conveyId: string): void {
    this.friendList.delete(conveyId);
  }

  /**
   * Check if sender is friend
   */
  isFriend(conveyId: string): boolean {
    return this.friendList.has(conveyId);
  }

  /**
   * Get all verified senders
   */
  getVerifiedSenders(): string[] {
    return Array.from(this.verifiedSenders);
  }

  /**
   * Get all friends
   */
  getFriends(): string[] {
    return Array.from(this.friendList);
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create default delivery acceptance policy
 */
export function createDefaultAcceptancePolicy(): DeliveryAcceptancePolicy {
  return {
    autoAcceptFriends: false,
    autoAcceptVerified: false,
    requireManualApproval: true,
    blockedSenders: [],
    rejectAnonymous: false,
  };
}

/**
 * Create permissive acceptance policy (accepts most deliveries)
 */
export function createPermissiveAcceptancePolicy(): DeliveryAcceptancePolicy {
  return {
    autoAcceptFriends: true,
    autoAcceptVerified: true,
    requireManualApproval: false,
    blockedSenders: [],
    rejectAnonymous: false,
  };
}

/**
 * Create strict acceptance policy (requires approval for all)
 */
export function createStrictAcceptancePolicy(): DeliveryAcceptancePolicy {
  return {
    autoAcceptFriends: false,
    autoAcceptVerified: false,
    requireManualApproval: true,
    blockedSenders: [],
    rejectAnonymous: true,
  };
}

/**
 * Create default address selection rules
 * 
 * These rules automatically select addresses based on common patterns:
 * - Office during weekday daytime
 * - Locker during night time
 * - Home on weekends and for international deliveries
 */
export function createDefaultAddressSelectionRules(): AddressSelectionRule[] {
  return [
    {
      name: 'weekday_daytime_office',
      priority: 100,
      condition: {
        dayOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
        timeRange: { start: '09:00', end: '17:00' },
      },
      selectAddress: 'office',
    },
    {
      name: 'night_locker',
      priority: 90,
      condition: {
        timeRange: { start: '22:00', end: '06:00' },
      },
      selectAddress: 'locker',
    },
    {
      name: 'weekend_home',
      priority: 80,
      condition: {
        dayOfWeek: [0, 6], // Sunday and Saturday
      },
      selectAddress: 'home',
    },
    {
      name: 'international_home',
      priority: 70,
      condition: {
        isInternational: true,
      },
      selectAddress: 'home',
    },
  ];
}

/**
 * Merge multiple acceptance policies
 * More restrictive rules take precedence
 */
export function mergeAcceptancePolicies(
  ...policies: DeliveryAcceptancePolicy[]
): DeliveryAcceptancePolicy {
  if (policies.length === 0) {
    return createDefaultAcceptancePolicy();
  }

  if (policies.length === 1) {
    return policies[0];
  }

  const merged: DeliveryAcceptancePolicy = {
    // Most restrictive auto-accept settings
    autoAcceptFriends: policies.every(p => p.autoAcceptFriends),
    autoAcceptVerified: policies.every(p => p.autoAcceptVerified),
    requireManualApproval: policies.some(p => p.requireManualApproval),
    rejectAnonymous: policies.some(p => p.rejectAnonymous),
    // Union of all blocked senders
    blockedSenders: Array.from(new Set(policies.flatMap(p => p.blockedSenders))),
    // Intersection of allowed namespaces (if any policy has restrictions)
    allowedNamespaces: policies.some(p => p.allowedNamespaces)
      ? policies
          .filter(p => p.allowedNamespaces)
          .reduce((acc, p) => {
            const namespaces = p.allowedNamespaces || [];
            return acc.length === 0 ? namespaces : acc.filter(n => namespaces.includes(n));
          }, [] as string[])
      : undefined,
    // Minimum weight/value limits
    maxWeight: Math.min(...policies.map(p => p.maxWeight || Infinity)),
    maxValue: Math.min(...policies.map(p => p.maxValue || Infinity)),
    // Intersection of allowed countries
    allowedCountries: policies.some(p => p.allowedCountries)
      ? policies
          .filter(p => p.allowedCountries)
          .reduce((acc, p) => {
            const countries = p.allowedCountries || [];
            return acc.length === 0 ? countries : acc.filter(c => countries.includes(c));
          }, [] as string[])
      : undefined,
  };

  // Clean up infinite values
  if (merged.maxWeight === Infinity) {
    delete merged.maxWeight;
  }
  if (merged.maxValue === Infinity) {
    delete merged.maxValue;
  }

  return merged;
}

/**
 * Create RecipientResolver instance
 */
export function createRecipientResolver(): RecipientResolver {
  return new RecipientResolver();
}

export default RecipientResolver;
