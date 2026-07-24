'use client'

import { useQuery } from '@tanstack/react-query'
import { MapPin, Star, Layers, Globe } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { KpiCard } from './admin-ui'

interface Location {
  id: string; name: string; level: string; propertyCount: number
  popular: boolean; seoContent?: string
}

const levelStyle: Record<string, string> = {
  COUNTRY: 'bg-gold/10 text-gold', STATE: 'bg-violet-500/10 text-violet-400',
  CITY: 'bg-sky-500/10 text-sky-400', AREA: 'bg-emerald-500/10 text-emerald-400',
  SOCIETY: 'bg-amber-500/10 text-amber-400', BLOCK: 'bg-teal-500/10 text-teal-400',
}

export function AdminLocations() {
  const { data: locations = [], isLoading } = useQuery<Location[]>({
    queryKey: ['admin-locations'],
    queryFn: async () => (await fetch('/api/locations')).json().then(d => d.locations),
  })

  const popular = locations.filter(l => l.popular).length
  const totalProps = locations.reduce((s, l) => s + l.propertyCount, 0)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total locations" value={String(locations.length)} icon={MapPin} accent="emerald" />
        <KpiCard label="Popular" value={String(popular)} icon={Star} accent="gold" />
        <KpiCard label="Total properties" value={String(totalProps)} icon={Layers} accent="sky" />
        <KpiCard label="Countries" value={String(locations.filter(l => l.level === 'COUNTRY').length)} icon={Globe} accent="violet" />
      </div>

      <Card className="luxury-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Level</TableHead>
                <TableHead className="text-right">Properties</TableHead>
                <TableHead>Popular</TableHead>
                <TableHead>SEO Content</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? Array.from({ length: 6 }).map((_, i) => <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-10 w-full" /></TableCell></TableRow>) :
               locations.map(l => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium text-white">{l.name}</TableCell>
                  <TableCell><Badge className={levelStyle[l.level] || 'bg-zinc-500/10 text-zinc-300'}>{l.level}</Badge></TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{l.propertyCount}</TableCell>
                  <TableCell>{l.popular ? <Star className="h-4 w-4 fill-gold text-gold" /> : <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{l.seoContent ? <span className="line-clamp-1">{l.seoContent}</span> : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
