(async () => {
  const host = window.location.hostname;

  if (host.includes("linkedin.com")) {
    const module = await import(chrome.runtime.getURL("content/sites/site_linkedin.js"));
    module.run();
  } else if (host.includes("indeed.com")) {
    const module = await import(chrome.runtime.getURL("content/sites/site_indeed.js"));
    module.run();
  } else if (host.includes("glassdoor.com")) {
    const module = await import(chrome.runtime.getURL("content/sites/site_glassdoor.js"));
    module.run();
  } else if (host.includes("monster.com")) {
    const module = await import(chrome.runtime.getURL("content/sites/site_monster.js"));
    module.run();
  }
})();

// Advanced field mapping and validation
function fillFormFields(form, answers) {
  const fields = form.querySelectorAll('input, textarea, select');
  fields.forEach(field => {
    const label = (field.labels && field.labels[0]?.innerText) || field.getAttribute('aria-label') || field.name || '';
    let answer = answers[label] || '';
    // Heuristics for mapping
    if (!answer) {
      if (/relocat/i.test(label)) answer = answers['Are you willing to relocate?'];
      if (/salary|pay/i.test(label)) answer = answers['What is your expected salary?'];
      if (/start/i.test(label)) answer = answers['When can you start?'];
      if (/experience/i.test(label)) answer = answers['Describe your experience'];
      if (/why/i.test(label)) answer = answers['Why do you want this job?'];
    }
    // Fill field based on type
    if (field.type === 'checkbox' || field.type === 'radio') {
      field.checked = !!answer && (answer === 'yes' || answer === 'true');
    } else if (field.type === 'file') {
      // File uploads handled elsewhere
    } else if (field.type === 'date') {
      field.value = answer || new Date().toISOString().split('T')[0];
    } else {
      field.value = answer;
    }
    // Validation
    if (field.required && !field.value) {
      field.classList.add('uwu-field-error');
      logError(new Error('Required field missing'), { field: label });
    } else {
      field.classList.remove('uwu-field-error');
    }
  });
}
// Retry logic for failed submissions
async function submitWithRetry(form, maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      await form.submit();
      return true;
    } catch (e) {
      logError(e, { attempt });
      attempt++;
      await new Promise(res => setTimeout(res, 1000 * Math.pow(2, attempt)));
    }
  }
  showUwUToast('Submission failed after retries', 'error');
  return false;
}

// Auto-Apply progress and error handling
async function autoApplyJobs(board, searchUrl, answers) {
  // Open the job board search page in a new tab and inject script
  // This is a stub for content script logic
  let jobs = await fetchJobList(board, searchUrl); // Should return array of job links
  let applied = 0, failed = 0;
  for (const job of jobs) {
    try {
      await openAndApplyToJob(job, answers);
      logApplication({ board, job, status: 'success', ts: Date.now() });
      applied++;
      updateAutoApplyProgress(applied, jobs.length, failed);
    } catch (e) {
      logError(e, { board, job });
      logApplication({ board, job, status: 'error', ts: Date.now(), error: e.message });
      failed++;
      updateAutoApplyProgress(applied, jobs.length, failed);
    }
  }
  showUwUToast(`Auto-Apply complete: ${applied} succeeded, ${failed} failed.`, failed ? 'error' : 'success');
}
function updateAutoApplyProgress(applied, total, failed) {
  const region = document.getElementById('uwu-dashboard-toast-container');
  if (region) {
    region.textContent = `Auto-Apply Progress: ${applied}/${total} applied, ${failed} failed.`;
    region.setAttribute('aria-live', 'polite');
  }
}

