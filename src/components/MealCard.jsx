import { useApp } from '../context/AppContext';

const MEAL_LABEL = {
  breakfast: 'Breakfast',
  lunch:     'Lunch',
  dinner:    'Dinner',
  snack:     'Snack',
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
      <div className="rounded-2xl bg-stone-50 border border-dashed border-stone-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-1">
              {MEAL_LABEL[mealType]}
            </div>
            <div className="text-sm text-stone-400 font-medium">Nothing planned</div>
          </div>
          <button
            onClick={openOptions}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 shadow-sm shadow-emerald-900/10"
          >
            {isGenerating ? (
              <>
                <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Generating
              </>
            ) : 'Pick meal'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl bg-white overflow-hidden cursor-pointer active:scale-[0.99] transition-transform shadow-[0_1px_10px_rgba(0,0,0,0.07)] border border-stone-100/80"
      onClick={handleOpen}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">
                {MEAL_LABEL[mealType]}
              </span>
              {recipe.highSodiumFlag && (
                <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full font-semibold">
                  High sodium
                </span>
              )}
            </div>
            <h3 className="font-semibold text-stone-900 leading-snug truncate">
              {recipe.name}
            </h3>
            <div className="text-xs text-stone-400 mt-0.5 font-medium">{recipe.cookTime}</div>
          </div>

          <button
            onClick={openOptions}
            disabled={isGenerating}
            title="Pick a different meal"
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-stone-100 text-stone-500 text-sm transition-colors disabled:opacity-50 active:bg-stone-200"
          >
            {isGenerating
              ? <span className="w-3 h-3 rounded-full border-2 border-stone-400/30 border-t-stone-400 animate-spin block" />
              : '↺'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Connor', data: recipe.macros?.connor, bg: 'bg-sky-50', text: 'text-sky-700', muted: 'text-sky-500' },
            { label: 'Isa',    data: recipe.macros?.isa,    bg: 'bg-violet-50', text: 'text-violet-700', muted: 'text-violet-500' },
          ].map(({ label, data, bg, text, muted }) => data && (
            <div key={label} className={`rounded-xl px-3 py-2.5 ${bg}`}>
              <div className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${muted}`}>{label}</div>
              <div className={`text-sm font-bold ${text} tabular-nums`}>{data.calories} kcal</div>
              <div className={`text-[10px] mt-0.5 ${muted}`}>
                P {data.protein}g · C {data.carbs}g · F {data.fat}g
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
