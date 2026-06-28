import { useRef, useEffect } from 'react';
import { useApp, DAYS, DAY_LABELS } from '../context/AppContext';
import DayView from './DayView';

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="2.5" />
      <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.7 3.7l1.4 1.4M12.9 12.9l1.4 1.4M3.7 14.3l1.4-1.4M12.9 5.1l1.4-1.4" />
    </svg>
  );
}

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const { activeDay } = state;
  const tabsRef = useRef(null);

  const hasMeals = (day) => (state.weekConfig[day]?.meals || []).length > 0;

  useEffect(() => {
    if (!tabsRef.current) return;
    const activeTab = tabsRef.current.querySelector('[data-active="true"]');
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [activeDay]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="shrink-0 px-4 pt-12 pb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">This Week</h1>
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', view: 'settings' })}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors"
        >
          <SettingsIcon />
        </button>
      </div>

      <div
        ref={tabsRef}
        className="shrink-0 flex gap-1.5 overflow-x-auto px-4 pb-3"
        style={{ scrollbarWidth: 'none' }}
      >
        {DAYS.map(day => {
          const active = activeDay === day;
          const hasContent = hasMeals(day);
          return (
            <button
              key={day}
              data-active={active}
              onClick={() => dispatch({ type: 'SET_ACTIVE_DAY', day })}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/20'
                  : hasContent
                  ? 'bg-stone-100 text-stone-700'
                  : 'bg-stone-100/60 text-stone-400'
              }`}
            >
              {DAY_LABELS[day]}
              {hasContent && !active && (
                <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 align-middle" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto">
        <DayView day={activeDay} />
      </div>
    </div>
  );
}
