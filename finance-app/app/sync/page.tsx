'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const STORAGE_KEY = 'joint-finances-settings'

function SyncInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')

  useEffect(() => {
    const data = params.get('d')
    if (!data) {
      setStatus('error')
      setTimeout(() => router.replace('/dashboard'), 2000)
      return
    }
    try {
      const json = decodeURIComponent(atob(data))
      const settings = JSON.parse(json)
      if (!settings.members || !settings.vaults) throw new Error('invalid')
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      setStatus('ok')
      setTimeout(() => router.replace('/dashboard'), 1200)
    } catch {
      setStatus('error')
      setTimeout(() => router.replace('/dashboard'), 2000)
    }
  }, [params, router])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8f7f4' }}>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center max-w-xs w-full">
        {status === 'loading' && (
          <>
            <div className="text-4xl mb-4">💰</div>
            <p className="text-gray-700 font-medium">Loading settings…</p>
          </>
        )}
        {status === 'ok' && (
          <>
            <div className="text-4xl mb-4">✅</div>
            <p className="text-gray-900 font-semibold">Settings synced!</p>
            <p className="text-gray-500 text-sm mt-1">Taking you to the dashboard…</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-gray-900 font-semibold">Link didn't work</p>
            <p className="text-gray-500 text-sm mt-1">Make sure you copied the full link.</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function SyncPage() {
  return (
    <Suspense>
      <SyncInner />
    </Suspense>
  )
}
