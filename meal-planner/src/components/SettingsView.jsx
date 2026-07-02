import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GhostCircle, InkPill } from './ui';

const MACROS = ['calories', 'protein', 'carbs', 'fat'];
const MACRO_LABELS = { calories: 'Calories', protein: 'Protein', carbs: 'Carbs', fat: 'Fat' };
const MACRO_UNITS  = { calories: 'kcal', protein: 'g', carbs: 'g', fat: 'g' };

const PERSON_DOT = { connor: 'bg-sky-500', isa: 'bg-violet-500' };

function PersonTargets({ person, label, values, onChange }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-4">
        <span className={`w-1.5 h-1.5 rounded-full ${PERSON_DOT[person]}`} />
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">{label}</span>
      </div>

      {['training', 'rest'].map(dayType => (
        <div key={dayType} className="mb-5 last:mb-0">
          <p className="text-[11px] font-semibold text-stone-400 mb-2.5">
            {dayType === 'training' ? 'Training day' : 'Rest day'}
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {MACROS.map(macro => (
              <div key={macro}>
                <label className="text-[10px] text-stone-400 font-medium uppercase tracking-wide block mb-1.5">
                  {MACRO_LABELS[macro]} ({MACRO_UNITS[macro]})
                </label>
                <input
                  type="number"
                  min="0"
                  value={values[dayType][macro]}
                  onChange={e => onChange(person, dayType, macro, Number(e.target.value))}
                  className="w-full bg-white/80 border border-stone-900/[0.07] rounded-2xl px-4 py-3 text-sm text-stone-900 text-right tabular-nums focus:outline-none focus:border-stone-900/25 transition-colors"
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
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-400 mb-3">Data backup</p>
      <div className="space-y-2.5">
        <button
          onClick={handleExport}
          className="w-full py-3.5 text-sm font-semibold text-stone-700 border border-stone-900/10 rounded-full active:bg-stone-900/5 transition-colors flex items-center justify-center gap-2"
        >
          ↓ Export all data
        </button>
        <label className={`w-full py-3.5 text-sm font-semibold rounded-full border flex items-center justify-center gap-2 cursor-pointer transition-colors ${
          importOk
            ? 'border-stone-900 text-stone-900'
            : 'border-stone-900/10 text-stone-700 active:bg-stone-900/5'
        }`}>
          {importOk ? '✓ Imported!' : '↑ Import from backup'}
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
    <div className="min-h-screen pb-16">
      <div className="px-5 pt-14 pb-2 flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">Macro targets</p>
          <h1 className="font-display text-[44px] font-bold text-stone-900 leading-[1.05] tracking-tight mt-1">
            Settings
          </h1>
        </div>
        <GhostCircle onClick={() => dispatch({ type: 'SET_VIEW', view: 'dashboard' })} className="mt-2">
          ✕
        </GhostCircle>
      </div>

      <div className="px-5 pt-6 space-y-10">
        <PersonTargets person="connor" label="Connor" values={draft.connor} onChange={handleChange} />
        <PersonTargets person="isa"    label="Isa"    values={draft.isa}    onChange={handleChange} />

        <InkPill onClick={handleSave} className="w-full py-4 text-base">
          {saved ? '✓ Saved' : 'Save changes'}
        </InkPill>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-400 mb-3">Meal plan</p>
          <div className="space-y-2.5">
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', view: 'setup' })}
              className="w-full py-3.5 text-sm font-semibold text-stone-700 border border-stone-900/10 rounded-full active:bg-stone-900/5 transition-colors"
            >
              ↻ Reconfigure week schedule
            </button>
            <button
              onClick={handleReset}
              className="w-full py-3 text-sm font-medium text-red-400 active:text-red-600 transition-colors"
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
