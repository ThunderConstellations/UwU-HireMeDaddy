import { generateCover } from "./aiCover.js";
import { injectResume } from "./uploader.js";
import { logApplication } from "../utils/logger.js";

export async function applyIndeed() {
  // 1. Extract job info
  const title = document.querySelector("h1.jobsearch-JobInfoHeader-title")?.innerText || document.title;
  const company = document.querySelector(".jobsearch-InlineCompanyRating div")?.innerText || "";
  const desc = document.querySelector("#jobDescriptionText")?.innerText || "";

  // 2. AI-generated cover
  const cover = await generateCover(desc, title);
  const coverEl = document.querySelector('textarea[name*="cover"]');
  if (coverEl) coverEl.value = cover;

  // 3. Upload resume and fill remaining fields via core.js
  await injectResume('input[type="file"]');

  // 4. Submit
  document.querySelector('button[type="submit"], button.ia-SubmitButton')?.click();

  // 5. Log it
  await logApplication({ site: "Indeed", title, company, status: "Submitted" });
  import { autofillForm } from "../utils/formfill.js";

await autofillForm();
}