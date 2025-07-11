import { generateCover } from "./aiCover.js";
import { injectResume } from "./uploader.js";
import { logApplication } from "../utils/logger.js";

export async function applyMonster() {
  const title = document.querySelector(".job-title")?.innerText || document.title;
  const company = document.querySelector(".company")?.innerText || "";
  const desc = document.querySelector("#JobDesc")?.innerText || "";

  const cover = await generateCover(desc, title);
  const coverEl = document.querySelector('textarea[name*="cover"]');
  if (coverEl) coverEl.value = cover;

  await injectResume('input[type="file"]');
  document.querySelector('button[type="submit"]').click();

  await logApplication({ site: "Monster", title, company, status: "Submitted" });
}