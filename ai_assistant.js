// ===================== AI ASSISTANT SDK (GLOBAL) ===================== //

// ✅ Define API_URL only if it hasn't been defined yet
if (!window.API_URL) {
  window.API_URL = "https://flashcards-backend-git-main-rio-espaderas-projects.vercel.app/api/ask";
}

window.aiAssistantSDK = {
  init() {
    // Avoid duplicating the assistant if it's already added
    if (document.getElementById("ai-assistant")) return;

    const container = document.createElement("div");
    container.id = "ai-assistant";
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 320px;
      background: #fff;
      border-radius: 14px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.15);
      overflow: hidden;
      font-family: sans-serif;
      display: flex;
      flex-direction: column;
      z-index: 99999;
    `;

    container.innerHTML = `
      <div style="background:#007bff; color:#fff; padding:10px; font-weight:bold;">
        💬 Flashcard AI Assistant
      </div>
      <div id="ai-chat-output" style="height:220px; overflow-y:auto; padding:10px; font-size:14px;"></div>
      <div style="display:flex; border-top:1px solid #ddd;">
        <input id="ai-chat-input" type="text" placeholder="Ask me anything..." style="flex:1; border:none; padding:10px; font-size:14px; outline:none;">
        <button id="ai-chat-send" style="background:#007bff; color:white; border:none; padding:10px; cursor:pointer;">Send</button>
      </div>
    `;
    document.body.appendChild(container);

    const input = container.querySelector("#ai-chat-input");
    const sendBtn = container.querySelector("#ai-chat-send");

    sendBtn.addEventListener("click", () => this.sendMessage());
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.sendMessage();
    });

    this.appendMessage("AI", "👋 Hi! I'm your Flashcard Assistant. Ask me for study tips, flashcard ideas, or explanations.");
  },

  appendMessage(sender, text) {
    const out = document.getElementById("ai-chat-output");
    const msgDiv = document.createElement("div");
    msgDiv.style.marginBottom = "8px";
    msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
    out.appendChild(msgDiv);
    out.scrollTop = out.scrollHeight;
  },

  async sendMessage() {
    const input = document.getElementById("ai-chat-input");
    const message = input.value.trim();
    if (!message) return;

    this.appendMessage("You", message);
    input.value = "";
    this.appendMessage("AI", "Thinking...");

    try {
      const reply = await this.askOpenAI(message);
      const out = document.getElementById("ai-chat-output");
      out.removeChild(out.lastChild);
      this.appendMessage("AI", reply);
    } catch (error) {
      const out = document.getElementById("ai-chat-output");
      out.removeChild(out.lastChild);
      this.appendMessage("AI", "❌ Error. Please try again later.");
      console.error("AI Error:", error);
    }
  },

  async askOpenAI(message) {
    const response = await fetch(window.API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.reply;
  },
};

// ===================== GLOBAL HELPER FUNCTIONS ===================== //

async function askAI(message) {
  const response = await fetch(window.API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const data = await response.json();
  return data.reply;
}

async function generateFlashcardSuggestions(topic) {
  const message = `Generate 3 flashcards about "${topic}". Format:
Q1: [question]
A1: [answer]
Q2: [question]
A2: [answer]
Q3: [question]
A3: [answer]`;
  return await askAI(message);
}

async function explainConcept(concept) {
  return await askAI(`Explain this concept simply: "${concept}"`);
}

async function getStudyTips(subject) {
  return await askAI(`Give 3 effective study tips for learning: "${subject}"`);
}

if (typeof window !== "undefined") {
  window.AIAssistant = { askAI, generateFlashcardSuggestions, explainConcept, getStudyTips };
  window.addEventListener("DOMContentLoaded", () => window.aiAssistantSDK?.init());
}
