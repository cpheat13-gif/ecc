import { useApp } from '../context/AppContext';

const MEAL_LABEL = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export default function MealCard({ day, mealType, recipe }) {
  const { state, dispatch } = useApp();
  const isGenerating =
    state.generatingMeal?.day === day && state.generatingMeal?.type === mealType;

  const openOptions = (e) => {
    if (e) e.stopPropagation();
    dispatch({ type: 'OPEN_OPTIONS', day, mealType });
  };

  const handleOpen = () => {
    dispatch({ type: 'OPEN_RECIPE', meal: { day, type: mealType, recipe } });
  };

  if (!recipe) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">
              {MEAL_LABEL[mealType]}
            </div>
            <div className="text-sm text-stone-500">No meal selected yet</div>
          </div>
          <button
            onClick={openOptions}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-all active:scale-95 disabled:opacity-60 shadow-sm"
          >
            {isGenerating ? (
              <>
                <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Generating…
              </>
            ) : (
              <>✨ Pick meal</>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl bg-white border border-stone-200 overflow-hidden cursor-pointer active:scale-[0.99] transition-transform shadow-sm"
      onClick={handleOpen}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">
                {MEAL_LABEL[mealType]}
              </span>
              {recipe.highSodiumFlag && (
                <span className="text-xs bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full">
                  ⚠ Sodium
                </span>
              )}
            </div>
            <h3 className="font-semibold text-stone-900 text-sm leading-snug truncate">
              {recipe.name}
            </h3>
            <div className="text-xs text-stone-400 mt-0.5">🕐 {recipe.cookTime}</div>
          </div>

          <button
            onClick={openOptions}
            disabled={isGenerating}
            title="Pick a different meal"
            className="shrink-0 p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-500 text-xs transition-colors disabled:opacity-50"
          >
            {isGenerating
              ? <span className="w-3 h-3 rounded-full border-2 border-stone-400/30 border-t-stone-400 animate-spin block" />
              : '↺'}
          </button>
        </div>

        {/* Macro chips */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { label: 'Connor', data: recipe.macros?.connor, color: 'bg-blue-50 text-blue-700' },
            { label: 'Isa',    data: recipe.macros?.isa,    color: 'bg-violet-50 text-violet-700' },
          ].map(({ label, data, color }) => (
            data && (
              <div key={label} className={`rounded-xl px-3 py-2 ${color}`}>
                <div className="text-[10px] font-medium opacity-70 mb-0.5">{label}</div>
                <div className="text-xs font-semibold">{data.calories} kcal</div>
                <div className="text-[10px] opacity-80">
                  P {data.protein}g · C {data.carbs}g · F {data.fat}g
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
