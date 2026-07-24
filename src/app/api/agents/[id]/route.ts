import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const agent = await db.agent.findUnique({ where: { id }, include: { properties: true, leads: true } })
  if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ agent })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const agent = await db.agent.update({ where: { id }, data: body })
  return NextResponse.json({ agent })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.agent.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
