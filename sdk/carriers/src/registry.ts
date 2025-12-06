/**
 * Carrier Registry
 * Central registry for managing multiple carrier adapters
 * 
 * Features:
 * - Dynamic carrier registration
 * - Carrier discovery and selection
 * - Performance monitoring
 * - Automatic fallback
 */

import { CarrierAdapter } from './adapters/base';
import {
  Shipment,
  ValidationResult,
  PickupOrder,
  OrderResult,
  TrackingInfo,
  CancelResult,
  CarrierConfig
} from './types';

/**
 * Carrier metadata
 */
export interface CarrierMetadata {
  id: string;
  name: string;
  code: string;
  regions: string[]; // Supported country codes
  services: string[]; // STANDARD, EXPRESS, ECONOMY
  features: {
    tracking: boolean;
    pickup: boolean;
    international: boolean;
    insurance: boolean;
    cashOnDelivery: boolean;
  };
  pricing: {
    currency: string;
    domesticBase: number;
    internationalBase: number;
  };
}

/**
 * Carrier performance metrics
 */
export interface CarrierPerformance {
  carrierId: string;
  successRate: number;
  avgResponseTime: number; // milliseconds
  totalRequests: number;
  failedRequests: number;
  lastUpdated: Date;
}

/**
 * Carrier selection criteria
 */
export interface CarrierSelectionCriteria {
  origin: string; // Country code
  destination: string; // Country code
  serviceType?: 'STANDARD' | 'EXPRESS' | 'ECONOMY';
  maxCost?: number;
  maxDeliveryDays?: number;
  requiredFeatures?: string[]; // e.g., ['insurance', 'tracking']
}

/**
 * Carrier recommendation
 */
export interface CarrierRecommendation {
  carrierId: string;
  carrierName: string;
  score: number; // 0-100
  estimatedCost: number;
  estimatedDays: number;
  confidence: number; // 0-100
  reasons: string[];
}

/**
 * Carrier Registry
 */
export class CarrierRegistry {
  private adapters: Map<string, CarrierAdapter>;
  private metadata: Map<string, CarrierMetadata>;
  private configs: Map<string, CarrierConfig>;
  private performance: Map<string, CarrierPerformance>;

  constructor() {
    this.adapters = new Map();
    this.metadata = new Map();
    this.configs = new Map();
    this.performance = new Map();
  }

  /**
   * Register a carrier adapter
   */
  registerCarrier(
    metadata: CarrierMetadata,
    adapter: CarrierAdapter,
    config: CarrierConfig
  ): void {
    this.metadata.set(metadata.id, metadata);
    this.adapters.set(metadata.id, adapter);
    this.configs.set(metadata.id, config);
    
    // Initialize performance tracking
    this.performance.set(metadata.id, {
      carrierId: metadata.id,
      successRate: 100,
      avgResponseTime: 0,
      totalRequests: 0,
      failedRequests: 0,
      lastUpdated: new Date()
    });
  }

  /**
   * Unregister a carrier
   */
  unregisterCarrier(carrierId: string): boolean {
    const deleted = this.adapters.delete(carrierId);
    this.metadata.delete(carrierId);
    this.configs.delete(carrierId);
    this.performance.delete(carrierId);
    return deleted;
  }

  /**
   * Get carrier adapter by ID
   */
  getCarrier(carrierId: string): CarrierAdapter | undefined {
    return this.adapters.get(carrierId);
  }

  /**
   * Get carrier metadata
   */
  getCarrierMetadata(carrierId: string): CarrierMetadata | undefined {
    return this.metadata.get(carrierId);
  }

  /**
   * List all registered carriers
   */
  listCarriers(filter?: {
    region?: string;
    service?: string;
    feature?: string;
  }): CarrierMetadata[] {
    let carriers = Array.from(this.metadata.values());

    if (filter?.region) {
      carriers = carriers.filter(c => c.regions.includes(filter.region!));
    }

    if (filter?.service) {
      carriers = carriers.filter(c => c.services.includes(filter.service!));
    }

    if (filter?.feature) {
      carriers = carriers.filter(c => 
        c.features[filter.feature as keyof typeof c.features] === true
      );
    }

    return carriers;
  }

