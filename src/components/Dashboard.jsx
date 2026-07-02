import { useEffect, useRef } from 'react';
import { useApp, DAYS } from '../context/AppContext';
import DayView from './DayView';
import { GhostCircle } from './ui';
import { attachPinch } from '../utils/pinch';

const DAY_FULL = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
};

function SettingsIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="2.5" />
      <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.7 3.7l1.4 1.4M12.9 12.9l1.4 1.4M3.7 14.3l1.4-1.4M12.9 5.1l1.4-1.4" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="1.5" width="5" height="5" rx="1.5" />
      <rect x="9.5" y="1.5" width="5" height="5" rx="1.5" />
      <rect x="1.5" y="9.5" width="5" height="5" rx="1.5" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1.5" />
    </svg>
  );
}

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const { activeDay } = state;
  const rootRef = useRef(null);

  const hasMeals = (day) => (state.weekConfig[day]?.meals || []).length > 0;

  // Pinch fingers together to zoom out into the Menu catalog
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    return attachPinch(el, {
      onZoomOut: () => dispatch({ type: 'SET_VIEW', view: 'timeline' }),
    });
  }, [dispatch]);

  return (
    <div ref={rootRef} className="min-h-screen pb-36">
      {/* Top row: day strip + settings */}
      <div className="px-5 pt-14 flex items-center justify-between">
        <div className="flex gap-1">
          {DAYS.map(day => {
            const active = activeDay === day;
            const planned = hasMeals(day);
            return (
              <button
                key={day}
                onClick={() => dispatch({ type: 'SET_ACTIVE_DAY', day })}
                className={`w-9 h-9 rounded-full text-[13px] font-display font-semibold transition-all flex items-center justify-center ${
                  active
                    ? 'bg-stone-900 text-[#fbf6f0]'
                    : planned
                    ? 'text-stone-700'
                    : 'text-stone-300'
                }`}
              >
                {DAY_FULL[day][0]}
              </button>
            );
          })}
        </div>
        <div className="flex gap-1.5">
          <GhostCircle onClick={() => dispatch({ type: 'SET_VIEW', view: 'timeline' })} title="View menu catalog">
            <GridIcon />
          </GhostCircle>
          <GhostCircle onClick={() => dispatch({ type: 'SET_VIEW', view: 'settings' })} title="Settings">
            <SettingsIcon />
          </GhostCircle>
        </div>
      </div>

      {/* Editorial header */}
      <div className="px-5 pt-7 pb-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">This week</p>
        <h1 className="font-display text-[44px] font-bold text-stone-900 leading-[1.05] tracking-tight mt-1">
          {DAY_FULL[activeDay]}
        </h1>
      </div>

      <DayView day={activeDay} />
    </div>
  );
}
