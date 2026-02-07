import { Router } from "express";
import { envAppRoutes } from "./apps";
import { envVariableRoutes } from "./variables";

const router = Router({ mergeParams: true });

// App routes
router.use("/apps", envAppRoutes);

// Variable routes (nested under apps)
router.use("/apps/:appId/variables", envVariableRoutes);

export default router;
