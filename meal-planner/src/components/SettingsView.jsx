import { useState } from 'react';
import { useApp } from '../context/AppContext';

const MACROS = ['calories', 'protein', 'carbs', 'fat'];
const MACRO_LABELS = { calories: 'Calories', protein: 'Protein', carbs: 'Carbs', fat: 'Fat' };
const MACRO_UNITS = { calories: 'kcal', protein: 'g', carbs: 'g', fat: 'g' };

function PersonCard({ person, label, color, values, onChange }) {
  const chipCls = color === 'blue'
    ? 'text-blue-600 bg-blue-50'
    : 'text-violet-600 bg-violet-50';

  const inputCls = 'w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 text-right focus:outline-none focus:border-emerald-500 transition-colors';

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-3 flex items-center gap-2 border-b border-stone-100">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${chipCls}`}>{label}</span>
      </div>

      {['training', 'rest'].map(dayType => (
        <div key={dayType} className="px-4 py-4 border-b border-stone-50 last:border-0">
          <div className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
            dayType === 'training' ? (color === 'blue' ? 'text-blue-500' : 'text-violet-500') : 'text-stone-400'
          }`}>
            {dayType === 'training' ? '💪 Training day' : '🛋 Rest day'}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {MACROS.map(macro => (
              <div key={macro}>
                <label className="text-[10px] text-stone-400 font-medium uppercase tracking-wide block mb-1">
                  {MACRO_LABELS[macro]} ({MACRO_UNITS[macro]})
                </label>
                <input
                  type="number"
                  min="0"
                  value={values[dayType][macro]}
                  onChange={e => onChange(person, dayType, macro, Number(e.target.value))}
                  className={inputCls}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SettingsView() {
  const { state, dispatch } = useApp();
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(state.settings)));
  const [saved, setSaved] = useState(false);

  const handleChange = (person, dayType, macro, value) => {
    setDraft(prev => ({
      ...prev,
      [person]: {
        ...prev[person],
        [dayType]: { ...prev[person][dayType], [macro]: value },
      },
    }));
    setSaved(false);
  };

  const handleSave = () => {
    dispatch({ type: 'UPDATE_SETTINGS', settings: draft });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm('Reset all settings to defaults?')) {
      const defaults = {
        connor: {
          training: { calories: 2750, protein: 170, carbs: 310, fat: 92 },
          rest:     { calories: 2450, protein: 170, carbs: 265, fat: 79 },
        },
        isa: {
          training: { calories: 1700, protein: 80, carbs: 190, fat: 69 },
          rest:     { calories: 1500, protein: 80, carbs: 162, fat: 59 },
        },
      };
      setDraft(defaults);
      dispatch({ type: 'UPDATE_SETTINGS', settings: defaults });
    }
  };

  const handleReconfigure = () => {
    if (confirm('This will clear your current meal plan and restart setup. Continue?')) {
      dispatch({ type: 'RESET' });
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-28">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', view: 'dashboard' })}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
        >
          ←
        </button>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Settings</h1>
          <p className="text-xs text-stone-400 mt-0.5">Macro targets · used when generating meals</p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <PersonCard
          person="connor"
          label="Connor"
          color="blue"
          values={draft.connor}
          onChange={handleChange}
        />
        <PersonCard
          person="isa"
          label="Isa"
          color="violet"
          values={draft.isa}
          onChange={handleChange}
        />

        {/* Save */}
        <button
          onClick={handleSave}
          className={`w-full py-4 rounded-2xl font-semibold text-base transition-all shadow-sm ${
            saved
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-emerald-600 text-white active:scale-95'
          }`}
        >
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>

        {/* Divider */}
        <div className="border-t border-stone-200 pt-2">
          <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold mb-3 px-1">Meal plan</p>
          <div className="space-y-2">
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', view: 'setup' })}
              className="w-full py-3 text-sm font-medium text-stone-700 bg-white border border-stone-200 rounded-2xl shadow-sm"
            >
              ↻ Reconfigure week schedule
            </button>
            <button
              onClick={handleReconfigure}
              className="w-full py-3 text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors"
            >
              Reset everything
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
