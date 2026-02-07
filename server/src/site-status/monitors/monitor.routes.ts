import { Router } from "express";
import { monitorController } from "./monitor.controllers";

const router = Router({ mergeParams: true });

router.get("/", monitorController.list);
router.get("/:monitorId", monitorController.get);
router.post("/", monitorController.create);
router.put("/:monitorId", monitorController.update);
router.delete("/:monitorId", monitorController.delete);
router.post("/:monitorId/check", monitorController.checkNow);

export default router;
