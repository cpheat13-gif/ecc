import { FinanceProvider } from '@/lib/finance/store'
import Sidebar from '@/components/layout/Sidebar'
import PinLock from '@/components/PinLock'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <FinanceProvider>
      <PinLock>
        <div className="flex h-full min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto p-4 pb-24 md:p-6 md:pb-6 lg:p-8">{children}</main>
        </div>
      </PinLock>
    </FinanceProvider>
  )
}
