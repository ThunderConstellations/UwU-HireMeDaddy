import { CONFIG } from "../../utils/config.js";
import { generateCoverLetter } from "../../utils/aiCover.js";
import { logApplication } from "../../utils/logger.js";

async function waitForJobDetails(timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const title = document.querySelector('h1');
    const company = document.querySelector('.topcard__org-name-link');
    if (title && company) return true;
    await new Promise(r => setTimeout(r, 300));
  }
  return false;
}

export async function run() {
  if (!(await waitForJobDetails())) {
    const { logError } = await import('../../utils/logger.js');
    await logError('Job details not found in time', { site: 'LinkedIn', url: window.location.href });
    return;
  }
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    const jobTitle = document.querySelector("h1")?.innerText || "Unknown Job";
    const company = document.querySelector(".topcard__org-name-link")?.innerText || "Unknown Company";
    const jobLink = window.location.href;

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

    // Improved pay/contact/location extraction
    let contactInfo = '';
    const recruiter = document.querySelector('.message-the-recruiter__contact-info, .recruiter-contact-info, .jobs-poster__name, .jobs-poster__contact-info');
    if (recruiter) contactInfo = recruiter.innerText;
    if (!contactInfo) {
      const emailMatch = document.body.innerText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) contactInfo = emailMatch[0];
    }
    let payRate = '';
    const payEl = document.querySelector('[data-test-salary], .salary, .compensation__salary, .job-salary, .jobs-unified-top-card__salary-info');
    if (payEl) payRate = payEl.innerText;
    if (!payRate) {
      const payMatch = document.body.innerText.match(/\$\d{2,3}(,\d{3})*(\.\d{2})?\s*(per|\/)?\s*(hour|hr|year|annum)/i);
      if (payMatch) payRate = payMatch[0];
    }
    let location = document.querySelector('.topcard__flavor--bullet, .job-location, .jobs-unified-top-card__bullet')?.innerText || '';
    if (!location) {
      const locEl = document.querySelector('[data-test-location]');
      if (locEl) location = locEl.innerText;
    }
    // Log error if any required field is missing
    if (!jobTitle || !company || !jobLink) {
      const { logError } = await import('../../utils/logger.js');
      await logError('Missing required job info', { jobTitle, company, jobLink });
    }

    await logApplication({
      site: "LinkedIn",
      title: jobTitle,
      company,
      jobLink,
      contactInfo,
      location,
      appliedAt: Date.now(),
      payRate,
      status: "Submitted"
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
