import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const geminiChat = async (messages) => {
  if (!Array.isArray(messages)) {
    throw new Error("Gemini: messages must be array");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const prompt = messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const result = await model.generateContent(prompt);

  return result.response.text();
};