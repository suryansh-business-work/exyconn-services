import { z } from 'zod';

export const createEnvVariableSchema = z.object({
  body: z.object({
    key: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[A-Z_][A-Z0-9_]*$/i, 'Key must be alphanumeric with underscores'),
    value: z.string().min(1).max(10000),
    isSecret: z.boolean().default(false),
    description: z.string().max(500).optional(),
  }),
  params: z.object({
    orgId: z.string().min(1),
    appId: z.string().min(1),
  }),
});

export const updateEnvVariableSchema = z.object({
  body: z.object({
    key: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[A-Z_][A-Z0-9_]*$/i)
      .optional(),
    value: z.string().min(1).max(10000).optional(),
    isSecret: z.boolean().optional(),
    description: z.string().max(500).optional(),
  }),
  params: z.object({
    orgId: z.string().min(1),
    appId: z.string().min(1),
    variableId: z.string().min(1),
  }),
});

export const listEnvVariablesSchema = z.object({
  params: z.object({
    orgId: z.string().min(1),
    appId: z.string().min(1),
  }),
  query: z.object({
    page: z.string().default('1').transform(Number),
    limit: z.string().default('50').transform(Number),
    search: z.string().optional(),
  }),
});

export const getEnvVariableSchema = z.object({
  params: z.object({
    orgId: z.string().min(1),
    appId: z.string().min(1),
    variableId: z.string().min(1),
  }),
});

export const deleteEnvVariableSchema = z.object({
  params: z.object({
    orgId: z.string().min(1),
    appId: z.string().min(1),
    variableId: z.string().min(1),
  }),
});

export const bulkCreateEnvVariablesSchema = z.object({
  body: z.object({
    variables: z
      .array(
        z.object({
          key: z.string().min(1).max(100),
          value: z.string().min(1).max(10000),
          isSecret: z.boolean().default(false),
          description: z.string().max(500).optional(),
        })
      )
      .min(1)
      .max(100),
  }),
  params: z.object({
    orgId: z.string().min(1),
    appId: z.string().min(1),
  }),
});
