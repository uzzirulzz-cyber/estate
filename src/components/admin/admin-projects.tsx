'use client'

import { useQuery } from '@tanstack/react-query'
import { Building2, Hammer, CheckCircle2, Layers } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { formatCurrency, formatNumber } from '@/lib/types'
import { KpiCard } from './admin-ui'

interface REProject {
  id: string; name: string; developer: string; location: string; city: string
  description: string; startingPrice: number; completionDate?: string
  totalUnits: number; availableUnits: number; soldUnits: number
  imageUrl: string; amenities?: string; status: string; featured: boolean
}

const statusStyle: Record<string, string> = {
  ONGOING: 'border-gold/40 text-gold', COMPLETED: 'border-emerald-500/40 text-emerald-400', UPCOMING: 'border-sky-500/40 text-sky-400',
}

export function AdminProjects() {
  const { data: projects = [], isLoading } = useQuery<REProject[]>({
    queryKey: ['admin-projects'],
    queryFn: async () => (await fetch('/api/projects')).json().then(d => d.projects),
  })

  const totalUnits = projects.reduce((s, p) => s + p.totalUnits, 0)
  const soldUnits = projects.reduce((s, p) => s + p.soldUnits, 0)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total projects" value={String(projects.length)} icon={Building2} accent="emerald" />
        <KpiCard label="Total units" value={formatNumber(totalUnits)} icon={Layers} accent="sky" />
        <KpiCard label="Units sold" value={formatNumber(soldUnits)} icon={CheckCircle2} accent="gold" />
        <KpiCard label="Ongoing" value={String(projects.filter(p => p.status === 'ONGOING').length)} icon={Hammer} accent="amber" />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map(p => {
            const soldPct = p.totalUnits > 0 ? (p.soldUnits / p.totalUnits) * 100 : 0
            return (
              <Card key={p.id} className="luxury-card overflow-hidden p-0">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute left-4 top-4 flex gap-2">
                    <Badge className="gold-gradient text-black">{p.status}</Badge>
                    {p.featured && <Badge className="bg-black/60 text-gold backdrop-blur">Featured</Badge>}
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <h3 className="font-serif text-xl font-bold text-white">{p.name}</h3>
                    <p className="text-sm text-zinc-300">{p.developer} · {p.city}</p>
                  </div>
                </div>
                <div className="p-5">
                  <p className="line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Units sold</span>
                      <span className="font-semibold text-gold">{p.soldUnits} / {p.totalUnits}</span>
                    </div>
                    <Progress value={soldPct} className="h-2" />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">Starting from</div>
                      <div className="font-serif text-lg font-bold text-white">{formatCurrency(p.startingPrice, true)}</div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <div>{p.availableUnits} available</div>
                      {p.completionDate && <div>Ready: {p.completionDate}</div>}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