  /**
   * Find carriers that support a route
   */
  findCarriersForRoute(origin: string, destination: string): CarrierMetadata[] {
    // Normalize country codes to uppercase for comparison
    const normalizedOrigin = origin.toUpperCase();
    const normalizedDestination = destination.toUpperCase();
    const isInternational = normalizedOrigin !== normalizedDestination;
    
    return Array.from(this.metadata.values()).filter(carrier => {
      const supportsOrigin = carrier.regions.some(r => r.toUpperCase() === normalizedOrigin);
      const supportsDestination = carrier.regions.some(r => r.toUpperCase() === normalizedDestination);
      const supportsInternational = carrier.features.international;

      if (isInternational) {
        return supportsOrigin && supportsDestination && supportsInternational;
      } else {
        return supportsOrigin;
      }
    });
  }

  /**
   * Get carrier recommendations based on criteria
   */
  async getRecommendations(
    shipment: Shipment,
    criteria?: CarrierSelectionCriteria
  ): Promise<CarrierRecommendation[]> {
    const origin = shipment.sender.address.country;
    const destination = shipment.recipient.address.country;
    
    const availableCarriers = this.findCarriersForRoute(origin, destination);
    const recommendations: CarrierRecommendation[] = [];

    for (const carrier of availableCarriers) {
      const adapter = this.adapters.get(carrier.id);
      if (!adapter) continue;

      try {
        // Get quote and validation
        const [quote, validation] = await Promise.all([
          adapter.getQuote(shipment),
          adapter.validateShipment(shipment)
        ]);

        if (!validation.deliverable) continue;

        // Apply criteria filters
        if (criteria?.maxCost && quote.amount > criteria.maxCost) continue;
        if (criteria?.maxDeliveryDays && quote.estimatedDays > criteria.maxDeliveryDays) continue;
        
        if (criteria?.requiredFeatures) {
          const hasAllFeatures = criteria.requiredFeatures.every(
            feature => carrier.features[feature as keyof typeof carrier.features]
          );
          if (!hasAllFeatures) continue;
        }

        // Calculate recommendation score
        const performance = this.performance.get(carrier.id)!;
        const score = this.calculateScore(quote, validation, performance, criteria);

        recommendations.push({
          carrierId: carrier.id,
          carrierName: carrier.name,
          score,
          estimatedCost: quote.amount,
          estimatedDays: quote.estimatedDays,
          confidence: performance.successRate,
          reasons: this.generateReasons(quote, validation, performance)
        });
      } catch (error) {
        console.warn(`Failed to get recommendation from ${carrier.name}:`, error);
      }
    }

    // Sort by score (descending)
    return recommendations.sort((a, b) => b.score - a.score);
  }

  /**
   * Create shipment with automatic carrier selection
   */
  async createShipmentWithBestCarrier(
    shipment: Shipment,
    order: PickupOrder,
    criteria?: CarrierSelectionCriteria
  ): Promise<{ result: OrderResult; carrierId: string; carrierName: string }> {
    const recommendations = await this.getRecommendations(shipment, criteria);
    
    if (recommendations.length === 0) {
      throw new Error('No suitable carriers found for this shipment');
    }

    // Try carriers in order of recommendation score
    for (const recommendation of recommendations) {
      const adapter = this.adapters.get(recommendation.carrierId);
      if (!adapter) continue;

      try {
        const startTime = Date.now();
        const result = await adapter.createPickupOrder(order);
        const duration = Date.now() - startTime;

        // Update performance metrics
        this.updatePerformanceMetrics(recommendation.carrierId, duration, true);

        return {
          result,
          carrierId: recommendation.carrierId,
          carrierName: recommendation.carrierName
        };
      } catch (error) {
        console.warn(`Failed to create shipment with ${recommendation.carrierName}:`, error);
        this.updatePerformanceMetrics(recommendation.carrierId, 0, false);
      }
    }

    throw new Error('All carriers failed to create shipment');
  }

