import type { CoupleSettings } from '@/types/app'

function fmt(n: number) {
  return '$' + Math.round(n).toLocaleString('en-US')
}

function pct(n: number, total: number) {
  return total > 0 ? ((n / total) * 100).toFixed(0) + '%' : '0%'
}

function matches(q: string, keywords: string[]) {
  return keywords.some(k => q.includes(k))
}

export function getLocalResponse(input: string, settings: CoupleSettings): string {
  const q = input.toLowerCase().trim()

  const totalIncome = settings.members.reduce(
    (s, m) => s + m.avg_paycheck * m.paychecks_per_month, 0,
  )
  const fixedVault = settings.vaults.find(v => v.id === 'fixed')
  const ccVault = settings.vaults.find(v => v.id === 'credit-card')
  const totalFixed = fixedVault?.line_items.reduce((s, i) => s + i.planned_amount, 0) ?? 0
  const totalSubs = settings.subscriptions.filter(s => s.amount > 0).reduce((s, sub) => s + sub.amount, 0)
  const totalVaultGoals = settings.vaults.reduce((s, v) => s + v.goal_amount, 0)

  // SUMMARY / OVERVIEW
  if (matches(q, ['summarize', 'overview', 'summary', 'financial plan', 'big picture', 'snapshot', 'tell me about'])) {
    const [m1, m2] = settings.members
    const lines = [
      `Here's a snapshot of **${settings.name}**:\n`,
      `**Monthly Income**`,
      `- ${m1.display_name}: ${fmt(m1.avg_paycheck)} × ${m1.paychecks_per_month} paychecks = ${fmt(m1.avg_paycheck * m1.paychecks_per_month)}/mo`,
      m2 ? `- ${m2.display_name}: ${fmt(m2.avg_paycheck)} × ${m2.paychecks_per_month} paychecks = ${fmt(m2.avg_paycheck * m2.paychecks_per_month)}/mo` : null,
      `- **Combined: ${fmt(totalIncome)}/mo**\n`,
      `**Monthly Vault Goals** (${fmt(totalVaultGoals)} total)`,
      ...settings.vaults.map(v => `- ${v.icon} ${v.name}: ${fmt(v.goal_amount)} (${pct(v.goal_amount, totalIncome)} of income)`),
    ].filter(Boolean) as string[]

    if (totalSubs > 0) {
      lines.push(`\n**Subscriptions**: ${fmt(totalSubs)}/mo`)
    }

    const surplus = totalIncome - totalVaultGoals
    if (surplus > 0) {
      lines.push(`\n**Surplus**: ${fmt(surplus)}/mo (goes to Joint CC vault automatically)`)
    } else if (surplus < 0) {
      lines.push(`\n**Note**: Vault goals exceed income by ${fmt(Math.abs(surplus))} — consider adjusting in Settings.`)
    }

    return lines.join('\n')
  }

  // INCOME
  if (matches(q, ['income', 'earn', 'bring in', 'how much do we make', 'total income', 'monthly income', 'combined income', 'how much we make', 'make per month', 'make a month'])) {
    const lines = [
      `**Monthly Take-Home Income**\n`,
      ...settings.members.map(m =>
        `- **${m.display_name}**: ${fmt(m.avg_paycheck)}/paycheck × ${m.paychecks_per_month} = ${fmt(m.avg_paycheck * m.paychecks_per_month)}/mo`,
      ),
      `\n**Combined: ${fmt(totalIncome)}/mo**`,
      `\n*Annual gross: ${fmt(settings.members.reduce((s, m) => s + m.annual_income, 0))}*`,
    ]
    return lines.join('\n')
  }

  // VAULTS / SPLIT / BREAKDOWN
  if (matches(q, ['vault', 'split', 'breakdown', 'allocation', 'distribute', 'where does', 'how is', 'money go', 'money split', 'divide'])) {
    const lines = [
      `**How ${fmt(totalIncome)}/mo is split across vaults:**\n`,
      ...settings.vaults.map(v =>
        `- ${v.icon} **${v.name}**: ${fmt(v.goal_amount)}/mo (${pct(v.goal_amount, totalIncome)})`,
      ),
      `\n**Total**: ${fmt(totalVaultGoals)}/mo`,
    ]
    return lines.join('\n')
  }

  // FIXED EXPENSES
  if (matches(q, ['fixed', 'bills', 'mortgage', 'rent', 'utilities', 'hoa', 'car payment', 'insurance', 'fixed expense'])) {
    if (!fixedVault) return 'No fixed expenses vault found.'
    const lines = [
      `**${fixedVault.icon} Fixed Expenses** — ${fmt(totalFixed)}/mo (${pct(totalFixed, totalIncome)} of income)\n`,
      ...fixedVault.line_items.map(i => `- ${i.name}: ${fmt(i.planned_amount)}`),
    ]
    return lines.join('\n')
  }

  // CREDIT CARD
  if (matches(q, ['credit card', 'joint cc', 'joint credit', 'cc vault', 'groceries', 'eating out', 'gas', 'cooper'])) {
    if (!ccVault) return 'No Joint CC vault found.'
    const total = ccVault.line_items.reduce((s, i) => s + i.planned_amount, 0)
    const lines = [
      `**${ccVault.icon} Joint Credit Card** — ${fmt(ccVault.goal_amount)}/mo (auto-calculated)\n`,
      ...ccVault.line_items.map(i => `- ${i.name}: ${fmt(i.planned_amount)}`),
      `\n*Line items total: ${fmt(total)}. The vault amount auto-adjusts to absorb any income surplus.*`,
    ]
    return lines.join('\n')
  }

  // SUBSCRIPTIONS
  if (matches(q, ['subscription', 'subscriptions', 'streaming', 'spotify', 'gym', 'classpass', 'phone', 'recurring', 'monthly services'])) {
    const active = settings.subscriptions.filter(s => s.amount > 0)
    if (active.length === 0) return 'No subscriptions found.'
    const lines = [
      `**Monthly Subscriptions** — ${fmt(totalSubs)}/mo total\n`,
      ...active.map(s => `- ${s.name}: ${fmt(s.amount)}`),
    ]
    return lines.join('\n')
  }

  // LEFT OVER / SURPLUS
  if (matches(q, ['left over', 'leftover', 'remaining', 'extra', 'surplus', 'left after', 'after expenses', 'unallocated'])) {
    const surplus = totalIncome - totalVaultGoals
    if (surplus > 0) {
      return `After funding all vaults, you have **${fmt(surplus)}/mo** left over. This gets captured by the Joint CC vault automatically — so nothing goes untracked.`
    } else if (surplus === 0) {
      return `Your vault goals exactly match your income of **${fmt(totalIncome)}/mo**. Every dollar is allocated.`
    } else {
      return `Your vault goals (${fmt(totalVaultGoals)}) exceed your income (${fmt(totalIncome)}) by **${fmt(Math.abs(surplus))}/mo**. You may want to reduce some vault targets in Settings.`
    }
  }

  // PERCENT / PERCENTAGE
  if (matches(q, ['percent', 'percentage', '% of', 'ratio', 'proportion', 'how much of'])) {
    const lines = [
      `**Vault allocations as % of ${fmt(totalIncome)}/mo income:**\n`,
      ...settings.vaults.map(v =>
        `- ${v.icon} ${v.name}: **${pct(v.goal_amount, totalIncome)}** (${fmt(v.goal_amount)})`,
      ),
    ]
    return lines.join('\n')
  }

  // SAVINGS / EMERGENCY
  if (matches(q, ['savings', 'save', 'saving', 'emergency', 'emergency fund'])) {
    const savingsVaults = settings.vaults.filter(v =>
      v.id === 'emergency' ||
      v.line_items.some(i => i.name.toLowerCase().includes('saving')),
    )
    const totalSavings = savingsVaults.reduce((s, v) => s + v.goal_amount, 0)
    if (savingsVaults.length === 0) return "I don't see dedicated savings vaults in your setup."
    const lines = [
      `**Savings-related vaults** — ${fmt(totalSavings)}/mo\n`,
      ...savingsVaults.map(v => `- ${v.icon} ${v.name}: ${fmt(v.goal_amount)}/mo`),
    ]
    return lines.join('\n')
  }

  // PER-PERSON questions (by name)
  for (const member of settings.members) {
    const firstName = member.display_name.split(' ')[0].toLowerCase()
    if (q.includes(firstName)) {
      const monthlyTakeHome = member.avg_paycheck * member.paychecks_per_month
      const personalVault = settings.vaults.find(v => v.id.includes(firstName))
      const lines = [
        `**${member.display_name}'s Finances**\n`,
        `- Take-home: ${fmt(member.avg_paycheck)}/paycheck × ${member.paychecks_per_month} = **${fmt(monthlyTakeHome)}/mo**`,
        `- Annual gross: ${fmt(member.annual_income)}`,
        `- Share of combined income: ${pct(monthlyTakeHome, totalIncome)}`,
      ]
      if (personalVault) {
        lines.push(`\n**Personal Vault (${personalVault.icon} ${personalVault.name})**: ${fmt(personalVault.goal_amount)}/mo`)
        personalVault.line_items.forEach(i => lines.push(`  - ${i.name}: ${fmt(i.planned_amount)}`))
      }
      const deds = member.pre_tax_deductions.filter(d => !d.is_employer_match && d.value > 0)
      if (deds.length > 0) {
        lines.push(`\n**Pre-tax deductions:**`)
        deds.forEach(d => lines.push(`  - ${d.name}: ${d.type === 'percent' ? d.value + '%' : fmt(d.value)}`))
      }
      return lines.join('\n')
    }
  }

  // WHAT-IF — income increase/decrease
  const whatIfIncrease = q.match(/(?:increase|raise|add|bump|extra|go up|goes up)\s+(?:\w+\s+)?(?:by\s+)?\$?([\d,]+)/)
  const whatIfDecrease = q.match(/(?:decrease|reduce|lower|cut|drop|lose|go down|goes down)\s+(?:\w+\s+)?(?:by\s+)?\$?([\d,]+)/)
  if (whatIfIncrease) {
    const delta = parseInt(whatIfIncrease[1].replace(/,/g, ''))
    const newIncome = totalIncome + delta
    return `If your combined income increases by **${fmt(delta)}/mo**, you'd go from **${fmt(totalIncome)}** to **${fmt(newIncome)}/mo**.\n\nSince vault goals stay fixed, the extra **${fmt(delta)}** would flow into the Joint CC vault automatically — giving you more spending/buffer room there.`
  }
  if (whatIfDecrease) {
    const delta = parseInt(whatIfDecrease[1].replace(/,/g, ''))
    const newIncome = totalIncome - delta
    return `If your combined income drops by **${fmt(delta)}/mo**, you'd go from **${fmt(totalIncome)}** to **${fmt(newIncome)}/mo**.\n\nThe Joint CC vault would shrink by **${fmt(delta)}** to compensate — all other vault goals stay the same.`
  }

  // DEFAULT
  return `I can answer questions about your finances. Try asking:\n\n- "Summarize our finances"\n- "How is our money split?"\n- "What are our fixed expenses?"\n- "How much does Connor earn?"\n- "What are our subscriptions?"\n- "How much is left over each month?"\n- "What if income increases by $500?"`
}
