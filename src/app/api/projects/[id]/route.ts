import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const project = await db.rEProject.update({ where: { id }, data: body })
  return NextResponse.json({ project })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.rEProject.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
