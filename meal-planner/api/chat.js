import Anthropic from '@anthropic-ai/sdk';

const BASE_SYSTEM = `You are a friendly, knowledgeable home cooking assistant inside a meal planner app for two people, Connor and Isa.

Dietary rules:
- Whole natural foods only. No artificial ingredients, preservatives, or highly processed products.
- Moderate sodium, potassium, and phosphorus throughout (Isa has a preventative kidney health consideration). Isa's protein should not exceed 80g/day total across all meals.
- All ingredients must be available at Whole Foods. Keep cost-efficient — bulk proteins, seasonal veg, simple staples.
- Use practical US store units for ingredient quantities (lbs, oz, cups, tbsp, tsp, whole count, fl oz). Never grams or milliliters.
- Favor traditional, familiar, mainstream home-cooked dishes over experimental or fusion combinations — classic weeknight dinners, not novelty pairings.
- Assume basic pantry staples are on hand (salt, pepper, cooking oil, common spices) even if not listed as already-have.

Conversation style:
- Be warm, concise, and practical — like a helpful friend who cooks a lot, not a formal assistant. Keep replies short, a sentence or two of chat plus the recipe when ready.
- Ask at most one clarifying question at a time, only when genuinely needed. If you already have enough to make a solid suggestion, just make it.
- When the user wants to swap or adjust part of a suggestion (like a different protein, or "use what I have instead"), adapt smoothly rather than starting over.
- The moment you land on a specific dish the user seems happy with or is clearly ready to cook, include a complete "recipe" object in your JSON response. Otherwise leave it null and keep chatting.

Return ONLY this JSON, no markdown, no explanation outside the JSON:
{
  "message": "your conversational reply as plain text",
  "recipe": null OR {
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
}

ingredient category must be one of: Proteins, Produce, Dairy, Pantry, Canned & Jarred, Spices, Other.`;

function buildContext({ onHand, targets, dayLabel, mealType } = {}) {
  const lines = [];
  if (Array.isArray(onHand) && onHand.length > 0) {
    lines.push(`Ingredients already on hand (from their checked shopping list): ${onHand.slice(0, 40).join(', ')}.`);
  }
  if (targets?.connor || targets?.isa) {
    const parts = [];
    if (targets.connor) parts.push(`Connor ~${targets.connor.calories} kcal / ${targets.connor.protein}g protein`);
    if (targets.isa) parts.push(`Isa ~${targets.isa.calories} kcal / ${targets.isa.protein}g protein`);
    lines.push(`Rough per-meal macro targets — ${parts.join('; ')}.`);
  }
  if (mealType) {
    lines.push(`This conversation is specifically for ${mealType}${dayLabel ? ` on ${dayLabel}` : ''}.`);
  }
  return lines.length ? `\n\nCurrent context:\n${lines.join('\n')}` : '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages, context } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }
  if (messages.length > 40) {
    return res.status(400).json({ error: 'Conversation is too long — try starting a new chat' });
  }
  for (const m of messages) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string' || m.content.length > 4000) {
      return res.status(400).json({ error: 'Invalid message format' });
    }
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: BASE_SYSTEM + buildContext(context),
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    const raw = message.content[0].text.trim();
    const cleaned = raw.replace(/^```(?:json)?\s*/m, '').replace(/\s*```$/m, '');
    const result = JSON.parse(cleaned);
    res.json(result);
  } catch (err) {
    console.error('[chat]', err.status, err.message);
    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: "Had trouble putting that together — mind rephrasing?" });
    }
    if (err.status === 401) {
      return res.status(500).json({ error: 'Invalid API key — check ANTHROPIC_API_KEY in Vercel env vars' });
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set — add it in Vercel → Settings → Environment Variables' });
    }
    res.status(500).json({ error: err.message || 'Server error' });
  }
}
