export const CATEGORY_ORDER = ['Proteins', 'Produce', 'Dairy', 'Pantry', 'Canned & Jarred', 'Spices', 'Other'];

export function aggregateShoppingList(mealPlan) {
  const itemMap = {};
  Object.values(mealPlan).forEach(dayMeals => {
    if (!dayMeals) return;
    Object.values(dayMeals).forEach(meal => {
      if (!meal?.ingredients) return;
      meal.ingredients.forEach(ing => {
        const key = ing.item.toLowerCase().trim();
        if (itemMap[key]) {
          itemMap[key].occurrences += 1;
        } else {
          itemMap[key] = { ...ing, key, occurrences: 1 };
        }
      });
    });
  });
  const grouped = {};
  CATEGORY_ORDER.forEach(cat => { grouped[cat] = []; });
  Object.values(itemMap).forEach(item => {
    const cat = CATEGORY_ORDER.includes(item.category) ? item.category : 'Other';
    grouped[cat].push(item);
  });
  CATEGORY_ORDER.forEach(cat => {
    grouped[cat].sort((a, b) => a.item.localeCompare(b.item));
  });
  return grouped;
}
