import type { CoupleSettings } from '@/types/app'

export const DEFAULT_SETTINGS: CoupleSettings = {
  id: 'default',
  name: 'Connor & Isabella',
  members: [
    {
      id: 'connor',
      display_name: 'Connor',
      color: 'blue',
      annual_income: 69000,
      avg_paycheck: 1420,
      paychecks_per_month: 2,
      pre_tax_deductions: [
        { id: '401k', name: '401K', type: 'percent', value: 6, is_employer_match: false },
        { id: '401k-match', name: '401K Match', type: 'percent', value: 6, is_employer_match: true },
        { id: 'espp', name: 'ESPP', type: 'percent', value: 10, is_employer_match: false },
        { id: 'hsa', name: 'HSA', type: 'fixed', value: 98, is_employer_match: false },
        { id: 'health', name: 'Health Insurance', type: 'fixed', value: -175, is_employer_match: false },
      ],
    },
    {
      id: 'isabella',
      display_name: 'Isabella',
      color: 'pink',
      annual_income: 88000,
      avg_paycheck: 2645,
      paychecks_per_month: 2,
      pre_tax_deductions: [
        { id: '401k', name: '401K', type: 'percent', value: 7, is_employer_match: false },
        { id: '401k-match', name: '401K Match', type: 'percent', value: 2.5, is_employer_match: true },
      ],
    },
  ],
  vaults: [
    {
      id: 'fixed',
      name: 'Fixed Expenses',
      goal_amount: 4370,
      color: '#f0f9f0',
      icon: '🏠',
      line_items: [
        { id: 'mortgage', name: 'Mortgage', planned_amount: 3096 },
        { id: 'hoa', name: 'HOA', planned_amount: 475 },
        { id: 'electricity', name: 'Electricity', planned_amount: 100 },
        { id: 'car-payment', name: 'Car Payment', planned_amount: 345 },
        { id: 'car-insurance', name: 'Car Insurance', planned_amount: 180 },
        { id: 'water', name: 'Water', planned_amount: 20 },
      ],
    },
    {
      id: 'credit-card',
      name: 'Joint Credit Card',
      goal_amount: 1160,
      color: '#fffbeb',
      icon: '💳',
      line_items: [
        { id: 'groceries', name: 'Groceries', planned_amount: 350 },
        { id: 'eating-out', name: 'Eating Out', planned_amount: 400 },
        { id: 'gas', name: 'Gas', planned_amount: 140 },
        { id: 'home-supplies', name: 'Home Supplies', planned_amount: 150 },
        { id: 'cooper', name: 'Cooper 🐶', planned_amount: 120 },
      ],
    },
    {
      id: 'isabella-personal',
      name: 'Isabella',
      goal_amount: 1100,
      color: '#fdf2f8',
      icon: '🚀',
      line_items: [
        { id: 'isa-spending', name: 'Estimated Spending', planned_amount: 600 },
        { id: 'isa-savings', name: 'Savings', planned_amount: 500 },
      ],
    },
    {
      id: 'connor-personal',
      name: 'Connor',
      goal_amount: 900,
      color: '#eff6ff',
      icon: '🎮',
      line_items: [
        { id: 'connor-spending', name: 'Estimated Spending', planned_amount: 400 },
        { id: 'connor-savings', name: 'Savings', planned_amount: 500 },
      ],
    },
    {
      id: 'emergency',
      name: 'Emergency',
      goal_amount: 600,
      color: '#fff5f5',
      icon: '🚨',
      line_items: [],
    },
  ],
  subscriptions: [
    { id: 'spotify', name: 'Spotify Duo', amount: 21 },
    { id: 'phone', name: 'Phone Payment', amount: 30 },
    { id: 'gym', name: 'Gym Membership', amount: 500 },
    { id: 'apta', name: 'APTA', amount: 0 },
    { id: 'classpass', name: 'Class Pass', amount: 80 },
  ],
}
