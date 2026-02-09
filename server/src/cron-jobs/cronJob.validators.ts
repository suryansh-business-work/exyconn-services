import { z } from "zod";

export const listCronJobsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum(["active", "paused", "completed", "failed"])
    .optional(),
  search: z.string().optional(),
  tags: z.string().optional(),
});

export const createCronJobSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  cronExpression: z
    .string()
    .min(1)
    .regex(
      /^(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)$/,
      "Invalid cron expression (use 5-part format: minute hour day month weekday)",
    ),
  timezone: z.string().default("UTC"),
  webhookUrl: z.string().url("Invalid webhook URL"),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]).default("GET"),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.string().optional(),
  maxRetries: z.number().int().min(0).max(10).default(3),
  timeout: z.number().int().min(1000).max(120000).default(30000),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateCronJobSchema = createCronJobSchema.partial().extend({
  status: z.enum(["active", "paused", "completed", "failed"]).optional(),
});

export const listCronJobHistoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cronJobId: z.string().optional(),
  status: z.enum(["success", "failure"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const executeCronJobSchema = z.object({
  cronJobId: z.string().min(1),
});
