/**
 * Vehicle and Ship Tracking API
 * Track delivery vehicles and cargo ships in real-time
 */

import { APIResponse, GeoCoordinates } from '../types';

export interface Vehicle {
  id: string;
  type: 'truck' | 'van' | 'car' | 'motorcycle' | 'bicycle';
  licensePlate: string;
  carrier: string;
  driver?: {
    name: string;
    phone: string;
  };
  currentLocation: GeoCoordinates;
  status: 'idle' | 'en_route' | 'delivering' | 'returning' | 'offline';
  capacity: number;
  currentLoad: number;
}

export interface Ship {
  id: string;
  imo: string; // International Maritime Organization number
  name: string;
  type: 'container' | 'bulk' | 'tanker' | 'roro';
  currentLocation: GeoCoordinates;
  destination: {
    port: string;
    eta: Date;
  };
  speed: number; // knots
  heading: number; // degrees
}

export class VehicleTrackingAPI {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Track a vehicle by ID
   */
  async trackVehicle(vehicleId: string): Promise<APIResponse<Vehicle>> {
    const response = await fetch(`${this.baseUrl}/vehicle/${vehicleId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }

  /**
   * Track all vehicles for a carrier
   */
  async trackCarrierVehicles(carrierId: string): Promise<APIResponse<Vehicle[]>> {
    const response = await fetch(`${this.baseUrl}/vehicle/carrier/${carrierId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }

  /**
   * Track a ship by IMO number
   */
  async trackShip(imo: string): Promise<APIResponse<Ship>> {
    const response = await fetch(`${this.baseUrl}/ship/${imo}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }

  /**
   * Get vehicles in a geographic area
   */
  async getVehiclesInArea(
    bounds: {
      northEast: GeoCoordinates;
      southWest: GeoCoordinates;
    }
  ): Promise<APIResponse<Vehicle[]>> {
    const response = await fetch(`${this.baseUrl}/vehicle/area`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bounds),
    });
    return response.json();
  }
}
