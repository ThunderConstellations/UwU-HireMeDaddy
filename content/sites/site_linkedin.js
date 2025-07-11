import { CONFIG } from "../../utils/config.js";
import { generateCoverLetter } from "../../utils/aiCover.js";
import { logApplication } from "../../utils/logger.js";

export async function run() {
  try {
    const jobTitle = document.querySelector("h1")?.innerText || "Unknown Job";
    const company = document.querySelector(".topcard__org-name-link")?.innerText || "Unknown Company";
    const location = document.querySelector(".topcard__flavor--bullet")?.innerText || "Unknown Location";

    const prompt = `Generate a brief cover letter for a ${jobTitle} role at ${company} in ${location}, for a candidate with this resume: ${JSON.stringify(CONFIG)}`;
    const coverLetter = await generateCoverLetter(prompt);

    // Simulate form filling (You’d need to adapt this to LinkedIn's internal form IDs)
    const inputs = document.querySelectorAll("input, textarea, select");

    for (const input of inputs) {
      if (input.type === "text" && input.name?.toLowerCase().includes("name")) input.value = CONFIG.name;
      else if (input.type === "email") input.value = CONFIG.email;
      else if (input.name?.toLowerCase().includes("phone")) input.value = CONFIG.phone;
      else if (input.tagName === "TEXTAREA") input.value = coverLetter;
    }

    // Log it
    await logApplication({
      site: "LinkedIn",
      title: jobTitle,
      company,
      location
    });

    chrome.runtime.sendMessage({
      type: "notify",
      title: "✅ Applied on LinkedIn",
      body: `${jobTitle} at ${company}`
    });
  } catch (err) {
    console.error("Error in LinkedIn autofill:", err);
  }
}
