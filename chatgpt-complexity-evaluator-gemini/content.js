(function () {
  console.log(
    "%c========================================",
    "color: green; font-weight: bold"
  );
  console.log(
    "%c CONTENT SCRIPT LOADED",
    "color: green; font-weight: bold; font-size: 16px"
  );
  console.log(
    "%c========================================",
    "color: green; font-weight: bold"
  );
  console.log("[CONTENT] Timestamp:", new Date().toLocaleTimeString());
  console.log("[CONTENT] URL:", window.location.href);
  console.log("[CONTENT] Document ready state:", document.readyState);

  let timer = null;
  let badge = null;
  let lastText = "";

  // Show startup notification
  console.log("[CONTENT] Showing startup notification...");
  showStartupNotification();

  function showStartupNotification() {
    const notif = document.createElement("div");
    notif.style.cssText =
      "position:fixed;top:20px;right:20px;padding:12px 20px;background:#10b981;color:white;border-radius:10px;font-family:system-ui;font-size:14px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,0.3);z-index:999999;";
    notif.textContent = "🎯 Complexity Evaluator Active";
    document.body.appendChild(notif);
    console.log("[CONTENT] ✅ Startup notification displayed");

    setTimeout(function () {
      notif.remove();
      console.log("[CONTENT] Startup notification removed");
    }, 3000);
  }

  // Initialize after delay
  console.log("[CONTENT] Scheduling initialization in 1 second...");
  setTimeout(function () {
    console.log("[CONTENT] Starting initialization...");
    initializeMonitoring();
  }, 1000);

  function initializeMonitoring() {
    console.log(
      "%c[CONTENT] INITIALIZING MONITORING",
      "background: blue; color: white; padding: 2px 5px"
    );

    // Attach keyboard listener
    console.log("[CONTENT] Attaching keyup listener to document...");
    document.addEventListener("keyup", function (event) {
      console.log("[CONTENT] 🔑 Key pressed:", event.key);
      console.log(
        "[CONTENT] Active element:",
        document.activeElement.tagName,
        document.activeElement.id
      );

      const input = findInput();

      if (!input) {
        console.warn("[CONTENT] ⚠️ No input element found");
        return;
      }

      console.log("[CONTENT] ✅ Input found:", input.tagName);

      const currentText = (input.innerText || input.value || "").trim();
      console.log("[CONTENT] Current text length:", currentText.length);
      console.log(
        "[CONTENT] Current text (first 50 chars):",
        currentText.substring(0, 50)
      );

      if (currentText === lastText) {
        console.log("[CONTENT] Text unchanged, skipping");
        return;
      }

      lastText = currentText;
      console.log("[CONTENT] Text changed, processing...");

      if (!currentText) {
        console.log("[CONTENT] Text is empty, removing badge");
        removeBadge();
        return;
      }

      if (timer) {
        console.log("[CONTENT] Clearing existing timer");
        clearTimeout(timer);
      }

      console.log("[CONTENT] ⏱️ Starting 1-second debounce timer...");
      timer = setTimeout(function () {
        console.log("[CONTENT] ✅ Timer fired! Evaluating complexity...");
        evaluateComplexity(currentText);
      }, 1000);
    });

    console.log("[CONTENT] ✅ Monitoring initialized successfully");
    console.log("[CONTENT] 👉 Start typing in ChatGPT to test...");
  }

  function findInput() {
    console.log("[CONTENT] 🔍 Searching for input element...");

    // Try contenteditable divs
    const divs = document.querySelectorAll('[contenteditable="true"]');
    console.log("[CONTENT] Found", divs.length, "contenteditable elements");

    for (let i = 0; i < divs.length; i++) {
      const div = divs[i];
      const rect = div.getBoundingClientRect();
      const style = window.getComputedStyle(div);

      console.log("[CONTENT] Checking div", i, ":", {
        id: div.id,
        classes: div.className.substring(0, 30),
        display: style.display,
        height: rect.height,
        width: rect.width,
        visible: rect.height > 0 && rect.width > 0,
      });

      if (
        style.display !== "none" &&
        rect.height > 30 &&
        rect.width > 200 &&
        rect.bottom > 0
      ) {
        console.log("[CONTENT] ✅ Found valid input (contenteditable):", div);
        return div;
      }
    }

    // Try textareas
    const textareas = document.querySelectorAll("textarea");
    console.log("[CONTENT] Found", textareas.length, "textarea elements");

    for (let i = 0; i < textareas.length; i++) {
      const textarea = textareas[i];
      const style = window.getComputedStyle(textarea);

      console.log("[CONTENT] Checking textarea", i, ":", {
        id: textarea.id,
        display: style.display,
        visibility: style.visibility,
      });

      if (style.display !== "none" && style.visibility !== "hidden") {
        console.log("[CONTENT] ✅ Found valid input (textarea):", textarea);
        return textarea;
      }
    }

    console.warn("[CONTENT] ❌ No valid input found");
    return null;
  }

  function evaluateComplexity(text) {
    console.log(
      "%c[CONTENT] EVALUATING COMPLEXITY",
      "background: purple; color: white; padding: 2px 5px"
    );
    console.log("[CONTENT] Text to evaluate:", text.substring(0, 100));

    showBadge("loading", "Analyzing complexity...");

    console.log("[CONTENT] Sending message to background script...");
    const messagePayload = {
      action: "evaluateComplexity",
      prompt: text,
    };
    console.log("[CONTENT] Message payload:", messagePayload);

    chrome.runtime.sendMessage(messagePayload, function (response) {
      console.log("[CONTENT] 📨 Response received from background");
      console.log("[CONTENT] Response:", response);

      if (chrome.runtime.lastError) {
        console.error("[CONTENT] ❌ Runtime error:", chrome.runtime.lastError);
        showBadge("error", chrome.runtime.lastError.message);
        return;
      }

      if (!response) {
        console.error("[CONTENT] ❌ No response received");
        showBadge("error", "No response from background");
        return;
      }

      if (response.success) {
        console.log("[CONTENT] ✅ Success!");
        console.log("[CONTENT] Complexity:", response.data.complexity);
        console.log("[CONTENT] Reason:", response.data.reason);
        showBadge(response.data.complexity.toLowerCase(), response.data.reason);
      } else {
        console.error("[CONTENT] ❌ Error in response:", response.error);
        showBadge("error", response.error);
      }
    });
  }

  function showBadge(type, message) {
    console.log("[CONTENT] 🎨 Showing badge:", type);
    console.log("[CONTENT] Badge message:", message);

    removeBadge();

    const colors = {
      high: "#ef4444",
      medium: "#f59e0b",
      low: "#10b981",
      loading: "#6366f1",
      error: "#6b7280",
    };

    const icons = {
      high: "🔴",
      medium: "🟡",
      low: "🟢",
      loading: "⏳",
      error: "⚠️",
    };

    const labels = {
      high: "High",
      medium: "Medium",
      low: "Low",
      loading: "Analyzing",
      error: "Error",
    };

    badge = document.createElement("div");
    badge.id = "complexity-evaluator-badge";
    badge.style.cssText =
      "position:fixed;bottom:100px;right:20px;padding:14px 22px;border-radius:24px;font-size:15px;font-weight:700;font-family:system-ui,sans-serif;color:white;background:" +
      colors[type] +
      ";box-shadow:0 6px 20px rgba(0,0,0,0.4);z-index:2147483647;cursor:help;transition:transform 0.2s;";
    badge.textContent = icons[type] + " " + labels[type];
    badge.title = message;

    badge.addEventListener("mouseenter", function () {
      badge.style.transform = "scale(1.05)";
    });

    badge.addEventListener("mouseleave", function () {
      badge.style.transform = "scale(1)";
    });

    document.body.appendChild(badge);
    console.log("[CONTENT] ✅ Badge appended to body");
    console.log("[CONTENT] Badge position:", badge.getBoundingClientRect());
  }

  function removeBadge() {
    if (badge && badge.parentNode) {
      console.log("[CONTENT] Removing existing badge");
      badge.remove();
      badge = null;
    }
  }

  console.log("[CONTENT] Script initialization complete");
})();
