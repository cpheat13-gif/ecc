import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getMealTargets } from '../utils/macros';
import { buildOptionsPrompt, buildMealPrompt, generateMeal } from '../utils/prompt';

const MEAL_ICONS = { breakfast: '☀️', lunch: '🥗', dinner: '🍽️', snack: '🍎' };

function SkeletonCard() {
  return (
    <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-stone-200 rounded-lg w-3/4" />
          <div className="h-3 bg-stone-200/60 rounded-lg w-1/3" />
          <div className="h-3 bg-stone-200/40 rounded-lg w-full" />
        </div>
        <div className="w-14 h-8 bg-stone-200 rounded-xl shrink-0" />
      </div>
      <div className="mt-3 flex gap-2">
        <div className="flex-1 h-12 bg-stone-200/40 rounded-xl" />
        <div className="flex-1 h-12 bg-stone-200/40 rounded-xl" />
      </div>
    </div>
  );
}

function OptionCard({ option, participants, onSelect, selecting }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-stone-900 font-semibold text-sm leading-snug">{option.name}</h3>
          <div className="text-stone-400 text-xs mt-0.5">🕐 {option.cookTime}</div>
          {option.description && (
            <p className="text-stone-500 text-xs mt-1.5 leading-relaxed">{option.description}</p>
          )}
        </div>
        <button
          onClick={onSelect}
          disabled={selecting}
          className="shrink-0 px-3 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl active:scale-95 transition-all disabled:opacity-40 flex items-center gap-1.5 shadow-sm"
        >
          {selecting ? (
            <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : 'Select'}
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        {participants !== 'isa' && option.macros?.connor && (
          <div className="flex-1 bg-blue-50 rounded-xl px-3 py-2">
            <div className="text-[10px] text-blue-600 font-medium mb-0.5">Connor</div>
            <div className="text-xs text-blue-700 font-semibold">{option.macros.connor.calories} kcal</div>
            <div className="text-[10px] text-blue-500">P {option.macros.connor.protein}g · C {option.macros.connor.carbs}g · F {option.macros.connor.fat}g</div>
          </div>
        )}
        {participants !== 'connor' && option.macros?.isa && (
          <div className="flex-1 bg-violet-50 rounded-xl px-3 py-2">
            <div className="text-[10px] text-violet-600 font-medium mb-0.5">Isa</div>
            <div className="text-xs text-violet-700 font-semibold">{option.macros.isa.calories} kcal</div>
            <div className="text-[10px] text-violet-500">P {option.macros.isa.protein}g · C {option.macros.isa.carbs}g · F {option.macros.isa.fat}g</div>
          </div>
        )}
      </div>
    </div>
  );
}

function FavoriteCard({ entry, onImport, currentMealType }) {
  const isSameType = entry.mealType === currentMealType;
  return (
    <button
      onClick={onImport}
      className="w-full text-left bg-white rounded-2xl p-4 border border-stone-200 shadow-sm active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm">{MEAL_ICONS[entry.mealType] || '🍽'}</span>
            <span className="text-xs text-stone-400 capitalize">{entry.mealType}</span>
            {isSameType && (
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">match</span>
            )}
          </div>
          <p className="text-stone-900 font-semibold text-sm leading-snug truncate">{entry.recipe.name}</p>
          <p className="text-xs text-stone-400 mt-0.5">🕐 {entry.recipe.cookTime}</p>
        </div>
        <span className="shrink-0 px-3 py-2 bg-amber-50 text-amber-700 text-xs font-semibold rounded-xl">
          Use ★
        </span>
      </div>

      {entry.recipe.macros && (
        <div className="flex gap-2 mt-3">
          {entry.recipe.macros.connor && (
            <div className="flex-1 bg-blue-50 rounded-xl px-3 py-2">
              <div className="text-[10px] text-blue-600 font-medium mb-0.5">Connor</div>
              <div className="text-xs text-blue-700 font-semibold">{entry.recipe.macros.connor.calories} kcal</div>
              <div className="text-[10px] text-blue-500">P {entry.recipe.macros.connor.protein}g</div>
            </div>
          )}
          {entry.recipe.macros.isa && (
            <div className="flex-1 bg-violet-50 rounded-xl px-3 py-2">
              <div className="text-[10px] text-violet-600 font-medium mb-0.5">Isa</div>
              <div className="text-xs text-violet-700 font-semibold">{entry.recipe.macros.isa.calories} kcal</div>
              <div className="text-[10px] text-violet-500">P {entry.recipe.macros.isa.protein}g</div>
            </div>
          )}
        </div>
      )}
    </button>
  );
}

