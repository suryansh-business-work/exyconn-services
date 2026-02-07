import { Router } from "express";
import * as smtpController from "./smtp.controllers";

const router = Router({ mergeParams: true });

// SMTP Configuration routes (all scoped to organization)
router.post("/", smtpController.createSmtpConfig);
router.get("/", smtpController.getSmtpConfigs);
router.get("/default", smtpController.getDefaultSmtpConfig);
router.get("/:configId", smtpController.getSmtpConfig);
router.put("/:configId", smtpController.updateSmtpConfig);
router.delete("/:configId", smtpController.deleteSmtpConfig);

export default router;
