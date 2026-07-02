// Shared pieces for the v2 editorial design language.

import { getRecipeEmoji } from '../utils/emoji';

// Large floating food emoji — the recipe's "photo".
export function EmojiHero({ recipe, mealType, size = 'text-5xl', className = '' }) {
  return (
    <span className={`emoji-hero select-none ${size} ${className}`} aria-hidden="true">
      {getRecipeEmoji(recipe, mealType)}
    </span>
  );
}

// "560 cal" with the energy gradient on the number.
export function Cal({ value, size = 'text-base' }) {
  return (
    <span className="whitespace-nowrap">
      <span className={`font-display font-bold text-grad tabular-nums ${size}`}>{value}</span>
      <span className="text-stone-400 text-[11px] font-medium ml-0.5">cal</span>
    </span>
  );
}

// "P 34  C 52  F 24" with colored macro letters.
export function PCF({ data }) {
  if (!data) return null;
  return (
    <span className="flex items-baseline gap-2.5 whitespace-nowrap">
      <span className="text-[12px] tabular-nums text-stone-600 font-semibold">
        <span className="text-red-500 font-bold">P</span> {data.protein}
      </span>
      <span className="text-[12px] tabular-nums text-stone-600 font-semibold">
        <span className="text-amber-500 font-bold">C</span> {data.carbs}
      </span>
      <span className="text-[12px] tabular-nums text-stone-600 font-semibold">
        <span className="text-sky-400 font-bold">F</span> {data.fat}
      </span>
    </span>
  );
}

const PERSON_DOT = {
  connor: 'bg-sky-500',
  isa: 'bg-violet-500',
};

// One compact line per person: ● Connor  560 cal  P 34 C 52 F 24
export function PersonMacroLine({ person, label, data }) {
  if (!data) return null;
  return (
    <div className="flex items-baseline gap-3">
      <span className="flex items-center gap-1.5 w-16 shrink-0">
        <span className={`w-1.5 h-1.5 rounded-full ${PERSON_DOT[person]}`} />
        <span className="text-[11px] font-semibold text-stone-500">{label}</span>
      </span>
      <Cal value={data.calories} size="text-sm" />
      <PCF data={data} />
    </div>
  );
}

// Primary action — dark ink pill.
export function InkPill({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`bg-stone-900 text-[#fbf6f0] font-semibold rounded-full active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2 ${className}`}
    >
      {children}
    </button>
  );
}

// Quiet circular icon button.
export function GhostCircle({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`w-9 h-9 flex items-center justify-center rounded-full bg-stone-900/[0.05] text-stone-500 active:bg-stone-900/10 transition-colors shrink-0 ${className}`}
    >
      {children}
    </button>
  );
}

// Gradient progress bar on a hairline track.
export function GradBar({ pct, className = 'h-1' }) {
  return (
    <div className={`bg-stone-900/[0.07] rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-grad rounded-full transition-all duration-500 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      />
    </div>
  );
}
