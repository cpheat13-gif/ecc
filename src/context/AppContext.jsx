import React, { createContext, useContext, useReducer, useEffect } from 'react';

export const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
export const DAY_LABELS = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};
export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

const DEFAULT_WEEK_CONFIG = {
  monday:    { participants: 'both', meals: ['dinner'], connorTraining: true,  isaTraining: true  },
  tuesday:   { participants: 'both', meals: ['dinner'], connorTraining: true,  isaTraining: true  },
  wednesday: { participants: 'both', meals: ['dinner'], connorTraining: true,  isaTraining: false },
  thursday:  { participants: 'both', meals: ['dinner'], connorTraining: true,  isaTraining: true  },
  friday:    { participants: 'both', meals: ['dinner'], connorTraining: true,  isaTraining: false },
  saturday:  { participants: 'both', meals: [],         connorTraining: false, isaTraining: false },
  sunday:    { participants: 'both', meals: [],         connorTraining: false, isaTraining: false },
};

function buildMealPlan(weekConfig) {
  const plan = {};
  DAYS.forEach(day => {
    plan[day] = {};
    (weekConfig[day]?.meals || []).forEach(mealType => {
      plan[day][mealType] = null;
    });
  });
  return plan;
}

const DEFAULT_SETTINGS = {
  connor: {
    training: { calories: 2750, protein: 170, carbs: 310, fat: 92 },
    rest:     { calories: 2450, protein: 170, carbs: 265, fat: 79 },
  },
  isa: {
    training: { calories: 1700, protein: 80, carbs: 190, fat: 69 },
    rest:     { calories: 1500, protein: 80, carbs: 162, fat: 59 },
  },
};

const INITIAL_STATE = {
  setupComplete: false,
  view: 'setup',
  activeDay: 'monday',
  weekConfig: DEFAULT_WEEK_CONFIG,
  mealPlan: {},
  selectedMeal: null,
  generatingMeal: null,
  optionsSheet: null,
  shoppingChecked: {},
  starredMeals: {},
  settings: DEFAULT_SETTINGS,
  customRecipes: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'COMPLETE_SETUP': {
      const mealPlan = buildMealPlan(action.weekConfig);
      return {
        ...state,
        weekConfig: action.weekConfig,
        mealPlan,
        setupComplete: true,
        view: 'dashboard',
        activeDay: 'monday',
      };
    }

    case 'SET_MEAL':
      return {
        ...state,
        mealPlan: {
          ...state.mealPlan,
          [action.day]: {
            ...state.mealPlan[action.day],
            [action.mealType]: action.recipe,
          },
        },
        generatingMeal: null,
      };

    case 'SET_GENERATING':
      return { ...state, generatingMeal: action.value };

    case 'SET_VIEW':
      return { ...state, view: action.view, selectedMeal: null };

    case 'SET_ACTIVE_DAY':
      return { ...state, activeDay: action.day };

    case 'OPEN_RECIPE':
      return { ...state, selectedMeal: action.meal };

    case 'CLOSE_RECIPE':
      return { ...state, selectedMeal: null };

    case 'OPEN_OPTIONS':
      return { ...state, optionsSheet: { day: action.day, mealType: action.mealType } };

    case 'CLOSE_OPTIONS':
      return { ...state, optionsSheet: null };

    case 'STAR_MEAL': {
      const key = `${action.day}-${action.mealType}`;
      return {
        ...state,
        starredMeals: {
          ...state.starredMeals,
          [key]: { recipe: action.recipe, day: action.day, mealType: action.mealType, starredAt: Date.now() },
        },
      };
    }

    case 'UNSTAR_MEAL': {
      const next = { ...state.starredMeals };
      delete next[`${action.day}-${action.mealType}`];
      return { ...state, starredMeals: next };
    }

    case 'CLEAR_LOG':
      return { ...state, starredMeals: {} };

    case 'TOGGLE_SHOPPING':
      return {
        ...state,
        shoppingChecked: {
          ...state.shoppingChecked,
          [action.key]: !state.shoppingChecked[action.key],
        },
      };

    case 'CLEAR_SHOPPING':
      return { ...state, shoppingChecked: {} };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.settings };

    case 'ADD_CUSTOM_RECIPE': {
      const recipe = { ...action.recipe, id: Date.now(), savedAt: Date.now() };
      return { ...state, customRecipes: [recipe, ...(state.customRecipes || [])] };
    }

    case 'DELETE_CUSTOM_RECIPE':
      return { ...state, customRecipes: (state.customRecipes || []).filter(r => r.id !== action.id) };

    case 'RESET':
      return { ...INITIAL_STATE };

    default:
      return state;
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem('mealPlannerV1');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const saved = loadState();
  const [state, dispatch] = useReducer(reducer, saved ? { ...INITIAL_STATE, ...saved } : INITIAL_STATE);

  useEffect(() => {
    try {
      localStorage.setItem('mealPlannerV1', JSON.stringify(state));
    } catch {}
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
