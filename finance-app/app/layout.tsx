import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Joint Finances',
  description: 'Connor & Isabella — Joint Financial Planner',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  )
}
