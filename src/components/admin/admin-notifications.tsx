'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, Mail, MessageSquare, Smartphone, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { formatDateTime } from '@/lib/types'
import { KpiCard } from './admin-ui'

interface Notif {
  id: string; type: string; title: string; message: string; channel: string; read: boolean; createdAt: string
}

const channelIcon: Record<string, React.ElementType> = { IN_APP: Bell, EMAIL: Mail, SMS: Smartphone, WHATSAPP: MessageSquare, PUSH: Bell }
const typeColor: Record<string, string> = {
  PROPERTY_SUBMITTED: 'bg-sky-500/10 text-sky-400', PROPERTY_APPROVED: 'bg-emerald-500/10 text-emerald-400',
  PROPERTY_REJECTED: 'bg-rose-500/10 text-rose-400', NEW_INQUIRY: 'bg-violet-500/10 text-violet-400',
  APPOINTMENT_BOOKED: 'bg-amber-500/10 text-amber-400', PAYMENT_RECEIVED: 'bg-gold/10 text-gold',
  PAYMENT_FAILED: 'bg-rose-500/10 text-rose-400', NEW_USER: 'bg-teal-500/10 text-teal-400',
}

export function AdminNotifications() {
  const qc = useQueryClient()
  const { toast } = useToast()

  const { data = { notifications: [], unreadCount: 0 }, isLoading } = useQuery<{ notifications: Notif[]; unreadCount: number }>({
    queryKey: ['admin-notifications'],
    queryFn: async () => (await fetch('/api/notifications')).json(),
  })
  const notifications = data.notifications
  const unread = data.unreadCount

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => { await fetch(`/api/notifications/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ read: true }) }) },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-notifications'] }),
  })
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await fetch(`/api/notifications/${id}`, { method: 'DELETE' }) },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-notifications'] }); toast({ title: 'Notification deleted' }) },
  })

  function markAllRead() {
    notifications.filter(n => !n.read).forEach(n => markReadMutation.mutate(n.id))
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total notifications" value={String(notifications.length)} icon={Bell} accent="emerald" />
        <KpiCard label="Unread" value={String(unread)} icon={Bell} accent="rose" />
        <KpiCard label="Email channel" value={String(notifications.filter(n => n.channel === 'EMAIL').length)} icon={Mail} accent="sky" />
        <KpiCard label="In-app" value={String(notifications.filter(n => n.channel === 'IN_APP').length)} icon={Bell} accent="violet" />
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-white">Notification center</h3>
        <Button variant="outline" size="sm" onClick={markAllRead} className="border-gold/30 text-gold hover:bg-gold/10"><CheckCheck className="mr-1.5 h-4 w-4" /> Mark all read</Button>
      </div>

      <div className="space-y-2">
        {isLoading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />) :
         notifications.map(n => {
          const Icon = channelIcon[n.channel] || Bell
          return (
            <Card key={n.id} className={`luxury-card flex items-center gap-4 p-4 ${!n.read ? 'border-gold/30' : ''}`}>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${typeColor[n.type] || 'bg-gold/10 text-gold'}`}><Icon className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{n.title}</span>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-gold" />}
                </div>
                <p className="text-sm text-muted-foreground">{n.message}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-[10px]">{n.channel}</Badge>
                  <span>{formatDateTime(n.createdAt)}</span>
                </div>
              </div>
              <div className="flex gap-1">
                {!n.read && <Button size="sm" variant="ghost" className="h-8 text-gold" onClick={() => markReadMutation.mutate(n.id)}><CheckCheck className="h-4 w-4" /></Button>}
                <Button size="sm" variant="ghost" className="h-8 text-rose-400" onClick={() => deleteMutation.mutate(n.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
