import { addressService } from '../../../utils/services';
import { requireAuth } from '../../../utils/auth';

/**
 * GET /api/addresses/[id]
 * Get a specific address
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

  const address = addressService.getById(id, user.id);

  if (!address) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: `Address with ID ${id} not found`
    });
  }

  return address;
});
