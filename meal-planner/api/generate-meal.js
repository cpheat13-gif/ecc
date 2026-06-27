import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.length > 5000) {
    return res.status(400).json({ error: 'Invalid prompt' });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content[0].text.trim();
    const cleaned = raw.replace(/^```(?:json)?\s*/m, '').replace(/\s*```$/m, '');
    const result = JSON.parse(cleaned);
    res.json(result);
  } catch (err) {
    console.error('[generate-meal]', err.status, err.message);
    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: 'Model returned invalid JSON — try again' });
    }
    if (err.status === 401) {
      return res.status(500).json({ error: 'Invalid API key — check ANTHROPIC_API_KEY in Vercel env vars' });
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set — add it in Vercel → Settings → Environment Variables' });
    }
    res.status(500).json({ error: `API error ${err.status || ''}: ${err.message}` });
  }
}
