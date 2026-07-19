'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Receipt, TrendingUp, Wallet, Landmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Transaction, Property, formatCurrency, formatDate } from '@/lib/types'
import { KpiCard } from './admin-ui'

const txStatusStyle: Record<string, string> = {
  COMPLETED: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  PENDING: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  CANCELLED: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
}

const emptyForm = {
  propertyId: '', type: 'SALE' as 'SALE' | 'RENTAL',
  amount: '', commissionRate: '3', taxRate: '5',
  buyerName: '', sellerName: '', agentName: '',
  saleDate: new Date().toISOString().slice(0, 10),
  status: 'COMPLETED', paymentMethod: 'BANK_TRANSFER', notes: '',
}

export function AdminSales() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['admin-transactions', typeFilter],
    queryFn: async () => {
      const qs = typeFilter !== 'ALL' ? `?type=${typeFilter}` : ''
      const res = await fetch(`/api/transactions${qs}`)
      if (!res.ok) throw new Error('failed')
      const data = await res.json()
      return data.transactions
    },
  })

  const { data: availableProperties = [] } = useQuery<Property[]>({
    queryKey: ['admin-properties-for-tx'],
    queryFn: async () => {
      const res = await fetch('/api/properties')
      if (!res.ok) throw new Error('failed')
      const data = await res.json()
      return data.properties
    },
  })

  const filtered = useMemo(() => {
    if (!search.trim()) return transactions
    const q = search.toLowerCase()
    return transactions.filter((t) =>
      t.buyerName.toLowerCase().includes(q) ||
      t.sellerName.toLowerCase().includes(q) ||
      t.agentName.toLowerCase().includes(q) ||
      (t.property?.title || '').toLowerCase().includes(q),
    )
  }, [transactions, search])

  const totals = useMemo(() => {
    const completed = transactions.filter((t) => t.status === 'COMPLETED')
    return {
      volume: completed.reduce((s, t) => s + t.amount, 0),
      revenue: completed.reduce((s, t) => s + t.commissionAmount, 0),
      profit: completed.reduce((s, t) => s + t.profit, 0),
      tax: completed.reduce((s, t) => s + t.taxAmount, 0),
      count: completed.length,
    }
  }, [transactions])

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch('/api/transactions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'failed')
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      qc.invalidateQueries({ queryKey: ['dashboard-chart'] })
      qc.invalidateQueries({ queryKey: ['admin-properties'] })
      qc.invalidateQueries({ queryKey: ['storefront-properties'] })
      toast({ title: 'Transaction recorded', description: 'Sale/rental logged and property status updated.' })
      setFormOpen(false)
      setForm(emptyForm)
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  })

  function openCreate() {
    setForm({
      ...emptyForm,
      propertyId: availableProperties[0]?.id || '',
      agentName: 'Sarah Mitchell',
    })
    setFormOpen(true)
  }

  // auto-fill amount & commission when property/type changes
  function onPropertyChange(id: string) {
    const prop = availableProperties.find((p) => p.id === id)
    if (prop) {
      const amt = form.type === 'RENTAL' && prop.monthlyRent ? prop.monthlyRent * 12 : prop.price
      const rate = form.type === 'RENTAL' ? '8' : '3'
      const tax = form.type === 'RENTAL' ? '4' : '5'
      setForm({ ...form, propertyId: id, amount: String(amt), commissionRate: rate, taxRate: tax, sellerName: form.sellerName || 'Property Owner' })
    } else {
      setForm({ ...form, propertyId: id })
    }
  }
  function onTypeChange(t: 'SALE' | 'RENTAL') {
    const prop = availableProperties.find((p) => p.id === form.propertyId)
    const amt = t === 'RENTAL' && prop?.monthlyRent ? prop.monthlyRent * 12 : (prop?.price ?? Number(form.amount))
    setForm({ ...form, type: t, amount: String(amt), commissionRate: t === 'RENTAL' ? '8' : '3', taxRate: t === 'RENTAL' ? '4' : '5' })
  }

  const previewAmount = parseFloat(form.amount) || 0
  const previewCommission = (previewAmount * (parseFloat(form.commissionRate) || 0)) / 100
  const previewTax = (previewAmount * (parseFloat(form.taxRate) || 0)) / 100
  const previewProfit = previewCommission * 0.65

  return (
    <div className="space-y-4">
      {/* KPI ROW */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Sales volume" value={formatCurrency(totals.volume, true)} icon={Receipt} accent="sky" sub={`${totals.count} completed`} />
        <KpiCard label="Commission revenue" value={formatCurrency(totals.revenue, true)} icon={TrendingUp} accent="emerald" />
        <KpiCard label="Net profit" value={formatCurrency(totals.profit, true)} icon={Wallet} accent="emerald" />
        <KpiCard label="Tax collected" value={formatCurrency(totals.tax, true)} icon={Landmark} accent="amber" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <div className="relative sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search buyer, agent, property…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="sm:w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All transactions</SelectItem>
              <SelectItem value="SALE">Sales</SelectItem>
              <SelectItem value="RENTAL">Rentals</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700" disabled={availableProperties.length === 0}>
          <Plus className="mr-1 h-4 w-4" /> Record transaction
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[220px]">Property</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Buyer / Seller</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Commission</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-right">Tax</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={10}><Skeleton className="h-12 w-full" /></TableCell></TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="py-10 text-center text-sm text-muted-foreground">No transactions found.</TableCell>
                </TableRow>
              ) : (
                filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <div className="font-medium leading-tight">{t.property?.title || '—'}</div>
                      <div className="text-xs text-muted-foreground">{t.property?.city}, {t.property?.state}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{t.type}</Badge></TableCell>
                    <TableCell>
                      <div className="text-sm">{t.buyerName}</div>
                      <div className="text-xs text-muted-foreground">{t.sellerName}</div>
                    </TableCell>
                    <TableCell className="text-sm">{t.agentName}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{formatCurrency(t.amount, true)}</TableCell>
                    <TableCell className="text-right tabular-nums text-emerald-600">{formatCurrency(t.commissionAmount, true)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(t.profit, true)}</TableCell>
                    <TableCell className="text-right tabular-nums text-amber-600">{formatCurrency(t.taxAmount, true)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(t.saleDate)}</TableCell>
                    <TableCell><Badge variant="outline" className={txStatusStyle[t.status]}>{t.status}</Badge></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* CREATE DIALOG */}
      <Dialog open={formOpen} onOpenChange={(o) => { if (!o) setFormOpen(false) }}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record a transaction</DialogTitle>
            <DialogDescription>Log a sale or rental. Commission, tax and profit are calculated automatically.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Property</Label>
                <Select value={form.propertyId} onValueChange={onPropertyChange}>
                  <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                  <SelectContent>
                    {availableProperties.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.title} — {p.city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Transaction type</Label>
                <Select value={form.type} onValueChange={(v) => onTypeChange(v as 'SALE' | 'RENTAL')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SALE">Sale</SelectItem>
                    <SelectItem value="RENTAL">Rental (12-mo lease)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="amount">Deal amount ($)</Label>
                <Input id="amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="comm">Commission (%)</Label>
                <Input id="comm" type="number" value={form.commissionRate} onChange={(e) => setForm({ ...form, commissionRate: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="taxr">Tax rate (%)</Label>
                <Input id="taxr" type="number" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="buyer">Buyer / Tenant</Label>
                <Input id="buyer" value={form.buyerName} onChange={(e) => setForm({ ...form, buyerName: e.target.value })} placeholder="Full name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="seller">Seller / Landlord</Label>
                <Input id="seller" value={form.sellerName} onChange={(e) => setForm({ ...form, sellerName: e.target.value })} placeholder="Owner or company" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="agent">Agent</Label>
                <Input id="agent" value={form.agentName} onChange={(e) => setForm({ ...form, agentName: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={form.saleDate} onChange={(e) => setForm({ ...form, saleDate: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Payment method</Label>
                <Select value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="WIRE">Wire</SelectItem>
                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>

            {/* preview */}
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/60 bg-muted/40 p-4 sm:grid-cols-4">
              <PreviewStat label="Commission" value={formatCurrency(previewCommission, true)} accent="text-emerald-600" />
              <PreviewStat label="Tax" value={formatCurrency(previewTax, true)} accent="text-amber-600" />
              <PreviewStat label="Est. profit" value={formatCurrency(previewProfit, true)} accent="text-emerald-600" />
              <PreviewStat label="Net revenue" value={formatCurrency(previewCommission - previewTax, true)} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={!form.propertyId || !form.amount || createMutation.isPending}
              onClick={() => createMutation.mutate(form)}
            >
              {createMutation.isPending ? 'Recording…' : 'Record transaction'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PreviewStat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-base font-bold ${accent || ''}`}>{value}</div>
    </div>
  )
}
