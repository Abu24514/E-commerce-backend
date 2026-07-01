import { buildSystemPrompt } from "../prompt.js";
import { aiChat } from "./ai.router.js";

export const getAIResponse = async (userMessage, products, history) => {
  try {
    const safeHistory = Array.isArray(history) ? history : [];

    const systemPrompt = buildSystemPrompt({
      products,
      isFirstMessage: safeHistory.length === 0,
    });

    const rawReply = await aiChat(
      [
        { role: "system", content: systemPrompt },
        ...safeHistory.slice(-10).map((m) => ({
          role: "user",
          content: m.content,
        })),
        { role: "user", content: userMessage },
      ],
      {
        temperature: 0.3,
        maxTokens: 180,
      },
    );

    const match = rawReply.match(/\|\|\|PRODUCTS:(\[[^\]]*\])\|\|\|/);

    let suggestedProductIds = [];

    if (match) {
      try {
        suggestedProductIds = JSON.parse(match[1]);
      } catch { }
    }

    const reply = rawReply
      .replace(/\|\|\|PRODUCTS:\[[^\]]*\]\|\|\|/g, "")
      .trim();

    return { reply, suggestedProductIds };
  } catch (error) {
    console.error(error);

    return {
      reply:
        error.message || "Sorry, something went wrong. Please try again later.",
      suggestedProductIds: [],
    };
  }
};

export const generateChatSummary = async (messages) => {
  try {
    if (!Array.isArray(messages) || messages.length === 0) {
      return {
        success: false,
        status: 400,
        message: "Messages required",
      };
    }

    const cleanedMessages = messages
      .filter((m) => m.role === "user")
      .slice(-10)
      .map((m) => ({
        role: "user",
        content: m.content.slice(0, 120),
      }));

    const summary = await aiChat(
      [
        {
          role: "system",
          content: `
You are a shopping assistant.

Summarize user preferences in 1–2 short sentences.

Focus:
- Product type
- Budget
- Color
- Size
- Style

Ignore greetings and noise.
          `.trim(),
        },
        ...cleanedMessages,
      ],
      {
        temperature: 0.1,
        maxTokens: 60,
      },
    );

    return {
      success: true,
      summary,
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: error.message,
    };
  }
};
