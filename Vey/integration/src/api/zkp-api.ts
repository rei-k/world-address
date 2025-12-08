/**
 * ZKP API Server
 * 
 * RESTful API endpoints for ZKP Address Protocol operations.
 * Provides endpoints for proof generation, verification, and delivery management.
 */

import type { Request, Response, NextFunction } from 'express';
import {
  ZKPIntegration,
  type AddressRegistration,
  type ConveyDeliveryRequest,
  type DeliveryAcceptance,
} from '../zkp-integration';

import {
  ConveyProtocol,
  type DeliveryRequest,
  type DeliveryResponse,
} from '../convey-protocol';

import {
  DeliveryFlow,
  type ShippingQuote,
  type Waybill,
  type TrackingEvent,
} from '../delivery-flow';

// ============================================================================
// Types
// ============================================================================

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// API Handlers
// ============================================================================

/**
 * Create API response helper
 */
function createResponse<T>(data: T, requestId: string): APIResponse<T> {
  return {
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  };
}

/**
 * Create error response helper
 */
function createErrorResponse(code: string, message: string, requestId: string, details?: unknown): APIResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  };
}

/**
 * Generate request ID middleware
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  req.id = req.headers['x-request-id'] as string || `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  res.setHeader('x-request-id', req.id);
  next();
}

// ============================================================================
// Address Management Endpoints
// ============================================================================

/**
 * POST /api/addresses
 * Register a new address
 */
export async function registerAddress(req: Request, res: Response): Promise<void> {
  try {
    const { userDid, pid, countryCode, hierarchyDepth, fullAddress } = req.body;

    // Validate required fields
    if (!userDid || !pid || !countryCode || !hierarchyDepth || !fullAddress) {
      res.status(400).json(createErrorResponse(
        'VALIDATION_ERROR',
        'Missing required fields',
        req.id,
        { required: ['userDid', 'pid', 'countryCode', 'hierarchyDepth', 'fullAddress'] }
      ));
      return;
    }

    const integration = req.app.locals.zkpIntegration as ZKPIntegration;
    
    const registration: AddressRegistration = {
      userDid,
      pid,
      countryCode,
      hierarchyDepth,
      fullAddress,
    };

    const credential = await integration.registerAddress(registration);

    res.status(201).json(createResponse({
      credential,
      message: 'Address registered successfully',
    }, req.id));
  } catch (error) {
    res.status(500).json(createErrorResponse(
      'INTERNAL_ERROR',
      (error as Error).message,
      req.id
    ));
  }
}

/**
 * DELETE /api/addresses/:pid
 * Revoke an address
 */
export async function revokeAddress(req: Request, res: Response): Promise<void> {
  try {
    const { pid } = req.params;
    const { reason } = req.body;

    const integration = req.app.locals.zkpIntegration as ZKPIntegration;
    await integration.revokeAddress(pid, reason || 'User requested');

    res.json(createResponse({
      message: 'Address revoked successfully',
      pid,
    }, req.id));
  } catch (error) {
    res.status(500).json(createErrorResponse(
      'INTERNAL_ERROR',
      (error as Error).message,
      req.id
    ));
  }
}

// ============================================================================
// ZKP Proof Endpoints
// ============================================================================

/**
 * POST /api/proofs/membership
 * Generate membership proof
 */
export async function generateMembershipProof(req: Request, res: Response): Promise<void> {
  try {
    const { pid, validPidSet } = req.body;

    if (!pid || !validPidSet || !Array.isArray(validPidSet)) {
      res.status(400).json(createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid request body',
        req.id
      ));
      return;
    }

    const integration = req.app.locals.zkpIntegration as ZKPIntegration;
    const { proof, publicSignals } = await integration.generateMembershipProof(pid, validPidSet);

    res.json(createResponse({
      proof,
      publicSignals,
      type: 'membership',
    }, req.id));
  } catch (error) {
    res.status(500).json(createErrorResponse(
      'PROOF_GENERATION_ERROR',
      (error as Error).message,
      req.id
    ));
  }
}

/**
 * POST /api/proofs/selective-reveal
 * Generate selective reveal proof
 */
