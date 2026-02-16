import { Router } from "express";
import * as c from "./translations.controllers";

const router = Router({ mergeParams: true });

// Translation Project routes
router.get("/projects", c.getTranslationProjects);
router.get("/projects/locale-counts", c.getLocaleCountsForProjects);
router.post("/projects", c.createTranslationProject);
router.put("/projects/:projectId", c.updateTranslationProject);
router.delete("/projects/:projectId", c.deleteTranslationProject);

// Section routes (project-scoped)
router.post("/projects/:projectId/sections", c.addSection);
router.delete("/projects/:projectId/sections/:sectionName", c.removeSection);

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
router.post("/projects/:projectId/translations/auto-translate", c.autoTranslate);
router.delete("/projects/:projectId/translations/:entryId", c.deleteTranslation);

export default router;
