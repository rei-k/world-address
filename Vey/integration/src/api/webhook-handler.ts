/**
 * Webhook Handler
 * 
 * Handles incoming webhooks from carriers, payment processors, and other integrations.
 * Includes signature verification and event processing.
 */

import type { Request, Response } from 'express';
import { verifyEd25519, hashSHA256 } from '../../../sdk/core/src/zkp-crypto';

// ============================================================================
// Types
// ============================================================================

export interface WebhookEvent {
  /** Event ID */
  id: string;
  /** Event type */
  type: string;
  /** Event data */
  data: unknown;
  /** Timestamp */
  timestamp: string;
  /** Source system */
  source: string;
}

export interface WebhookHandlerConfig {
  /** Webhook secret for signature verification */
  secret: string;
  /** Allowed event types */
  allowedEvents?: string[];
  /** Maximum request body size */
  maxBodySize?: number;
}

// ============================================================================
// Event Types
// ============================================================================

export const WEBHOOK_EVENTS = {
  // Delivery Events
  DELIVERY_CREATED: 'vey.delivery.created',
  DELIVERY_PICKED_UP: 'vey.delivery.picked_up',
  DELIVERY_IN_TRANSIT: 'vey.delivery.in_transit',
  DELIVERY_OUT_FOR_DELIVERY: 'vey.delivery.out_for_delivery',
  DELIVERY_DELIVERED: 'vey.delivery.delivered',
  DELIVERY_FAILED: 'vey.delivery.failed',
  DELIVERY_EXCEPTION: 'vey.delivery.exception',

  // Order Events
  ORDER_CREATED: 'vey.order.created',
  ORDER_PAID: 'vey.order.paid',
  ORDER_SHIPPED: 'vey.order.shipped',
  ORDER_COMPLETED: 'vey.order.completed',
  ORDER_CANCELLED: 'vey.order.cancelled',
  ORDER_REFUNDED: 'vey.order.refunded',

  // Address Events
  ADDRESS_REGISTERED: 'vey.address.registered',
  ADDRESS_UPDATED: 'vey.address.updated',
  ADDRESS_REVOKED: 'vey.address.revoked',

  // Proof Events
  PROOF_GENERATED: 'vey.proof.generated',
  PROOF_VERIFIED: 'vey.proof.verified',
  PROOF_INVALID: 'vey.proof.invalid',

  // Payment Events
  PAYMENT_INITIATED: 'vey.payment.initiated',
  PAYMENT_SUCCEEDED: 'vey.payment.succeeded',
  PAYMENT_FAILED: 'vey.payment.failed',
  PAYMENT_REFUNDED: 'vey.payment.refunded',
} as const;

// ============================================================================
// Signature Verification
// ============================================================================

/**
 * Verify webhook signature using HMAC-SHA256
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = hashSHA256(`${payload}:${secret}`);
    return signature === expectedSignature;
  } catch {
    return false;
  }
}

/**
 * Verify webhook signature using Ed25519
 */
export function verifyWebhookSignatureEd25519(
  payload: string,
  signature: string,
  publicKey: string
): boolean {
  try {
    return verifyEd25519(payload, signature, publicKey);
  } catch {
    return false;
  }
}

// ============================================================================
// Webhook Middleware
// ============================================================================

/**
 * Middleware to verify webhook signatures
 */
export function webhookSignatureMiddleware(config: WebhookHandlerConfig) {
  return (req: Request, res: Response, next: any) => {
    const signature = req.headers['x-vey-signature'] as string;
    
    if (!signature) {
      res.status(401).json({
        success: false,
        error: {
          code: 'MISSING_SIGNATURE',
          message: 'Webhook signature is required',
        },
      });
      return;
    }

    const payload = JSON.stringify(req.body);
    const isValid = verifyWebhookSignature(payload, signature, config.secret);

    if (!isValid) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'Invalid webhook signature',
        },
      });
      return;
    }

    next();
  };
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Handle delivery status update webhook
 */
export async function handleDeliveryStatusUpdate(event: WebhookEvent): Promise<void> {
  console.log('Delivery status update:', event);

  const { waybillNumber, status, location, timestamp } = event.data as {
    waybillNumber: string;
    status: string;
    location?: string;
    timestamp: string;
  };

  // Update tracking in delivery flow
  // In production, this would update the database
  console.log(`Waybill ${waybillNumber} status: ${status}`);
  if (location) {
    console.log(`Location: ${location}`);
  }
}

/**
 * Handle order status update webhook
 */
export async function handleOrderStatusUpdate(event: WebhookEvent): Promise<void> {
  console.log('Order status update:', event);

  const { orderId, status } = event.data as {
    orderId: string;
    status: string;
  };

  console.log(`Order ${orderId} status: ${status}`);
}

/**
 * Handle payment status update webhook
 */
