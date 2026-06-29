import type { CoupleSettings } from '@/types/app'

export const DEFAULT_SETTINGS: CoupleSettings = {
  id: 'default',
  name: 'Our Finances',
  members: [
    {
      id: 'partner-1',
      display_name: 'Partner 1',
      color: 'blue',
      annual_income: 0,
      avg_paycheck: 0,
      paychecks_per_month: 2,
      pre_tax_deductions: [
        { id: '401k', name: '401K', type: 'percent', value: 0, is_employer_match: false },
      ],
    },
    {
      id: 'partner-2',
      display_name: 'Partner 2',
      color: 'pink',
      annual_income: 0,
      avg_paycheck: 0,
      paychecks_per_month: 2,
      pre_tax_deductions: [
        { id: '401k', name: '401K', type: 'percent', value: 0, is_employer_match: false },
      ],
    },
  ],
  vaults: [
    {
      id: 'fixed',
      name: 'Fixed Expenses',
      goal_amount: 0,
      color: '#f0f9f0',
      icon: '🏠',
      line_items: [
        { id: 'housing', name: 'Housing', planned_amount: 0 },
        { id: 'utilities', name: 'Utilities', planned_amount: 0 },
        { id: 'car', name: 'Car', planned_amount: 0 },
      ],
    },
    {
      id: 'credit-card',
      name: 'Joint Credit Card',
      goal_amount: 0,
      color: '#fffbeb',
      icon: '💳',
      line_items: [
        { id: 'groceries', name: 'Groceries', planned_amount: 0 },
        { id: 'eating-out', name: 'Eating Out', planned_amount: 0 },
        { id: 'gas', name: 'Gas', planned_amount: 0 },
      ],
    },
    {
      id: 'partner-2-personal',
      name: 'Partner 2',
      goal_amount: 0,
      color: '#fdf2f8',
      icon: '💅',
      line_items: [
        { id: 'p2-spending', name: 'Spending', planned_amount: 0 },
        { id: 'p2-savings', name: 'Savings', planned_amount: 0 },
      ],
    },
    {
      id: 'partner-1-personal',
      name: 'Partner 1',
      goal_amount: 0,
      color: '#eff6ff',
      icon: '🎮',
      line_items: [
        { id: 'p1-spending', name: 'Spending', planned_amount: 0 },
        { id: 'p1-savings', name: 'Savings', planned_amount: 0 },
      ],
    },
    {
      id: 'emergency',
      name: 'Emergency',
      goal_amount: 0,
      color: '#fff5f5',
      icon: '🚨',
      line_items: [],
    },
  ],
  subscriptions: [
    { id: 'sub-1', name: 'Subscription', amount: 0 },
  ],
}
