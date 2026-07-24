'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CreditCard, CheckCircle2, Clock, XCircle, Download, DollarSign } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/types'
import { KpiCard } from './admin-ui'

interface Payment {
  id: string; amount: number; type: string; status: string; method: string
  invoiceNumber?: string; payerName?: string; dueDate?: string; paidDate?: string; createdAt: string
  transaction?: { buyerName: string; property?: { title: string } }
}
interface PayData { payments: Payment[]; summary: { totalPaid: number; totalPending: number; count: number } }

const statusStyle: Record<string, string> = {
  PAID: 'border-emerald-500/40 text-emerald-400', PENDING: 'border-amber-500/40 text-amber-400',
  FAILED: 'border-rose-500/40 text-rose-400', REFUNDED: 'border-violet-500/40 text-violet-400',
  PARTIAL: 'border-sky-500/40 text-sky-400',
}

export function AdminPayments() {
  const [statusFilter, setStatusFilter] = useState('ALL')

  const { data, isLoading } = useQuery<PayData>({
    queryKey: ['admin-payments', statusFilter],
    queryFn: async () => { const qs = statusFilter !== 'ALL' ? `?status=${statusFilter}` : ''; return (await fetch(`/api/payments${qs}`)).json() },
  })

  const payments = data?.payments ?? []
  const summary = data?.summary ?? { totalPaid: 0, totalPending: 0, count: 0 }

  function exportCsv() {
    const headers = ['Invoice', 'Type', 'Payer', 'Amount', 'Status', 'Method', 'Date']
    const rows = payments.map(p => [p.invoiceNumber || '—', p.type, p.payerName || p.transaction?.buyerName || '—', p.amount, p.status, p.method, p.paidDate ? formatDate(p.paidDate) : '—'])
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'payments.csv'; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total paid" value={formatCurrency(summary.totalPaid, true)} icon={CheckCircle2} accent="emerald" />
        <KpiCard label="Pending" value={formatCurrency(summary.totalPending, true)} icon={Clock} accent="amber" />
        <KpiCard label="Total transactions" value={String(summary.count)} icon={CreditCard} accent="sky" />
        <KpiCard label="Failed/refunded" value={String(payments.filter(p => ['FAILED', 'REFUNDED', 'PARTIAL'].includes(p.status)).length)} icon={XCircle} accent="rose" />
      </div>

      <div className="flex items-center justify-between">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={exportCsv} className="border-gold/30 text-gold hover:bg-gold/10"><Download className="mr-1.5 h-4 w-4" /> Export CSV</Button>
      </div>

      <Card className="luxury-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Payer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? Array.from({ length: 6 }).map((_, i) => <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell></TableRow>) :
               payments.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs text-gold">{p.invoiceNumber || '—'}</TableCell>
                  <TableCell className="font-medium text-white">{p.payerName || p.transaction?.buyerName || '—'}</TableCell>
                  <TableCell><Badge variant="outline">{p.type}</Badge></TableCell>
                  <TableCell className="text-right font-semibold tabular-nums text-gold">{formatCurrency(p.amount, true)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.method}</TableCell>
                  <TableCell><Badge variant="outline" className={statusStyle[p.status]}>{p.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.paidDate ? formatDate(p.paidDate) : p.dueDate ? `Due ${formatDate(p.dueDate)}` : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
