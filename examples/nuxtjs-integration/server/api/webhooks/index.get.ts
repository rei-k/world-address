import { webhookService } from '../../utils/services';
import { requireAuth } from '../../utils/auth';

/**
 * GET /api/webhooks
 * List all webhooks for the authenticated user
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  
  const webhooks = webhookService.getAll(user.id);
  
  return {
    webhooks,
    count: webhooks.length
  };
});
