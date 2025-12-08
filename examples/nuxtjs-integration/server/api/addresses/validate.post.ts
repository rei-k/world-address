import { validateAddress } from '../../../utils/services';
import { requireAuth } from '../../../utils/auth';

/**
 * POST /api/addresses/validate
 * Validate an address without saving it
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  
  const body = await readBody(event);

  const validation = await validateAddress(body);

  return {
    valid: validation.valid,
    errors: validation.errors,
    address: validation.valid ? body : undefined
  };
});
