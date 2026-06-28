import { useRef, useEffect } from 'react';
import { useApp, DAYS, DAY_LABELS } from '../context/AppContext';
import DayView from './DayView';

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
      {/* Top bar */}
      <div className="shrink-0 px-4 pt-12 pb-2 flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-900">This Week</h1>
        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className="text-xs text-stone-500 hover:text-stone-700 transition-colors px-3 py-1.5 rounded-lg bg-stone-100"
        >
          ⚙ Reconfigure
        </button>
      </div>

      {/* Day tabs */}
      <div
        ref={tabsRef}
        className="shrink-0 flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide"
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
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : hasContent
                  ? 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  : 'bg-stone-100/60 text-stone-400'
              }`}
            >
              {DAY_LABELS[day]}
              {hasContent && !active && (
                <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 align-middle" />
              )}
            </button>
          );
        })}
      </div>

      {/* Day content */}
      <div className="flex-1 overflow-y-auto">
        <DayView day={activeDay} />
      </div>
    </div>
  );
}
