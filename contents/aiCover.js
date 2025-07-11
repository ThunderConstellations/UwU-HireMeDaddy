import { CONFIG } from "../utils/config.js";
export async function generateCover(jobDesc, jobTitle) {
  const prompt = `Write a concise cover letter for William Majewski-Wood (found at ${CONFIG.personal.portfolio}) applying to "${jobTitle}". Job description:\n${jobDesc}`;
  const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method:"POST", headers:{"Authorization":CONFIG.openRouterAPIKey,"Content-Type":"application/json"},
    body:JSON.stringify({model:"gpt-4", messages:[{role:"user", content:prompt}], max_tokens:350})
  });
  const {choices} = await resp.json();
  return choices[0]?.message?.content;
}
