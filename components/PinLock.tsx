'use client'

import { useEffect, useState } from 'react'
import { hasPin, verifyPin, markSessionUnlocked, isSessionUnlocked } from '@/lib/pin/pin'
import PinPad from './PinPad'

export default function PinLock({ children }: { children: React.ReactNode }) {
  const [locked, setLocked] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (hasPin() && !isSessionUnlocked()) {
      setLocked(true)
    }
  }, [])

  async function handlePin(pin: string) {
    const ok = await verifyPin(pin)
    if (ok) {
      markSessionUnlocked()
      setLocked(false)
    } else {
      setError('Wrong PIN — try again')
    }
  }

  if (!locked) return <>{children}</>

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      <div className="mb-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-3xl font-black text-white" style={{ fontFamily: 'serif' }}>$</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Joint Finances</h1>
        <p className="text-sm text-gray-500 mt-0.5">Connor & Isabella</p>
      </div>

      <PinPad
        title="Enter PIN"
        onComplete={handlePin}
        error={error}
        onClearError={() => setError('')}
      />
    </div>
  )
}
