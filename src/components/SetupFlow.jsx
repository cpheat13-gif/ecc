import { useState } from 'react';
import { useApp, DAYS } from '../context/AppContext';
import { InkPill } from './ui';

const DAY_FULL = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
};

const MEAL_OPTIONS = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch',     label: 'Lunch'     },
  { id: 'dinner',    label: 'Dinner'    },
  { id: 'snack',     label: 'Snack'     },
];

function Toggle({ on, onToggle, colorOn = 'bg-stone-900' }) {
  return (
    <button
      onClick={onToggle}
      className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${on ? colorOn : 'bg-stone-900/10'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${on ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  );
}

function PillOption({ selected, children, ...props }) {
  return (
    <button
      {...props}
      className={`py-3 rounded-full text-sm font-semibold transition-all ${
        selected
          ? 'bg-stone-900 text-[#fbf6f0]'
          : 'bg-white/70 text-stone-600 border border-stone-900/[0.07]'
      }`}
    >
      {children}
    </button>
  );
}

function DayStep({ config, onChange, settings }) {
  const toggleMeal = (meal) => {
    const meals = config.meals.includes(meal)
      ? config.meals.filter(m => m !== meal)
      : [...config.meals, meal];
    onChange({ ...config, meals });
  };

  return (
    <div className="flex-1 overflow-y-auto space-y-6">
      <div className="flex items-center justify-between py-1">
        <div>
          <div className="text-stone-900 font-semibold text-sm">Plan meals this day?</div>
          <div className="text-stone-400 text-xs mt-0.5">Toggle on to set up meals</div>
        </div>
        <Toggle on={config.enabled} onToggle={() => onChange({ ...config, enabled: !config.enabled })} />
      </div>

      {config.enabled && (
        <>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-400 mb-3">
              Who are we planning for?
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'both',   label: 'Both'   },
                { id: 'connor', label: 'Connor' },
                { id: 'isa',    label: 'Isa'    },
              ].map(({ id, label }) => (
                <PillOption
                  key={id}
                  selected={config.participants === id}
                  onClick={() => onChange({ ...config, participants: id })}
                >
                  {label}
                </PillOption>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-400 mb-3">
              Which meals?
            </div>
            <div className="grid grid-cols-2 gap-2">
              {MEAL_OPTIONS.map(({ id, label }) => (
                <PillOption
                  key={id}
                  selected={config.meals.includes(id)}
                  onClick={() => toggleMeal(id)}
                >
                  {label}
                </PillOption>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-400 mb-3">
              Training day?
            </div>
            <div className="space-y-1">
              {config.participants !== 'isa' && (
                <div className="flex items-center justify-between py-3 border-b border-stone-900/[0.05]">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    <span className="text-stone-900 text-sm font-semibold">Connor</span>
                    <span className="text-xs text-stone-400 tabular-nums">
                      {config.connorTraining
                        ? `${settings.connor.training.calories.toLocaleString()} kcal`
                        : `${settings.connor.rest.calories.toLocaleString()} kcal`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs text-stone-400">{config.connorTraining ? 'Training' : 'Rest'}</span>
                    <Toggle
                      on={config.connorTraining}
                      onToggle={() => onChange({ ...config, connorTraining: !config.connorTraining })}
                      colorOn="bg-sky-500"
                    />
                  </div>
                </div>
              )}
              {config.participants !== 'connor' && (
                <div className="flex items-center justify-between py-3 border-b border-stone-900/[0.05]">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                    <span className="text-stone-900 text-sm font-semibold">Isa</span>
                    <span className="text-xs text-stone-400 tabular-nums">
                      {config.isaTraining
                        ? `${settings.isa.training.calories.toLocaleString()} kcal`
                        : `${settings.isa.rest.calories.toLocaleString()} kcal`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs text-stone-400">{config.isaTraining ? 'Training' : 'Rest'}</span>
                    <Toggle
                      on={config.isaTraining}
                      onToggle={() => onChange({ ...config, isaTraining: !config.isaTraining })}
                      colorOn="bg-violet-500"
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
    <div className="flex-1 overflow-y-auto">
      {DAYS.map((day, i) => {
        const cfg = weekConfig[day];
        const participantLabel = cfg.participants === 'both'
          ? 'Connor & Isa'
          : cfg.participants === 'connor' ? 'Connor only' : 'Isa only';

        return (
          <div key={day} className="flex items-center justify-between gap-3 py-3.5 border-b border-stone-900/[0.05]">
            <div className="flex items-baseline gap-3 min-w-0">
              <span className={`font-display font-bold w-10 shrink-0 ${cfg.enabled ? 'text-stone-900' : 'text-stone-300'}`}>
                {DAY_FULL[day].slice(0, 3)}
              </span>
              {cfg.enabled && cfg.meals.length > 0 ? (
                <div className="min-w-0">
                  <div className="text-[13px] text-stone-700 capitalize truncate font-medium">
                    {cfg.meals.join(' · ')}
                  </div>
                  <div className="text-xs text-stone-400 mt-0.5">
                    {participantLabel}
                    {cfg.participants !== 'isa'    && ` · C: ${cfg.connorTraining ? 'Train' : 'Rest'}`}
                    {cfg.participants !== 'connor' && ` · I: ${cfg.isaTraining    ? 'Train' : 'Rest'}`}
                  </div>
                </div>
              ) : (
                <span className="text-xs text-stone-300">No meals planned</span>
              )}
            </div>
            <button
              onClick={() => onEdit(i)}
              className="shrink-0 text-xs text-stone-600 px-3.5 py-1.5 rounded-full border border-stone-900/[0.08] font-semibold active:bg-stone-900/5"
            >
              Edit
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default function SetupFlow() {
  const { state, dispatch } = useApp();
  const { settings } = state;

  const initConfig = Object.fromEntries(
    DAYS.map(d => [d, {
      enabled:        (state.weekConfig[d]?.meals?.length || 0) > 0,
      participants:   state.weekConfig[d]?.participants    || 'both',
      meals:          state.weekConfig[d]?.meals           || [],
      connorTraining: state.weekConfig[d]?.connorTraining  ?? true,
      isaTraining:    state.weekConfig[d]?.isaTraining     ?? true,
    }])
  );

  const [step, setStep]             = useState(0);
  const [weekConfig, setWeekConfig] = useState(initConfig);

  const isReview = step === 7;
  const day      = DAYS[step] || null;

  const updateDay = (cfg) => setWeekConfig(prev => ({ ...prev, [day]: cfg }));

  const totalMeals = Object.values(weekConfig).reduce(
    (n, d) => n + (d.enabled ? d.meals.length : 0), 0
  );

  const handleBuild = () => {
    const finalConfig = Object.fromEntries(
      DAYS.map(d => [d, { ...weekConfig[d], meals: weekConfig[d].enabled ? weekConfig[d].meals : [] }])
    );
    dispatch({ type: 'COMPLETE_SETUP', weekConfig: finalConfig });
  };

  return (
    <div className="min-h-screen flex flex-col px-6 pt-14 pb-8 max-w-[430px] mx-auto">
      {/* Progress */}
      <div className="flex gap-1.5 mb-9">
        {[...DAYS, 'review'].map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all flex-1 ${
              i === step ? 'bg-grad' : i < step ? 'bg-stone-900' : 'bg-stone-900/10'
            }`}
          />
        ))}
      </div>

      {/* Header */}
      <div className="mb-7 shrink-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">
          {isReview ? 'Almost done' : `Day ${step + 1} of 7`}
        </p>
        <h1 className="font-display text-[40px] font-bold text-stone-900 leading-[1.05] tracking-tight mt-1">
          {isReview ? 'Your week' : DAY_FULL[day]}
        </h1>
      </div>

      {/* Content */}
      {isReview ? (
        <ReviewStep weekConfig={weekConfig} onEdit={(i) => setStep(i)} />
      ) : (
        <DayStep config={weekConfig[day]} onChange={updateDay} settings={settings} />
      )}

      {/* Nav */}
      <div className="mt-6 shrink-0 flex gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="py-4 px-7 rounded-full border border-stone-900/10 text-stone-600 font-semibold text-sm active:bg-stone-900/5"
          >
            Back
          </button>
        )}
        {isReview ? (
          <InkPill onClick={handleBuild} disabled={totalMeals === 0} className="flex-1 py-4 text-base">
            {totalMeals === 0
              ? 'Add at least one meal'
              : `Build my plan · ${totalMeals} meal${totalMeals !== 1 ? 's' : ''}`}
          </InkPill>
        ) : (
          <InkPill onClick={() => setStep(s => s + 1)} className="flex-1 py-4 text-base">
            {step === 6 ? 'Review →' : 'Next →'}
          </InkPill>
        )}
      </div>
    </div>
  );
}
