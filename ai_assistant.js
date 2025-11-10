// ===================== AI ASSISTANT SDK (GLOBAL) ===================== //

window.aiAssistantSDK = {
  init() {
    // === Create floating assistant UI ===
    const container = document.createElement("div");
    container.id = "ai-assistant";
    container.style.cssText = `
      position: fixed;
      bottom: 20px; right: 20px;
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

    // === Event Listeners ===
    const input = container.querySelector("#ai-chat-input");
    const send = container.querySelector("#ai-chat-send");
    send.addEventListener("click", () => this.sendMessage());
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") this.sendMessage();
    });

    // Greeting
    this.appendMessage("AI", "👋 Hi there! I’m your Flashcard Assistant. I can help you create questions and answers, explain study topics, or give flashcard ideas. What would you like to do?");
  },

  async sendMessage() {
    const input = document.getElementById("ai-chat-input");
    const message = input.value.trim();
    if (!message) return;

    this.appendMessage("You", message);
    input.value = "";

    // === Call OpenAI API ===
    const reply = await this.askOpenAI(message);
    this.appendMessage("AI", reply);
  },

  appendMessage(sender, text) {
    const out = document.getElementById("ai-chat-output");
    const div = document.createElement("div");
    div.style.marginBottom = "8px";
    div.innerHTML = `<strong>${sender}:</strong> ${text}`;
    out.appendChild(div);
    out.scrollTop = out.scrollHeight;
  },

  async askOpenAI(message) {
    const OPENAI_API_KEY = "YOUR_API_KEY_HERE"; // ⚠️ replace or secure later
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an AI assistant for a flashcard-making app. Help users come up with smart questions and answers, guide them on how to use the app, and give study advice."
            },
            { role: "user", content: message }
          ]
        })
      });

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || "Hmm, I’m not sure. Try asking in a different way!";
      return content;
    } catch (err) {
      console.error("[aiAssistantSDK] Error:", err);
      return "⚠️ Error connecting to AI. Please check your network or API key.";
    }
  }
};

// Initialize after page loads
window.addEventListener("DOMContentLoaded", () => {
  aiAssistantSDK.init();
});
