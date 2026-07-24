'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Clock, CheckCircle2, XCircle, Video, MapPin, Building } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDateTime } from '@/lib/types'
import { KpiCard } from './admin-ui'

interface Appt {
  id: string; customerName: string; customerEmail: string; customerPhone: string
  type: string; scheduledAt: string; status: string; notes?: string
  property?: { title: string; city: string }; agent?: { name: string }
}

const statusStyle: Record<string, string> = {
  SCHEDULED: 'border-sky-500/40 text-sky-400', CONFIRMED: 'border-emerald-500/40 text-emerald-400',
  COMPLETED: 'border-gold/40 text-gold', CANCELLED: 'border-rose-500/40 text-rose-400',
  RESCHEDULED: 'border-amber-500/40 text-amber-400',
}
const typeIcon: Record<string, React.ElementType> = { VIEWING: Building, SITE_VISIT: MapPin, MEETING: Calendar, VIRTUAL_TOUR: Video }

export function AdminAppointments() {
  const [statusFilter, setStatusFilter] = useState('ALL')

  const { data: appts = [], isLoading } = useQuery<Appt[]>({
    queryKey: ['admin-appointments', statusFilter],
    queryFn: async () => { const qs = statusFilter !== 'ALL' ? `?status=${statusFilter}` : ''; return (await fetch(`/api/appointments${qs}`)).json().then(d => d.appointments) },
  })

  const sorted = useMemo(() => [...appts].sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()), [appts])
  const upcoming = appts.filter(a => new Date(a.scheduledAt) > new Date() && a.status !== 'CANCELLED').length
  const completed = appts.filter(a => a.status === 'COMPLETED').length

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total appointments" value={String(appts.length)} icon={Calendar} accent="emerald" />
        <KpiCard label="Upcoming" value={String(upcoming)} icon={Clock} accent="sky" />
        <KpiCard label="Completed" value={String(completed)} icon={CheckCircle2} accent="gold" />
        <KpiCard label="Cancelled" value={String(appts.filter(a => a.status === 'CANCELLED').length)} icon={XCircle} accent="rose" />
      </div>

      <div className="flex items-center justify-between">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map(a => {
            const Icon = typeIcon[a.type] || Calendar
            return (
              <Card key={a.id} className="luxury-card p-5">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold"><Icon className="h-5 w-5" /></div>
                  <Badge variant="outline" className={statusStyle[a.status]}>{a.status}</Badge>
                </div>
                <h3 className="mt-3 font-serif font-semibold text-white">{a.customerName}</h3>
                <p className="text-sm text-muted-foreground">{a.property?.title || 'Property'}</p>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-gold" /> {formatDateTime(a.scheduledAt)}</div>
                  <div className="flex items-center gap-1.5"><Building className="h-3.5 w-3.5 text-gold" /> {a.type.replace('_', ' ')}</div>
                  <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-gold" /> {a.agent?.name || 'Unassigned'}</div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
