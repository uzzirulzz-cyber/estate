'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, ScrollText, Filter, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { AuditLog, formatDateTime } from '@/lib/types'
import { KpiCard, SectionCard } from './admin-ui'
import { ScrollText as ScrollIcon, ShieldCheck, FileEdit, Trash2, Banknote, Receipt, Tag } from 'lucide-react'

const actionStyle: Record<string, string> = {
  CREATE: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  UPDATE: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
  DELETE: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
  SALE: 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30',
  RENTAL: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  TAX_PAID: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
  STATUS_CHANGE: 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border-zinc-500/30',
}

const actionIcon: Record<string, React.ElementType> = {
  CREATE: Tag,
  UPDATE: FileEdit,
  DELETE: Trash2,
  SALE: Banknote,
  RENTAL: Receipt,
  TAX_PAID: ShieldCheck,
  STATUS_CHANGE: FileEdit,
}

export function AdminAudit() {
  const [search, setSearch] = useState('')
  const [entityFilter, setEntityFilter] = useState('ALL')
  const [actionFilter, setActionFilter] = useState('ALL')

  const { data: logs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const res = await fetch('/api/audit?limit=200')
      if (!res.ok) throw new Error('failed')
      const data = await res.json()
      return data.logs
    },
  })

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (entityFilter !== 'ALL' && l.entity !== entityFilter) return false
      if (actionFilter !== 'ALL' && l.action !== actionFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return l.details.toLowerCase().includes(q) || l.performedBy.toLowerCase().includes(q)
      }
      return true
    })
  }, [logs, search, entityFilter, actionFilter])

  const counts = useMemo(() => {
    const byAction = new Map<string, number>()
    for (const l of logs) byAction.set(l.action, (byAction.get(l.action) || 0) + 1)
    return {
      total: logs.length,
      create: byAction.get('CREATE') || 0,
      update: byAction.get('UPDATE') || 0,
      sale: (byAction.get('SALE') || 0) + (byAction.get('RENTAL') || 0),
      tax: byAction.get('TAX_PAID') || 0,
      delete: byAction.get('DELETE') || 0,
    }
  }, [logs])

  function exportCsv() {
    const headers = ['Timestamp', 'Action', 'Entity', 'Entity ID', 'Performed By', 'Details']
    const rows = filtered.map((l) => [l.timestamp, l.action, l.entity, l.entityId, l.performedBy, `"${l.details.replace(/"/g, '""')}"`])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-trail-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Total events" value={String(counts.total)} icon={ScrollText} accent="zinc" />
        <KpiCard label="Property listings" value={String(counts.create)} icon={Tag} accent="emerald" />
        <KpiCard label="Updates" value={String(counts.update)} icon={FileEdit} accent="sky" />
        <KpiCard label="Sales / rentals" value={String(counts.sale)} icon={Banknote} accent="violet" />
        <KpiCard label="Tax events" value={String(counts.tax)} icon={ShieldCheck} accent="amber" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <div className="relative sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search audit trail…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="sm:w-[150px]"><SelectValue placeholder="Entity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All entities</SelectItem>
              <SelectItem value="PROPERTY">Property</SelectItem>
              <SelectItem value="TRANSACTION">Transaction</SelectItem>
              <SelectItem value="TAX">Tax</SelectItem>
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="sm:w-[150px]"><SelectValue placeholder="Action" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All actions</SelectItem>
              <SelectItem value="CREATE">Create</SelectItem>
              <SelectItem value="UPDATE">Update</SelectItem>
              <SelectItem value="DELETE">Delete</SelectItem>
              <SelectItem value="SALE">Sale</SelectItem>
              <SelectItem value="RENTAL">Rental</SelectItem>
              <SelectItem value="TAX_PAID">Tax paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={exportCsv} disabled={filtered.length === 0}>
          <Download className="mr-1.5 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]"></TableHead>
                <TableHead className="min-w-[160px]">Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead className="min-w-[280px]">Details</TableHead>
                <TableHead>Performed by</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">No audit records match your filters.</TableCell>
                </TableRow>
              ) : (
                filtered.map((l) => {
                  const Icon = actionIcon[l.action] || ScrollIcon
                  return (
                    <TableRow key={l.id}>
                      <TableCell>
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${actionStyle[l.action] || 'bg-muted'}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDateTime(l.timestamp)}</TableCell>
                      <TableCell><Badge variant="outline" className={actionStyle[l.action]}>{l.action}</Badge></TableCell>
                      <TableCell><span className="text-sm font-medium">{l.entity}</span></TableCell>
                      <TableCell className="text-sm">{l.details}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{l.performedBy}</TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <SectionCard title="About this audit trail" desc="Immutable record of all administrative actions">
        <p className="text-sm text-muted-foreground">
          Every create, update, delete, sale, rental and tax payment is automatically logged with a timestamp,
          the actor responsible, and a human-readable description. Use the filters above to narrow down events,
          or export the filtered set to CSV for compliance reporting.
        </p>
      </SectionCard>
    </div>
  )
}
