import { useState, useEffect, useRef, useCallback } from 'react';
import { InkPill } from './ui';

function parseDuration(text) {
  let m;
  m = text.match(/(\d+)\s*hour[s]?\s*(?:and\s*)?(\d+)\s*min/i);
  if (m) return (parseInt(m[1]) * 60 + parseInt(m[2])) * 60;
  m = text.match(/(\d+)\s*hour[s]?/i);
  if (m) return parseInt(m[1]) * 3600;
  m = text.match(/(\d+)[-–](\d+)\s*min/i);
  if (m) return parseInt(m[2]) * 60;
  m = text.match(/(\d+)\s*min(?:ute[s]?)?/i);
  if (m) return parseInt(m[1]) * 60;
  return null;
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function playDing() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.35, 0.7].forEach(delay => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.9);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.9);
    });
  } catch {}
}

export default function CookingMode({ steps, recipeName, onClose }) {
  const [stepIdx, setStepIdx]     = useState(0);
  const [timerSecs, setTimerSecs] = useState(null);
  const [running, setRunning]     = useState(false);
  const [done, setDone]           = useState(false);
  const intervalRef = useRef(null);

  const step       = steps[stepIdx];
  const duration   = parseDuration(step);
  const totalSteps = steps.length;
  const isLast     = stepIdx === totalSteps - 1;

  // Keep screen awake while cooking
  useEffect(() => {
    let wakeLock = null;
    navigator.wakeLock?.request('screen').then(wl => { wakeLock = wl; }).catch(() => {});
    return () => { wakeLock?.release(); };
  }, []);

  // Reset timer when step changes
  useEffect(() => {
    clearInterval(intervalRef.current);
    setTimerSecs(null);
    setRunning(false);
    setDone(false);
  }, [stepIdx]);

  const startTimer = useCallback((secs) => {
    setTimerSecs(secs);
    setRunning(true);
    setDone(false);
  }, []);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setTimerSecs(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          setDone(true);
          playDing();
          try { navigator.vibrate([400, 150, 400, 150, 600]); } catch {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const goNext = () => { if (!isLast) setStepIdx(i => i + 1); };
  const goPrev = () => { if (stepIdx > 0) setStepIdx(i => i - 1); };

  const timerMinutes = duration ? Math.round(duration / 60) : null;
  const isLow = timerSecs !== null && timerSecs <= 30 && running;

  return (
    <div className="fixed inset-0 z-[70] bg-[#f7faf1] flex flex-col select-none">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 shrink-0 flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">Cooking</p>
          <p className="font-display text-stone-700 text-base font-semibold mt-1 leading-snug max-w-[260px]">{recipeName}</p>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-900/[0.05] text-stone-500 active:bg-stone-900/10 transition-colors shrink-0"
        >
          ✕
        </button>
      </div>

      {/* Progress segments */}
      <div className="px-6 pb-6 shrink-0">
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStepIdx(i)}
              className={`h-1 flex-1 rounded-full transition-all ${
                i < stepIdx  ? 'bg-stone-900' :
                i === stepIdx ? 'bg-grad' :
                'bg-stone-900/10'
              }`}
            />
          ))}
        </div>
        <p className="text-stone-400 text-xs font-semibold mt-3">
          Step {stepIdx + 1} of {totalSteps}
        </p>
      </div>

      {/* Step text — scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <p className="font-display text-stone-900 text-[27px] font-semibold leading-[1.4]">{step}</p>

        {/* Timer button */}
        {duration && timerSecs === null && !done && (
          <button
            onClick={() => startTimer(duration)}
            className="mt-9 flex items-center gap-3 border border-stone-900/10 text-stone-700 px-6 py-3.5 rounded-full font-semibold text-sm active:scale-95 active:bg-stone-900/5 transition-all"
          >
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="10" r="7" />
              <path d="M9 7v3.5l2 2" />
              <path d="M6.5 1.5h5" />
              <path d="M9 1.5v2" />
            </svg>
            Start {timerMinutes} min timer
          </button>
        )}

        {/* Active countdown */}
        {timerSecs !== null && !done && (
          <div className="mt-9">
            <div className={`text-[76px] font-display font-bold tabular-nums leading-none tracking-tight ${
              isLow ? 'text-red-500' : 'text-grad'
            }`}>
              {formatTime(timerSecs)}
            </div>
            {isLow && (
              <p className="text-red-500/80 text-xs font-bold mt-3 uppercase tracking-[0.18em]">Almost done</p>
            )}
            <button
              onClick={() => { clearInterval(intervalRef.current); setRunning(false); setTimerSecs(null); }}
              className="mt-5 text-xs text-stone-400 active:text-stone-600 transition-colors font-medium"
            >
              Cancel timer
            </button>
          </div>
        )}

        {/* Timer done */}
        {done && (
          <div className="mt-9">
            <p className="font-display text-[40px] font-bold text-grad leading-tight">Time's up!</p>
            <button
              onClick={() => setDone(false)}
              className="text-xs text-stone-400 active:text-stone-600 transition-colors mt-2 font-medium"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="px-6 pb-10 pt-4 shrink-0 flex gap-3">
        <button
          onClick={goPrev}
          disabled={stepIdx === 0}
          className="w-14 h-14 rounded-full bg-stone-900/[0.05] text-stone-600 text-xl flex items-center justify-center disabled:opacity-20 active:scale-95 transition-all"
        >
          ←
        </button>

        <InkPill
          onClick={isLast ? onClose : goNext}
          className="flex-1 h-14 text-base shadow-[0_10px_28px_rgba(28,25,23,0.28)]"
        >
          {isLast ? 'All done!' : 'Next step →'}
        </InkPill>
      </div>
    </div>
  );
}
