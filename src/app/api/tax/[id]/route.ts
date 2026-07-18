import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logAudit } from '@/lib/audit'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const record = await db.taxRecord.findUnique({
      where: { id },
      include: { transaction: { include: { property: true } } },
    })
    if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const status = body.status || 'PAID'
    const paidDate = status === 'PAID' ? (body.paidDate ? new Date(body.paidDate) : new Date()) : null

    const updated = await db.taxRecord.update({
      where: { id },
      data: { status, paidDate },
    })

    await logAudit({
      action: 'TAX_PAID',
      entity: 'TAX',
      entityId: id,
      transactionId: record.transactionId,
      propertyId: record.transaction?.propertyId,
      details: `Tax record marked ${status} for "${record.transaction?.property?.title ?? 'transaction'}" ($${record.taxAmount.toLocaleString()})`,
    })

    return NextResponse.json({ record: updated })
  } catch (e) {
    console.error('tax update error', e)
    return NextResponse.json({ error: 'Failed to update tax record' }, { status: 500 })
  }
}
