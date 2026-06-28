export function buildMealPrompt({ mealType, dayType, targets, requestedName }) {
  const { connor, isa } = targets;
  const nameClause = requestedName ? `\nGenerate this specific recipe: "${requestedName}".` : '';

  const portionNote =
    mealType === 'dinner'
      ? 'Dinners make 4 portions (2 dinner + 2 next-day lunch). Connor and Isa eat the same meal with different protein portion sizes.'
      : 'Makes 2 portions — one for Connor, one for Isa — with adjusted protein portions.';

  return `Return JSON only. No explanation. Generate a meal for: ${mealType} on a ${dayType} day.${nameClause}

Dietary rules:
- Whole natural foods only. No artificial ingredients, preservatives, or highly processed products.
- Moderate sodium, potassium, and phosphorus throughout (Isa has a preventative kidney health consideration).
- Isa's protein must not exceed 80g/day total.
- All ingredients must be available at Whole Foods. Keep cost-efficient — bulk proteins, seasonal veg, simple staples.
- Use practical US store units for all ingredient quantities (lbs, oz, cups, tbsp, tsp, whole count, fl oz, etc.). Do not use grams or milliliters.
- ${portionNote}

Macro targets for this meal:
- Connor: ${connor.calories} kcal / ${connor.protein}g protein / ${connor.carbs}g carbs / ${connor.fat}g fat
- Isa: ${isa.calories} kcal / ${isa.protein}g protein / ${isa.carbs}g carbs / ${isa.fat}g fat

Return this exact JSON structure:
{
  "name": "",
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

For wholeFoodsTips: include 2-3 short, practical tips for shopping this recipe at Whole Foods — which section to find key ingredients, what to look for when buying (e.g. freshness, cut, form), or any helpful store-specific notes. One sentence each.`;
}

export function buildOptionsPrompt({ mealType, participants, targets, searchTerm }) {
  const vibe = searchTerm ? `\nThe user is looking for this vibe/style: "${searchTerm}"` : '';

  const macroLines = [];
  if (participants !== 'isa') {
    const c = targets.connor;
    macroLines.push(`Connor: ${c.calories} kcal / ${c.protein}g protein / ${c.carbs}g carbs / ${c.fat}g fat`);
  }
  if (participants !== 'connor') {
    const i = targets.isa;
    macroLines.push(`Isa: ${i.calories} kcal / ${i.protein}g protein / ${i.carbs}g carbs / ${i.fat}g fat`);
  }

  return `Return JSON only. No explanation. Generate 5 varied ${mealType} recipe options for a meal planner.${vibe}

Macro targets per serving:
${macroLines.join('\n')}

Rules:
- Whole natural foods only, available at Whole Foods
- Moderate sodium (Isa has a kidney health consideration)
- Make the 5 options clearly different in cuisine, cooking style, and ingredients

Return a JSON array of exactly 5 objects, no markdown:
[
  {
    "name": "",
    "cookTime": "",
    "description": "",
    "macros": {
      "connor": {"calories": 0, "protein": 0, "carbs": 0, "fat": 0},
      "isa": {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}
    }
  }
]`;
}

export async function generateMeal(prompt) {
  const res = await fetch('/api/generate-meal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}
