/**
 * @vey/core - Tests for dashboard and system types
 */

import { describe, it, expect } from 'vitest';
import type {
  // Dashboard types
  GeoDataPoint,
  HeatmapData,
  InventoryItem,
  InventoryAlert,
  StaffPerformanceMetrics,
  ShipmentProfitAnalysis,
  FraudAlert,
  FraudScreeningResponse,
  // System types
  PendingSyncItem,
  SyncResult,
  KioskSession,
  AuditLogEntry,
  SystemHealthStatus,
} from '../src';

describe('Dashboard Types', () => {
  describe('Heatmap Types', () => {
    it('should define geo data point structure', () => {
      const dataPoint: GeoDataPoint = {
        countryCode: 'US',
        countryName: 'United States',
        shipmentCount: 1500,
        totalValue: {
          amount: 15000000,
          currency: 'JPY',
        },
        averageWeight: 2.5,
        topCarriers: [
          { carrier: 'fedex', percentage: 45 },
          { carrier: 'ups', percentage: 30 },
          { carrier: 'dhl', percentage: 25 },
        ],
      };

      expect(dataPoint.shipmentCount).toBe(1500);
      expect(dataPoint.topCarriers[0].carrier).toBe('fedex');
    });
  });

  describe('Inventory Types', () => {
    it('should define inventory item structure', () => {
      const item: InventoryItem = {
        id: 'inv_001',
        type: 'box_medium',
        name: 'Medium Box (30x20x15cm)',
        sku: 'BOX-M-001',
        quantity: 250,
        unit: 'pcs',
        reorderThreshold: 100,
        reorderQuantity: 500,
        costPerUnit: 150,
        currency: 'JPY',
        supplier: {
          name: 'Tokyo Box Co.',
          leadTimeDays: 3,
        },
        usageForecast: {
          dailyAverage: 25,
          weeklyAverage: 175,
          daysUntilEmpty: 10,
        },
      };

      expect(item.type).toBe('box_medium');
      expect(item.usageForecast?.daysUntilEmpty).toBe(10);
    });

    it('should define inventory alert structure', () => {
      const alert: InventoryAlert = {
        id: 'alert_001',
        item: {
          id: 'inv_001',
          type: 'label_roll',
          name: 'Thermal Labels',
          quantity: 50,
          unit: 'rolls',
          reorderThreshold: 100,
          reorderQuantity: 200,
          costPerUnit: 800,
          currency: 'JPY',
        },
        type: 'low_stock',
        severity: 'high',
        message: 'Thermal labels running low - 50 rolls remaining',
        createdAt: '2024-01-15T10:00:00Z',
        acknowledged: false,
      };

      expect(alert.type).toBe('low_stock');
      expect(alert.severity).toBe('high');
    });
  });

  describe('Staff Performance Types', () => {
    it('should define staff performance metrics structure', () => {
      const metrics: StaffPerformanceMetrics = {
        staff: {
          id: 'stf_001',
          name: 'Taro Yamada',
          role: 'staff',
          email: 'taro@example.com',
          active: true,
          startedAt: '2023-01-15',
        },
        period: {
          from: '2024-01-01',
          to: '2024-01-31',
        },
        shipmentsProcessed: 450,
        averageProcessingTime: 120,
        errorRate: 0.02,
        correctionsMade: 9,
        customerComplaints: 1,
        revenueGenerated: {
          amount: 2500000,
          currency: 'JPY',
        },
        hoursWorked: 160,
        productivityScore: 92,
        accuracyScore: 98,
        comparison: {
          processingTime: -5,
          errorRate: -10,
          productivity: 8,
        },
        ranking: {
          position: 2,
          total: 10,
        },
      };

      expect(metrics.productivityScore).toBe(92);
      expect(metrics.ranking.position).toBe(2);
    });
  });

  describe('Profit Margin Types', () => {
    it('should define shipment profit analysis structure', () => {
      const analysis: ShipmentProfitAnalysis = {
        shipmentId: 'ship_001',
        trackingNumber: '123456789',
        createdAt: '2024-01-15T10:00:00Z',
        carrier: 'fedex',
        service: 'International Priority',
        originCountry: 'JP',
        destinationCountry: 'US',
        weight: 2.5,
        costs: {
          carrierCost: 6500,
          packagingCost: 300,
          laborCost: 500,
          processingFees: 200,
          insuranceCost: 100,
          otherCosts: 0,
          totalCost: 7600,
        },
        revenue: {
          shippingCharge: 8500,
          packagingCharge: 500,
          insuranceCharge: 300,
          serviceFees: 0,
          surcharges: 0,
          discounts: 0,
          totalRevenue: 9300,
        },
        grossProfit: 1700,
        profitMargin: 18.28,
      };

      expect(analysis.grossProfit).toBe(1700);
      expect(analysis.profitMargin).toBeCloseTo(18.28);
    });
  });

  describe('Fraud Detection Types', () => {
    it('should define fraud alert structure', () => {
      const alert: FraudAlert = {
        id: 'fraud_001',
        riskLevel: 'high',
        riskScore: 85,
        indicators: [
          {
            type: 'high_value_rapid',
            description: '5 high-value shipments in 10 minutes',
            weight: 0.4,
          },
          {
            type: 'new_account_risk',
            description: 'Account created today',
            weight: 0.3,
          },
        ],
        entityType: 'customer',
        entityId: 'cust_001',
        details: {
          customerId: 'cust_001',
          customerName: 'Suspicious User',
          paymentAmount: 150000,
        },
        createdAt: '2024-01-15T10:30:00Z',
        status: 'pending',
      };

      expect(alert.riskLevel).toBe('high');
      expect(alert.indicators).toHaveLength(2);
    });

    it('should define fraud screening response structure', () => {
      const response: FraudScreeningResponse = {
        riskLevel: 'medium',
        riskScore: 55,
        recommendation: 'review',
        indicators: [
          {
            type: 'velocity_spike',
            description: 'Higher than usual activity',
            weight: 0.25,
          },
        ],
        suggestedActions: [
          'Verify customer identity',
          'Request additional payment verification',
        ],
      };

      expect(response.recommendation).toBe('review');
      expect(response.suggestedActions).toHaveLength(2);
    });
  });
});

