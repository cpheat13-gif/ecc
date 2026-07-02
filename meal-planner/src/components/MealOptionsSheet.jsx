import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getMealTargets } from '../utils/macros';
import { buildOptionsPrompt, buildMealPrompt, generateMeal } from '../utils/prompt';
import { EmojiHero, PCF, Cal, GhostCircle, InkPill } from './ui';

const THINKING_PHRASES = [
  'Plating ideas…',
  'Balancing macros…',
  'Raiding the pantry…',
  'Tasting as it goes…',
  'Checking the Whole Foods aisles…',
];

// Typing indicator — bouncing dots + shimmering status line that rotates.
function ThinkingDots({ label }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(i => i + 1), 1800);
    return () => clearInterval(id);
  }, []);
  const phrase = label || THINKING_PHRASES[idx % THINKING_PHRASES.length];

  return (
    <div className="flex items-center gap-3 py-16 justify-center">
      <span className="flex gap-1">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-grad animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </span>
      <span className="text-[13px] font-semibold shimmer-text">{phrase}</span>
    </div>
  );
}

function OptionRow({ option, participants, onSelect, selecting }) {
  return (
    <div className="flex items-start gap-4">
      <EmojiHero recipe={option} size="text-[44px]" className="mt-1" />
      <div className="flex-1 min-w-0">
        <h3 className="font-display text-lg font-semibold text-stone-900 leading-snug">{option.name}</h3>
        <p className="text-[12px] text-stone-400 font-medium mt-0.5">{option.cookTime}</p>
        {option.description && (
          <p className="text-[13px] text-stone-500 mt-1 leading-relaxed">{option.description}</p>
        )}
        <div className="flex flex-col gap-1 mt-2">
          {participants !== 'isa' && option.macros?.connor && (
            <span className="flex items-baseline gap-3">
              <Cal value={option.macros.connor.calories} size="text-sm" />
              <PCF data={option.macros.connor} />
            </span>
          )}
        </div>
      </div>
      <InkPill onClick={onSelect} disabled={selecting} className="px-4 py-2 text-xs shrink-0 mt-2">
        {selecting ? (
          <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        ) : 'Select'}
      </InkPill>
    </div>
  );
}

function SavedRow({ recipe, meta, action, onUse }) {
  return (
    <button onClick={onUse} className="w-full text-left flex items-start gap-4 active:opacity-70 transition-opacity">
      <EmojiHero recipe={recipe} size="text-[44px]" className="mt-1" />
      <div className="flex-1 min-w-0">
        {meta}
        <p className="font-display text-lg font-semibold text-stone-900 leading-snug truncate">{recipe.name}</p>
        <p className="text-[12px] text-stone-400 font-medium mt-0.5">{recipe.cookTime}</p>
        {recipe.macros?.connor && (
          <span className="flex items-baseline gap-3 mt-2">
            <Cal value={recipe.macros.connor.calories} size="text-sm" />
            <PCF data={recipe.macros.connor} />
          </span>
        )}
      </div>
      <span className="shrink-0 px-4 py-2 rounded-full border border-stone-900/10 text-stone-700 text-xs font-bold mt-2">
        {action}
      </span>
    </button>
  );
}

