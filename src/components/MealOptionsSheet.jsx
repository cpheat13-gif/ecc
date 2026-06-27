import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getMealTargets } from '../utils/macros';
import { buildOptionsPrompt, buildMealPrompt, generateMeal } from '../utils/prompt';

const MEAL_ICONS = { breakfast: '☀️', lunch: '🥗', dinner: '🍽️', snack: '🍎' };

function SkeletonCard() {
  return (
    <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-700 rounded-lg w-3/4" />
          <div className="h-3 bg-slate-700/60 rounded-lg w-1/3" />
          <div className="h-3 bg-slate-700/40 rounded-lg w-full" />
        </div>
        <div className="w-14 h-8 bg-slate-700 rounded-xl shrink-0" />
      </div>
      <div className="mt-3 flex gap-2">
        <div className="flex-1 h-12 bg-slate-700/40 rounded-xl" />
        <div className="flex-1 h-12 bg-slate-700/40 rounded-xl" />
      </div>
    </div>
  );
}

function OptionCard({ option, participants, onSelect, selecting }) {
  return (
    <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm leading-snug">{option.name}</h3>
          <div className="text-slate-500 text-xs mt-0.5">🕐 {option.cookTime}</div>
          {option.description && (
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">{option.description}</p>
          )}
        </div>
        <button
          onClick={onSelect}
          disabled={selecting}
          className="shrink-0 px-3 py-2 bg-emerald-500 text-white text-xs font-semibold rounded-xl active:scale-95 transition-all disabled:opacity-40 flex items-center gap-1.5"
        >
          {selecting ? (
            <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : 'Select'}
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        {participants !== 'isa' && option.macros?.connor && (
          <div className="flex-1 bg-sky-500/10 rounded-xl px-3 py-2">
            <div className="text-[10px] text-sky-400 font-medium mb-0.5">Connor</div>
            <div className="text-xs text-sky-300 font-semibold">{option.macros.connor.calories} kcal</div>
            <div className="text-[10px] text-sky-400/70">P {option.macros.connor.protein}g · C {option.macros.connor.carbs}g · F {option.macros.connor.fat}g</div>
          </div>
        )}
        {participants !== 'connor' && option.macros?.isa && (
          <div className="flex-1 bg-purple-500/10 rounded-xl px-3 py-2">
            <div className="text-[10px] text-purple-400 font-medium mb-0.5">Isa</div>
            <div className="text-xs text-purple-300 font-semibold">{option.macros.isa.calories} kcal</div>
            <div className="text-[10px] text-purple-400/70">P {option.macros.isa.protein}g · C {option.macros.isa.carbs}g · F {option.macros.isa.fat}g</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MealOptionsSheet() {
  const { state, dispatch } = useApp();
  const { optionsSheet, weekConfig } = state;
  const { day, mealType } = optionsSheet;

  const dayConfig = weekConfig[day];
  const participants = dayConfig.participants || 'both';
  const targets = getMealTargets(mealType, dayConfig.connorTraining, dayConfig.isaTraining);

  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [currentSearch, setCurrentSearch] = useState('');
  const [selectingName, setSelectingName] = useState(null);

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

  const close = () => dispatch({ type: 'CLOSE_OPTIONS' });

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />

      <div className="relative bg-slate-900 rounded-t-3xl max-h-[92vh] flex flex-col border-t border-slate-700">
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-slate-600 rounded-full" />
        </div>

        <div className="px-5 pb-4 shrink-0 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-slate-500 text-xs capitalize">
                {MEAL_ICONS[mealType]} {mealType} · {day}
              </div>
              <h2 className="text-white text-lg font-bold">Pick a meal</h2>
            </div>
            <button
              onClick={close}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="flex gap-2">
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Thai vibes, quick pasta, high protein…"
              className="flex-1 bg-slate-800 text-white text-sm rounded-xl px-4 py-2.5 placeholder-slate-500 outline-none border border-slate-700 focus:border-emerald-500 transition-colors"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !searchInput.trim()}
              className="px-4 py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-xl disabled:opacity-40 active:scale-95 transition-all"
            >
              Search
            </button>
          </div>
          {currentSearch && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-slate-500">Showing results for</span>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                "{currentSearch}"
              </span>
              <button
                onClick={() => { setCurrentSearch(''); setSearchInput(''); fetchOptions(''); }}
                className="text-xs text-slate-500 hover:text-slate-300 ml-auto"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {loading ? (
            [0,1,2,3,4].map(i => <SkeletonCard key={i} />)
          ) : error ? (
            <div className="text-center py-10">
              <div className="text-2xl mb-2">😬</div>
              <div className="text-slate-400 text-sm mb-4">{error}</div>
              <button
                onClick={() => fetchOptions(currentSearch)}
                className="px-5 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-xl"
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
              className="w-full py-3 text-sm text-slate-400 border border-slate-700 rounded-2xl hover:bg-slate-800 transition-colors"
            >
              ↺ Generate 5 new options
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
