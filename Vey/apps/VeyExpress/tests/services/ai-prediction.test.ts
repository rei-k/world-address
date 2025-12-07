/**
 * AI Prediction Service Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AIPredictionService } from '../../src/services/ai-prediction.ts';
import { DeliveryOrder, DeliveryStatus, GeoCoordinates } from '../../src/types';

describe('AIPredictionService', () => {
  let service: AIPredictionService;
  let sampleOrder: DeliveryOrder;

  beforeEach(() => {
    service = new AIPredictionService();
    
    sampleOrder = {
      orderId: 'ORD-123',
      trackingNumber: 'TRACK-123',
      status: DeliveryStatus.IN_TRANSIT,
      origin: {
        country: 'US',
        addressLine1: '123 Main St',
        locality: 'New York',
        administrativeArea: 'NY',
        postalCode: '10001',
        recipient: 'Sender Corp',
        coordinates: { latitude: 40.7128, longitude: -74.0060 },
      },
      destination: {
        country: 'JP',
        addressLine1: '東京都渋谷区神南1-2-3',
        locality: '渋谷区',
        administrativeArea: '東京都',
        postalCode: '150-0041',
        recipient: '山田太郎',
        coordinates: { latitude: 35.6812, longitude: 139.7671 },
      },
      carrier: {
        id: 'dhl',
        name: 'DHL Express',
        code: 'DHL',
        type: 'express',
        country: 'DE',
        services: [],
        capabilities: {
          tracking: true,
          proofOfDelivery: true,
          signatureRequired: true,
          insurance: true,
          internationalShipping: true,
          pickupPoints: false,
          lockers: false,
        },
      },
      service: {
        id: 'express',
        name: 'Express Worldwide',
        deliveryDays: 3,
        price: { amount: 85.50, currency: 'USD' },
        features: ['tracking', 'insurance'],
      },
      package: {
        weight: 2.5,
        dimensions: { length: 30, width: 20, height: 15 },
        value: { amount: 150, currency: 'USD' },
      },
      timeline: {
        createdAt: new Date('2024-01-01'),
        estimatedDelivery: new Date('2024-01-05'),
        events: [],
      },
      metadata: {},
    };
  });

  describe('calculateRiskScore', () => {
    it('should calculate risk score for delivery order', async () => {
      const riskScore = await service.calculateRiskScore(sampleOrder);
      
      expect(riskScore).toBeDefined();
      expect(riskScore.overall).toBeGreaterThanOrEqual(0);
      expect(riskScore.overall).toBeLessThanOrEqual(100);
      expect(riskScore.accident).toBeGreaterThanOrEqual(0);
      expect(riskScore.delay).toBeGreaterThanOrEqual(0);
      expect(riskScore.theft).toBeGreaterThanOrEqual(0);
      expect(riskScore.loss).toBeGreaterThanOrEqual(0);
    });

    it('should include risk factors', async () => {
      const riskScore = await service.calculateRiskScore(sampleOrder);
      
      expect(Array.isArray(riskScore.factors)).toBe(true);
      expect(riskScore.factors.length).toBeGreaterThan(0);
      
      riskScore.factors.forEach(factor => {
        expect(factor).toHaveProperty('type');
        expect(factor).toHaveProperty('impact');
        expect(factor).toHaveProperty('description');
      });
    });

    it('should provide recommendations', async () => {
      const riskScore = await service.calculateRiskScore(sampleOrder);
      
      expect(Array.isArray(riskScore.recommendations)).toBe(true);
    });
  });

  describe('predictDelay', () => {
    it('should predict delay probability', async () => {
      const prediction = await service.predictDelay(sampleOrder);
      
      expect(prediction).toBeDefined();
      expect(prediction.probability).toBeGreaterThanOrEqual(0);
      expect(prediction.probability).toBeLessThanOrEqual(1);
      expect(prediction.expectedDelay).toBeGreaterThanOrEqual(0);
      expect(prediction.confidence).toBeGreaterThanOrEqual(0);
      expect(prediction.confidence).toBeLessThanOrEqual(100);
    });

    it('should provide factors affecting delay', async () => {
      const prediction = await service.predictDelay(sampleOrder);
      
      expect(Array.isArray(prediction.factors)).toBe(true);
    });
  });

  describe('optimizeRoute', () => {
    it('should optimize route with multiple waypoints', async () => {
      const waypoints: GeoCoordinates[] = [
        { latitude: 35.6895, longitude: 139.6917 }, // Tokyo
        { latitude: 35.0116, longitude: 135.7681 }, // Kyoto
        { latitude: 34.6937, longitude: 135.5023 }, // Osaka
        { latitude: 33.5904, longitude: 130.4017 }, // Fukuoka
      ];
      
      const route = {
        origin: { latitude: 35.6812, longitude: 139.7671 },
        waypoints,
        destination: { latitude: 43.0642, longitude: 141.3469 }, // Sapporo
      };
      
      const optimized = await service.optimizeRoute(route);
      
      expect(optimized).toBeDefined();
      expect(optimized.route).toBeDefined();
      expect(optimized.optimizedWaypoints).toBeDefined();
      expect(optimized.optimizedWaypoints.length).toBe(waypoints.length);
      expect(optimized.distanceSaved).toBeGreaterThanOrEqual(0);
      expect(optimized.timeSaved).toBeGreaterThanOrEqual(0);
      expect(optimized.confidence).toBeGreaterThan(0);
    });

    it('should handle single waypoint', async () => {
      const route = {
        origin: { latitude: 35.6812, longitude: 139.7671 },
        waypoints: [{ latitude: 35.6895, longitude: 139.6917 }],
        destination: { latitude: 43.0642, longitude: 141.3469 },
      };
      
      const optimized = await service.optimizeRoute(route);
      
      expect(optimized.optimizedWaypoints.length).toBe(1);
    });

    it('should handle empty waypoints', async () => {
      const route = {
        origin: { latitude: 35.6812, longitude: 139.7671 },
        waypoints: [],
        destination: { latitude: 43.0642, longitude: 141.3469 },
      };
      
      const optimized = await service.optimizeRoute(route);
      
      expect(optimized.optimizedWaypoints.length).toBe(0);
    });
  });

  describe('predictBestCarrier', () => {
    it('should recommend carrier based on requirements', async () => {
      const origin: GeoCoordinates = { latitude: 40.7128, longitude: -74.0060 };
      const destination: GeoCoordinates = { latitude: 35.6812, longitude: 139.7671 };
      
      const prediction = await service.predictBestCarrier(origin, destination, {
        speed: 'express',
        cost: 'standard',
        reliability: 95,
      });
      
      expect(prediction).toBeDefined();
      expect(prediction.recommendedCarrier).toBeDefined();
      expect(prediction.confidence).toBeGreaterThan(0);
      expect(prediction.confidence).toBeLessThanOrEqual(100);
      expect(Array.isArray(prediction.reasoning)).toBe(true);
      expect(prediction.reasoning.length).toBeGreaterThan(0);
    });
  });

  describe('detectAnomalies', () => {
    it('should detect anomalies in delivery orders', async () => {
      const orders: DeliveryOrder[] = [sampleOrder];
      
      const result = await service.detectAnomalies(orders);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result.anomalies)).toBe(true);
      expect(Array.isArray(result.insights)).toBe(true);
    });

    it('should identify high-risk orders', async () => {
      const highRiskOrder = { ...sampleOrder };
      highRiskOrder.package.value = { amount: 50000, currency: 'USD' };
      
      const result = await service.detectAnomalies([highRiskOrder]);
      
      // High value packages should potentially trigger anomalies
      expect(result.anomalies).toBeDefined();
    });
  });
});
