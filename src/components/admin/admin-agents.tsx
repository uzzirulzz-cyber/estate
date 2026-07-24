'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Star, Award, Phone, Mail, MapPin, BadgeCheck, MoreHorizontal, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/types'
import { KpiCard, BarList } from './admin-ui'

interface Agent {
  id: string; name: string; email: string; phone: string; whatsapp?: string
  photoUrl?: string; licenseNumber?: string; agency?: string; location?: string
  specialization?: string; experience: number; verified: boolean; status: string
  rating: number; totalLeads: number; convertedLeads: number; commissionEarned: number
}

export function AdminAgents() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')

  const { data: agents = [], isLoading } = useQuery<Agent[]>({
    queryKey: ['admin-agents'],
    queryFn: async () => (await fetch('/api/agents')).json().then(d => d.agents),
  })

  const filtered = useMemo(() => {
    if (!search.trim()) return agents
    const q = search.toLowerCase()
    return agents.filter(a => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || (a.specialization || '').toLowerCase().includes(q))
  }, [agents, search])

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await fetch(`/api/agents/${id}`, { method: 'DELETE' }) },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-agents'] }); toast({ title: 'Agent deleted' }) },
  })

  const totalCommission = agents.reduce((s, a) => s + a.commissionEarned, 0)
  const verifiedCount = agents.filter(a => a.verified).length

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total agents" value={String(agents.length)} icon={Award} accent="emerald" />
        <KpiCard label="Verified agents" value={String(verifiedCount)} icon={BadgeCheck} accent="emerald" />
        <KpiCard label="Total commission" value={formatCurrency(totalCommission, true)} icon={Star} accent="amber" />
        <KpiCard label="Avg rating" value={(agents.reduce((s, a) => s + a.rating, 0) / (agents.length || 1)).toFixed(1)} icon={Star} accent="violet" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="luxury-card p-5 lg:col-span-1">
          <h3 className="font-serif font-semibold text-white">Agent leaderboard</h3>
          <p className="text-sm text-muted-foreground">By commission earned</p>
          <div className="mt-4">
            <BarList items={[...agents].sort((a, b) => b.commissionEarned - a.commissionEarned).slice(0, 5).map(a => ({ label: a.name, value: a.commissionEarned, sub: `${a.convertedLeads} deals`, color: 'bg-gold' }))} />
          </div>
        </Card>

        <Card className="luxury-card overflow-hidden p-0 lg:col-span-2">
          <div className="flex items-center justify-between p-4">
            <h3 className="font-serif font-semibold text-white">All agents</h3>
            <Button size="sm" className="bg-gold text-black hover:opacity-90"><Plus className="mr-1 h-4 w-4" /> Add agent</Button>
          </div>
          <div className="relative px-4 pb-2">
            <Search className="absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search agents…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? Array.from({ length: 4 }).map((_, i) => <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-10 w-full" /></TableCell></TableRow>) :
                 filtered.map(a => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full gold-gradient text-xs font-bold text-black">{a.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
                        <div>
                          <div className="flex items-center gap-1.5 font-medium text-white">{a.name}{a.verified && <BadgeCheck className="h-4 w-4 text-gold" />}</div>
                          <div className="text-xs text-muted-foreground">{a.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{a.specialization || 'General'}</Badge></TableCell>
                    <TableCell className="text-right tabular-nums">{a.totalLeads}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums text-gold">{formatCurrency(a.commissionEarned, true)}</TableCell>
                    <TableCell><Badge variant="outline" className={a.status === 'ACTIVE' ? 'border-emerald-500/40 text-emerald-400' : 'border-rose-500/40 text-rose-400'}>{a.status}</Badge></TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-rose-400" onClick={() => deleteMutation.mutate(a.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  )
}
