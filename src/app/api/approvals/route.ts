import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const approvalStatus = searchParams.get('approvalStatus') || 'PENDING'
  const properties = await db.property.findMany({
    where: { approvalStatus },
    orderBy: { createdAt: 'desc' },
    include: { assignedAgent: { select: { name: true } } },
  })
  return NextResponse.json({ properties, count: properties.length })
}
