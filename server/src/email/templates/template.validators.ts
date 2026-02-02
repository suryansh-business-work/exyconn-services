import { z } from 'zod';

// Template variable schema
export const templateVariableSchema = z.object({
  name: z.string().min(1, 'Variable name is required').max(50, 'Variable name too long'),
  description: z.string().max(200, 'Description too long').optional(),
  defaultValue: z.string().max(500, 'Default value too long').optional(),
});

// Email Template schema
export const emailTemplateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  subject: z.string().min(1, 'Subject is required').max(255, 'Subject too long'),
  mjmlContent: z.string().min(1, 'MJML content is required'),
  variables: z.array(templateVariableSchema).optional().default([]),
  isActive: z.boolean().optional().default(true),
});

// Create Email Template schema
export const createEmailTemplateSchema = emailTemplateSchema;

// Update Email Template schema (all fields optional)
export const updateEmailTemplateSchema = emailTemplateSchema.partial();

// Preview template schema (for live preview)
export const previewTemplateSchema = z.object({
  mjmlContent: z.string().min(1, 'MJML content is required'),
  variables: z.record(z.string(), z.string()).optional().default({}),
});

// Query params schema for listing
export const listEmailTemplatesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

// Types
export type TemplateVariable = z.infer<typeof templateVariableSchema>;
export type EmailTemplate = z.infer<typeof emailTemplateSchema> & {
  id: string;
  organizationId: string;
  htmlContent?: string;
  createdAt: string;
  updatedAt: string;
};
export type CreateEmailTemplateInput = z.infer<typeof createEmailTemplateSchema>;
export type UpdateEmailTemplateInput = z.infer<typeof updateEmailTemplateSchema>;
export type PreviewTemplateInput = z.infer<typeof previewTemplateSchema>;
export type ListEmailTemplatesQuery = z.infer<typeof listEmailTemplatesQuerySchema>;
