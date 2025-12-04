/**
 * Webhook Handler for VeyExpress and Payment Events
 * 
 * Handles webhook events from VeyExpress (shipping updates) and payment providers
 */

import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

// NOTE: This is example code. In production, import database and Stripe clients:
// import { PrismaClient } from '@prisma/client';
// import Stripe from 'stripe';
// const prisma = new PrismaClient();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
declare const prisma: any;
declare const stripe: any;

// ============================================================================
// Webhook Signature Verification
// ============================================================================

/**
 * Verifies webhook signature to ensure authenticity
 */
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// ============================================================================
// VeyExpress Webhook Handler
// ============================================================================

interface VeyExpressWebhookEvent {
  type: 'shipment.created' | 'shipment.picked_up' | 'shipment.in_transit' | 
        'shipment.out_for_delivery' | 'shipment.delivered' | 'shipment.failed';
  data: {
    shipmentId: string;
    trackingNumber: string;
    status: string;
    location?: {
      latitude: number;
      longitude: number;
      address: string;
    };
    estimatedDelivery?: string;
    actualDelivery?: string;
    recipient?: string;
    signature?: string;
    photos?: string[];
    notes?: string;
  };
  timestamp: string;
}

/**
 * POST /api/webhooks/veyexpress
 * 
 * Handles shipping status updates from VeyExpress
 */
