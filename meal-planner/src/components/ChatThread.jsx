import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../utils/chat';
import { EmojiHero, PersonMacroLine, InkPill } from './ui';

function RecipeResultCard({ recipe, primaryLabel, onPrimary, secondaryLabel, onSecondary }) {
  const [busy, setBusy] = useState(false);

  const handlePrimary = async () => {
    setBusy(true);
    try { await onPrimary(recipe); } finally { setBusy(false); }
  };

  return (
    <div className="mt-3 rounded-[24px] bg-[#fdfaf6] border border-stone-900/[0.06] p-4 shadow-[0_8px_24px_rgba(80,40,16,0.1)]">
      <div className="flex items-start gap-3">
        <EmojiHero recipe={recipe} size="text-[44px]" className="mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-bold text-stone-900 leading-snug">{recipe.name}</h3>
          <p className="text-[12px] text-stone-400 font-medium mt-0.5">{recipe.cookTime}</p>
        </div>
      </div>
      {recipe.macros && (
        <div className="space-y-1.5 mt-3">
          <PersonMacroLine person="connor" label="Connor" data={recipe.macros.connor} />
          <PersonMacroLine person="isa" label="Isa" data={recipe.macros.isa} />
        </div>
      )}
      <div className="flex gap-2 mt-3.5">
        <InkPill onClick={handlePrimary} disabled={busy} className="flex-1 py-2.5 text-xs">
          {busy ? <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : primaryLabel}
        </InkPill>
        {secondaryLabel && (
          <button
            onClick={() => onSecondary(recipe)}
            className="px-4 py-2.5 rounded-full border border-stone-900/10 text-stone-600 text-xs font-semibold active:bg-stone-900/5 transition-colors"
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex gap-1.5 px-4 py-3.5 rounded-[20px] rounded-bl-md bg-white/70 w-fit">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export default function ChatThread({
  messages,
  onMessagesChange,
  context,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  placeholder = 'Ask for anything…',
  emptyState,
}) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setError(null);

    const next = [...messages, { role: 'user', content: text }];
    onMessagesChange(next);
    setLoading(true);

    try {
      const apiMessages = next.map(m => ({ role: m.role, content: m.content }));
      const data = await sendChatMessage(apiMessages, context);
      onMessagesChange([...next, { role: 'assistant', content: data.message, recipe: data.recipe || null }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3">
        {messages.length === 0 && emptyState}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-4 py-2.5 ${
                m.role === 'user'
                  ? 'bg-stone-900 text-[#f7faf1] rounded-[20px] rounded-br-md'
                  : 'bg-white/70 text-stone-800 rounded-[20px] rounded-bl-md'
              }`}
            >
              <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{m.content}</p>
              {m.recipe && (
                <RecipeResultCard
                  recipe={m.recipe}
                  primaryLabel={primaryLabel}
                  onPrimary={onPrimary}
                  secondaryLabel={secondaryLabel}
                  onSecondary={onSecondary}
                />
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <TypingBubble />
          </div>
        )}

        {error && (
          <p className="text-red-500 text-xs text-center py-1">{error}</p>
        )}
      </div>

      <div className="px-5 pb-5 pt-2 shrink-0">
        <div className="flex items-center gap-2 bg-white rounded-full pl-5 pr-1.5 py-1.5 shadow-[0_4px_18px_rgba(80,40,16,0.08)] border border-stone-900/[0.04]">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-stone-900 text-[15px] placeholder-stone-400 outline-none"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="w-9 h-9 rounded-full bg-stone-900 text-[#f7faf1] flex items-center justify-center disabled:opacity-25 active:scale-95 transition-all shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 12V2M3 6l4-4 4 4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