export async function generateSelectiveRevealProof(req: Request, res: Response): Promise<void> {
  try {
    const { fullAddress, revealFields } = req.body;

    if (!fullAddress || !revealFields || !Array.isArray(revealFields)) {
      res.status(400).json(createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid request body',
        req.id
      ));
      return;
    }

    const integration = req.app.locals.zkpIntegration as ZKPIntegration;
    const { proof, publicSignals, revealedData } = await integration.generateSelectiveRevealProof(
      fullAddress,
      revealFields
    );

    res.json(createResponse({
      proof,
      publicSignals,
      revealedData,
      type: 'selective-reveal',
    }, req.id));
  } catch (error) {
    res.status(500).json(createErrorResponse(
      'PROOF_GENERATION_ERROR',
      (error as Error).message,
      req.id
    ));
  }
}

/**
 * POST /api/proofs/locker
 * Generate locker proof
 */
export async function generateLockerProof(req: Request, res: Response): Promise<void> {
  try {
    const { lockerId, facilityId, availableLockers } = req.body;

    if (!lockerId || !facilityId || !availableLockers || !Array.isArray(availableLockers)) {
      res.status(400).json(createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid request body',
        req.id
      ));
      return;
    }

    const integration = req.app.locals.zkpIntegration as ZKPIntegration;
    const { proof, publicSignals } = await integration.generateLockerProof(
      lockerId,
      facilityId,
      availableLockers
    );

    res.json(createResponse({
      proof,
      publicSignals,
      type: 'locker',
    }, req.id));
  } catch (error) {
    res.status(500).json(createErrorResponse(
      'PROOF_GENERATION_ERROR',
      (error as Error).message,
      req.id
    ));
  }
}

/**
 * POST /api/proofs/version
 * Generate version proof
 */
export async function generateVersionProof(req: Request, res: Response): Promise<void> {
  try {
    const { oldPid, newPid, userSecret } = req.body;

    if (!oldPid || !newPid || !userSecret) {
      res.status(400).json(createErrorResponse(
        'VALIDATION_ERROR',
        'Missing required fields',
        req.id
      ));
      return;
    }

    const integration = req.app.locals.zkpIntegration as ZKPIntegration;
    const { proof, publicSignals } = await integration.generateVersionProof(
      oldPid,
      newPid,
      userSecret
    );

    res.json(createResponse({
      proof,
      publicSignals,
      type: 'version',
    }, req.id));
  } catch (error) {
    res.status(500).json(createErrorResponse(
      'PROOF_GENERATION_ERROR',
      (error as Error).message,
      req.id
    ));
  }
}

/**
 * POST /api/proofs/verify
 * Verify a ZKP proof
 */
export async function verifyProof(req: Request, res: Response): Promise<void> {
  try {
    const { proof, publicSignals, proofType } = req.body;

    if (!proof || !publicSignals || !proofType) {
      res.status(400).json(createErrorResponse(
        'VALIDATION_ERROR',
        'Missing required fields',
        req.id
      ));
      return;
    }

    const integration = req.app.locals.zkpIntegration as ZKPIntegration;
    const isValid = await integration.verifyProof(proof, publicSignals, proofType);

    res.json(createResponse({
      valid: isValid,
      proofType,
    }, req.id));
  } catch (error) {
    res.status(500).json(createErrorResponse(
      'PROOF_VERIFICATION_ERROR',
      (error as Error).message,
      req.id
    ));
  }
}

// ============================================================================
// Delivery Endpoints
// ============================================================================

/**
 * POST /api/delivery/request
 * Send delivery request
 */
export async function sendDeliveryRequest(req: Request, res: Response): Promise<void> {
  try {
    const { recipientConveyId, packageDetails, message, preferences } = req.body;

    if (!recipientConveyId || !packageDetails) {
      res.status(400).json(createErrorResponse(
        'VALIDATION_ERROR',
        'Missing required fields',
        req.id
      ));
      return;
    }

    const convey = req.app.locals.conveyProtocol as ConveyProtocol;
    const request = await convey.sendDeliveryRequest(
      recipientConveyId,
      packageDetails,
      message,
      preferences
    );

    res.status(201).json(createResponse(request, req.id));
  } catch (error) {
    res.status(500).json(createErrorResponse(
      'DELIVERY_REQUEST_ERROR',
      (error as Error).message,
      req.id
    ));
  }
}

/**
 * POST /api/delivery/accept/:requestId
 * Accept delivery request
 */
export async function acceptDeliveryRequest(req: Request, res: Response): Promise<void> {
  try {
    const { requestId } = req.params;
    const { selectedAddressIndex } = req.body;

    const convey = req.app.locals.conveyProtocol as ConveyProtocol;
    const response = await convey.acceptDeliveryRequest(
      requestId,
      selectedAddressIndex || 0
    );

    res.json(createResponse(response, req.id));
  } catch (error) {
    res.status(500).json(createErrorResponse(
      'DELIVERY_ACCEPT_ERROR',
      (error as Error).message,
      req.id
    ));
  }
}

