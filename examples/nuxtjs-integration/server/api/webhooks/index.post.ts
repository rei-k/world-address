import { z } from 'zod';
import { webhookService } from '../../utils/services';
import { requireAuth } from '../../utils/auth';

const webhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.enum(['address.created', 'address.updated', 'address.deleted'])).min(1),
  secret: z.string().min(8)
});

/**
 * POST /api/webhooks
 * Register a new webhook
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  
  const body = await readBody(event);
  
  // Validate request body
  const parseResult = webhookSchema.safeParse(body);
  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Invalid request body',
      data: parseResult.error.errors
    });
  }

  const { url, events, secret } = parseResult.data;

  const webhook = webhookService.register(url, events, user.id, secret);

  setResponseStatus(event, 201);
  return {
    id: webhook.id,
    url: webhook.url,
    events: webhook.events,
    active: webhook.active
  };
});
