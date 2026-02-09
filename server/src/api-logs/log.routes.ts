import { Router } from "express";
import * as logController from "./log.controllers";

const router = Router({ mergeParams: true });

// Log CRUD
router.get("/", logController.getApiLogs);
router.get("/stats", logController.getApiLogStats);
router.get("/analytics", logController.getApiLogAnalytics);
router.get("/settings", logController.getApiLogSettings);
router.put("/settings", logController.updateApiLogSettings);
router.post("/", logController.createApiLog);
router.post("/batch", logController.createBatchApiLogs);
router.delete("/", logController.deleteApiLogs);
router.get("/:logId", logController.getApiLog);

export default router;
