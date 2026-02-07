import { z } from "zod";

export const listHistorySchema = z.object({
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
    fileType: z.string().optional(),
    uploadMode: z
      .enum(["single", "multiple", "single-array", "multiple-array"])
      .optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    configId: z.string().optional(),
  }),
});

export type ListHistoryQuery = z.infer<typeof listHistorySchema>["query"];
