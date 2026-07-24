import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const type = searchParams.get('type')
  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (type) where.type = type
  const payments = await db.payment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { transaction: { select: { buyerName: true, property: { select: { title: true } } } } },
  })
  const totalPaid = await db.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } })
  const totalPending = await db.payment.aggregate({ where: { status: 'PENDING' }, _sum: { amount: true } })
  return NextResponse.json({ payments, summary: { totalPaid: totalPaid._sum.amount || 0, totalPending: totalPending._sum.amount || 0, count: payments.length } })
}
