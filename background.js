chrome.runtime.onInstalled.addListener(() => {
  console.log("UwU‑HireMeDaddy installed.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "notify") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "assets/icon128.png",
      title: message.title || "UwU‑HireMeDaddy",
      message: message.body || "Job application event occurred!"
    });
  }
});
