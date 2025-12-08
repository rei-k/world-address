import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateAddress, validateId } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  getAllAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  searchAddresses
} from '../services/addressService.js';
import { Address } from '../types/index.js';

const router = Router();

// Note: In a real implementation, you would load country data from @vey/core
// For this example, we'll do basic validation
async function validateAddressData(address: Partial<Address>): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Basic validation
  if (!address.country) {
    errors.push('Country is required');
  }

  // In a real implementation, you would use @vey/core to validate based on country format
  // Example:
  // import { validateAddress as veyValidate, getCountryFormat } from '@vey/core';
  // const format = await getCountryFormat(address.country);
  // const result = veyValidate(address, format);

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * POST /api/addresses/validate
 * Validate an address without saving it
 */
router.post('/validate', authenticate, validateAddress, asyncHandler(async (req: Request, res: Response) => {
  const addressData = req.body as Address;

  const validationResult = await validateAddressData(addressData);

  res.json({
    valid: validationResult.valid,
    errors: validationResult.errors,
    address: validationResult.valid ? addressData : undefined
  });
}));

/**
 * GET /api/addresses
 * List all addresses with optional search
 */
router.get('/', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;

  let addresses: Address[];

  if (q && typeof q === 'string') {
    addresses = searchAddresses(q);
  } else {
    addresses = getAllAddresses();
  }

  res.json({
    addresses,
    count: addresses.length
  });
}));

/**
 * GET /api/addresses/:id
 * Get a specific address by ID
 */
router.get('/:id', authenticate, validateId, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const address = getAddressById(id);

  if (!address) {
    res.status(404).json({
      error: 'Not Found',
      message: `Address with ID ${id} not found`
    });
    return;
  }

  res.json(address);
}));

/**
 * POST /api/addresses
 * Create a new address
 */
router.post('/', authenticate, validateAddress, asyncHandler(async (req: Request, res: Response) => {
  const addressData = req.body as Address;

  // Validate the address
  const validationResult = await validateAddressData(addressData);

  if (!validationResult.valid) {
    res.status(400).json({
      error: 'Validation Error',
      errors: validationResult.errors
    });
    return;
  }

  // Create the address
  const address = await createAddress(addressData);

  res.status(201).json(address);
}));

/**
 * PUT /api/addresses/:id
 * Update an existing address
 */
router.put('/:id', authenticate, validateId, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body as Partial<Address>;

  // Validate the updates
  const validationResult = await validateAddressData(updates);

  if (!validationResult.valid) {
    res.status(400).json({
      error: 'Validation Error',
      errors: validationResult.errors
    });
    return;
  }

  // Update the address
  const address = await updateAddress(id, updates);

  if (!address) {
    res.status(404).json({
      error: 'Not Found',
      message: `Address with ID ${id} not found`
    });
    return;
  }

  res.json(address);
}));

/**
 * DELETE /api/addresses/:id
 * Delete an address
 */
router.delete('/:id', authenticate, validateId, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const deleted = await deleteAddress(id);

  if (!deleted) {
    res.status(404).json({
      error: 'Not Found',
      message: `Address with ID ${id} not found`
    });
    return;
  }

  res.status(204).send();
}));

export default router;
