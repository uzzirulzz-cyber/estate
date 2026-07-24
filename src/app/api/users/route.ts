import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role')
  const status = searchParams.get('status')
  const where: Record<string, unknown> = {}
  if (role) where.role = role
  if (status) where.status = status
  const users = await db.user.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ users })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const user = await db.user.create({ data: body })
  return NextResponse.json({ user }, { status: 201 })
}
