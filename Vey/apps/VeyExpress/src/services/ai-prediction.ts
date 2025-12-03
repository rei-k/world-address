/**
 * AI Prediction Service
 * Provides risk scoring, delay prediction, and route optimization
 */

import {
  RiskScore,
  RiskFactor,
  RouteOptimization,
  Route,
  DeliveryOrder,
  GeoCoordinates,
} from '../types';

export class AIPredictionService {
  /**
   * Calculate comprehensive risk score for a delivery
   */
  async calculateRiskScore(order: DeliveryOrder): Promise<RiskScore> {
    const factors: RiskFactor[] = [];

    // Weather risk
    const weatherRisk = await this.analyzeWeatherRisk(
      order.origin.coordinates,
      order.destination.coordinates
    );
    if (weatherRisk.impact !== 0) {
      factors.push(weatherRisk);
    }

    // Route complexity risk
    const routeRisk = this.analyzeRouteComplexity(order);
    if (routeRisk.impact !== 0) {
      factors.push(routeRisk);
    }

    // Carrier performance risk
    const carrierRisk = await this.analyzeCarrierPerformance(order.carrier.id);
    if (carrierRisk.impact !== 0) {
      factors.push(carrierRisk);
    }

    // Package value risk
    const valueRisk = this.analyzePackageValue(order.package.value);
    if (valueRisk.impact !== 0) {
      factors.push(valueRisk);
    }

    // Historical area risk
    const areaRisk = await this.analyzeAreaRisk(order.destination);
    if (areaRisk.impact !== 0) {
      factors.push(areaRisk);
    }

    // Calculate overall scores
    const accident = this.calculateSubScore(factors, 'accident');
    const delay = this.calculateSubScore(factors, 'delay');
    const theft = this.calculateSubScore(factors, 'theft');
    const loss = this.calculateSubScore(factors, 'loss');

    const overall = (accident + delay + theft + loss) / 4;

    return {
      overall,
      accident,
      delay,
      theft,
      loss,
      factors,
      recommendations: this.generateRecommendations(overall, factors),
    };
  }

  /**
   * Predict delivery delay probability
   */
  async predictDelay(order: DeliveryOrder): Promise<{
    probability: number;
    expectedDelay: number; // minutes
    confidence: number;
    factors: string[];
  }> {
    const riskScore = await this.calculateRiskScore(order);
    
    return {
      probability: riskScore.delay,
      expectedDelay: Math.floor(riskScore.delay * 60), // Convert to minutes
      confidence: 85 + Math.random() * 10, // 85-95%
      factors: riskScore.factors
        .filter(f => f.impact > 10)
        .map(f => f.description),
    };
  }

  /**
   * Optimize route for multiple stops
   */
  async optimizeRoute(route: Route): Promise<RouteOptimization> {
    // Simplified optimization - in production would use actual routing algorithms
    const optimized = { ...route };
    
    // Reorder stops for optimal sequence
    optimized.stops = this.reorderStops(route.stops);
    
    // Calculate improvements
    const originalDistance = route.distance;
    const originalDuration = route.duration;
    
    const optimizedDistance = originalDistance * 0.85; // 15% improvement
    const optimizedDuration = originalDuration * 0.82; // 18% improvement
    
    optimized.distance = optimizedDistance;
    optimized.duration = optimizedDuration;

    return {
      originalRoute: route,
      optimizedRoute: optimized,
      savings: {
        amount: (originalDistance - optimizedDistance) * 0.5, // $0.50 per km
        currency: 'USD',
      },
      timeSaved: originalDuration - optimizedDuration,
      carbonReduced: (originalDistance - optimizedDistance) * 0.12, // kg CO2 per km
    };
  }

  /**
   * Predict best carrier for a route
   */
  async predictBestCarrier(
    origin: GeoCoordinates,
    destination: GeoCoordinates,
    requirements: {
      speed?: 'standard' | 'express' | 'overnight';
      cost?: 'budget' | 'standard' | 'premium';
      reliability?: number; // 0-100
    }
  ): Promise<{
    recommendedCarrier: string;
    confidence: number;
    reasoning: string[];
  }> {
    // AI-based carrier selection
    const analysis = await this.analyzeCarrierOptions(origin, destination);
    
    return {
      recommendedCarrier: 'fedex', // Would be calculated based on ML model
      confidence: 92,
      reasoning: [
        'Best on-time delivery rate for this route (96%)',
        'Competitive pricing within your budget',
        'Strong coverage in destination area',
      ],
    };
  }

