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
      <div className="rounded-2xl border border-dashed border-slate-600 bg-slate-800/40 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
              {MEAL_LABEL[mealType]}
            </div>
            <div className="text-sm text-slate-400">No meal selected yet</div>
          </div>
          <button
            onClick={openOptions}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-all active:scale-95 disabled:opacity-60"
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
      className="rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden cursor-pointer active:scale-[0.99] transition-transform"
      onClick={handleOpen}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {MEAL_LABEL[mealType]}
              </span>
              {recipe.highSodiumFlag && (
                <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">
                  ⚠ Sodium
                </span>
              )}
            </div>
            <h3 className="font-semibold text-slate-100 text-sm leading-snug truncate">
              {recipe.name}
            </h3>
            <div className="text-xs text-slate-500 mt-0.5">🕐 {recipe.cookTime}</div>
          </div>

          <button
            onClick={openOptions}
            disabled={isGenerating}
            title="Pick a different meal"
            className="shrink-0 p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-400 text-xs transition-colors disabled:opacity-50"
          >
            {isGenerating
              ? <span className="w-3 h-3 rounded-full border-2 border-slate-400/30 border-t-slate-400 animate-spin block" />
              : '↺'}
          </button>
        </div>

        {/* Macro chips */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { label: 'Connor', data: recipe.macros?.connor, color: 'bg-sky-500/10 text-sky-400' },
            { label: 'Isa',    data: recipe.macros?.isa,    color: 'bg-purple-500/10 text-purple-400' },
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
