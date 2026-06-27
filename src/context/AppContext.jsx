import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { SEED_DINNERS } from '../data/seedData';

export const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
export const DAY_LABELS = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};
export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

const DEFAULT_WEEK_CONFIG = {
  monday:    { meals: ['dinner'], connorTraining: true,  isaTraining: true  },
  tuesday:   { meals: ['dinner'], connorTraining: true,  isaTraining: true  },
  wednesday: { meals: ['dinner'], connorTraining: true,  isaTraining: false },
  thursday:  { meals: ['dinner'], connorTraining: true,  isaTraining: true  },
  friday:    { meals: ['dinner'], connorTraining: true,  isaTraining: false },
  saturday:  { meals: [],         connorTraining: false, isaTraining: false },
  sunday:    { meals: [],         connorTraining: false, isaTraining: false },
};

function buildMealPlan(weekConfig) {
  const plan = {};
  DAYS.forEach(day => {
    plan[day] = {};
    (weekConfig[day]?.meals || []).forEach(mealType => {
      if (mealType === 'dinner' && SEED_DINNERS[day]) {
        plan[day][mealType] = SEED_DINNERS[day];
      } else {
        plan[day][mealType] = null;
      }
    });
  });
  return plan;
}

const INITIAL_STATE = {
  setupComplete: false,
  view: 'setup',
  activeDay: 'monday',
  weekConfig: DEFAULT_WEEK_CONFIG,
  mealPlan: {},
  selectedMeal: null,
  generatingMeal: null,
  shoppingChecked: {},
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
  const [state, dispatch] = useReducer(reducer, saved || INITIAL_STATE);

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
