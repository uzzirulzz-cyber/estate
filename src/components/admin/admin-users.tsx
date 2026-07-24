'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Users, UserCheck, MoreHorizontal, Trash2, BadgeCheck, Building, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/types'
import { KpiCard } from './admin-ui'

interface UserRec {
  id: string; name: string; email: string; phone?: string; role: string; status: string; verified: boolean; location?: string; createdAt: string
}

const roleStyle: Record<string, string> = {
  BUYER: 'bg-sky-500/10 text-sky-400', TENANT: 'bg-amber-500/10 text-amber-400', OWNER: 'bg-emerald-500/10 text-emerald-400',
  LANDLORD: 'bg-teal-500/10 text-teal-400', AGENT: 'bg-violet-500/10 text-violet-400', AGENCY: 'bg-rose-500/10 text-rose-400',
  DEVELOPER: 'bg-gold/10 text-gold', INVESTOR: 'bg-zinc-500/10 text-zinc-300',
}

export function AdminUsers() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')

  const { data: users = [], isLoading } = useQuery<UserRec[]>({
    queryKey: ['admin-users', roleFilter],
    queryFn: async () => { const qs = roleFilter !== 'ALL' ? `?role=${roleFilter}` : ''; return (await fetch(`/api/users${qs}`)).json().then(d => d.users) },
  })

  const filtered = useMemo(() => {
    if (!search.trim()) return users
    const q = search.toLowerCase()
    return users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
  }, [users, search])

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await fetch(`/api/users/${id}`, { method: 'DELETE' }) },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast({ title: 'User deleted' }) },
  })

  const verifiedCount = users.filter(u => u.verified).length

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total users" value={String(users.length)} icon={Users} accent="emerald" />
        <KpiCard label="Verified" value={String(verifiedCount)} icon={BadgeCheck} accent="emerald" />
        <KpiCard label="Property owners" value={String(users.filter(u => ['OWNER', 'LANDLORD', 'AGENCY', 'DEVELOPER'].includes(u.role)).length)} icon={Building} accent="amber" />
        <KpiCard label="Active" value={String(users.filter(u => u.status === 'ACTIVE').length)} icon={UserCheck} accent="sky" />
      </div>

      <Card className="luxury-card overflow-hidden p-0">
        <div className="flex flex-col gap-2 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="sm:w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All roles</SelectItem>
              <SelectItem value="BUYER">Buyers</SelectItem>
              <SelectItem value="TENANT">Tenants</SelectItem>
              <SelectItem value="OWNER">Owners</SelectItem>
              <SelectItem value="LANDLORD">Landlords</SelectItem>
              <SelectItem value="AGENT">Agents</SelectItem>
              <SelectItem value="AGENCY">Agencies</SelectItem>
              <SelectItem value="DEVELOPER">Developers</SelectItem>
              <SelectItem value="INVESTOR">Investors</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-10 w-full" /></TableCell></TableRow>) :
               filtered.map(u => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/20 bg-gold/5 text-xs font-semibold text-gold"><User className="h-4 w-4" /></div>
                      <div>
                        <div className="flex items-center gap-1.5 font-medium text-white">{u.name}{u.verified && <BadgeCheck className="h-3.5 w-3.5 text-gold" />}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge className={roleStyle[u.role] || 'bg-zinc-500/10 text-zinc-300'}>{u.role}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.location || '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                  <TableCell><Badge variant="outline" className={u.status === 'ACTIVE' ? 'border-emerald-500/40 text-emerald-400' : 'border-amber-500/40 text-amber-400'}>{u.status}</Badge></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-rose-400" onClick={() => deleteMutation.mutate(u.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
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
  )
}