// Multi-language support for form responses
async function detectLanguage(text) {
  // Simple language detection using LibreTranslate API
  try {
    const res = await fetch('https://libretranslate.de/detect', {
      method: 'POST',
      body: JSON.stringify({ q: text }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    return data[0]?.language || 'en';
  } catch (e) {
    logError(e, { action: 'detectLanguage' });
    return 'en';
  }
}
async function translateAnswer(answer, targetLang) {
  if (!answer || targetLang === 'en') return answer;
  try {
    const res = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      body: JSON.stringify({ q: answer, source: 'en', target: targetLang }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    return data.translatedText || answer;
  } catch (e) {
    logError(e, { action: 'translateAnswer' });
    return answer;
  }
}

// Captcha detection for auto-apply
function detectCaptcha(form) {
  // Check for common captcha widgets
  if (
    form.querySelector('.g-recaptcha, iframe[src*="recaptcha"], .h-captcha, iframe[src*="hcaptcha"]')
  ) {
    showUwUToast('Captcha detected! Please solve it to continue.', 'error');
    const region = document.getElementById('uwu-dashboard-toast-container');
    if (region) {
      region.textContent = 'Captcha detected! Automation paused. Please solve the captcha.';
      region.setAttribute('aria-live', 'assertive');
    }
    // Pause automation (return false or throw)
    throw new Error('Captcha detected');
  }
}

function showCaptchaModal() {
  const modal = document.createElement('div');
  modal.className = 'uwu-captcha-modal';
  modal.setAttribute('role', 'alertdialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('tabindex', '0');
  modal.innerHTML = `
    <div class='uwu-captcha-modal-content'>
      <h2>Captcha Detected</h2>
      <p>Automation is paused. Please solve the captcha to continue.</p>
      <button id='uwu-resume-btn'>Resume Automation</button>
    </div>
  `;
  document.body.appendChild(modal);
  const resumeBtn = modal.querySelector('#uwu-resume-btn');
  resumeBtn.focus();
  resumeBtn.onclick = () => {
    modal.remove();
    showUwUToast('Automation resumed!', 'success');
    // Resume logic can be triggered here
  };
  // Trap focus in modal
  modal.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      resumeBtn.focus();
    }
  });
}

// Ultra-Robust Full Auto-Applier Orchestrator
async function fullAutoApply(board, searchUrl, runFnName = 'run', concurrency = 3) {
  // Dynamic selectors per board
  const selectors = {
    linkedin: 'a[href*="/jobs/view/"]',
    indeed: 'a[href*="/pagead/clk"], a[href*="/rc/clk"], a[href*="/company/"]',
    monster: 'a[href*="/job/"], a[href*="/jobs/"], a.card-title',
    glassdoor: 'a[href*="/partner/jobListing.htm"], a[href*="/job-listing/"], a.jobLink',
  };
  let applied = 0, failed = 0, total = 0;
  let nextPageUrl = searchUrl;
  let pageCount = 0;
  let allJobLinks = [];
  // Crawl all pages first for job links (to avoid missing jobs on reload)
  while (nextPageUrl && pageCount < 10) {
    window.location.href = nextPageUrl;
    await new Promise(res => setTimeout(res, 2500 + Math.random() * 1000));
    const jobLinks = Array.from(document.querySelectorAll(selectors[board] || 'a[href*="/jobs/"]')).map(a => a.href);
    allJobLinks.push(...jobLinks);
    const nextBtn = document.querySelector('a[aria-label*="Next"], a[rel="next"], .pagination-next, .next-page');
    nextPageUrl = nextBtn ? nextBtn.href : null;
    pageCount++;
  }
  total = allJobLinks.length;
  let i = 0;
  let retryQueue = [];
  while (i < allJobLinks.length || retryQueue.length) {
    const batch = (retryQueue.length ? retryQueue.splice(0, concurrency) : allJobLinks.slice(i, i + concurrency));
    await Promise.all(batch.map(async (link) => {
      let attempts = 0;
      while (attempts < 3) {
        try {
          const jobTab = window.open(link, '_blank');
          await new Promise(res => setTimeout(res, 2000 + Math.random() * 1000));
          // Wait for job details or retry
          let loaded = false;
          for (let t = 0; t < 10; t++) {
            if (jobTab.document.body.innerText.length > 100) { loaded = true; break; }
            await new Promise(res => setTimeout(res, 500));
          }
          if (!loaded) throw new Error('Job page did not load in time');
          if (jobTab.document.body.innerText.match(/captcha|robot|verify/i)) {
            showCaptchaModal();
            throw new Error('Anti-bot detected');
          }
          jobTab.eval(`import('/content/sites/site_${board}.js').then(m => m.${runFnName}())`);
          applied++;
          window.updateDashboardAutoApplyProgress?.(`Applied: ${applied}, Failed: ${failed}, Remaining: ${total - (applied + failed)}`);
          announceProgress(`Applied: ${applied}, Failed: ${failed}, Remaining: ${total - (applied + failed)}`);
          jobTab.close();
          await new Promise(res => setTimeout(res, 1500 + Math.random() * 1000));
          break;
        } catch (e) {
          attempts++;
          if (attempts < 3) {
            await new Promise(res => setTimeout(res, 1000 + Math.random() * 1000));
            continue;
          }
          failed++;
          logError(e, { board, job: link });
          window.updateDashboardAutoApplyProgress?.(`Applied: ${applied}, Failed: ${failed}, Remaining: ${total - (applied + failed)}`);
          announceProgress(`Applied: ${applied}, Failed: ${failed}, Remaining: ${total - (applied + failed)}`);
          showRecoveryModal(e, () => retryQueue.push(link), () => {}, () => {});
        }
      }
    }));
    i += concurrency;
  }
  showUwUToast(`Full auto-apply complete: ${applied} succeeded, ${failed} failed.`, failed ? 'error' : 'success');
  showCelebration();
}
// Accessibility announcement for progress
function announceProgress(msg) {
  let region = document.getElementById('uwu-auto-apply-aria-progress');
  if (!region) {
    region = document.createElement('div');
    region.id = 'uwu-auto-apply-aria-progress';
    region.setAttribute('aria-live', 'polite');
    region.className = 'visually-hidden';
    document.body.appendChild(region);
  }
  region.textContent = msg;
}
