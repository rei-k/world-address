/**
 * Tracking API Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TrackingAPI } from '../../src/api/tracking-api';

describe('TrackingAPI', () => {
  let api: TrackingAPI;

  beforeEach(() => {
    api = new TrackingAPI('https://api.veyexpress.test', 'test-api-key');
    
    // Mock fetch globally
    global.fetch = vi.fn();
  });

  describe('trackPackage', () => {
    it('should track a package by tracking number', async () => {
      const mockResponse = {
        success: true,
        data: {
          orderId: 'ORD-123',
          trackingNumber: 'TRACK-123',
          status: 'in_transit',
        },
      };

      (global.fetch as any).mockResolvedValue({
        json: async () => mockResponse,
      });

      const result = await api.trackPackage('TRACK-123');
      
      expect(result.success).toBe(true);
      expect(result.data?.trackingNumber).toBe('TRACK-123');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.veyexpress.test/tracking/TRACK-123',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
          }),
        })
      );
    });
  });

  describe('trackMultiplePackages', () => {
    it('should track multiple packages', async () => {
      const mockResponse = {
        success: true,
        data: [
          { trackingNumber: 'TRACK-1', status: 'delivered' },
          { trackingNumber: 'TRACK-2', status: 'in_transit' },
        ],
      };

      (global.fetch as any).mockResolvedValue({
        json: async () => mockResponse,
      });

      const result = await api.trackMultiplePackages(['TRACK-1', 'TRACK-2']);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });
  });

  describe('getPackageLocation', () => {
    it('should get package location', async () => {
      const mockResponse = {
        success: true,
        data: {
          latitude: 35.6812,
          longitude: 139.7671,
          accuracy: 100,
        },
      };

      (global.fetch as any).mockResolvedValue({
        json: async () => mockResponse,
      });

      const result = await api.getPackageLocation('TRACK-123');
      
      expect(result.success).toBe(true);
      expect(result.data?.latitude).toBeDefined();
      expect(result.data?.longitude).toBeDefined();
    });
  });

  describe('getDeliveryEvents', () => {
    it('should get delivery events history', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            timestamp: new Date('2024-01-01'),
            status: 'picked_up',
            description: 'Package picked up',
          },
          {
            timestamp: new Date('2024-01-02'),
            status: 'in_transit',
            description: 'In transit',
          },
        ],
      };

      (global.fetch as any).mockResolvedValue({
        json: async () => mockResponse,
      });

      const result = await api.getDeliveryEvents('TRACK-123');
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });
  });

  describe('subscribeToUpdates', () => {
    it('should subscribe to tracking updates via webhook', async () => {
      const mockResponse = {
        success: true,
        data: {
          subscriptionId: 'SUB-123',
        },
      };

      (global.fetch as any).mockResolvedValue({
        json: async () => mockResponse,
      });

      const result = await api.subscribeToUpdates('TRACK-123', 'https://example.com/webhook');
      
      expect(result.success).toBe(true);
      expect(result.data?.subscriptionId).toBe('SUB-123');
    });
  });
});
