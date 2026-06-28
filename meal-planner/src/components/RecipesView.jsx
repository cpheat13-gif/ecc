import { useState } from 'react';
import { useApp } from '../context/AppContext';
import RecipeImportSheet from './RecipeImportSheet';

function RecipeCard({ recipe, onOpen, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-[0_1px_8px_rgba(0,0,0,0.06)] overflow-hidden">
      <button className="w-full text-left p-4" onClick={onOpen}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-stone-900 font-semibold leading-snug">{recipe.name}</h3>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {recipe.cookTime && (
                <span className="text-xs text-stone-400 font-medium">{recipe.cookTime}</span>
              )}
              {recipe.ingredients?.length > 0 && (
                <span className="text-xs text-stone-400">{recipe.ingredients.length} ingredients</span>
              )}
              {recipe.steps?.length > 0 && (
                <span className="text-xs text-stone-400">{recipe.steps.length} steps</span>
              )}
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-stone-300 shrink-0 mt-0.5">
            <path d="M6 3l5 5-5 5" />
          </svg>
        </div>

        {recipe.macros && (
          <div className="mt-3 flex gap-2">
            {recipe.macros.connor && (
              <div className="flex-1 bg-sky-50 rounded-xl px-3 py-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-sky-500 mb-0.5">Connor</div>
                <div className="text-xs text-sky-700 font-bold tabular-nums">{recipe.macros.connor.calories} kcal</div>
                <div className="text-[10px] text-sky-500">P {recipe.macros.connor.protein}g</div>
              </div>
            )}
            {recipe.macros.isa && (
              <div className="flex-1 bg-violet-50 rounded-xl px-3 py-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-violet-500 mb-0.5">Isa</div>
                <div className="text-xs text-violet-700 font-bold tabular-nums">{recipe.macros.isa.calories} kcal</div>
                <div className="text-[10px] text-violet-500">P {recipe.macros.isa.protein}g</div>
              </div>
            )}
          </div>
        )}
      </button>

      <div className="border-t border-stone-50 px-4 py-2.5 flex items-center justify-between">
        <span className="text-[10px] text-stone-300 font-medium">
          Saved {new Date(recipe.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        {confirmDelete ? (
          <div className="flex items-center gap-3">
            <button onClick={() => setConfirmDelete(false)} className="text-xs text-stone-400 font-medium">Cancel</button>
            <button onClick={onDelete} className="text-xs text-red-500 font-semibold">Delete</button>
          </div>
        ) : (
          <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }} className="text-xs text-stone-400 font-medium">
            Delete
          </button>
        )}
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
    <div className="min-h-screen bg-stone-50">
      <div className="bg-white px-5 pt-14 pb-4 border-b border-stone-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Library</p>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">My Recipes</h1>
          </div>
          <button
            onClick={() => setImporting(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl shadow-sm shadow-emerald-900/10 active:scale-95 transition-all"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round">
              <line x1="6.5" y1="1" x2="6.5" y2="12" />
              <line x1="1" y1="6.5" x2="12" y2="6.5" />
            </svg>
            Add
          </button>
        </div>
      </div>

      <div className="px-4 py-4 pb-28 space-y-3">
        {recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-stone-100 rounded-3xl flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400">
                <path d="M5 4h15a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
                <line x1="3" y1="10" x2="22" y2="10" />
                <line x1="8" y1="4" x2="8" y2="10" />
                <line x1="8" y1="15" x2="18" y2="15" />
                <line x1="8" y1="19" x2="14" y2="19" />
              </svg>
            </div>
            <p className="text-stone-700 font-semibold text-base mb-1">No recipes saved yet</p>
            <p className="text-stone-400 text-sm max-w-[240px] leading-relaxed">
              Import from TikTok or paste any recipe — Claude will structure it for you
            </p>
            <button
              onClick={() => setImporting(true)}
              className="mt-6 px-6 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-xl shadow-sm active:scale-95 transition-all"
            >
              Add your first recipe
            </button>
          </div>
        ) : (
          recipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onOpen={() => openRecipe(recipe)}
              onDelete={() => deleteRecipe(recipe.id)}
            />
          ))
        )}
      </div>

      {importing && <RecipeImportSheet onClose={() => setImporting(false)} />}
    </div>
  );
}
