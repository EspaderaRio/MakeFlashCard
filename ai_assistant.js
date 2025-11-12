document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("open-ai-chat");
  const modal = document.getElementById("ai-chat");
  const input = document.getElementById("ai-chat-input");
  const sendBtn = document.getElementById("ai-chat-send");
  const output = document.getElementById("ai-chat-output");

  if (!openBtn || !modal || !input || !sendBtn || !output) {
    console.error("AI chat elements not found!");
    return;
  }

  // Toggle modal visibility
  openBtn.addEventListener("click", () => {
    modal.style.display = modal.style.display === "flex" ? "none" : "flex";
  });

  function appendMessage(sender, text) {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${sender}:</strong> ${text}`;
    output.appendChild(div);
    output.scrollTop = output.scrollHeight;
  }

  function removeLastMessage() {
    output.removeChild(output.lastChild);
  }

  async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;
    appendMessage("You", message);
    input.value = "";

    appendMessage("AI", "Thinking...");

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      removeLastMessage();
      appendMessage("AI", data.reply);
    } catch (err) {
      removeLastMessage();
      appendMessage("AI", "❌ Error. Please try again.");
      console.error(err);
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });

  // Optional: greet on first open
  openBtn.addEventListener("click", () => {
    if (output.children.length === 0) {
      appendMessage("AI", "👋 Hi! I'm your Flashcard Assistant. Ask me anything.");
    }
  });
});
