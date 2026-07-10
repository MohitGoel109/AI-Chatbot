import { Router } from "express";
import { handleChat, handleChatStream } from "../controllers/chat.controller.js";
import { chatRateLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.post("/chat", chatRateLimiter, handleChat);
router.post("/chat/stream", chatRateLimiter, handleChatStream);

export default router;
