export default function MacroBar({ label, current, target, color = 'emerald' }) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const over = current > target;

  const fills = {
    emerald: 'bg-emerald-400',
    sky:     'bg-sky-400',
    amber:   'bg-amber-400',
    rose:    'bg-rose-400',
  };

  const fill = over ? 'bg-rose-400' : (fills[color] || fills.emerald);

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">{label}</span>
        <span className={`text-[11px] font-medium tabular-nums ${over ? 'text-rose-500' : 'text-stone-500'}`}>
          {current}<span className="text-stone-300 font-normal">/{target}</span>
        </span>
      </div>
      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${fill}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