  /**
   * Batch validate shipments across multiple carriers
   */
  async validateShipmentBatch(
    shipments: Shipment[]
  ): Promise<Map<string, Map<string, ValidationResult>>> {
    const results = new Map<string, Map<string, ValidationResult>>();

    for (const shipment of shipments) {
      const shipmentId = this.generateShipmentId(shipment);
      const carrierResults = new Map<string, ValidationResult>();

      const carriers = this.findCarriersForRoute(
        shipment.sender.address.country,
        shipment.recipient.address.country
      );

      const validations = await Promise.allSettled(
        carriers.map(async carrier => {
          const adapter = this.adapters.get(carrier.id);
          if (!adapter) return null;
          
          const result = await adapter.validateShipment(shipment);
          return { carrierId: carrier.id, result };
        })
      );

      validations.forEach(v => {
        if (v.status === 'fulfilled' && v.value) {
          carrierResults.set(v.value.carrierId, v.value.result);
        }
      });

      results.set(shipmentId, carrierResults);
    }

    return results;
  }

  /**
   * Get performance metrics for all carriers
   */
  getPerformanceMetrics(): CarrierPerformance[] {
    return Array.from(this.performance.values())
      .sort((a, b) => b.successRate - a.successRate);
  }

  /**
   * Get performance metrics for specific carrier
   */
  getCarrierPerformance(carrierId: string): CarrierPerformance | undefined {
    return this.performance.get(carrierId);
  }

  /**
   * Reset performance metrics for a carrier
   */
  resetPerformanceMetrics(carrierId: string): void {
    this.performance.set(carrierId, {
      carrierId,
      successRate: 100,
      avgResponseTime: 0,
      totalRequests: 0,
      failedRequests: 0,
      lastUpdated: new Date()
    });
  }

  // ========== Private Helper Methods ==========

  /**
   * Calculate recommendation score
   */
  private calculateScore(
    quote: { amount: number; estimatedDays: number },
    validation: ValidationResult,
    performance: CarrierPerformance,
    criteria?: CarrierSelectionCriteria
  ): number {
    let score = 0;

    // Performance score (40%)
    score += performance.successRate * 0.4;

    // Cost score (30%)
    if (criteria?.maxCost) {
      const costRatio = 1 - (quote.amount / criteria.maxCost);
      score += Math.max(0, costRatio * 30);
    } else {
      score += 30; // Default if no cost criteria
    }

    // Speed score (20%)
    if (criteria?.maxDeliveryDays) {
      const speedRatio = 1 - (quote.estimatedDays / criteria.maxDeliveryDays);
      score += Math.max(0, speedRatio * 20);
    } else {
      const speedScore = Math.max(0, (7 - quote.estimatedDays) / 7 * 20);
      score += speedScore;
    }

    // Validation score (10%)
    score += validation.valid ? 10 : 0;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Generate recommendation reasons
   */
  private generateReasons(
    quote: { amount: number; estimatedDays: number },
    validation: ValidationResult,
    performance: CarrierPerformance
  ): string[] {
    const reasons: string[] = [];

    if (performance.successRate >= 95) {
      reasons.push('High reliability');
    }

    if (quote.estimatedDays <= 2) {
      reasons.push('Fast delivery');
    }

    if (performance.avgResponseTime < 1000) {
      reasons.push('Quick API response');
    }

    if (validation.estimatedCost && validation.estimatedCost.amount === quote.amount) {
      reasons.push('Accurate pricing');
    }

    return reasons;
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(
    carrierId: string,
    responseTime: number,
    success: boolean
  ): void {
    const metrics = this.performance.get(carrierId);
    if (!metrics) return;

    const totalRequests = metrics.totalRequests + 1;
    const failedRequests = metrics.failedRequests + (success ? 0 : 1);
    const successRate = ((totalRequests - failedRequests) / totalRequests) * 100;
    const avgResponseTime = success
      ? (metrics.avgResponseTime * metrics.totalRequests + responseTime) / totalRequests
      : metrics.avgResponseTime;

    this.performance.set(carrierId, {
      ...metrics,
      successRate,
      avgResponseTime,
      totalRequests,
      failedRequests,
      lastUpdated: new Date()
    });
  }

  /**
   * Generate unique shipment ID
   */
  private generateShipmentId(shipment: Shipment): string {
    return `${shipment.sender.address.country}-${shipment.recipient.address.country}-${Date.now()}`;
  }
}

/**
 * Global carrier registry instance
 */
export const globalCarrierRegistry = new CarrierRegistry();
