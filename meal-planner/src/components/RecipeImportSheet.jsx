import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EmojiHero, PersonMacroLine, GhostCircle, InkPill } from './ui';

function RecipePreview({ recipe, onSave, onBack }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <EmojiHero recipe={recipe} size="text-[52px]" className="mt-1" />
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-xl font-bold text-stone-900 leading-snug">{recipe.name}</h3>
          {recipe.cookTime && (
            <p className="text-[13px] text-stone-400 font-medium mt-0.5">{recipe.cookTime}</p>
          )}
          {recipe.macros && (
            <div className="space-y-1.5 mt-3">
              <PersonMacroLine person="connor" label="Connor" data={recipe.macros.connor} />
              <PersonMacroLine person="isa" label="Isa" data={recipe.macros.isa} />
            </div>
          )}
        </div>
      </div>

      {recipe.ingredients?.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-400 mb-2">
            Ingredients ({recipe.ingredients.length})
          </p>
          <div>
            {recipe.ingredients.slice(0, 7).map((ing, i) => (
              <div key={i} className="flex justify-between items-baseline py-2 border-b border-stone-900/[0.05] last:border-0">
                <span className="text-[15px] text-stone-800 font-medium">{ing.item}</span>
                <span className="text-[13px] text-stone-400 ml-4 shrink-0 tabular-nums">{ing.quantity} {ing.unit}</span>
              </div>
            ))}
            {recipe.ingredients.length > 7 && (
              <p className="text-xs text-stone-400 pt-2">+{recipe.ingredients.length - 7} more</p>
            )}
          </div>
        </div>
      )}

      {recipe.steps?.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-400 mb-2">
            Steps ({recipe.steps.length})
          </p>
          <p className="text-sm text-stone-600 leading-relaxed line-clamp-2">{recipe.steps[0]}</p>
          {recipe.steps.length > 1 && (
            <p className="text-xs text-stone-400 mt-1">+{recipe.steps.length - 1} more steps</p>
          )}
        </div>
      )}

      <div className="flex gap-2.5 pt-1">
        <button
          onClick={onBack}
          className="px-6 py-3.5 rounded-full border border-stone-900/10 text-stone-600 text-sm font-semibold active:bg-stone-900/5 transition-colors"
        >
          ← Back
        </button>
        <InkPill onClick={onSave} className="flex-1 py-3.5 text-sm">
          Save to Recipes
        </InkPill>
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
    const recipe = tab === 'tiktok' && url.trim()
      ? { ...preview, sourceTikTokUrl: url.trim() }
      : preview;
    dispatch({ type: 'ADD_CUSTOM_RECIPE', recipe });
    onClose();
  };

  const canParse = tab === 'tiktok' ? url.trim().length > 10 : text.trim().length > 20;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#fdfaf6] rounded-t-[32px] max-h-[92vh] flex flex-col shadow-2xl">
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-stone-900/10 rounded-full" />
        </div>

        <div className="px-6 pb-4 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-bold text-stone-900">Add recipe</h2>
            <GhostCircle onClick={onClose}>✕</GhostCircle>
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={() => switchTab('tiktok')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                tab === 'tiktok' ? 'bg-stone-900 text-[#fbf6f0]' : 'text-stone-400 border border-stone-900/[0.08]'
              }`}
            >
              TikTok URL
            </button>
            <button
              onClick={() => switchTab('paste')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                tab === 'paste' ? 'bg-stone-900 text-[#fbf6f0]' : 'text-stone-400 border border-stone-900/[0.08]'
              }`}
            >
              Paste recipe
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 pb-10 space-y-5">
          {preview ? (
            <RecipePreview recipe={preview} onSave={save} onBack={() => setPreview(null)} />
          ) : (
            <>
              {tab === 'tiktok' ? (
                <div className="space-y-3">
                  <p className="text-sm text-stone-500 leading-relaxed">
                    Paste a TikTok video URL. We'll pull the caption and structure it into a recipe.
                  </p>
                  <input
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && canParse && !loading && parse()}
                    placeholder="https://www.tiktok.com/@..."
                    className="w-full bg-white text-stone-900 text-[15px] rounded-full px-5 py-3.5 placeholder-stone-400 outline-none shadow-[0_4px_18px_rgba(80,40,16,0.08)] border border-stone-900/[0.04] focus:border-stone-900/20 transition-colors"
                  />
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Tip: if the recipe isn't in the caption, switch to "Paste recipe" and paste the text directly.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-stone-500 leading-relaxed">
                    Paste any recipe — TikTok caption, website text, or your own notes.
                  </p>
                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Paste your recipe here…"
                    rows={8}
                    className="w-full bg-white text-stone-900 text-[15px] rounded-3xl px-5 py-4 placeholder-stone-400 outline-none shadow-[0_4px_18px_rgba(80,40,16,0.08)] border border-stone-900/[0.04] focus:border-stone-900/20 transition-colors resize-none"
                  />
                </div>
              )}

              {error && (
                <div className="space-y-1.5">
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

              <InkPill onClick={parse} disabled={loading || !canParse} className="w-full py-4 text-sm">
                {loading ? (
                  <>
                    <span className="flex gap-1 mr-1">
                      {[0, 1, 2].map(i => (
                        <span
                          key={i}
                          className="w-1 h-1 rounded-full bg-white/80 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </span>
                    Reading recipe…
                  </>
                ) : 'Parse recipe'}
              </InkPill>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
