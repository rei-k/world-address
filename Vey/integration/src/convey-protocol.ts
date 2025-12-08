/**
 * ConveyID Protocol Implementation
 * 
 * Implements the email-like delivery protocol where users can send packages
 * using ConveyID (e.g., alice@convey) without knowing physical addresses.
 * 
 * Protocol Flow:
 * 1. Sender enters ConveyID (e.g., "send this to alice@convey")
 * 2. System sends delivery request to recipient
 * 3. Recipient accepts and selects delivery address from their address book
 * 4. ZKP proof generated (address privacy maintained)
 * 5. Carrier receives minimal necessary information for delivery
 */

import { ZKPIntegration, type AddressRegistration, type ConveyDeliveryRequest, type DeliveryAcceptance } from './zkp-integration';
import { hashSHA256, generateSecureNonce } from '../../../sdk/core/src/zkp-crypto';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface ConveyID {
  /** Local part (username) */
  localPart: string;
  /** Namespace (domain) */
  namespace: string;
  /** Full ConveyID */
  full: string;
}

export interface ConveyUser {
  /** ConveyID */
  conveyId: ConveyID;
  /** User's DID */
  did: string;
  /** Display name */
  displayName?: string;
  /** Avatar URL */
  avatarUrl?: string;
  /** Delivery acceptance policy */
  acceptancePolicy: DeliveryAcceptancePolicy;
  /** Registered addresses */
  addresses: AddressRegistration[];
}

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
}

export interface DeliveryRequest {
  /** Request ID */
  id: string;
  /** Sender's ConveyID */
  from: ConveyID;
  /** Recipient's ConveyID */
  to: ConveyID;
  /** Package details */
  package: ConveyDeliveryRequest['package'];
  /** Optional message from sender */
  message?: string;
  /** Request timestamp */
  requestedAt: string;
  /** Expiration time */
  expiresAt: string;
  /** Status */
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  /** Delivery preferences */
  preferences?: ConveyDeliveryRequest['preferences'];
}

export interface DeliveryResponse {
  /** Request ID */
  requestId: string;
  /** Response (accept/reject) */
  accepted: boolean;
  /** Selected address (if accepted) */
  selectedAddress?: {
    pid: string;
    label?: string;
  };
  /** ZKP proof */
  zkpProof?: {
    type: 'membership' | 'selective-reveal' | 'locker';
    proof: unknown;
    publicSignals: string[];
  };
  /** Rejection reason (if rejected) */
  rejectionReason?: string;
  /** Response timestamp */
  respondedAt: string;
}

// ============================================================================
// ConveyID Parser
// ============================================================================

/**
 * Parse a ConveyID string into components
 * 
 * @example
 * parseConveyID('alice@convey') // { localPart: 'alice', namespace: 'convey', full: 'alice@convey' }
 * parseConveyID('shop@convey.store') // { localPart: 'shop', namespace: 'convey.store', full: 'shop@convey.store' }
 */
export function parseConveyID(conveyIdString: string): ConveyID {
  const parts = conveyIdString.split('@');
  if (parts.length !== 2) {
    throw new Error(`Invalid ConveyID format: ${conveyIdString}. Expected format: localpart@namespace`);
  }

  const [localPart, namespace] = parts;

  // Validate local part
  if (!/^[a-z0-9._-]+$/i.test(localPart)) {
    throw new Error(`Invalid local part: ${localPart}. Must contain only letters, numbers, dots, hyphens, and underscores.`);
  }

  // Validate namespace
  if (!/^[a-z0-9.-]+$/i.test(namespace)) {
    throw new Error(`Invalid namespace: ${namespace}. Must contain only letters, numbers, dots, and hyphens.`);
  }

  return {
    localPart,
    namespace,
    full: conveyIdString,
  };
}

/**
 * Format ConveyID components into a string
 */
export function formatConveyID(localPart: string, namespace: string): string {
  return `${localPart}@${namespace}`;
}

/**
 * Validate ConveyID format
 */
