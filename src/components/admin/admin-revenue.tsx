'use client'

import { useQuery } from '@tanstack/react-query'
import { DollarSign, Wallet, TrendingUp, Percent, Receipt, Award } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { DashboardStats, ChartSeries, formatCurrency } from '@/lib/types'
import { KpiCard, SectionCard, BarChart, BarList } from './admin-ui'

export function AdminRevenue() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => (await fetch('/api/dashboard/stats')).json(),
  })
  const { data: chart6 } = useQuery<ChartSeries>({
    queryKey: ['dashboard-chart', 6],
    queryFn: async () => (await fetch('/api/dashboard/chart?months=6')).json(),
  })
  const { data: chart12 } = useQuery<ChartSeries>({
    queryKey: ['dashboard-chart', 12],
    queryFn: async () => (await fetch('/api/dashboard/chart?months=12')).json(),
  })

  if (isLoading || !stats) {
    return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
  }

  const k = stats.kpis
  const rev6 = (chart6?.series ?? []).map((s) => ({
    label: s.label,
    values: [{ key: 'Revenue', value: Math.round(s.revenue), color: 'bg-emerald-500' }],
  }))
  const profit6 = (chart6?.series ?? []).map((s) => ({
    label: s.label,
    values: [{ key: 'Profit', value: Math.round(s.profit), color: 'bg-teal-500' }],
  }))
  const volume12 = (chart12?.series ?? []).map((s) => ({
    label: s.label,
    values: [{ key: 'Volume', value: Math.round(s.volume), color: 'bg-sky-500' }],
  }))

  const monthlyAvg = k.ytdRevenue / Math.max(1, new Date().getMonth() + 1)
  const profitMargin = k.profitMargin

  return (
    <div className="space-y-6">
      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total revenue (all-time)" value={formatCurrency(k.totalRevenue, true)} icon={DollarSign} accent="emerald" sub={`YTD ${formatCurrency(k.ytdRevenue, true)}`} />
        <KpiCard label="Net profit (all-time)" value={formatCurrency(k.totalProfit, true)} icon={Wallet} accent="emerald" sub={`YTD ${formatCurrency(k.ytdProfit, true)}`} />
        <KpiCard label="Profit margin" value={`${profitMargin.toFixed(1)}%`} icon={Percent} accent="sky" delta="healthy" />
        <KpiCard label="Avg monthly revenue" value={formatCurrency(monthlyAvg, true)} icon={TrendingUp} accent="violet" sub={`MTD ${formatCurrency(k.mtdRevenue, true)}`} />
      </div>

      {/* REVENUE TREND */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Revenue trend" desc="Last 6 months commission revenue">
          <BarChart data={rev6} />
        </SectionCard>
        <SectionCard title="Profit trend" desc="Last 6 months net profit">
          <BarChart data={profit6} />
        </SectionCard>
      </div>

      <SectionCard title="Sales volume" desc="Trailing 12 months deal volume">
        <BarChart data={volume12} />
      </SectionCard>

      {/* BREAKDOWN */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Revenue by property type" desc="Commission earned per category">
          {stats.salesByType.length > 0 ? (
            <BarList
              items={stats.salesByType
                .sort((a, b) => b.revenue - a.revenue)
                .map((s) => ({ label: s.type, value: s.revenue, sub: `${s.count} deals`, color: 'bg-emerald-500' }))}
            />
          ) : <p className="text-sm text-muted-foreground">No data.</p>}
        </SectionCard>

        <SectionCard title="Top agents by profit" desc="Ranked by net profit contribution">
          {stats.topAgents.length > 0 ? (
            <BarList
              items={stats.topAgents.map((a) => ({ label: a.name, value: a.profit, sub: `${a.deals} deals`, color: 'bg-teal-500' }))}
            />
          ) : <p className="text-sm text-muted-foreground">No agent data.</p>}
        </SectionCard>
      </div>

      {/* DETAILED TABLE */}
      <SectionCard title="Revenue breakdown by agent" desc="Full performance ledger">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead className="text-right">Deals</TableHead>
                <TableHead className="text-right">Commission</TableHead>
                <TableHead className="text-right">Est. profit</TableHead>
                <TableHead className="text-right">Avg / deal</TableHead>
                <TableHead className="text-right">Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.topAgents.map((a) => {
                const share = k.totalRevenue > 0 ? (a.revenue / k.totalRevenue) * 100 : 0
                const avg = a.deals > 0 ? a.revenue / a.deals : 0
                return (
                  <TableRow key={a.name}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          {a.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                        </span>
                        {a.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{a.deals}</TableCell>
                    <TableCell className="text-right tabular-nums text-emerald-600">{formatCurrency(a.revenue, true)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(a.profit, true)}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{formatCurrency(avg, true)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{share.toFixed(1)}%</Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
              {stats.topAgents.length === 0 && (
                <TableRow><TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No data</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      {/* FINANCIAL SUMMARY CARD */}
      <Card className="border-0 bg-gradient-to-br from-emerald-700 to-teal-800 p-6 text-white">
        <div className="flex items-center gap-2 text-emerald-100">
          <Award className="h-5 w-5" />
          <span className="font-semibold">Financial summary (YTD {new Date().getFullYear()})</span>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <div>
            <div className="text-xs text-emerald-100/80">Gross sales volume</div>
            <div className="text-2xl font-bold">{formatCurrency(k.ytdSales, true)}</div>
          </div>
          <div>
            <div className="text-xs text-emerald-100/80">Commission revenue</div>
            <div className="text-2xl font-bold">{formatCurrency(k.ytdRevenue, true)}</div>
          </div>
          <div>
            <div className="text-xs text-emerald-100/80">Net profit</div>
            <div className="text-2xl font-bold">{formatCurrency(k.ytdProfit, true)}</div>
          </div>
          <div>
            <div className="text-xs text-emerald-100/80">Tax liability</div>
            <div className="text-2xl font-bold">{formatCurrency(k.totalTaxCollected, true)}</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
