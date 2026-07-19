'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Landmark, CheckCircle2, Clock, Download, ShieldCheck, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { TaxReport, formatCurrency, formatDate } from '@/lib/types'
import { KpiCard, SectionCard, BarList } from './admin-ui'

export function AdminTax() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [yearFilter, setYearFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const { data: report, isLoading } = useQuery<TaxReport>({
    queryKey: ['tax-report', yearFilter, statusFilter],
    queryFn: async () => {
      const qs = new URLSearchParams()
      if (yearFilter !== 'ALL') qs.set('fiscalYear', yearFilter)
      if (statusFilter !== 'ALL') qs.set('status', statusFilter)
      const res = await fetch(`/api/tax?${qs.toString()}`)
      if (!res.ok) throw new Error('failed')
      return res.json()
    },
  })

  const markPaidMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tax/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAID' }),
      })
      if (!res.ok) throw new Error('failed')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tax-report'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      qc.invalidateQueries({ queryKey: ['audit-logs'] })
      toast({ title: 'Tax marked as paid', description: 'Compliance record updated.' })
    },
    onError: () => toast({ title: 'Error', description: 'Failed to update tax record.', variant: 'destructive' }),
  })

  const records = report?.records ?? []
  const summary = report?.summary ?? { totalTaxable: 0, totalTax: 0, paidTax: 0, pendingTax: 0, count: 0 }
  const byYear = report?.byYear ?? []

  const years = useMemo(() => {
    const ys = new Set<number>()
    byYear.forEach((y) => ys.add(y.fiscalYear))
    return Array.from(ys).sort((a, b) => b - a)
  }, [byYear])

  function exportCsv() {
    const headers = ['Fiscal Year', 'Property', 'Transaction Type', 'Taxable Amount', 'Tax Rate', 'Tax Amount', 'Status', 'Paid Date']
    const rows = records.map((r) => [
      r.fiscalYear,
      `"${r.transaction?.property?.title ?? '—'}"`,
      r.transaction?.type ?? '—',
      r.taxableAmount,
      `${r.taxRate}%`,
      r.taxAmount,
      r.status,
      r.paidDate ? formatDate(r.paidDate) : '—',
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tax-report-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total tax liability" value={formatCurrency(summary.totalTax, true)} icon={Landmark} accent="amber" sub={`${summary.count} records`} />
        <KpiCard label="Paid" value={formatCurrency(summary.paidTax, true)} icon={CheckCircle2} accent="emerald" />
        <KpiCard label="Outstanding" value={formatCurrency(summary.pendingTax, true)} icon={Clock} accent="rose" />
        <KpiCard label="Taxable base" value={formatCurrency(summary.totalTaxable, true)} icon={FileText} accent="sky" />
      </div>

      {/* COMPLIANCE BANNER */}
      <Card className="border-0 bg-gradient-to-br from-amber-600 to-orange-700 p-6 text-white">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8" />
            <div>
              <div className="text-lg font-semibold">Tax compliance status</div>
              <div className="text-sm text-amber-50/85">
                {summary.pendingTax > 0
                  ? `${formatCurrency(summary.pendingTax, true)} outstanding across pending records — review and settle before fiscal year-end.`
                  : 'All tax records are settled. You are fully compliant.'}
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white/15 px-4 py-3 backdrop-blur">
            <div className="text-xs text-amber-50/80">Settlement rate</div>
            <div className="text-2xl font-bold">
              {summary.totalTax > 0 ? Math.round((summary.paidTax / summary.totalTax) * 100) : 100}%
            </div>
          </div>
        </div>
      </Card>

      {/* BY YEAR */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Tax by fiscal year" desc="Annual liability breakdown" className="lg:col-span-2">
          {byYear.length > 0 ? (
            <BarList
              items={byYear.map((y) => ({
                label: `FY ${y.fiscalYear}`,
                value: y.tax,
                sub: `${y.count} records`,
                color: 'bg-amber-500',
              }))}
            />
          ) : <p className="text-sm text-muted-foreground">No data.</p>}
        </SectionCard>
        <SectionCard title="Annual settlement" desc="Paid vs pending by year">
          <div className="space-y-3">
            {byYear.map((y) => (
              <div key={y.fiscalYear} className="rounded-lg border border-border/60 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">FY {y.fiscalYear}</span>
                  <span className="text-xs text-muted-foreground">{y.count} records</span>
                </div>
                <div className="mt-2 flex gap-1">
                  <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${y.tax > 0 ? (y.paid / y.tax) * 100 : 0}%` }} />
                  <div className="h-1.5 flex-1 rounded-full bg-rose-400" />
                </div>
                <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
                  <span className="text-emerald-600">{formatCurrency(y.paid, true)} paid</span>
                  <span className="text-rose-600">{formatCurrency(y.pending, true)} pending</span>
                </div>
              </div>
            ))}
            {byYear.length === 0 && <p className="text-sm text-muted-foreground">No data.</p>}
          </div>
        </SectionCard>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="sm:w-[160px]"><SelectValue placeholder="Fiscal year" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All years</SelectItem>
              {years.map((y) => <SelectItem key={y} value={String(y)}>FY {y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={exportCsv} disabled={records.length === 0}>
          <Download className="mr-1.5 h-4 w-4" /> Export report
        </Button>
      </div>

      {/* RECORDS TABLE */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>FY</TableHead>
                <TableHead className="min-w-[220px]">Property</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Taxable</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Tax amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid date</TableHead>
                <TableHead className="w-[120px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={9}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                ))
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">No tax records found.</TableCell>
                </TableRow>
              ) : (
                records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.fiscalYear}</TableCell>
                    <TableCell>
                      <div className="font-medium leading-tight">{r.transaction?.property?.title || '—'}</div>
                      <div className="text-xs text-muted-foreground">{r.transaction?.buyerName}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{r.transaction?.type || '—'}</Badge></TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(r.taxableAmount, true)}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{r.taxRate}%</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums text-amber-600">{formatCurrency(r.taxAmount, true)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={r.status === 'PAID'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'}>
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.paidDate ? formatDate(r.paidDate) : '—'}</TableCell>
                    <TableCell>
                      {r.status === 'PENDING' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
                          disabled={markPaidMutation.isPending}
                          onClick={() => markPaidMutation.mutate(r.id)}
                        >
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Mark paid
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <SectionCard title="How tax is calculated" desc="Per-transaction commission tax model">
        <p className="text-sm text-muted-foreground">
          Each transaction generates a tax record based on the commission earned (taxable base).
          Sales carry a {`5%`} tax rate on commission; rentals carry {`4%`}. Records remain <Badge variant="outline" className="mx-1">PENDING</Badge>
          {' '}until manually settled, after which they are marked <Badge variant="outline" className="mx-1 bg-emerald-500/15 text-emerald-700">PAID</Badge> and logged in the audit trail.
        </p>
      </SectionCard>
    </div>
  )
}
