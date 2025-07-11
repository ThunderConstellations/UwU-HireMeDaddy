const apiKeyInput = document.getElementById("apiKeyInput");
const saveApiKeyBtn = document.getElementById("saveApiKeyBtn");
const apiKeyStatus = document.getElementById("apiKeyStatus");
const applyBtn = document.getElementById("applyBtn");

// Load saved API key on popup open
chrome.storage.local.get(["openrouter_api_key"], (result) => {
  if (result.openrouter_api_key) {
    apiKeyInput.value = "••••••••";
    apiKeyStatus.textContent = "✅ API key loaded securely.";
  }
});

// Save the API key when button is clicked
saveApiKeyBtn.addEventListener("click", async () => {
  const key = apiKeyInput.value.trim();
  if (key.length > 20) {
    await chrome.storage.local.set({ openrouter_api_key: key });
    apiKeyInput.value = "••••••••";
    apiKeyStatus.textContent = "✅ API key saved securely.";
  } else {
    apiKeyStatus.textContent = "❌ Invalid API key.";
  }
});

// For triggering auto-apply logic (optional placeholder)
applyBtn.addEventListener("click", async () => {
  alert("🚀 Auto-apply triggered! Forms will be filled on matching job boards.");
});
