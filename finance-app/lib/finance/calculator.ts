import type { Vault, MemberSettings, PaycheckDistribution, PaycheckBreakdown } from '@/types/app'

export function calcVaultPct(vault: Vault, vaults: Vault[]): number {
  const total = vaults.reduce((sum, v) => sum + v.goal_amount, 0)
  if (total === 0) return 0
  return vault.goal_amount / total
}

export function calcPaycheckDistributions(
  paycheck: number,
  vaults: Vault[],
  paychecksPerMonth: number,
): PaycheckDistribution[] {
  const total = vaults.reduce((sum, v) => sum + v.goal_amount, 0)
  if (total === 0 || paycheck === 0) return []

  let remaining = paycheck
  const distributions: PaycheckDistribution[] = vaults.map((vault, i) => {
    const pct = total > 0 ? vault.goal_amount / total : 0
    const isLast = i === vaults.length - 1
    const amount = isLast ? remaining : Math.round(paycheck * pct * 100) / 100
    if (!isLast) remaining = Math.round((remaining - amount) * 100) / 100
    return {
      vault_id: vault.id,
      vault_name: vault.name,
      goal_pct: pct,
      per_paycheck: amount,
      monthly_total: Math.round(amount * paychecksPerMonth * 100) / 100,
    }
  })
  return distributions
}

export function calcMemberPaycheckBreakdown(
  member: MemberSettings,
  vaults: Vault[],
): PaycheckBreakdown {
  const distributions = calcPaycheckDistributions(
    member.avg_paycheck,
    vaults,
    member.paychecks_per_month,
  )
  return {
    member,
    per_paycheck: member.avg_paycheck,
    monthly_total: member.avg_paycheck * member.paychecks_per_month,
    distributions,
  }
}

export function calcNetPaycheck(member: MemberSettings): number {
  const grossPerPaycheck = member.annual_income / (member.paychecks_per_month * 12)
  const deductions = member.pre_tax_deductions
    .filter(d => !d.is_employer_match)
    .reduce((sum, d) => {
      if (d.type === 'percent') return sum + grossPerPaycheck * (d.value / 100)
      return sum + d.value
    }, 0)
  return Math.round((grossPerPaycheck - deductions) * 100) / 100
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatPct(pct: number): string {
  return `${Math.round(pct * 1000) / 10}%`
}
