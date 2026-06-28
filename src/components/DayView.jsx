import MacroBar from './MacroBar';
import MealCard from './MealCard';
import { getDailyTotals, getDailyTargets } from '../utils/macros';
import { useApp, MEAL_TYPES } from '../context/AppContext';

function PersonMacros({ name, totals, targets, color }) {
  const isConnor = color === 'sky';
  const chipBg   = isConnor ? 'bg-sky-50'     : 'bg-violet-50';
  const chipText = isConnor ? 'text-sky-600'   : 'text-violet-600';
  const calText  = isConnor ? 'text-sky-700'   : 'text-violet-700';
  const calMuted = isConnor ? 'text-sky-400'   : 'text-violet-400';

  return (
    <div className="flex-1 min-w-0 bg-white rounded-2xl p-3.5 shadow-[0_1px_10px_rgba(0,0,0,0.06)] border border-stone-100/80">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${chipBg} ${chipText}`}>
          {name}
        </span>
        <span className={`text-xs font-bold tabular-nums ${calText}`}>
          {totals.calories}
          <span className={`text-[10px] font-normal ${calMuted}`}> / {targets.calories}</span>
        </span>
      </div>
      <div className="space-y-2">
        <MacroBar label="Protein" current={totals.protein} target={targets.protein} color={isConnor ? 'sky' : 'amber'} />
        <MacroBar label="Carbs"   current={totals.carbs}   target={targets.carbs}   color="emerald" />
        <MacroBar label="Fat"     current={totals.fat}     target={targets.fat}     color="rose" />
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
      <div className="px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-3 text-2xl">
          😴
        </div>
        <div className="text-stone-400 text-sm font-medium">Rest day — no meals planned</div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-8 space-y-4">
      <div className="flex gap-2 pt-2 flex-wrap">
        {dayConfig.participants !== 'isa' && (
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
            dayConfig.connorTraining ? 'bg-sky-50 text-sky-600' : 'bg-stone-100 text-stone-500'
          }`}>
            Connor: {dayConfig.connorTraining ? 'Training' : 'Rest'}
          </span>
        )}
        {dayConfig.participants !== 'connor' && (
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
            dayConfig.isaTraining ? 'bg-violet-50 text-violet-600' : 'bg-stone-100 text-stone-500'
          }`}>
            Isa: {dayConfig.isaTraining ? 'Training' : 'Rest'}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        {dayConfig.participants !== 'isa' && (
          <PersonMacros name="Connor" totals={totals.connor} targets={targets.connor} color="sky" />
        )}
        {dayConfig.participants !== 'connor' && (
          <PersonMacros name="Isa" totals={totals.isa} targets={targets.isa} color="purple" />
        )}
      </div>

      <div className="space-y-3">
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
