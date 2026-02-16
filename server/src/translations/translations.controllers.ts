import { Request, Response } from "express";
import {
  translationProjectService,
  localeService,
  translationService,
  autoTranslateService,
} from "./translations.services";
import {
  createProjectSchema,
  updateProjectSchema,
  listProjectsQuerySchema,
  createLocaleSchema,
  bulkCreateLocaleSchema,
  updateLocaleSchema,
  listLocalesQuerySchema,
  addSectionSchema,
  autoTranslateSchema,
  upsertTranslationSchema,
  bulkUpsertTranslationsSchema,
  listTranslationsQuerySchema,
} from "./translations.validators";

// ==================== Translation Project Controllers ====================

export const getTranslationProjects = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const parsed = listProjectsQuerySchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ error: "Invalid query", details: parsed.error.issues });
    const result = await translationProjectService.list(orgId, parsed.data);
    res.json(result);
  } catch { res.status(500).json({ error: "Failed to list translation projects" }); }
};

export const createTranslationProject = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const parsed = createProjectSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    const project = await translationProjectService.create(orgId, parsed.data);
    res.status(201).json(project);
  } catch { res.status(500).json({ error: "Failed to create translation project" }); }
};

export const updateTranslationProject = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const projectId = req.params.projectId as string;
    const parsed = updateProjectSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    const project = await translationProjectService.update(orgId, projectId, parsed.data);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch { res.status(500).json({ error: "Failed to update translation project" }); }
};

export const deleteTranslationProject = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const projectId = req.params.projectId as string;
    const deleted = await translationProjectService.delete(orgId, projectId);
    if (!deleted) return res.status(404).json({ error: "Project not found" });
    res.json({ success: true });
  } catch { res.status(500).json({ error: "Failed to delete translation project" }); }
};

// ==================== Locale Controllers ====================

export const getLocaleCountsForProjects = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const projectIds = ((req.query.projectIds as string) || "").split(",").filter(Boolean);
    if (projectIds.length === 0) return res.json({ counts: {} });
    const counts = await localeService.getLocaleCounts(orgId, projectIds);
    res.json({ counts });
  } catch {
    res.status(500).json({ error: "Failed to get locale counts" });
  }
};

export const getLocales = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const projectId = req.params.projectId as string;
    const parsed = listLocalesQuerySchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ error: "Invalid query", details: parsed.error.issues });
    const result = await localeService.list(orgId, projectId, parsed.data.page, parsed.data.limit);
    res.json(result);
  } catch { res.status(500).json({ error: "Failed to list locales" }); }
};

export const createLocale = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const projectId = req.params.projectId as string;
    const parsed = createLocaleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    const locale = await localeService.create(orgId, projectId, parsed.data);
    res.status(201).json(locale);
  } catch { res.status(500).json({ error: "Failed to create locale" }); }
};

export const bulkCreateLocales = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const projectId = req.params.projectId as string;
    const parsed = bulkCreateLocaleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    const locales = await localeService.bulkCreate(orgId, projectId, parsed.data.locales);
    res.status(201).json({ created: locales.length, data: locales });
  } catch { res.status(500).json({ error: "Failed to bulk create locales" }); }
};

export const updateLocale = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const projectId = req.params.projectId as string;
    const localeId = req.params.localeId as string;
    const parsed = updateLocaleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    const locale = await localeService.update(orgId, projectId, localeId, parsed.data);
    if (!locale) return res.status(404).json({ error: "Locale not found" });
    res.json(locale);
  } catch { res.status(500).json({ error: "Failed to update locale" }); }
};

export const deleteLocale = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const projectId = req.params.projectId as string;
    const localeId = req.params.localeId as string;
    const deleted = await localeService.delete(orgId, projectId, localeId);
    if (!deleted) return res.status(404).json({ error: "Locale not found" });
    res.json({ success: true });
  } catch { res.status(500).json({ error: "Failed to delete locale" }); }
};

// ==================== Section Controllers ====================

export const addSection = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const projectId = req.params.projectId as string;
    const parsed = addSectionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    const project = await translationProjectService.addSection(orgId, projectId, parsed.data);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json({ success: true, sections: project.sections });
  } catch {
    res.status(500).json({ error: "Failed to add section" });
  }
};

export const removeSection = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const projectId = req.params.projectId as string;
    const slug = decodeURIComponent(req.params.sectionName as string);
    const project = await translationProjectService.removeSection(orgId, projectId, slug);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json({ success: true, sections: project.sections });
  } catch {
    res.status(500).json({ error: "Failed to remove section" });
  }
};

// ==================== Translation Controllers ====================

export const getTranslations = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const projectId = req.params.projectId as string;
    const parsed = listTranslationsQuerySchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ error: "Invalid query", details: parsed.error.issues });
    const result = await translationService.list(orgId, projectId, parsed.data);
    res.json(result);
  } catch { res.status(500).json({ error: "Failed to list translations" }); }
};

export const getTranslationSections = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const projectId = req.params.projectId as string;
    const sections = await translationService.getSections(orgId, projectId);
    res.json({ sections });
  } catch { res.status(500).json({ error: "Failed to get sections" }); }
};

export const upsertTranslation = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const projectId = req.params.projectId as string;
    const parsed = upsertTranslationSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    const entry = await translationService.upsert(orgId, projectId, parsed.data);
    res.json(entry);
  } catch { res.status(500).json({ error: "Failed to upsert translation" }); }
};

export const bulkUpsertTranslations = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const projectId = req.params.projectId as string;
    const parsed = bulkUpsertTranslationsSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    const result = await translationService.bulkUpsert(orgId, projectId, parsed.data.section, parsed.data.entries);
    res.json(result);
  } catch { res.status(500).json({ error: "Failed to bulk upsert translations" }); }
};

export const deleteTranslation = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const projectId = req.params.projectId as string;
    const entryId = req.params.entryId as string;
    const deleted = await translationService.delete(orgId, projectId, entryId);
    if (!deleted) return res.status(404).json({ error: "Translation not found" });
    res.json({ success: true });
  } catch { res.status(500).json({ error: "Failed to delete translation" }); }
};

// ==================== Auto-Translate Controllers ====================

export const autoTranslate = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const projectId = req.params.projectId as string;
    const parsed = autoTranslateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    const translations = await autoTranslateService.translate(
      orgId, projectId, parsed.data.sourceLocaleCode, parsed.data.targetLocaleCode, parsed.data.texts,
    );
    res.json({ translations });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to auto-translate";
    res.status(500).json({ error: message });
  }
};
