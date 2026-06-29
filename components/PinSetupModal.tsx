'use client'

import { useState } from 'react'
import { hasPin, verifyPin, setPin, removePin } from '@/lib/pin/pin'
import PinPad from './PinPad'
import { X } from 'lucide-react'

type Mode = 'set' | 'change' | 'remove'
type Step = 'verify-current' | 'enter-new' | 'confirm-new'

interface Props {
  mode: Mode
  onClose: () => void
  onSuccess: (message: string) => void
}

export default function PinSetupModal({ mode, onClose, onSuccess }: Props) {
  const initialStep: Step = (mode === 'set') ? 'enter-new' : 'verify-current'
  const [step, setStep] = useState<Step>(initialStep)
  const [newPin, setNewPin] = useState('')
  const [error, setError] = useState('')

  async function handlePin(pin: string) {
    if (step === 'verify-current') {
      const ok = await verifyPin(pin)
      if (!ok) { setError('Wrong PIN'); return }
      if (mode === 'remove') {
        removePin()
        onSuccess('PIN removed')
        return
      }
      setStep('enter-new')
      return
    }

    if (step === 'enter-new') {
      setNewPin(pin)
      setStep('confirm-new')
      return
    }

    if (step === 'confirm-new') {
      if (pin !== newPin) { setError('PINs don\'t match — try again'); setStep('enter-new'); return }
      await setPin(pin)
      onSuccess(mode === 'set' ? 'PIN set successfully' : 'PIN changed successfully')
    }
  }

  const titles: Record<Step, string> = {
    'verify-current': 'Enter current PIN',
    'enter-new': 'Choose a new PIN',
    'confirm-new': 'Confirm your PIN',
  }

  const subtitles: Record<Step, string> = {
    'verify-current': mode === 'remove' ? 'Enter your PIN to remove it' : 'Verify before changing',
    'enter-new': 'Pick a 4-digit PIN',
    'confirm-new': 'Enter the same PIN again',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1"
        >
          <X size={20} />
        </button>

        <PinPad
          key={step}
          title={titles[step]}
          subtitle={subtitles[step]}
          onComplete={handlePin}
          error={error}
          onClearError={() => setError('')}
        />
      </div>
    </div>
  )
}
