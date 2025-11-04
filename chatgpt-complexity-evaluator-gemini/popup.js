document.addEventListener("DOMContentLoaded", () => {
  const apiKeyInput = document.getElementById("apiKey");
  const saveBtn = document.getElementById("saveBtn");
  const statusDiv = document.getElementById("status");

  chrome.storage.sync.get(["geminiApiKey"], (result) => {
    if (result.geminiApiKey) {
      apiKeyInput.value = result.geminiApiKey;
    }
  });

  saveBtn.addEventListener("click", () => {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      showStatus("Please enter an API key", "error");
      return;
    }

    if (!apiKey.startsWith("AIzaSy")) {
      showStatus("Invalid key format (should start with AIzaSy)", "error");
      return;
    }

    chrome.storage.sync.set({ geminiApiKey: apiKey }, () => {
      showStatus("✓ API key saved!", "success");
      setTimeout(() => (statusDiv.style.display = "none"), 3000);
    });
  });

  apiKeyInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") saveBtn.click();
  });

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
  }
});
