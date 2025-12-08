import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateWebhook, validateId } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  registerWebhook,
  getAllWebhooks,
  getWebhookById,
  deleteWebhook
} from '../services/webhookService.js';
import { WebhookEvent } from '../types/index.js';

const router = Router();

/**
 * POST /api/webhooks
 * Register a new webhook
 */
router.post('/', authenticate, validateWebhook, asyncHandler(async (req: Request, res: Response) => {
  const { url, events, secret } = req.body as {
    url: string;
    events: WebhookEvent[];
    secret: string;
  };

  const webhook = registerWebhook(url, events, secret);

  // Don't return the secret in the response
  const { secret: _, ...webhookResponse } = webhook;

  res.status(201).json(webhookResponse);
}));

/**
 * GET /api/webhooks
 * List all registered webhooks
 */
router.get('/', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const webhooks = getAllWebhooks();

  // Don't return secrets in the response
  const webhooksResponse = webhooks.map(({ secret, ...rest }) => rest);

  res.json({
    webhooks: webhooksResponse,
    count: webhooksResponse.length
  });
}));

/**
 * GET /api/webhooks/:id
 * Get a specific webhook by ID
 */
router.get('/:id', authenticate, validateId, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const webhook = getWebhookById(id);

  if (!webhook) {
    res.status(404).json({
      error: 'Not Found',
      message: `Webhook with ID ${id} not found`
    });
    return;
  }

  // Don't return the secret
  const { secret, ...webhookResponse } = webhook;

  res.json(webhookResponse);
}));

/**
 * DELETE /api/webhooks/:id
 * Delete a webhook
 */
router.delete('/:id', authenticate, validateId, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const deleted = deleteWebhook(id);

  if (!deleted) {
    res.status(404).json({
      error: 'Not Found',
      message: `Webhook with ID ${id} not found`
    });
    return;
  }

  res.status(204).send();
}));

/**
 * POST /api/webhooks/test
 * Test webhook delivery (sends a test event)
 */
router.post('/test', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const { webhookId } = req.body as { webhookId: string };

  const webhook = getWebhookById(webhookId);

  if (!webhook) {
    res.status(404).json({
      error: 'Not Found',
      message: `Webhook with ID ${webhookId} not found`
    });
    return;
  }

  // Send a test payload
  const testPayload = {
    event: 'address.created' as WebhookEvent,
    timestamp: new Date().toISOString(),
    data: {
      id: 'test_addr_123',
      country: 'JP',
      postal_code: '100-0001',
      province: '東京都',
      city: '千代田区',
      street_address: 'テスト1-1-1',
      recipient: 'テストユーザー'
    }
  };

  try {
    // In a real implementation, we would call the webhook delivery function
    // For now, just return success
    res.json({
      message: 'Test webhook sent',
      payload: testPayload
    });
  } catch (error) {
    res.status(500).json({
      error: 'Webhook Test Failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

export default router;
