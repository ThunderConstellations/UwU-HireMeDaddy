import { logError } from "../utils/logger.js";

export async function injectResume(selector) {
  try {
    const el = document.querySelector(selector);
    if (!el) throw new Error("Resume file input not found");
    // Get selected resume from storage, default to resume.pdf
    let resumeFile = "resume.pdf";
    try {
      const result = await chrome.storage.local.get(["selected_resume"]);
      if (result.selected_resume) resumeFile = result.selected_resume;
    } catch {}
    // Try to get the resume as a data URL from storage.local
    let file, blob;
    try {
      const key = `resume_${resumeFile}`;
      const result = await chrome.storage.local.get([key]);
      if (result[key]) {
        // Data URL found, convert to Blob
        const res = await fetch(result[key]);
        blob = await res.blob();
        file = new File([blob], resumeFile, { type: "application/pdf" });
      }
    } catch {}
    if (!file) {
      // Fallback to asset file
      const url = chrome.runtime.getURL(`assets/${resumeFile}`);
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Resume file not found: ${resumeFile}`);
      blob = await resp.blob();
      file = new File([blob], resumeFile, { type: "application/pdf" });
    }
    const dt = new DataTransfer();
    dt.items.add(file);
    el.files = dt.files;
  } catch (err) {
    await logError(err, { action: "injectResume" });
  }
}