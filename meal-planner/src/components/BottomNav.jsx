import { useApp } from '../context/AppContext';

const TABS = [
  { id: 'dashboard', label: 'Week',     icon: '📅' },
  { id: 'shopping',  label: 'Shopping', icon: '🛒' },
];

export default function BottomNav() {
  const { state, dispatch } = useApp();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="max-w-[430px] mx-auto">
        <div className="bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-4 pb-safe-bottom">
          <div className="flex">
            {TABS.map(tab => {
              const active = state.view === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => dispatch({ type: 'SET_VIEW', view: tab.id })}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                    active ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span className="text-xl leading-none">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {active && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
