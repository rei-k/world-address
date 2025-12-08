import { z } from 'zod';
import { addressService, validateAddress } from '../../utils/services';
import { requireAuth } from '../../utils/auth';

const addressSchema = z.object({
  country: z.string().min(2).max(2),
  postal_code: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  street_address: z.string().optional(),
  recipient: z.string().optional()
});

/**
 * POST /api/addresses
 * Create a new address
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  
  const body = await readBody(event);
  
  // Validate request body
  const parseResult = addressSchema.safeParse(body);
  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Invalid request body',
      data: parseResult.error.errors
    });
  }

  const addressData = parseResult.data;

  // Validate the address
  const validation = await validateAddress(addressData);

  if (!validation.valid) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Error',
      message: 'Address validation failed',
      data: validation.errors
    });
  }

  // Create the address
  const address = await addressService.create(addressData, user.id);

  setResponseStatus(event, 201);
  return address;
});
