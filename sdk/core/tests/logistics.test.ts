/**
 * @vey/core - Tests for logistics types
 */

import { describe, it, expect } from 'vitest';
import type {
  CarrierCode,
  RateQuoteRequest,
  RateQuote,
  RateComparisonResponse,
  ETAPredictionRequest,
  DeliveryPrediction,
  MultiPieceShipment,
  PickupRequest,
  PickupConfirmation,
  CarbonOffsetResult,
  DeliveryLocation,
  LogisticsService,
} from '../src/logistics';

describe('Logistics Types', () => {
  describe('Carrier Types', () => {
    it('should support major carriers', () => {
      const carriers: CarrierCode[] = [
        'fedex', 'dhl', 'ups', 'usps', 'ems',
        'yamato', 'sagawa', 'jppost',
      ];

      expect(carriers).toContain('fedex');
      expect(carriers).toContain('yamato');
    });
  });

  describe('Rate Comparison Types', () => {
    it('should define rate quote request structure', () => {
      const request: RateQuoteRequest = {
        origin: {
          street_address: '1-1 Shibuya',
          city: 'Shibuya-ku',
          province: 'Tokyo',
          postal_code: '150-0001',
          country: 'Japan',
        },
        destination: {
          street_address: '123 Main St',
          city: 'New York',
          province: 'NY',
          postal_code: '10001',
          country: 'USA',
        },
        packages: [
          {
            weight: { value: 2.5, unit: 'kg' },
            dimensions: {
              length: 30,
              width: 20,
              height: 15,
              unit: 'cm',
            },
          },
        ],
        carriers: ['fedex', 'dhl', 'ups'],
        serviceLevels: ['express', 'standard'],
        includeCarbonOffset: true,
      };

      expect(request.packages).toHaveLength(1);
      expect(request.carriers).toContain('fedex');
    });

    it('should define rate quote structure', () => {
      const quote: RateQuote = {
        carrier: 'fedex',
        service: {
          carrier: 'fedex',
          serviceCode: 'INTERNATIONAL_PRIORITY',
          serviceName: 'FedEx International Priority',
          level: 'priority',
          transitDays: { min: 1, max: 3 },
          features: ['tracking', 'insurance'],
          trackingAvailable: true,
          insuranceIncluded: true,
          signatureRequired: false,
        },
        totalRate: 8500,
        currency: 'JPY',
        breakdown: {
          baseRate: 7000,
          fuelSurcharge: 1200,
          insurance: 300,
        },
        estimatedDelivery: {
          date: '2024-01-20',
          time: '18:00',
          guaranteed: true,
        },
        transitDays: 2,
        quoteId: 'quote_123',
        validUntil: '2024-01-18T23:59:59Z',
      };

      expect(quote.totalRate).toBe(8500);
      expect(quote.estimatedDelivery.guaranteed).toBe(true);
    });

    it('should define rate comparison response structure', () => {
      const response: RateComparisonResponse = {
        success: true,
        ratesByPrice: [],
        ratesByTime: [],
        cheapest: undefined,
        fastest: undefined,
      };

      expect(response.success).toBe(true);
    });
  });

  describe('ETA Prediction Types', () => {
    it('should define ETA prediction request structure', () => {
      const request: ETAPredictionRequest = {
        origin: { country: 'Japan' },
        destination: { country: 'USA' },
        shipDate: '2024-01-15',
        carrier: 'fedex',
        serviceCode: 'INTERNATIONAL_PRIORITY',
      };

      expect(request.carrier).toBe('fedex');
    });

    it('should define delivery prediction structure', () => {
      const prediction: DeliveryPrediction = {
        carrier: 'fedex',
        serviceCode: 'INTERNATIONAL_PRIORITY',
        earliestDelivery: '2024-01-17',
        latestDelivery: '2024-01-19',
        mostLikely: '2024-01-18',
        confidence: 0.92,
        factors: {
          historicalPerformance: 0.95,
          carrierDelays: false,
          weatherImpact: 'none',
          holidayImpact: false,
          remoteArea: false,
        },
      };

      expect(prediction.confidence).toBeGreaterThan(0.9);
      expect(prediction.factors.weatherImpact).toBe('none');
    });
  });

  describe('Multi-Piece Shipment Types', () => {
    it('should define multi-piece shipment structure', () => {
      const shipment: MultiPieceShipment = {
        masterTrackingNumber: 'MASTER123456',
        carrier: 'ups',
        serviceCode: 'EXPRESS_SAVER',
        origin: { country: 'Japan' },
        destination: { country: 'USA' },
        totalPieces: 3,
        pieces: [
          {
            pieceNumber: 1,
            trackingNumber: 'PIECE001',
            weight: { value: 2, unit: 'kg' },
          },
          {
            pieceNumber: 2,
            trackingNumber: 'PIECE002',
            weight: { value: 3, unit: 'kg' },
          },
          {
            pieceNumber: 3,
            trackingNumber: 'PIECE003',
            weight: { value: 1.5, unit: 'kg' },
          },
        ],
        totalWeight: { value: 6.5, unit: 'kg' },
        status: 'created',
        createdAt: '2024-01-15T10:00:00Z',
      };

      expect(shipment.pieces).toHaveLength(3);
      expect(shipment.totalWeight.value).toBe(6.5);
    });
  });

  describe('Pickup Scheduling Types', () => {
    it('should define pickup request structure', () => {
      const request: PickupRequest = {
        carrier: 'fedex',
        address: {
          street_address: '1-1 Shibuya',
          city: 'Shibuya-ku',
          province: 'Tokyo',
          postal_code: '150-0001',
          country: 'Japan',
        },
        contact: {
          name: 'Taro Yamada',
          phone: '03-1234-5678',
        },
        preferredWindow: {
          date: '2024-01-16',
          startTime: '14:00',
          endTime: '17:00',
        },
        packageCount: 5,
        instructions: 'Ring doorbell twice',
      };

      expect(request.packageCount).toBe(5);
      expect(request.preferredWindow.startTime).toBe('14:00');
    });

    it('should define pickup confirmation structure', () => {
      const confirmation: PickupConfirmation = {
        confirmationNumber: 'PU123456',
        carrier: 'fedex',
        scheduledWindow: {
          date: '2024-01-16',
          startTime: '14:00',
          endTime: '17:00',
        },
        status: 'confirmed',
        cancellationDeadline: '2024-01-16T12:00:00Z',
      };

      expect(confirmation.confirmationNumber).toBe('PU123456');
      expect(confirmation.status).toBe('confirmed');
    });
  });

  describe('Carbon Offset Types', () => {
    it('should define carbon offset result structure', () => {
      const result: CarbonOffsetResult = {
        co2Emissions: 25.5,
        distance: 10500,
        offsetCost: {
          amount: 350,
          currency: 'JPY',
        },
        offsetProjects: [
          {
            id: 'proj_001',
            name: 'Amazon Reforestation',
            type: 'reforestation',
            location: 'Brazil',
            costPerKg: 15,
          },
        ],
        alternatives: [
          {
            mode: 'sea',
            emissions: 5.2,
            savings: 20.3,
            savingsPercent: 79.6,
          },
        ],
      };

      expect(result.co2Emissions).toBe(25.5);
      expect(result.offsetProjects?.[0].type).toBe('reforestation');
    });
  });

  describe('Alternative Delivery Types', () => {
    it('should define delivery location structure', () => {
      const location: DeliveryLocation = {
        id: 'loc_001',
        name: 'FamilyMart Shibuya',
        type: 'convenience_store',
        address: {
          street_address: '2-3-4 Shibuya',
          city: 'Shibuya-ku',
          province: 'Tokyo',
          postal_code: '150-0002',
          country: 'Japan',
        },
        operatingHours: [
          { day: 'mon', open: '00:00', close: '24:00' },
        ],
        distance: { value: 0.5, unit: 'km' },
        provider: 'FamilyMart',
      };

      expect(location.type).toBe('convenience_store');
      expect(location.distance?.value).toBe(0.5);
    });
  });
});
