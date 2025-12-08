import { webhookService } from '../../../utils/services';
import { requireAuth } from '../../../utils/auth';

/**
 * DELETE /api/webhooks/[id]
 * Delete a webhook
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Webhook ID is required'
    });
  }

  const deleted = webhookService.delete(id, user.id);

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: `Webhook with ID ${id} not found`
    });
  }

  setResponseStatus(event, 204);
  return null;
});
