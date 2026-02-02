import { z } from 'zod';

// SMTP Configuration schema
export const smtpConfigSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  host: z.string().min(1, 'Host is required').max(255, 'Host too long'),
  port: z.number().int().min(1, 'Port must be at least 1').max(65535, 'Port must be at most 65535'),
  secure: z.boolean().default(true),
  username: z.string().min(1, 'Username is required').max(255, 'Username too long'),
  password: z.string().min(1, 'Password is required'),
  fromEmail: z.string().email('Invalid email address').max(255, 'Email too long'),
  fromName: z.string().min(1, 'From name is required').max(100, 'From name too long'),
  isDefault: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

// Create SMTP config schema
export const createSmtpConfigSchema = smtpConfigSchema;

// Update SMTP config schema (all fields optional)
export const updateSmtpConfigSchema = smtpConfigSchema.partial();

// Query params schema for listing
export const listSmtpConfigsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

// Types
export type SmtpConfig = z.infer<typeof smtpConfigSchema> & {
  id: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
};
export type CreateSmtpConfigInput = z.infer<typeof createSmtpConfigSchema>;
export type UpdateSmtpConfigInput = z.infer<typeof updateSmtpConfigSchema>;
export type ListSmtpConfigsQuery = z.infer<typeof listSmtpConfigsQuerySchema>;
