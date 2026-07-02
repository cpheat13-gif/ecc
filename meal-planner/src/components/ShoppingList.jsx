import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { aggregateShoppingList, CATEGORY_ORDER } from '../utils/shopping';
import { GradBar } from './ui';

const CATEGORY_ICONS = {
  'Proteins':        '🥩',
  'Produce':         '🥦',
  'Dairy':           '🥚',
  'Pantry':          '🫙',
  'Canned & Jarred': '🥫',
  'Spices':          '🧂',
  'Other':           '📦',
};

function CategorySection({ category, items, checked, onToggle }) {
  const [open, setOpen] = useState(true);
  const doneCount = items.filter(i => checked[i.key]).length;
  const allDone   = doneCount === items.length;

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-2 text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="emoji-hero text-xl">{CATEGORY_ICONS[category] || '📦'}</span>
          <span className="font-display font-semibold text-stone-900 text-base">{category}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold tabular-nums ${allDone ? 'text-grad' : 'text-stone-400'}`}>
            {doneCount}/{items.length}
          </span>
          <span className={`text-stone-300 transition-transform ${open ? '' : 'rotate-180'}`}>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 5L5 1L9 5" />
            </svg>
          </span>
        </div>
      </button>

      {open && (
        <div>
          {items.map((item) => (
            <label
              key={item.key}
              className={`flex items-center gap-3.5 py-3 cursor-pointer border-b border-stone-900/[0.05] transition-opacity ${
                checked[item.key] ? 'opacity-35' : ''
              }`}
            >
              <button
                onClick={() => onToggle(item.key)}
                className={`shrink-0 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-all ${
                  checked[item.key]
                    ? 'bg-stone-900 border-stone-900'
                    : 'border-stone-300'
                }`}
              >
                {checked[item.key] && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="#fbf6f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 4L3.5 6.5L9 1" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <span className={`text-[15px] ${checked[item.key] ? 'line-through text-stone-400' : 'text-stone-800 font-medium'}`}>
                  {item.item}
                </span>
                {item.occurrences > 1 && (
                  <span className="ml-1.5 text-xs text-stone-400">×{item.occurrences}</span>
                )}
              </div>
              <span className="shrink-0 text-[13px] text-stone-400 tabular-nums">
                {item.quantity} {item.unit}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShoppingList() {
  const { state, dispatch } = useApp();
  const grouped = aggregateShoppingList(state.mealPlan);

  const totalItems  = CATEGORY_ORDER.reduce((n, c) => n + (grouped[c]?.length || 0), 0);
  const checkedKeys = state.shoppingChecked;
  const doneCount   = Object.values(checkedKeys).filter(Boolean).length;

  const handleToggle = (key) => dispatch({ type: 'TOGGLE_SHOPPING', key });
  const handleClear  = () => dispatch({ type: 'CLEAR_SHOPPING' });

  const activeCats = CATEGORY_ORDER.filter(c => grouped[c]?.length > 0);

  return (
    <div className="min-h-screen pb-36">
      <div className="px-5 pt-14 pb-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">This week's list</p>
        <div className="flex items-end justify-between">
          <h1 className="font-display text-[44px] font-bold text-stone-900 leading-[1.05] tracking-tight mt-1">
            Shopping
          </h1>
          {doneCount > 0 && (
            <button
              onClick={handleClear}
              className="text-xs text-stone-400 active:text-red-500 transition-colors font-medium pb-3"
            >
              Clear checked
            </button>
          )}
        </div>
        {totalItems > 0 && (
          <p className="text-sm text-stone-400 font-medium">
            <span className="font-display font-bold text-grad tabular-nums text-base">{doneCount}</span>
            {' '}of {totalItems} items
          </p>
        )}
      </div>

      {totalItems === 0 ? (
        <div className="flex flex-col items-center justify-center text-center px-8 pt-24">
          <div className="emoji-hero text-5xl mb-5">🛒</div>
          <p className="text-stone-600 font-semibold text-sm">Nothing here yet</p>
          <p className="text-stone-400 text-xs mt-1">Plan meals in the Week view and they'll appear here</p>
        </div>
      ) : (
        <>
          <div className="px-5 mt-2 mb-6">
            <GradBar pct={totalItems ? (doneCount / totalItems) * 100 : 0} className="h-1" />
          </div>

          <div className="px-5 space-y-7">
            {activeCats.map(cat => (
              <CategorySection
                key={cat}
                category={cat}
                items={grouped[cat]}
                checked={checkedKeys}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
