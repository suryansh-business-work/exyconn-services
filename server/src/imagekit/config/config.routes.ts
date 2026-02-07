import { Router } from "express";
import { configController } from "./config.controllers";

const router = Router({ mergeParams: true });

router.get("/", configController.list);
router.get("/default", configController.getDefault);
router.get("/:configId", configController.getById);
router.post("/", configController.create);
router.put("/:configId", configController.update);
router.delete("/:configId", configController.delete);

export default router;
