import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { addressService, validateAddress } from '../services/addressService.js';
import type { JWTPayload } from '../types/index.js';

const addressSchema = z.object({
  country: z.string().min(2).max(2),
  postal_code: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  street_address: z.string().optional(),
  recipient: z.string().optional()
});

export default async function addressRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/addresses
   * List all addresses for the authenticated user
   */
  fastify.get('/api/addresses', {
    onRequest: [authenticate],
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            addresses: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  country: { type: 'string' },
                  postal_code: { type: 'string' },
                  province: { type: 'string' },
                  city: { type: 'string' },
                  street_address: { type: 'string' },
                  recipient: { type: 'string' }
                }
              }
            },
            count: { type: 'number' }
          }
        }
      }
    }
  }, async (request) => {
    const user = request.user as JWTPayload;
    const addresses = addressService.getAll(user.id);

    return {
      addresses,
      count: addresses.length
    };
  });

  /**
   * POST /api/addresses
   * Create a new address
   */
  fastify.post('/api/addresses', {
    onRequest: [authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['country'],
        properties: {
          country: { type: 'string', minLength: 2, maxLength: 2 },
          postal_code: { type: 'string' },
          province: { type: 'string' },
          city: { type: 'string' },
          street_address: { type: 'string' },
          recipient: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const user = request.user as JWTPayload;
    const body = request.body as any;

    // Validate with Zod
    const parseResult = addressSchema.safeParse(body);
    if (!parseResult.success) {
      return reply.code(400).send({
        error: 'Validation Error',
        errors: parseResult.error.errors
      });
    }

    const addressData = parseResult.data;

    // Validate the address
    const validation = await validateAddress(addressData);

    if (!validation.valid) {
      return reply.code(400).send({
        error: 'Validation Error',
        errors: validation.errors
      });
    }

    // Create the address
    const address = await addressService.create(addressData, user.id);

    return reply.code(201).send(address);
  });

  /**
   * GET /api/addresses/:id
   * Get a specific address
   */
  fastify.get<{ Params: { id: string } }>('/api/addresses/:id', {
    onRequest: [authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    const user = request.user as JWTPayload;
    const { id } = request.params;

    const address = addressService.getById(id, user.id);

    if (!address) {
      return reply.code(404).send({
        error: 'Not Found',
        message: `Address with ID ${id} not found`
      });
    }

    return address;
  });

  /**
   * PUT /api/addresses/:id
   * Update an address
   */
  fastify.put<{ Params: { id: string } }>('/api/addresses/:id', {
    onRequest: [authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          country: { type: 'string', minLength: 2, maxLength: 2 },
          postal_code: { type: 'string' },
          province: { type: 'string' },
          city: { type: 'string' },
          street_address: { type: 'string' },
          recipient: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const user = request.user as JWTPayload;
    const { id } = request.params;
    const updates = request.body as any;

    // Validate the updates
    const validation = await validateAddress(updates);

    if (!validation.valid) {
      return reply.code(400).send({
        error: 'Validation Error',
        errors: validation.errors
      });
    }

    // Update the address
    const address = await addressService.update(id, updates, user.id);

    if (!address) {
      return reply.code(404).send({
        error: 'Not Found',
        message: `Address with ID ${id} not found`
      });
    }

    return address;
  });

  /**
   * DELETE /api/addresses/:id
   * Delete an address
   */
  fastify.delete<{ Params: { id: string } }>('/api/addresses/:id', {
    onRequest: [authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    const user = request.user as JWTPayload;
    const { id } = request.params;

    const deleted = await addressService.delete(id, user.id);

    if (!deleted) {
      return reply.code(404).send({
        error: 'Not Found',
        message: `Address with ID ${id} not found`
      });
    }

    return reply.code(204).send();
  });

  /**
   * POST /api/addresses/validate
   * Validate an address without saving it
   */
  fastify.post('/api/addresses/validate', {
    onRequest: [authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['country'],
        properties: {
          country: { type: 'string', minLength: 2, maxLength: 2 },
          postal_code: { type: 'string' },
          province: { type: 'string' },
          city: { type: 'string' },
          street_address: { type: 'string' },
          recipient: { type: 'string' }
        }
      }
    }
  }, async (request) => {
    const body = request.body as any;

    const validation = await validateAddress(body);

    return {
      valid: validation.valid,
      errors: validation.errors,
      address: validation.valid ? body : undefined
    };
  });
}
