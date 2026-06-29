'use client'

import { useState, useEffect } from 'react'
import { Delete } from 'lucide-react'

const PIN_LENGTH = 4

interface Props {
  title: string
  subtitle?: string
  onComplete: (pin: string) => void
  error?: string
  onClearError?: () => void
}

export default function PinPad({ title, subtitle, onComplete, error, onClearError }: Props) {
  const [digits, setDigits] = useState<string[]>([])
  const [shake, setShake] = useState(false)

  useEffect(() => {
    if (error) {
      setShake(true)
      setDigits([])
      const t = setTimeout(() => { setShake(false); onClearError?.() }, 600)
      return () => clearTimeout(t)
    }
  }, [error, onClearError])

  function press(d: string) {
    if (digits.length >= PIN_LENGTH) return
    const next = [...digits, d]
    setDigits(next)
    if (next.length === PIN_LENGTH) {
      setTimeout(() => onComplete(next.join('')), 80)
    }
  }

  function del() {
    setDigits(prev => prev.slice(0, -1))
  }

  const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫']

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-900">{title}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>

      {/* Dot indicators */}
      <div className={`flex gap-4 ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
              i < digits.length
                ? 'bg-indigo-600 border-indigo-600 scale-110'
                : 'bg-transparent border-gray-400'
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="text-red-500 text-sm -mt-4">{error}</p>
      )}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 w-64">
        {KEYS.map((key, i) => {
          if (key === '') return <div key={i} />
          if (key === '⌫') {
            return (
              <button
                key={i}
                onClick={del}
                className="h-16 rounded-2xl bg-gray-100 active:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors"
              >
                <Delete size={20} />
              </button>
            )
          }
          return (
            <button
              key={i}
              onClick={() => press(key)}
              className="h-16 rounded-2xl bg-gray-100 active:bg-indigo-100 active:scale-95 flex items-center justify-center text-xl font-semibold text-gray-900 transition-all"
            >
              {key}
            </button>
          )
        })}
      </div>
    </div>
  )
}
