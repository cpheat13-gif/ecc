import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { aggregateShoppingList, CATEGORY_ORDER } from '../utils/shopping';

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
    <div className="rounded-2xl bg-white shadow-[0_1px_10px_rgba(0,0,0,0.06)] border border-stone-100/80 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-base">{CATEGORY_ICONS[category] || '📦'}</span>
          <span className="font-semibold text-stone-800 text-sm">{category}</span>
          <span className="text-[10px] font-semibold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {doneCount > 0 && (
            <span className={`text-xs font-medium ${allDone ? 'text-emerald-600' : 'text-stone-400'}`}>
              {doneCount}/{items.length}
            </span>
          )}
          <div className={`w-4 h-4 flex items-center justify-center text-stone-300 transition-transform ${open ? '' : 'rotate-180'}`}>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 5L5 1L9 5" />
            </svg>
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-stone-100">
          {items.map((item, i) => (
            <label
              key={item.key}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                i !== 0 ? 'border-t border-stone-50' : ''
              } ${checked[item.key] ? 'opacity-40' : ''}`}
            >
              <button
                onClick={() => onToggle(item.key)}
                className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  checked[item.key]
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                {checked[item.key] && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 4L3.5 6.5L9 1" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <span className={`text-sm ${checked[item.key] ? 'line-through text-stone-400' : 'text-stone-800 font-medium'}`}>
                  {item.item}
                </span>
                {item.occurrences > 1 && (
                  <span className="ml-1.5 text-xs text-stone-400">×{item.occurrences}</span>
                )}
              </div>
              <span className="shrink-0 text-xs text-stone-400 tabular-nums">
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
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="shrink-0 px-4 pt-12 pb-4 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Shopping List</h1>
          <p className="text-sm text-stone-400 mt-0.5 font-medium">
            {totalItems === 0
              ? 'Generate meals to build your list'
              : `${totalItems} items · ${doneCount} checked`}
          </p>
        </div>
        {doneCount > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-stone-400 hover:text-rose-500 transition-colors font-medium"
          >
            Clear checked
          </button>
        )}
      </div>

      {totalItems === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4 text-2xl">
            🛒
          </div>
          <p className="text-stone-500 font-semibold text-sm">Nothing here yet</p>
          <p className="text-stone-400 text-xs mt-1">Generate meals in the Week view and they'll appear here</p>
        </div>
      ) : (
        <>
          <div className="px-4 mb-4 shrink-0">
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: totalItems ? `${(doneCount / totalItems) * 100}%` : '0%' }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-3">
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
