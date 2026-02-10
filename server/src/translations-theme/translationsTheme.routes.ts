import { Router } from "express";
import * as controller from "./translationsTheme.controllers";

const router = Router({ mergeParams: true });

// Locale routes
router.get("/locales", controller.getLocales);
router.post("/locales", controller.createLocale);
router.put("/locales/:localeId", controller.updateLocale);
router.delete("/locales/:localeId", controller.deleteLocale);

// Translation routes
router.get("/translations", controller.getTranslations);
router.get("/translations/sections", controller.getTranslationSections);
router.post("/translations", controller.upsertTranslation);
router.post("/translations/bulk", controller.bulkUpsertTranslations);
router.delete("/translations/:entryId", controller.deleteTranslation);

// Theme routes
router.get("/themes", controller.getThemes);
router.post("/themes", controller.createTheme);
router.get("/themes/:themeId", controller.getTheme);
router.put("/themes/:themeId", controller.updateTheme);
router.post("/themes/:themeId/duplicate", controller.duplicateTheme);
router.delete("/themes/:themeId", controller.deleteTheme);

export default router;
