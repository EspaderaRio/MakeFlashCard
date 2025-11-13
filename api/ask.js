// /api/ask.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Allow only POST
  if (req.method === 'OPTIONS') {
    // Handle preflight request
    res.setHeader('Access-Control-Allow-Origin', '*'); // You can replace '*' with your GitHub Pages URL
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  // Set CORS + security headers for actual POST
  res.setHeader('Access-Control-Allow-Origin', '*'); // Or your specific domain
  res.setHeader('X-Content-Type-Options', 'nosniff');

  try {
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: message }],
        max_tokens: 200
      })
    });

    const data = await openaiRes.json();

    res.status(200).json({ answer: data.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
