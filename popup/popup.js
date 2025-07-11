import { logError, getApps, getErrors } from "../utils/logger.js";
const apiKeyInput = document.getElementById("apiKeyInput");
const saveApiKeyBtn = document.getElementById("saveApiKeyBtn");
const apiKeyStatus = document.getElementById("apiKeyStatus");
const applyBtn = document.getElementById("applyBtn");
const resumeSelect = document.getElementById("resumeSelect");
const toggleLinkedIn = document.getElementById("toggleLinkedIn");
const toggleIndeed = document.getElementById("toggleIndeed");
const toggleMonster = document.getElementById("toggleMonster");
const toggleGlassdoor = document.getElementById("toggleGlassdoor");
const showHistoryBtn = document.getElementById("showHistoryBtn");
const showErrorLogBtn = document.getElementById("showErrorLogBtn");
const historyList = document.getElementById("history-list");
const resumeUploadInput = document.getElementById("resumeUploadInput");
const uploadResumeBtn = document.getElementById("uploadResumeBtn");
const copyApiKeyBtn = document.getElementById("copyApiKeyBtn");

// Load saved API key, selected resume, and job board toggles on popup open
chrome.storage.local.get([
  "openrouter_api_key",
  "selected_resume",
  "jobboard_linkedin",
  "jobboard_indeed",
  "jobboard_monster",
  "jobboard_glassdoor"
], (result) => {
  if (result.openrouter_api_key) {
    apiKeyInput.value = "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
    apiKeyStatus.textContent = "\u2705 API key loaded securely.";
  }
  if (result.selected_resume) {
    resumeSelect.value = result.selected_resume;
  }
  toggleLinkedIn.checked = result.jobboard_linkedin !== false;
  toggleIndeed.checked = result.jobboard_indeed !== false;
  toggleMonster.checked = result.jobboard_monster !== false;
  toggleGlassdoor.checked = result.jobboard_glassdoor !== false;
});

// Helper: Load resumes from storage.local and assets
async function loadResumes() {
  // Start with the default asset
  const resumes = ["resume.pdf"];
  // Add any uploaded resumes from storage.local
  const result = await chrome.storage.local.get(null);
  Object.keys(result).forEach(key => {
    if (key.startsWith("resume_") && key.endsWith(".pdf")) resumes.push(key.replace("resume_", ""));
  });
  resumeSelect.innerHTML = resumes.map(f => `<option value="${f}">${f}</option>`).join("");
}

// On popup open, load resumes
loadResumes();

function showUwUSparkleBurst() {
  const container = document.querySelector('.uwu-container');
  if (!container) return;
  const burst = document.createElement('div');
  burst.className = 'uwu-sparkle-burst';
  burst.innerHTML = '✨ <span aria-hidden="true">(UwU)</span>';
  container.appendChild(burst);
  setTimeout(() => burst.remove(), 800);
}

// Add ARIA live region for toasts
const toastContainer = document.getElementById('uwu-toast-container');
if (toastContainer && !document.getElementById('uwu-popup-toast-region')) {
  const liveRegion = document.createElement('div');
  liveRegion.id = 'uwu-popup-toast-region';
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.className = 'visually-hidden';
  toastContainer.appendChild(liveRegion);
}

