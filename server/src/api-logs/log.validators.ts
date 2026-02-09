import { z } from "zod";

export const listApiLogsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  level: z
    .string()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  method: z
    .string()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  statusCode: z.coerce
    .number()
    .int()
    .optional()
    .transform((v) => (v === 0 ? undefined : v)),
  search: z
    .string()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  source: z
    .string()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  startDate: z
    .string()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  endDate: z
    .string()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  tags: z
    .string()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  minResponseTime: z.coerce
    .number()
    .optional()
    .transform((v) => (v === 0 ? undefined : v)),
  maxResponseTime: z.coerce
    .number()
    .optional()
    .transform((v) => (v === 0 ? undefined : v)),
});

export type ListApiLogsQuery = z.infer<typeof listApiLogsQuerySchema>;

export const createApiLogSchema = z.object({
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"]).default("GET"),
  url: z.string().default(""),
  statusCode: z.number().int().default(0),
  level: z.enum(["info", "warn", "error", "debug"]).default("info"),
  message: z.string().min(1, "Message is required"),
  requestHeaders: z.record(z.string(), z.string()).optional(),
  requestBody: z.unknown().optional(),
  responseBody: z.unknown().optional(),
  responseTime: z.number().default(0),
  ip: z.string().default(""),
  userAgent: z.string().default(""),
  apiKeyUsed: z.string().default(""),
  tags: z.array(z.string()).default([]),
  source: z.string().default(""),
  metadata: z.record(z.string(), z.unknown()).optional(),
  error: z.string().default(""),
  stack: z.string().default(""),
});

export type CreateApiLogInput = z.infer<typeof createApiLogSchema>;

export const createBatchApiLogsSchema = z.object({
  logs: z.array(createApiLogSchema).min(1).max(1000),
});

export type CreateBatchApiLogsInput = z.infer<typeof createBatchApiLogsSchema>;

export const updateApiLogSettingsSchema = z.object({
  retentionDays: z.number().int().min(1).max(365).optional(),
  maxLogsPerDay: z.number().int().min(1000).optional(),
  enabledLevels: z.array(z.enum(["info", "warn", "error", "debug"])).optional(),
  enableRequestBodyCapture: z.boolean().optional(),
  enableResponseBodyCapture: z.boolean().optional(),
  excludedPaths: z.array(z.string()).optional(),
});

export type UpdateApiLogSettingsInput = z.infer<typeof updateApiLogSettingsSchema>;
