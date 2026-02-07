import { z } from "zod";

// Query params schema for listing logs
// Handle empty string from query params - transform to undefined
export const listEmailLogsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z
    .enum(["sent", "failed", "pending"])
    .optional()
    .or(z.literal("").transform(() => undefined)),
  recipient: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  startDate: z
    .string()
    .datetime()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  endDate: z
    .string()
    .datetime()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  apiKeyUsed: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
});

// Types
export type ListEmailLogsQuery = z.infer<typeof listEmailLogsQuerySchema>;

export interface EmailLog {
  id: string;
  organizationId: string;
  smtpConfigId: string;
  templateId: string;
  apiKeyUsed?: string;
  recipient: string;
  subject: string;
  status: "sent" | "failed" | "pending";
  messageId?: string;
  error?: string;
  variables: Record<string, string>;
  sentAt: string;
  createdAt: string;
}
