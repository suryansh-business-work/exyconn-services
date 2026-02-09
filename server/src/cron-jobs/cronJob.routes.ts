import { Router } from "express";
import * as cronJobController from "./cronJob.controllers";

const router = Router({ mergeParams: true });

// CRUD operations
router.get("/", cronJobController.getCronJobs);
router.get("/stats", cronJobController.getCronJobStats);
router.get("/history", cronJobController.getCronJobHistory);
router.get("/events", cronJobController.cronJobEvents);
router.post("/", cronJobController.createCronJob);
router.get("/:jobId", cronJobController.getCronJob);
router.put("/:jobId", cronJobController.updateCronJob);
router.patch("/:jobId/toggle", cronJobController.togglePauseCronJob);
router.post("/:jobId/execute", cronJobController.executeCronJob);
router.delete("/:jobId", cronJobController.deleteCronJob);

export default router;
