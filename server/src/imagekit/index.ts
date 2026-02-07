import { Router } from "express";
import { configRoutes } from "./config";
import { uploadRoutes } from "./upload";
import { historyRoutes, historyController } from "./history";

const router = Router({ mergeParams: true });

// Config routes
router.use("/config", configRoutes);

// Upload routes
router.use("/upload", uploadRoutes);

// History routes
router.use("/history", historyRoutes);

// Stats route
router.get("/stats", historyController.getStats);

// Delete file from history (also tries to delete from ImageKit)
router.delete("/files/:fileId", historyController.delete);

export default router;