export default function MealOptionsSheet() {
  const { state, dispatch } = useApp();
  const { optionsSheet, weekConfig, starredMeals, settings, customRecipes } = state;
  const { day, mealType } = optionsSheet;

  const dayConfig    = weekConfig[day];
  const participants = dayConfig.participants || 'both';
  const targets      = getMealTargets(mealType, dayConfig.connorTraining, dayConfig.isaTraining, settings);

  const [tab, setTab]                     = useState('suggestions');
  const [options, setOptions]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [searchInput, setSearchInput]     = useState('');
  const [currentSearch, setCurrentSearch] = useState('');
  const [selectingName, setSelectingName] = useState(null);
  const [seenNames, setSeenNames]         = useState([]);

  const favorites = Object.values(starredMeals || {}).sort((a, b) => {
    if (a.mealType === mealType && b.mealType !== mealType) return -1;
    if (b.mealType === mealType && a.mealType !== mealType) return 1;
    return b.starredAt - a.starredAt;
  });

  const fetchOptions = async (searchTerm = '', exclude = []) => {
    setLoading(true);
    setError(null);
    setOptions([]);
    try {
      const prompt = buildOptionsPrompt({ mealType, participants, targets, searchTerm, excludeNames: exclude });
      const res  = await fetch('/api/generate-meal', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ prompt }),
      });
      const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      if (!res.ok) throw new Error(data.error || 'Failed to generate options');
      const fresh = Array.isArray(data) ? data : [];
      setOptions(fresh);
      setSeenNames(prev => [...prev, ...fresh.map(o => o.name)]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOptions(); }, []);

  const handleSearch = () => {
    const term = searchInput.trim();
    if (!term) return;
    setCurrentSearch(term);
    setSeenNames([]);
    fetchOptions(term, []);
  };

  const handleSelect = async (option) => {
    setSelectingName(option.name);
    dispatch({ type: 'CLOSE_OPTIONS' });
    dispatch({ type: 'SET_GENERATING', value: { day, type: mealType } });

    try {
      const dayType = dayConfig.connorTraining ? 'training' : 'rest';
      const prompt  = buildMealPrompt({ mealType, dayType, targets, requestedName: option.name });
      const meal    = await generateMeal(prompt);
      dispatch({ type: 'SET_MEAL', day, mealType, recipe: { ...meal, emoji: meal.emoji || option.emoji, mealType } });
    } catch (err) {
      alert(`Could not generate recipe: ${err.message}`);
      dispatch({ type: 'SET_GENERATING', value: null });
    }
  };

  const handleImportFavorite = (entry) => {
    dispatch({ type: 'SET_MEAL', day, mealType, recipe: { ...entry.recipe, mealType } });
    dispatch({ type: 'CLOSE_OPTIONS' });
  };

  const handleUseCustomRecipe = (recipe) => {
    dispatch({ type: 'SET_MEAL', day, mealType, recipe: { ...recipe, mealType } });
    dispatch({ type: 'CLOSE_OPTIONS' });
  };

  const close = () => dispatch({ type: 'CLOSE_OPTIONS' });

  const TAB_LABELS = [
    { id: 'suggestions', label: 'AI' },
    { id: 'myrecipes',   label: `Recipes${(customRecipes || []).length ? ` ${customRecipes.length}` : ''}` },
    { id: 'favorites',   label: `Starred${favorites.length ? ` ${favorites.length}` : ''}` },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm" onClick={close} />

      <div className="relative bg-[#fdfaf6] rounded-t-[32px] max-h-[92vh] flex flex-col shadow-2xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-stone-900/10 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-400 capitalize">
                {mealType} · {day}
              </p>
              <h2 className="font-display text-2xl font-bold text-stone-900 mt-0.5">Pick a meal</h2>
            </div>
            <GhostCircle onClick={close}>✕</GhostCircle>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 mb-4">
            {TAB_LABELS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                  tab === id
                    ? 'bg-stone-900 text-[#fbf6f0]'
                    : 'text-stone-400 border border-stone-900/[0.08]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'suggestions' && (
            <>
              {/* Chat-style search pill */}
              <div className="flex items-center gap-2 bg-white rounded-full pl-5 pr-1.5 py-1.5 shadow-[0_4px_18px_rgba(80,40,16,0.08)] border border-stone-900/[0.04]">
                <input
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !loading && handleSearch()}
                  placeholder="What sounds good?"
                  className="flex-1 bg-transparent text-stone-900 text-[15px] placeholder-stone-400 outline-none"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading || !searchInput.trim()}
                  className="w-9 h-9 rounded-full bg-stone-900 text-[#fbf6f0] flex items-center justify-center disabled:opacity-25 active:scale-95 transition-all shrink-0"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 12V2M3 6l4-4 4 4" />
                  </svg>
                </button>
              </div>
              {currentSearch && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[12px] text-stone-800 bg-[#f8d9cb] px-3.5 py-1.5 rounded-full font-medium">
                    {currentSearch}
                  </span>
                  <button
                    onClick={() => { setCurrentSearch(''); setSearchInput(''); setSeenNames([]); fetchOptions('', []); }}
                    className="text-xs text-stone-400 active:text-stone-600 ml-auto"
                  >
                    Clear
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-7 pb-10">
          {tab === 'suggestions' ? (
            <>
              {loading ? (
                <ThinkingDots label={currentSearch ? `Finding ${currentSearch} ideas…` : null} />
              ) : error ? (
                <div className="text-center py-10">
                  <div className="emoji-hero text-3xl mb-3">😬</div>
                  <p className="text-stone-500 text-sm mb-5">{error}</p>
                  <InkPill onClick={() => fetchOptions(currentSearch)} className="px-6 py-2.5 text-sm mx-auto">
                    Try again
                  </InkPill>
                </div>
              ) : (
                options.map((option, i) => (
                  <OptionRow
                    key={i}
                    option={option}
                    participants={participants}
                    onSelect={() => handleSelect(option)}
                    selecting={selectingName === option.name}
                  />
                ))
              )}

              {!loading && !error && options.length > 0 && (
                <button
                  onClick={() => fetchOptions(currentSearch, seenNames)}
                  className="w-full py-3.5 text-sm text-stone-500 font-medium border border-stone-900/[0.08] rounded-full active:bg-stone-900/5 transition-colors"
                >
                  ↺ Show me 5 more
                </button>
              )}
            </>
          ) : tab === 'myrecipes' ? (
            (customRecipes || []).length === 0 ? (
              <div className="text-center py-16">
                <p className="text-stone-500 font-semibold text-sm">No saved recipes yet</p>
                <p className="text-stone-400 text-xs mt-1">Add recipes in the Recipes tab</p>
              </div>
            ) : (
              (customRecipes || []).map((recipe) => (
                <SavedRow key={recipe.id} recipe={recipe} action="Use" onUse={() => handleUseCustomRecipe(recipe)} />
              ))
            )
          ) : favorites.length === 0 ? (
            <div className="text-center py-16">
              <div className="emoji-hero text-3xl mb-3">⭐</div>
              <p className="text-stone-500 font-semibold text-sm">No starred meals yet</p>
              <p className="text-stone-400 text-xs mt-1">Star meals after eating them to reuse here</p>
            </div>
          ) : (
            favorites.map((entry, i) => (
              <SavedRow
                key={i}
                recipe={entry.recipe}
                action="Use ★"
                onUse={() => handleImportFavorite(entry)}
                meta={
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400 capitalize mb-0.5">
                    {entry.mealType}
                    {entry.mealType === mealType && <span className="text-grad ml-1.5">match</span>}
                  </p>
                }
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
