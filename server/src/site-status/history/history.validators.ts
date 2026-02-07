import { z } from "zod";

export const listHistorySchema = z.object({
  params: z.object({
    orgId: z.string().min(1),
  }),
  query: z.object({
    page: z.string().default("1").transform(Number),
    limit: z.string().default("10").transform(Number),
    monitorId: z.string().optional(),
    status: z.enum(["healthy", "warning", "error"]).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export const getHistorySchema = z.object({
  params: z.object({
    orgId: z.string().min(1),
    checkId: z.string().min(1),
  }),
});

export const getStatsSchema = z.object({
  params: z.object({
    orgId: z.string().min(1),
  }),
});
