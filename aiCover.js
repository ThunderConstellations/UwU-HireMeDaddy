import { CONFIG } from "./config.js";

export async function generateCoverLetter(prompt) {
  const { openrouter_api_key } = await chrome.storage.local.get("openrouter_api_key");

  if (!openrouter_api_key) {
    throw new Error("❌ OpenRouter API key not found. Please enter it in the popup.");
  }

  const headers = {
    "Authorization": `Bearer ${openrouter_api_key}`,
    "Content-Type": "application/json"
  };

  const body = {
    model: "mistral/mistral-7b-instruct",
    messages: [{ role: "user", content: prompt }]
  };

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });

  const result = await res.json();

  return result.choices?.[0]?.message?.content || "⚠️ Error generating response.";
}
