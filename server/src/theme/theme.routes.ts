import { Router } from "express";
import * as c from "./theme.controllers";

const router = Router({ mergeParams: true });

// Theme Project routes
router.get("/projects", c.getThemeProjects);
router.post("/projects", c.createThemeProject);
router.put("/projects/:projectId", c.updateThemeProject);
router.delete("/projects/:projectId", c.deleteThemeProject);

// Theme routes (project-scoped)
router.get("/projects/:projectId/themes", c.getThemes);
router.post("/projects/:projectId/themes", c.createTheme);
router.get("/projects/:projectId/themes/:themeId", c.getTheme);
router.put("/projects/:projectId/themes/:themeId", c.updateTheme);
router.post("/projects/:projectId/themes/:themeId/duplicate", c.duplicateTheme);
router.delete("/projects/:projectId/themes/:themeId", c.deleteTheme);

export default router;
