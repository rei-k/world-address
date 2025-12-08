/**
 * Delivery Flow Orchestration
 * 
 * Manages the complete delivery lifecycle from request to completion,
 * including carrier selection, waybill generation, tracking, and completion.
 */

import { ZKPIntegration, type AddressRegistration, type CarrierAccess } from './zkp-integration';
import { ConveyProtocol, type DeliveryRequest, type DeliveryResponse } from './convey-protocol';
import { hashSHA256, generateSecureNonce } from '../../../sdk/core/src/zkp-crypto';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface Carrier {
  /** Carrier ID */
  id: string;
  /** Carrier name */
  name: string;
  /** Carrier DID */
  did: string;
  /** Supported countries */
  countries: string[];
  /** Supported services */
  services: {
    standard: boolean;
    express: boolean;
    overnight: boolean;
    international: boolean;
  };
}

export interface ShippingQuote {
  /** Carrier providing the quote */
  carrier: Carrier;
  /** Service level */
  service: 'standard' | 'express' | 'overnight';
  /** Price */
  price: number;
  /** Currency */
  currency: string;
  /** Estimated delivery days */
  estimatedDays: number;
  /** Estimated delivery date */
  estimatedDeliveryDate: string;
  /** Quote valid until */
  validUntil: string;
}

export interface Waybill {
  /** Waybill number (tracking number) */
  number: string;
  /** Carrier */
  carrier: Carrier;
  /** Service level */
  service: string;
  /** Sender information (ConveyID only, no address) */
  sender: {
    conveyId: string;
    name?: string;
  };
  /** Recipient information (ConveyID only, no address) */
  recipient: {
    conveyId: string;
    name?: string;
  };
  /** Package details */
  package: {
    weight: number;
    dimensions: { length: number; width: number; height: number };
    value: number;
    currency: string;
  };
  /** ZKP proof for address validation */
  zkpProof: {
    type: string;
    commitment: string;
  };
  /** Status */
  status: 'created' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';
  /** Timestamps */
  createdAt: string;
  estimatedDeliveryAt: string;
  deliveredAt?: string;
}

export interface TrackingEvent {
  /** Event ID */
  id: string;
  /** Waybill number */
  waybillNumber: string;
  /** Event type */
  type: 'created' | 'picked_up' | 'in_transit' | 'arrived_at_facility' | 'out_for_delivery' | 'delivered' | 'exception';
  /** Event description */
  description: string;
  /** Location (city/facility, not full address) */
  location?: string;
  /** Timestamp */
  timestamp: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

export interface DeliveryCompletion {
  /** Waybill number */
  waybillNumber: string;
  /** Delivery status */
  status: 'delivered' | 'failed';
  /** Delivered at timestamp */
  deliveredAt: string;
  /** Recipient signature (if collected) */
  signature?: string;
  /** Photo proof of delivery */
  photoUrl?: string;
  /** Final location */
  location?: string;
  /** Notes */
  notes?: string;
}

// ============================================================================
// DeliveryFlow Class
// ============================================================================

export class DeliveryFlow {
  private zkpIntegration: ZKPIntegration;
  private conveyProtocol: ConveyProtocol;
  private carriers: Map<string, Carrier> = new Map();
  private waybills: Map<string, Waybill> = new Map();
  private trackingEvents: Map<string, TrackingEvent[]> = new Map();

  constructor(zkpIntegration: ZKPIntegration, conveyProtocol: ConveyProtocol) {
    this.zkpIntegration = zkpIntegration;
    this.conveyProtocol = conveyProtocol;
    this.initializeCarriers();
  }

  /**
   * Initialize default carriers
   */
  private initializeCarriers(): void {
    const defaultCarriers: Carrier[] = [
      {
        id: 'vey-express',
        name: 'Vey Express',
        did: 'did:vey:carrier:vey-express',
        countries: ['JP', 'US', 'GB', 'FR', 'DE', 'CN', 'KR'],
        services: {
          standard: true,
          express: true,
          overnight: true,
          international: true,
        },
      },
      {
        id: 'japan-post',
        name: 'Japan Post',
        did: 'did:vey:carrier:japan-post',
        countries: ['JP'],
        services: {
          standard: true,
          express: true,
          overnight: false,
          international: true,
        },
      },
      {
        id: 'yamato',
        name: 'Yamato Transport',
        did: 'did:vey:carrier:yamato',
        countries: ['JP'],
        services: {
          standard: true,
          express: true,
          overnight: true,
          international: false,
        },
      },
    ];

    for (const carrier of defaultCarriers) {
      this.carriers.set(carrier.id, carrier);
    }
  }

