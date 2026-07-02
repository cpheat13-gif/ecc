import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import RecipeImportSheet from './RecipeImportSheet';
import { PersonMacroLine } from './ui';
import FoodImage from './FoodImage';
import { ensureRecipeImage } from '../utils/images';

function RecipeRow({ recipe, onOpen, onDelete }) {
  const { dispatch } = useApp();
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    ensureRecipeImage(recipe, dispatch);
  }, [recipe?.name]);

  return (
    <div>
      <div className="flex items-start gap-4 cursor-pointer active:opacity-70 transition-opacity" onClick={onOpen}>
        <FoodImage recipe={recipe} size="w-[72px] h-[72px]" rounded="rounded-[20px]" emojiSize="text-[52px]" className="mt-1 shrink-0" />

        <div className="flex-1 min-w-0">
          <h3 className="font-display text-xl font-semibold text-stone-900 leading-snug">{recipe.name}</h3>
          <p className="text-[13px] text-stone-400 font-medium mt-0.5">
            {recipe.cookTime}
            {recipe.ingredients?.length > 0 && ` · ${recipe.ingredients.length} ingredient${recipe.ingredients.length === 1 ? '' : 's'}`}
            {recipe.steps?.length > 0 && ` · ${recipe.steps.length} step${recipe.steps.length === 1 ? '' : 's'}`}
          </p>

          {recipe.macros && (
            <div className="space-y-1.5 mt-3">
              <PersonMacroLine person="connor" label="Connor" data={recipe.macros.connor} />
              <PersonMacroLine person="isa" label="Isa" data={recipe.macros.isa} />
            </div>
          )}

          <div className="flex items-center gap-4 mt-2.5">
            <span className="text-[11px] text-stone-300 font-medium">
              Saved {new Date(recipe.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            {confirmDelete ? (
              <span className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                <button onClick={() => setConfirmDelete(false)} className="text-[11px] text-stone-400 font-medium">Cancel</button>
                <button onClick={onDelete} className="text-[11px] text-red-500 font-semibold">Delete</button>
              </span>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
                className="text-[11px] text-stone-300 font-medium active:text-red-500"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecipesView() {
  const { state, dispatch } = useApp();
  const [importing, setImporting] = useState(false);

  const recipes = state.customRecipes || [];

  const openRecipe = (recipe) => {
    dispatch({ type: 'OPEN_RECIPE', meal: { day: null, type: null, recipe, isLibrary: true } });
  };

  const deleteRecipe = (id) => {
    dispatch({ type: 'DELETE_CUSTOM_RECIPE', id });
  };

  return (
    <div className="min-h-screen pb-36">
      <div className="px-5 pt-14 pb-2 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">Library</p>
          <h1 className="font-display text-[44px] font-bold text-stone-900 leading-[1.05] tracking-tight mt-1">
            Recipes
          </h1>
        </div>
        <button
          onClick={() => setImporting(true)}
          className="mb-2 w-11 h-11 rounded-full bg-stone-900 text-[#fbf6f0] flex items-center justify-center active:scale-95 transition-all shadow-[0_8px_20px_rgba(28,25,23,0.25)]"
          title="Add recipe"
        >
          <svg width="15" height="15" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round">
            <line x1="6.5" y1="1" x2="6.5" y2="12" />
            <line x1="1" y1="6.5" x2="12" y2="6.5" />
          </svg>
        </button>
      </div>

      <div className="px-5 pt-6">
        {recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 text-center">
            <div className="emoji-hero text-5xl mb-5">📖</div>
            <p className="text-stone-700 font-display font-semibold text-lg mb-1">No recipes saved yet</p>
            <p className="text-stone-400 text-sm max-w-[250px] leading-relaxed">
              Import from TikTok or paste any recipe — Claude will structure it for you
            </p>
            <button
              onClick={() => setImporting(true)}
              className="mt-7 px-7 py-3.5 bg-stone-900 text-[#fbf6f0] text-sm font-semibold rounded-full active:scale-95 transition-all"
            >
              Add your first recipe
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {recipes.map(recipe => (
              <RecipeRow
                key={recipe.id}
                recipe={recipe}
                onOpen={() => openRecipe(recipe)}
                onDelete={() => deleteRecipe(recipe.id)}
              />
            ))}
          </div>
        )}
      </div>

      {importing && <RecipeImportSheet onClose={() => setImporting(false)} />}
    </div>
  );
}
