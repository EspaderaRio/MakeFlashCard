// ===================== AI ASSISTANT SDK (GLOBAL) ===================== //

const API_URL = 'https://flashcards-backend-git-main-rio-espaderas-projects.vercel.app/api/ask';

window.aiAssistantSDK = {

  init() {
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
      z-index: 10000;
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
    input.addEventListener("keydown", e => { if (e.key === "Enter") this.sendMessage(); });

    this.appendMessage("AI", "👋 Hi there! I'm your Flashcard Assistant. I can help you create questions and answers, explain topics, or give flashcard ideas. What would you like to do?");
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

    // Show loading message
    this.appendMessage("AI", "Thinking...");

    try {
      const reply = await this.askOpenAI(message);
      // Remove "Thinking..." message
      const out = document.getElementById("ai-chat-output");
      out.removeChild(out.lastChild);
      this.appendMessage("AI", reply);
    } catch (error) {
      // Remove "Thinking..." message
      const out = document.getElementById("ai-chat-output");
      out.removeChild(out.lastChild);
      this.appendMessage("AI", "❌ Sorry, I encountered an error. Please try again.");
      console.error('AI Error:', error);
    }
  },

  async askOpenAI(message) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.reply;

    } catch (error) {
      console.error('AI Assistant Error:', error);
      throw error;
    }
  }
};

// ===================== HELPER FUNCTIONS ===================== //

async function askAI(message) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.reply;

  } catch (error) {
    console.error('AI Assistant Error:', error);
    throw error;
  }
}

async function generateFlashcardSuggestions(topic) {
  const message = `Generate 3 flashcard ideas for the topic: "${topic}". For each flashcard, provide a question and answer. Format as:
Q1: [question]
A1: [answer]
Q2: [question]
A2: [answer]
Q3: [question]
A3: [answer]`;

  return await askAI(message);
}

async function explainConcept(concept) {
  const message = `Explain this concept in simple terms: "${concept}"`;
  return await askAI(message);
}

async function getStudyTips(subject) {
  const message = `Provide 3 effective study tips for learning: "${subject}"`;
  return await askAI(message);
}

// Expose helper functions globally
if (typeof window !== 'undefined') {
  window.AIAssistant = {
    askAI,
    generateFlashcardSuggestions,
    explainConcept,
    getStudyTips
  };
}

// Auto-initialize the chat widget when page loads
window.addEventListener("DOMContentLoaded", () => {
  if (window.aiAssistantSDK) {
    window.aiAssistantSDK.init();
  }
});
