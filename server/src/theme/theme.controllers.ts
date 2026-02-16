import { Request, Response } from "express";
import {
  themeProjectService,
  themeService,
} from "./theme.services";
import {
  createProjectSchema,
  updateProjectSchema,
  listProjectsQuerySchema,
  createThemeSchema,
  updateThemeSchema,
  listThemesQuerySchema,
} from "./theme.validators";

// ==================== Theme Project Controllers ====================

export const getThemeProjects = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const parsed = listProjectsQuerySchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ error: "Invalid query", details: parsed.error.issues });
    const result = await themeProjectService.list(orgId, parsed.data);
    res.json(result);
  } catch { res.status(500).json({ error: "Failed to list theme projects" }); }
};

export const createThemeProject = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const parsed = createProjectSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    const project = await themeProjectService.create(orgId, parsed.data);
    res.status(201).json(project);
  } catch { res.status(500).json({ error: "Failed to create theme project" }); }
};

export const updateThemeProject = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const projectId = req.params.projectId as string;
    const parsed = updateProjectSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    const project = await themeProjectService.update(orgId, projectId, parsed.data);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch { res.status(500).json({ error: "Failed to update theme project" }); }
};

export const deleteThemeProject = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const projectId = req.params.projectId as string;
    const deleted = await themeProjectService.delete(orgId, projectId);
    if (!deleted) return res.status(404).json({ error: "Project not found" });
    res.json({ success: true });
  } catch { res.status(500).json({ error: "Failed to delete theme project" }); }
};

// ==================== Theme Controllers ====================

export const getThemes = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const projectId = req.params.projectId as string;
    const parsed = listThemesQuerySchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ error: "Invalid query", details: parsed.error.issues });
    const result = await themeService.list(orgId, projectId, parsed.data);
    res.json(result);
  } catch { res.status(500).json({ error: "Failed to list themes" }); }
};

export const getTheme = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const projectId = req.params.projectId as string;
    const themeId = req.params.themeId as string;
    const theme = await themeService.get(orgId, projectId, themeId);
    if (!theme) return res.status(404).json({ error: "Theme not found" });
    res.json(theme);
  } catch { res.status(500).json({ error: "Failed to get theme" }); }
};

export const createTheme = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const projectId = req.params.projectId as string;
    const parsed = createThemeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    const theme = await themeService.create(orgId, projectId, parsed.data as Parameters<typeof themeService.create>[2]);
    res.status(201).json(theme);
  } catch { res.status(500).json({ error: "Failed to create theme" }); }
};

export const updateTheme = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const projectId = req.params.projectId as string;
    const themeId = req.params.themeId as string;
    const parsed = updateThemeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    const theme = await themeService.update(orgId, projectId, themeId, parsed.data);
    if (!theme) return res.status(404).json({ error: "Theme not found" });
    res.json(theme);
  } catch { res.status(500).json({ error: "Failed to update theme" }); }
};

export const deleteTheme = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const projectId = req.params.projectId as string;
    const themeId = req.params.themeId as string;
    const deleted = await themeService.delete(orgId, projectId, themeId);
    if (!deleted) return res.status(404).json({ error: "Theme not found" });
    res.json({ success: true });
  } catch { res.status(500).json({ error: "Failed to delete theme" }); }
};

export const duplicateTheme = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const projectId = req.params.projectId as string;
    const themeId = req.params.themeId as string;
    const theme = await themeService.duplicate(orgId, projectId, themeId);
    if (!theme) return res.status(404).json({ error: "Theme not found" });
    res.status(201).json(theme);
  } catch { res.status(500).json({ error: "Failed to duplicate theme" }); }
};
