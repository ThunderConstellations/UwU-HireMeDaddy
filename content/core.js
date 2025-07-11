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
