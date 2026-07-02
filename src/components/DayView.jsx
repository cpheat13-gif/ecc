import MealCard from './MealCard';
import { GradBar } from './ui';
import { getDailyTotals, getDailyTargets } from '../utils/macros';
import { useApp, MEAL_TYPES } from '../context/AppContext';

const MACRO_DOTS = [
  { key: 'protein', label: 'Protein', dot: 'bg-red-500' },
  { key: 'carbs',   label: 'Carbs',   dot: 'bg-amber-500' },
  { key: 'fat',     label: 'Fat',     dot: 'bg-sky-400' },
];

function PersonSummary({ person, name, totals, targets, training }) {
  const dot = person === 'connor' ? 'bg-sky-500' : 'bg-violet-500';
  const pct = targets.calories > 0 ? (totals.calories / targets.calories) * 100 : 0;

  return (
    <div>
      <div className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">{name}</span>
        <span className="text-[11px] text-stone-400 font-medium">· {training ? 'Training' : 'Rest'}</span>
      </div>

      <div className="flex items-baseline gap-1.5 mt-1">
        <span className="font-display text-[34px] font-bold text-grad tabular-nums leading-none">
          {totals.calories.toLocaleString()}
        </span>
        <span className="text-sm text-stone-400 font-medium">/ {targets.calories.toLocaleString()} cal</span>
      </div>

      <GradBar pct={pct} className="h-1 mt-2.5" />

      <div className="flex gap-5 mt-2.5">
        {MACRO_DOTS.map(({ key, label, dot: mdot }) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${mdot}`} />
            <span className="text-[12px] font-bold text-stone-700 tabular-nums">{totals[key]}g</span>
            <span className="text-[12px] text-stone-400">{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function DayView({ day }) {
  const { state } = useApp();
  const dayConfig = state.weekConfig[day];
  const dayMeals  = state.mealPlan[day] || {};

  const totals  = getDailyTotals(dayMeals);
  const targets = getDailyTargets(dayConfig.connorTraining, dayConfig.isaTraining, state.settings);

  const orderedMealTypes = MEAL_TYPES.filter(m => dayConfig.meals.includes(m));

  if (orderedMealTypes.length === 0) {
    return (
      <div className="px-5 py-20 text-center">
        <div className="emoji-hero text-5xl mb-4">😴</div>
        <p className="text-stone-500 font-medium text-sm">Rest day — no meals planned</p>
      </div>
    );
  }

  return (
    <div className="px-5 pb-4">
      {/* Person calorie summaries */}
      <div className="space-y-6 pt-4">
        {dayConfig.participants !== 'isa' && (
          <PersonSummary
            person="connor" name="Connor"
            totals={totals.connor} targets={targets.connor}
            training={dayConfig.connorTraining}
          />
        )}
        {dayConfig.participants !== 'connor' && (
          <PersonSummary
            person="isa" name="Isa"
            totals={totals.isa} targets={targets.isa}
            training={dayConfig.isaTraining}
          />
        )}
      </div>

      {/* Meal slots */}
      <div className="mt-10 space-y-8">
        {orderedMealTypes.map(mealType => (
          <MealCard
            key={mealType}
            day={day}
            mealType={mealType}
            recipe={dayMeals[mealType] || null}
          />
        ))}
      </div>
    </div>
  );
}
