import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PersonMacroLine, InkPill, GhostCircle } from './ui';
import FoodImage from './FoodImage';
import { ensureRecipeImage } from '../utils/images';

const MEAL_LABEL = {
  breakfast: 'Breakfast',
  lunch:     'Lunch',
  dinner:    'Dinner',
  snack:     'Snack',
};

const MEAL_PLACEHOLDER = {
  breakfast: '🍳',
  lunch:     '🥗',
  dinner:    '🍽️',
  snack:     '🍎',
};

export default function MealCard({ day, mealType, recipe }) {
  const { state, dispatch } = useApp();
  const isGenerating =
    state.generatingMeal?.day === day && state.generatingMeal?.type === mealType;

  // Kick off studio photo generation once the meal exists
  useEffect(() => {
    if (recipe) ensureRecipeImage(recipe, dispatch);
  }, [recipe?.name]);

  const openOptions = (e) => {
    if (e) e.stopPropagation();
    dispatch({ type: 'OPEN_OPTIONS', day, mealType });
  };

  const handleOpen = () => {
    dispatch({ type: 'OPEN_RECIPE', meal: { day, type: mealType, recipe } });
  };

  if (!recipe) {
    return (
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-400 mb-3">
          {MEAL_LABEL[mealType]}
        </p>
        <div className="flex items-center gap-4">
          <span className="w-16 h-16 rounded-full bg-stone-900/[0.04] flex items-center justify-center text-2xl opacity-50 select-none" aria-hidden="true">
            {MEAL_PLACEHOLDER[mealType]}
          </span>
          <span className="flex-1 text-sm text-stone-400 font-medium">Nothing planned</span>
          <InkPill onClick={openOptions} disabled={isGenerating} className="px-5 py-2.5 text-sm">
            {isGenerating ? (
              <>
                <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Cooking up…
              </>
            ) : 'Pick meal'}
          </InkPill>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-400">
          {MEAL_LABEL[mealType]}
        </p>
        {recipe.highSodiumFlag && (
          <span className="text-[10px] text-amber-600 font-semibold">· High sodium</span>
        )}
      </div>

      <div className="flex items-start gap-4 cursor-pointer active:opacity-70 transition-opacity" onClick={handleOpen}>
        <FoodImage recipe={recipe} mealType={mealType} size="w-[72px] h-[72px]" rounded="rounded-[20px]" emojiSize="text-[52px]" className="mt-1 shrink-0" />

        <div className="flex-1 min-w-0">
          <h3 className="font-display text-xl font-semibold text-stone-900 leading-snug">
            {recipe.name}
          </h3>
          <p className="text-[13px] text-stone-400 font-medium mt-0.5">{recipe.cookTime}</p>

          <div className="space-y-1.5 mt-3">
            <PersonMacroLine person="connor" label="Connor" data={recipe.macros?.connor} />
            <PersonMacroLine person="isa" label="Isa" data={recipe.macros?.isa} />
          </div>
        </div>

        <GhostCircle
          onClick={openOptions}
          disabled={isGenerating}
          title="Pick a different meal"
          className="mt-1"
        >
          {isGenerating
            ? <span className="w-3 h-3 rounded-full border-2 border-stone-400/30 border-t-stone-400 animate-spin block" />
            : '↺'}
        </GhostCircle>
      </div>
    </div>
  );
}
