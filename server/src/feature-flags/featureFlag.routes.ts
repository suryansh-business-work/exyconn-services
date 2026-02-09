import { Router } from "express";
import * as flagController from "./featureFlag.controllers";

const router = Router({ mergeParams: true });

router.get("/", flagController.getFeatureFlags);
router.get("/stats", flagController.getFeatureFlagStats);
router.post("/", flagController.createFeatureFlag);
router.post("/evaluate", flagController.evaluateFeatureFlag);
router.get("/:flagId", flagController.getFeatureFlag);
router.put("/:flagId", flagController.updateFeatureFlag);
router.patch("/:flagId/toggle", flagController.toggleFeatureFlag);
router.delete("/:flagId", flagController.deleteFeatureFlag);

export default router;
