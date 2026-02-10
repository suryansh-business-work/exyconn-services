import { Request, Response } from "express";
import { localeService, translationService, themeService } from "./translationsTheme.services";
import {
  createLocaleSchema,
  updateLocaleSchema,
  listLocalesQuerySchema,
  upsertTranslationSchema,
  bulkUpsertTranslationsSchema,
  listTranslationsQuerySchema,
  createThemeSchema,
  updateThemeSchema,
  listThemesQuerySchema,
} from "./translationsTheme.validators";

// ==================== Locale Controllers ====================

export const getLocales = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const parsed = listLocalesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid query", details: parsed.error.issues });
    }
    const result = await localeService.list(orgId, parsed.data.page, parsed.data.limit);
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to list locales" });
  }
};

export const createLocale = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const parsed = createLocaleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    }
    const locale = await localeService.create(orgId, parsed.data);
    res.status(201).json(locale);
  } catch {
    res.status(500).json({ error: "Failed to create locale" });
  }
};

export const updateLocale = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const localeId = req.params.localeId as string;
    const parsed = updateLocaleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    }
    const locale = await localeService.update(orgId, localeId, parsed.data);
    if (!locale) return res.status(404).json({ error: "Locale not found" });
    res.json(locale);
  } catch {
    res.status(500).json({ error: "Failed to update locale" });
  }
};

export const deleteLocale = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const localeId = req.params.localeId as string;
    const deleted = await localeService.delete(orgId, localeId);
    if (!deleted) return res.status(404).json({ error: "Locale not found" });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete locale" });
  }
};

// ==================== Translation Controllers ====================

export const getTranslations = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const parsed = listTranslationsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid query", details: parsed.error.issues });
    }
    const result = await translationService.list(orgId, parsed.data);
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to list translations" });
  }
};

export const getTranslationSections = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const sections = await translationService.getSections(orgId);
    res.json({ sections });
  } catch {
    res.status(500).json({ error: "Failed to get sections" });
  }
};

export const upsertTranslation = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const parsed = upsertTranslationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    }
    const entry = await translationService.upsert(orgId, parsed.data);
    res.json(entry);
  } catch {
    res.status(500).json({ error: "Failed to upsert translation" });
  }
};

export const bulkUpsertTranslations = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const parsed = bulkUpsertTranslationsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    }
    const result = await translationService.bulkUpsert(orgId, parsed.data.section, parsed.data.entries);
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to bulk upsert translations" });
  }
};

export const deleteTranslation = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const entryId = req.params.entryId as string;
    const deleted = await translationService.delete(orgId, entryId);
    if (!deleted) return res.status(404).json({ error: "Translation not found" });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete translation" });
  }
};

// ==================== Theme Controllers ====================

export const getThemes = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const parsed = listThemesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid query", details: parsed.error.issues });
    }
    const result = await themeService.list(orgId, parsed.data);
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to list themes" });
  }
};

export const getTheme = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const themeId = req.params.themeId as string;
    const theme = await themeService.get(orgId, themeId);
    if (!theme) return res.status(404).json({ error: "Theme not found" });
    res.json(theme);
  } catch {
    res.status(500).json({ error: "Failed to get theme" });
  }
};

export const createTheme = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const parsed = createThemeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    }
    const theme = await themeService.create(orgId, parsed.data as Parameters<typeof themeService.create>[1]);
    res.status(201).json(theme);
  } catch {
    res.status(500).json({ error: "Failed to create theme" });
  }
};

export const updateTheme = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const themeId = req.params.themeId as string;
    const parsed = updateThemeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    }
    const theme = await themeService.update(orgId, themeId, parsed.data);
    if (!theme) return res.status(404).json({ error: "Theme not found" });
    res.json(theme);
  } catch {
    res.status(500).json({ error: "Failed to update theme" });
  }
};

export const deleteTheme = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const themeId = req.params.themeId as string;
    const deleted = await themeService.delete(orgId, themeId);
    if (!deleted) return res.status(404).json({ error: "Theme not found" });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete theme" });
  }
};

export const duplicateTheme = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const themeId = req.params.themeId as string;
    const theme = await themeService.duplicate(orgId, themeId);
    if (!theme) return res.status(404).json({ error: "Theme not found" });
    res.status(201).json(theme);
  } catch {
    res.status(500).json({ error: "Failed to duplicate theme" });
  }
};
