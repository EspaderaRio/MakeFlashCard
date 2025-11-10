import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// Allow requests from GitHub Pages origin
app.use(cors({ origin: "https://espaderario.github.io" }));

app.use(express.json());

app.post("/api/ask", async (req, res) => {
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
          { role: "system", content: "You are an AI assistant for flashcards." },
          { role: "user", content: message },
        ],
      }),
    });
    const data = await aiRes.json();
    res.json({ reply: data.choices?.[0]?.message?.content || "No response" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default app;
