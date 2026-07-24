'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, Download, TrendingUp, Users, Building2, DollarSign, Target } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DashboardStats, ChartSeries, formatCurrency, formatDate } from '@/lib/types'
import { KpiCard, SectionCard, BarChart, BarList } from './admin-ui'

export function AdminReports() {
  const [reportType, setReportType] = useState('sales')
  const [period, setPeriod] = useState('6')

  const { data: stats } = useQuery<DashboardStats>({ queryKey: ['dashboard-stats'], queryFn: async () => (await fetch('/api/dashboard/stats')).json() })
  const { data: chart } = useQuery<ChartSeries>({ queryKey: ['dashboard-chart', period], queryFn: async () => (await fetch(`/api/dashboard/chart?months=${period}`)).json() })

  function exportCsv() {
    let headers: string[] = []
    let rows: (string | number)[][] = []
    if (reportType === 'sales' && stats) {
      headers = ['Agent', 'Deals', 'Revenue', 'Profit']
      rows = stats.topAgents.map(a => [a.name, a.deals, a.revenue, a.profit])
    } else if (reportType === 'types' && stats) {
      headers = ['Property Type', 'Count', 'Revenue']
      rows = stats.salesByType.map(s => [s.type, s.count, s.revenue])
    } else if (reportType === 'leads' && stats) {
      headers = ['Stage', 'Count']
      rows = stats.leadStages.map(s => [s.stage, s.count])
    } else if (reportType === 'transactions' && stats) {
      headers = ['Property', 'Agent', 'Amount', 'Status', 'Date']
      rows = stats.recentTransactions.map(t => [t.property?.title || '—', t.agentName, t.amount, t.status, formatDate(t.saleDate)])
    }
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${reportType}-report.csv`; a.click(); URL.revokeObjectURL(url)
  }

  const chartData = (chart?.series ?? []).map(s => ({ label: s.label, values: [{ key: 'Revenue', value: Math.round(s.revenue), color: 'bg-gold' }, { key: 'Profit', value: Math.round(s.profit), color: 'bg-teal-400' }] }))

  const reportTypes = [
    { key: 'sales', label: 'Sales Report', icon: TrendingUp },
    { key: 'transactions', label: 'Transactions', icon: FileText },
    { key: 'types', label: 'By Property Type', icon: Building2 },
    { key: 'leads', label: 'Lead Report', icon: Target },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total revenue" value={stats ? formatCurrency(stats.kpis.totalRevenue, true) : '—'} icon={DollarSign} accent="emerald" />
        <KpiCard label="Total deals" value={stats ? String(stats.kpis.completedDeals) : '—'} icon={FileText} accent="gold" />
        <KpiCard label="Total leads" value={stats ? String(stats.kpis.totalLeads) : '—'} icon={Target} accent="violet" />
        <KpiCard label="Users" value={stats ? String(stats.kpis.registeredUsers) : '—'} icon={Users} accent="sky" />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-lg border border-gold/15 p-1">
          {reportTypes.map(r => (
            <button key={r.key} onClick={() => setReportType(r.key)} className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition ${reportType === r.key ? 'bg-gold text-black' : 'text-muted-foreground hover:text-gold'}`}>
              <r.icon className="h-4 w-4" /> {r.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 months</SelectItem>
              <SelectItem value="6">6 months</SelectItem>
              <SelectItem value="12">12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportCsv} className="border-gold/30 text-gold hover:bg-gold/10"><Download className="mr-1.5 h-4 w-4" /> Export CSV</Button>
        </div>
      </div>

      <SectionCard title="Revenue & profit trend" desc={`Trailing ${period} months`}>
        {chartData.length > 0 ? <BarChart data={chartData} /> : <Skeleton className="h-[220px] w-full rounded-xl" />}
      </SectionCard>

      <SectionCard title={reportTypes.find(r => r.key === reportType)?.label || 'Report'} desc="Detailed breakdown">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {reportType === 'sales' && <><TableHead>Agent</TableHead><TableHead className="text-right">Deals</TableHead><TableHead className="text-right">Revenue</TableHead><TableHead className="text-right">Profit</TableHead></>}
                {reportType === 'transactions' && <><TableHead>Property</TableHead><TableHead>Agent</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead></>}
                {reportType === 'types' && <><TableHead>Type</TableHead><TableHead className="text-right">Count</TableHead><TableHead className="text-right">Revenue</TableHead></>}
                {reportType === 'leads' && <><TableHead>Stage</TableHead><TableHead className="text-right">Count</TableHead></>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportType === 'sales' && stats?.topAgents.map(a => (
                <TableRow key={a.name}><TableCell className="font-medium text-white">{a.name}</TableCell><TableCell className="text-right">{a.deals}</TableCell><TableCell className="text-right tabular-nums text-gold">{formatCurrency(a.revenue, true)}</TableCell><TableCell className="text-right tabular-nums">{formatCurrency(a.profit, true)}</TableCell></TableRow>
              ))}
              {reportType === 'transactions' && stats?.recentTransactions.map(t => (
                <TableRow key={t.id}><TableCell className="font-medium text-white">{t.property?.title || '—'}</TableCell><TableCell className="text-sm text-muted-foreground">{t.agentName}</TableCell><TableCell className="text-right tabular-nums text-gold">{formatCurrency(t.amount, true)}</TableCell><TableCell><Badge variant="outline" className={t.status === 'COMPLETED' ? 'border-emerald-500/40 text-emerald-400' : 'border-amber-500/40 text-amber-400'}>{t.status}</Badge></TableCell></TableRow>
              ))}
              {reportType === 'types' && stats?.salesByType.map(s => (
                <TableRow key={s.type}><TableCell className="font-medium text-white">{s.type}</TableCell><TableCell className="text-right">{s.count}</TableCell><TableCell className="text-right tabular-nums text-gold">{formatCurrency(s.revenue, true)}</TableCell></TableRow>
              ))}
              {reportType === 'leads' && stats?.leadStages.map(s => (
                <TableRow key={s.stage}><TableCell className="font-medium text-white">{s.stage.replace('_', ' ')}</TableCell><TableCell className="text-right">{s.count}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </div>
  )
}
