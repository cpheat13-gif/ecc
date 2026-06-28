import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

const CATEGORY_ICONS = {
  'Proteins':      '🥩',
  'Produce':       '🥦',
  'Dairy':         '🥚',
  'Pantry':        '🫙',
  'Canned & Jarred': '🥫',
  'Spices':        '🧂',
  'Other':         '📦',
};

function MacroTable({ macros }) {
  const rows = [
    { label: 'Calories', key: 'calories', unit: 'kcal' },
    { label: 'Protein',  key: 'protein',  unit: 'g'    },
    { label: 'Carbs',    key: 'carbs',    unit: 'g'    },
    { label: 'Fat',      key: 'fat',      unit: 'g'    },
  ];

  return (
    <div className="rounded-2xl overflow-hidden border border-stone-200">
      <div className="grid grid-cols-3 text-xs font-semibold text-stone-500 bg-stone-50 px-4 py-2">
        <span></span>
        <span className="text-blue-600 text-center">Connor</span>
        <span className="text-violet-600 text-center">Isa</span>
      </div>
      {rows.map((row, i) => (
        <div
          key={row.key}
          className={`grid grid-cols-3 px-4 py-2.5 text-sm ${
            i % 2 === 0 ? 'bg-white' : 'bg-stone-50'
          }`}
        >
          <span className="text-stone-500 text-xs">{row.label}</span>
          <span className="text-center font-medium text-stone-900">
            {macros?.connor?.[row.key] ?? '—'}{row.unit !== 'kcal' ? row.unit : ''}
          </span>
          <span className="text-center font-medium text-stone-900">
            {macros?.isa?.[row.key] ?? '—'}{row.unit !== 'kcal' ? row.unit : ''}
          </span>
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

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') dispatch({ type: 'CLOSE_RECIPE' }); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [dispatch]);

  if (!selectedMeal) return null;

  const { day, type: mealType, recipe } = selectedMeal;
  const isGenerating =
    state.generatingMeal?.day === day && state.generatingMeal?.type === mealType;

  const starKey = `${day}-${mealType}`;
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

  const grouped = groupIngredients(recipe.ingredients || []);
  const portions = mealType === 'dinner' ? '4 portions (2 dinner + 2 lunch)' : '2 portions';

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      onClick={(e) => e.target === e.currentTarget && dispatch({ type: 'CLOSE_RECIPE' })}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => dispatch({ type: 'CLOSE_RECIPE' })} />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-3xl max-h-[90vh] flex flex-col border-t border-stone-200 shadow-2xl">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-10 h-1 bg-stone-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 pb-3 shrink-0 border-b border-stone-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-stone-400 capitalize">{day} · {mealType}</span>
                {recipe.highSodiumFlag && (
                  <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                    ⚠ High sodium — Isa, check serving size
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-stone-900 leading-tight">{recipe.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-stone-500">🕐 {recipe.cookTime}</span>
                <span className="text-sm text-stone-500">🍽 {portions}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleStar}
                className={`p-2 rounded-xl transition-colors ${
                  isStarred
                    ? 'bg-amber-50 text-amber-500'
                    : 'bg-stone-100 text-stone-400 hover:text-amber-500'
                }`}
                title={isStarred ? 'Remove from log' : 'Log this meal'}
              >
                {isStarred ? '★' : '☆'}
              </button>
              <button
                onClick={() => dispatch({ type: 'CLOSE_RECIPE' })}
                className="p-2 rounded-xl bg-stone-100 text-stone-500 hover:text-stone-800"
              >
                ✕
              </button>
            </div>
          </div>

          <button
            onClick={handleSwap}
            className="mt-3 w-full py-2.5 rounded-xl border border-emerald-600 text-emerald-700 text-sm font-medium hover:bg-emerald-50 transition-colors active:scale-95"
          >
            ↺ Swap for a different meal
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-6 pt-4">
          {/* Macros */}
          <section>
            <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
              Macros per serving
            </h3>
            <MacroTable macros={recipe.macros} />
          </section>

          {/* Ingredients */}
          <section>
            <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
              Ingredients
            </h3>
            <div className="space-y-4">
              {Object.entries(grouped).map(([cat, items]) => (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{CATEGORY_ICONS[cat] || '📦'}</span>
                    <span className="text-xs font-semibold text-stone-500">{cat}</span>
                  </div>
                  <div className="space-y-1.5 pl-1">
                    {items.map((ing, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-stone-800">{ing.item}</span>
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
          {recipe.steps?.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
                Method
              </h3>
              <ol className="space-y-4">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center mt-0.5">
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
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
                Whole Foods Shopping Tips
              </h3>
              <div className="space-y-2">
                {recipe.wholeFoodsTips.map((tip, i) => (
                  <div key={i} className="flex gap-2 text-sm text-stone-600">
                    <span className="shrink-0 text-emerald-600">•</span>
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
