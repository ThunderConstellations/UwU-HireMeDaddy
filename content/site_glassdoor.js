import { generateCover } from "./aiCover.js";
import { injectResume } from "./uploader.js";
import { logApplication } from "../utils/logger.js";

export async function applyGlassdoor() {
  const title = document.querySelector(".e11nt52q1, .h1")?.innerText || document.title;
  const company = document.querySelector(".e11nt52q2, .h2")?.innerText || "";
  const desc = document.querySelector(".jobDescriptionContent")?.innerText || "";

  const cover = await generateCover(desc, title);
  const coverEl = document.querySelector('textarea[name*="coverletter"]');
  if (coverEl) coverEl.value = cover;

  await injectResume('input[type="file"]');
  document.querySelector('button[type="submit"], button.next')?.click();

  await logApplication({ site: "Glassdoor", title, company, status: "Submitted" });
}