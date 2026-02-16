import { z } from "zod";

// ==================== Project Validators ====================

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export const listProjectsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});

// ==================== Locale Validators ====================

export const createLocaleSchema = z.object({
  code: z.string().min(2).max(10),
  name: z.string().min(1).max(100),
  nativeName: z.string().min(1).max(100),
  flag: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const bulkCreateLocaleSchema = z.object({
  locales: z.array(
    z.object({
      code: z.string().min(2).max(10),
      name: z.string().min(1).max(100),
      nativeName: z.string().min(1).max(100),
      flag: z.string().optional(),
      isDefault: z.boolean().optional(),
    }),
  ),
});

export const updateLocaleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  nativeName: z.string().min(1).max(100).optional(),
  flag: z.string().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const listLocalesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(50),
});

// ==================== Section Validators ====================

export const addSectionSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens only"),
});

// ==================== Translation Validators ====================

export const upsertTranslationSchema = z.object({
  section: z.string().min(1).max(100),
  key: z.string().min(1).max(200),
  values: z.record(z.string(), z.string()),
  defaultValue: z.string().max(5000).optional(),
  description: z.string().max(500).optional(),
});

export const bulkUpsertTranslationsSchema = z.object({
  section: z.string().min(1).max(100),
  entries: z.array(
    z.object({
      key: z.string().min(1).max(200),
      values: z.record(z.string(), z.string()),
      defaultValue: z.string().max(5000).optional(),
      description: z.string().max(500).optional(),
    }),
  ),
});

export const autoTranslateSchema = z.object({
  sourceLocaleCode: z.string().min(1).max(10),
  targetLocaleCode: z.string().min(1).max(10),
  texts: z.record(z.string(), z.string()),
});

export const listTranslationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(50),
  section: z.string().optional(),
  search: z.string().optional(),
});
