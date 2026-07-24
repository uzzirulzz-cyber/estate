import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const where: Record<string, unknown> = {}
  if (status) where.status = status
  const appointments = await db.appointment.findMany({
    where,
    orderBy: { scheduledAt: 'desc' },
    include: { property: { select: { title: true, city: true } }, agent: { select: { name: true } } },
  })
  return NextResponse.json({ appointments })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const appt = await db.appointment.create({ data: { ...body, scheduledAt: new Date(body.scheduledAt) } })
  return NextResponse.json({ appointment: appt }, { status: 201 })
}
