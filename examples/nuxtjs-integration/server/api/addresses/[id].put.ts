import { z } from 'zod';
import { addressService, validateAddress } from '../../../utils/services';
import { requireAuth } from '../../../utils/auth';

const addressUpdateSchema = z.object({
  country: z.string().min(2).max(2).optional(),
  postal_code: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  street_address: z.string().optional(),
  recipient: z.string().optional()
});

/**
 * PUT /api/addresses/[id]
 * Update an address
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

  const body = await readBody(event);
  
  // Validate request body
  const parseResult = addressUpdateSchema.safeParse(body);
  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Invalid request body',
      data: parseResult.error.errors
    });
  }

  const updates = parseResult.data;

  // Validate the updates
  const validation = await validateAddress(updates);

  if (!validation.valid) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Error',
      message: 'Address validation failed',
      data: validation.errors
    });
  }

  // Update the address
  const address = await addressService.update(id, updates, user.id);

  if (!address) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: `Address with ID ${id} not found`
    });
  }

  return address;
});
