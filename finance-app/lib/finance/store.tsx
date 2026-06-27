'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { CoupleSettings } from '@/types/app'
import { DEFAULT_SETTINGS } from './defaults'

const STORAGE_KEY = 'joint-finances-settings'

interface StoreCtx {
  settings: CoupleSettings
  setSettings: (s: CoupleSettings) => void
  updateSettings: (updater: (s: CoupleSettings) => CoupleSettings) => void
}

const Ctx = createContext<StoreCtx | null>(null)

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettingsRaw] = useState<CoupleSettings>(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setSettingsRaw(JSON.parse(saved))
    } catch {
      /* ignore */
    }
    setLoaded(true)
  }, [])

  function setSettings(s: CoupleSettings) {
    setSettingsRaw(s)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    } catch {
      /* ignore */
    }
  }

  function updateSettings(updater: (s: CoupleSettings) => CoupleSettings) {
    setSettings(updater(settings))
  }

  if (!loaded) return null

  return <Ctx.Provider value={{ settings, setSettings, updateSettings }}>{children}</Ctx.Provider>
}

export function useFinance() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useFinance must be inside FinanceProvider')
  return ctx
}
