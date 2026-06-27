import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.length > 3000) {
    return res.status(400).json({ error: 'Invalid prompt' });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 700,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content[0].text.trim();
    const cleaned = raw.replace(/^```(?:json)?\s*/m, '').replace(/\s*```$/m, '');
    const meal = JSON.parse(cleaned);
    res.json(meal);
  } catch (err) {
    console.error('[generate-meal]', err.message);
    res.status(500).json({
      error: err instanceof SyntaxError
        ? 'Model returned invalid JSON — try again'
        : 'Failed to generate meal. Check your API key.',
    });
  }
}
