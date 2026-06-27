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
    <div className="rounded-2xl overflow-hidden border border-slate-700">
      <div className="grid grid-cols-3 text-xs font-semibold text-slate-400 bg-slate-700/50 px-4 py-2">
        <span></span>
        <span className="text-sky-400 text-center">Connor</span>
        <span className="text-purple-400 text-center">Isa</span>
      </div>
      {rows.map((row, i) => (
        <div
          key={row.key}
          className={`grid grid-cols-3 px-4 py-2.5 text-sm ${
            i % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/60'
          }`}
        >
          <span className="text-slate-400 text-xs">{row.label}</span>
          <span className="text-center font-medium text-slate-100">
            {macros?.connor?.[row.key] ?? '—'}{row.unit !== 'kcal' ? row.unit : ''}
          </span>
          <span className="text-center font-medium text-slate-100">
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
  const dayConfig = state.weekConfig[day];
  const isGenerating =
    state.generatingMeal?.day === day && state.generatingMeal?.type === mealType;

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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => dispatch({ type: 'CLOSE_RECIPE' })} />

      {/* Sheet */}
      <div className="relative bg-slate-900 rounded-t-3xl max-h-[90vh] flex flex-col border-t border-slate-700">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-10 h-1 bg-slate-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 pb-3 shrink-0 border-b border-slate-800">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-slate-500 capitalize">{day} · {mealType}</span>
                {recipe.highSodiumFlag && (
                  <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                    ⚠ High sodium — Isa, check serving size
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-100 leading-tight">{recipe.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-slate-400">🕐 {recipe.cookTime}</span>
                <span className="text-sm text-slate-400">🍽 {portions}</span>
              </div>
            </div>
            <button
              onClick={() => dispatch({ type: 'CLOSE_RECIPE' })}
              className="shrink-0 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              ✕
            </button>
          </div>

          <button
            onClick={handleSwap}
            className="mt-3 w-full py-2.5 rounded-xl border border-emerald-500/50 text-emerald-400 text-sm font-medium hover:bg-emerald-500/10 transition-colors active:scale-95"
          >
            ↺ Swap for a different meal
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-6 pt-4">
          {/* Macros */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Macros per serving
            </h3>
            <MacroTable macros={recipe.macros} />
          </section>

          {/* Ingredients */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Ingredients
            </h3>
            <div className="space-y-4">
              {Object.entries(grouped).map(([cat, items]) => (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{CATEGORY_ICONS[cat] || '📦'}</span>
                    <span className="text-xs font-semibold text-slate-400">{cat}</span>
                  </div>
                  <div className="space-y-1.5 pl-1">
                    {items.map((ing, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-slate-200">{ing.item}</span>
                        <span className="text-slate-400 ml-4 shrink-0">
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
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Method
              </h3>
              <ol className="space-y-4">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-300 leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Whole Foods brands */}
          {recipe.wholeFoodsBrands?.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Whole Foods / 365 Brands
              </h3>
              <div className="flex flex-wrap gap-2">
                {recipe.wholeFoodsBrands.map((brand, i) => (
                  <span
                    key={i}
                    className="text-xs bg-slate-800 border border-slate-700 text-slate-400 px-2.5 py-1 rounded-full"
                  >
                    {brand}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
