import { Router } from "express";
import * as c from "./translationsTheme.controllers";

const router = Router({ mergeParams: true });

// Translation Project routes
router.get("/projects", c.getTranslationProjects);
router.post("/projects", c.createTranslationProject);
router.put("/projects/:projectId", c.updateTranslationProject);
router.delete("/projects/:projectId", c.deleteTranslationProject);

// Locale routes (project-scoped)
router.get("/projects/:projectId/locales", c.getLocales);
router.post("/projects/:projectId/locales", c.createLocale);
router.post("/projects/:projectId/locales/bulk", c.bulkCreateLocales);
router.put("/projects/:projectId/locales/:localeId", c.updateLocale);
router.delete("/projects/:projectId/locales/:localeId", c.deleteLocale);

// Translation routes (project-scoped)
router.get("/projects/:projectId/translations", c.getTranslations);
router.get("/projects/:projectId/translations/sections", c.getTranslationSections);
router.post("/projects/:projectId/translations", c.upsertTranslation);
router.post("/projects/:projectId/translations/bulk", c.bulkUpsertTranslations);
router.delete("/projects/:projectId/translations/:entryId", c.deleteTranslation);

// Theme Project routes
router.get("/theme-projects", c.getThemeProjects);
router.post("/theme-projects", c.createThemeProject);
router.put("/theme-projects/:projectId", c.updateThemeProject);
router.delete("/theme-projects/:projectId", c.deleteThemeProject);

// Theme routes (project-scoped)
router.get("/theme-projects/:projectId/themes", c.getThemes);
router.post("/theme-projects/:projectId/themes", c.createTheme);
router.get("/theme-projects/:projectId/themes/:themeId", c.getTheme);
router.put("/theme-projects/:projectId/themes/:themeId", c.updateTheme);
router.post("/theme-projects/:projectId/themes/:themeId/duplicate", c.duplicateTheme);
router.delete("/theme-projects/:projectId/themes/:themeId", c.deleteTheme);

export default router;
