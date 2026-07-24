'use client'

import { useQuery } from '@tanstack/react-query'
import {
  DollarSign, Wallet, TrendingUp, Landmark, Building2, Home, CheckCircle2,
  Clock, ScrollText, ArrowRight, Users, UserCheck, Target, Calendar,
  Eye, Award, Bell, CreditCard, Activity,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { DashboardStats, ChartSeries, formatCurrency, formatNumber, formatDate } from '@/lib/types'
import { KpiCard, SectionCard, BarChart, BarList, DonutChart } from './admin-ui'
import type { AdminView } from './admin-dashboard'

export function AdminOverview({ onNavigate }: { onNavigate: (v: AdminView) => void }) {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => (await fetch('/api/dashboard/stats')).json(),
  })
  const { data: chart } = useQuery<ChartSeries>({
    queryKey: ['dashboard-chart', 6],
    queryFn: async () => (await fetch('/api/dashboard/chart?months=6')).json(),
  })

  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
    )
  }

  const k = stats.kpis
  const chartData = (chart?.series ?? []).map((s) => ({
    label: s.label,
    values: [
      { key: 'Revenue', value: Math.round(s.revenue), color: 'bg-gold' },
      { key: 'Profit', value: Math.round(s.profit), color: 'bg-teal-400' },
      { key: 'Tax', value: Math.round(s.tax), color: 'bg-amber-400' },
    ],
  }))

  const typeColors = ['bg-gold', 'bg-amber-500', 'bg-sky-500', 'bg-violet-500', 'bg-rose-500', 'bg-teal-500']
  const donutSegments = stats.salesByType.map((s, i) => ({ label: s.type, value: s.revenue, color: typeColors[i % typeColors.length] }))

  const leadStageColors: Record<string, string> = {
    NEW: 'bg-sky-500', CONTACTED: 'bg-violet-500', FOLLOW_UP: 'bg-amber-500', VIEWING: 'bg-teal-500', NEGOTIATION: 'bg-gold', CONVERTED: 'bg-emerald-500', LOST: 'bg-rose-500',
  }

  return (
    <div className="space-y-6">
      {/* KPI ROW 1 — Properties & Listings */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total properties" value={String(k.totalProperties)} icon={Building2} accent="emerald" sub={`${k.activeListings} active`} />
        <KpiCard label="Active listings" value={String(k.activeListings)} icon={Home} accent="emerald" sub={`${k.pendingApprovals} pending approval`} />
        <KpiCard label="Sold properties" value={String(k.soldProperties)} icon={CheckCircle2} accent="rose" />
        <KpiCard label="Rented properties" value={String(k.rentedProperties)} icon={Calendar} accent="amber" />
      </div>

      {/* KPI ROW 2 — People */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total agents" value={String(k.totalAgents)} icon={Users} accent="emerald" sub={`${k.activeAgents} active`} />
        <KpiCard label="Registered users" value={String(k.registeredUsers)} icon={UserCheck} accent="sky" sub={`${k.propertyOwners} owners`} />
        <KpiCard label="Total leads" value={String(k.totalLeads)} icon={Target} accent="violet" delta={`${k.leadConversionRate.toFixed(0)}% converted`} />
        <KpiCard label="Appointments" value={String(k.totalAppointments)} icon={Calendar} accent="amber" />
      </div>

      {/* KPI ROW 3 — Finance */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total revenue" value={formatCurrency(k.totalRevenue, true)} icon={DollarSign} accent="emerald" delta={`${k.completedDeals} deals`} sub={`YTD ${formatCurrency(k.ytdRevenue, true)}`} />
        <KpiCard label="Net profit" value={formatCurrency(k.totalProfit, true)} icon={Wallet} accent="emerald" delta={`${k.profitMargin.toFixed(1)}% margin`} sub={`YTD ${formatCurrency(k.ytdProfit, true)}`} />
        <KpiCard label="Sales volume" value={formatCurrency(k.totalSalesVolume, true)} icon={TrendingUp} accent="sky" delta={`${formatCurrency(k.avgDealSize, true)} avg`} />
        <KpiCard label="Pending payments" value={formatCurrency(k.pendingPayments, true)} icon={CreditCard} accent="rose" delta={`${formatCurrency(k.totalPaymentsPaid, true)} paid`} deltaPositive={false} />
      </div>

      {/* KPI ROW 4 — Engagement */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Website visits" value={formatNumber(k.websiteVisits, true)} icon={Eye} accent="violet" />
        <KpiCard label="Tax collected" value={formatCurrency(k.totalTaxCollected, true)} icon={Landmark} accent="amber" delta={`${formatCurrency(k.pendingTaxAmount, true)} pending`} deltaPositive={false} />
        <KpiCard label="Audit events" value={formatNumber(k.auditCount)} icon={ScrollText} accent="zinc" />
        <KpiCard label="Unread alerts" value={String(k.unreadNotifications)} icon={Bell} accent="rose" />
      </div>

      {/* CHARTS ROW */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Revenue, profit & tax"
          desc="Last 6 months performance"
          action={<Button variant="ghost" size="sm" onClick={() => onNavigate('revenue')}>Details <ArrowRight className="ml-1 h-4 w-4" /></Button>}
        >
          <div className="mb-3 flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-gold" /> Revenue</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-teal-400" /> Profit</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-amber-400" /> Tax</span>
          </div>
          {chartData.length > 0 ? <BarChart data={chartData} /> : <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">Loading chart…</div>}
        </SectionCard>

        <SectionCard title="Revenue by type" desc="Commission earned">
          {donutSegments.length > 0 ? (
            <DonutChart segments={donutSegments} centerValue={formatCurrency(k.totalRevenue, true)} centerLabel="Total" />
          ) : <div className="flex h-[160px] items-center justify-center text-sm text-muted-foreground">No data</div>}
        </SectionCard>
      </div>

      {/* LEAD PIPELINE + TOP AGENTS */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Lead pipeline" desc="Current leads by stage">
          {stats.leadStages.length > 0 ? (
            <BarList items={stats.leadStages.map((s) => ({ label: s.stage.replace('_', ' '), value: s.count, color: leadStageColors[s.stage] || 'bg-gold' }))} />
          ) : <p className="text-sm text-muted-foreground">No leads.</p>}
        </SectionCard>

        <SectionCard title="Top agents" desc="By commission revenue" className="lg:col-span-2"
          action={<Button variant="ghost" size="sm" onClick={() => onNavigate('agents')}>All agents <ArrowRight className="ml-1 h-4 w-4" /></Button>}>
          {stats.topAgents.length > 0 ? (
            <BarList items={stats.topAgents.map((a) => ({ label: a.name, value: a.revenue, sub: `${a.deals} deals`, color: 'bg-gold' }))} />
          ) : <p className="text-sm text-muted-foreground">No agent data.</p>}
        </SectionCard>
      </div>

      {/* RECENT TRANSACTIONS + ACTIVITY */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Recent transactions" desc="Latest closed deals"
          action={<Button variant="ghost" size="sm" onClick={() => onNavigate('sales')}>All sales <ArrowRight className="ml-1 h-4 w-4" /></Button>}>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentTransactions.slice(0, 5).map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.property?.title || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{t.agentName}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{formatCurrency(t.amount, true)}</TableCell>
                    <TableCell><Badge variant="outline" className={t.status === 'COMPLETED' ? 'border-emerald-500/40 text-emerald-400' : 'border-amber-500/40 text-amber-400'}>{t.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>

        <SectionCard title="Recent activity" desc="Latest audit events"
          action={<Button variant="ghost" size="sm" onClick={() => onNavigate('audit')}>Full trail <ArrowRight className="ml-1 h-4 w-4" /></Button>}>
          <div className="space-y-3">
            {stats.recentActivity.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">{a.details}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(a.timestamp)} · {a.performedBy}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
