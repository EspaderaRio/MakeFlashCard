let lastRequestTime = 0; // simple per-server rate limiter

export default async function handler(req, res) {
  console.log("OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Simple 2-second cooldown (avoid hammering API)
    const now = Date.now();
    if (now - lastRequestTime < 2000) {
      return res.status(429).json({ error: "Too many requests. Please wait a moment." });
    }
    lastRequestTime = now;

    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Missing message in request body" });
    }

    // Prepare payload once
    const payload = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }],
      }),
    };

    // Use the retry wrapper now ✅
    const response = await callOpenAIWithRetry(payload, 3);

    if (!response) {
      return res.status(429).json({ error: "Rate limit hit. Please try again later." });
    }

    const data = await response.json();
    console.log("OpenAI API response:", data);

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || "OpenAI API error" });
    }

    const reply = data?.choices?.[0]?.message?.content || "No response from model.";
    res.status(200).json({ reply });

  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// ✅ retry-aware OpenAI call
async function callOpenAIWithRetry(payload, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", payload);
    if (res.status === 429 && i < retries - 1) {
      const delay = (i + 1) * 2000;
      console.log(`Rate limited (attempt ${i + 1}). Retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
      continue;
    }
    return res;
  }
  return null;
}
