// Generates a studio food photo for a recipe via fal.ai FLUX schnell.
// Requires FAL_KEY in Vercel env vars. Returns { url }.

const STYLE = [
  'single serving plated on a handmade warm cream ceramic plate, perfectly centered',
  'overhead 30-degree angle, warm cream linen tablecloth background',
  'soft diffused window light from the left, gentle natural shadows',
  'minimalist high-end editorial food magazine style, muted warm tones',
  'shallow depth of field, photorealistic studio food photography',
  'no text, no hands, no people, no cutlery clutter',
].join(', ');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, ingredients } = req.body || {};
  if (!name || typeof name !== 'string' || name.length > 200) {
    return res.status(400).json({ error: 'Invalid recipe name' });
  }

  if (!process.env.FAL_KEY) {
    return res.status(501).json({ error: 'Image generation not configured — add FAL_KEY in Vercel env vars' });
  }

  const detail = Array.isArray(ingredients) && ingredients.length
    ? ` featuring ${ingredients.slice(0, 4).join(', ')}`
    : '';
  const prompt = `Professional studio food photograph of ${name}${detail}. ${STYLE}`;

  try {
    const r = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_size: 'square',
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true,
      }),
      signal: AbortSignal.timeout(25000),
    });

    const data = await r.json().catch(() => null);
    const url = data?.images?.[0]?.url;
    if (!r.ok || !url) {
      console.error('[generate-image]', r.status, JSON.stringify(data).slice(0, 300));
      return res.status(502).json({ error: 'Image generation failed' });
    }
    res.json({ url });
  } catch (err) {
    console.error('[generate-image]', err.message);
    res.status(500).json({ error: err.message || 'Server error' });
  }
}
