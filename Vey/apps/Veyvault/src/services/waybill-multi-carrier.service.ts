/**
 * Enhanced Waybill Service with Multi-Carrier Support
 * Integrates world-class carrier adapters with Veyvault
 * 
 * Features:
 * - Smart carrier selection based on route and requirements
 * - Automatic carrier failover
 * - Multi-carrier rate comparison
 * - Standardized waybill format conversion
 * - Performance monitoring across carriers
 */

import type {
  Waybill,
  CreateWaybillRequest,
  Carrier,
  DeliveryRequest,
  SubmitDeliveryRequest,
  Address,
} from '../types';

// Import SDK carrier components
import {
  globalCarrierRegistry,
  CarrierFactory,
  StandardWaybillFormat,
  WaybillFormatConverter,
  Shipment,
  CarrierSelectionCriteria
} from '../../../../../sdk/carriers/src';

/**
 * Initialize global carriers from environment
 */
export function initializeGlobalCarriers(): void {
  try {
    CarrierFactory.initializeFromEnv(globalCarrierRegistry);
    console.log('Global carriers initialized successfully');
  } catch (error) {
    console.error('Failed to initialize global carriers:', error);
  }
}

/**
 * Convert Vey Address to Carrier Address format
 */
function convertVeyAddressToCarrierAddress(address: Address): any {
  return {
    country: address.pid.split('/')[0] || 'JP', // Extract from PID
    province: '', // Extract from encrypted data
    city: '', // Extract from encrypted data
    street: '', // Extract from encrypted data
    postalCode: '', // Extract from encrypted data
    building: '',
  };
}

/**
 * Convert Vey Waybill to Standard Shipment format
 */
function convertWaybillToShipment(
  waybill: Waybill,
  senderAddress: Address,
  recipientAddress: Address
): Shipment {
  const senderCarrierAddress = convertVeyAddressToCarrierAddress(senderAddress);
  const recipientCarrierAddress = convertVeyAddressToCarrierAddress(recipientAddress);

  return {
    sender: {
      name: 'Sender', // Get from user data
      phone: '', // Get from user data
      address: senderCarrierAddress
    },
    recipient: {
      name: 'Recipient', // Get from user data
      phone: '', // Get from user data
      address: recipientCarrierAddress
    },
    items: waybill.packageInfo ? [
      {
        name: waybill.packageInfo.description || 'Package',
        quantity: 1,
        weight: waybill.packageInfo.weight || 1,
        value: waybill.packageInfo.value,
        currency: waybill.packageInfo.currency
      }
    ] : [],
    paymentMethod: 'SENDER_PAY'
  };
}

/**
 * Get carrier recommendations for a waybill
 */
export async function getCarrierRecommendations(
  waybill: Waybill,
  senderAddress: Address,
  recipientAddress: Address,
  criteria?: {
    maxCost?: number;
    maxDeliveryDays?: number;
    serviceType?: 'STANDARD' | 'EXPRESS' | 'ECONOMY';
  }
): Promise<Array<{
  carrierId: string;
  carrierName: string;
  score: number;
  estimatedCost: number;
  estimatedDays: number;
  confidence: number;
}>> {
  const shipment = convertWaybillToShipment(waybill, senderAddress, recipientAddress);
  
  const selectionCriteria: CarrierSelectionCriteria = {
    origin: senderAddress.pid.split('/')[0] || 'JP',
    destination: recipientAddress.pid.split('/')[0] || 'JP',
    serviceType: criteria?.serviceType,
    maxCost: criteria?.maxCost,
    maxDeliveryDays: criteria?.maxDeliveryDays
  };

  return await globalCarrierRegistry.getRecommendations(shipment, selectionCriteria);
}

/**
 * Get available carriers for a route
 */
