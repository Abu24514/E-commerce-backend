export const openrouterChat = async (messages, options = {}) => {
  if (!Array.isArray(messages)) {
    throw new Error("OpenRouter: messages must be array");
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.FRONTEND_URL,
      "X-Title": "Wearly",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 180,
    }),
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
};