import { useApp } from '../context/AppContext';

const MEAL_ICONS = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
};

export default function LogView() {
  const { state, dispatch } = useApp();

  const entries = Object.values(state.starredMeals || {})
    .sort((a, b) => b.starredAt - a.starredAt);

  const handleOpen = (entry) => {
    dispatch({
      type: 'OPEN_RECIPE',
      meal: { day: entry.day, type: entry.mealType, recipe: entry.recipe },
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-28">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-slate-100">Meal Log</h1>
        <p className="text-sm text-slate-500 mt-0.5">Meals you've starred as eaten</p>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-8 pt-20 text-center">
          <span className="text-5xl mb-4">☆</span>
          <p className="text-slate-400 font-medium">No meals logged yet</p>
          <p className="text-slate-600 text-sm mt-1">
            Open a recipe and tap ★ after you eat it to log it here
          </p>
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {entries.map((entry) => {
            const key = `${entry.day}-${entry.mealType}`;
            const date = new Date(entry.starredAt);
            const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

            return (
              <button
                key={key}
                onClick={() => handleOpen(entry)}
                className="w-full text-left bg-slate-900 border border-slate-800 rounded-2xl p-4 active:scale-[0.98] transition-transform"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm">{MEAL_ICONS[entry.mealType] || '🍽'}</span>
                      <span className="text-xs text-slate-500 capitalize">
                        {entry.day} · {entry.mealType}
                      </span>
                    </div>
                    <p className="text-slate-100 font-semibold leading-snug truncate">
                      {entry.recipe.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">🕐 {entry.recipe.cookTime}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-amber-400 font-medium">{dateStr}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{timeStr}</p>
                  </div>
                </div>

                {entry.recipe.macros && (
                  <div className="flex gap-3 mt-3 pt-3 border-t border-slate-800">
                    {entry.recipe.macros.connor && (
                      <div className="flex-1">
                        <p className="text-xs text-sky-400 mb-1">Connor</p>
                        <p className="text-xs text-slate-400">
                          {entry.recipe.macros.connor.calories} kcal · {entry.recipe.macros.connor.protein}g protein
                        </p>
                      </div>
                    )}
                    {entry.recipe.macros.isa && (
                      <div className="flex-1">
                        <p className="text-xs text-purple-400 mb-1">Isa</p>
                        <p className="text-xs text-slate-400">
                          {entry.recipe.macros.isa.calories} kcal · {entry.recipe.macros.isa.protein}g protein
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}

          <button
            onClick={() => dispatch({ type: 'CLEAR_LOG' })}
            className="w-full py-3 text-sm text-slate-600 hover:text-red-400 transition-colors"
          >
            Clear log
          </button>
        </div>
      )}
    </div>
  );
}
