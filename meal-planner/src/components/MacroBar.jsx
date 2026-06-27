export default function MacroBar({ label, current, target, color = 'emerald' }) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const over = current > target;

  const trackColor = {
    emerald: 'bg-emerald-500',
    sky:     'bg-sky-400',
    amber:   'bg-amber-400',
    rose:    'bg-rose-400',
  };

  const barColor = over ? 'bg-rose-500' : (trackColor[color] || 'bg-emerald-500');

  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span className={over ? 'text-rose-400' : ''}>
          {current}<span className="text-slate-500">/{target}</span>
        </span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
