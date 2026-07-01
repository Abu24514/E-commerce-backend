import express from "express";
import { chatWithAI, getChatHistory, clearChatHistory, summarizeChat } from "../controllers/aiController.js";
import userAuth from "../middlewares/userAuth.js";

const aiRoutes = express.Router();

aiRoutes.post("/chat", userAuth, chatWithAI);
aiRoutes.post("/summarize", userAuth, summarizeChat);
aiRoutes.get("/history", userAuth, getChatHistory);
aiRoutes.delete("/remove-history", userAuth, clearChatHistory);

export default aiRoutes;