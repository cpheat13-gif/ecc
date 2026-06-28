import MacroBar from './MacroBar';
import MealCard from './MealCard';
import { getDailyTotals, getDailyTargets } from '../utils/macros';
import { useApp, MEAL_TYPES } from '../context/AppContext';

function PersonMacros({ name, totals, targets, color }) {
  const chipColor = color === 'sky'
    ? 'text-blue-600 bg-blue-50'
    : 'text-violet-600 bg-violet-50';

  return (
    <div className="flex-1 min-w-0 bg-white border border-stone-200 rounded-2xl p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${chipColor}`}>{name}</span>
        <span className="text-xs text-stone-500">
          {totals.calories} <span className="text-stone-400">/ {targets.calories} kcal</span>
        </span>
      </div>
      <div className="space-y-2">
        <MacroBar label="Protein"  current={totals.protein}  target={targets.protein}  color={color === 'sky' ? 'sky' : 'amber'} />
        <MacroBar label="Carbs"    current={totals.carbs}    target={targets.carbs}    color="emerald" />
        <MacroBar label="Fat"      current={totals.fat}      target={targets.fat}      color="rose" />
      </div>
    </div>
  );
}

export default function DayView({ day }) {
  const { state } = useApp();
  const dayConfig = state.weekConfig[day];
  const dayMeals  = state.mealPlan[day] || {};

  const totals  = getDailyTotals(dayMeals);
  const targets = getDailyTargets(dayConfig.connorTraining, dayConfig.isaTraining);

  const orderedMealTypes = MEAL_TYPES.filter(m => dayConfig.meals.includes(m));

  if (orderedMealTypes.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <div className="text-4xl mb-3">😴</div>
        <div className="text-stone-400 text-sm">No meals planned for this day</div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-8 space-y-4">
      {/* Training badges */}
      <div className="flex gap-2 pt-1 flex-wrap">
        {dayConfig.participants !== 'isa' && (
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            dayConfig.connorTraining ? 'bg-blue-50 text-blue-600' : 'bg-stone-100 text-stone-500'
          }`}>
            Connor: {dayConfig.connorTraining ? '💪 Training' : '🛌 Rest'}
          </span>
        )}
        {dayConfig.participants !== 'connor' && (
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            dayConfig.isaTraining ? 'bg-violet-50 text-violet-600' : 'bg-stone-100 text-stone-500'
          }`}>
            Isa: {dayConfig.isaTraining ? '💪 Training' : '🛌 Rest'}
          </span>
        )}
      </div>

      {/* Macro summaries */}
      <div className="flex gap-2">
        {dayConfig.participants !== 'isa' && (
          <PersonMacros
            name="Connor"
            totals={totals.connor}
            targets={targets.connor}
            color="sky"
          />
        )}
        {dayConfig.participants !== 'connor' && (
          <PersonMacros
            name="Isa"
            totals={totals.isa}
            targets={targets.isa}
            color="purple"
          />
        )}
      </div>

      {/* Meal slots */}
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
