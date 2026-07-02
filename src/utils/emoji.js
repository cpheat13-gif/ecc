// Picks the food emoji shown as a recipe's "photo".
// Recipes generated after v2 carry their own `emoji` field from Claude;
// this keyword fallback covers older saved data.

const RULES = [
  [/poke|sushi|sashimi/, '🍣'],
  [/ramen|noodle|pho\b|soba|udon|pad thai/, '🍜'],
  [/pasta|spaghetti|penne|linguine|gnocchi|lasagna|orzo/, '🍝'],
  [/taco/, '🌮'],
  [/burrito|wrap|shawarma|gyro/, '🌯'],
  [/pizza|flatbread pizza/, '🍕'],
  [/burger|slider/, '🍔'],
  [/sandwich|blt|melt\b/, '🥪'],
  [/salad|slaw/, '🥗'],
  [/soup|stew|chili|bisque|chowder/, '🍲'],
  [/curry|masala|tikka|korma/, '🍛'],
  [/dumpling|potsticker|gyoza|wonton/, '🥟'],
  [/falafel|meatball|kofta/, '🧆'],
  [/kebab|skewer|satay|yakitori/, '🍢'],
  [/salmon|tuna|cod|halibut|trout|snapper|mahi|fish|branzino/, '🐟'],
  [/shrimp|prawn|scampi/, '🍤'],
  [/chicken|turkey|poultry/, '🍗'],
  [/steak|beef|bison|brisket|ribeye|sirloin/, '🥩'],
  [/pork|bacon|ham|carnitas/, '🥓'],
  [/lamb/, '🍖'],
  [/egg|omelet|omelette|frittata|scramble|shakshuka/, '🍳'],
  [/pancake|waffle|french toast|crepe/, '🥞'],
  [/oat|porridge|granola|muesli|overnight/, '🥣'],
  [/yogurt|parfait/, '🥣'],
  [/smoothie|shake\b/, '🥤'],
  [/matcha/, '🍵'],
  [/coffee|espresso|latte/, '☕'],
  [/avocado/, '🥑'],
  [/sweet potato/, '🍠'],
  [/potato|hash/, '🥔'],
  [/corn|elote/, '🌽'],
  [/pepper|fajita/, '🫑'],
  [/mushroom/, '🍄'],
  [/rice|risotto|pilaf|paella|bowl/, '🍚'],
  [/pita|hummus/, '🫓'],
  [/bread|sourdough|toast/, '🍞'],
  [/muffin|scone/, '🧁'],
  [/berry|blueberry|strawberry/, '🫐'],
  [/banana/, '🍌'],
  [/apple/, '🍎'],
];

const FALLBACK = {
  breakfast: '🍳',
  lunch: '🥗',
  dinner: '🍽️',
  snack: '🍎',
};

export function getRecipeEmoji(recipe, mealType) {
  if (recipe?.emoji) return recipe.emoji;
  const name = (recipe?.name || '').toLowerCase();
  for (const [re, emoji] of RULES) {
    if (re.test(name)) return emoji;
  }
  return FALLBACK[recipe?.mealType || mealType] || '🍽️';
}
