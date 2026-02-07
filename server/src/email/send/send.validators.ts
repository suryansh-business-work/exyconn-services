import { z } from "zod";

// Send email schema
export const sendEmailSchema = z.object({
  smtpConfigId: z.string().min(1, "SMTP configuration is required"),
  templateId: z.string().min(1, "Email template is required"),
  to: z.string().email("Invalid recipient email address"),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  variables: z.record(z.string(), z.string()).optional().default({}),
  subject: z.string().max(255, "Subject too long").optional(), // Override template subject
  apiKeyUsed: z.string().optional(), // For logging purposes
});

// Types
export type SendEmailInput = z.infer<typeof sendEmailSchema>;

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  recipient: string;
  cc?: string;
  bcc?: string;
  subject: string;
  sentAt: string;
}
