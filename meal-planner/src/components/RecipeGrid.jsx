import { useMemo, useState } from 'react';

const SERVE_OPTIONS = [2, 4, 6];
const BASE_SERVES = 4;

const MONO = "ui-monospace, SFMono-Regular, Menlo, Monaco, 'Cascadia Mono', 'Courier New', monospace";

const C = {
  canvas: '#f4f3ee',
  cell:   '#fbfaf7',
  border: '#cbc9c1',
  hair:   '#dedcd5',
  ink:    '#15150f',
  muted:  '#8b8981',
  sage:   '#dde3d5',
  sageBd: '#c6ceb8',
  sageOn: '#cdd6c1',
  wait:   '#eceae4',
  accent: '#b07128',
};

const ING_COL   = 186;  // px — left ingredient column
const STAGE_MIN = 84;   // px — narrowest a stage column may get
const ROW_MIN   = 40;   // px — shortest an ingredient row may get

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

// ASCII fractions, the way the reference sheet writes them ("1/4", "1 1/2")
const FRACTIONS = [[0.125, '1/8'], [0.25, '1/4'], [1 / 3, '1/3'], [0.5, '1/2'], [2 / 3, '2/3'], [0.75, '3/4']];

function formatQty(n) {
  if (n == null) return '';
  const whole = Math.floor(n + 1e-6);
  const frac  = n - whole;
  const hit   = FRACTIONS.find(([v]) => Math.abs(frac - v) < 0.04);
  if (hit) return whole === 0 ? hit[1] : `${whole} ${hit[1]}`;
  return String(Math.round(n * 100) / 100);
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

// --- Deriving stage metadata from step prose ------------------------------

function singularize(w) { return w.replace(/(es|s)$/i, ''); }

// Measure words and generic modifiers. These are too common to pin an
// ingredient to a stage on their own — "pepper" alone would drag black
// pepper up to the step that toasts the red pepper.
const STOP = new Set([
  'and', 'or', 'the', 'with', 'plus', 'more', 'for', 'into', 'from', 'each',
  'fresh', 'large', 'small', 'medium', 'ground', 'chopped', 'minced', 'torn',
  'sliced', 'diced', 'leaf', 'leaves', 'clove', 'cloves', 'can', 'cans',
  'cup', 'cups', 'tsp', 'tbs', 'tbsp', 'ounce', 'ounces', 'pound', 'pounds',
  'drained', 'rinsed', 'optional', 'taste', 'serve', 'full', 'fat', 'free',
  'extra', 'virgin', 'pure', 'raw', 'whole', 'baby',
]);

function tokensOf(name) {
  return (name || '')
    .toLowerCase()
    .replace(/[^a-z\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter(w => w.length > 2 && !STOP.has(w))
    .map(singularize);
}

// The stage an ingredient enters at: the step matching the most of its
// distinctive tokens, earliest wins a tie.
function entryStage(ingredientName, steps) {
  const tokens = tokensOf(ingredientName);
  if (!tokens.length) return null;
  let best = -1;
  let bestScore = 0;
  steps.forEach((text, i) => {
    const lower = text.toLowerCase();
    const score = tokens.filter(t => lower.includes(t)).length;
    if (score > bestScore) { bestScore = score; best = i; }
  });
  return bestScore > 0 ? best : null;
}

const VERBS = [
  'preheat', 'set', 'heat', 'cook', 'toast', 'fry', 'sauté', 'saute', 'sear',
  'simmer', 'boil', 'bake', 'roast', 'grill', 'wilt', 'ladle', 'scrape',
  'whisk', 'stir', 'add', 'bring', 'crush', 'season', 'drain', 'combine',
  'mix', 'fold', 'reduce', 'melt', 'pour', 'sprinkle', 'garnish', 'cover',
  'transfer', 'remove', 'blend', 'chop', 'slice', 'mince', 'marinate',
  'flip', 'brush', 'spread', 'top', 'serve',
];

// Head nouns that read wrong on their own ("milk" vs "coconut milk").
const NEEDS_QUALIFIER = new Set([
  'milk', 'oil', 'stock', 'broth', 'paste', 'sauce', 'cheese', 'butter',
  'flour', 'sugar', 'vinegar', 'juice', 'powder', 'seed', 'seeds', 'syrup',
]);

function shortName(name) {
  const words = (name || '')
    .split(/[\s-]+/)
    .filter(w => w.length > 2 && !STOP.has(w.toLowerCase()));
  if (!words.length) return (name || '').toLowerCase();
  const last = words[words.length - 1].toLowerCase();
  const take = NEEDS_QUALIFIER.has(last) ? 2 : 1;
  return words.slice(-take).join(' ').toLowerCase();
}

// Terse action label in the reference's voice: the cooking verb nearest the
// first ingredient this stage touches. "Cook the onion in olive oil" -> "cook onion".
function stageLabel(text, leadIngredient) {
  const lower = text.toLowerCase();

  if (leadIngredient) {
    let at = -1;
    for (const t of tokensOf(leadIngredient)) {
      const p = lower.indexOf(t);
      if (p !== -1 && (at === -1 || p < at)) at = p;
    }
    if (at !== -1) {
      const before = lower.slice(0, at);
      let verb = null;
      let verbAt = -1;
      for (const v of VERBS) {
        const p = before.lastIndexOf(v);
        if (p > verbAt) { verbAt = p; verb = v; }
      }
      if (verb) return `${verb} ${shortName(leadIngredient)}`;
    }
  }

  const clause = text.split(/[,.;:]/)[0].trim();
  const words  = clause.split(/\s+/).slice(0, 3).join(' ');
  return words.charAt(0).toLowerCase() + words.slice(1);
}

function stageHint(text) {
  const heat = text.match(/medium-high|medium-low|medium|low|high/i);
  return heat ? heat[0].toLowerCase() : null;
}

// Sub-label for a stage with no clock: the other things it asks you to do,
// so an untimed stage reads "ladle · serve" rather than a bare dash.
function stageActions(text, usedVerb) {
  const lower = text.toLowerCase();
  const found = VERBS
    .filter(v => v !== usedVerb && new RegExp(`\\b${v}\\b`).test(lower))
    .map(v => ({ v, at: lower.search(new RegExp(`\\b${v}\\b`)) }))
    .sort((a, b) => a.at - b.at)
    .slice(0, 2)
    .map(x => x.v);
  return found.length ? found.join(' · ') : null;
}

const VESSELS = [
  [/dutch oven/i,             'Dutch oven'],
  [/sheet pan|baking sheet/i, 'Sheet pan'],
  [/skillet/i,                'Skillet'],
  [/saucepan/i,               'Saucepan'],
  [/stockpot|large pot/i,     'Stockpot'],
  [/wok/i,                    'Wok'],
  [/oven/i,                   'Oven'],
  [/\bpot\b/i,                'Pot'],
  [/\bpan\b/i,                'Pan'],
];

function detectVessel(steps) {
  const joined = steps.join(' ');
  for (const [re, name] of VESSELS) if (re.test(joined)) return name;
  return null;
}

// Ingredient-by-stage sheet. Rows are ingredients in pour order, columns are
// stages sized to their duration. Each stage's shaded block bottoms out on
// the last ingredient that enters during it, and the pale block to an
// ingredient's left marks the stages it sits out — together they read as a
// staircase down the sheet.
export default function RecipeGrid({ stages, ingredients, stepIdx, onJumpToStage, onStartCooking }) {
  const [serves, setServes] = useState(BASE_SERVES);
  const [metric, setMetric] = useState(false);

  const multiplier = serves / BASE_SERVES;
  const steps = useMemo(() => stages.map(s => s.text), [stages]);
  const rows  = ingredients || [];

  // Which stage each ingredient enters at; unnamed ingredients ride along
  // with whatever is already in the pot.
  const entries = useMemo(
    () => rows.map(ing => entryStage(ing.item, steps) ?? 0),
    [rows, steps],
  );

  // A shaded band per stage: bottom on its last new ingredient, top pulled up
  // far enough to seat the label and never above the previous stage's top.
  const bands = useMemo(() => {
    const out = [];
    let cursor = 0;
    let prevTop = 0;
    stages.forEach(s => {
      const mine = entries.reduce((acc, e, i) => (e === s.index ? [...acc, i] : acc), []);
      const last  = mine.length ? Math.max(...mine) : Math.min(cursor, Math.max(rows.length - 1, 0));
      const first = mine.length ? Math.min(...mine) : last;
      let top = Math.min(first, last - 1);       // seat the label: 2 rows minimum
      top = Math.max(top, prevTop, 0);
      prevTop = top;
      cursor  = last + 1;

      // Label off whichever of this stage's ingredients the prose names first.
      const lower = s.text.toLowerCase();
      let lead = null;
      let leadAt = -1;
      mine.forEach(i => {
        for (const t of tokensOf(rows[i].item)) {
          const p = lower.indexOf(t);
          if (p !== -1 && (leadAt === -1 || p < leadAt)) { leadAt = p; lead = rows[i].item; }
        }
      });

      out.push({ top, bottom: last, label: stageLabel(s.text, lead) });
    });
    return out;
  }, [stages, entries, rows]);

  const totalMin  = stages.reduce((sum, s) => sum + s.minutes, 0);
  const activeMin = stages.filter(s => s.minutes <= 10).reduce((sum, s) => sum + s.minutes, 0);
  const vessel    = useMemo(() => detectVessel(steps), [steps]);
  const banner    = (steps[stepIdx] || '').split(/[.!]/)[0].trim();

  const colTemplate = `${ING_COL}px ${stages.map(s => `minmax(${STAGE_MIN}px, ${s.minutes}fr)`).join(' ')}`;

  const meta = [
    ['Serves', String(serves)],
    ['Active', `${activeMin} min`],
    ['Total',  `${totalMin} min`],
    vessel ? ['Vessel', vessel] : null,
  ].filter(Boolean);

  return (
    <div className="h-full min-h-0 flex flex-col" style={{ background: C.canvas }}>
      {/* Metadata line */}
      <div
        className="shrink-0 px-5 pt-3 pb-2.5 flex flex-wrap gap-x-5 gap-y-1"
        style={{ fontFamily: MONO, borderTop: `1px solid ${C.border}` }}
      >
        {meta.map(([label, value]) => (
          <span key={label} className="text-[10.5px] whitespace-nowrap">
            <span style={{ color: C.muted }}>{label} </span>
            <span className="font-bold" style={{ color: C.ink }}>{value}</span>
          </span>
        ))}
      </div>

      {/* Serves / Units / Start cooking */}
      <div className="shrink-0 px-5 pb-3 flex flex-wrap items-center gap-x-3 gap-y-2" style={{ fontFamily: MONO }}>
        <span className="text-[9px] tracking-[0.14em]" style={{ color: C.muted }}>SERVES</span>
        <div className="flex gap-1">
          {SERVE_OPTIONS.map(n => (
            <button
              key={n}
              onClick={() => setServes(n)}
              className="w-7 h-6 text-[11px] font-bold"
              style={{
                border:     `1px solid ${serves === n ? C.ink : C.border}`,
                background: serves === n ? C.ink : C.cell,
                color:      serves === n ? C.cell : C.ink,
              }}
            >
              {n}
            </button>
          ))}
        </div>

        <span className="text-[9px] tracking-[0.14em] ml-1" style={{ color: C.muted }}>UNITS</span>
        <div className="flex gap-1">
          {['US', 'Metric'].map(u => {
            const active = (u === 'Metric') === metric;
            return (
              <button
                key={u}
                onClick={() => setMetric(u === 'Metric')}
                className="h-6 px-2 text-[11px] font-bold"
                style={{
                  border:     `1px solid ${active ? C.ink : C.border}`,
                  background: active ? C.ink : C.cell,
                  color:      active ? C.cell : C.ink,
                }}
              >
                {u}
              </button>
            );
          })}
        </div>

        <button
          onClick={onStartCooking}
          className="ml-auto h-6 px-2.5 text-[10px] font-bold tracking-[0.08em] whitespace-nowrap active:opacity-80"
          style={{ background: C.accent, color: '#f7f3e9' }}
        >
          Start cooking
        </button>
      </div>

      {/* The sheet. The instruction bar caps it at viewport width so it stays
          readable; the grid below scrolls under it. */}
      <div className="flex-1 min-h-0 flex flex-col px-5 pb-5">
        <div
          className="shrink-0 px-3 py-2 text-center text-[10px] font-bold tracking-[0.13em] leading-relaxed"
          style={{
            background: C.ink,
            color: '#faf9f6',
            fontFamily: MONO,
            border: `1px solid ${C.ink}`,
            borderBottom: 'none',
          }}
        >
          {banner.toUpperCase()}
        </div>

        <div className="flex-1 min-h-0 overflow-auto">
          <div
            className="w-fit min-w-full"
            style={{ border: `1px solid ${C.border}`, borderTop: 'none' }}
          >
          <div
            className="grid"
            style={{
              gridTemplateColumns: colTemplate,
              gridAutoRows: `minmax(${ROW_MIN}px, auto)`,
              background: C.cell,
            }}
          >
            {/* Ingredient column */}
            {rows.map((ing, i) => {
              const { qty, unit } = scaleAndFormat(ing.quantity, ing.unit, multiplier, metric);
              return (
                <div
                  key={`ing-${i}`}
                  className="px-2.5 py-2 flex items-center"
                  style={{
                    gridColumn:   1,
                    gridRow:      i + 1,
                    borderRight:  `1px solid ${C.border}`,
                    borderBottom: i < rows.length - 1 ? `1px solid ${C.hair}` : 'none',
                  }}
                >
                  <p className="text-[11.5px] leading-snug" style={{ color: C.ink }}>
                    {qty && (
                      <span className="font-bold" style={{ fontFamily: MONO }}>
                        {qty}{unit ? ` ${unit}` : ''}{' '}
                      </span>
                    )}
                    {ing.item}
                  </p>
                </div>
              );
            })}

            {/* Pale "not in the pot yet" run, left of each ingredient's entry */}
            {rows.map((_, i) =>
              entries[i] > 0 ? (
                <div
                  key={`wait-${i}`}
                  style={{
                    gridColumn: `2 / ${entries[i] + 2}`,
                    gridRow:    i + 1,
                    background: C.wait,
                    borderRight:  `1px solid ${C.hair}`,
                    borderBottom: `1px solid ${C.hair}`,
                  }}
                />
              ) : null,
            )}

            {/* Stage blocks */}
            {stages.map((s, k) => {
              const band    = bands[k];
              const current = s.index === stepIdx;
              const hint    = stageHint(s.text);
              return (
                <button
                  key={`stage-${k}`}
                  onClick={() => onJumpToStage(s.index)}
                  className="px-2 py-2 text-center"
                  style={{
                    gridColumn: k + 2,
                    gridRow:    `${band.top + 1} / ${band.bottom + 2}`,
                    background: current ? C.sageOn : C.sage,
                    border:     `1px solid ${current ? C.ink : C.sageBd}`,
                  }}
                >
                  <p className="text-[11px] font-bold leading-tight" style={{ color: C.ink }}>
                    {band.label}
                  </p>
                  <p
                    className="text-[9px] leading-snug mt-1"
                    style={{ color: C.muted, fontFamily: MONO }}
                  >
                    {s.timed
                      ? `${s.minutes} min${hint ? ` · ${hint}` : ''}`
                      : stageActions(s.text, band.label.split(' ')[0]) || '—'}
                  </p>
                </button>
              );
            })}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
