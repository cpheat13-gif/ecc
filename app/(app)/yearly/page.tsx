'use client'

import { useFinance } from '@/lib/finance/store'
import { formatCurrency, formatPct } from '@/lib/finance/calculator'
import EditableAmount from '@/components/ui/EditableAmount'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { PreTaxDeduction } from '@/types/app'

function newId() { return Math.random().toString(36).slice(2) }

export default function YearlyPage() {
  const { settings, updateSettings } = useFinance()
  const { members, vaults } = settings

  const totalVaultGoals = vaults.reduce((s, v) => s + v.goal_amount, 0)

  const totalMonthlyPaycheck = members.reduce((s, m) => s + m.avg_paycheck * m.paychecks_per_month, 0)
  const totalYearlyIncome = members.reduce((s, m) => s + m.annual_income, 0)
  const totalYearlyPaycheck = totalMonthlyPaycheck * 12

  // 20/50/30 style breakdown using vault goals
  const savingsVaults = vaults.filter(v => v.id === 'emergency' || v.id.includes('personal'))
  const fixedVaults = vaults.filter(v => v.id === 'fixed')
  const disposableVaults = vaults.filter(v => v.id === 'credit-card')
  const savingsGoal = savingsVaults.reduce((s, v) => s + v.goal_amount, 0)
  const expensesGoal = fixedVaults.reduce((s, v) => s + v.goal_amount, 0)
  const disposableGoal = disposableVaults.reduce((s, v) => s + v.goal_amount, 0)

  function updateMemberIncome(memberId: string, annual: number) {
    updateSettings(s => ({
      ...s,
      members: s.members.map(m =>
        m.id !== memberId ? m : {
          ...m,
          annual_income: annual,
          avg_paycheck: Math.round((annual / (m.paychecks_per_month * 12)) * 100) / 100,
        }
      ),
    }))
  }

  function updateMemberPaycheck(memberId: string, paycheck: number) {
    updateSettings(s => ({
      ...s,
      members: s.members.map(m =>
        m.id !== memberId ? m : { ...m, avg_paycheck: paycheck }
      ),
    }))
  }

  function updateDeduction(memberId: string, dedId: string, field: 'value' | 'name', val: number | string) {
    updateSettings(s => ({
      ...s,
      members: s.members.map(m =>
        m.id !== memberId ? m : {
          ...m,
          pre_tax_deductions: m.pre_tax_deductions.map(d =>
            d.id !== dedId ? d : { ...d, [field]: val }
          ),
        }
      ),
    }))
  }

  function toggleDeductionType(memberId: string, dedId: string) {
    updateSettings(s => ({
      ...s,
      members: s.members.map(m =>
        m.id !== memberId ? m : {
          ...m,
          pre_tax_deductions: m.pre_tax_deductions.map(d =>
            d.id !== dedId ? d : { ...d, type: d.type === 'percent' ? 'fixed' : 'percent' }
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
          pre_tax_deductions: [
            ...m.pre_tax_deductions,
            { id: newId(), name: 'New Deduction', type: 'fixed', value: 0, is_employer_match: false },
          ],
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Yearly Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Annual income, pre-tax breakdown, and spending goals</p>
      </div>

      {/* Joint Yearly Planner */}
      <div className="bg-white rounded-2xl border border-green-200 bg-green-50 overflow-hidden">
        <div className="px-6 py-4 border-b border-green-100">
          <h2 className="font-semibold text-gray-800">Joint Yearly Planner</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-green-100 p-4">
              <p className="text-xs text-gray-500 mb-1">Yearly Income (Combined)</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totalYearlyIncome)}</p>
            </div>
            <div className="bg-white rounded-xl border border-green-100 p-4">
              <p className="text-xs text-gray-500 mb-1">Paycheck Yearly Income</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totalYearlyPaycheck)}</p>
            </div>
            <div className="bg-white rounded-xl border border-green-100 p-4 col-span-2">
              <p className="text-xs text-gray-500 mb-1">Paycheck Monthly Income</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totalMonthlyPaycheck)}</p>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide">
                <th className="text-left pb-3">Category</th>
                <th className="text-right pb-3">Planned %</th>
                <th className="text-right pb-3">Per Month</th>
                <th className="text-right pb-3">Per Year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-100">
              {[
                { label: 'Savings & Personal', amount: savingsGoal + totalVaultGoals - expensesGoal - disposableGoal - savingsGoal },
                { label: 'Fixed Expenses', amount: expensesGoal },
                { label: 'Disposable Income', amount: disposableGoal },
              ].map(row => (
                <tr key={row.label}>
                  <td className="py-3 font-medium text-gray-800">{row.label}</td>
                  <td className="py-3 text-right text-gray-500">
                    {totalMonthlyPaycheck > 0 ? formatPct(row.amount / totalMonthlyPaycheck) : '—'}
                  </td>
                  <td className="py-3 text-right font-semibold text-gray-900">{formatCurrency(row.amount)}</td>
                  <td className="py-3 text-right font-bold text-gray-900">{formatCurrency(row.amount * 12)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Per-Person Annual Breakdown */}
      {members.map(member => {
        const grossPerPaycheck = member.annual_income / (member.paychecks_per_month * 12)
        const memberBg = member.color === 'blue' ? '#eff6ff' : '#fdf2f8'
        const memberBorder = member.color === 'blue' ? '#93c5fd' : '#f9a8d4'
        const memberHeaderBorder = member.color === 'blue' ? '#bfdbfe' : '#fbcfe8'

        return (
          <div
            key={member.id}
            className="rounded-2xl border overflow-hidden"
            style={{ background: memberBg, borderColor: memberBorder }}
          >
            <div className="px-6 py-4 border-b" style={{ borderColor: memberHeaderBorder }}>
              <h2 className="font-semibold text-gray-800">{member.display_name} Annual Breakdown</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4" style={{ border: `1px solid ${memberHeaderBorder}` }}>
                  <p className="text-xs text-gray-500 mb-1">Annual Income</p>
                  <EditableAmount
                    value={member.annual_income}
                    onChange={v => updateMemberIncome(member.id, v)}
                    className="text-xl font-bold text-gray-900"
                  />
                </div>
                <div className="bg-white rounded-xl p-4" style={{ border: `1px solid ${memberHeaderBorder}` }}>
                  <p className="text-xs text-gray-500 mb-1">Avg. Paycheck</p>
                  <EditableAmount
                    value={member.avg_paycheck}
                    onChange={v => updateMemberPaycheck(member.id, v)}
                    className="text-xl font-bold text-gray-900"
                  />
                </div>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wide">
                    <th className="text-left pb-3">Pre-Tax Item</th>
                    <th className="text-right pb-3">Type</th>
                    <th className="text-right pb-3">% / Amount</th>
                    <th className="text-right pb-3">Per Paycheck</th>
                    <th className="text-right pb-3">Per Month</th>
                    <th className="text-right pb-3">Per Year</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: memberHeaderBorder }}>
                  {member.pre_tax_deductions.map(ded => {
                    const perPaycheck = ded.type === 'percent'
                      ? grossPerPaycheck * (ded.value / 100)
                      : Math.abs(ded.value)
                    const sign = ded.value < 0 ? -1 : 1
                    return (
                      <DeductionRow
                        key={ded.id}
                        ded={ded}
                        perPaycheck={perPaycheck * sign}
                        perMonth={perPaycheck * sign * member.paychecks_per_month}
                        perYear={perPaycheck * sign * member.paychecks_per_month * 12}
                        borderColor={memberHeaderBorder}
                        onAmountChange={v => updateDeduction(member.id, ded.id, 'value', v)}
                        onNameChange={n => updateDeduction(member.id, ded.id, 'name', n)}
                        onToggleType={() => toggleDeductionType(member.id, ded.id)}
                        onRemove={() => removeDeduction(member.id, ded.id)}
                      />
                    )
                  })}
                </tbody>
              </table>
              <button
                onClick={() => addDeduction(member.id)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 mt-3 transition-colors"
              >
                <Plus size={12} /> Add deduction
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DeductionRow({
  ded, perPaycheck, perMonth, perYear, borderColor,
  onAmountChange, onNameChange, onToggleType, onRemove,
}: {
  ded: PreTaxDeduction
  perPaycheck: number
  perMonth: number
  perYear: number
  borderColor: string
  onAmountChange: (v: number) => void
  onNameChange: (n: string) => void
  onToggleType: () => void
  onRemove: () => void
}) {
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(ded.name)

  function commitName() {
    if (nameDraft.trim()) onNameChange(nameDraft.trim())
    setEditingName(false)
  }

  const isNeg = ded.value < 0
  const yearColor = isNeg ? 'text-red-500' : 'text-green-600'

  return (
    <tr className="group">
      <td className="py-2.5">
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
            className="text-gray-700 cursor-pointer hover:text-indigo-600"
          >
            {ded.name}
            {ded.is_employer_match && (
              <span className="ml-1 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">match</span>
            )}
          </span>
        )}
      </td>
      <td className="py-2.5 text-right">
        <button
          onClick={onToggleType}
          className="text-xs px-2 py-0.5 rounded-full bg-gray-100 hover:bg-indigo-100 text-gray-600 hover:text-indigo-700 transition-colors"
        >
          {ded.type === 'percent' ? '%' : '$'}
        </button>
      </td>
      <td className="py-2.5 text-right">
        <EditableAmount
          value={Math.abs(ded.value)}
          onChange={v => onAmountChange(ded.value < 0 ? -v : v)}
          prefix={ded.type === 'percent' ? '' : '$'}
          className="text-sm text-gray-900"
        />
        {ded.type === 'percent' && <span className="text-gray-400 text-xs">%</span>}
      </td>
      <td className={`py-2.5 text-right text-sm font-medium ${yearColor}`}>{formatCurrency(perPaycheck)}</td>
      <td className={`py-2.5 text-right text-sm font-medium ${yearColor}`}>{formatCurrency(perMonth)}</td>
      <td className={`py-2.5 text-right text-sm font-bold ${yearColor}`}>{formatCurrency(perYear)}</td>
      <td className="py-2.5 pl-2">
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
        >
          <Trash2 size={12} />
        </button>
      </td>
    </tr>
  )
}
