'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  CalendarDays,
  TrendingUp,
  Wallet,
  MessageSquare,
  Settings,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/paycheck', icon: Wallet, label: 'Paycheck' },
  { href: '/monthly', icon: CalendarDays, label: 'Monthly' },
  { href: '/yearly', icon: TrendingUp, label: 'Yearly' },
  { href: '/chat', icon: MessageSquare, label: 'AI Chat' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex shrink-0 bg-white border-r border-gray-200 flex-col py-6 transition-all duration-200 ${
          collapsed ? 'w-14 px-2' : 'w-56 px-3'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center mb-8 ${collapsed ? 'justify-center' : 'gap-2 px-3'}`}>
          <DollarSign size={20} className="text-indigo-600 shrink-0" />
          {!collapsed && <span className="font-bold text-gray-900 text-sm truncate">Joint Finances</span>}
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1">
          {NAV.slice(0, 5).map(({ href, icon: Icon, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`sidebar-link${active ? ' active' : ''}${collapsed ? ' justify-center !px-0' : ''}`}
              >
                <Icon size={16} className="shrink-0" />
                {!collapsed && label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom: Settings + collapse toggle */}
        <div className="mt-auto flex flex-col gap-1">
          <Link
            href="/settings"
            title={collapsed ? 'Settings' : undefined}
            className={`sidebar-link${pathname === '/settings' ? ' active' : ''}${collapsed ? ' justify-center !px-0' : ''}`}
          >
            <Settings size={16} className="shrink-0" />
            {!collapsed && 'Settings'}
          </Link>

          <button
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`sidebar-link text-gray-400 hover:text-gray-700 w-full ${collapsed ? 'justify-center !px-0' : ''}`}
          >
            {collapsed
              ? <ChevronRight size={16} />
              : <><ChevronLeft size={16} /><span>Collapse</span></>
            }
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex items-stretch">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors ${
                active ? 'text-indigo-600' : 'text-gray-400'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
              <span className="text-[10px] leading-tight">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
