export const PROFILES = {
  connor: {
    name: 'Connor',
    training: { calories: 2750, protein: 170, carbs: 310, fat: 92 },
    rest:     { calories: 2450, protein: 170, carbs: 265, fat: 79 },
  },
  isa: {
    name: 'Isa',
    training: { calories: 1700, protein: 80, carbs: 190, fat: 69 },
    rest:     { calories: 1500, protein: 80, carbs: 162, fat: 59 },
  },
};

const MEAL_RATIOS = {
  breakfast: { calories: 0.25, protein: 0.25, carbs: 0.30, fat: 0.25 },
  lunch:     { calories: 0.25, protein: 0.25, carbs: 0.25, fat: 0.25 },
  dinner:    { calories: 0.35, protein: 0.38, carbs: 0.30, fat: 0.38 },
  snack:     { calories: 0.15, protein: 0.12, carbs: 0.15, fat: 0.12 },
};

export function getMealTargets(mealType, connorTraining, isaTraining) {
  const connorDaily = PROFILES.connor[connorTraining ? 'training' : 'rest'];
  const isaDaily    = PROFILES.isa[isaTraining ? 'training' : 'rest'];
  const ratio = MEAL_RATIOS[mealType] || MEAL_RATIOS.dinner;
  return {
    connor: {
      calories: Math.round(connorDaily.calories * ratio.calories),
      protein:  Math.round(connorDaily.protein  * ratio.protein),
      carbs:    Math.round(connorDaily.carbs    * ratio.carbs),
      fat:      Math.round(connorDaily.fat      * ratio.fat),
    },
    isa: {
      calories: Math.round(isaDaily.calories * ratio.calories),
      protein:  Math.round(isaDaily.protein  * ratio.protein),
      carbs:    Math.round(isaDaily.carbs    * ratio.carbs),
      fat:      Math.round(isaDaily.fat      * ratio.fat),
    },
  };
}

export function getDailyTargets(connorTraining, isaTraining) {
  return {
    connor: PROFILES.connor[connorTraining ? 'training' : 'rest'],
    isa:    PROFILES.isa[isaTraining ? 'training' : 'rest'],
  };
}

export function getDailyTotals(dayMeals) {
  const totals = {
    connor: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    isa:    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  };
  if (!dayMeals) return totals;
  Object.values(dayMeals).forEach(meal => {
    if (!meal?.macros) return;
    ['connor', 'isa'].forEach(person => {
      ['calories', 'protein', 'carbs', 'fat'].forEach(macro => {
        totals[person][macro] += meal.macros[person]?.[macro] || 0;
      });
    });
  });
  return totals;
}
