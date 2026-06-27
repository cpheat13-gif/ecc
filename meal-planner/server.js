import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '10kb' }));

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('[warn] ANTHROPIC_API_KEY not set — meal generation will fail');
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post('/api/generate-meal', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.length > 3000) {
    return res.status(400).json({ error: 'Invalid prompt' });
  }

  try {
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
    const isJson = err instanceof SyntaxError;
    res.status(500).json({
      error: isJson
        ? 'Model returned invalid JSON — try again'
        : 'Failed to generate meal. Check your API key.',
    });
  }
});

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) =>
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
  );
}

app.listen(PORT, () => console.log(`API server → http://localhost:${PORT}`));
