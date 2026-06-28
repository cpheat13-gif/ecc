import { useApp } from '../context/AppContext';

function CalendarIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="16" height="15" rx="2.5" />
      <line x1="3" y1="9" x2="19" y2="9" />
      <line x1="7.5" y1="3" x2="7.5" y2="6" />
      <line x1="14.5" y1="3" x2="14.5" y2="6" />
      {active && (
        <>
          <rect x="6.5" y="12" width="3" height="2.5" rx="0.75" fill="currentColor" stroke="none" />
          <rect x="13" y="12" width="3" height="2.5" rx="0.75" fill="currentColor" stroke="none" />
        </>
      )}
    </svg>
  );
}

function CartIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h2.2l2.5 11h9.6l2-7.5H6.8" />
      <circle cx="9" cy="18.5" r="1.5" fill={active ? 'currentColor' : 'none'} />
      <circle cx="16" cy="18.5" r="1.5" fill={active ? 'currentColor' : 'none'} />
    </svg>
  );
}

function StarIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 2.5l2.4 6.2 6.6.6-4.9 4.4 1.4 6.4L11 16.8l-5.5 3.3 1.4-6.4L2 9.3l6.6-.6z" />
    </svg>
  );
}

const TABS = [
  { id: 'dashboard', label: 'Week',     Icon: CalendarIcon },
  { id: 'shopping',  label: 'Shopping', Icon: CartIcon },
  { id: 'log',       label: 'Log',      Icon: StarIcon },
];

export default function BottomNav() {
  const { state, dispatch } = useApp();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="max-w-[430px] mx-auto">
        <div className="bg-white/90 backdrop-blur-xl border-t border-stone-100 px-1 pb-safe-bottom">
          <div className="flex">
            {TABS.map(({ id, label, Icon }) => {
              const active = state.view === id;
              return (
                <button
                  key={id}
                  onClick={() => dispatch({ type: 'SET_VIEW', view: id })}
                  className={`flex-1 flex flex-col items-center gap-1 py-2 transition-colors ${
                    active ? 'text-emerald-700' : 'text-stone-400'
                  }`}
                >
                  <div className={`flex items-center justify-center rounded-2xl px-5 py-1.5 transition-colors ${
                    active ? 'bg-emerald-50' : ''
                  }`}>
                    <Icon active={active} />
                  </div>
                  <span className="text-[10px] font-semibold tracking-wide">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
