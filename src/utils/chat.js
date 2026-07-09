import { aggregateShoppingList, CATEGORY_ORDER } from './shopping';

export async function sendChatMessage(messages, context) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, context }),
  });

  const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data; // { message, recipe }
}

// Ingredients the user has already checked off their shopping list —
// used as a proxy for "what's already in the fridge/pantry."
export function onHandIngredients(mealPlan, shoppingChecked) {
  const grouped = aggregateShoppingList(mealPlan || {});
  const names = [];
  CATEGORY_ORDER.forEach(cat => {
    (grouped[cat] || []).forEach(item => {
      if (shoppingChecked?.[item.key]) names.push(item.item);
    });
  });
  return names;
}
