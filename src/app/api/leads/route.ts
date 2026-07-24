import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const stage = searchParams.get('stage')
  const agentId = searchParams.get('agentId')
  const where: Record<string, unknown> = {}
  if (stage) where.stage = stage
  if (agentId) where.assignedAgentId = agentId
  const leads = await db.lead.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { property: { select: { title: true, city: true } }, assignedAgent: { select: { name: true } } },
  })
  return NextResponse.json({ leads })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const lead = await db.lead.create({ data: body })
  return NextResponse.json({ lead }, { status: 201 })
}
