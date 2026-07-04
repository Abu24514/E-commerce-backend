import { buildSystemPrompt } from "../prompt.js";
import { aiChat } from "./ai.router.js";


 const detectLanguage = (text) => {
  if (!text) return "English";

  // Devanagari script check
  if (/[\u0900-\u097F]/.test(text)) return "Hindi";

  const hinglishWords = [
    "hai", "hain", "chahiye", "kitna", "kaisa", "kaise", "mujhe",
    "aap", "aapka", "kya", "nahi", "haan", "acha", "theek", "batao",
    "dikhao", "rupaye", "rupees", "wala", "wali", "bhai", "yaar",
  ];
  const lowerText = text.toLowerCase();
  const hasHinglishWord = hinglishWords.some((word) =>
    new RegExp(`\\b${word}\\b`).test(lowerText)
  );

  return hasHinglishWord ? "Hinglish" : "English";
};

export const getAIResponse = async (userMessage, products, history, systemMemory) => {
  try {
    const safeHistory = Array.isArray(history) ? history : [];

    // collect all product IDs already suggested in this conversation
    const alreadySuggestedIds = safeHistory
      .filter((m) => m.role === "assistant" && Array.isArray(m.suggestedProductIds))
      .flatMap((m) => m.suggestedProductIds);

    // pre-filter relevant products instead of blindly slicing first 30
    const relevantProducts = filterRelevantProducts(products, userMessage, safeHistory);

    // detect language from the CURRENT user message, not from AI's guess
    const detectedLanguage = detectLanguage(userMessage);

    const systemPrompt = buildSystemPrompt({
      products: relevantProducts,
      isFirstMessage: safeHistory.length === 0,
      userMemory: systemMemory || "",
      alreadySuggestedIds,
      detectedLanguage,
    });

    const rawReply = await aiChat(
      [
        { role: "system", content: systemPrompt },
        ...safeHistory.slice(-10).map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
        { role: "user", content: userMessage },
      ],
      { temperature: 0.3, maxTokens: 400 }
    );

    if (!rawReply || typeof rawReply !== "string") {
      throw new Error("AI returned an empty response.");
    }

    // PRODUCTS block now expected at the START of the reply
    const match = rawReply.match(/^\s*\|\|\|PRODUCTS:(\[[^\]]*\])\|\|\|/);
    let suggestedProductIds = [];

    if (match) {
      try {
        const parsedIds = JSON.parse(match[1]);
        // validate against actual catalog to avoid hallucinated IDs
        const validIds = new Set(products.map((p) => String(p._id)));
        suggestedProductIds = (Array.isArray(parsedIds) ? parsedIds : [])
          .filter((id) => validIds.has(String(id)))
          .slice(0, 4);
      } catch {
        suggestedProductIds = [];
      }
    }

    const reply = rawReply
      .replace(/^\s*\|\|\|PRODUCTS:\[[^\]]*\]\|\|\|/, "")
      .trim();

    return { reply, suggestedProductIds };
  } catch (error) {
    console.error("getAIResponse ERROR:", error);
    return {
      reply: error.message || "Sorry, something went wrong. Please try again later.",
      suggestedProductIds: [],
    };
  }
};

const filterRelevantProducts = (products, userMessage, history) => {
  if (!Array.isArray(products) || products.length <= 30) return products || [];

  const recentUserText = [
    userMessage,
    ...history
      .filter((m) => m.role === "user")
      .slice(-3)
      .map((m) => m.content),
  ]
    .join(" ")
    .toLowerCase();

  const scored = products.map((p) => {
    let score = 0;
    const cat = (p.category || "").toLowerCase();
    const subCat = (p.subCategory || "").toLowerCase();
    const name = (p.name || "").toLowerCase();

    if (subCat && recentUserText.includes(subCat)) score += 3;
    if (cat && recentUserText.includes(cat)) score += 2;
    if (name && recentUserText.split(" ").some((w) => w.length > 3 && name.includes(w))) score += 1;
    if (p.bestseller) score += 0.5;

    return { p, score };
  });

  const matched = scored.filter((s) => s.score > 0);

  if (matched.length === 0) {
    // no keyword match found, fall back to bestsellers/first 30
    return products.slice(0, 30);
  }

  return matched
    .sort((a, b) => b.score - a.score)
    .slice(0, 30)
    .map((s) => s.p);
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
      }
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