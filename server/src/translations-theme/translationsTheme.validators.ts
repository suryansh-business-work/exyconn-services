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
  isDefault: z.boolean().optional(),
});

export const bulkCreateLocaleSchema = z.object({
  locales: z.array(
    z.object({
      code: z.string().min(2).max(10),
      name: z.string().min(1).max(100),
      isDefault: z.boolean().optional(),
    }),
  ),
});

export const updateLocaleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const listLocalesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

// ==================== Translation Validators ====================

export const upsertTranslationSchema = z.object({
  section: z.string().min(1).max(100),
  key: z.string().min(1).max(200),
  values: z.record(z.string(), z.string()),
  description: z.string().max(500).optional(),
});

export const bulkUpsertTranslationsSchema = z.object({
  section: z.string().min(1).max(100),
  entries: z.array(
    z.object({
      key: z.string().min(1).max(200),
      values: z.record(z.string(), z.string()),
      description: z.string().max(500).optional(),
    }),
  ),
});

export const listTranslationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(50),
  section: z.string().optional(),
  search: z.string().optional(),
});

// ==================== Theme Validators ====================

export const createThemeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isDefault: z.boolean().optional(),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    success: z.string(),
    warning: z.string(),
    error: z.string(),
    info: z.string(),
    background: z.string(),
    surface: z.string(),
    text: z.string(),
    textSecondary: z.string(),
    border: z.string(),
  }).passthrough(),
  typography: z.object({
    fontFamily: z.string(),
    fontSize: z.number(),
    fontWeightLight: z.number(),
    fontWeightRegular: z.number(),
    fontWeightMedium: z.number(),
    fontWeightBold: z.number(),
    h1Size: z.string(),
    h2Size: z.string(),
    h3Size: z.string(),
    bodySize: z.string(),
    captionSize: z.string(),
  }),
  spacing: z.object({
    unit: z.number(),
    xs: z.number(),
    sm: z.number(),
    md: z.number(),
    lg: z.number(),
    xl: z.number(),
  }),
  borderRadius: z.object({
    none: z.number(),
    sm: z.number(),
    md: z.number(),
    lg: z.number(),
    full: z.number(),
  }),
  components: z.record(z.string(), z.record(z.string(), z.string())).optional(),
});

export const updateThemeSchema = createThemeSchema.partial();

export const listThemesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});