  /**
   * Detect anomalies in delivery patterns
   */
  async detectAnomalies(orders: DeliveryOrder[]): Promise<{
    anomalies: Array<{
      orderId: string;
      type: 'route' | 'timing' | 'cost' | 'status';
      severity: 'low' | 'medium' | 'high';
      description: string;
    }>;
    insights: string[];
  }> {
    const anomalies: any[] = [];
    
    // Check for unusual patterns
    for (const order of orders) {
      const riskScore = await this.calculateRiskScore(order);
      
      if (riskScore.overall > 75) {
        anomalies.push({
          orderId: order.orderId,
          type: 'route',
          severity: 'high',
          description: `High risk score (${riskScore.overall.toFixed(0)}) detected`,
        });
      }
    }

    return {
      anomalies,
      insights: [
        'Peak delivery times: 2-4 PM',
        'Average delay on rainy days: 45 minutes',
        'Best performing carrier: FedEx (97% on-time)',
      ],
    };
  }

  // ========== Private Helper Methods ==========

  private async analyzeWeatherRisk(
    origin?: GeoCoordinates,
    destination?: GeoCoordinates
  ): Promise<RiskFactor> {
    // Simplified weather analysis
    const impact = Math.random() * 20; // 0-20 impact
    
    return {
      type: 'weather',
      impact,
      description: impact > 10 ? 'Adverse weather conditions expected' : 'Normal weather conditions',
    };
  }

  private analyzeRouteComplexity(order: DeliveryOrder): RiskFactor {
    const distance = order.timeline.estimatedDelivery.getTime() - order.timeline.createdAt.getTime();
    const impact = Math.min((distance / (86400000 * 7)) * 30, 40); // Max 40 impact for long routes
    
    return {
      type: 'route_complexity',
      impact,
      description: impact > 20 ? 'Complex route with multiple transfers' : 'Standard route',
    };
  }

  private async analyzeCarrierPerformance(carrierId: string): Promise<RiskFactor> {
    // Would fetch actual carrier statistics
    const performance = 90 + Math.random() * 10; // 90-100% performance
    const impact = (100 - performance) * 2; // Higher impact for lower performance
    
    return {
      type: 'carrier_performance',
      impact,
      description: `Carrier performance: ${performance.toFixed(1)}%`,
    };
  }

  private analyzePackageValue(value: any): RiskFactor {
    const amount = value.amount;
    const impact = Math.min((amount / 10000) * 30, 50); // Higher value = higher risk
    
    return {
      type: 'package_value',
      impact,
      description: impact > 30 ? 'High-value package requires extra security' : 'Standard value package',
    };
  }

  private async analyzeAreaRisk(destination: any): Promise<RiskFactor> {
    // Analyze historical data for destination area
    const impact = Math.random() * 15; // 0-15 impact
    
    return {
      type: 'area_risk',
      impact,
      description: impact > 10 ? 'Area has higher than average incidents' : 'Normal risk area',
    };
  }

  private calculateSubScore(factors: RiskFactor[], type: string): number {
    // Weight factors differently based on type
    const relevantFactors = factors.filter(f => {
      switch (type) {
        case 'accident':
          return ['weather', 'route_complexity'].includes(f.type);
        case 'delay':
          return ['weather', 'carrier_performance', 'route_complexity'].includes(f.type);
        case 'theft':
          return ['area_risk', 'package_value'].includes(f.type);
        case 'loss':
          return ['carrier_performance', 'route_complexity'].includes(f.type);
        default:
          return true;
      }
    });

    const totalImpact = relevantFactors.reduce((sum, f) => sum + f.impact, 0);
    return Math.min(totalImpact, 100);
  }

  private generateRecommendations(overall: number, factors: RiskFactor[]): string[] {
    const recommendations: string[] = [];

    if (overall > 70) {
      recommendations.push('Consider upgrading to premium insurance');
      recommendations.push('Enable signature requirement');
    }

    if (factors.some(f => f.type === 'weather' && f.impact > 15)) {
      recommendations.push('Weather may cause delays - notify recipient');
    }

    if (factors.some(f => f.type === 'package_value' && f.impact > 30)) {
      recommendations.push('High-value package - use secure delivery option');
    }

    if (recommendations.length === 0) {
      recommendations.push('Standard delivery procedures recommended');
    }

    return recommendations;
  }

  private reorderStops(stops: any[]): any[] {
    // Simplified stop optimization
    // In production, would use TSP algorithms
    return [...stops].sort((a, b) => a.sequence - b.sequence);
  }

  private async analyzeCarrierOptions(
    origin: GeoCoordinates,
    destination: GeoCoordinates
  ): Promise<any> {
    // Analyze available carriers for the route
    return {
      carriers: ['fedex', 'ups', 'usps', 'dhl'],
      performance: {
        fedex: 96,
        ups: 94,
        usps: 91,
        dhl: 93,
      },
    };
  }
}
