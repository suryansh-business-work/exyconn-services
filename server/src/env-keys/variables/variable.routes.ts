import { Router } from "express";
import { envVariableController } from "./variable.controllers";

const router = Router({ mergeParams: true });

router.get("/", envVariableController.list);
router.get("/all", envVariableController.getAllForApp);
router.post("/", envVariableController.create);
router.post("/bulk", envVariableController.bulkCreate);
router.get("/:variableId", envVariableController.get);
router.get("/:variableId/value", envVariableController.getActualValue);
router.patch("/:variableId", envVariableController.update);
router.delete("/:variableId", envVariableController.delete);

export default router;
