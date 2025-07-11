chrome.runtime.onInstalled.addListener(() => {
  console.log("UwU‑HireMeDaddy extension installed");
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "notify") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "assets/icon128.png",
      title: "UwU‑HireMeDaddy",
      message: message.text
    });
  }
});