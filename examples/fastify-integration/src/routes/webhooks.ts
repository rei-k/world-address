import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { webhookService } from '../services/addressService.js';
import type { JWTPayload, WebhookEvent } from '../types/index.js';

const webhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.enum(['address.created', 'address.updated', 'address.deleted'])).min(1),
  secret: z.string().min(8)
});

export default async function webhookRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/webhooks
   * List all webhooks for the authenticated user
   */
  fastify.get('/api/webhooks', {
    onRequest: [authenticate],
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            webhooks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  url: { type: 'string' },
                  events: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  active: { type: 'boolean' }
                }
              }
            },
            count: { type: 'number' }
          }
        }
      }
    }
  }, async (request) => {
    const user = request.user as JWTPayload;
    const webhooks = webhookService.getAll(user.id);

    return {
      webhooks,
      count: webhooks.length
    };
  });

  /**
   * POST /api/webhooks
   * Register a new webhook
   */
  fastify.post('/api/webhooks', {
    onRequest: [authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['url', 'events', 'secret'],
        properties: {
          url: { type: 'string', format: 'uri' },
          events: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['address.created', 'address.updated', 'address.deleted']
            },
            minItems: 1
          },
          secret: { type: 'string', minLength: 8 }
        }
      }
    }
  }, async (request, reply) => {
    const user = request.user as JWTPayload;
    const body = request.body as any;

    // Validate with Zod
    const parseResult = webhookSchema.safeParse(body);
    if (!parseResult.success) {
      return reply.code(400).send({
        error: 'Validation Error',
        errors: parseResult.error.errors
      });
    }

    const { url, events, secret } = parseResult.data;

    const webhook = webhookService.register(url, events as WebhookEvent[], user.id, secret);

    return reply.code(201).send({
      id: webhook.id,
      url: webhook.url,
      events: webhook.events,
      active: webhook.active
    });
  });

  /**
   * DELETE /api/webhooks/:id
   * Delete a webhook
   */
  fastify.delete<{ Params: { id: string } }>('/api/webhooks/:id', {
    onRequest: [authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    const user = request.user as JWTPayload;
    const { id } = request.params;

    const deleted = webhookService.delete(id, user.id);

    if (!deleted) {
      return reply.code(404).send({
        error: 'Not Found',
        message: `Webhook with ID ${id} not found`
      });
    }

    return reply.code(204).send();
  });
}