export function isValidConveyID(conveyIdString: string): boolean {
  try {
    parseConveyID(conveyIdString);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Namespace Resolution
// ============================================================================

/**
 * Get namespace priority for delivery
 * Higher number = higher priority
 */
export function getNamespacePriority(namespace: string): number {
  const priorityMap: Record<string, number> = {
    'convey': 100,              // Global standard
    'jp.convey': 90,            // Japan-specific
    'us.convey': 90,            // US-specific
    'eu.convey': 90,            // EU-specific
    'convey.store': 80,         // E-commerce
    'convey.work': 70,          // Business
    'gift.convey': 60,          // Gifts
    'returns.convey': 50,       // Returns
    'anonymous.convey': 40,     // Anonymous
  };

  return priorityMap[namespace] || 0;
}

/**
 * Check if namespace supports anonymous delivery
 */
export function isAnonymousNamespace(namespace: string): boolean {
  return namespace === 'anonymous.convey' || namespace === 'gift.convey';
}

/**
 * Check if namespace requires business verification
 */
export function requiresBusinessVerification(namespace: string): boolean {
  return namespace === 'convey.work' || namespace.endsWith('.convey.work');
}

// ============================================================================
// ConveyProtocol Class
// ============================================================================

export class ConveyProtocol {
  private zkpIntegration: ZKPIntegration;
  private user: ConveyUser | null = null;
  private pendingRequests: Map<string, DeliveryRequest> = new Map();

  constructor(zkpIntegration: ZKPIntegration) {
    this.zkpIntegration = zkpIntegration;
  }

  /**
   * Register user with ConveyID
   */
  async registerUser(
    localPart: string,
    namespace: string,
    displayName: string,
    acceptancePolicy: DeliveryAcceptancePolicy
  ): Promise<ConveyUser> {
    const conveyId = parseConveyID(formatConveyID(localPart, namespace));
    const did = this.zkpIntegration.getUserDid();

    this.user = {
      conveyId,
      did,
      displayName,
      acceptancePolicy,
      addresses: [],
    };

    return this.user;
  }

  /**
   * Add address to user's address book
   */
  async addAddress(address: AddressRegistration): Promise<void> {
    if (!this.user) {
      throw new Error('User not registered. Call registerUser() first.');
    }

    // Register address with ZKP credentials
    await this.zkpIntegration.registerAddress(address);
    
    this.user.addresses.push(address);
  }

  /**
   * Send delivery request to recipient
   */
  async sendDeliveryRequest(
    recipientConveyId: string,
    packageDetails: ConveyDeliveryRequest['package'],
    message?: string,
    preferences?: ConveyDeliveryRequest['preferences']
  ): Promise<DeliveryRequest> {
    if (!this.user) {
      throw new Error('User not registered. Call registerUser() first.');
    }

    // Validate recipient ConveyID
    const recipientId = parseConveyID(recipientConveyId);

    // Generate request ID
    const requestId = hashSHA256(`${this.user.conveyId.full}:${recipientConveyId}:${Date.now()}:${generateSecureNonce()}`);

    // Create delivery request
    const request: DeliveryRequest = {
      id: requestId,
      from: this.user.conveyId,
      to: recipientId,
      package: packageDetails,
      message,
      requestedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      status: 'pending',
      preferences,
    };

    // In production, this would send the request to the recipient via API
    console.log('Delivery request sent:', request);

    return request;
  }

  /**
   * Receive delivery request (recipient side)
   */
  async receiveDeliveryRequest(request: DeliveryRequest): Promise<void> {
    if (!this.user) {
      throw new Error('User not registered. Call registerUser() first.');
    }

    // Validate request is for this user
    if (request.to.full !== this.user.conveyId.full) {
      throw new Error(`Request is not for this user. Expected ${this.user.conveyId.full}, got ${request.to.full}`);
    }

    // Check if sender is blocked
    if (this.user.acceptancePolicy.blockedSenders.includes(request.from.full)) {
      await this.rejectDeliveryRequest(request.id, 'Sender is blocked');
      return;
    }

    // Check namespace restrictions
    if (this.user.acceptancePolicy.allowedNamespaces) {
      if (!this.user.acceptancePolicy.allowedNamespaces.includes(request.from.namespace)) {
        await this.rejectDeliveryRequest(request.id, 'Sender namespace not allowed');
        return;
      }
    }

    // Store pending request
    this.pendingRequests.set(request.id, request);

    // Auto-accept based on policy
    if (this.user.acceptancePolicy.autoAcceptVerified && !this.user.acceptancePolicy.requireManualApproval) {
      // In production, check if sender is verified
      // For demo, we'll require manual approval
    }
  }

  /**
   * Accept delivery request and generate ZKP proof
   */
  async acceptDeliveryRequest(
    requestId: string,
    selectedAddressIndex: number = 0
  ): Promise<DeliveryResponse> {
    if (!this.user) {
      throw new Error('User not registered');
    }

    const request = this.pendingRequests.get(requestId);
    if (!request) {
      throw new Error(`Request not found: ${requestId}`);
    }

    if (request.status !== 'pending') {
      throw new Error(`Request already ${request.status}`);
    }

    // Select address
    const selectedAddress = this.user.addresses[selectedAddressIndex];
    if (!selectedAddress) {
      throw new Error('No address available');
    }

    // Generate ZKP proof based on preferences
    const deliveryRequest: ConveyDeliveryRequest = {
      senderId: request.from.full,
      recipientId: request.to.full,
      package: request.package,
      preferences: request.preferences,
    };

    const acceptance = await this.zkpIntegration.handleDeliveryRequest(
      deliveryRequest,
      this.user.addresses
    );

    // Update request status
    request.status = 'accepted';
    this.pendingRequests.set(requestId, request);

    // Create response
    const response: DeliveryResponse = {
      requestId,
      accepted: true,
      selectedAddress: {
        pid: selectedAddress.pid,
      },
      zkpProof: {
        type: acceptance.proofType,
        proof: acceptance.proof,
        publicSignals: acceptance.publicSignals,
      },
      respondedAt: new Date().toISOString(),
    };

    return response;
  }

  /**
   * Reject delivery request
   */
  async rejectDeliveryRequest(requestId: string, reason: string): Promise<DeliveryResponse> {
    const request = this.pendingRequests.get(requestId);
    if (!request) {
      throw new Error(`Request not found: ${requestId}`);
    }

    // Update request status
    request.status = 'rejected';
    this.pendingRequests.set(requestId, request);

    return {
      requestId,
      accepted: false,
      rejectionReason: reason,
      respondedAt: new Date().toISOString(),
    };
  }

  /**
   * Get all pending requests
   */
  getPendingRequests(): DeliveryRequest[] {
    return Array.from(this.pendingRequests.values()).filter(r => r.status === 'pending');
  }

  /**
   * Get delivery request history
   */
  getRequestHistory(): DeliveryRequest[] {
    return Array.from(this.pendingRequests.values());
  }

  /**
   * Update acceptance policy
   */
  updateAcceptancePolicy(policy: Partial<DeliveryAcceptancePolicy>): void {
    if (!this.user) {
      throw new Error('User not registered');
    }

    this.user.acceptancePolicy = {
      ...this.user.acceptancePolicy,
      ...policy,
    };
  }

  /**
   * Block a sender
   */
  blockSender(conveyId: string): void {
    if (!this.user) {
      throw new Error('User not registered');
    }

    if (!this.user.acceptancePolicy.blockedSenders.includes(conveyId)) {
      this.user.acceptancePolicy.blockedSenders.push(conveyId);
    }
  }

  /**
   * Unblock a sender
   */
  unblockSender(conveyId: string): void {
    if (!this.user) {
      throw new Error('User not registered');
    }

    this.user.acceptancePolicy.blockedSenders = this.user.acceptancePolicy.blockedSenders.filter(
      id => id !== conveyId
    );
  }

  /**
   * Get current user
   */
  getCurrentUser(): ConveyUser | null {
    return this.user;
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Create ConveyProtocol instance
 */
export function createConveyProtocol(zkpIntegration: ZKPIntegration): ConveyProtocol {
  return new ConveyProtocol(zkpIntegration);
}

/**
 * Generate ConveyID from username
 * Automatically selects appropriate namespace
 */
export function generateConveyID(username: string, purpose: 'personal' | 'store' | 'work' | 'anonymous' = 'personal'): string {
  const namespaceMap = {
    personal: 'convey',
    store: 'convey.store',
    work: 'convey.work',
    anonymous: 'anonymous.convey',
  };

  return formatConveyID(username, namespaceMap[purpose]);
}

export default ConveyProtocol;
