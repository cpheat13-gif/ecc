'use client'

import { useState } from 'react'
import { useFinance } from '@/lib/finance/store'
import { formatCurrency } from '@/lib/finance/calculator'
import EditableAmount from '@/components/ui/EditableAmount'
import { Plus, Trash2 } from 'lucide-react'
import type { VaultLineItem, SubscriptionItem } from '@/types/app'

function newId() { return Math.random().toString(36).slice(2) }

export default function MonthlyPage() {
  const { settings, updateSettings } = useFinance()
  const { vaults, subscriptions, members } = settings

  const fixedVault = vaults.find(v => v.id === 'fixed')!
  const ccVault = vaults.find(v => v.id === 'credit-card')!
  const isaVault = vaults.find(v => v.id === 'isabella-personal')!
  const connorVault = vaults.find(v => v.id === 'connor-personal')!

  const totalFixed = fixedVault.line_items.reduce((s, i) => s + i.planned_amount, 0)
  const totalCC = ccVault.line_items.reduce((s, i) => s + i.planned_amount, 0)
  const totalSubscriptions = subscriptions.reduce((s, i) => s + i.amount, 0)
  const isaTotal = isaVault.line_items.reduce((s, i) => s + i.planned_amount, 0)
  const connorTotal = connorVault.line_items.reduce((s, i) => s + i.planned_amount, 0)
  const totalIncome = members.reduce((s, m) => s + m.avg_paycheck * m.paychecks_per_month, 0)
  const ccLeftover = ccVault.goal_amount - totalCC

  function updateLineItem(vaultId: string, itemId: string, amount: number) {
    updateSettings(s => ({
      ...s,
      vaults: s.vaults.map(v =>
        v.id !== vaultId ? v : {
          ...v,
          line_items: v.line_items.map(i => i.id === itemId ? { ...i, planned_amount: amount } : i),
        }
      ),
    }))
  }

  function updateLineItemName(vaultId: string, itemId: string, name: string) {
    updateSettings(s => ({
      ...s,
      vaults: s.vaults.map(v =>
        v.id !== vaultId ? v : {
          ...v,
          line_items: v.line_items.map(i => i.id === itemId ? { ...i, name } : i),
        }
      ),
    }))
  }

  function addLineItem(vaultId: string) {
    updateSettings(s => ({
      ...s,
      vaults: s.vaults.map(v =>
        v.id !== vaultId ? v : {
          ...v,
          line_items: [...v.line_items, { id: newId(), name: 'New Item', planned_amount: 0 }],
        }
      ),
    }))
  }

  function removeLineItem(vaultId: string, itemId: string) {
    updateSettings(s => ({
      ...s,
      vaults: s.vaults.map(v =>
        v.id !== vaultId ? v : {
          ...v,
          line_items: v.line_items.filter(i => i.id !== itemId),
        }
      ),
    }))
  }

  function updateSubscription(id: string, amount: number) {
    updateSettings(s => ({
      ...s,
      subscriptions: s.subscriptions.map(i => i.id === id ? { ...i, amount } : i),
    }))
  }

  function updateSubscriptionName(id: string, name: string) {
    updateSettings(s => ({
      ...s,
      subscriptions: s.subscriptions.map(i => i.id === id ? { ...i, name } : i),
    }))
  }

  function addSubscription() {
    updateSettings(s => ({
      ...s,
      subscriptions: [...s.subscriptions, { id: newId(), name: 'New Subscription', amount: 0 }],
    }))
  }

  function removeSubscription(id: string) {
    updateSettings(s => ({
      ...s,
      subscriptions: s.subscriptions.filter(i => i.id !== id),
    }))
  }

  function updatePersonalItem(vaultId: string, itemId: string, amount: number) {
    updateLineItem(vaultId, itemId, amount)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Monthly Spending Estimates</h1>
        <p className="text-gray-500 text-sm mt-1">Click any number to edit it</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {/* Fixed Expenses */}
        <SpendingCard
          title="Fixed Expenses"
          icon="🏠"
          cardClass="vault-card-green"
          total={totalFixed}
          totalLabel="Total Planned"
          remaining={fixedVault.goal_amount - totalFixed}
          remainingLabel="Under / Over Budget"
        >
          {fixedVault.line_items.map(item => (
            <EditableRow
              key={item.id}
              item={item}
              vaultId={fixedVault.id}
              onAmountChange={updateLineItem}
              onNameChange={updateLineItemName}
              onRemove={removeLineItem}
            />
          ))}
          <AddRowButton onClick={() => addLineItem(fixedVault.id)} />
        </SpendingCard>

        {/* Joint Credit Card */}
        <SpendingCard
          title="Joint Credit Card"
          icon="💳"
          cardClass="vault-card-amber"
          total={totalCC}
          totalLabel="Total Planned"
          remaining={ccLeftover}
          remainingLabel="Leftover This Month"
          header={
            <div className="flex justify-between text-sm text-gray-500 mb-3">
              <span>Monthly Budget</span>
              <span className="font-semibold text-gray-800">{formatCurrency(ccVault.goal_amount)}</span>
            </div>
          }
        >
          {ccVault.line_items.map(item => (
            <EditableRow
              key={item.id}
              item={item}
              vaultId={ccVault.id}
              onAmountChange={updateLineItem}
              onNameChange={updateLineItemName}
              onRemove={removeLineItem}
            />
          ))}
          <AddRowButton onClick={() => addLineItem(ccVault.id)} />
        </SpendingCard>

        {/* Subscriptions */}
        <SpendingCard
          title="Subscriptions"
          icon="$"
          cardClass="vault-card-green"
          total={totalSubscriptions}
          totalLabel="Total Subscription Expenses"
        >
          {subscriptions.map(item => (
            <EditableSubRow
              key={item.id}
              item={item}
              onAmountChange={updateSubscription}
              onNameChange={updateSubscriptionName}
              onRemove={removeSubscription}
            />
          ))}
          <AddRowButton onClick={addSubscription} />
        </SpendingCard>

        {/* Connor Personal */}
        <SpendingCard
          title="Connor Spending Money"
          icon="🎮"
          cardClass="vault-card-blue"
          total={connorTotal}
          totalLabel="Total Planned"
          remaining={connorVault.goal_amount - connorTotal}
          remainingLabel="Remaining Budget"
        >
          {connorVault.line_items.map(item => (
            <EditableRow
              key={item.id}
              item={item}
              vaultId={connorVault.id}
              onAmountChange={updatePersonalItem}
              onNameChange={updateLineItemName}
              onRemove={removeLineItem}
            />
          ))}
          <AddRowButton onClick={() => addLineItem(connorVault.id)} />
        </SpendingCard>

        {/* Isabella Personal */}
        <SpendingCard
          title="Isabella Spending Money"
          icon="💅"
          cardClass="vault-card-pink"
          total={isaTotal}
          totalLabel="Total Planned"
          remaining={isaVault.goal_amount - isaTotal}
          remainingLabel="Remaining Budget"
        >
          {isaVault.line_items.map(item => (
            <EditableRow
              key={item.id}
              item={item}
              vaultId={isaVault.id}
              onAmountChange={updatePersonalItem}
              onNameChange={updateLineItemName}
              onRemove={removeLineItem}
            />
          ))}
          <AddRowButton onClick={() => addLineItem(isaVault.id)} />
        </SpendingCard>

      </div>
    </div>
  )
}

