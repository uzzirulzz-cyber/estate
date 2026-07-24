'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Target, TrendingUp, CheckCircle2, XCircle, MoreHorizontal, Trash2, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, formatDate } from '@/lib/types'
import { KpiCard } from './admin-ui'

interface Lead {
  id: string; customerName: string; email: string; phone: string; budget?: number
  locationPref?: string; propertyTypePref?: string; listingType: string; stage: string
  source: string; score: number; notes?: string; followUpDate?: string; createdAt: string
  property?: { title: string; city: string }; assignedAgent?: { name: string }
}

const stageStyle: Record<string, string> = {
  NEW: 'border-sky-500/40 text-sky-400', CONTACTED: 'border-violet-500/40 text-violet-400',
  FOLLOW_UP: 'border-amber-500/40 text-amber-400', VIEWING: 'border-teal-500/40 text-teal-400',
  NEGOTIATION: 'border-gold/40 text-gold', CONVERTED: 'border-emerald-500/40 text-emerald-400',
  LOST: 'border-rose-500/40 text-rose-400',
}

const STAGES = ['NEW', 'CONTACTED', 'FOLLOW_UP', 'VIEWING', 'NEGOTIATION', 'CONVERTED', 'LOST']

export function AdminLeads() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('ALL')
  const [view, setView] = useState<'pipeline' | 'table'>('pipeline')

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ['admin-leads', stageFilter],
    queryFn: async () => { const qs = stageFilter !== 'ALL' ? `?stage=${stageFilter}` : ''; return (await fetch(`/api/leads${qs}`)).json().then(d => d.leads) },
  })

  const filtered = useMemo(() => {
    if (!search.trim()) return leads
    const q = search.toLowerCase()
    return leads.filter(l => l.customerName.toLowerCase().includes(q) || l.email.toLowerCase().includes(q))
  }, [leads, search])

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await fetch(`/api/leads/${id}`, { method: 'DELETE' }) },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-leads'] }); toast({ title: 'Lead deleted' }) },
  })

  const converted = leads.filter(l => l.stage === 'CONVERTED').length
  const conversionRate = leads.length > 0 ? (converted / leads.length) * 100 : 0
  const avgScore = leads.length > 0 ? leads.reduce((s, l) => s + l.score, 0) / leads.length : 0

  const pipelineByStage = STAGES.map(stage => ({ stage, leads: leads.filter(l => l.stage === stage) }))

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total leads" value={String(leads.length)} icon={Target} accent="violet" />
        <KpiCard label="Converted" value={String(converted)} icon={CheckCircle2} accent="emerald" />
        <KpiCard label="Conversion rate" value={`${conversionRate.toFixed(1)}%`} icon={TrendingUp} accent="emerald" />
        <KpiCard label="Avg lead score" value={avgScore.toFixed(0)} icon={Target} accent="amber" />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <div className="relative sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search leads…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="sm:w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All stages</SelectItem>
              {STAGES.map(s => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-1 rounded-lg border border-gold/15 p-1">
          <button onClick={() => setView('pipeline')} className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${view === 'pipeline' ? 'bg-gold text-black' : 'text-muted-foreground hover:text-gold'}`}>Pipeline</button>
          <button onClick={() => setView('table')} className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${view === 'table' ? 'bg-gold text-black' : 'text-muted-foreground hover:text-gold'}`}>Table</button>
        </div>
      </div>

      {view === 'pipeline' ? (
        <div className="grid gap-4 lg:grid-cols-4 xl:grid-cols-7">
          {pipelineByStage.map(col => (
            <Card key={col.stage} className="luxury-card flex max-h-[600px] flex-col p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wide-luxury text-gold">{col.stage.replace('_', ' ')}</span>
                <Badge variant="outline" className="border-gold/20">{col.leads.length}</Badge>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto">
                {col.leads.map(l => (
                  <Card key={l.id} className="border-gold/10 bg-black/30 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{l.customerName}</span>
                      <span className="text-xs font-bold text-gold">{l.score}</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{l.assignedAgent?.name || 'Unassigned'}</div>
                    {l.budget && <div className="mt-1 text-xs text-gold">{formatCurrency(l.budget, true)}</div>}
                    {l.propertyTypePref && <Badge variant="outline" className="mt-2 text-[10px]">{l.propertyTypePref}</Badge>}
                  </Card>
                ))}
                {col.leads.length === 0 && <p className="px-1 py-4 text-center text-xs text-muted-foreground">No leads</p>}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="luxury-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Interested in</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Follow-up</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? Array.from({ length: 6 }).map((_, i) => <TableRow key={i}><TableCell colSpan={8}><Skeleton className="h-10 w-full" /></TableCell></TableRow>) :
                 filtered.map(l => (
                  <TableRow key={l.id}>
                    <TableCell>
                      <div className="font-medium text-white">{l.customerName}</div>
                      <div className="text-xs text-muted-foreground">{l.email}</div>
                    </TableCell>
                    <TableCell className="text-sm">{l.property?.title || l.propertyTypePref || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{l.assignedAgent?.name || '—'}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums text-gold">{l.budget ? formatCurrency(l.budget, true) : '—'}</TableCell>
                    <TableCell><Badge variant="outline" className={stageStyle[l.stage]}>{l.stage.replace('_', ' ')}</Badge></TableCell>
                    <TableCell><span className="font-bold text-gold">{l.score}</span></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{l.followUpDate ? formatDate(l.followUpDate) : '—'}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-rose-400" onClick={() => deleteMutation.mutate(l.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  )
}
