import { z } from 'zod';
import { addressService, validateAddress } from '../../utils/services';
import { requireAuth } from '../../utils/auth';
import type { Address } from '../../types';

const addressSchema = z.object({
  country: z.string().min(2).max(2),
  postal_code: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  street_address: z.string().optional(),
  recipient: z.string().optional()
});

/**
 * GET /api/addresses
 * List all addresses for the authenticated user
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  
  const addresses = addressService.getAll(user.id);
  
  return {
    addresses,
    count: addresses.length
  };
});
