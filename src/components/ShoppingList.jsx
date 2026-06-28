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

  return (
    <div className="rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span>{CATEGORY_ICONS[category] || '📦'}</span>
          <span className="font-semibold text-slate-200 text-sm">{category}</span>
          <span className="text-xs text-slate-500 bg-slate-700 px-1.5 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {doneCount > 0 && (
            <span className="text-xs text-emerald-400">{doneCount}/{items.length}</span>
          )}
          <span className="text-slate-500 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-700">
          {items.map((item, i) => (
            <label
              key={item.key}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                i !== 0 ? 'border-t border-slate-700/50' : ''
              } ${checked[item.key] ? 'opacity-50' : ''}`}
            >
              <div
                onClick={() => onToggle(item.key)}
                className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  checked[item.key]
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-slate-600'
                }`}
              >
                {checked[item.key] && <span className="text-white text-xs">✓</span>}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-sm ${checked[item.key] ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                  {item.item}
                </span>
                {item.occurrences > 1 && (
                  <span className="ml-1.5 text-xs text-slate-500">×{item.occurrences} meals</span>
                )}
              </div>
              <span className="shrink-0 text-xs text-slate-500">
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
      {/* Header */}
      <div className="shrink-0 px-4 pt-12 pb-4 flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Shopping List</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {totalItems === 0
              ? 'Generate meals to build your list'
              : `${totalItems} items · ${doneCount} checked`}
          </p>
        </div>
        {doneCount > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-slate-500 hover:text-rose-400 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {totalItems === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="text-5xl mb-4">🛒</div>
          <p className="text-slate-400">Generate meals in the Week view and they'll appear here.</p>
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div className="px-4 mb-4 shrink-0">
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
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
