import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const where: Record<string, unknown> = {}
  if (status) where.status = status
  const projects = await db.rEProject.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ projects })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const project = await db.rEProject.create({ data: body })
  return NextResponse.json({ project }, { status: 201 })
}
