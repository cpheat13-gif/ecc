import { AppProvider, useApp } from './context/AppContext';
import SetupFlow from './components/SetupFlow';
import Dashboard from './components/Dashboard';
import ShoppingList from './components/ShoppingList';
import RecipeModal from './components/RecipeModal';
import MealOptionsSheet from './components/MealOptionsSheet';
import BottomNav from './components/BottomNav';

function AppShell() {
  const { state } = useApp();

  if (!state.setupComplete || state.view === 'setup') {
    return <SetupFlow />;
  }

  return (
    <div className="max-w-[430px] mx-auto min-h-screen relative">
      {state.view === 'dashboard' && <Dashboard />}
      {state.view === 'shopping'  && <ShoppingList />}
      <BottomNav />
      {state.selectedMeal && <RecipeModal />}
      {state.optionsSheet && <MealOptionsSheet />}
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
