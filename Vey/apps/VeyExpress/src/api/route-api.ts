/**
 * Route API
 * Optimize delivery routes and calculate best paths
 */

import { APIResponse, Route, RouteOptimization, GeoCoordinates, Address } from '../types';

export interface RouteRequest {
  stops: RouteStopRequest[];
  constraints?: RouteConstraints;
  optimize?: 'time' | 'cost' | 'carbon' | 'balanced';
}

export interface RouteStopRequest {
  address: Address;
  coordinates?: GeoCoordinates;
  type: 'pickup' | 'delivery';
  timeWindow?: {
    start: Date;
    end: Date;
  };
  priority?: number;
}

export interface RouteConstraints {
  maxDistance?: number; // km
  maxDuration?: number; // minutes
  vehicleType?: string;
  avoidTolls?: boolean;
  avoidHighways?: boolean;
}

export class RouteAPI {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Calculate optimal route
   */
  async calculateRoute(request: RouteRequest): Promise<APIResponse<Route>> {
    const response = await fetch(`${this.baseUrl}/route/calculate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  /**
   * Optimize existing route
   */
  async optimizeRoute(routeId: string): Promise<APIResponse<RouteOptimization>> {
    const response = await fetch(`${this.baseUrl}/route/${routeId}/optimize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }

  /**
   * Get route alternatives
   */
  async getRouteAlternatives(request: RouteRequest): Promise<APIResponse<Route[]>> {
    const response = await fetch(`${this.baseUrl}/route/alternatives`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }
}
