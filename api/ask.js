// api/ask.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Handle CORS preflight requests
  res.setHeader('Access-Control-Allow-Origin', '*'); // allow any origin
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // respond to preflight
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'No message provided' });

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
