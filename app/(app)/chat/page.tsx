'use client'

import { useState, useRef, useEffect } from 'react'
import { useFinance } from '@/lib/finance/store'
import { Send, Bot, User } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'Summarize our finances',
  'How is our money split across vaults?',
  'What are our fixed expenses?',
  'What if income increases by $500?',
]

function renderContent(text: string) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/)
    return (
      <p key={i} className={line === '' ? 'h-2' : 'leading-relaxed'}>
        {parts.map((part, j) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={j}>{part.slice(2, -2)}</strong>
            : part,
        )}
      </p>
    )
  })
}

export default function ChatPage() {
  const { settings } = useFinance()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  function buildContext() {
    const fixedVault = settings.vaults.find(v => v.id === 'fixed')
    return {
      coupleName: settings.name,
      vaults: settings.vaults.map(v => ({ name: v.name, goal_amount: v.goal_amount })),
      members: settings.members.map(m => ({
        display_name: m.display_name,
        avg_paycheck: m.avg_paycheck,
        paychecks_per_month: m.paychecks_per_month,
        annual_income: m.annual_income,
      })),
      totalMonthlyIncome: settings.members.reduce((s, m) => s + m.avg_paycheck * m.paychecks_per_month, 0),
      fixedItems: fixedVault?.line_items.map(i => ({ name: i.name, planned_amount: i.planned_amount })) ?? [],
      subscriptions: settings.subscriptions.map(s => ({ name: s.name, amount: s.amount })),
    }
  }

  async function send(text: string) {
    if (!text.trim() || streaming) return
    const userMsg: Message = { role: 'user', content: text.trim() }
    const newMessages = [...messages, userMsg]
    setMessages([...newMessages, { role: 'assistant', content: '' }])
    setInput('')
    setStreaming(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, context: buildContext() }),
      })

      if (!res.ok) {
        const err = await res.json()
        setMessages([...newMessages, { role: 'assistant', content: `Error: ${err.error}` }])
        setStreaming(false)
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        for (const line of decoder.decode(value).split('\n')) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const { text } = JSON.parse(line.slice(6))
              fullText += text
              setMessages([...newMessages, { role: 'assistant', content: fullText }])
            } catch { /* skip */ }
          }
        }
      }
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: `Connection error: ${String(err)}` }])
    } finally {
      setStreaming(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Finance Assistant</h1>
        <p className="text-gray-500 text-sm mt-1">Ask anything about your joint finances</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto bg-white rounded-2xl border border-gray-200 p-4 space-y-4 mb-4">
        {messages.length === 0 && !streaming && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Bot size={40} className="text-indigo-300 mb-3" />
            <p className="text-gray-500 text-sm mb-6">
              Ask me about your finances — I know your vaults, income, expenses, and subscriptions.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs text-left bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 border border-gray-200 hover:border-indigo-200 rounded-xl p-3 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-indigo-600' : 'bg-gray-100'
            }`}>
              {msg.role === 'user'
                ? <User size={14} className="text-white" />
                : <Bot size={14} className="text-gray-600" />
              }
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-50 text-gray-800'
            }`}>
              {msg.role === 'assistant'
                ? msg.content
                  ? <div className="space-y-0.5">{renderContent(msg.content)}</div>
                  : <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                : msg.content
              }
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={e => { e.preventDefault(); send(input) }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about your finances…"
          disabled={streaming}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!input.trim() || streaming}
          className="bg-indigo-600 text-white rounded-xl px-4 py-3 hover:bg-indigo-700 disabled:opacity-40 transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
