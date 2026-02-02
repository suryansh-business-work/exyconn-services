import { z } from 'zod';

export const createConfigSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    publicKey: z.string().min(10),
    privateKey: z.string().min(10),
    urlEndpoint: z
      .string()
      .url()
      .regex(/^https:\/\/ik\.imagekit\.io\//, 'Must be a valid ImageKit URL endpoint'),
    isDefault: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateConfigSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    publicKey: z.string().min(10).optional(),
    privateKey: z.string().min(10).optional(),
    urlEndpoint: z
      .string()
      .url()
      .regex(/^https:\/\/ik\.imagekit\.io\//)
      .optional(),
    isDefault: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const listConfigSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10)),
    search: z.string().optional(),
    isActive: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
  }),
});

export type CreateConfigInput = z.infer<typeof createConfigSchema>['body'];
export type UpdateConfigInput = z.infer<typeof updateConfigSchema>['body'];
export type ListConfigQuery = z.infer<typeof listConfigSchema>['query'];
