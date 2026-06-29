'use client'

import { useState, useRef, useEffect } from 'react'
import { useFinance } from '@/lib/finance/store'
import { DEFAULT_SETTINGS } from '@/lib/finance/defaults'
import { formatCurrency } from '@/lib/finance/calculator'
import { hasPin } from '@/lib/pin/pin'
import EditableAmount from '@/components/ui/EditableAmount'
import PinSetupModal from '@/components/PinSetupModal'
import { Plus, Trash2, RotateCcw, Upload, Download, Check, AlertCircle, Lock, LockOpen } from 'lucide-react'
import type { PreTaxDeduction } from '@/types/app'

function newId() { return Math.random().toString(36).slice(2) }

export default function SettingsPage() {
  const { settings, updateSettings, setSettings } = useFinance()
  const [resetConfirm, setResetConfirm] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState('')
  const [pinExists, setPinExists] = useState(false)
  const [pinModal, setPinModal] = useState<'set' | 'change' | 'remove' | null>(null)
  const [pinSuccess, setPinSuccess] = useState('')
  const urlRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { setPinExists(hasPin()) }, [])

  function handlePinSuccess(msg: string) {
    setPinModal(null)
    setPinExists(hasPin())
    setPinSuccess(msg)
    setTimeout(() => setPinSuccess(''), 3000)
  }

  function handleGenerateLink() {
    try {
      const data = btoa(encodeURIComponent(JSON.stringify(settings)))
      const url = `${window.location.origin}/sync?d=${data}`
      setShareUrl(url)
      setTimeout(() => {
        urlRef.current?.select()
        urlRef.current?.setSelectionRange(0, 99999)
      }, 50)
    } catch {
      setShareUrl('Error — please try again')
    }
  }

  function handleCopy() {
    if (!urlRef.current) return
    urlRef.current.select()
    urlRef.current.setSelectionRange(0, 99999)
    try {
      document.execCommand('copy')
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      navigator.clipboard?.writeText(shareUrl).then(() => {
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 2000)
      })
    }
  }

  function handleImport() {
    setImportError('')
    let text = importText.trim()
    try {
      const url = new URL(text)
      const d = url.searchParams.get('d')
      if (d) text = decodeURIComponent(atob(d))
    } catch { /* not a URL, treat as raw JSON */ }
    try {
      const parsed = JSON.parse(text)
      if (!parsed.members || !parsed.vaults) {
        setImportError('Invalid settings — make sure you copied the full link.')
        return
      }
      setSettings(parsed)
      setImporting(false)
      setImportText('')
    } catch {
      setImportError('Could not read that. Paste the full link from the share button.')
    }
  }

  function updateMember(memberId: string, field: 'avg_paycheck' | 'paychecks_per_month' | 'annual_income', value: number) {
    updateSettings(s => ({
      ...s,
      members: s.members.map(m => m.id === memberId ? { ...m, [field]: value } : m),
    }))
  }

  function updateVaultGoal(vaultId: string, amount: number) {
    updateSettings(s => ({
      ...s,
      vaults: s.vaults.map(v => v.id === vaultId ? { ...v, goal_amount: amount } : v),
    }))
  }

  function updateDeduction(memberId: string, dedId: string, field: 'name' | 'value' | 'type', value: string | number) {
    updateSettings(s => ({
      ...s,
      members: s.members.map(m =>
        m.id !== memberId ? m : {
          ...m,
          pre_tax_deductions: m.pre_tax_deductions.map(d =>
            d.id !== dedId ? d : { ...d, [field]: value }
          ),
        }
      ),
    }))
  }

  function addDeduction(memberId: string) {
    updateSettings(s => ({
      ...s,
      members: s.members.map(m =>
        m.id !== memberId ? m : {
          ...m,
          pre_tax_deductions: [...m.pre_tax_deductions, {
            id: newId(), name: 'New Deduction', type: 'fixed', value: 0, is_employer_match: false,
          }],
        }
      ),
    }))
  }

  function removeDeduction(memberId: string, dedId: string) {
    updateSettings(s => ({
      ...s,
      members: s.members.map(m =>
        m.id !== memberId ? m : {
          ...m,
          pre_tax_deductions: m.pre_tax_deductions.filter(d => d.id !== dedId),
        }
      ),
    }))
  }

  const totalGoals = settings.vaults.reduce((s, v) => s + v.goal_amount, 0)

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Update your income, paychecks, and vault targets</p>
        </div>
        {resetConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Reset all to defaults?</span>
            <button
              onClick={() => { setSettings(DEFAULT_SETTINGS); setResetConfirm(false) }}
              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
            >
              Yes, reset
            </button>
            <button
              onClick={() => setResetConfirm(false)}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setResetConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200"
          >
            <RotateCcw size={14} />
            Reset to defaults
          </button>
        )}
      </div>

      {/* PIN Lock */}
      <section className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          {pinExists ? <Lock size={16} className="text-gray-700" /> : <LockOpen size={16} className="text-gray-400" />}
          <h2 className="text-base font-semibold text-gray-900">App PIN</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          {pinExists
            ? 'A PIN is set. The app will ask for it each time you open it.'
            : 'Add a 4-digit PIN so only you and Isabella can open the app.'}
        </p>

        {pinSuccess && (
          <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3">
            <Check size={14} /> {pinSuccess}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {!pinExists ? (
            <button
              onClick={() => setPinModal('set')}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Lock size={14} /> Set PIN
            </button>
          ) : (
            <>
              <button
                onClick={() => setPinModal('change')}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Lock size={14} /> Change PIN
              </button>
              <button
                onClick={() => setPinModal('remove')}
                className="flex items-center gap-1.5 px-4 py-2 bg-white text-red-600 text-sm rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
              >
                <LockOpen size={14} /> Remove PIN
              </button>
            </>
          )}
        </div>
      </section>

      {pinModal && (
        <PinSetupModal
          mode={pinModal}
          onClose={() => setPinModal(null)}
          onSuccess={handlePinSuccess}
        />
      )}

      {/* Share Settings */}
      <section className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
        <h2 className="text-base font-semibold text-indigo-900 mb-1">Share Settings</h2>
        <p className="text-sm text-indigo-700 mb-4">
          Copy a link and send it — when the other person opens it, your settings load automatically.
        </p>

        {importing ? (
          <div className="space-y-3">
            <p className="text-sm text-indigo-800 font-medium">Or paste a share link manually:</p>
            <textarea
              autoFocus
              value={importText}
              onChange={e => { setImportText(e.target.value); setImportError('') }}
              placeholder="Paste the full link or settings text here…"
              rows={4}
              className="w-full text-xs font-mono border border-indigo-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white resize-none"
            />
            {importError && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle size={14} />
                {importError}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleImport}
                disabled={!importText.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                <Upload size={14} />
                Load Settings
              </button>
              <button
                onClick={() => { setImporting(false); setImportText(''); setImportError('') }}
                className="px-4 py-2 bg-white text-gray-600 text-sm rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleGenerateLink}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Download size={14} />
                Generate Share Link
              </button>
              <button
                onClick={() => setImporting(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white text-indigo-700 text-sm rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors"
              >
                <Upload size={14} />
                Import from link
              </button>
            </div>
            {shareUrl && (
              <div className="space-y-2">
                <p className="text-xs text-indigo-700">Your share link — tap the box to select all, then copy:</p>
                <textarea
                  ref={urlRef}
                  readOnly
                  value={shareUrl}
                  rows={3}
                  onFocus={e => { e.target.select(); e.target.setSelectionRange(0, 99999) }}
                  className="w-full text-xs font-mono border border-indigo-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {linkCopied ? <Check size={14} /> : <Download size={14} />}
                  {linkCopied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Income & Paychecks */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Income & Paychecks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settings.members.map(member => {
            const monthlyIncome = member.avg_paycheck * member.paychecks_per_month
            const borderColor = member.color === 'blue' ? 'border-blue-200' : 'border-pink-200'
            const bgColor = member.color === 'blue' ? 'bg-blue-50' : 'bg-pink-50'
            const badgeColor = member.color === 'blue'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-pink-100 text-pink-700'
            return (
              <div key={member.id} className={`rounded-2xl border ${borderColor} ${bgColor} p-5`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">{member.display_name}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>
                    {formatCurrency(monthlyIncome)}/mo
                  </span>
                </div>
                <div className="space-y-3">
                  <SettingRow label="Avg Paycheck (take-home)">
                    <EditableAmount
                      value={member.avg_paycheck}
                      onChange={v => updateMember(member.id, 'avg_paycheck', v)}
                      prefix="$"
                      className="text-sm font-semibold text-right"
                    />
                  </SettingRow>
                  <SettingRow label="Paychecks per Month">
                    <EditableAmount
                      value={member.paychecks_per_month}
                      onChange={v => updateMember(member.id, 'paychecks_per_month', v)}
                      className="text-sm font-semibold text-right"
                    />
                  </SettingRow>
                  <SettingRow label="Annual Income (gross)">
                    <EditableAmount
                      value={member.annual_income}
                      onChange={v => updateMember(member.id, 'annual_income', v)}
                      prefix="$"
                      className="text-sm font-semibold text-right"
                    />
                  </SettingRow>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Vault Goals */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Vault Goals</h2>
        <p className="text-gray-500 text-sm mb-4">
          These targets split each paycheck. Joint CC auto-fills with whatever income is left over. Total: <strong>{formatCurrency(totalGoals)}/mo</strong>
        </p>
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          {settings.vaults.map(vault => {
            const pct = totalGoals > 0 ? (vault.goal_amount / totalGoals * 100).toFixed(1) : '0'
            const isAuto = vault.id === 'credit-card'
            return (
              <div key={vault.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{vault.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">{vault.name}</span>
                      {isAuto && (
                        <span className="text-xs text-indigo-500 font-medium bg-indigo-50 px-1.5 py-0.5 rounded">auto</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">{pct}% of total</div>
                  </div>
                </div>
                {isAuto ? (
                  <span className="text-sm font-semibold text-indigo-600">{formatCurrency(vault.goal_amount)}</span>
                ) : (
                  <EditableAmount
                    value={vault.goal_amount}
                    onChange={v => updateVaultGoal(vault.id, v)}
                    prefix="$"
                    className="text-sm font-semibold text-right"
                  />
                )}
              </div>
            )
          })}
          <div className="flex items-center justify-between px-5 py-3 bg-gray-50 rounded-b-2xl">
            <span className="text-sm font-semibold text-gray-700">Total Monthly Need</span>
            <span className="text-sm font-bold text-gray-900">{formatCurrency(totalGoals)}</span>
          </div>
        </div>
      </section>

      {/* Pre-Tax Deductions */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Pre-Tax Deductions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settings.members.map(member => {
            const borderColor = member.color === 'blue' ? 'border-blue-200' : 'border-pink-200'
            const bgColor = member.color === 'blue' ? 'bg-blue-50' : 'bg-pink-50'
            return (
              <div key={member.id} className={`rounded-2xl border ${borderColor} ${bgColor} p-5`}>
                <h3 className="font-semibold text-gray-800 mb-3">{member.display_name}</h3>
                <div className="space-y-2">
                  {member.pre_tax_deductions.map(ded => (
                    <DeductionRow
                      key={ded.id}
                      ded={ded}
                      onNameChange={n => updateDeduction(member.id, ded.id, 'name', n)}
                      onValueChange={v => updateDeduction(member.id, ded.id, 'value', v)}
                      onTypeChange={t => updateDeduction(member.id, ded.id, 'type', t)}
                      onRemove={() => removeDeduction(member.id, ded.id)}
                    />
                  ))}
                  <button
                    onClick={() => addDeduction(member.id)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 mt-1 transition-colors"
                  >
                    <Plus size={12} /> Add deduction
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      {children}
    </div>
  )
}

function DeductionRow({
  ded, onNameChange, onValueChange, onTypeChange, onRemove,
}: {
  ded: PreTaxDeduction
  onNameChange: (n: string) => void
  onValueChange: (v: number) => void
  onTypeChange: (t: string) => void
  onRemove: () => void
}) {
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(ded.name)

  function commitName() {
    if (nameDraft.trim()) onNameChange(nameDraft.trim())
    setEditingName(false)
  }

  return (
    <div className="flex items-center justify-between py-1 group">
      <div className="flex items-center gap-2 min-w-0">
        {editingName ? (
          <input
            autoFocus
            value={nameDraft}
            onChange={e => setNameDraft(e.target.value)}
            onBlur={commitName}
            onKeyDown={e => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') setEditingName(false) }}
            className="text-sm border border-indigo-300 rounded px-1 py-0.5 focus:outline-none w-32"
          />
        ) : (
          <span
            onClick={() => { setNameDraft(ded.name); setEditingName(true) }}
            className="text-sm text-gray-700 cursor-pointer hover:text-indigo-600 truncate"
          >
            {ded.name}
            {ded.is_employer_match && <span className="ml-1 text-xs text-green-600">(match)</span>}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <select
          value={ded.type}
          onChange={e => onTypeChange(e.target.value)}
          className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white focus:outline-none"
        >
          <option value="percent">%</option>
          <option value="fixed">$</option>
        </select>
        <EditableAmount
          value={ded.value}
          onChange={onValueChange}
          prefix={ded.type === 'fixed' ? '$' : ''}
          className="text-sm font-semibold text-right w-14"
        />
        {!ded.is_employer_match && (
          <button
            onClick={onRemove}
            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  )
}
