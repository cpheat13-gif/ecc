import { useState } from 'react';
import { useApp } from '../context/AppContext';

const MACROS = ['calories', 'protein', 'carbs', 'fat'];
const MACRO_LABELS = { calories: 'Calories', protein: 'Protein', carbs: 'Carbs', fat: 'Fat' };
const MACRO_UNITS  = { calories: 'kcal', protein: 'g', carbs: 'g', fat: 'g' };

function PersonCard({ person, label, color, values, onChange }) {
  const chipCls   = color === 'sky' ? 'text-sky-600 bg-sky-50' : 'text-violet-600 bg-violet-50';
  const accentCls = color === 'sky' ? 'text-sky-500'           : 'text-violet-500';

  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_10px_rgba(0,0,0,0.06)] border border-stone-100/80 overflow-hidden">
      <div className="px-4 pt-4 pb-3 flex items-center gap-2 border-b border-stone-100">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${chipCls}`}>{label}</span>
      </div>

      {['training', 'rest'].map(dayType => (
        <div key={dayType} className="px-4 py-4 border-b border-stone-50 last:border-0">
          <div className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${
            dayType === 'training' ? accentCls : 'text-stone-400'
          }`}>
            {dayType === 'training' ? 'Training day' : 'Rest day'}
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
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 text-right focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DataBackup() {
  const { state, dispatch } = useApp();
  const [importError, setImportError] = useState(null);
  const [importOk, setImportOk]       = useState(false);

  const handleExport = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      customRecipes: state.customRecipes || [],
      starredMeals: state.starredMeals || {},
      mealPlan: state.mealPlan || {},
      weekConfig: state.weekConfig || {},
      settings: state.settings || {},
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `meal-planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.version || !data.customRecipes) throw new Error('Unrecognised backup file');
        if (data.customRecipes)  dispatch({ type: 'RESTORE_CUSTOM_RECIPES',  recipes:  data.customRecipes });
        if (data.starredMeals)   dispatch({ type: 'RESTORE_STARRED_MEALS',   meals:    data.starredMeals });
        if (data.mealPlan)       dispatch({ type: 'RESTORE_MEAL_PLAN',       plan:     data.mealPlan });
        if (data.weekConfig)     dispatch({ type: 'RESTORE_WEEK_CONFIG',     config:   data.weekConfig });
        if (data.settings)       dispatch({ type: 'UPDATE_SETTINGS',         settings: data.settings });
        setImportOk(true);
        setTimeout(() => setImportOk(false), 3000);
      } catch (err) {
        setImportError(err.message || 'Could not read file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="border-t border-stone-100 pt-2">
      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-3 px-1">Data backup</p>
      <div className="space-y-2">
        <button
          onClick={handleExport}
          className="w-full py-3 text-sm font-medium text-stone-700 bg-white border border-stone-100 rounded-2xl shadow-[0_1px_6px_rgba(0,0,0,0.05)] flex items-center justify-center gap-2"
        >
          <span>↓</span> Export all data
        </button>
        <label className={`w-full py-3 text-sm font-medium rounded-2xl border flex items-center justify-center gap-2 cursor-pointer transition-colors ${
          importOk
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-white border-stone-100 text-stone-700 shadow-[0_1px_6px_rgba(0,0,0,0.05)]'
        }`}>
          <span>{importOk ? '✓' : '↑'}</span>
          {importOk ? 'Imported!' : 'Import from backup'}
          <input type="file" accept=".json" className="sr-only" onChange={handleImport} />
        </label>
        {importError && (
          <p className="text-xs text-red-500 px-1">{importError}</p>
        )}
      </div>
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
      [person]: { ...prev[person], [dayType]: { ...prev[person][dayType], [macro]: value } },
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

  return (
    <div className="min-h-screen bg-stone-50 pb-28">
      <div className="px-4 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', view: 'dashboard' })}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors text-lg"
        >
          ←
        </button>
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Settings</h1>
          <p className="text-xs text-stone-400 mt-0.5">Macro targets — used when generating meals</p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <PersonCard person="connor" label="Connor" color="sky"    values={draft.connor} onChange={handleChange} />
        <PersonCard person="isa"    label="Isa"    color="violet" values={draft.isa}    onChange={handleChange} />

        <button
          onClick={handleSave}
          className={`w-full py-4 rounded-2xl font-semibold text-base transition-all shadow-sm ${
            saved
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-emerald-600 text-white active:scale-95'
          }`}
        >
          {saved ? '✓ Saved' : 'Save Changes'}
        </button>

        <div className="border-t border-stone-100 pt-2">
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-3 px-1">Meal plan</p>
          <div className="space-y-2">
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', view: 'setup' })}
              className="w-full py-3 text-sm font-medium text-stone-700 bg-white border border-stone-100 rounded-2xl shadow-[0_1px_6px_rgba(0,0,0,0.05)]"
            >
              ↻ Reconfigure week schedule
            </button>
            <button
              onClick={handleReset}
              className="w-full py-3 text-sm font-medium text-rose-400 hover:text-rose-600 transition-colors"
            >
              Reset to defaults
            </button>
          </div>
        </div>

        <DataBackup />
      </div>
    </div>
  );
}