export async function handleVeyExpressWebhook(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const signature = req.headers['x-veyexpress-signature'] as string;
  
  if (!signature) {
    return res.status(401).json({ error: 'Missing signature' });
  }

  const payload = JSON.stringify(req.body);
  const isValid = verifyWebhookSignature(
    payload,
    signature,
    process.env.VEYEXPRESS_WEBHOOK_SECRET!
  );

  if (!isValid) {
    console.error('Invalid webhook signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event: VeyExpressWebhookEvent = req.body;

  try {
    switch (event.type) {
      case 'shipment.created':
        await handleShipmentCreated(event.data);
        break;
      
      case 'shipment.picked_up':
        await handleShipmentPickedUp(event.data);
        break;
      
      case 'shipment.in_transit':
        await handleShipmentInTransit(event.data);
        break;
      
      case 'shipment.out_for_delivery':
        await handleShipmentOutForDelivery(event.data);
        break;
      
      case 'shipment.delivered':
        await handleShipmentDelivered(event.data);
        break;
      
      case 'shipment.failed':
        await handleShipmentFailed(event.data);
        break;
      
      default:
        console.warn('Unknown event type:', event.type);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

// ============================================================================
// Shipment Event Handlers
// ============================================================================

async function handleShipmentCreated(data: VeyExpressWebhookEvent['data']) {
  console.log('📦 Shipment created:', data.shipmentId);

  // Update order status
  await prisma.order.update({
    where: { shipmentId: data.shipmentId },
    data: {
      status: 'processing',
      trackingNumber: data.trackingNumber
    }
  });

  // Send notification email
  await sendEmail({
    type: 'shipment_created',
    trackingNumber: data.trackingNumber
  });
}

async function handleShipmentPickedUp(data: VeyExpressWebhookEvent['data']) {
  console.log('📤 Shipment picked up:', data.trackingNumber);

  // Update order status
  await prisma.order.update({
    where: { trackingNumber: data.trackingNumber },
    data: {
      status: 'shipped',
      shippedAt: new Date()
    }
  });

  // Create tracking event
  await prisma.trackingEvent.create({
    data: {
      shipmentId: data.shipmentId,
      status: 'picked_up',
      location: data.location?.address,
      timestamp: new Date()
    }
  });

  // Send notification
  await sendEmail({
    type: 'shipment_picked_up',
    trackingNumber: data.trackingNumber,
    estimatedDelivery: data.estimatedDelivery
  });

  // Send push notification
  await sendPushNotification({
    type: 'shipment_picked_up',
    trackingNumber: data.trackingNumber
  });
}

async function handleShipmentInTransit(data: VeyExpressWebhookEvent['data']) {
  console.log('🚚 Shipment in transit:', data.trackingNumber);

  // Create tracking event
  await prisma.trackingEvent.create({
    data: {
      shipmentId: data.shipmentId,
      status: 'in_transit',
      location: data.location?.address,
      timestamp: new Date()
    }
  });

  // Update estimated delivery if changed
  if (data.estimatedDelivery) {
    await prisma.order.update({
      where: { trackingNumber: data.trackingNumber },
      data: {
        estimatedDelivery: new Date(data.estimatedDelivery)
      }
    });
  }
}

async function handleShipmentOutForDelivery(data: VeyExpressWebhookEvent['data']) {
  console.log('🚙 Shipment out for delivery:', data.trackingNumber);

  // Update order status
  await prisma.order.update({
    where: { trackingNumber: data.trackingNumber },
    data: {
      status: 'out_for_delivery'
    }
  });

  // Create tracking event
  await prisma.trackingEvent.create({
    data: {
      shipmentId: data.shipmentId,
      status: 'out_for_delivery',
      location: data.location?.address,
      timestamp: new Date()
    }
  });

  // Send notification
  await sendEmail({
    type: 'out_for_delivery',
    trackingNumber: data.trackingNumber
  });

  await sendPushNotification({
    type: 'out_for_delivery',
    trackingNumber: data.trackingNumber,
    // TODO: Add i18n support for messages
    message: '本日中にお届け予定です' // "Expected delivery today"
  });
}

async function handleShipmentDelivered(data: VeyExpressWebhookEvent['data']) {
  console.log('✅ Shipment delivered:', data.trackingNumber);

  // Update order status
  const order = await prisma.order.update({
    where: { trackingNumber: data.trackingNumber },
    data: {
      status: 'delivered',
      deliveredAt: new Date(data.actualDelivery || new Date())
    },
    include: {
      user: true
    }
  });

  // Create tracking event
  await prisma.trackingEvent.create({
    data: {
      shipmentId: data.shipmentId,
      status: 'delivered',
      location: data.location?.address,
      timestamp: new Date(),
      recipient: data.recipient,
      signature: data.signature,
      photos: data.photos,
      notes: data.notes
    }
  });

  // Send delivery confirmation
  await sendEmail({
    type: 'delivered',
    trackingNumber: data.trackingNumber,
    recipient: data.recipient,
    deliveryTime: data.actualDelivery
  });

  await sendPushNotification({
    type: 'delivered',
    trackingNumber: data.trackingNumber,
    // TODO: Add i18n support for messages
    message: '商品が配達されました' // "Your order has been delivered"
  });

  // Request review (after 3 days)
  await scheduleReviewRequest(order.id, order.user.email, 3);
}

async function handleShipmentFailed(data: VeyExpressWebhookEvent['data']) {
  console.log('❌ Shipment failed:', data.trackingNumber);

  // Update order status
  await prisma.order.update({
    where: { trackingNumber: data.trackingNumber },
    data: {
      status: 'delivery_failed'
    }
  });

  // Create tracking event
  await prisma.trackingEvent.create({
    data: {
      shipmentId: data.shipmentId,
      status: 'failed',
      location: data.location?.address,
      timestamp: new Date(),
      notes: data.notes
    }
  });

  // Send notification
  await sendEmail({
    type: 'delivery_failed',
    trackingNumber: data.trackingNumber,
    reason: data.notes
  });

  // Alert customer support
  await alertCustomerSupport({
    type: 'delivery_failed',
    trackingNumber: data.trackingNumber,
    orderId: await getOrderIdFromTracking(data.trackingNumber),
    reason: data.notes
  });
}

// ============================================================================
// Payment Webhook Handler (Stripe Example)
// ============================================================================

interface StripeWebhookEvent {
  type: string;
  data: {
    object: any;
  };
}

/**
 * POST /api/webhooks/stripe
 * 
 * Handles payment events from Stripe
 */
export async function handleStripeWebhook(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const signature = req.headers['stripe-signature'] as string;
  
  if (!signature) {
    return res.status(401).json({ error: 'Missing signature' });
  }

  let event: StripeWebhookEvent;

  try {
    // Verify webhook signature using Stripe's library
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Invalid Stripe signature:', error);
    return res.status(401).json({ error: 'Invalid signature' });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      case 'charge.refunded':
        await handleRefund(event.data.object);
        break;
      
      case 'charge.dispute.created':
        await handleDispute(event.data.object);
        break;
      
      default:
        console.log('Unhandled Stripe event type:', event.type);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

// ============================================================================
// Payment Event Handlers
// ============================================================================

async function handlePaymentSucceeded(paymentIntent: any) {
  console.log('💳 Payment succeeded:', paymentIntent.id);

  const orderId = paymentIntent.metadata.orderId;

  // Update order status
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'paid',
      paymentId: paymentIntent.id,
      paidAt: new Date()
    }
  });

  // Trigger shipment creation
  await createShipmentForOrder(orderId);

  // Send confirmation email
  await sendEmail({
    type: 'payment_confirmed',
    orderId
  });
}

async function handlePaymentFailed(paymentIntent: any) {
  console.log('❌ Payment failed:', paymentIntent.id);

  const orderId = paymentIntent.metadata.orderId;

  // Update order status
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'payment_failed',
      paymentError: paymentIntent.last_payment_error?.message
    }
  });

  // Send notification
  await sendEmail({
    type: 'payment_failed',
    orderId,
    reason: paymentIntent.last_payment_error?.message
  });
}

async function handleRefund(charge: any) {
  console.log('↩️ Refund processed:', charge.id);

  const paymentId = charge.payment_intent;

  // Find and update order
  const order = await prisma.order.findFirst({
    where: { paymentId }
  });

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'refunded',
        refundedAt: new Date()
      }
    });

    // Send notification
    await sendEmail({
      type: 'refund_processed',
      orderId: order.id,
      amount: charge.amount_refunded / 100
    });
  }
}