export default function MealOptionsSheet() {
  const { state, dispatch } = useApp();
  const { optionsSheet, weekConfig, starredMeals, settings } = state;
  const { day, mealType } = optionsSheet;

  const dayConfig = weekConfig[day];
  const participants = dayConfig.participants || 'both';
  const targets = getMealTargets(mealType, dayConfig.connorTraining, dayConfig.isaTraining, settings);

  const [tab, setTab] = useState('suggestions');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [currentSearch, setCurrentSearch] = useState('');
  const [selectingName, setSelectingName] = useState(null);

  const favorites = Object.values(starredMeals || {}).sort((a, b) => {
    if (a.mealType === mealType && b.mealType !== mealType) return -1;
    if (b.mealType === mealType && a.mealType !== mealType) return 1;
    return b.starredAt - a.starredAt;
  });

  const fetchOptions = async (searchTerm = '') => {
    setLoading(true);
    setError(null);
    setOptions([]);
    try {
      const prompt = buildOptionsPrompt({ mealType, participants, targets, searchTerm });
      const res = await fetch('/api/generate-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      if (!res.ok) throw new Error(data.error || 'Failed to generate options');
      setOptions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOptions(); }, []);

  const handleSearch = () => {
    const term = searchInput.trim();
    setCurrentSearch(term);
    fetchOptions(term);
  };

  const handleSelect = async (option) => {
    setSelectingName(option.name);
    dispatch({ type: 'CLOSE_OPTIONS' });
    dispatch({ type: 'SET_GENERATING', value: { day, type: mealType } });

    try {
      const dayType = dayConfig.connorTraining ? 'training' : 'rest';
      const prompt = buildMealPrompt({ mealType, dayType, targets, requestedName: option.name });
      const meal = await generateMeal(prompt);
      dispatch({ type: 'SET_MEAL', day, mealType, recipe: { ...meal, mealType } });
    } catch (err) {
      alert(`Could not generate recipe: ${err.message}`);
      dispatch({ type: 'SET_GENERATING', value: null });
    }
  };

  const handleImportFavorite = (entry) => {
    dispatch({ type: 'SET_MEAL', day, mealType, recipe: { ...entry.recipe, mealType } });
    dispatch({ type: 'CLOSE_OPTIONS' });
  };

  const close = () => dispatch({ type: 'CLOSE_OPTIONS' });

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />

      <div className="relative bg-white rounded-t-3xl max-h-[92vh] flex flex-col border-t border-stone-200 shadow-2xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-stone-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 pb-4 shrink-0 border-b border-stone-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-stone-400 text-xs capitalize">
                {MEAL_ICONS[mealType]} {mealType} · {day}
              </div>
              <h2 className="text-stone-900 text-lg font-bold">Pick a meal</h2>
            </div>
            <button
              onClick={close}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-stone-100 rounded-xl mb-3">
            <button
              onClick={() => setTab('suggestions')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                tab === 'suggestions' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
              }`}
            >
              ✨ AI Suggestions
            </button>
            <button
              onClick={() => setTab('favorites')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                tab === 'favorites' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
              }`}
            >
              ★ Favorites {favorites.length > 0 && `(${favorites.length})`}
            </button>
          </div>

          {/* Search — only on suggestions tab */}
          {tab === 'suggestions' && (
            <>
              <div className="flex gap-2">
                <input
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Thai vibes, quick pasta, high protein…"
                  className="flex-1 bg-stone-50 text-stone-900 text-sm rounded-xl px-4 py-2.5 placeholder-stone-400 outline-none border border-stone-200 focus:border-emerald-500 transition-colors"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading || !searchInput.trim()}
                  className="px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl disabled:opacity-40 active:scale-95 transition-all shadow-sm"
                >
                  Search
                </button>
              </div>
              {currentSearch && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-stone-400">Showing results for</span>
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    "{currentSearch}"
                  </span>
                  <button
                    onClick={() => { setCurrentSearch(''); setSearchInput(''); fetchOptions(''); }}
                    className="text-xs text-stone-400 hover:text-stone-600 ml-auto"
                  >
                    Clear
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {tab === 'suggestions' ? (
            <>
              {loading ? (
                [0,1,2,3,4].map(i => <SkeletonCard key={i} />)
              ) : error ? (
                <div className="text-center py-10">
                  <div className="text-2xl mb-2">😬</div>
                  <div className="text-stone-500 text-sm mb-4">{error}</div>
                  <button
                    onClick={() => fetchOptions(currentSearch)}
                    className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl shadow-sm"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                options.map((option, i) => (
                  <OptionCard
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
                  onClick={() => fetchOptions(currentSearch)}
                  className="w-full py-3 text-sm text-stone-500 border border-stone-200 rounded-2xl hover:bg-stone-50 transition-colors"
                >
                  ↺ Generate 5 new options
                </button>
              )}
            </>
          ) : favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-4xl mb-3">☆</span>
              <p className="text-stone-500 font-medium text-sm">No favorites yet</p>
              <p className="text-stone-400 text-xs mt-1">Star meals after eating them to save here</p>
            </div>
          ) : (
            favorites.map((entry, i) => (
              <FavoriteCard
                key={i}
                entry={entry}
                currentMealType={mealType}
                onImport={() => handleImportFavorite(entry)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
