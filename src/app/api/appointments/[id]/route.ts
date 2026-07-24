import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const appt = await db.appointment.update({ where: { id }, data: body })
  return NextResponse.json({ appointment: appt })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.appointment.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