export async function handlePaymentStatusUpdate(event: WebhookEvent): Promise<void> {
  console.log('Payment status update:', event);

  const { paymentId, status, amount, currency } = event.data as {
    paymentId: string;
    status: string;
    amount: number;
    currency: string;
  };

  console.log(`Payment ${paymentId} ${status}: ${currency} ${amount}`);
}

/**
 * Handle address update webhook
 */
export async function handleAddressUpdate(event: WebhookEvent): Promise<void> {
  console.log('Address update:', event);

  const { pid, action } = event.data as {
    pid: string;
    action: 'registered' | 'updated' | 'revoked';
  };

  console.log(`Address ${pid} ${action}`);
}

/**
 * Handle proof verification webhook
 */
export async function handleProofVerification(event: WebhookEvent): Promise<void> {
  console.log('Proof verification:', event);

  const { proofType, valid } = event.data as {
    proofType: string;
    valid: boolean;
  };

  console.log(`Proof ${proofType} verification: ${valid ? 'valid' : 'invalid'}`);
}

// ============================================================================
// Webhook Router
// ============================================================================

/**
 * Main webhook handler
 */
export async function handleWebhook(req: Request, res: Response): Promise<void> {
  try {
    const event = req.body as WebhookEvent;

    // Validate event structure
    if (!event.id || !event.type || !event.data || !event.timestamp) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EVENT',
          message: 'Invalid webhook event structure',
        },
      });
      return;
    }

    // Route to appropriate handler
    switch (event.type) {
      case WEBHOOK_EVENTS.DELIVERY_CREATED:
      case WEBHOOK_EVENTS.DELIVERY_PICKED_UP:
      case WEBHOOK_EVENTS.DELIVERY_IN_TRANSIT:
      case WEBHOOK_EVENTS.DELIVERY_OUT_FOR_DELIVERY:
      case WEBHOOK_EVENTS.DELIVERY_DELIVERED:
      case WEBHOOK_EVENTS.DELIVERY_FAILED:
      case WEBHOOK_EVENTS.DELIVERY_EXCEPTION:
        await handleDeliveryStatusUpdate(event);
        break;

      case WEBHOOK_EVENTS.ORDER_CREATED:
      case WEBHOOK_EVENTS.ORDER_PAID:
      case WEBHOOK_EVENTS.ORDER_SHIPPED:
      case WEBHOOK_EVENTS.ORDER_COMPLETED:
      case WEBHOOK_EVENTS.ORDER_CANCELLED:
      case WEBHOOK_EVENTS.ORDER_REFUNDED:
        await handleOrderStatusUpdate(event);
        break;

      case WEBHOOK_EVENTS.PAYMENT_INITIATED:
      case WEBHOOK_EVENTS.PAYMENT_SUCCEEDED:
      case WEBHOOK_EVENTS.PAYMENT_FAILED:
      case WEBHOOK_EVENTS.PAYMENT_REFUNDED:
        await handlePaymentStatusUpdate(event);
        break;

      case WEBHOOK_EVENTS.ADDRESS_REGISTERED:
      case WEBHOOK_EVENTS.ADDRESS_UPDATED:
      case WEBHOOK_EVENTS.ADDRESS_REVOKED:
        await handleAddressUpdate(event);
        break;

      case WEBHOOK_EVENTS.PROOF_GENERATED:
      case WEBHOOK_EVENTS.PROOF_VERIFIED:
      case WEBHOOK_EVENTS.PROOF_INVALID:
        await handleProofVerification(event);
        break;

      default:
        console.log('Unhandled event type:', event.type);
    }

    // Always return 200 OK for valid webhooks
    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      eventId: event.id,
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'WEBHOOK_PROCESSING_ERROR',
        message: (error as Error).message,
      },
    });
  }
}

/**
 * Create webhook router
 */
export function createWebhookRouter(config: WebhookHandlerConfig): any {
  const express = require('express');
  const router = express.Router();

  // Apply signature verification middleware
  router.use(webhookSignatureMiddleware(config));

  // Main webhook endpoint
  router.post('/', handleWebhook);

  // Health check for webhook endpoint
  router.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      endpoint: 'webhook',
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}

// ============================================================================
// Webhook Testing Utilities
// ============================================================================

/**
 * Create a test webhook event
 */
export function createTestWebhookEvent(
  type: string,
  data: unknown,
  secret: string
): { event: WebhookEvent; signature: string } {
  const event: WebhookEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    type,
    data,
    timestamp: new Date().toISOString(),
    source: 'test',
  };

  const payload = JSON.stringify(event);
  const signature = hashSHA256(`${payload}:${secret}`);

  return { event, signature };
}

/**
 * Send test webhook
 */
export async function sendTestWebhook(
  url: string,
  type: string,
  data: unknown,
  secret: string
): Promise<Response> {
  const { event, signature } = createTestWebhookEvent(type, data, secret);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-vey-signature': signature,
    },
    body: JSON.stringify(event),
  });

  return response as unknown as Response;
}

export default createWebhookRouter;