/* ── helpers ────────────────────────────────────────── */

function SpendingCard({
  title, icon, cardClass, children, total, totalLabel, remaining, remainingLabel, footer, header,
}: {
  title: string
  icon: string
  cardClass: string
  children: React.ReactNode
  total: number
  totalLabel: string
  remaining?: number
  remainingLabel?: string
  footer?: React.ReactNode
  header?: React.ReactNode
}) {
  return (
    <div className={`rounded-2xl border p-5 ${cardClass}`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{icon}</span>
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      {header}
      <div className="space-y-1">{children}</div>
      <div className="mt-4 pt-3 border-t border-black/10 space-y-1">
        <Row label={totalLabel} value={total} />
        {remaining !== undefined && (
          <Row label={remainingLabel ?? 'Remaining'} value={remaining} signed />
        )}
        {footer}
      </div>
    </div>
  )
}

function Row({ label, value, signed = false }: { label: string; value: number; signed?: boolean }) {
  const color = signed
    ? value >= 0 ? 'text-green-600' : 'text-red-500'
    : 'text-gray-800'
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className={`font-semibold ${color}`}>
        {signed && value > 0 ? '+' : ''}
        {formatCurrency(value)}
      </span>
    </div>
  )
}

function EditableRow({
  item, vaultId, onAmountChange, onNameChange, onRemove,
}: {
  item: VaultLineItem
  vaultId: string
  onAmountChange: (vId: string, iId: string, v: number) => void
  onNameChange: (vId: string, iId: string, n: string) => void
  onRemove: (vId: string, iId: string) => void
}) {
  return (
    <div className="flex items-center justify-between py-1 group">
      <EditableName
        value={item.name}
        onChange={n => onNameChange(vaultId, item.id, n)}
      />
      <div className="flex items-center gap-2">
        <EditableAmount
          value={item.planned_amount}
          onChange={v => onAmountChange(vaultId, item.id, v)}
          className="text-sm text-right"
        />
        <button
          onClick={() => onRemove(vaultId, item.id)}
          className="opacity-30 hover:opacity-100 active:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}

function EditableSubRow({
  item, onAmountChange, onNameChange, onRemove,
}: {
  item: SubscriptionItem
  onAmountChange: (id: string, v: number) => void
  onNameChange: (id: string, n: string) => void
  onRemove: (id: string) => void
}) {
  return (
    <div className="flex items-center justify-between py-1 group">
      <EditableName
        value={item.name}
        onChange={n => onNameChange(item.id, n)}
      />
      <div className="flex items-center gap-2">
        <EditableAmount
          value={item.amount}
          onChange={v => onAmountChange(item.id, v)}
          className="text-sm text-right"
        />
        <button
          onClick={() => onRemove(item.id)}
          className="opacity-30 hover:opacity-100 active:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}

function EditableName({ value, onChange }: { value: string; onChange: (n: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  function commit() {
    if (draft.trim()) onChange(draft.trim())
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
        className="text-sm border border-indigo-300 rounded px-1 py-0.5 focus:outline-none w-32"
      />
    )
  }

  return (
    <span
      onClick={() => { setDraft(value); setEditing(true) }}
      className="text-sm text-gray-700 cursor-pointer hover:text-indigo-600"
    >
      {value}
    </span>
  )
}

function AddRowButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 mt-1 transition-colors"
    >
      <Plus size={12} /> Add item
    </button>
  )
}
