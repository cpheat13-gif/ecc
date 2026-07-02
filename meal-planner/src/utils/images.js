// Background photo generation for recipes.
// Fire-and-forget: emoji shows until the photo arrives, failures fall back silently.

const inFlight = new Set();
const failed = new Set();
const listeners = new Set();

export function onImageStateChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  listeners.forEach(fn => fn());
}

export function imageGenerating(name) {
  return inFlight.has(name);
}

export async function ensureRecipeImage(recipe, dispatch) {
  const name = recipe?.name;
  if (!name || recipe.imageUrl || inFlight.has(name) || failed.has(name)) return;

  inFlight.add(name);
  notify();
  try {
    const res = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        ingredients: (recipe.ingredients || []).slice(0, 4).map(i => i.item),
      }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.url) throw new Error(data?.error || 'no image');
    dispatch({ type: 'SET_RECIPE_IMAGE', name, url: data.url });
  } catch {
    failed.add(name); // don't retry this session
  } finally {
    inFlight.delete(name);
    notify();
  }
}
