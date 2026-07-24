import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const verified = searchParams.get('verified')
  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (verified === 'true') where.verified = true
  const agents = await db.agent.findMany({ where, orderBy: { commissionEarned: 'desc' } })
  return NextResponse.json({ agents })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const agent = await db.agent.create({ data: body })
  return NextResponse.json({ agent }, { status: 201 })
}
