const input = document.getElementById("ai-chat-input");
const sendBtn = document.getElementById("ai-chat-send");
const output = document.getElementById("ai-chat-output");

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
      body: JSON.stringify({ message }) // must be an object with 'message'
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    removeLastMessage();
    appendMessage("AI", data.reply);
  } catch (err) {
    removeLastMessage();
    appendMessage("AI", "❌ Error. Please try again.");
    console.error(err);
  }
}

function appendMessage(sender, text) {
  const div = document.createElement("div");
  div.innerHTML = `<strong>${sender}:</strong> ${text}`;
  output.appendChild(div);
  output.scrollTop = output.scrollHeight;
}

function removeLastMessage() {
  output.removeChild(output.lastChild);
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});
