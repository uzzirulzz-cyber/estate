import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const level = searchParams.get('level')
  const where: Record<string, unknown> = {}
  if (level) where.level = level
  const locations = await db.location.findMany({ where, orderBy: [{ level: 'asc' }, { name: 'asc' }] })
  return NextResponse.json({ locations })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const location = await db.location.create({ data: body })
  return NextResponse.json({ location }, { status: 201 })
}
