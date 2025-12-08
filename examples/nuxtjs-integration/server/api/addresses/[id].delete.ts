import { addressService } from '../../../utils/services';
import { requireAuth } from '../../../utils/auth';

/**
 * DELETE /api/addresses/[id]
 * Delete an address
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Address ID is required'
    });
  }

  const deleted = await addressService.delete(id, user.id);

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: `Address with ID ${id} not found`
    });
  }

  setResponseStatus(event, 204);
  return null;
});
