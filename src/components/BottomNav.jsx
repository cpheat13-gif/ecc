import { useApp } from '../context/AppContext';

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="16" height="15" rx="2.5" />
      <line x1="3" y1="9" x2="19" y2="9" />
      <line x1="7.5" y1="3" x2="7.5" y2="6" />
      <line x1="14.5" y1="3" x2="14.5" y2="6" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h2.2l2.5 11h9.6l2-7.5H6.8" />
      <circle cx="9" cy="18.5" r="1.5" />
      <circle cx="16" cy="18.5" r="1.5" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 2.5l2.4 6.2 6.6.6-4.9 4.4 1.4 6.4L11 16.8l-5.5 3.3 1.4-6.4L2 9.3l6.6-.6z" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 3h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <line x1="2" y1="8" x2="17" y2="8" />
      <line x1="6" y1="3" x2="6" y2="8" />
    </svg>
  );
}

const TABS = [
  { id: 'dashboard', label: 'Week',     Icon: CalendarIcon },
  { id: 'shopping',  label: 'Shopping', Icon: CartIcon },
  { id: 'recipes',   label: 'Recipes',  Icon: BookIcon },
  { id: 'log',       label: 'Log',      Icon: StarIcon },
];

export default function BottomNav() {
  const { state, dispatch } = useApp();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="max-w-[430px] mx-auto px-5 pb-5 pb-safe-bottom">
        <div className="pointer-events-auto flex gap-1 p-1.5 rounded-full bg-white/75 backdrop-blur-2xl border border-stone-900/[0.06] shadow-[0_14px_40px_rgba(80,40,16,0.16)]">
          {TABS.map(({ id, label, Icon }) => {
            const active = state.view === id;
            return (
              <button
                key={id}
                onClick={() => dispatch({ type: 'SET_VIEW', view: id })}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-full transition-all ${
                  active ? 'bg-stone-900 text-[#fbf6f0]' : 'text-stone-400'
                }`}
              >
                <Icon />
                <span className="text-[9px] font-semibold tracking-wide">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
