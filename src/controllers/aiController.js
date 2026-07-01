import chatModel from "../models/chatModel.js";
import UsageModel from "../models/usageModel.js";
import { generateChatSummary, getAIResponse } from "../services/ai/ai.service.js";

/**
 controller for AI chat
 @POST : /api/ai/chat
 */
export const chatWithAI = async (req, res) => {
  try {
    const { message, products } = req.body;
    const userId = req.userId;

    if (!message || !products) {
      return res.status(400).json({
        message: "Message and products required",
      });
    }

    let usage = await UsageModel.findOne({ userId });

    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;

    if (!usage || now - usage.date > ONE_DAY) {
      usage = await UsageModel.findOneAndUpdate(
        { userId },
        {
          userId,
          count: 0,
          date: now,
          lastRequestAt: 0,
        },
        { upsert: true, new: true }
      );
    }

    const DAILY_LIMIT = 80;

    if (usage.count >= DAILY_LIMIT) {
      return res.status(429).json({
        message: "Daily AI limit reached.",
      });
    }

    if (usage.lastRequestAt && now - usage.lastRequestAt < 3000) {
      return res.status(429).json({
        message: "Slow down!",
      });
    }

    let chat = await chatModel.findOne({ userId });

    if (!chat) {
      chat = await chatModel.create({ userId, messages: [] });
    }

    const { reply, suggestedProductIds } = await getAIResponse(
      message,
      products,
      chat.messages
    );

    //  save messages
    chat.messages.push({ role: "user", content: message });
    chat.messages.push({
      role: "assistant",
      content: reply,
      suggestedProductIds,
    });

    // 🔥 keep only last 12 messages
    const MAX = 12;
    if (chat.messages.length > MAX) {
      chat.messages = chat.messages.slice(-MAX);
    }

    await chat.save();

    //  auto summary trigger
    if (chat.messages.length >= 10) {
      const { generateChatSummary } = await import(
        "../services/ai/ai.service.js"
      );

      const summaryResult = await generateChatSummary(chat.messages);

      if (summaryResult.success) {
        chat.systemMemory = summaryResult.summary;
        await chat.save();
      }
    }

    await UsageModel.findOneAndUpdate(
      { userId },
      {
        $inc: { count: 1 },
        $set: { lastRequestAt: now, date: now },
      }
    );

    return res.status(200).json({ reply, suggestedProductIds });
  } catch (error) {
    console.error("CHAT CONTROLLER ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 controller to get chat history
 @GET : /api/ai/history
 */
export const getChatHistory = async (req, res) => {
  try {
    const chat = await chatModel.findOne({ userId: req.userId });
    return res.status(200).json({ messages: chat?.messages || [] });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 controller to clear chat history
 @DELETE : /api/ai/remove-history
 */
export const clearChatHistory = async (req, res) => {
  try {
    await chatModel.findOneAndUpdate(
      { userId: req.userId },
      { messages: [] },
      { upsert: true },
    );
    return res.status(200).json({ message: "Chat history cleared" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 controller to summarize and save chat context
 @POST : /api/ai/summarize
 */

export const summarizeChat = async (req, res) => {
  try {
    const { messages } = req.body;
    const userId = req.userId;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        message: "Messages are required.",
      });
    }

    // 🔥 only last meaningful messages (not full history)
    const cleanedMessages = messages
      .slice(-12) // limit context
      .filter((m) => m.role === "user")
      .map((m, i) => `User ${i + 1}: ${m.content.slice(0, 120)}`)
      .join("\n");

    if (messages.length < 8) {
      await chatModel.findOneAndUpdate(
        { userId },
        { messages: [] },
        { upsert: true }
      );

      return res.status(200).json({
        success: true,
        message: "Chat cleared (not enough data for summary).",
      });
    }

    const result = await generateChatSummary([
      {
        role: "user",
        content: cleanedMessages,
      },
    ]);

    if (!result.success) {
      return res.status(result.status).json({
        message: result.message,
      });
    }

    await chatModel.findOneAndUpdate(
      { userId },
      {
        messages: [
          {
            role: "system",
            content: `Summary: ${result.summary}`,
          },
        ],
      },
      { upsert: true }
    );

    return res.status(200).json({
      success: true,
      summary: result.summary,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong. Please try again later.",
    });
  }
};
