import { z } from "zod";

export const listFeatureFlagsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z
    .string()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  search: z
    .string()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  tags: z
    .string()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  enabled: z
    .string()
    .optional()
    .transform((v) => {
      if (v === "" || v === undefined) return undefined;
      return v === "true";
    }),
});

export type ListFeatureFlagsQuery = z.infer<typeof listFeatureFlagsQuerySchema>;

const targetingRuleSchema = z.object({
  attribute: z.string().min(1),
  operator: z.enum(["equals", "not-equals", "contains", "in", "not-in"]),
  value: z.string().min(1),
});

export const createFeatureFlagSchema = z.object({
  key: z
    .string()
    .min(1, "Key is required")
    .regex(/^[a-z0-9_-]+$/, "Key must be lowercase alphanumeric with dashes or underscores"),
  name: z.string().min(1, "Name is required"),
  description: z.string().default(""),
  status: z.enum(["active", "inactive", "archived"]).default("active"),
  enabled: z.boolean().default(false),
  rolloutType: z.enum(["boolean", "percentage", "user-list"]).default("boolean"),
  rolloutPercentage: z.number().min(0).max(100).default(100),
  targetUsers: z.array(z.string()).default([]),
  targetingRules: z.array(targetingRuleSchema).default([]),
  tags: z.array(z.string()).default([]),
  defaultValue: z.boolean().default(false),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type CreateFeatureFlagInput = z.infer<typeof createFeatureFlagSchema>;

export const updateFeatureFlagSchema = createFeatureFlagSchema.partial();

export type UpdateFeatureFlagInput = z.infer<typeof updateFeatureFlagSchema>;

export const evaluateFeatureFlagSchema = z.object({
  key: z.string().min(1),
  userId: z.string().optional(),
  attributes: z.record(z.string(), z.string()).optional(),
});

export type EvaluateFeatureFlagInput = z.infer<typeof evaluateFeatureFlagSchema>;