/**
 * POST /api/delivery/reject/:requestId
 * Reject delivery request
 */
export async function rejectDeliveryRequest(req: Request, res: Response): Promise<void> {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;

    const convey = req.app.locals.conveyProtocol as ConveyProtocol;
    const response = await convey.rejectDeliveryRequest(requestId, reason || 'User declined');

    res.json(createResponse(response, req.id));
  } catch (error) {
    res.status(500).json(createErrorResponse(
      'DELIVERY_REJECT_ERROR',
      (error as Error).message,
      req.id
    ));
  }
}

/**
 * GET /api/delivery/quotes
 * Get shipping quotes
 */
export async function getShippingQuotes(req: Request, res: Response): Promise<void> {
  try {
    const { fromPid, toPid, weight, length, width, height, value, currency } = req.query;

    if (!fromPid || !toPid || !weight) {
      res.status(400).json(createErrorResponse(
        'VALIDATION_ERROR',
        'Missing required query parameters',
        req.id
      ));
      return;
    }

    const deliveryFlow = req.app.locals.deliveryFlow as DeliveryFlow;
    const quotes = await deliveryFlow.getShippingQuotes(
      fromPid as string,
      toPid as string,
      {
        weight: parseFloat(weight as string),
        dimensions: {
          length: parseFloat(length as string) || 0,
          width: parseFloat(width as string) || 0,
          height: parseFloat(height as string) || 0,
        },
        value: parseFloat(value as string) || 0,
        currency: currency as string || 'JPY',
      }
    );

    res.json(createResponse(quotes, req.id));
  } catch (error) {
    res.status(500).json(createErrorResponse(
      'QUOTES_ERROR',
      (error as Error).message,
      req.id
    ));
  }
}

/**
 * GET /api/delivery/tracking/:waybillNumber
 * Get tracking information
 */
export async function getTracking(req: Request, res: Response): Promise<void> {
  try {
    const { waybillNumber } = req.params;

    const deliveryFlow = req.app.locals.deliveryFlow as DeliveryFlow;
    const tracking = deliveryFlow.getTracking(waybillNumber);

    res.json(createResponse(tracking, req.id));
  } catch (error) {
    res.status(404).json(createErrorResponse(
      'TRACKING_NOT_FOUND',
      (error as Error).message,
      req.id
    ));
  }
}

/**
 * GET /api/delivery/waybills
 * List all waybills
 */
export async function listWaybills(req: Request, res: Response): Promise<void> {
  try {
    const { status } = req.query;

    const deliveryFlow = req.app.locals.deliveryFlow as DeliveryFlow;
    
    const waybills = status
      ? deliveryFlow.getWaybillsByStatus(status as Waybill['status'])
      : deliveryFlow.getAllWaybills();

    res.json(createResponse(waybills, req.id));
  } catch (error) {
    res.status(500).json(createErrorResponse(
      'WAYBILLS_ERROR',
      (error as Error).message,
      req.id
    ));
  }
}

// ============================================================================
// Health Check
// ============================================================================

/**
 * GET /api/health
 * Health check endpoint
 */
export async function healthCheck(req: Request, res: Response): Promise<void> {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
}

// ============================================================================
// Express Router Setup
// ============================================================================

/**
 * Create API router
 */
export function createAPIRouter(): any {
  const express = require('express');
  const router = express.Router();

  // Middleware
  router.use(requestIdMiddleware);

  // Health
  router.get('/health', healthCheck);

  // Address Management
  router.post('/addresses', registerAddress);
  router.delete('/addresses/:pid', revokeAddress);

  // ZKP Proofs
  router.post('/proofs/membership', generateMembershipProof);
  router.post('/proofs/selective-reveal', generateSelectiveRevealProof);
  router.post('/proofs/locker', generateLockerProof);
  router.post('/proofs/version', generateVersionProof);
  router.post('/proofs/verify', verifyProof);

  // Delivery
  router.post('/delivery/request', sendDeliveryRequest);
  router.post('/delivery/accept/:requestId', acceptDeliveryRequest);
  router.post('/delivery/reject/:requestId', rejectDeliveryRequest);
  router.get('/delivery/quotes', getShippingQuotes);
  router.get('/delivery/tracking/:waybillNumber', getTracking);
  router.get('/delivery/waybills', listWaybills);

  return router;
}

export default createAPIRouter;