describe('System Types', () => {
  describe('Offline Mode Types', () => {
    it('should define pending sync item structure', () => {
      const item: PendingSyncItem = {
        localId: 'local_001',
        entityType: 'shipment',
        operation: 'create',
        data: {
          origin: { country: 'Japan' },
          destination: { country: 'USA' },
        },
        createdAt: '2024-01-15T10:00:00Z',
        modifiedAt: '2024-01-15T10:00:00Z',
        retryCount: 0,
        priority: 1,
      };

      expect(item.operation).toBe('create');
      expect(item.retryCount).toBe(0);
    });

    it('should define sync result structure', () => {
      const result: SyncResult = {
        success: true,
        syncedCount: 10,
        failedCount: 1,
        conflictCount: 0,
        timestamp: '2024-01-15T10:30:00Z',
        failedItems: [
          { localId: 'local_005', error: 'Server error' },
        ],
        remainingPending: 1,
      };

      expect(result.syncedCount).toBe(10);
      expect(result.failedItems).toHaveLength(1);
    });
  });

  describe('Kiosk Mode Types', () => {
    it('should define kiosk session structure', () => {
      const session: KioskSession = {
        id: 'session_001',
        startedAt: '2024-01-15T09:00:00Z',
        lastActivity: '2024-01-15T10:30:00Z',
        operatorId: 'stf_001',
        transactionCount: 25,
        totalRevenue: 350000,
        device: {
          id: 'device_001',
          name: 'Kiosk Terminal 1',
          browser: 'Chrome 120',
          os: 'Windows 11',
          screenResolution: '1920x1080',
        },
      };

      expect(session.transactionCount).toBe(25);
      expect(session.device.browser).toBe('Chrome 120');
    });
  });

  describe('Audit Log Types', () => {
    it('should define audit log entry structure', () => {
      const entry: AuditLogEntry = {
        id: 'log_001',
        timestamp: '2024-01-15T10:30:00Z',
        action: 'update',
        entityType: 'shipment',
        entityId: 'ship_001',
        userId: 'stf_001',
        userName: 'Taro Yamada',
        userRole: 'staff',
        ipAddress: '192.168.1.100',
        sessionId: 'session_001',
        description: 'Updated shipment weight',
        changes: [
          {
            field: 'weight',
            oldValue: 2.5,
            newValue: 3.0,
          },
        ],
        success: true,
        severity: 'info',
        tags: ['weight_correction'],
      };

      expect(entry.action).toBe('update');
      expect(entry.changes).toHaveLength(1);
    });
  });

  describe('System Health Types', () => {
    it('should define system health status structure', () => {
      const status: SystemHealthStatus = {
        status: 'healthy',
        components: [
          { name: 'Database', status: 'healthy', lastCheck: '2024-01-15T10:30:00Z' },
          { name: 'Cache', status: 'healthy', lastCheck: '2024-01-15T10:30:00Z' },
          { name: 'Payment Gateway', status: 'healthy', lastCheck: '2024-01-15T10:30:00Z' },
        ],
        uptime: 864000,
        memory: {
          used: 512 * 1024 * 1024,
          total: 2048 * 1024 * 1024,
          percentage: 25,
        },
        version: {
          sdk: '1.0.0',
          app: '2.1.0',
        },
      };

      expect(status.status).toBe('healthy');
      expect(status.components).toHaveLength(3);
    });
  });
});
