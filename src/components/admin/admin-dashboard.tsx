'use client'

import { useState } from 'react'
import {
  LayoutDashboard, Building2, ReceiptText, TrendingUp, ScrollText,
  Landmark, Building, Menu, X, ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdminOverview } from './admin-overview'
import { AdminProperties } from './admin-properties'
import { AdminSales } from './admin-sales'
import { AdminRevenue } from './admin-revenue'
import { AdminAudit } from './admin-audit'
import { AdminTax } from './admin-tax'

export type AdminView = 'overview' | 'properties' | 'sales' | 'revenue' | 'audit' | 'tax'

const NAV: { key: AdminView; label: string; icon: React.ElementType; group: string }[] = [
  { key: 'overview', label: 'Dashboard', icon: LayoutDashboard, group: 'Analytics' },
  { key: 'properties', label: 'Properties', icon: Building2, group: 'Catalog' },
  { key: 'sales', label: 'Sales & Rentals', icon: ReceiptText, group: 'Catalog' },
  { key: 'revenue', label: 'Revenue & Profit', icon: TrendingUp, group: 'Finance' },
  { key: 'tax', label: 'Tax & Compliance', icon: Landmark, group: 'Finance' },
  { key: 'audit', label: 'Audit Trail', icon: ScrollText, group: 'System' },
]

export function AdminDashboard({ onExit }: { onExit: () => void }) {
  const [view, setView] = useState<AdminView>('overview')
  const [mobileOpen, setMobileOpen] = useState(false)

  const current = NAV.find((n) => n.key === view)!
  const grouped = NAV.reduce<Record<string, typeof NAV>>((acc, n) => {
    (acc[n.group] = acc[n.group] || []).push(n)
    return acc
  }, {})

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* SIDEBAR */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border/60 bg-white transition-transform dark:bg-zinc-900 lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-border/60 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Building className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">Esterra</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Admin Console</div>
          </div>
          <button
            className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex h-[calc(100vh-4rem)] flex-col overflow-y-auto p-3">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="mb-4">
              <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group}
              </div>
              {items.map((item) => (
                <button
                  key={item.key}
                  onClick={() => { setView(item.key); setMobileOpen(false) }}
                  className={cn(
                    'mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition',
                    view === item.key
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </div>
          ))}
          <div className="mt-auto rounded-lg border border-border/60 p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                EA
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">Esterra Admin</div>
                <div className="truncate text-xs text-muted-foreground">admin@esterra.io</div>
              </div>
            </div>
          </div>
        </nav>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* MAIN */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/90 px-4 backdrop-blur sm:px-6">
          <button
            className="rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <current.icon className="h-5 w-5 text-emerald-600" />
            <h1 className="text-lg font-semibold">{current.label}</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="hidden border-emerald-500/40 text-emerald-600 sm:inline-flex">
              Live data
            </Badge>
            <Button variant="outline" size="sm" onClick={onExit}>
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to storefront
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          {view === 'overview' && <AdminOverview onNavigate={setView} />}
          {view === 'properties' && <AdminProperties />}
          {view === 'sales' && <AdminSales />}
          {view === 'revenue' && <AdminRevenue />}
          {view === 'audit' && <AdminAudit />}
          {view === 'tax' && <AdminTax />}
        </main>
      </div>
    </div>
  )
}
