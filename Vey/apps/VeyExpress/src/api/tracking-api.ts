/**
 * Tracking API
 * Real-time package tracking across all carriers
 */

import {
  DeliveryOrder,
  APIResponse,
  DeliveryEvent,
  GeoCoordinates,
} from '../types';

/**
 * Tracking API Client
 * Provides methods for package tracking and delivery status updates
 */
export class TrackingAPI {
  private baseUrl: string;
  private apiKey: string;

  /**
   * Initialize Tracking API client
   * @param baseUrl - Base URL for the API
   * @param apiKey - API authentication key
   */
  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Track a package by tracking number
   * @param trackingNumber - The tracking number to look up
   * @returns Promise<APIResponse<DeliveryOrder>> - Delivery information with current status
   * @throws {Error} If tracking number is invalid or network error occurs
   * @example
   * ```typescript
   * const result = await api.trackPackage('TRACK-123456');
   * if (result.success) {
   *   console.log('Status:', result.data.status);
   * }
   * ```
   */
  async trackPackage(trackingNumber: string): Promise<APIResponse<DeliveryOrder>> {
    try {
      const response = await fetch(`${this.baseUrl}/tracking/${trackingNumber}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: `Failed to track package: ${response.statusText}`,
          },
        };
      }

      return response.json();
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown network error',
        },
      };
    }
  }

  /**
   * Track multiple packages in a single request
   * @param trackingNumbers - Array of tracking numbers to look up
   * @returns Promise<APIResponse<DeliveryOrder[]>> - Array of delivery information
   * @example
   * ```typescript
   * const result = await api.trackMultiplePackages(['TRACK-1', 'TRACK-2']);
   * if (result.success) {
   *   result.data.forEach(order => console.log(order.status));
   * }
   * ```
   */
  async trackMultiplePackages(trackingNumbers: string[]): Promise<APIResponse<DeliveryOrder[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/tracking/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackingNumbers }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: `Failed to track packages: ${response.statusText}`,
          },
        };
      }

      return response.json();
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown network error',
        },
      };
    }
  }

  /**
   * Get real-time GPS location of a package
   * @param trackingNumber - The tracking number to locate
   * @returns Promise<APIResponse<GeoCoordinates>> - Current GPS coordinates
   * @example
   * ```typescript
   * const result = await api.getPackageLocation('TRACK-123456');
   * if (result.success && result.data) {
   *   console.log(`Lat: ${result.data.latitude}, Lng: ${result.data.longitude}`);
   * }
   * ```
   */
  async getPackageLocation(trackingNumber: string): Promise<APIResponse<GeoCoordinates>> {
    try {
      const response = await fetch(`${this.baseUrl}/tracking/${trackingNumber}/location`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: `Failed to get package location: ${response.statusText}`,
          },
        };
      }

      return response.json();
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown network error',
        },
      };
    }
  }

  /**
   * Get complete delivery event history for a package
   * @param trackingNumber - The tracking number to query
   * @returns Promise<APIResponse<DeliveryEvent[]>> - Chronological list of delivery events
   * @example
   * ```typescript
   * const result = await api.getDeliveryEvents('TRACK-123456');
   * if (result.success && result.data) {
   *   result.data.forEach(event => {
   *     console.log(`${event.timestamp}: ${event.description}`);
   *   });
   * }
   * ```
   */
  async getDeliveryEvents(trackingNumber: string): Promise<APIResponse<DeliveryEvent[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/tracking/${trackingNumber}/events`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: `Failed to get delivery events: ${response.statusText}`,
          },
        };
      }

      return response.json();
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown network error',
        },
      };
    }
  }

  /**
   * Subscribe to real-time tracking updates via webhook
   * @param trackingNumber - The tracking number to monitor
   * @param webhookUrl - Your webhook endpoint URL
   * @returns Promise<APIResponse<{ subscriptionId: string }>> - Subscription confirmation
   * @example
   * ```typescript
   * const result = await api.subscribeToUpdates(
   *   'TRACK-123456',
   *   'https://yourdomain.com/webhooks/veyexpress'
   * );
   * if (result.success && result.data) {
   *   console.log('Subscribed with ID:', result.data.subscriptionId);
   * }
   * ```
   */
  async subscribeToUpdates(
    trackingNumber: string,
    webhookUrl: string
  ): Promise<APIResponse<{ subscriptionId: string }>> {
    try {
      if (!webhookUrl || !webhookUrl.startsWith('http')) {
        return {
          success: false,
          error: {
            code: 'INVALID_WEBHOOK_URL',
            message: 'Webhook URL must be a valid HTTP/HTTPS URL',
          },
        };
      }

      const response = await fetch(`${this.baseUrl}/tracking/${trackingNumber}/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ webhookUrl }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: `Failed to subscribe to updates: ${response.statusText}`,
          },
        };
      }

      return response.json();
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown network error',
        },
      };
    }
  }
}
