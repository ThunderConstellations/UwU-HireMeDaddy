import { generateCover } from "./aiCover.js";
import { injectResume } from "./uploader.js";
import { logApplication } from "../utils/logger.js";

export async function applyLinkedIn() {
  // 1. Get job info
  const title = document.querySelector("h1.top-card-layout__title")?.innerText || document.title;
  const company = document.querySelector(".topcard__org-name-link")?.innerText ||
                  document.querySelector(".top-card__flavor a")?.innerText || "";
  const desc = document.querySelector(".description__text, .show-more-less-html__markup")?.innerText || "";

  // 2. Open Easy Apply
  document.querySelector('button.jobs-apply-button, button.jobs-apply-trigger')?.click();
  await new Promise(r => setTimeout(r, 1000));

  // 3. AI cover
  const aiCover = await generateCover(desc, title);
  const coverArea = document.querySelector('textarea[name*="coverLetter"], textarea.ms-what-to-expect__text-area');
  if (coverArea) coverArea.value = aiCover;

  // 4. Upload resume via iframe
  await injectResume('iframe [type="file"], input[name*="resume"]');

  // 5. Click Next/Review/Submit
  document.querySelector('button[aria-label="Continue"], button[aria-label*="Review"], button[aria-label*="Submit application"]')?.click();

  // 6. Log result
  await logApplication({ site: "LinkedIn", title, company, status: "Submitted" });
  import { autofillForm } from "../utils/formfill.js";

await autofillForm();
}