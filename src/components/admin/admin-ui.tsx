'use client'

import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

export function KpiCard({
  label, value, delta, deltaPositive = true, icon: Icon, accent = 'emerald', sub,
}: {
  label: string
  value: string
  delta?: string
  deltaPositive?: boolean
  icon: React.ElementType
  accent?: 'emerald' | 'amber' | 'rose' | 'sky' | 'violet' | 'zinc'
  sub?: string
}) {
  const accentMap: Record<string, string> = {
    emerald: 'bg-gold/10 text-gold',
    amber: 'bg-amber-400/10 text-amber-300',
    rose: 'bg-rose-400/10 text-rose-300',
    sky: 'bg-sky-400/10 text-sky-300',
    violet: 'bg-violet-400/10 text-violet-300',
    zinc: 'bg-zinc-400/10 text-zinc-300',
  }
  return (
    <Card className="luxury-card p-5">
      <div className="flex items-start justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', accentMap[accent])}>
          <Icon className="h-5 w-5" />
        </div>
        {delta && (
          <span className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
            deltaPositive ? 'bg-gold/10 text-gold' : 'bg-rose-400/10 text-rose-300',
          )}>
            {deltaPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {delta}
          </span>
        )}
      </div>
      <div className="mt-4 font-serif text-2xl font-bold tracking-tight text-white">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground/80">{sub}</div>}
    </Card>
  )
}

export function SectionCard({
  title, desc, action, children, className,
}: {
  title?: string
  desc?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={cn('luxury-card p-5', className)}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            {title && <h3 className="font-serif font-semibold text-white">{title}</h3>}
            {desc && <p className="text-sm text-muted-foreground">{desc}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </Card>
  )
}

// Lightweight responsive bar chart (revenue/profit)
export function BarChart({
  data,
  height = 220,
}: {
  data: { label: string; values: { key: string; value: number; color: string }[] }[]
  height?: number
}) {
  const max = Math.max(1, ...data.flatMap((d) => d.values.map((v) => v.value)))
  return (
    <div className="w-full">
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((d, i) => (
          <div key={i} className="group flex flex-1 flex-col items-center justify-end gap-1">
            <div className="flex w-full max-w-[44px] flex-col justify-end gap-0.5" style={{ height: height - 28 }}>
              {d.values.map((v, j) => {
                const h = (v.value / max) * 100
                return (
                  <div
                    key={j}
                    className={cn('w-full rounded-t-md transition-all duration-300', v.color)}
                    style={{ height: `${h}%`, minHeight: v.value > 0 ? 4 : 0 }}
                    title={`${v.key}: ${v.value.toLocaleString()}`}
                  />
                )
              })}
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Horizontal bar list (for rankings like top agents, sales by type)
export function BarList({
  items,
}: {
  items: { label: string; value: number; sub?: string; color?: string }[]
}) {
  const max = Math.max(1, ...items.map((i) => i.value))
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium">{it.label}</span>
            <span className="tabular-nums text-muted-foreground">
              {typeof it.value === 'number' && it.value >= 1000
                ? '$' + it.value.toLocaleString()
                : it.value}
              {it.sub && <span className="ml-2 text-xs text-muted-foreground/70">{it.sub}</span>}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn('h-full rounded-full', it.color || 'bg-emerald-500')}
              style={{ width: `${(it.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// Donut chart for distribution
export function DonutChart({
  segments, size = 160, thickness = 22, centerLabel, centerValue,
}: {
  segments: { label: string; value: number; color: string }[]
  size?: number
  thickness?: number
  centerLabel?: string
  centerValue?: string
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  const radius = (size - thickness) / 2
  const circ = 2 * Math.PI * radius
  // Precompute cumulative offsets in a pure way (no mutation during render)
  const arcs = segments.reduce<{ len: number; offset: number }[]>((acc, s) => {
    const prevOffset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].len : 0
    acc.push({ len: (s.value / total) * circ, offset: prevOffset })
    return acc
  }, [])
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={thickness} className="text-muted" />
          {segments.map((s, i) => {
            const { len, offset } = arcs[i]
            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={thickness}
                strokeDasharray={`${len} ${circ - len}`}
                strokeDashoffset={-offset}
                className={s.color}
                strokeLinecap="butt"
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && <span className="text-xl font-bold">{centerValue}</span>}
          {centerLabel && <span className="text-xs text-muted-foreground">{centerLabel}</span>}
        </div>
      </div>
      <div className="space-y-1.5">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className={cn('h-3 w-3 rounded-sm', s.color)} />
            <span className="font-medium">{s.label}</span>
            <span className="text-muted-foreground">{Math.round((s.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
