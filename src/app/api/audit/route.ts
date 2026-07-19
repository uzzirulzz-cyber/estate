import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const entity = searchParams.get('entity')
  const action = searchParams.get('action')
  const limit = parseInt(searchParams.get('limit') || '50', 10)

  const where: Record<string, unknown> = {}
  if (entity) where.entity = entity
  if (action) where.action = action

  const logs = await db.auditLog.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: limit,
    include: { property: { select: { title: true } }, transaction: { include: { property: { select: { title: true } } } } },
  })

  return NextResponse.json({ logs })
}
