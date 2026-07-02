import { useEffect, useRef } from 'react';
import { useApp, DAYS, MEAL_TYPES } from '../context/AppContext';
import { EmojiHero, Cal, GhostCircle } from './ui';
import { ensureRecipeImage } from '../utils/images';
import { attachPinch } from '../utils/pinch';

const DAY_FULL = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
};

function CatalogCard({ day, mealType, recipe, onOpen }) {
  const { dispatch } = useApp();

  useEffect(() => {
    if (recipe) ensureRecipeImage(recipe, dispatch);
  }, [recipe?.name]);

  return (
    <button
      onClick={onOpen}
      className="block w-full text-left active:scale-[0.975] transition-transform duration-300 ease-out"
      style={{ scrollSnapAlign: 'start', scrollMarginTop: '96px' }}
    >
      <div className="relative rounded-[30px] overflow-hidden aspect-[4/3] bg-white/60 shadow-[0_24px_60px_rgba(80,40,16,0.2)]">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#fdf6ef] to-[#f6e7dc]">
            <EmojiHero recipe={recipe} mealType={mealType} size="text-[96px]" />
          </div>
        )}

        {/* Liquid-glass caption */}
        <div className="absolute inset-x-3 bottom-3 rounded-[22px] bg-white/70 backdrop-blur-2xl border border-white/60 px-5 py-4 shadow-[0_8px_30px_rgba(80,40,16,0.12)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400 capitalize">
            {DAY_FULL[day]} · {mealType}
          </p>
          <h3 className="font-display text-[22px] font-bold text-stone-900 leading-tight mt-0.5 text-balance">
            {recipe.name}
          </h3>
          <div className="flex items-baseline gap-3 mt-1.5">
            <span className="text-[12px] text-stone-500 font-medium">{recipe.cookTime}</span>
            {recipe.macros?.connor && <Cal value={recipe.macros.connor.calories} size="text-sm" />}
            {recipe.macros?.isa && <Cal value={recipe.macros.isa.calories} size="text-sm" />}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function TimelineView() {
  const { state, dispatch } = useApp();
  const rootRef = useRef(null);

  const entries = DAYS.flatMap(day =>
    MEAL_TYPES
      .filter(type => (state.weekConfig[day]?.meals || []).includes(type))
      .map(type => ({ day, type, recipe: state.mealPlan[day]?.[type] }))
      .filter(e => e.recipe)
  );

  // Pinch in (spread fingers) returns to the planner
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    return attachPinch(el, {
      onZoomIn: () => dispatch({ type: 'SET_VIEW', view: 'dashboard' }),
    });
  }, [dispatch]);

  const openRecipe = (e) => {
    dispatch({ type: 'OPEN_RECIPE', meal: { day: e.day, type: e.type, recipe: e.recipe } });
  };

  return (
    <div
      ref={rootRef}
      className="min-h-screen pb-20 overflow-y-auto"
      style={{ scrollSnapType: 'y proximity' }}
    >
      {/* Masthead */}
      <div className="px-6 pt-14 pb-6 flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-stone-400">This week's</p>
          <h1 className="font-display text-[52px] font-bold text-stone-900 leading-[0.95] tracking-tight mt-1">
            Menu
          </h1>
          <p className="text-sm text-stone-400 font-medium mt-2">
            {entries.length === 0
              ? 'Nothing planned yet'
              : `${entries.length} meal${entries.length === 1 ? '' : 's'} · pinch to zoom back`}
          </p>
        </div>
        <GhostCircle
          onClick={() => dispatch({ type: 'SET_VIEW', view: 'dashboard' })}
          className="mt-2 !bg-white/70 backdrop-blur-xl border border-white/60"
          title="Back to planner"
        >
          ✕
        </GhostCircle>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center pt-24 text-center px-8">
          <div className="emoji-hero text-6xl mb-6">📖</div>
          <p className="font-display text-stone-700 font-semibold text-lg">Your menu is empty</p>
          <p className="text-stone-400 text-sm mt-1 max-w-[240px] leading-relaxed">
            Plan meals in the Week view and they'll appear here as a catalog
          </p>
        </div>
      ) : (
        <div className="px-5 space-y-7">
          {entries.map((e) => (
            <CatalogCard
              key={`${e.day}-${e.type}`}
              day={e.day}
              mealType={e.type}
              recipe={e.recipe}
              onOpen={() => openRecipe(e)}
            />
          ))}
          <p className="text-center text-[11px] text-stone-300 font-medium pt-4 pb-8 uppercase tracking-[0.2em]">
            Bon appétit
          </p>
        </div>
      )}
    </div>
  );
}
