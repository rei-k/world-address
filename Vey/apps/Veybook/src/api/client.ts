/**
 * Veybook API Client
 * Implements data flows from diagrams/data-flows.md
 */

import type {
  User,
  Address,
  Friend,
  AddressToken,
  OAuthResponse,
  CreateAddressRequest,
  CreateAddressResponse,
  FriendInvitation,
  DeliveryTracking,
  ApiConfig,
} from '../types';

/**
 * Veybook API Client
 * Handles all API communication following the documented data flows
 */
export class VeybookClient {
  private baseURL: string;
  private apiKey?: string;
  private accessToken?: string;

  constructor(config: ApiConfig) {
    this.baseURL = config.baseURL;
    this.apiKey = config.apiKey;
  }

  /**
   * Set access token for authenticated requests
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Get authorization headers
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  // ============================================================================
  // Flow 1: User Registration & Authentication
  // Based on diagrams/data-flows.md - User Registration Flow
  // ============================================================================

  /**
   * OAuth login - Step 1 of User Registration Flow
   * @param provider - OAuth provider (google, apple, line)
   * @param code - Authorization code from OAuth provider
   */
  async oauthLogin(provider: 'google' | 'apple' | 'line', code: string): Promise<OAuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/oauth/${provider}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      // User-friendly error handling without exposing internal details
      const errorCode = `AUTH_${response.status}`;
      throw new Error(`Authentication failed. Error code: ${errorCode}`);
    }

    const data = await response.json();
    this.setAccessToken(data.accessToken);
    return data;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${this.baseURL}/users/me`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user profile. Error code: USER_${response.status}`);
    }

    return response.json();
  }

  /**
   * Update user profile
   */
  async updateUser(updates: Partial<User>): Promise<User> {
    const response = await fetch(`${this.baseURL}/users/me`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update profile. Error code: USER_UPDATE_${response.status}`);
    }

    return response.json();
  }

  // ============================================================================
  // Flow 2: Address Registration & Management
  // Based on diagrams/data-flows.md - Address Registration Flow
  // ============================================================================

  /**
   * Create a new address - Implements Address Registration Flow
   * Steps:
   * 1. Frontend validation
   * 2. Submit to VeyAPI
   * 3. Address validation (format, postal code, geocoding)
   * 4. PID generation
   * 5. ZKP proof generation
   * 6. Encrypted storage
   */
  async createAddress(request: CreateAddressRequest): Promise<CreateAddressResponse> {
    const response = await fetch(`${this.baseURL}/addresses`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to create address. Error code: ADDR_CREATE_${response.status}`);
    }

    return response.json();
  }

  /**
   * Get all user addresses
   */
  async getAddresses(): Promise<Address[]> {
    const response = await fetch(`${this.baseURL}/addresses`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch addresses. Error code: ADDR_LIST_${response.status}`);
    }

    return response.json();
  }

  /**
   * Get address by ID
   */
  async getAddress(id: string): Promise<Address> {
    const response = await fetch(`${this.baseURL}/addresses/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch address. Error code: ADDR_GET_${response.status}`);
    }

    return response.json();
  }

  /**
   * Update an existing address
   */
  async updateAddress(id: string, updates: Partial<CreateAddressRequest>): Promise<Address> {
    const response = await fetch(`${this.baseURL}/addresses/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update address. Error code: ADDR_UPDATE_${response.status}`);
    }

    return response.json();
  }

  /**
   * Delete an address
   */
  async deleteAddress(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/addresses/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete address. Error code: ADDR_DELETE_${response.status}`);
    }
  }

  /**
   * Set primary address
   */
  async setPrimaryAddress(id: string): Promise<Address> {
    const response = await fetch(`${this.baseURL}/addresses/${id}/primary`, {
      method: 'PUT',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to set primary address. Error code: ADDR_PRIMARY_${response.status}`);
    }

    return response.json();
  }

  // ============================================================================
  // Flow 3: Friend Management & QR/NFC
  // Based on diagrams/user-journeys.md - Gift Delivery Journey
  // ============================================================================

  /**
   * Get user's friends list
   */
  async getFriends(): Promise<Friend[]> {
    const response = await fetch(`${this.baseURL}/friends`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch friends list. Error code: FRIEND_LIST_${response.status}`);
    }

    return response.json();
  }

  /**
   * Generate friend invitation QR code
   */
  async generateFriendInvitation(): Promise<FriendInvitation> {
    const response = await fetch(`${this.baseURL}/friends/invite`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate invitation. Error code: FRIEND_INVITE_${response.status}`);
    }

    return response.json();
  }

  /**
   * Accept friend invitation via QR code scan
   */
  async acceptFriendInvitation(qrCode: string): Promise<Friend> {
    const response = await fetch(`${this.baseURL}/friends/accept`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ qrCode }),
    });

    if (!response.ok) {
      throw new Error(`Failed to accept invitation. Error code: FRIEND_ACCEPT_${response.status}`);
    }

    return response.json();
  }

  /**
   * Remove a friend
   */
  async removeFriend(friendId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/friends/${friendId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to remove friend. Error code: FRIEND_REMOVE_${response.status}`);
    }
  }

  // ============================================================================
  // Flow 4: Address Token Generation (for EC integration)
  // Based on diagrams/data-flows.md - Order & Delivery Flow
  // ============================================================================

  /**
   * Generate address token for EC site integration
   * Returns a ZKP proof token instead of raw address
   */
  async generateAddressToken(addressId: string): Promise<AddressToken> {
    const response = await fetch(`${this.baseURL}/addresses/${addressId}/token`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate address token. Error code: TOKEN_${response.status}`);
    }

    return response.json();
  }

  // ============================================================================
  // Flow 5: Delivery Tracking
  // Based on diagrams/data-flows.md - Real-time Tracking Flow
  // ============================================================================

  /**
   * Get delivery tracking information
   */
  async getDeliveryTracking(trackingNumber: string): Promise<DeliveryTracking> {
    const response = await fetch(`${this.baseURL}/tracking/${trackingNumber}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tracking information. Error code: TRACK_${response.status}`);
    }

    return response.json();
  }

  /**
   * Get all deliveries for current user
   */
  async getMyDeliveries(): Promise<DeliveryTracking[]> {
    const response = await fetch(`${this.baseURL}/deliveries`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch deliveries. Error code: DELIVERY_LIST_${response.status}`);
    }

    return response.json();
  }
}

/**
 * Create a Veybook API client instance
 */
export function createVeybookClient(config: ApiConfig): VeybookClient {
  return new VeybookClient(config);
}
