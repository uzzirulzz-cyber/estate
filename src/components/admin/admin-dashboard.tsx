'use client'

import { useState } from 'react'
import {
  LayoutDashboard, Building2, ReceiptText, TrendingUp, ScrollText,
  Landmark, Gem, Menu, X, ArrowLeft, LogOut,
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
import { logoutAdmin } from './admin-login'

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

  function handleExit() {
    logoutAdmin()
    onExit()
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* SIDEBAR */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-gold/10 bg-sidebar transition-transform lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-gold/10 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gold-gradient text-black">
            <Gem className="h-4 w-4" />
          </div>
          <div className="leading-none">
            <div className="font-serif text-sm font-bold tracking-wide-luxury text-white">ZARAJ</div>
            <div className="text-[9px] uppercase tracking-luxury text-gold">Admin Console</div>
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
              <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-luxury text-muted-foreground">
                {group}
              </div>
              {items.map((item) => (
                <button
                  key={item.key}
                  onClick={() => { setView(item.key); setMobileOpen(false) }}
                  className={cn(
                    'mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition',
                    view === item.key
                      ? 'gold-gradient text-black shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-gold',
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </div>
          ))}
          <div className="mt-auto space-y-2">
            <div className="rounded-lg border border-gold/15 bg-gold/5 p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-xs font-semibold text-gold">
                  ZA
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-white">Zaraj Admin</div>
                  <div className="truncate text-xs text-muted-foreground">admin@zaraj.io</div>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleExit} className="w-full justify-start text-muted-foreground hover:text-gold">
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </div>
        </nav>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* MAIN */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-gold/10 bg-background/90 px-4 backdrop-blur sm:px-6">
          <button
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-gold lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <current.icon className="h-5 w-5 text-gold" />
            <h1 className="font-serif text-lg font-semibold text-white">{current.label}</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="hidden border-gold/30 text-gold sm:inline-flex">
              Enterprise
            </Badge>
            <Button variant="outline" size="sm" onClick={onExit} className="border-gold/30 text-gold hover:bg-gold/10 hover:text-gold">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Storefront
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
