/**
 * Zod validation schemas for request validation
 */

import { z } from 'zod';

/**
 * Address validation schema
 */
export const addressSchema = z.object({
  country: z.string().length(2, 'Country code must be 2 characters (ISO 3166-1 alpha-2)'),
  postal_code: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  street_address: z.string().optional(),
  recipient: z.string().optional()
});

/**
 * Address update schema (partial)
 */
export const addressUpdateSchema = addressSchema.partial();

/**
 * Login credentials schema
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

/**
 * Webhook registration schema
 */
export const webhookSchema = z.object({
  url: z.string().url('Invalid URL format'),
  events: z.array(
    z.enum(['address.created', 'address.updated', 'address.deleted'])
  ).min(1, 'At least one event must be specified'),
  secret: z.string().min(16, 'Secret must be at least 16 characters')
});

/**
 * Pagination query schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
});

/**
 * Helper function to validate request body
 */
export function validateBody<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.errors.map(err => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  });

  return { success: false, errors };
}
