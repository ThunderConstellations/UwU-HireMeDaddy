import { generateCover } from "../aiCover.js";
import { injectResume } from "../uploader.js";
import { logApplication } from "../../utils/logger.js";

async function waitForJobDetails(timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const title = document.querySelector('h1.jobsearch-JobInfoHeader-title');
    const company = document.querySelector('.jobsearch-InlineCompanyRating div');
    if (title && company) return true;
    await new Promise(r => setTimeout(r, 300));
  }
  return false;
}

export async function run() {
  if (!(await waitForJobDetails())) {
    const { logError } = await import('../../utils/logger.js');
    await logError('Job details not found in time', { site: 'Indeed', url: window.location.href });
    return;
  }
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
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
      const jobLink = window.location.href;
      // Improved pay/contact/location extraction
      let contactInfo = '';
      const recruiter = document.querySelector('.icl-ContactInfo, .recruiter-contact-info, .jobsearch-ContactInfo, .jobsearch-JobInfoHeader-contact');
      if (recruiter) contactInfo = recruiter.innerText;
      if (!contactInfo) {
        const emailMatch = document.body.innerText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) contactInfo = emailMatch[0];
      }
      let payRate = '';
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
  const jobLink = window.location.href;
  // Improved pay/contact/location extraction
  let contactInfo = '';
  const recruiter = document.querySelector('.icl-ContactInfo, .recruiter-contact-info, .jobsearch-ContactInfo, .jobsearch-JobInfoHeader-contact');
  if (recruiter) contactInfo = recruiter.innerText;
  if (!contactInfo) {
    const emailMatch = document.body.innerText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) contactInfo = emailMatch[0];
  }
  let payRate = '';
  const payEl = document.querySelector('.jobsearch-JobMetadataHeader-item, .salary-snippet, .jobsearch-JobInfoHeader-salary, .jobsearch-JobDescriptionSection-sectionItem');
  if (payEl) payRate = payEl.innerText;
  if (!payRate) {
    const payMatch = document.body.innerText.match(/\$\d{2,3}(,\d{3})*(\.\d{2})?\s*(per|\/)?\s*(hour|hr|year|annum)/i);
    if (payMatch) payRate = payMatch[0];
  }
  let location = document.querySelector('.jobsearch-JobInfoHeader-subtitle div, .jobsearch-JobInfoHeader-subtitle, .job-location')?.innerText || '';
  if (!location) {
    const locEl = document.querySelector('[data-test-location]');
    if (locEl) location = locEl.innerText;
  }
  // Log error if any required field is missing
  if (!title || !company || !jobLink) {
    const { logError } = await import('../../utils/logger.js');
    await logError('Missing required job info', { title, company, jobLink });
  }
  await logApplication({
    site: "Indeed",
    title,
    company,
    jobLink,
    contactInfo,
    location,
    appliedAt: Date.now(),
    payRate,
    status: "Submitted"
  });
  import { autofillForm } from "../utils/formfill.js";

await autofillForm();
}