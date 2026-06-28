import { useState } from 'react';
import { useApp } from '../context/AppContext';

function RecipePreview({ recipe, onSave, onBack }) {
  return (
    <div className="space-y-5">
      <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
        <h3 className="text-lg font-bold text-stone-900 leading-snug">{recipe.name}</h3>
        {recipe.cookTime && (
          <p className="text-sm text-stone-400 font-medium mt-0.5">{recipe.cookTime}</p>
        )}
        {recipe.macros && (
          <div className="flex gap-2 mt-3">
            {recipe.macros.connor && (
              <div className="flex-1 bg-sky-50 rounded-xl px-3 py-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-sky-500 mb-0.5">Connor</div>
                <div className="text-xs text-sky-700 font-bold tabular-nums">{recipe.macros.connor.calories} kcal</div>
                <div className="text-[10px] text-sky-500">P {recipe.macros.connor.protein}g · C {recipe.macros.connor.carbs}g · F {recipe.macros.connor.fat}g</div>
              </div>
            )}
            {recipe.macros.isa && (
              <div className="flex-1 bg-violet-50 rounded-xl px-3 py-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-violet-500 mb-0.5">Isa</div>
                <div className="text-xs text-violet-700 font-bold tabular-nums">{recipe.macros.isa.calories} kcal</div>
                <div className="text-[10px] text-violet-500">P {recipe.macros.isa.protein}g · C {recipe.macros.isa.carbs}g · F {recipe.macros.isa.fat}g</div>
              </div>
            )}
          </div>
        )}
      </div>

      {recipe.ingredients?.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">
            Ingredients ({recipe.ingredients.length})
          </p>
          <div className="space-y-1.5">
            {recipe.ingredients.slice(0, 7).map((ing, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-stone-700 font-medium">{ing.item}</span>
                <span className="text-stone-400 ml-4 shrink-0">{ing.quantity} {ing.unit}</span>
              </div>
            ))}
            {recipe.ingredients.length > 7 && (
              <p className="text-xs text-stone-400 pt-1">+{recipe.ingredients.length - 7} more</p>
            )}
          </div>
        </div>
      )}

      {recipe.steps?.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">
            Steps ({recipe.steps.length})
          </p>
          <p className="text-sm text-stone-600 leading-relaxed line-clamp-2">{recipe.steps[0]}</p>
          {recipe.steps.length > 1 && (
            <p className="text-xs text-stone-400 mt-1">+{recipe.steps.length - 1} more steps</p>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={onBack}
          className="px-4 py-3 rounded-xl border border-stone-200 text-stone-600 text-sm font-semibold active:scale-95 transition-all"
        >
          ← Back
        </button>
        <button
          onClick={onSave}
          className="flex-1 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-xl active:scale-95 transition-all shadow-sm"
        >
          Save to My Recipes
        </button>
      </div>
    </div>
  );
}

export default function RecipeImportSheet({ onClose }) {
  const { dispatch } = useApp();
  const [tab, setTab]         = useState('tiktok');
  const [url, setUrl]         = useState('');
  const [text, setText]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [preview, setPreview] = useState(null);

  const switchTab = (t) => { setTab(t); setPreview(null); setError(null); };

  const parse = async () => {
    setLoading(true);
    setError(null);
    setPreview(null);
    try {
      const body = tab === 'tiktok' ? { tiktokUrl: url.trim() } : { text: text.trim() };
      const res  = await fetch('/api/parse-recipe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      if (!res.ok) throw new Error(data.error || 'Failed to parse recipe');
      setPreview(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const save = () => {
    dispatch({ type: 'ADD_CUSTOM_RECIPE', recipe: preview });
    onClose();
  };

  const canParse = tab === 'tiktok' ? url.trim().length > 10 : text.trim().length > 20;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-t-3xl max-h-[92vh] flex flex-col shadow-2xl">
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>

        <div className="px-5 pb-4 shrink-0 border-b border-stone-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-stone-900 text-xl font-bold">Add Recipe</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="flex gap-1 p-1 bg-stone-100 rounded-xl">
            <button
              onClick={() => switchTab('tiktok')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                tab === 'tiktok' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
              }`}
            >
              TikTok URL
            </button>
            <button
              onClick={() => switchTab('paste')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                tab === 'paste' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
              }`}
            >
              Paste Recipe
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {preview ? (
            <RecipePreview recipe={preview} onSave={save} onBack={() => setPreview(null)} />
          ) : (
            <>
              {tab === 'tiktok' ? (
                <div className="space-y-3">
                  <p className="text-sm text-stone-500 leading-relaxed">
                    Paste a TikTok video URL. We'll pull the caption and use Claude to structure it as a recipe.
                  </p>
                  <input
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && canParse && !loading && parse()}
                    placeholder="https://www.tiktok.com/@..."
                    className="w-full bg-stone-50 text-stone-900 text-sm rounded-xl px-4 py-3 placeholder-stone-400 outline-none border border-stone-200 focus:border-emerald-400 transition-colors"
                  />
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Tip: if the recipe isn't in the caption, switch to "Paste Recipe" and paste the text directly.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-stone-500 leading-relaxed">
                    Paste any recipe — TikTok caption, website text, or your own notes. Claude will clean it up and fill in the details.
                  </p>
                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Paste your recipe here…"
                    rows={8}
                    className="w-full bg-stone-50 text-stone-900 text-sm rounded-xl px-4 py-3 placeholder-stone-400 outline-none border border-stone-200 focus:border-emerald-400 transition-colors resize-none"
                  />
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 space-y-1">
                  <p className="text-red-600 text-sm">{error}</p>
                  {tab === 'tiktok' && (
                    <button
                      onClick={() => switchTab('paste')}
                      className="text-xs text-red-500 font-semibold underline"
                    >
                      Try pasting the caption text instead →
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={parse}
                disabled={loading || !canParse}
                className="w-full py-3.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl disabled:opacity-40 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Parsing recipe…
                  </>
                ) : 'Parse Recipe'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
