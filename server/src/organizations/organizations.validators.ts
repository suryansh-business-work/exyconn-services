import { z } from 'zod';

// API Key schema (full, for responses)
export const apiKeySchema = z.object({
  keyName: z.string().min(1, 'Key name is required').max(50, 'Key name too long'),
  apiKey: z.string().min(32, 'API key must be at least 32 characters'),
  createdAt: z.string().datetime().optional(),
});

// API Key input schema (for creation - only keyName needed)
export const apiKeyInputSchema = z.object({
  keyName: z.string().min(1, 'Key name is required').max(50, 'Key name too long'),
});

// Organization schema
export const organizationSchema = z.object({
  orgName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  orgDescription: z.string().max(500, 'Description too long').optional(),
  orgSlug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50, 'Slug too long')
    .regex(/^[a-z][a-zA-Z0-9]*$/, 'Slug must be camelCase starting with lowercase'),
  orgType: z.enum(['Service', 'Product']),
  orgApiKeys: z.array(apiKeyInputSchema).optional().default([]),
});

// Create organization schema
export const createOrganizationSchema = organizationSchema;

// Update organization schema (all fields optional except id)
export const updateOrganizationSchema = organizationSchema.partial();

// Add API key schema
export const addApiKeySchema = z.object({
  keyName: z.string().min(1, 'Key name is required').max(50, 'Key name too long'),
});

// Query params schema for listing
export const listOrganizationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(['orgName', 'orgSlug', 'orgType', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  orgType: z.enum(['Service', 'Product']).optional(),
});

// Types
export type ApiKey = z.infer<typeof apiKeySchema>;
export type Organization = z.infer<typeof organizationSchema> & {
  id: string;
  createdAt: string;
  updatedAt: string;
};
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type ListOrganizationsQuery = z.infer<typeof listOrganizationsQuerySchema>;
