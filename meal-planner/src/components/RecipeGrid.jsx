import { useMemo, useState } from 'react';

const SERVE_OPTIONS = [2, 4, 6];
const BASE_SERVES = 4;

// --- Quantity parsing / scaling / unit conversion -------------------------

function parseQty(qtyStr) {
  if (qtyStr == null) return null;
  const str = String(qtyStr).trim();
  const mixed = str.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return parseInt(mixed[1]) + parseInt(mixed[2]) / parseInt(mixed[3]);
  const frac = str.match(/^(\d+)\/(\d+)$/);
  if (frac) return parseInt(frac[1]) / parseInt(frac[2]);
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

const FRACTIONS = [[0.125, '⅛'], [0.25, '¼'], [0.33, '⅓'], [0.5, '½'], [0.67, '⅔'], [0.75, '¾']];

function formatQty(n) {
  if (n == null) return '';
  const whole = Math.floor(n + 1e-6);
  const frac = n - whole;
  const nearest = FRACTIONS.find(([v]) => Math.abs(frac - v) < 0.05);
  if (nearest && whole === 0) return nearest[1];
  if (nearest) return `${whole} ${nearest[1]}`;
  const rounded = Math.round(n * 100) / 100;
  return rounded % 1 === 0 ? String(rounded) : String(rounded);
}

const METRIC = {
  cup:  { factor: 240, unit: 'ml' }, cups: { factor: 240, unit: 'ml' },
  tbsp: { factor: 15,  unit: 'ml' }, tsp:  { factor: 5,   unit: 'ml' },
  lb:   { factor: 454, unit: 'g'  }, lbs:  { factor: 454, unit: 'g'  },
  oz:   { factor: 28,  unit: 'g'  }, 'fl oz': { factor: 30, unit: 'ml' },
};

function scaleAndFormat(qtyStr, unit, multiplier, useMetric) {
  const parsed = parseQty(qtyStr);
  if (parsed == null) return { qty: qtyStr || '', unit: unit || '' };
  const scaled = parsed * multiplier;
  if (useMetric) {
    const conv = METRIC[(unit || '').toLowerCase().trim()];
    if (conv) {
      const converted = scaled * conv.factor;
      const rounded = converted >= 50 ? Math.round(converted / 5) * 5 : Math.round(converted);
      return { qty: String(rounded), unit: conv.unit };
    }
  }
  return { qty: formatQty(scaled), unit: unit || '' };
}

// --- Ingredient → stage heuristic matching --------------------------------

function singularize(w) { return w.replace(/(es|s)$/i, ''); }

function matchSpan(ingredientName, steps) {
  const tokens = (ingredientName || '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2)
    .map(singularize);

  const hits = [];
  steps.forEach((text, i) => {
    const lower = text.toLowerCase();
    if (tokens.some(t => lower.includes(t))) hits.push(i);
  });
  if (hits.length === 0) return [0, 0];
  return [Math.min(...hits), Math.max(...hits)];
}

// Ingredient-by-stage grid: rows are ingredients, columns are cooking
// stages sized to their duration, with a shaded block spanning whichever
// stages mention that ingredient. Column header taps jump the shared
// step/timer state; the banner mirrors whatever step is currently active.
export default function RecipeGrid({ stages, ingredients, stepIdx, onJumpToStage, currentStepText }) {
  const [serves, setServes] = useState(BASE_SERVES);
  const [metric, setMetric] = useState(false);

  const multiplier = serves / BASE_SERVES;
  const steps = useMemo(() => stages.map(s => s.text), [stages]);

  const rows = useMemo(() => (ingredients || []).map(ing => ({
    ...ing,
    span: matchSpan(ing.item, steps),
  })), [ingredients, steps]);

  const colTemplate = `132px ${stages.map(s => `minmax(52px, ${s.minutes}fr)`).join(' ')}`;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Serves + Units controls */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wide text-stone-400 mr-1">Serves</span>
          {SERVE_OPTIONS.map(n => (
            <button
              key={n}
              onClick={() => setServes(n)}
              className={`w-7 h-7 rounded-full text-[12px] font-bold transition-all ${
                serves === n ? 'bg-stone-900 text-[#f7faf1]' : 'bg-stone-900/[0.06] text-stone-500'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex gap-1 p-1 bg-stone-900/[0.05] rounded-full">
          {['US', 'Metric'].map(u => {
            const active = (u === 'Metric') === metric;
            return (
              <button
                key={u}
                onClick={() => setMetric(u === 'Metric')}
                className={`px-3 py-1 text-[11px] font-bold rounded-full transition-all ${
                  active ? 'bg-stone-900 text-[#f7faf1]' : 'text-stone-500'
                }`}
              >
                {u}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live "now" banner — mirrors the active step */}
      <div className="bg-stone-900 text-[#f7faf1] rounded-2xl px-4 py-3 mb-4 shrink-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45 mb-1">
          Now · Stage {stepIdx + 1}
        </p>
        <p className="text-[13px] font-semibold leading-snug">{currentStepText}</p>
      </div>

      {/* Scrollable ingredient × stage grid */}
      <div className="flex-1 overflow-auto -mx-6 px-6 pb-4">
        <div className="min-w-full w-fit">
          {/* Header row */}
          <div className="grid sticky top-0 z-20 bg-[#f7faf1] pb-2" style={{ gridTemplateColumns: colTemplate }}>
            <div className="sticky left-0 bg-[#f7faf1] z-30" />
            {stages.map(s => (
              <button
                key={s.index}
                onClick={() => onJumpToStage(s.index)}
                className={`px-1.5 text-left rounded-t-md ${s.index === stepIdx ? 'bg-emerald-50' : ''}`}
              >
                <p className="text-[10.5px] font-bold text-stone-800 leading-tight line-clamp-2">
                  {s.text.split(/[.!]/)[0].slice(0, 26)}
                </p>
                <p className="text-[10px] text-stone-400 tabular-nums mt-0.5">
                  {s.timed ? `${s.minutes}m` : '—'}
                </p>
              </button>
            ))}
          </div>

          {/* Ingredient rows */}
          {rows.map((ing, i) => {
            const [start, end] = ing.span;
            const { qty, unit } = scaleAndFormat(ing.quantity, ing.unit, multiplier, metric);
            return (
              <div
                key={i}
                className="grid items-center border-t border-stone-900/[0.06]"
                style={{ gridTemplateColumns: colTemplate }}
              >
                <div className="sticky left-0 bg-[#f7faf1] z-10 py-2.5 pr-3">
                  <p className="text-[12.5px] font-semibold text-stone-800 leading-snug">{ing.item}</p>
                  <p className="text-[11px] text-stone-400 tabular-nums">{qty} {unit}</p>
                </div>
                {stages.map(s => {
                  const inSpan  = s.index >= start && s.index <= end;
                  const isFirst = s.index === start;
                  const isLast  = s.index === end;
                  const isNow   = s.index === stepIdx;
                  return (
                    <div key={s.index} className={!inSpan || isFirst ? 'border-l border-stone-900/[0.06]' : ''}>
                      {inSpan && (
                        <div
                          className={`h-7 ${isNow ? 'bg-grad' : 'bg-stone-900/[0.12]'} ${
                            isFirst ? 'rounded-l-md ml-1' : ''
                          } ${isLast ? 'rounded-r-md mr-1' : ''}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
