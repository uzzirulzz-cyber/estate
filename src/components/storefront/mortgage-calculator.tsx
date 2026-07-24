'use client'

import { useState, useMemo } from 'react'
import { Calculator, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/types'

export function MortgageCalculator({
  open, onOpenChange,
}: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [price, setPrice] = useState('850000')
  const [downPayment, setDownPayment] = useState('170000')
  const [rate, setRate] = useState('6.5')
  const [years, setYears] = useState('30')

  const calc = useMemo(() => {
    const p = Math.max(0, parseFloat(price) || 0)
    const d = Math.max(0, parseFloat(downPayment) || 0)
    const principal = Math.max(0, p - d)
    const r = (parseFloat(rate) || 0) / 100 / 12
    const n = (parseInt(years, 10) || 0) * 12
    let monthly = 0
    if (r > 0 && n > 0) {
      monthly = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    } else if (n > 0) {
      monthly = principal / n
    }
    const totalPaid = monthly * n
    const totalInterest = Math.max(0, totalPaid - principal)
    const downPct = p > 0 ? (d / p) * 100 : 0
    return { principal, monthly, totalPaid, totalInterest, downPct }
  }, [price, downPayment, rate, years])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-gold/20 bg-card sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg gold-gradient text-black">
            <Calculator className="h-5 w-5" />
          </div>
          <DialogTitle className="font-serif text-xl text-white">Mortgage Calculator</DialogTitle>
          <DialogDescription>Estimate your monthly payment and total interest.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="m-price" className="text-muted-foreground">Property price</Label>
            <Input id="m-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="border-gold/15 bg-black/30 text-white" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="m-down" className="text-muted-foreground">Down payment ({calc.downPct.toFixed(0)}%)</Label>
            <Input id="m-down" type="number" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} className="border-gold/15 bg-black/30 text-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="m-rate" className="text-muted-foreground">Interest rate (%)</Label>
              <Input id="m-rate" type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} className="border-gold/15 bg-black/30 text-white" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="m-years" className="text-muted-foreground">Term (years)</Label>
              <Input id="m-years" type="number" value={years} onChange={(e) => setYears(e.target.value)} className="border-gold/15 bg-black/30 text-white" />
            </div>
          </div>

          <Separator className="my-2 bg-gold/10" />

          <div className="rounded-xl border border-gold/20 bg-gold/5 p-5">
            <div className="text-xs uppercase tracking-wide-luxury text-muted-foreground">Estimated monthly payment</div>
            <div className="mt-1 font-serif text-3xl font-bold text-gold">{formatCurrency(calc.monthly)}</div>
            <Separator className="my-4 bg-gold/10" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loan amount</span>
                <span className="font-medium text-white">{formatCurrency(calc.principal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total paid over term</span>
                <span className="font-medium text-white">{formatCurrency(calc.totalPaid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total interest</span>
                <span className="font-medium text-white">{formatCurrency(calc.totalInterest)}</span>
              </div>
            </div>
          </div>
        </div>

        <Button onClick={() => onOpenChange(false)} className="gold-gradient text-black hover:opacity-90">Done</Button>
      </DialogContent>
    </Dialog>
  )
}
