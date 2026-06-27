import { useState } from 'react';
import { useApp, DAYS, DAY_LABELS, MEAL_TYPES } from '../context/AppContext';

const MEAL_ICONS = { breakfast: '☀️', lunch: '🥗', dinner: '🍽️', snack: '🍎' };

function DayCard({ day, config, onChange }) {
  const toggleMeal = (meal) => {
    const meals = config.meals.includes(meal)
      ? config.meals.filter(m => m !== meal)
      : [...config.meals, meal];
    onChange({ ...config, meals });
  };

  const isOff = config.meals.length === 0;

  return (
    <div className={`rounded-2xl border p-4 transition-colors ${
      isOff ? 'border-slate-700 bg-slate-800/50' : 'border-slate-600 bg-slate-800'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-100 capitalize">{day}</h3>
        {isOff && <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded-full">Rest</span>}
      </div>

      {/* Meal toggles */}
      <div className="flex flex-wrap gap-2 mb-3">
        {MEAL_TYPES.map(meal => (
          <button
            key={meal}
            onClick={() => toggleMeal(meal)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              config.meals.includes(meal)
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            {MEAL_ICONS[meal]} {meal.charAt(0).toUpperCase() + meal.slice(1)}
          </button>
        ))}
      </div>

      {/* Training toggles */}
      {config.meals.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-slate-700">
          {[
            { key: 'connorTraining', label: 'Connor' },
            { key: 'isaTraining',    label: 'Isa'    },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{label}</span>
              <div className="flex gap-1.5">
                {['Training', 'Rest'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => onChange({ ...config, [key]: mode === 'Training' })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      (config[key] ? 'Training' : 'Rest') === mode
                        ? mode === 'Training'
                          ? 'bg-sky-500 text-white'
                          : 'bg-slate-600 text-slate-200'
                        : 'bg-slate-700/50 text-slate-500 hover:bg-slate-700'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SetupFlow() {
  const { state, dispatch } = useApp();

  const [config, setConfig] = useState(state.weekConfig);

  const updateDay = (day, dayConfig) => {
    setConfig(prev => ({ ...prev, [day]: dayConfig }));
  };

  const totalMeals = Object.values(config).reduce((n, d) => n + d.meals.length, 0);

  const handleBuild = () => {
    dispatch({ type: 'COMPLETE_SETUP', weekConfig: config });
  };

  const handlePreset = (preset) => {
    if (preset === 'weekday-dinner') {
      const next = { ...config };
      DAYS.forEach(day => {
        const isWeekend = day === 'saturday' || day === 'sunday';
        next[day] = {
          meals: isWeekend ? [] : ['dinner'],
          connorTraining: !isWeekend,
          isaTraining: false,
        };
      });
      setConfig(next);
    } else if (preset === 'full') {
      const next = { ...config };
      DAYS.forEach(day => {
        const isWeekend = day === 'saturday' || day === 'sunday';
        next[day] = {
          meals: ['breakfast', 'lunch', 'dinner', 'snack'],
          connorTraining: !isWeekend,
          isaTraining: !isWeekend,
        };
      });
      setConfig(next);
    } else if (preset === 'clear') {
      const next = { ...config };
      DAYS.forEach(day => {
        next[day] = { meals: [], connorTraining: false, isaTraining: false };
      });
      setConfig(next);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="px-4 pt-12 pb-6">
        <div className="text-emerald-400 text-sm font-medium mb-1">Weekly Meal Planner</div>
        <h1 className="text-2xl font-bold text-slate-100">Configure Your Week</h1>
        <p className="text-slate-400 text-sm mt-1">
          Select meals and training days for Connor &amp; Isa.
        </p>

        {/* Presets */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
          {[
            { id: 'weekday-dinner', label: 'Weekday dinners' },
            { id: 'full',           label: 'Full week'       },
            { id: 'clear',          label: 'Clear all'       },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => handlePreset(p.id)}
              className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Day cards */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-32">
        {DAYS.map(day => (
          <DayCard
            key={day}
            day={day}
            config={config[day]}
            onChange={(c) => updateDay(day, c)}
          />
        ))}
      </div>

      {/* Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent pb-8">
        <button
          onClick={handleBuild}
          disabled={totalMeals === 0}
          className="w-full py-4 rounded-2xl font-semibold text-white text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-500 hover:bg-emerald-600 active:scale-95"
        >
          {totalMeals === 0
            ? 'Select at least one meal'
            : `Build My Plan · ${totalMeals} meal${totalMeals !== 1 ? 's' : ''}`}
        </button>
        <p className="text-center text-xs text-slate-500 mt-2">
          Mon–Fri dinners pre-loaded with 5 seed recipes
        </p>
      </div>
    </div>
  );
}
