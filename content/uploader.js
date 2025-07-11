export async function injectResume(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  const resp = await fetch(chrome.runtime.getURL("assets/resume.pdf"));
  const blob = await resp.blob();
  const file = new File([blob],"resume.pdf",{type:"application/pdf"});
  const dt = new DataTransfer();
  dt.items.add(file);
  el.files = dt.files;
}