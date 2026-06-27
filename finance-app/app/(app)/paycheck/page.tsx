'use client'

import { useFinance } from '@/lib/finance/store'
import { calcMemberPaycheckBreakdown, formatCurrency, formatPct } from '@/lib/finance/calculator'
import EditableAmount from '@/components/ui/EditableAmount'
import type { Vault } from '@/types/app'

export default function PaycheckPage() {
  const { settings, updateSettings } = useFinance()
  const { members, vaults } = settings

  const totalMonthlyGoals = vaults.reduce((s, v) => s + v.goal_amount, 0)
  const breakdowns = members.map(m => calcMemberPaycheckBreakdown(m, vaults))
  const totalIncome = breakdowns.reduce((s, b) => s + b.monthly_total, 0)

  function updateVaultGoal(vaultId: string, amount: number) {
    updateSettings(s => ({
      ...s,
      vaults: s.vaults.map(v => v.id === vaultId ? { ...v, goal_amount: amount } : v),
    }))
  }

  function updateMemberPaycheck(memberId: string, amount: number) {
    updateSettings(s => ({
      ...s,
      members: s.members.map(m => m.id === memberId ? { ...m, avg_paycheck: amount } : m),
    }))
  }

  const memberColors: Record<string, string> = {
    blue: '#eff6ff',
    pink: '#fdf2f8',
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paycheck Breakdown</h1>
        <p className="text-gray-500 text-sm mt-1">
          Set vault goals to auto-calculate each paycheck&apos;s distribution
        </p>
      </div>

      {/* Goals vs Planned Overview */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="bg-green-50 border-b border-green-100 px-6 py-4">
          <h2 className="font-semibold text-gray-800">Goals vs Planned</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
            <span className="text-2xl">💰</span>
            <div>
              <p className="text-sm text-gray-500">Joint Monthly Income</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-wide">
                <th className="text-left pb-3">Vault</th>
                <th className="text-right pb-3">Goals</th>
                <th className="text-right pb-3">% of Income</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {vaults.map((vault) => (
                <tr key={vault.id}>
                  <td className="py-2.5">
                    <span className="mr-2">{vault.icon}</span>
                    <span className="font-medium text-gray-800">{vault.name}</span>
                  </td>
                  <td className="text-right py-2.5">
                    <EditableAmount
                      value={vault.goal_amount}
                      onChange={v => updateVaultGoal(vault.id, v)}
                    />
                  </td>
                  <td className="text-right py-2.5 text-gray-500">
                    {totalMonthlyGoals > 0
                      ? formatPct(vault.goal_amount / totalMonthlyGoals)
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200">
                <td className="pt-3 font-semibold text-gray-700">Total</td>
                <td className="pt-3 text-right font-bold text-gray-900">
                  {formatCurrency(totalMonthlyGoals)}
                </td>
                <td className="pt-3 text-right text-gray-500">
                  {totalIncome > 0 ? formatPct(totalMonthlyGoals / totalIncome) : '—'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Per-Person Paycheck Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {breakdowns.map((breakdown) => {
          const m = breakdown.member
          const bgColor = memberColors[m.color] || '#f9fafb'
          return (
            <div
              key={m.id}
              className="rounded-2xl border overflow-hidden"
              style={{ background: bgColor, borderColor: m.color === 'blue' ? '#93c5fd' : '#f9a8d4' }}
            >
              <div className="px-6 py-4 border-b" style={{ borderColor: m.color === 'blue' ? '#bfdbfe' : '#fbcfe8' }}>
                <h2 className="font-semibold text-gray-800">{m.display_name} Paycheck</h2>
              </div>
              <div className="p-6">
                {/* Paycheck header */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-opacity-50"
                  style={{ borderColor: m.color === 'blue' ? '#bfdbfe' : '#fbcfe8' }}>
                  <span className="text-2xl">💰</span>
                  <div className="flex-1 text-sm text-gray-500">Per Paycheck</div>
                  <EditableAmount
                    value={m.avg_paycheck}
                    onChange={v => updateMemberPaycheck(m.id, v)}
                    className="font-bold text-gray-900 text-right"
                  />
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Monthly</div>
                    <div className="font-bold text-gray-900">{formatCurrency(breakdown.monthly_total)}</div>
                  </div>
                </div>

                {/* Vault distributions */}
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 text-xs">
                      <th className="text-left pb-2"></th>
                      <th className="text-right pb-2">Per Paycheck</th>
                      <th className="text-right pb-2">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 divide-opacity-50">
                    {breakdown.distributions.map(dist => (
                      <tr key={dist.vault_id}>
                        <td className="py-2 text-gray-700">
                          <span className="mr-1.5">
                            {vaults.find((v: Vault) => v.id === dist.vault_id)?.icon}
                          </span>
                          {dist.vault_name}
                        </td>
                        <td className="text-right py-2 font-medium text-gray-900">
                          {formatCurrency(dist.per_paycheck)}
                        </td>
                        <td className="text-right py-2 font-medium text-gray-900">
                          {formatCurrency(dist.monthly_total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2" style={{ borderColor: m.color === 'blue' ? '#bfdbfe' : '#fbcfe8' }}>
                      <td className="pt-3 font-semibold text-gray-700">Total</td>
                      <td className="pt-3 text-right font-bold text-gray-900">
                        {formatCurrency(breakdown.per_paycheck)}
                      </td>
                      <td className="pt-3 text-right font-bold text-gray-900">
                        {formatCurrency(breakdown.monthly_total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