  /**
   * Get shipping quotes from multiple carriers
   */
  async getShippingQuotes(
    fromPid: string,
    toPid: string,
    packageDetails: Waybill['package']
  ): Promise<ShippingQuote[]> {
    // Extract country codes from PIDs
    const fromCountry = fromPid.split('-')[0];
    const toCountry = toPid.split('-')[0];

    const quotes: ShippingQuote[] = [];

    // Get quotes from each carrier that supports the route
    for (const carrier of this.carriers.values()) {
      if (!carrier.countries.includes(toCountry)) {
        continue;
      }

      const isInternational = fromCountry !== toCountry;
      if (isInternational && !carrier.services.international) {
        continue;
      }

      // Calculate pricing (simplified algorithm)
      const basePrice = this.calculateBasePrice(packageDetails, isInternational);
      const distance = this.estimateDistance(fromPid, toPid);

      // Add quotes for each service level
      if (carrier.services.standard) {
        quotes.push({
          carrier,
          service: 'standard',
          price: basePrice,
          currency: 'JPY',
          estimatedDays: Math.ceil(distance / 500) + 2,
          estimatedDeliveryDate: new Date(Date.now() + (Math.ceil(distance / 500) + 2) * 24 * 60 * 60 * 1000).toISOString(),
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      if (carrier.services.express) {
        quotes.push({
          carrier,
          service: 'express',
          price: basePrice * 1.5,
          currency: 'JPY',
          estimatedDays: Math.ceil(distance / 1000) + 1,
          estimatedDeliveryDate: new Date(Date.now() + (Math.ceil(distance / 1000) + 1) * 24 * 60 * 60 * 1000).toISOString(),
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      if (carrier.services.overnight && !isInternational) {
        quotes.push({
          carrier,
          service: 'overnight',
          price: basePrice * 2.5,
          currency: 'JPY',
          estimatedDays: 1,
          estimatedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }

    // Sort by price (cheapest first)
    return quotes.sort((a, b) => a.price - b.price);
  }

  /**
   * Create waybill for delivery
   */
  async createWaybill(
    deliveryRequest: DeliveryRequest,
    deliveryResponse: DeliveryResponse,
    selectedQuote: ShippingQuote
  ): Promise<Waybill> {
    // Generate waybill number
    const waybillNumber = this.generateWaybillNumber(selectedQuote.carrier.id);

    // Create waybill
    const waybill: Waybill = {
      number: waybillNumber,
      carrier: selectedQuote.carrier,
      service: selectedQuote.service,
      sender: {
        conveyId: deliveryRequest.from.full,
      },
      recipient: {
        conveyId: deliveryRequest.to.full,
      },
      package: deliveryRequest.package,
      zkpProof: {
        type: deliveryResponse.zkpProof?.type || 'unknown',
        commitment: deliveryResponse.zkpProof?.publicSignals?.[0] || '',
      },
      status: 'created',
      createdAt: new Date().toISOString(),
      estimatedDeliveryAt: selectedQuote.estimatedDeliveryDate,
    };

    // Store waybill
    this.waybills.set(waybillNumber, waybill);

    // Create initial tracking event
    await this.addTrackingEvent(waybillNumber, {
      type: 'created',
      description: 'Waybill created',
      timestamp: waybill.createdAt,
    });

    return waybill;
  }

  /**
   * Grant carrier access to recipient's address
   */
  async grantCarrierAccess(
    waybillNumber: string,
    recipientPid: string,
    recipientAddress: AddressRegistration['fullAddress']
  ): Promise<CarrierAccess> {
    const waybill = this.waybills.get(waybillNumber);
    if (!waybill) {
      throw new Error(`Waybill not found: ${waybillNumber}`);
    }

    // Grant carrier access to full address for delivery
    const carrierAccess = await this.zkpIntegration.grantCarrierAccess(
      waybillNumber,
      waybill.carrier.did,
      recipientPid,
      recipientAddress
    );

    // Add tracking event
    await this.addTrackingEvent(waybillNumber, {
      type: 'picked_up',
      description: 'Package picked up by carrier',
      timestamp: new Date().toISOString(),
    });

    // Update waybill status
    waybill.status = 'in_transit';
    this.waybills.set(waybillNumber, waybill);

    return carrierAccess;
  }

  /**
   * Add tracking event
   */
  async addTrackingEvent(
    waybillNumber: string,
    event: Omit<TrackingEvent, 'id' | 'waybillNumber'>
  ): Promise<TrackingEvent> {
    const trackingEvent: TrackingEvent = {
      id: hashSHA256(`${waybillNumber}:${event.timestamp}:${generateSecureNonce()}`),
      waybillNumber,
      ...event,
    };

    // Get or create event list for this waybill
    const events = this.trackingEvents.get(waybillNumber) || [];
    events.push(trackingEvent);
    this.trackingEvents.set(waybillNumber, events);

    // Update waybill status based on event type
    const waybill = this.waybills.get(waybillNumber);
    if (waybill) {
      switch (event.type) {
        case 'out_for_delivery':
          waybill.status = 'out_for_delivery';
          break;
        case 'delivered':
          waybill.status = 'delivered';
          waybill.deliveredAt = event.timestamp;
          break;
        case 'exception':
          waybill.status = 'failed';
          break;
      }
      this.waybills.set(waybillNumber, waybill);
    }

    return trackingEvent;
  }

  /**
   * Get tracking information
   */
  getTracking(waybillNumber: string): {
    waybill: Waybill;
    events: TrackingEvent[];
  } {
    const waybill = this.waybills.get(waybillNumber);
    if (!waybill) {
      throw new Error(`Waybill not found: ${waybillNumber}`);
    }

    const events = this.trackingEvents.get(waybillNumber) || [];

    return { waybill, events };
  }

  /**
   * Complete delivery
   */
  async completeDelivery(
    waybillNumber: string,
    completion: Omit<DeliveryCompletion, 'waybillNumber'>
  ): Promise<DeliveryCompletion> {
    const waybill = this.waybills.get(waybillNumber);
    if (!waybill) {
      throw new Error(`Waybill not found: ${waybillNumber}`);
    }

    // Add final tracking event
    await this.addTrackingEvent(waybillNumber, {
      type: completion.status === 'delivered' ? 'delivered' : 'exception',
      description: completion.status === 'delivered' 
        ? 'Package delivered successfully'
        : `Delivery failed: ${completion.notes || 'Unknown reason'}`,
      location: completion.location,
      timestamp: completion.deliveredAt,
    });

    // Return completion details
    return {
      waybillNumber,
      ...completion,
    };
  }

  /**
   * Get all waybills
   */
  getAllWaybills(): Waybill[] {
    return Array.from(this.waybills.values());
  }

  /**
   * Get waybills by status
   */
  getWaybillsByStatus(status: Waybill['status']): Waybill[] {
    return Array.from(this.waybills.values()).filter(w => w.status === status);
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Calculate base price for shipping
   */
  private calculateBasePrice(packageDetails: Waybill['package'], isInternational: boolean): number {
    const { weight, dimensions } = packageDetails;
    
    // Calculate volumetric weight
    const volumetricWeight = (dimensions.length * dimensions.width * dimensions.height) / 5000;
    const chargeableWeight = Math.max(weight, volumetricWeight);

    // Base rate per kg
    const baseRate = isInternational ? 1500 : 800;
    
    // Calculate price
    let price = chargeableWeight * baseRate;

    // Add handling fee for declared value
    if (packageDetails.value > 10000) {
      price += packageDetails.value * 0.01; // 1% of value
    }

    return Math.round(price);
  }

  /**
   * Estimate distance between two PIDs (simplified)
   */
  private estimateDistance(fromPid: string, toPid: string): number {
    // In production, this would use actual geocoding
    // For demo, return a random distance based on PID similarity
    const fromParts = fromPid.split('-');
    const toParts = toPid.split('-');

    // Same country
    if (fromParts[0] !== toParts[0]) {
      return 5000; // International: ~5000km
    }

    // Same admin1 (province/state)
    if (fromParts[1] !== toParts[1]) {
      return 500; // Different province: ~500km
    }

    // Same admin2 (city)
    if (fromParts[2] !== toParts[2]) {
      return 50; // Different city: ~50km
    }

    // Same locality
    return 5; // Same area: ~5km
  }

  /**
   * Generate waybill number
   */
  private generateWaybillNumber(carrierId: string): string {
    const prefix = carrierId.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Create DeliveryFlow instance
 */
export function createDeliveryFlow(zkpIntegration: ZKPIntegration, conveyProtocol: ConveyProtocol): DeliveryFlow {
  return new DeliveryFlow(zkpIntegration, conveyProtocol);
}

/**
 * Complete delivery workflow helper
 */
export async function executeCompleteDeliveryWorkflow(
  deliveryFlow: DeliveryFlow,
  deliveryRequest: DeliveryRequest,
  deliveryResponse: DeliveryResponse,
  recipientAddress: AddressRegistration
): Promise<{
  quotes: ShippingQuote[];
  selectedQuote: ShippingQuote;
  waybill: Waybill;
  carrierAccess: CarrierAccess;
}> {
  // 1. Get shipping quotes
  const quotes = await deliveryFlow.getShippingQuotes(
    'JP-13-113-01', // Sender PID (would come from sender's address)
    deliveryResponse.selectedAddress?.pid || '',
    deliveryRequest.package
  );

  if (quotes.length === 0) {
    throw new Error('No carriers available for this route');
  }

  // 2. Select cheapest quote
  const selectedQuote = quotes[0];

  // 3. Create waybill
  const waybill = await deliveryFlow.createWaybill(deliveryRequest, deliveryResponse, selectedQuote);

  // 4. Grant carrier access to address
  const carrierAccess = await deliveryFlow.grantCarrierAccess(
    waybill.number,
    deliveryResponse.selectedAddress?.pid || '',
    recipientAddress.fullAddress
  );

  return {
    quotes,
    selectedQuote,
    waybill,
    carrierAccess,
  };
}

export default DeliveryFlow;
