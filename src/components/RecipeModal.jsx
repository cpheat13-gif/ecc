import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import CookingMode from './CookingMode';
import { Cal, PCF, GhostCircle, InkPill } from './ui';
import FoodImage from './FoodImage';
import { ensureRecipeImage } from '../utils/images';

const CATEGORY_ICONS = {
  'Proteins':        '🥩',
  'Produce':         '🥦',
  'Dairy':           '🥚',
  'Pantry':          '🫙',
  'Canned & Jarred': '🥫',
  'Spices':          '🧂',
  'Other':           '📦',
};

const PERSON_DOT = { connor: 'bg-sky-500', isa: 'bg-violet-500' };

function PersonMacros({ person, label, data }) {
  if (!data) return null;
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-stone-900/[0.05] last:border-0">
      <span className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${PERSON_DOT[person]}`} />
        <span className="text-sm font-semibold text-stone-700">{label}</span>
      </span>
      <span className="flex items-baseline gap-3">
        <Cal value={data.calories} size="text-lg" />
        <PCF data={data} />
      </span>
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
  const [cookingMinimized, setCookingMinimized] = useState(false);
  const [cookingStep, setCookingStep] = useState(0);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') dispatch({ type: 'CLOSE_RECIPE' }); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [dispatch]);

  // Reset cooking mode when recipe changes
  useEffect(() => { setCooking(false); setCookingMinimized(false); }, [selectedMeal]);

  useEffect(() => {
    if (selectedMeal?.recipe) ensureRecipeImage(selectedMeal.recipe, dispatch);
  }, [selectedMeal?.recipe?.name]);

  if (!selectedMeal) return null;

  const { day, type: mealType, recipe, isLibrary } = selectedMeal;

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

  const handleDelete = () => {
    dispatch({ type: 'DELETE_CUSTOM_RECIPE', id: recipe.id });
    dispatch({ type: 'CLOSE_RECIPE' });
  };

  const grouped  = groupIngredients(recipe.ingredients || []);
  const portions = mealType === 'dinner' ? '4 portions (2 dinner + 2 lunch)' : '2 portions';
  const hasSteps = recipe.steps?.length > 0;

  const closeCooking = () => { setCooking(false); setCookingMinimized(false); };

  return (
    <>
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-end ${cooking ? 'select-none' : ''}`}
      onClick={(e) => e.target === e.currentTarget && !cooking && dispatch({ type: 'CLOSE_RECIPE' })}
    >
      <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm" onClick={() => !cooking && dispatch({ type: 'CLOSE_RECIPE' })} />

      <div className="relative bg-[#f8faf1] rounded-t-[32px] max-h-[92vh] flex flex-col shadow-2xl">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-10 h-1 bg-stone-900/10 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-5 shrink-0">
          <div className="flex items-start gap-4">
            <FoodImage recipe={recipe} mealType={mealType} size="w-[76px] h-[76px]" rounded="rounded-[22px]" emojiSize="text-[56px]" className="mt-1 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-400 capitalize">
                  {isLibrary ? 'My recipes' : `${day} · ${mealType}`}
                </span>
                {recipe.highSodiumFlag && (
                  <span className="text-[10px] text-amber-600 font-semibold">· High sodium</span>
                )}
              </div>
              <h2 className="font-display text-2xl font-bold text-stone-900 leading-tight mt-1">{recipe.name}</h2>
              <p className="text-[13px] text-stone-400 font-medium mt-1">
                {recipe.cookTime}
                {!isLibrary && ` · ${portions}`}
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <GhostCircle onClick={() => dispatch({ type: 'CLOSE_RECIPE' })}>✕</GhostCircle>
              {!isLibrary && (
                <GhostCircle
                  onClick={handleStar}
                  className={isStarred ? '!bg-amber-100 !text-amber-500' : ''}
                  title={isStarred ? 'Remove from log' : 'Log this meal'}
                >
                  {isStarred ? '★' : '☆'}
                </GhostCircle>
              )}
            </div>
          </div>

          <div className="mt-5 flex gap-2.5">
            {hasSteps && (
              <InkPill
                onClick={() => cooking ? setCookingMinimized(false) : setCooking(true)}
                className="flex-1 py-3.5 text-sm"
              >
                <svg width="13" height="13" viewBox="0 0 15 15" fill="currentColor">
                  <polygon points="3,1 14,7.5 3,14" />
                </svg>
                {cooking ? `Resume Cooking · Step ${cookingStep + 1} of ${recipe.steps.length}` : 'Start Cooking'}
              </InkPill>
            )}
            {isLibrary ? (
              <button
                onClick={handleDelete}
                className={`py-3.5 rounded-full border border-red-200 text-red-500 text-sm font-semibold active:bg-red-50 transition-colors ${hasSteps ? 'px-6' : 'flex-1'}`}
              >
                Delete
              </button>
            ) : (
              <button
                onClick={handleSwap}
                className={`py-3.5 rounded-full border border-stone-900/10 text-stone-600 text-sm font-semibold active:bg-stone-900/5 transition-colors ${hasSteps ? 'px-6' : 'flex-1'}`}
              >
                ↺ Swap
              </button>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 pb-12 space-y-8">
          {/* Studio photo banner */}
          {recipe.imageUrl && (
            <div className="rounded-[26px] overflow-hidden aspect-[16/10] shadow-[0_18px_44px_rgba(76,40,16,0.2)]">
              <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover" />
            </div>
          )}

          {/* TikTok source link */}
          {isLibrary && recipe.sourceTikTokUrl && (
            <a
              href={recipe.sourceTikTokUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-xs text-stone-500 font-medium rounded-full px-4 py-2.5 border border-stone-900/[0.07] active:bg-stone-900/5 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-stone-400">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
              </svg>
              <span className="truncate">{recipe.sourceTikTokUrl}</span>
            </a>
          )}

          {/* Macros */}
          <section>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-400 mb-1">Per serving</p>
            <PersonMacros person="connor" label="Connor" data={recipe.macros?.connor} />
            <PersonMacros person="isa" label="Isa" data={recipe.macros?.isa} />
          </section>

          {/* Ingredients */}
          <section>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-400 mb-4">Ingredients</p>
            <div className="space-y-6">
              {Object.entries(grouped).map(([cat, items]) => (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base emoji-hero">{CATEGORY_ICONS[cat] || '📦'}</span>
                    <span className="font-display text-sm font-semibold text-stone-700">{cat}</span>
                  </div>
                  <div>
                    {items.map((ing, i) => (
                      <div key={i} className="flex justify-between items-baseline py-2 border-b border-stone-900/[0.05] last:border-0">
                        <span className="text-[15px] text-stone-800 font-medium">{ing.item}</span>
                        <span className="text-[13px] text-stone-400 ml-4 shrink-0 tabular-nums">
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
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-400 mb-4">Method</p>
              <ol className="space-y-5">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="shrink-0 font-display text-lg font-bold text-grad tabular-nums w-6">
                      {i + 1}
                    </span>
                    <p className="text-[15px] text-stone-700 leading-relaxed pt-0.5">{step}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Whole Foods tips */}
          {recipe.wholeFoodsTips?.length > 0 && (
            <section>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-400 mb-3">Shopping tips</p>
              <div className="space-y-2.5">
                {recipe.wholeFoodsTips.map((tip, i) => (
                  <div key={i} className="flex gap-3 text-sm text-stone-600 leading-relaxed">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-grad mt-[7px]" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>

    {cooking && hasSteps && (
      <CookingMode
        steps={recipe.steps}
        recipeName={recipe.name}
        onClose={closeCooking}
        minimized={cookingMinimized}
        onMinimizedChange={setCookingMinimized}
        onStepChange={setCookingStep}
      />
    )}
    </>
  );
}
