import { groqChat } from "./providers/groq.provider.js";
import { openrouterChat } from "./providers/openrouter.provider.js";
import { geminiChat } from "./providers/gemini.provider.js";

const provider = process.env.AI_PROVIDER || "groq";

export const aiChat = async (messages, options = {}) => {
  if (!Array.isArray(messages)) {
    throw new Error("aiChat: messages must be an array");
  }

  const runners = {
    groq: groqChat,
    openrouter: openrouterChat,
    gemini: geminiChat,
  };

  const primary = runners[provider];

  const tryRun = async (fn) => {
    try {
      return await fn(messages, options);
    } catch (err) {
      console.error("Provider failed:", err.message);
      return null;
    }
  };

  // 1. try primary provider
  let result = await tryRun(primary);

  // 2. fallback chain
  if (!result && provider !== "groq") result = await tryRun(groqChat);
  if (!result && provider !== "openrouter") result = await tryRun(openrouterChat);
  if (!result && provider !== "gemini") result = await tryRun(geminiChat);

  return (
    result ||
    "AI service temporarily unavailable. Please try again later."
  );
};