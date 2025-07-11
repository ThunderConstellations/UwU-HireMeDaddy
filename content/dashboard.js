// Inject UwU button and dashboard overlay
(function() {
  if (document.getElementById('uwu-dashboard-btn')) return;

  // Create UwU button
  const btn = document.createElement('div');
  btn.id = 'uwu-dashboard-btn';
  btn.setAttribute('tabindex', '0');
  btn.setAttribute('aria-label', 'Open UwU-HireMeDaddy Dashboard');
  btn.innerHTML = `
    <span class='uwu-face'>UwU</span>
    <svg class='uwu-btn-lightning' width='36' height='36' viewBox='0 0 36 36' aria-hidden='true'>
      <polyline points='10,2 18,18 12,18 26,34 18,20 24,20 10,2' fill='none' stroke='#ffd700' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/>
    </svg>
  `;
  document.body.appendChild(btn);

  // Create dashboard overlay
  const overlay = document.createElement('div');
  overlay.id = 'uwu-dashboard-overlay';
  overlay.setAttribute('tabindex', '-1');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'UwU-HireMeDaddy Dashboard');
  overlay.style.display = 'none';
  overlay.innerHTML = `
    <div class='uwu-dashboard-header'>
      <span class='uwu-face'>UwU</span> UwU-HireMeDaddy Dashboard
      <div class='uwu-dashboard-tabs' role='tablist'>
        <button class='uwu-dashboard-tab' id='uwu-tab-history' role='tab' aria-selected='true' tabindex='0'>History</button>
        <button class='uwu-dashboard-tab' id='uwu-tab-errors' role='tab' aria-selected='false' tabindex='-1'>Errors</button>
        <button class='uwu-dashboard-tab' id='uwu-tab-settings' role='tab' aria-selected='false' tabindex='-1'>Settings</button>
      </div>
      <button id='uwu-dashboard-maximize' aria-label='Maximize Dashboard' aria-pressed='false' tabindex='0' style='margin-right:8px;font-size:1.2em;background:none;border:none;color:#ffd700;cursor:pointer;border-radius:6px;padding:4px 10px;transition:background 0.2s;'>  </button>
      <button id='uwu-dashboard-close' aria-label='Close Dashboard'>  </button>
    </div>
    <div class='uwu-dashboard-content' id='uwu-dashboard-tab-content' tabindex='0'>
      <!-- Tab content will be rendered here -->
    </div>
    <div id='uwu-dashboard-toast-region' aria-live='polite' class='visually-hidden'></div>
  `;
  document.body.appendChild(overlay);

  // Maximize/minimize logic
  let maximized = false;
  const maximizeBtn = overlay.querySelector('#uwu-dashboard-maximize');
  const toastRegion = overlay.querySelector('#uwu-dashboard-toast-region');
  // Playful sound effect (if enabled)
  function playUwUSound(type) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    chrome.storage?.local?.get(['uwu_sound'], (res) => {
      if (res.uwu_sound === false) return;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = type === 'maximize' ? 880 : 440;
      g.gain.value = 0.08;
      o.connect(g).connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.18);
      o.onended = () => ctx.close();
    });
  }
  // Playful lightning/face animation
  function animateUwULightning() {
    const header = overlay.querySelector('.uwu-dashboard-header');
    if (!header) return;
    const bolt = document.createElement('span');
    bolt.className = 'uwu-bolt';
    bolt.innerHTML = '&#9889;';
    bolt.style.fontSize = '1.5em';
    bolt.style.marginLeft = '8px';
    bolt.style.animation = 'uwu-bolt-flash 0.7s';
    header.appendChild(bolt);
    setTimeout(() => bolt.remove(), 700);
    const face = header.querySelector('.uwu-face');
    if (face) {
      face.style.animation = 'uwu-face-bounce 0.7s';
      setTimeout(() => { face.style.animation = ''; }, 700);
    }
  }
  function setMaximized(state) {
    maximized = state;
    overlay.classList.toggle('uwu-dashboard-maximized', maximized);
    maximizeBtn.setAttribute('aria-pressed', maximized ? 'true' : 'false');
    maximizeBtn.setAttribute('aria-label', maximized ? 'Minimize Dashboard' : 'Maximize Dashboard');
    maximizeBtn.innerText = maximized ? '\u2B0C' : '\u2B1A'; // Unicode for minimize/maximize
    overlay.focus();
    // ARIA live announcement
    if (toastRegion) {
      toastRegion.textContent = maximized ? 'Dashboard maximized.' : 'Dashboard minimized.';
      setTimeout(() => { toastRegion.textContent = ''; }, 1500);
    }
    playUwUSound(maximized ? 'maximize' : 'minimize');
    animateUwULightning();
  }
  maximizeBtn.addEventListener('click', () => setMaximized(!maximized));
  maximizeBtn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      setMaximized(!maximized);
      e.preventDefault();
    }
  });

  // Focus trap logic
  function trapFocus(e) {
    if (overlay.style.display !== 'block') return;
    const focusable = overlay.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    }
  }
  overlay.addEventListener('keydown', trapFocus);

  // Tab logic
  const tabBtns = overlay.querySelectorAll('.uwu-dashboard-tab');
  const tabContent = overlay.querySelector('#uwu-dashboard-tab-content');
  let currentTab = 0;
  async function renderHistoryTab() {
    tabContent.innerHTML = `
      <input id='uwu-history-search' type='text' placeholder='Search jobs...' style='width:100%;margin-bottom:12px;padding:8px;border-radius:6px;border:1.5px solid #ffd700;background:#221a10;color:#ffd700;font-size:1em;'>
      <ul id='uwu-history-list' style='list-style:none;padding:0;'></ul>
    `;
    const list = tabContent.querySelector('#uwu-history-list');
    const search = tabContent.querySelector('#uwu-history-search');
    const { getApps } = await import('../utils/logger.js');
    let apps = await getApps();
    function renderList(filter = '') {
      const f = filter.trim().toLowerCase();
      list.innerHTML = apps.filter(app =>
        !f || app.title.toLowerCase().includes(f) || app.company.toLowerCase().includes(f) || (app.location||'').toLowerCase().includes(f)
      ).map(app =>
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
      ).join('') || `<li style='color:#ffd700;'>No applications found.</li>`;
    }
    renderList();
    search.addEventListener('input', e => renderList(e.target.value));
  }
  async function renderErrorsTab() {
    tabContent.innerHTML = `
      <input id='uwu-errors-search' type='text' placeholder='Search errors...' style='width:100%;margin-bottom:12px;padding:8px;border-radius:6px;border:1.5px solid #ffd700;background:#221a10;color:#ffd700;font-size:1em;'>
      <ul id='uwu-errors-list' style='list-style:none;padding:0;'></ul>
    `;
    const list = tabContent.querySelector('#uwu-errors-list');
    const search = tabContent.querySelector('#uwu-errors-search');
    const { getErrors } = await import('../utils/logger.js');
    let errors = await getErrors();
    function renderList(filter = '') {
      const f = filter.trim().toLowerCase();
      list.innerHTML = errors.filter(err =>
        !f || (err.error||'').toLowerCase().includes(f) || (err.site||'').toLowerCase().includes(f)
      ).map(err =>
        `<li class="uwu-log-entry">
          <span class="uwu-log-badge" style="background:linear-gradient(90deg,#ffd700 60%,#ff4e4e 100%);color:#18120a;">⚡Error</span>
          <b>${err.error || 'Unknown error'}</b><br>
          <small>
            <b>Site:</b> ${err.site || 'N/A'}<br>
            <b>When:</b> ${new Date(err.ts).toLocaleString()}<br>
            <b>Details:</b> ${Object.entries(err).filter(([k])=>!['error','site','ts'].includes(k)).map(([k,v])=>`${k}: ${v}`).join(', ') || 'N/A'}
          </small>
        </li>`
      ).join('') || `<li style='color:#ffd700;'>No errors found.</li>`;
    }
    renderList();
    search.addEventListener('input', e => renderList(e.target.value));
  }
  async function renderSettingsTab() {
    // Get current settings
    const storage = await new Promise(res => chrome.storage.local.get(null, res));
    const apiKey = storage.openrouter_api_key || '';
    const selectedResume = storage.selected_resume || 'resume.pdf';
    const resumes = ['resume.pdf', ...Object.keys(storage).filter(k => k.startsWith('resume_')).map(k => k.replace('resume_', ''))];
    const soundOn = storage.uwu_sound !== false;
    const animOn = storage.uwu_anim !== false;
    tabContent.innerHTML = `
      <label style='color:#ffd700;font-weight:bold;'>🔐 OpenRouter API Key</label>
      <input id='uwu-settings-api-key' type='password' value='${apiKey ? '••••••••' : ''}' placeholder='Enter your API key' style='width:100%;margin-bottom:10px;padding:8px;border-radius:6px;border:1.5px solid #ffd700;background:#221a10;color:#ffd700;font-size:1em;'>
      <button id='uwu-settings-save-api' style='margin-bottom:18px;'>Save API Key <span class='uwu-bolt' aria-hidden='true'>⚡</span></button>
      <label style='color:#ffd700;font-weight:bold;'>📄 Select Resume</label>
      <select id='uwu-settings-resume' style='width:100%;margin-bottom:10px;padding:8px;border-radius:6px;border:1.5px solid #ffd700;background:#221a10;color:#ffd700;font-size:1em;'>
        ${resumes.map(r => `<option value='${r}' ${r===selectedResume?'selected':''}>${r}</option>`).join('')}
      </select>
      <input id='uwu-settings-upload' type='file' accept='application/pdf' style='width:100%;margin-bottom:10px;'>
      <button id='uwu-settings-upload-btn' style='margin-bottom:18px;'>Upload Resume <span class='uwu-bolt' aria-hidden='true'>⚡</span></button>
      <label style='color:#ffd700;font-weight:bold;'>Preferences</label><br>
      <label><input type='checkbox' id='uwu-settings-sound' ${soundOn?'checked':''}/> UwU Sounds</label><br>
      <label><input type='checkbox' id='uwu-settings-anim' ${animOn?'checked':''}/> Animations</label>
    `;
    // API key logic
    const apiInput = tabContent.querySelector('#uwu-settings-api-key');
    const saveApiBtn = tabContent.querySelector('#uwu-settings-save-api');
    saveApiBtn.addEventListener('click', async () => {
      let key = apiInput.value.trim();
      if (key && key !== '••••••••') {
        await chrome.storage.local.set({ openrouter_api_key: key });
        apiInput.value = '••••••••';
        showUwUToast('API key saved!');
      }
    });
    // Resume select logic
    const resumeSelect = tabContent.querySelector('#uwu-settings-resume');
    resumeSelect.addEventListener('change', async () => {
      await chrome.storage.local.set({ selected_resume: resumeSelect.value });
      showUwUToast('Resume selected!');
    });
    // Resume upload logic
    const uploadInput = tabContent.querySelector('#uwu-settings-upload');
    const uploadBtn = tabContent.querySelector('#uwu-settings-upload-btn');
    uploadBtn.addEventListener('click', async () => {
      const file = uploadInput.files[0];
      if (!file || file.type !== 'application/pdf') {
        showUwUToast('Please select a PDF file.');
        return;
      }
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target.result;
        const key = `resume_${file.name}`;
        await chrome.storage.local.set({ [key]: dataUrl });
        showUwUToast('Resume uploaded!');
        renderSettingsTab();
      };
      reader.readAsDataURL(file);
    });
    // Preferences logic
    const soundCheckbox = tabContent.querySelector('#uwu-settings-sound');
    const animCheckbox = tabContent.querySelector('#uwu-settings-anim');
    soundCheckbox.addEventListener('change', async () => {
      await chrome.storage.local.set({ uwu_sound: soundCheckbox.checked });
      showUwUToast(soundCheckbox.checked ? 'Sounds enabled!' : 'Sounds disabled!');
    });
    animCheckbox.addEventListener('change', async () => {
      await chrome.storage.local.set({ uwu_anim: animCheckbox.checked });
      showUwUToast(animCheckbox.checked ? 'Animations enabled!' : 'Animations disabled!');
    });
  }
  function showTab(idx) {
    tabBtns.forEach((btn, i) => {
      btn.setAttribute('aria-selected', i === idx ? 'true' : 'false');
      btn.tabIndex = i === idx ? 0 : -1;
      btn.setAttribute('aria-controls', 'uwu-dashboard-tab-content');
    });
    currentTab = idx;
    if (idx === 0) renderHistoryTab();
    if (idx === 1) renderErrorsTab();
    if (idx === 2) renderSettingsTab();
    tabContent.setAttribute('role', 'tabpanel');
    tabContent.setAttribute('aria-labelledby', tabBtns[idx].id);
    tabContent.focus();
  }
  tabBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => showTab(i));
    btn.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') showTab((i + 1) % tabBtns.length);
      if (e.key === 'ArrowLeft') showTab((i - 1 + tabBtns.length) % tabBtns.length);
      if (e.key === 'Home') showTab(0);
      if (e.key === 'End') showTab(tabBtns.length - 1);
    });
  });
  showTab(0);

  // Toggle logic
  function toggleDashboard() {
    const isOpen = overlay.style.display === 'block';
    overlay.style.display = isOpen ? 'none' : 'block';
    if (!isOpen) {
      overlay.focus();
      // Announce open to screen readers
      const toast = overlay.querySelector('#uwu-dashboard-toast-region');
      toast.textContent = 'Dashboard opened.';
      setTimeout(() => { toast.textContent = ''; }, 1500);
    } else {
      btn.focus();
    }
  }
  btn.addEventListener('click', toggleDashboard);
  btn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') toggleDashboard(); });
  overlay.querySelector('#uwu-dashboard-close').addEventListener('click', toggleDashboard);
  overlay.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      toggleDashboard();
      e.preventDefault();
    }
  });
})(); 