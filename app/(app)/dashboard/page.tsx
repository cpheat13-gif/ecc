'use client'

import Link from 'next/link'
import { useFinance } from '@/lib/finance/store'
import { formatCurrency, calcMemberPaycheckBreakdown } from '@/lib/finance/calculator'
import { ArrowRight } from 'lucide-react'

export default function DashboardPage() {
  const { settings } = useFinance()
  const { members, vaults } = settings

  const totalIncome = members.reduce((s, m) => s + m.avg_paycheck * m.paychecks_per_month, 0)
  const totalGoals = vaults.reduce((s, v) => s + v.goal_amount, 0)
  const breakdowns = members.map(m => calcMemberPaycheckBreakdown(m, vaults))

  const VAULT_COLORS: Record<string, string> = {
    fixed: 'vault-card-green',
    'credit-card': 'vault-card-amber',
    'isabella-personal': 'vault-card-pink',
    'connor-personal': 'vault-card-blue',
    emergency: 'vault-card-red',
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">{settings.name} — Financial Overview</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Monthly Income" value={totalIncome} color="text-indigo-600" />
        <SummaryCard label="Monthly Goals" value={totalGoals} color="text-gray-900" />
        <SummaryCard label="Yearly Income" value={totalIncome * 12} color="text-green-600" />
        <SummaryCard label="Annual Savings" value={(vaults.find(v => v.id === 'emergency')?.goal_amount ?? 0) * 12} color="text-amber-600" />
      </div>

      {/* Vault breakdown */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Monthly Vault Goals</h2>
          <Link href="/paycheck" className="flex items-center gap-1 text-sm text-indigo-600 hover:underline">
            Paycheck breakdown <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {vaults.map(vault => (
            <div key={vault.id} className={`rounded-2xl border p-4 ${VAULT_COLORS[vault.id] || 'bg-white border-gray-200'}`}>
              <div className="text-2xl mb-2">{vault.icon}</div>
              <p className="text-xs text-gray-500 mb-0.5">{vault.name}</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(vault.goal_amount)}</p>
              <p className="text-xs text-gray-400 mt-1">per month</p>
            </div>
          ))}
        </div>
      </div>

      {/* Per-person paychecks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Paycheck Summary</h2>
          <Link href="/paycheck" className="flex items-center gap-1 text-sm text-indigo-600 hover:underline">
            View full breakdown <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {breakdowns.map(b => {
            const bg = b.member.color === 'blue' ? '#eff6ff' : '#fdf2f8'
            const border = b.member.color === 'blue' ? '#93c5fd' : '#f9a8d4'
            return (
              <div key={b.member.id} className="rounded-2xl border p-5" style={{ background: bg, borderColor: border }}>
                <p className="text-sm text-gray-500 mb-1">{b.member.display_name}</p>
                <div className="flex items-end gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Per paycheck</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(b.per_paycheck)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Monthly total</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(b.monthly_total)}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {b.distributions.map(d => (
                    <div key={d.vault_id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {vaults.find(v => v.id === d.vault_id)?.icon} {d.vault_name}
                      </span>
                      <span className="font-medium text-gray-900">{formatCurrency(d.per_paycheck)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickLink href="/monthly" emoji="📋" title="Monthly Estimates" desc="View & edit spending plans" />
        <QuickLink href="/yearly" emoji="📈" title="Yearly Overview" desc="Pre-tax breakdown & income" />
        <QuickLink href="/chat" emoji="🤖" title="AI Assistant" desc="Ask about your finances" />
      </div>
    </div>
  )
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{formatCurrency(value)}</p>
    </div>
  )
}

function QuickLink({ href, emoji, title, desc }: { href: string; emoji: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all flex items-start gap-3"
    >
      <span className="text-2xl">{emoji}</span>
      <div>
        <p className="font-semibold text-gray-800 text-sm">{title}</p>
        <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
      </div>
    </Link>
  )
}
