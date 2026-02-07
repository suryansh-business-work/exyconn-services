import { Router } from "express";
import { aiCompanyRoutes } from "./companies";
import { aiChatRoutes } from "./chats";

const router = Router({ mergeParams: true });

router.use("/companies", aiCompanyRoutes);
router.use("/chats", aiChatRoutes);

export default router;
