import { useApp } from '../context/AppContext';
import { PersonMacroLine } from './ui';
import FoodImage from './FoodImage';

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
    <div className="min-h-screen pb-36">
      <div className="px-5 pt-14 pb-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">Meals you've eaten</p>
        <h1 className="font-display text-[44px] font-bold text-stone-900 leading-[1.05] tracking-tight mt-1">
          Log
        </h1>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-8 pt-24 text-center">
          <div className="emoji-hero text-5xl mb-5">⭐</div>
          <p className="text-stone-600 font-semibold text-sm">No meals logged yet</p>
          <p className="text-stone-400 text-xs mt-1 max-w-[240px] leading-relaxed">
            Open a recipe and tap ★ after you eat it to log it here
          </p>
        </div>
      ) : (
        <div className="px-5 pt-6 space-y-8">
          {entries.map((entry) => {
            const key     = `${entry.day}-${entry.mealType}`;
            const date    = new Date(entry.starredAt);
            const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

            return (
              <div
                key={key}
                onClick={() => handleOpen(entry)}
                className="flex items-start gap-4 cursor-pointer active:opacity-70 transition-opacity"
              >
                <FoodImage recipe={entry.recipe} mealType={entry.mealType} size="w-14 h-14" rounded="rounded-2xl" emojiSize="text-[44px]" className="mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400 capitalize">
                      {entry.day} · {entry.mealType}
                    </p>
                    <p className="text-[11px] text-amber-600 font-semibold shrink-0">{dateStr}</p>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-stone-900 leading-snug mt-0.5">
                    {entry.recipe.name}
                  </h3>
                  {entry.recipe.macros && (
                    <div className="space-y-1.5 mt-2.5">
                      <PersonMacroLine person="connor" label="Connor" data={entry.recipe.macros.connor} />
                      <PersonMacroLine person="isa" label="Isa" data={entry.recipe.macros.isa} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <button
            onClick={() => dispatch({ type: 'CLEAR_LOG' })}
            className="w-full py-3 text-sm text-stone-400 active:text-red-500 transition-colors font-medium"
          >
            Clear log
          </button>
        </div>
      )}
    </div>
  );
}
