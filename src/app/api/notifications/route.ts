import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const unreadOnly = searchParams.get('unread') === 'true'
  const where: Record<string, unknown> = {}
  if (unreadOnly) where.read = false
  const notifications = await db.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 })
  const unreadCount = await db.notification.count({ where: { read: false } })
  return NextResponse.json({ notifications, unreadCount })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const notification = await db.notification.create({ data: body })
  return NextResponse.json({ notification }, { status: 201 })
}