export async function getAvailableCarriers(
  originCountry: string,
  destinationCountry: string
): Promise<Carrier[]> {
  const carrierMetadata = globalCarrierRegistry.findCarriersForRoute(
    originCountry,
    destinationCountry
  );

  return carrierMetadata.map(metadata => ({
    id: metadata.id,
    name: metadata.name,
    code: metadata.code,
    supportedCountries: metadata.regions,
    services: metadata.services.map((service, index) => ({
      id: `${metadata.id}-${service}`,
      name: service,
      type: service.toLowerCase() as 'standard' | 'express' | 'economy',
      estimatedDays: service === 'EXPRESS' ? 1 : service === 'STANDARD' ? 2 : 3
    })),
    apiEnabled: true
  }));
}

/**
 * Submit delivery with smart carrier selection
 */
export async function submitDeliveryWithSmartSelection(
  waybill: Waybill,
  senderAddress: Address,
  recipientAddress: Address,
  preferences?: {
    preferredCarrierId?: string;
    maxCost?: number;
    maxDeliveryDays?: number;
    serviceType?: 'STANDARD' | 'EXPRESS' | 'ECONOMY';
  }
): Promise<{
  deliveryRequest: DeliveryRequest;
  carrierUsed: string;
  carrierName: string;
}> {
  // Get recommendations
  const recommendations = await getCarrierRecommendations(
    waybill,
    senderAddress,
    recipientAddress,
    preferences
  );

  if (recommendations.length === 0) {
    throw new Error('No suitable carriers found for this route');
  }

  // If preferred carrier is specified and available, use it first
  let sortedRecommendations = recommendations;
  if (preferences?.preferredCarrierId) {
    const preferredIndex = recommendations.findIndex(
      r => r.carrierId === preferences.preferredCarrierId
    );
    if (preferredIndex >= 0) {
      const preferred = recommendations[preferredIndex];
      sortedRecommendations = [
        preferred,
        ...recommendations.filter((_, i) => i !== preferredIndex)
      ];
    }
  }

  // Try carriers in order
  for (const recommendation of sortedRecommendations) {
    try {
      const carrier = globalCarrierRegistry.getCarrier(recommendation.carrierId);
      if (!carrier) continue;

      const shipment = convertWaybillToShipment(waybill, senderAddress, recipientAddress);
      
      const pickupOrder = {
        shipment,
        pickupTime: 'ASAP' as const,
        paymentMethod: 'SENDER_PAY' as const
      };

      const result = await carrier.createPickupOrder(pickupOrder);

      // Create delivery request
      const deliveryRequest: DeliveryRequest = {
        id: generateId(),
        userId: waybill.userId,
        waybillId: waybill.id,
        carrierId: recommendation.carrierId,
        carrierServiceId: `${recommendation.carrierId}-STANDARD`,
        status: 'accepted',
        trackingNumber: result.trackingNumber,
        estimatedDelivery: result.estimatedDeliveryTime,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return {
        deliveryRequest,
        carrierUsed: recommendation.carrierId,
        carrierName: recommendation.carrierName
      };
    } catch (error) {
      console.warn(`Failed with carrier ${recommendation.carrierName}:`, error);
      continue;
    }
  }

  throw new Error('All carriers failed to create shipment');
}

/**
 * Get rate quotes from multiple carriers
 */
export async function getMultiCarrierRateQuotes(
  waybill: Waybill,
  senderAddress: Address,
  recipientAddress: Address
): Promise<Array<{
  carrierId: string;
  carrierName: string;
  amount: number;
  currency: string;
  estimatedDays: number;
  serviceType: string;
}>> {
  const shipment = convertWaybillToShipment(waybill, senderAddress, recipientAddress);
  
  const origin = senderAddress.pid.split('/')[0] || 'JP';
  const destination = recipientAddress.pid.split('/')[0] || 'JP';
  
  const availableCarriers = globalCarrierRegistry.findCarriersForRoute(origin, destination);
  
  const quotes: Array<{
    carrierId: string;
    carrierName: string;
    amount: number;
    currency: string;
    estimatedDays: number;
    serviceType: string;
  }> = [];

  for (const carrierMeta of availableCarriers) {
    const carrier = globalCarrierRegistry.getCarrier(carrierMeta.id);
    if (!carrier) continue;

    try {
      const quote = await carrier.getQuote(shipment);
      quotes.push({
        carrierId: carrierMeta.id,
        carrierName: carrierMeta.name,
        amount: quote.amount,
        currency: quote.currency,
        estimatedDays: quote.estimatedDays,
        serviceType: 'STANDARD'
      });
    } catch (error) {
      console.warn(`Failed to get quote from ${carrierMeta.name}:`, error);
    }
  }

  // Sort by price (ascending)
  return quotes.sort((a, b) => a.amount - b.amount);
}

/**
 * Track shipment across carriers
 */
export async function trackShipmentUnified(
  carrierId: string,
  trackingNumber: string
): Promise<{
  carrier: string;
  status: string;
  currentLocation?: string;
  estimatedDelivery?: Date;
  events: Array<{
    timestamp: Date;
    status: string;
    location?: string;
    description: string;
  }>;
}> {
  const carrier = globalCarrierRegistry.getCarrier(carrierId);
  if (!carrier) {
    throw new Error(`Carrier ${carrierId} not found`);
  }

  const trackingInfo = await carrier.trackShipment(trackingNumber);

  return {
    carrier: carrierId,
    status: trackingInfo.currentStatus,
    currentLocation: trackingInfo.currentLocation,
    estimatedDelivery: trackingInfo.estimatedDelivery,
    events: trackingInfo.events.map(event => ({
      timestamp: event.timestamp,
      status: event.status,
      location: event.location,
      description: event.description
    }))
  };
}

/**
 * Get carrier performance metrics
 */
export function getCarrierPerformanceMetrics() {
  return globalCarrierRegistry.getPerformanceMetrics();
}

/**
 * Convert Vey waybill to standard format
 */
export function convertToStandardFormat(
  waybill: Waybill,
  senderAddress: Address,
  recipientAddress: Address
): StandardWaybillFormat {
  const senderCarrierAddress = convertVeyAddressToCarrierAddress(senderAddress);
  const recipientCarrierAddress = convertVeyAddressToCarrierAddress(recipientAddress);

  return {
    waybillNumber: waybill.id,
    trackingNumber: waybill.trackingNumber,
    shipmentDate: waybill.createdAt,
    serviceType: 'STANDARD',
    sender: {
      name: 'Sender Name', // Get from user
      phone: '', // Get from user
      address: {
        country: senderCarrierAddress.country,
        admin1: senderCarrierAddress.province,
        admin2: senderCarrierAddress.city,
        addressLine1: senderCarrierAddress.street,
        postalCode: senderCarrierAddress.postalCode
      }
    },
    recipient: {
      name: 'Recipient Name', // Get from user
      phone: '', // Get from user
      address: {
        country: recipientCarrierAddress.country,
        admin1: recipientCarrierAddress.province,
        admin2: recipientCarrierAddress.city,
        addressLine1: recipientCarrierAddress.street,
        postalCode: recipientCarrierAddress.postalCode
      }
    },
    packages: waybill.packageInfo ? [
      {
        description: waybill.packageInfo.description || 'Package',
        weight: {
          value: waybill.packageInfo.weight || 1,
          unit: 'KG'
        },
        items: [
          {
            name: waybill.packageInfo.description || 'Item',
            quantity: 1,
            weight: waybill.packageInfo.weight || 1,
            value: waybill.packageInfo.value,
            currency: waybill.packageInfo.currency
          }
        ]
      }
    ] : [],
    paymentMethod: 'SENDER',
    status: waybill.status === 'draft' ? 'DRAFT' : 
            waybill.status === 'pending' ? 'PENDING' : 'ACCEPTED',
    createdAt: waybill.createdAt,
    updatedAt: waybill.updatedAt
  };
}

/**
 * Helper function to generate unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Initialize carriers when module loads
initializeGlobalCarriers();
