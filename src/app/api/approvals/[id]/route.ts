import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logAudit } from '@/lib/audit'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { approvalStatus, status, published } = body
  const property = await db.property.findUnique({ where: { id } })
  if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data: Record<string, unknown> = {}
  if (approvalStatus) data.approvalStatus = approvalStatus
  if (status) data.status = status
  if (published !== undefined) data.published = published
  // If approved, set status to AVAILABLE if was PENDING
  if (approvalStatus === 'APPROVED' && property.status === 'PENDING') {
    data.status = 'AVAILABLE'
  }
  const updated = await db.property.update({ where: { id }, data })

  await logAudit({
    action: approvalStatus === 'APPROVED' ? 'UPDATE' : 'UPDATE',
    entity: 'PROPERTY',
    entityId: id,
    propertyId: id,
    details: `Property "${property.title}" approval set to ${approvalStatus || status || (published ? 'published' : 'unpublished')}`,
  })

  return NextResponse.json({ property: updated })
}
