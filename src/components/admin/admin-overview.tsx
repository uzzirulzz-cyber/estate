'use client'

import { useQuery } from '@tanstack/react-query'
import {
  DollarSign, Wallet, TrendingUp, Landmark, Building2, Home, CheckCircle2,
  Clock, ScrollText, ArrowRight, Receipt,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { DashboardStats, ChartSeries, formatCurrency, formatNumber } from '@/lib/types'
import { KpiCard, SectionCard, BarChart, BarList, DonutChart } from './admin-ui'
import type { AdminView } from './admin-dashboard'

export function AdminOverview({ onNavigate }: { onNavigate: (v: AdminView) => void }) {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats')
      if (!res.ok) throw new Error('failed')
      return res.json()
    },
  })
  const { data: chart } = useQuery<ChartSeries>({
    queryKey: ['dashboard-chart', 6],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/chart?months=6')
      if (!res.ok) throw new Error('failed')
      return res.json()
    },
  })

  if (statsLoading || !stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    )
  }

  const k = stats.kpis
  const chartData = (chart?.series ?? []).map((s) => ({
    label: s.label,
    values: [
      { key: 'Revenue', value: Math.round(s.revenue), color: 'bg-emerald-500' },
      { key: 'Profit', value: Math.round(s.profit), color: 'bg-teal-400' },
      { key: 'Tax', value: Math.round(s.tax), color: 'bg-amber-400' },
    ],
  }))

  const typeColors = ['bg-emerald-500', 'bg-amber-500', 'bg-sky-500', 'bg-violet-500', 'bg-rose-500', 'bg-teal-500']
  const donutSegments = stats.salesByType.map((s, i) => ({
    label: s.type,
    value: s.revenue,
    color: typeColors[i % typeColors.length],
  }))

  return (
    <div className="space-y-6">
      {/* KPI ROW 1 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total revenue"
          value={formatCurrency(k.totalRevenue, true)}
          delta={`${k.completedDeals} deals`}
          icon={DollarSign}
          accent="emerald"
          sub={`YTD: ${formatCurrency(k.ytdRevenue, true)}`}
        />
        <KpiCard
          label="Net profit"
          value={formatCurrency(k.totalProfit, true)}
          delta={`${k.profitMargin.toFixed(1)}% margin`}
          icon={Wallet}
          accent="emerald"
          sub={`YTD: ${formatCurrency(k.ytdProfit, true)}`}
        />
        <KpiCard
          label="Sales volume"
          value={formatCurrency(k.totalSalesVolume, true)}
          delta={`${formatCurrency(k.avgDealSize, true)} avg`}
          deltaPositive
          icon={TrendingUp}
          accent="sky"
          sub={`YTD: ${formatCurrency(k.ytdSales, true)}`}
        />
        <KpiCard
          label="Tax collected"
          value={formatCurrency(k.totalTaxCollected, true)}
          delta={`${k.pendingTaxCount} pending`}
          deltaPositive={false}
          icon={Landmark}
          accent="amber"
          sub={`${formatCurrency(k.pendingTaxAmount, true)} outstanding`}
        />
      </div>

      {/* KPI ROW 2 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total properties" value={String(k.totalProperties)} icon={Building2} accent="zinc" sub={`${k.availableProperties} available`} />
        <KpiCard label="Sold" value={String(k.soldProperties)} icon={Home} accent="rose" />
        <KpiCard label="Rented" value={String(k.rentedProperties)} icon={Receipt} accent="violet" />
        <KpiCard label="Audit events" value={formatNumber(k.auditCount)} icon={ScrollText} accent="zinc" />
      </div>

      {/* CHARTS ROW */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Revenue, profit & tax"
          desc="Last 6 months performance"
          action={
            <Button variant="ghost" size="sm" onClick={() => onNavigate('revenue')}>
              Details <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          }
        >
          <div className="mb-3 flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Revenue</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-teal-400" /> Profit</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-amber-400" /> Tax</span>
          </div>
          {chartData.length > 0 ? (
            <BarChart data={chartData} />
          ) : (
            <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">Loading chart…</div>
          )}
        </SectionCard>

        <SectionCard title="Revenue by property type" desc="Commission earned">
          {donutSegments.length > 0 ? (
            <DonutChart
              segments={donutSegments}
              centerValue={formatCurrency(k.totalRevenue, true)}
              centerLabel="Total"
            />
          ) : (
            <div className="flex h-[160px] items-center justify-center text-sm text-muted-foreground">No data</div>
          )}
        </SectionCard>
      </div>

      {/* BOTTOM ROW */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Top performing agents"
          desc="By commission revenue"
          action={<Button variant="ghost" size="sm" onClick={() => onNavigate('sales')}>All sales <ArrowRight className="ml-1 h-4 w-4" /></Button>}
        >
          {stats.topAgents.length > 0 ? (
            <BarList
              items={stats.topAgents.map((a) => ({
                label: a.name,
                value: a.revenue,
                sub: `${a.deals} deals`,
                color: 'bg-emerald-500',
              }))}
            />
          ) : (
            <p className="text-sm text-muted-foreground">No agent data yet.</p>
          )}
        </SectionCard>

        <SectionCard title="Tax status" desc="Compliance overview" className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="bg-emerald-50/60 p-4 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Paid</span>
              </div>
              <div className="mt-2 text-2xl font-bold">{formatCurrency(k.paidTaxAmount, true)}</div>
              <div className="text-sm text-muted-foreground">{k.paidTaxCount} records settled</div>
            </Card>
            <Card className="bg-amber-50/60 p-4 dark:bg-amber-950/20">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">Pending</span>
              </div>
              <div className="mt-2 text-2xl font-bold">{formatCurrency(k.pendingTaxAmount, true)}</div>
              <div className="text-sm text-muted-foreground">{k.pendingTaxCount} awaiting payment</div>
            </Card>
          </div>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => onNavigate('tax')}>
              Manage tax records <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </SectionCard>
      </div>

      {/* PROPERTY SNAPSHOT */}
      <SectionCard
        title="Portfolio snapshot"
        desc="Inventory by status"
        action={<Button variant="ghost" size="sm" onClick={() => onNavigate('properties')}>Manage <ArrowRight className="ml-1 h-4 w-4" /></Button>}
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead>Share</TableHead>
                <TableHead>Bar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {([
                { label: 'Available', value: k.availableProperties, color: 'bg-emerald-500' },
                { label: 'Sold', value: k.soldProperties, color: 'bg-rose-500' },
                { label: 'Rented', value: k.rentedProperties, color: 'bg-amber-500' },
                { label: 'Ongoing projects', value: k.projectProperties, color: 'bg-sky-500' },
              ] as const).map((row) => {
                const pct = k.totalProperties > 0 ? (row.value / k.totalProperties) * 100 : 0
                return (
                  <TableRow key={row.label}>
                    <TableCell><Badge variant="outline">{row.label}</Badge></TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{row.value}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">{pct.toFixed(0)}%</TableCell>
                    <TableCell className="w-[40%]">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div className={`h-full rounded-full ${row.color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </div>
  )
}