function showUwUToast(message, type = 'info') {
  const container = document.getElementById('uwu-toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'uwu-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('tabindex', '0');
  toast.innerHTML = `<span class='uwu-bolt' aria-hidden='true'>\u26a1</span> <span>${message}</span> <span class='uwu-face' aria-hidden='true'>UwU</span>`;
  container.appendChild(toast);
  // Announce to ARIA live region
  const liveRegion = document.getElementById('uwu-popup-toast-region');
  if (liveRegion) {
    liveRegion.textContent = message;
    setTimeout(() => { liveRegion.textContent = ''; }, 2000);
  }
  toast.focus();
  setTimeout(() => toast.remove(), 4000);
}

uploadResumeBtn.addEventListener("click", async () => {
  try {
    const file = resumeUploadInput.files[0];
    if (!file || file.type !== "application/pdf") {
      alert("Please select a PDF file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      const key = `resume_${file.name}`;
      await chrome.storage.local.set({ [key]: dataUrl });
      await loadResumes();
      resumeSelect.value = file.name;
      await chrome.storage.local.set({ selected_resume: file.name });
      alert("Resume uploaded and selected!");
      showUwUSparkleBurst();
      showUwUToast('Resume uploaded!');
    };
    reader.onerror = async (e) => {
      alert("Error reading file");
      await logError(e, { action: "uploadResume" });
    };
    reader.readAsDataURL(file);
  } catch (err) {
    alert("Error uploading resume");
    await logError(err, { action: "uploadResume" });
  }
});

// Save the API key when button is clicked
saveApiKeyBtn.addEventListener("click", async () => {
  try {
    const key = apiKeyInput.value.trim();
    if (key.length > 20) {
      await chrome.storage.local.set({ openrouter_api_key: key });
      apiKeyInput.value = "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
      apiKeyStatus.textContent = "\u2705 API key saved securely.";
      showUwUToast('API key saved!');
    } else {
      apiKeyStatus.textContent = "\u274c Invalid API key.";
    }
  } catch (err) {
    apiKeyStatus.textContent = "\u274c Error saving API key.";
    await logError(err, { action: "saveApiKey" });
  }
});

// Save selected resume
resumeSelect.addEventListener("change", async () => {
  try {
    await chrome.storage.local.set({ selected_resume: resumeSelect.value });
  } catch (err) {
    alert("Error saving selected resume");
    await logError(err, { action: "saveResume" });
  }
});

// Save job board toggles
const saveToggles = async () => {
  try {
    await chrome.storage.local.set({
      jobboard_linkedin: toggleLinkedIn.checked,
      jobboard_indeed: toggleIndeed.checked,
      jobboard_monster: toggleMonster.checked,
      jobboard_glassdoor: toggleGlassdoor.checked
    });
  } catch (err) {
    alert("Error saving job board preferences");
    await logError(err, { action: "saveToggles" });
  }
};

toggleLinkedIn.addEventListener("change", saveToggles);
toggleIndeed.addEventListener("change", saveToggles);
toggleMonster.addEventListener("change", saveToggles);
toggleGlassdoor.addEventListener("change", saveToggles);

// For triggering auto-apply logic (optional placeholder)
applyBtn.addEventListener("click", async () => {
  try {
    alert("\ud83d\ude80 Auto-apply triggered! Forms will be filled on matching job boards.");
  } catch (err) {
    alert("Error triggering auto-apply");
    await logError(err, { action: "autoApply" });
  }
});

showHistoryBtn.addEventListener("click", async () => {
  historyList.innerHTML = "<li>Loading...</li>";
  try {
    const apps = await getApps();
    if (!apps.length) {
      historyList.innerHTML = "<li>No applications logged yet.</li>";
      return;
    }
    historyList.innerHTML = apps.map(app =>
      `<li class="uwu-log-entry">
        <span class="uwu-log-badge">⚡UwU!</span>
        <b><a href="${app.jobLink}" target="_blank" rel="noopener">${app.title}</a></b> @ ${app.company}<br>
        <small>
          <b>Contact:</b> ${app.contactInfo || 'N/A'}<br>
          <b>Location:</b> ${app.location || 'N/A'}<br>
          <b>Applied:</b> ${new Date(app.appliedAt || app.ts).toLocaleString()}<br>
          <b>Pay Rate:</b> ${app.payRate || 'N/A'}
        </small>
      </li>`
    ).join("");
    showUwUSparkleBurst();
    showUwUToast('Application logged!');
  } catch (err) {
    historyList.innerHTML = "<li>Error loading application history.</li>";
    await logError(err, { action: "showHistory" });
  }
});

showErrorLogBtn.addEventListener("click", async () => {
  historyList.innerHTML = "<li>Loading...</li>";
  try {
    const errors = await getErrors();
    if (!errors.length) {
      historyList.innerHTML = "<li>No errors logged yet.</li>";
      return;
    }
    historyList.innerHTML = errors.map(err =>
      `<li><b>${err.error}</b><br><small>${new Date(err.ts).toLocaleString()}</small></li>`
    ).join("");
  } catch (err) {
    historyList.innerHTML = "<li>Error loading error log.</li>";
    await logError(err, { action: "showErrorLog" });
  }
});

copyApiKeyBtn.addEventListener("click", async () => {
  try {
    let key = apiKeyInput.value.trim();
    if (key === '' || key === '••••••••') {
      // Try to get from storage if masked
      const result = await chrome.storage.local.get(["openrouter_api_key"]);
      key = result.openrouter_api_key || '';
    }
    if (!key || key.length < 10) {
      apiKeyStatus.textContent = "❌ No API key to copy.";
      return;
    }
    await navigator.clipboard.writeText(key);
    apiKeyStatus.textContent = "✅ API key copied!";
    showUwUSparkleBurst();
    showUwUToast('API key copied!');
  } catch (err) {
    apiKeyStatus.textContent = "❌ Error copying API key.";
    await logError(err, { action: "copyApiKey" });
  }
});

// Keyboard accessibility for main controls
[saveApiKeyBtn, uploadResumeBtn, applyBtn, showHistoryBtn, showErrorLogBtn, copyApiKeyBtn].forEach(btn => {
  if (btn) {
    btn.setAttribute('tabindex', '0');
    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  }
});

// Focus management: skip link and main content
const skipLink = document.querySelector('.skip-link');
const mainContent = document.getElementById('mainContent');
if (skipLink && mainContent) {
  skipLink.addEventListener('click', e => {
    e.preventDefault();
    mainContent.focus();
  });
}

// Add ARIA roles to history and error lists
if (historyList) {
  historyList.setAttribute('role', 'log');
  historyList.setAttribute('aria-live', 'polite');
}
