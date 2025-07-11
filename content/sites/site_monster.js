import { generateCover } from "../aiCover.js";
import { injectResume } from "../uploader.js";
import { logApplication } from "../../utils/logger.js";

async function waitForJobDetails(timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const title = document.querySelector('.job-title');
    const company = document.querySelector('.company');
    if (title && company) return true;
    await new Promise(r => setTimeout(r, 300));
  }
  return false;
}

export async function run() {
  if (!(await waitForJobDetails())) {
    const { logError } = await import('../../utils/logger.js');
    await logError('Job details not found in time', { site: 'Monster', url: window.location.href });
    return;
  }
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const title = document.querySelector(".job-title")?.innerText || document.title;
      const company = document.querySelector(".company")?.innerText || "";
      const desc = document.querySelector("#JobDesc")?.innerText || "";

      const cover = await generateCover(desc, title);
      const coverEl = document.querySelector('textarea[name*="cover"]');
      if (coverEl) coverEl.value = cover;

      await injectResume('input[type="file"]');
      document.querySelector('button[type="submit"]').click();

      const jobLink = window.location.href;
      // Improved pay/contact/location extraction
      let contactInfo = '';
      const recruiter = document.querySelector('.recruiter-contact-info, .contact-info, .job-recruiter, .job-contact');
      if (recruiter) contactInfo = recruiter.innerText;
      if (!contactInfo) {
        const emailMatch = document.body.innerText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) contactInfo = emailMatch[0];
      }
      let payRate = '';
      const payEl = document.querySelector('.salary, .compensation, .pay-rate, .job-salary, .job-compensation');
      if (payEl) payRate = payEl.innerText;
      if (!payRate) {
        const payMatch = document.body.innerText.match(/\$\d{2,3}(,\d{3})*(\.\d{2})?\s*(per|\/)?\s*(hour|hr|year|annum)/i);
        if (payMatch) payRate = payMatch[0];
      }
      let location = document.querySelector('.location, .job-location, .job-header-location')?.innerText || '';
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
        site: "Monster",
        title,
        company,
        jobLink,
        contactInfo,
        location,
        appliedAt: Date.now(),
        payRate,
        status: "Submitted"
      });
      return;
    } catch (err) {
      lastError = err;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  const { logError } = await import('../../utils/logger.js');
  await logError('Auto-apply failed after 3 attempts', { site: 'Monster', url: window.location.href, error: lastError });
}