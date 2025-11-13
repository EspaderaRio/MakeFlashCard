export default async function handler(req, res) {
  console.log("OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY); // ✅ server-side log

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Missing message in request body" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }]
      })
    });

    const data = await response.json();
    console.log("OpenAI API response:", data); // ✅ log this too

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
async function callOpenAIWithRetry(payload, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", payload);
    if (res.status === 429 && i < retries - 1) {
      console.log("Rate limited. Retrying in", (i + 1) * 2000, "ms");
      await new Promise(r => setTimeout(r, (i + 1) * 2000)); // exponential backoff
      continue;
    }
    return res;
  }
  return null;
}

