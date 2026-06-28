import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import CookingMode from './CookingMode';

const CATEGORY_ICONS = {
  'Proteins':        '🥩',
  'Produce':         '🥦',
  'Dairy':           '🥚',
  'Pantry':          '🫙',
  'Canned & Jarred': '🥫',
  'Spices':          '🧂',
  'Other':           '📦',
};

function MacroGrid({ macros }) {
  const metrics = [
    { label: 'Calories', key: 'calories', unit: 'kcal' },
    { label: 'Protein',  key: 'protein',  unit: 'g' },
    { label: 'Carbs',    key: 'carbs',    unit: 'g' },
    { label: 'Fat',      key: 'fat',      unit: 'g' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {[
        { k: 'connor', label: 'Connor', bg: 'bg-sky-50',    text: 'text-sky-700',    muted: 'text-sky-500' },
        { k: 'isa',    label: 'Isa',    bg: 'bg-violet-50', text: 'text-violet-700', muted: 'text-violet-500' },
      ].map(({ k, label, bg, text, muted }) => macros?.[k] && (
        <div key={k} className={`rounded-2xl p-3.5 ${bg}`}>
          <div className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${muted}`}>{label}</div>
          {metrics.map(({ label: ml, key: mk, unit }) => (
            <div key={mk} className="flex justify-between items-baseline mb-1.5 last:mb-0">
              <span className={`text-xs ${muted}`}>{ml}</span>
              <span className={`text-sm font-bold ${text} tabular-nums`}>
                {macros[k][mk]}{unit !== 'kcal' && <span className={`text-[10px] font-normal ${muted}`}>{unit}</span>}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function groupIngredients(ingredients) {
  const map = {};
  ingredients.forEach(ing => {
    const cat = ing.category || 'Other';
    if (!map[cat]) map[cat] = [];
    map[cat].push(ing);
  });
  return map;
}

export default function RecipeModal() {
  const { state, dispatch } = useApp();
  const { selectedMeal } = state;
  const [cooking, setCooking] = useState(false);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') dispatch({ type: 'CLOSE_RECIPE' }); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [dispatch]);

  // Reset cooking mode when recipe changes
  useEffect(() => { setCooking(false); }, [selectedMeal]);

  if (!selectedMeal) return null;

  const { day, type: mealType, recipe } = selectedMeal;

  const starKey   = `${day}-${mealType}`;
  const isStarred = !!state.starredMeals?.[starKey];

  const handleStar = () => {
    dispatch(isStarred
      ? { type: 'UNSTAR_MEAL', day, mealType }
      : { type: 'STAR_MEAL', day, mealType, recipe }
    );
  };

  const handleSwap = () => {
    dispatch({ type: 'CLOSE_RECIPE' });
    dispatch({ type: 'OPEN_OPTIONS', day, mealType });
  };

  const grouped  = groupIngredients(recipe.ingredients || []);
  const portions = mealType === 'dinner' ? '4 portions (2 dinner + 2 lunch)' : '2 portions';
  const hasSteps = recipe.steps?.length > 0;

  if (cooking && hasSteps) {
    return (
      <CookingMode
        steps={recipe.steps}
        recipeName={recipe.name}
        onClose={() => setCooking(false)}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      onClick={(e) => e.target === e.currentTarget && dispatch({ type: 'CLOSE_RECIPE' })}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => dispatch({ type: 'CLOSE_RECIPE' })} />

      <div className="relative bg-white rounded-t-3xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 pb-4 shrink-0 border-b border-stone-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 capitalize">
                  {day} · {mealType}
                </span>
                {recipe.highSodiumFlag && (
                  <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full font-semibold">
                    High sodium
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-stone-900 leading-tight">{recipe.name}</h2>
              <div className="flex items-center gap-4 mt-1.5">
                <span className="text-sm text-stone-400 font-medium">{recipe.cookTime}</span>
                <span className="text-sm text-stone-400 font-medium">{portions}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleStar}
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors text-lg ${
                  isStarred ? 'bg-amber-50 text-amber-500' : 'bg-stone-100 text-stone-400'
                }`}
                title={isStarred ? 'Remove from log' : 'Log this meal'}
              >
                {isStarred ? '★' : '☆'}
              </button>
              <button
                onClick={() => dispatch({ type: 'CLOSE_RECIPE' })}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            {hasSteps && (
              <button
                onClick={() => setCooking(true)}
                className="flex-1 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold transition-colors active:bg-stone-800 flex items-center justify-center gap-2"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3,1 14,7.5 3,14" fill="currentColor" stroke="none" />
                </svg>
                Start Cooking
              </button>
            )}
            <button
              onClick={handleSwap}
              className={`py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 text-emerald-700 text-sm font-semibold transition-colors active:bg-emerald-100 ${hasSteps ? 'px-4' : 'flex-1'}`}
            >
              ↺ Swap
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-10 space-y-6 pt-5">
          {/* Macros */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3">Macros per serving</p>
            <MacroGrid macros={recipe.macros} />
          </section>

          {/* Ingredients */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3">Ingredients</p>
            <div className="space-y-5">
              {Object.entries(grouped).map(([cat, items]) => (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{CATEGORY_ICONS[cat] || '📦'}</span>
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">{cat}</span>
                  </div>
                  <div className="space-y-2 pl-1">
                    {items.map((ing, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-stone-800 font-medium">{ing.item}</span>
                        <span className="text-stone-400 ml-4 shrink-0">
                          {ing.quantity} {ing.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Method */}
          {hasSteps && (
            <section>
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4">Method</p>
              <ol className="space-y-4">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="shrink-0 text-sm font-bold text-stone-300 tabular-nums w-4 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-stone-700 leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Whole Foods tips */}
          {recipe.wholeFoodsTips?.length > 0 && (
            <section>
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3">Shopping Tips</p>
              <div className="space-y-2">
                {recipe.wholeFoodsTips.map((tip, i) => (
                  <div key={i} className="flex gap-3 text-sm text-stone-600">
                    <span className="shrink-0 text-emerald-500 mt-0.5">•</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
