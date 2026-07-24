'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, XCircle, Clock, FileText, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, formatDate } from '@/lib/types'
import { KpiCard } from './admin-ui'

interface ApprovProp {
  id: string; title: string; propertyType: string; listingType: string; price: number
  city: string; state: string; approvalStatus: string; status: string; createdAt: string
  assignedAgent?: { name: string }
}

export function AdminApprovals() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [tab, setTab] = useState('PENDING')

  const { data: properties = [], isLoading } = useQuery<ApprovProp[]>({
    queryKey: ['admin-approvals', tab],
    queryFn: async () => (await fetch(`/api/approvals?approvalStatus=${tab}`)).json().then(d => d.properties),
  })

  const approveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await fetch(`/api/approvals/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ approvalStatus: status }) })
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-approvals'] }); toast({ title: 'Listing updated' }) },
  })

  const tabs = [
    { key: 'PENDING', label: 'Pending', icon: Clock },
    { key: 'APPROVED', label: 'Approved', icon: CheckCircle2 },
    { key: 'REJECTED', label: 'Rejected', icon: XCircle },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tabs.map(t => (
          <KpiCard key={t.key} label={t.label + ' listings'} value={String(t.key === tab ? properties.length : '—')} icon={t.icon} accent={t.key === 'PENDING' ? 'amber' : t.key === 'APPROVED' ? 'emerald' : 'rose'} />
        ))}
        <KpiCard label="Verification" value="Active" icon={ShieldCheck} accent="sky" />
      </div>

      <div className="flex gap-1 rounded-lg border border-gold/15 p-1 sm:w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${tab === t.key ? 'bg-gold text-black' : 'text-muted-foreground hover:text-gold'}`}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      <Card className="luxury-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? Array.from({ length: 4 }).map((_, i) => <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell></TableRow>) :
               properties.length === 0 ? <TableRow><TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">No {tab.toLowerCase()} listings.</TableCell></TableRow> :
               properties.map(p => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-medium text-white">{p.title}</div>
                    <div className="text-xs text-muted-foreground">{p.city}, {p.state}</div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{p.propertyType}</Badge></TableCell>
                  <TableCell className="text-right font-semibold tabular-nums text-gold">{formatCurrency(p.price, true)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.assignedAgent?.name || 'Unassigned'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(p.createdAt)}</TableCell>
                  <TableCell><Badge variant="outline" className={p.approvalStatus === 'APPROVED' ? 'border-emerald-500/40 text-emerald-400' : p.approvalStatus === 'REJECTED' ? 'border-rose-500/40 text-rose-400' : 'border-amber-500/40 text-amber-400'}>{p.approvalStatus}</Badge></TableCell>
                  <TableCell className="text-right">
                    {tab === 'PENDING' && (
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="outline" className="h-7 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10" onClick={() => approveMutation.mutate({ id: p.id, status: 'APPROVED' })}><CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve</Button>
                        <Button size="sm" variant="outline" className="h-7 border-rose-500/40 text-rose-400 hover:bg-rose-500/10" onClick={() => approveMutation.mutate({ id: p.id, status: 'REJECTED' })}><XCircle className="mr-1 h-3.5 w-3.5" /> Reject</Button>
                      </div>
                    )}
                    {tab === 'APPROVED' && <Button size="sm" variant="outline" className="h-7 border-rose-500/40 text-rose-400" onClick={() => approveMutation.mutate({ id: p.id, status: 'REJECTED' })}><XCircle className="mr-1 h-3.5 w-3.5" /> Revoke</Button>}
                    {tab === 'REJECTED' && <Button size="sm" variant="outline" className="h-7 border-emerald-500/40 text-emerald-400" onClick={() => approveMutation.mutate({ id: p.id, status: 'APPROVED' })}><CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve</Button>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
