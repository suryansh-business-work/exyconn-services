import { Router } from "express";
import { aiChatController } from "./chat.controllers";

const router = Router({ mergeParams: true });

router.get("/", aiChatController.list);
router.get("/stats", aiChatController.getStats);
router.post("/", aiChatController.create);
router.get("/:chatId", aiChatController.get);
router.patch("/:chatId", aiChatController.update);
router.delete("/:chatId", aiChatController.delete);
router.post("/:chatId/message", aiChatController.sendMessage);

export default router;
