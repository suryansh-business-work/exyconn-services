import { Router } from "express";
import * as sendController from "./send.controllers";

const router = Router({ mergeParams: true });

// Email send routes
router.post("/send", sendController.sendEmail);
router.post("/test-smtp/:configId", sendController.testSmtpConnection);

export default router;
