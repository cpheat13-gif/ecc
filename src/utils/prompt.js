export function buildMealPrompt({ mealType, dayType, targets }) {
  const { connor, isa } = targets;
  const portionNote =
    mealType === 'dinner'
      ? 'Dinners make 4 portions (2 dinner + 2 next-day lunch). Connor and Isa eat the same meal with different protein portion sizes.'
      : 'Makes 2 portions — one for Connor, one for Isa — with adjusted protein portions.';
  return `Return JSON only. No explanation. Generate a meal for: ${mealType} on a ${dayType} day.\n\nDietary rules:\n- Whole natural foods only. No artificial ingredients, preservatives, or highly processed products.\n- Moderate sodium, potassium, and phosphorus throughout (Isa has a preventative kidney health consideration).\n- Isa's protein must not exceed 80g/day total.\n- Ingredients should be available at Whole Foods. Prefer 365 brand for staples. Keep cost-efficient.\n- ${portionNote}\n\nMacro targets for this meal:\n- Connor: ${connor.calories} kcal / ${connor.protein}g protein / ${connor.carbs}g carbs / ${connor.fat}g fat\n- Isa: ${isa.calories} kcal / ${isa.protein}g protein / ${isa.carbs}g carbs / ${isa.fat}g fat\n\nReturn this exact JSON structure:\n{\n  "name": "",\n  "cookTime": "",\n  "ingredients": [{"item": "", "quantity": "", "unit": "", "category": ""}],\n  "steps": [],\n  "macros": {\n    "connor": {"calories": 0, "protein": 0, "carbs": 0, "fat": 0},\n    "isa": {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}\n  },\n  "wholeFoodsBrands": [],\n  "highSodiumFlag": false\n}`;
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
