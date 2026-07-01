import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const groqChat = async (messages, options = {}) => {
  if (!Array.isArray(messages)) {
    throw new Error("Groq: messages must be array");
  }

  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: options.temperature ?? 0.3,
    max_completion_tokens: options.maxTokens ?? 180,
  });

  return res.choices[0].message.content;
};