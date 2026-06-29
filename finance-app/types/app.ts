export interface CoupleSettings {
  id: string
  name: string
  members: MemberSettings[]
  vaults: Vault[]
  subscriptions: SubscriptionItem[]
}

export interface MemberSettings {
  id: string
  display_name: string
  color: 'blue' | 'pink'
  annual_income: number
  avg_paycheck: number
  paychecks_per_month: number
  pre_tax_deductions: PreTaxDeduction[]
}

export interface PreTaxDeduction {
  id: string
  name: string
  type: 'percent' | 'fixed'
  value: number
  is_employer_match: boolean
}

export interface Vault {
  id: string
  name: string
  goal_amount: number
  color: string
  icon: string
  line_items: VaultLineItem[]
}

export interface VaultLineItem {
  id: string
  name: string
  planned_amount: number
  actual_amount?: number
}

export interface SubscriptionItem {
  id: string
  name: string
  amount: number
  category?: string
}

export interface PaycheckDistribution {
  vault_id: string
  vault_name: string
  goal_pct: number
  per_paycheck: number
  monthly_total: number
}

export interface PaycheckBreakdown {
  member: MemberSettings
  per_paycheck: number
  monthly_total: number
  distributions: PaycheckDistribution[]
}

export interface MonthlySnapshot {
  total_monthly_goals: number
  total_income: number
  vault_distributions: PaycheckBreakdown[]
}
