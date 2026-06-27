import { FinanceProvider } from '@/lib/finance/store'
import Sidebar from '@/components/layout/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <FinanceProvider>
      <div className="flex h-full min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
      </div>
    </FinanceProvider>
  )
}
