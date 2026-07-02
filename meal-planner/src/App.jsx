import { useEffect, useRef, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import SetupFlow from './components/SetupFlow';
import Dashboard from './components/Dashboard';
import ShoppingList from './components/ShoppingList';
import LogView from './components/LogView';
import SettingsView from './components/SettingsView';
import RecipesView from './components/RecipesView';
import TimelineView from './components/TimelineView';
import RecipeModal from './components/RecipeModal';
import MealOptionsSheet from './components/MealOptionsSheet';
import BottomNav from './components/BottomNav';
import TransitionVeil from './components/TransitionVeil';

function AppShell() {
  const { state } = useApp();
  const prevView = useRef(state.view);
  const [veilTick, setVeilTick] = useState(0);
  const [zoomClass, setZoomClass] = useState('');

  // Liquid ripple + directional spring when zooming between planner and catalog
  useEffect(() => {
    const from = prevView.current;
    const to = state.view;
    if (from !== to) {
      if (from === 'dashboard' && to === 'timeline') {
        setVeilTick(t => t + 1);
        setZoomClass('view-zoom-out');
      } else if (from === 'timeline' && to === 'dashboard') {
        setVeilTick(t => t + 1);
        setZoomClass('view-zoom-in');
      } else {
        setZoomClass('');
      }
    }
    prevView.current = to;
  }, [state.view]);

  if (!state.setupComplete || state.view === 'setup') {
    return <SetupFlow />;
  }

  const showNav = state.view !== 'settings' && state.view !== 'timeline';

  return (
    <div className="max-w-[430px] mx-auto min-h-screen relative">
      <div key={state.view} className={zoomClass}>
        {state.view === 'dashboard' && <Dashboard />}
        {state.view === 'timeline'  && <TimelineView />}
        {state.view === 'shopping'  && <ShoppingList />}
        {state.view === 'recipes'   && <RecipesView />}
        {state.view === 'log'       && <LogView />}
        {state.view === 'settings'  && <SettingsView />}
      </div>
      {showNav && <BottomNav />}
      {state.selectedMeal && <RecipeModal />}
      {state.optionsSheet && <MealOptionsSheet />}
      <TransitionVeil tick={veilTick} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