async function handleDispute(dispute: any) {
  console.log('⚠️ Dispute created:', dispute.id);

  const chargeId = dispute.charge;

  // Alert customer support
  await alertCustomerSupport({
    type: 'dispute_created',
    disputeId: dispute.id,
    chargeId,
    reason: dispute.reason,
    amount: dispute.amount / 100
  });
}

// ============================================================================
// Helper Functions
// ============================================================================

async function sendEmail(params: {
  type: string;
  [key: string]: any;
}) {
  // Implementation depends on email service (SendGrid, AWS SES, etc.)
  console.log('📧 Sending email:', params.type);
}

async function sendPushNotification(params: {
  type: string;
  trackingNumber: string;
  message?: string;
}) {
  // Implementation depends on push notification service (FCM, APNs, etc.)
  console.log('📱 Sending push notification:', params.type);
}

async function scheduleReviewRequest(
  orderId: string,
  email: string,
  daysDelay: number
) {
  // Schedule review request email
  console.log(`⏰ Scheduling review request for order ${orderId} in ${daysDelay} days`);
}

async function alertCustomerSupport(params: {
  type: string;
  [key: string]: any;
}) {
  // Send alert to customer support team
  console.log('🚨 Alerting customer support:', params.type);
}

async function getOrderIdFromTracking(trackingNumber: string): Promise<string> {
  const order = await prisma.order.findFirst({
    where: { trackingNumber },
    select: { id: true }
  });
  return order?.id || '';
}

async function createShipmentForOrder(orderId: string) {
  // Trigger shipment creation process
  console.log('📦 Creating shipment for order:', orderId);
}

// ============================================================================
// Webhook Testing Utilities
// ============================================================================

/**
 * Generates a test webhook signature for development
 */
export function generateTestSignature(
  payload: string,
  secret: string
): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Creates a test webhook event
 */
export function createTestWebhookEvent(
  type: string,
  data: any
): VeyExpressWebhookEvent {
  return {
    type: type as any,
    data,
    timestamp: new Date().toISOString()
  };
}

// ============================================================================
// Exports
// ============================================================================

export {
  handleVeyExpressWebhook,
  handleStripeWebhook,
  verifyWebhookSignature
};
