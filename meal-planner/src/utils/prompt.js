export function buildMealPrompt({ mealType, dayType, targets }) {
  const { connor, isa } = targets;

  const portionNote =
    mealType === 'dinner'
      ? 'Dinners make 4 portions (2 dinner + 2 next-day lunch). Connor and Isa eat the same meal with different protein portion sizes.'
      : 'Makes 2 portions — one for Connor, one for Isa — with adjusted protein portions.';

  return `Return JSON only. No explanation. Generate a meal for: ${mealType} on a ${dayType} day.

Dietary rules:
- Whole natural foods only. No artificial ingredients, preservatives, or highly processed products.
- Moderate sodium, potassium, and phosphorus throughout (Isa has a preventative kidney health consideration).
- Isa's protein must not exceed 80g/day total.
- Ingredients should be available at Whole Foods. Prefer 365 brand for staples. Keep cost-efficient — bulk proteins, seasonal veg, simple staples.
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
  "wholeFoodsBrands": [],
  "highSodiumFlag": false
}`;
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
