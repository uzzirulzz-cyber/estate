import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const fiscalYear = searchParams.get('fiscalYear')
  const status = searchParams.get('status')

  const where: Record<string, unknown> = {}
  if (fiscalYear) where.fiscalYear = parseInt(fiscalYear, 10)
  if (status) where.status = status

  const records = await db.taxRecord.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { transaction: { include: { property: { select: { title: true } } } } },
  })

  const totalTaxable = records.reduce((s, r) => s + r.taxableAmount, 0)
  const totalTax = records.reduce((s, r) => s + r.taxAmount, 0)
  const paidTax = records.filter((r) => r.status === 'PAID').reduce((s, r) => s + r.taxAmount, 0)
  const pendingTax = records.filter((r) => r.status === 'PENDING').reduce((s, r) => s + r.taxAmount, 0)

  // group by fiscalYear
  const yearMap = new Map<number, { fiscalYear: number; taxable: number; tax: number; paid: number; pending: number; count: number }>()
  for (const r of records) {
    const y = r.fiscalYear
    const a = yearMap.get(y) || { fiscalYear: y, taxable: 0, tax: 0, paid: 0, pending: 0, count: 0 }
    a.taxable += r.taxableAmount
    a.tax += r.taxAmount
    if (r.status === 'PAID') a.paid += r.taxAmount
    else a.pending += r.taxAmount
    a.count += 1
    yearMap.set(y, a)
  }
  const byYear = Array.from(yearMap.values()).sort((a, b) => b.fiscalYear - a.fiscalYear)

  return NextResponse.json({
    records,
    summary: { totalTaxable, totalTax, paidTax, pendingTax, count: records.length },
    byYear,
  })
}
