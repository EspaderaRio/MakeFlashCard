import fetch from "node-fetch";

export default async function handler(req, res) {
  const { message } = req.body;
  try {
    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant for a flashcard-making app. Help users create and study effectively.",
          },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await aiRes.json();
    res.status(200).json({ reply: data.choices?.[0]?.message?.content || "No response" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
