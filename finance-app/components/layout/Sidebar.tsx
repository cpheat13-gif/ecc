'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  TrendingUp,
  Wallet,
  MessageSquare,
  Settings,
  DollarSign,
} from 'lucide-react'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/paycheck', icon: Wallet, label: 'Paycheck Breakdown' },
  { href: '/monthly', icon: CalendarDays, label: 'Monthly Estimates' },
  { href: '/yearly', icon: TrendingUp, label: 'Yearly Overview' },
  { href: '/chat', icon: MessageSquare, label: 'AI Assistant' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col py-6 px-3">
      <div className="flex items-center gap-2 px-3 mb-8">
        <DollarSign size={20} className="text-indigo-600" />
        <span className="font-bold text-gray-900 text-sm">Joint Finances</span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`sidebar-link${pathname === href ? ' active' : ''}`}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto">
        <Link href="/settings" className={`sidebar-link${pathname === '/settings' ? ' active' : ''}`}>
          <Settings size={16} />
          Settings
        </Link>
      </div>
    </aside>
  )
}
