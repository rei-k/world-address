/**
 * API Routes for E-commerce Checkout
 * 
 * Next.js API routes for handling checkout operations with Veyvault integration
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { VeyvaultClient } from '@vey/core';
import { VeyExpressClient } from '@vey/express';

// NOTE: This is example code. In production, import Prisma client:
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();
// Or use your database client of choice
declare const prisma: any;
declare const stripe: any;

// ============================================================================
// OAuth Callback Handler
// ============================================================================

/**
 * POST /api/auth/veybook/callback
 * 
 * Handles OAuth callback from Veyvault
 */
export async function handleVeyvaultCallback(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).json({ error: 'Missing code or state' });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://auth.veybook.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.VEYBOOK_CLIENT_ID,
        client_secret: process.env.VEYBOOK_CLIENT_SECRET,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/veybook/callback`
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange token');
    }

    const tokens = await tokenResponse.json();

    // Get user info
    const veybookClient = new VeyvaultClient({
      accessToken: tokens.access_token
    });

    const userInfo = await veybookClient.users.getCurrentUser();

    // Save to session
    req.session.user = {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      provider: 'veybook',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token
    };

    await req.session.save();

    // Redirect back to checkout
    res.redirect(302, '/checkout');
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(302, '/checkout?error=auth_failed');
  }
}

// ============================================================================
// Order Management
// ============================================================================

/**
 * POST /api/orders
 * 
 * Creates a new order
 */
export async function createOrder(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId, addressPid, items, paymentMethodId } = req.body;

  if (!userId || !addressPid || !items || !paymentMethodId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Calculate total
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + (item.price * item.quantity),
      0
    );
    const shippingFee = 500;
    const total = subtotal + shippingFee;

    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId,
        addressPid,
        status: 'pending',
        subtotal,
        shippingFee,
        total,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            weight: item.weight
          }))
        }
      },
      include: {
        items: true
      }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
}

/**
 * GET /api/orders/:id
 * 
 * Gets order details
 */
export async function getOrder(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  try {
    const order = await prisma.order.findUnique({
      where: { id: id as string },
      include: {
        items: true,
        shipment: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check authorization
    if (order.userId !== req.session.user?.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
}

// ============================================================================
// Payment Processing
// ============================================================================

/**
 * POST /api/payments
 * 
 * Processes payment for an order
 */
export async function processPayment(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { orderId, amount, paymentMethodId } = req.body;

  if (!orderId || !amount || !paymentMethodId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Process payment with payment provider (Stripe, etc.)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // in cents
      currency: 'jpy',
      payment_method: paymentMethodId,
      confirm: true,
      metadata: {
        orderId: order.id
      }
    });

    if (paymentIntent.status === 'succeeded') {
      // Update order status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'paid',
          paymentId: paymentIntent.id,
          paidAt: new Date()
        }
      });

      res.json({
        status: 'succeeded',
        paymentId: paymentIntent.id
      });
    } else {
      res.status(400).json({
        status: paymentIntent.status,
        error: 'Payment failed'
      });
    }
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
}

// ============================================================================
// Address Management
// ============================================================================

/**
 * GET /api/addresses
 * 
 * Lists user's addresses from Veyvault
 */
export async function listAddresses(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = req.session.user;

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const veybookClient = new VeyvaultClient({
      accessToken: user.accessToken
    });

    const addresses = await veybookClient.addresses.list();

    res.json(addresses);
  } catch (error) {
    console.error('List addresses error:', error);
    res.status(500).json({ error: 'Failed to list addresses' });
  }
}

/**
 * POST /api/addresses
 * 
 * Creates a new address in Veyvault
 */
export async function createAddress(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = req.session.user;

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { label, recipient, postalCode, prefecture, city, addressLine1, addressLine2, phone, isPrimary } = req.body;

  try {
    const veybookClient = new VeyvaultClient({
      accessToken: user.accessToken
    });

    // Normalize address and generate PID
    const normalizedAddress = await veybookClient.addresses.normalize({
      country: 'JP',
      postalCode,
      admin1: prefecture,
      admin2: city,
      addressLine1,
      addressLine2
    });

    // Create address
    const newAddress = await veybookClient.addresses.create({
      label,
      recipient,
      type: 'other',
      pid: normalizedAddress.pid,
      country: 'JP',
      postalCode,
      prefecture,
      city,
      addressLine1,
      addressLine2,
      phone,
      isPrimary
    });

    res.status(201).json(newAddress);
  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({ error: 'Failed to create address' });
  }
}

/**
 * POST /api/addresses/validate-delivery
 * 
 * Validates if delivery is possible using ZKP
 */
export async function validateDelivery(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = req.session.user;

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { pid, conditions } = req.body;

  try {
    const veybookClient = new VeyvaultClient({
      accessToken: user.accessToken
    });

    const validation = await veybookClient.addresses.validateDelivery({
      pid,
      conditions
    });

    res.json(validation);
  } catch (error) {
    console.error('Validate delivery error:', error);
    res.status(500).json({ error: 'Failed to validate delivery' });
  }
}

// ============================================================================
// Shipping Management
// ============================================================================

/**
 * POST /api/shipments
 * 
 * Creates a new shipment with VeyExpress
 */
export async function createShipment(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { orderId, fromPid, toPid, items, deliveryPreference } = req.body;

  if (!orderId || !fromPid || !toPid || !items) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const veyExpressClient = new VeyExpressClient({
      apiKey: process.env.VEYEXPRESS_API_KEY!
    });

    // Create shipment
    const shipment = await veyExpressClient.shipments.create({
      orderId,
      fromPid,
      toPid,
      items,
      deliveryPreference: deliveryPreference || 'standard'
    });

    // Generate waybill
    const waybill = await veyExpressClient.waybills.generate({
      shipmentId: shipment.id,
      carrier: shipment.selectedCarrier,
      trackingNumber: shipment.trackingNumber
    });

    // Update order with shipment info
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'shipped',
        shipmentId: shipment.id,
        trackingNumber: shipment.trackingNumber,
        shippedAt: new Date()
      }
    });

    res.status(201).json({
      shipment,
      waybill
    });
  } catch (error) {
    console.error('Create shipment error:', error);
    res.status(500).json({ error: 'Failed to create shipment' });
  }
}

/**
 * GET /api/shipments/:trackingNumber/status
 * 
 * Gets shipment tracking status
 */
export async function getShipmentStatus(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { trackingNumber } = req.query;

  try {
    const veyExpressClient = new VeyExpressClient({
      apiKey: process.env.VEYEXPRESS_API_KEY!
    });

    const status = await veyExpressClient.tracking.getStatus(trackingNumber as string);

    res.json(status);
  } catch (error) {
    console.error('Get shipment status error:', error);
    res.status(500).json({ error: 'Failed to get shipment status' });
  }
}

// ============================================================================
// Discount Codes
// ============================================================================

/**
 * POST /api/discounts/validate
 * 
 * Validates a discount code
 */
export async function validateDiscountCode(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Missing discount code' });
  }

  try {
    const discount = await prisma.discountCode.findUnique({
      where: { code }
    });

    if (!discount) {
      return res.json({ valid: false });
    }

    // Check if expired
    if (discount.expiresAt && discount.expiresAt < new Date()) {
      return res.json({ valid: false });
    }

    // Check if usage limit reached
    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      return res.json({ valid: false });
    }

    res.json({
      valid: true,
      amount: discount.amount,
      type: discount.type, // 'fixed' or 'percentage'
      code: discount.code
    });
  } catch (error) {
    console.error('Validate discount error:', error);
    res.status(500).json({ error: 'Failed to validate discount code' });
  }
}

// ============================================================================
// Analytics
// ============================================================================

/**
 * POST /api/analytics/track
 * 
 * Tracks analytics events
 */
export async function trackAnalyticsEvent(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { event, ...data } = req.body;

  try {
    // Save to analytics database
    await prisma.analyticsEvent.create({
      data: {
        event,
        data: JSON.stringify(data),
        userId: req.session.user?.id,
        timestamp: new Date()
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Track analytics error:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
}

// ============================================================================
// Exports
// ============================================================================

export {
  handleVeyvaultCallback,
  createOrder,
  getOrder,
  processPayment,
  listAddresses,
  createAddress,
  validateDelivery,
  createShipment,
  getShipmentStatus,
  validateDiscountCode,
  trackAnalyticsEvent
};
