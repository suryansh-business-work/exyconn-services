import { z } from 'zod';

export const createEnvAppSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(500).optional(),
    environment: z.enum(['development', 'staging', 'production']).default('development'),
  }),
  params: z.object({
    orgId: z.string().min(1),
  }),
});

export const updateEnvAppSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(500).optional(),
    environment: z.enum(['development', 'staging', 'production']).optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    orgId: z.string().min(1),
    appId: z.string().min(1),
  }),
});

export const listEnvAppsSchema = z.object({
  params: z.object({
    orgId: z.string().min(1),
  }),
  query: z.object({
    page: z.string().default('1').transform(Number),
    limit: z.string().default('10').transform(Number),
    search: z.string().optional(),
    environment: z.enum(['development', 'staging', 'production']).optional(),
  }),
});

export const getEnvAppSchema = z.object({
  params: z.object({
    orgId: z.string().min(1),
    appId: z.string().min(1),
  }),
});

export const deleteEnvAppSchema = z.object({
  params: z.object({
    orgId: z.string().min(1),
    appId: z.string().min(1),
  }),
});
