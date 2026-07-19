import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const months = parseInt(searchParams.get('months') || '6', 10)

  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)

  const transactions = await db.transaction.findMany({
    where: { status: 'COMPLETED', saleDate: { gte: start } },
    orderBy: { saleDate: 'asc' },
  })

  // Build monthly buckets
  const buckets: { label: string; revenue: number; profit: number; tax: number; volume: number; deals: number }[] = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({
      label: d.toLocaleString('en-US', { month: 'short' }),
      revenue: 0,
      profit: 0,
      tax: 0,
      volume: 0,
      deals: 0,
    })
  }

  for (const t of transactions) {
    const idx = buckets.length - 1 - (now.getMonth() - t.saleDate.getMonth()) - (now.getFullYear() - t.saleDate.getFullYear()) * 12
    if (idx >= 0 && idx < buckets.length) {
      buckets[idx].revenue += t.commissionAmount
      buckets[idx].profit += t.profit
      buckets[idx].tax += t.taxAmount
      buckets[idx].volume += t.amount
      buckets[idx].deals += 1
    }
  }

  return NextResponse.json({ series: buckets })
}
