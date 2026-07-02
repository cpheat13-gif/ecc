import Anthropic from '@anthropic-ai/sdk';

const TIKTOK_URL_RE = /tiktok\.com\/@[\w.]+\/video\/\d+|tiktok\.com\/t\/\w+|vm\.tiktok\.com\/\w+/i;

async function fetchTikTokCaption(url) {
  const res = await fetch(
    `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
    {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; meal-planner/1.0)' },
      signal: AbortSignal.timeout(8000),
    }
  );
  if (!res.ok) throw new Error('TikTok video not found or is private');
  const data = await res.json();
  const caption = (data.title || '').trim();
  if (caption.length < 10) {
    throw new Error("Couldn't find recipe text in this TikTok — try pasting the caption directly");
  }
  return caption;
}

function buildPrompt(recipeText) {
  return `Parse the following recipe text into structured JSON. The text may be from a TikTok caption, blog post, or typed manually — extract what you can and infer what's missing.

Recipe text:
"""
${recipeText.slice(0, 3000)}
"""

Return ONLY this JSON with no explanation or markdown:
{
  "name": "",
  "emoji": "",
  "cookTime": "",
  "ingredients": [{"item": "", "quantity": "", "unit": "", "category": ""}],
  "steps": [],
  "macros": {
    "connor": {"calories": 0, "protein": 0, "carbs": 0, "fat": 0},
    "isa": {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}
  },
  "wholeFoodsTips": [],
  "highSodiumFlag": false
}

Rules:
- ingredient category must be one of: Proteins, Produce, Dairy, Pantry, Canned & Jarred, Spices, Other
- emoji: the one food emoji that best represents the finished dish
- Use US store units (lbs, oz, cups, tbsp, tsp, count, etc.) — no metric
- Estimate macros per serving for 2 servings total: Connor gets a larger protein portion (active male, ~170g protein/day target); Isa gets a smaller portion (active female, ~80g protein/day target, moderate sodium/potassium for kidney health)
- highSodiumFlag: true if estimated sodium per serving likely exceeds 800mg
- wholeFoodsTips: 2-3 practical Whole Foods shopping tips for key ingredients
- Infer steps if not explicitly listed; estimate quantities if missing
- Strip hashtags, emojis, and social media text from ingredient/step fields`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { tiktokUrl, text } = req.body || {};

  if (!tiktokUrl && (!text || typeof text !== 'string' || text.trim().length < 10)) {
    return res.status(400).json({ error: 'Provide a TikTok URL or recipe text (at least 10 characters)' });
  }

  let recipeText = '';

  if (tiktokUrl) {
    if (typeof tiktokUrl !== 'string' || !TIKTOK_URL_RE.test(tiktokUrl)) {
      return res.status(400).json({ error: 'Invalid TikTok URL format' });
    }
    try {
      recipeText = await fetchTikTokCaption(tiktokUrl);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  } else {
    recipeText = text.trim();
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{ role: 'user', content: buildPrompt(recipeText) }],
    });

    const raw = message.content[0].text.trim();
    const cleaned = raw.replace(/^```(?:json)?\s*/m, '').replace(/\s*```$/m, '');
    const result = JSON.parse(cleaned);
    res.json(result);
  } catch (err) {
    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: 'Could not structure the recipe — try pasting the text directly' });
    }
    res.status(500).json({ error: err.message || 'Server error' });
  }
}
