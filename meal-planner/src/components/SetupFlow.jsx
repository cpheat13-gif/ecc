import { useState } from 'react';
import { useApp, DAYS } from '../context/AppContext';

const DAY_FULL = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
};

const MEAL_OPTIONS = [
  { id: 'breakfast', icon: '☀️', label: 'Breakfast' },
  { id: 'lunch',     icon: '🥗', label: 'Lunch'     },
  { id: 'dinner',    icon: '🍽️', label: 'Dinner'    },
  { id: 'snack',     icon: '🍎', label: 'Snack'     },
];

function Toggle({ on, onToggle, colorOn = 'bg-emerald-500' }) {
  return (
    <button
      onClick={onToggle}
      className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${on ? colorOn : 'bg-slate-600'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${on ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  );
}

function DayStep({ config, onChange }) {
  const toggleMeal = (meal) => {
    const meals = config.meals.includes(meal)
      ? config.meals.filter(m => m !== meal)
      : [...config.meals, meal];
    onChange({ ...config, meals });
  };

  return (
    <div className="flex-1 overflow-y-auto space-y-4">
      {/* Enable toggle */}
      <div className="flex items-center justify-between bg-slate-800 rounded-2xl p-4 border border-slate-700">
        <div>
          <div className="text-white font-medium">Plan meals this day?</div>
          <div className="text-slate-500 text-xs mt-0.5">Toggle on to set up meals</div>
        </div>
        <Toggle on={config.enabled} onToggle={() => onChange({ ...config, enabled: !config.enabled })} />
      </div>

      {config.enabled && (
        <>
          {/* Who */}
          <div>
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 px-1">
              Who are we planning for?
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'both',   label: 'Both'   },
                { id: 'connor', label: 'Connor' },
                { id: 'isa',    label: 'Isa'    },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => onChange({ ...config, participants: id })}
                  className={`py-3 rounded-2xl text-sm font-medium transition-colors ${
                    config.participants === id
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Meals */}
          <div>
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 px-1">
              Which meals?
            </div>
            <div className="grid grid-cols-2 gap-2">
              {MEAL_OPTIONS.map(({ id, icon, label }) => (
                <button
                  key={id}
                  onClick={() => toggleMeal(id)}
                  className={`py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    config.meals.includes(id)
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  <span>{icon}</span>{label}
                </button>
              ))}
            </div>
          </div>

          {/* Training */}
          <div>
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 px-1">
              Training day?
            </div>
            <div className="space-y-2">
              {config.participants !== 'isa' && (
                <div className="flex items-center justify-between bg-slate-800 rounded-2xl px-4 py-3 border border-slate-700">
                  <div>
                    <span className="text-white text-sm font-medium">Connor</span>
                    <span className="text-xs text-slate-500 ml-2">
                      {config.connorTraining ? '2,750 kcal' : '2,450 kcal'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{config.connorTraining ? 'Training' : 'Rest'}</span>
                    <Toggle
                      on={config.connorTraining}
                      onToggle={() => onChange({ ...config, connorTraining: !config.connorTraining })}
                      colorOn="bg-sky-500"
                    />
                  </div>
                </div>
              )}
              {config.participants !== 'connor' && (
                <div className="flex items-center justify-between bg-slate-800 rounded-2xl px-4 py-3 border border-slate-700">
                  <div>
                    <span className="text-white text-sm font-medium">Isa</span>
                    <span className="text-xs text-slate-500 ml-2">
                      {config.isaTraining ? '1,700 kcal' : '1,500 kcal'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{config.isaTraining ? 'Training' : 'Rest'}</span>
                    <Toggle
                      on={config.isaTraining}
                      onToggle={() => onChange({ ...config, isaTraining: !config.isaTraining })}
                      colorOn="bg-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ReviewStep({ weekConfig, onEdit }) {
  return (
    <div className="flex-1 overflow-y-auto space-y-2">
      {DAYS.map((day, i) => {
        const cfg = weekConfig[day];
        const participantLabel = cfg.participants === 'both'
          ? 'Connor & Isa'
          : cfg.participants === 'connor' ? 'Connor only' : 'Isa only';

        return (
          <div key={day} className={`rounded-2xl p-4 ${cfg.enabled ? 'bg-slate-800 border border-slate-700' : 'bg-slate-800/30'}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-white font-semibold w-8 shrink-0">{DAY_FULL[day].slice(0, 3)}</span>
                {cfg.enabled && cfg.meals.length > 0 ? (
                  <div className="min-w-0">
                    <div className="text-xs text-emerald-400 capitalize truncate">
                      {cfg.meals.join(' · ')}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {participantLabel}
                      {cfg.participants !== 'isa' && ` · C: ${cfg.connorTraining ? 'Train' : 'Rest'}`}
                      {cfg.participants !== 'connor' && ` · I: ${cfg.isaTraining ? 'Train' : 'Rest'}`}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-600">No meals planned</span>
                )}
              </div>
              <button
                onClick={() => onEdit(i)}
                className="shrink-0 text-xs text-emerald-400 px-2 py-1 rounded-lg bg-emerald-500/10"
              >
                Edit
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function SetupFlow() {
  const { state, dispatch } = useApp();

  const initConfig = Object.fromEntries(
    DAYS.map(d => [d, {
      enabled: (state.weekConfig[d]?.meals?.length || 0) > 0,
      participants: state.weekConfig[d]?.participants || 'both',
      meals: state.weekConfig[d]?.meals || [],
      connorTraining: state.weekConfig[d]?.connorTraining ?? true,
      isaTraining:    state.weekConfig[d]?.isaTraining    ?? true,
    }])
  );

  const [step, setStep] = useState(0);
  const [weekConfig, setWeekConfig] = useState(initConfig);

  const isReview = step === 7;
  const day = DAYS[step] || null;

  const updateDay = (cfg) => {
    setWeekConfig(prev => ({ ...prev, [day]: cfg }));
  };

  const totalMeals = Object.values(weekConfig).reduce(
    (n, d) => n + (d.enabled ? d.meals.length : 0), 0
  );

  const handleBuild = () => {
    const finalConfig = Object.fromEntries(
      DAYS.map(d => [d, {
        ...weekConfig[d],
        meals: weekConfig[d].enabled ? weekConfig[d].meals : [],
      }])
    );
    dispatch({ type: 'COMPLETE_SETUP', weekConfig: finalConfig });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 px-5 pt-12 pb-6 max-w-[430px] mx-auto">
      {/* Progress bar */}
      <div className="flex gap-1.5 mb-8">
        {[...DAYS, 'review'].map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all flex-1 ${
              i === step ? 'bg-emerald-400' : i < step ? 'bg-emerald-700' : 'bg-slate-700'
            }`}
          />
        ))}
      </div>

      {/* Header */}
      <div className="mb-6 shrink-0">
        {isReview ? (
          <>
            <div className="text-emerald-400 text-sm font-medium mb-1">Almost done!</div>
            <h1 className="text-3xl font-bold text-white">Review your week</h1>
          </>
        ) : (
          <>
            <div className="text-emerald-400 text-sm font-medium mb-1">Day {step + 1} of 7</div>
            <h1 className="text-3xl font-bold text-white">{DAY_FULL[day]}</h1>
          </>
        )}
      </div>

      {/* Content */}
      {isReview ? (
        <ReviewStep weekConfig={weekConfig} onEdit={(i) => setStep(i)} />
      ) : (
        <DayStep config={weekConfig[day]} onChange={updateDay} />
      )}

      {/* Nav */}
      <div className="mt-5 shrink-0 flex gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="py-4 px-6 bg-slate-800 text-slate-300 rounded-2xl font-medium border border-slate-700"
          >
            Back
          </button>
        )}
        {isReview ? (
          <button
            onClick={handleBuild}
            disabled={totalMeals === 0}
            className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-semibold text-base active:scale-95 transition-transform disabled:opacity-40"
          >
            {totalMeals === 0
              ? 'Add at least one meal'
              : `Build My Plan · ${totalMeals} meal${totalMeals !== 1 ? 's' : ''}`}
          </button>
        ) : (
          <button
            onClick={() => setStep(s => s + 1)}
            className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-semibold text-base active:scale-95 transition-transform"
          >
            {step === 6 ? 'Review →' : 'Next →'}
          </button>
        )}
      </div>
    </div>
  );
}
