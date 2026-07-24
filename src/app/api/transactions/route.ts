import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logAudit } from '@/lib/audit'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') // SALE | RENTAL
  const status = searchParams.get('status')
  const fiscalYear = searchParams.get('fiscalYear')

  const where: Record<string, unknown> = {}
  if (type) where.type = type
  if (status) where.status = status
  if (fiscalYear) where.taxRecord = { fiscalYear: parseInt(fiscalYear, 10) }

  const transactions = await db.transaction.findMany({
    where,
    orderBy: { saleDate: 'desc' },
    include: { property: true, taxRecord: true },
  })

  return NextResponse.json({ transactions })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const propertyId = body.propertyId
    const type = body.type // SALE | RENTAL
    const property = await db.property.findUnique({ where: { id: propertyId } })
    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })

    const saleAmount = parseFloat(body.amount)
    if (!saleAmount || saleAmount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })

    const commissionRate = parseFloat(body.commissionRate) || (type === 'RENTAL' ? 8 : 3)
    const commissionAmount = (saleAmount * commissionRate) / 100
    const taxRate = parseFloat(body.taxRate) || (type === 'RENTAL' ? 4 : 5)
    const taxAmount = (saleAmount * taxRate) / 100
    const costs = commissionAmount * 0.35
    const profit = commissionAmount - costs
    const netRevenue = commissionAmount - taxAmount

    const saleDate = body.saleDate ? new Date(body.saleDate) : new Date()
    const fiscalYear = saleDate.getFullYear()

    const tx = await db.transaction.create({
      data: {
        propertyId,
        type,
        buyerName: body.buyerName || '—',
        sellerName: body.sellerName || property.sellerName || 'Property Owner',
        agentName: body.agentName || 'Zaraj Agent',
        amount: saleAmount,
        commissionRate,
        commissionAmount,
        taxRate,
        taxAmount,
        netRevenue,
        profit,
        saleDate,
        status: body.status || 'COMPLETED',
        paymentMethod: body.paymentMethod || 'BANK_TRANSFER',
        notes: body.notes || '',
      },
    })

    // Create tax record on commission
    const taxOnCommission = (commissionAmount * taxRate) / 100
    await db.taxRecord.create({
      data: {
        transactionId: tx.id,
        fiscalYear,
        taxRate,
        taxableAmount: commissionAmount,
        taxAmount: taxOnCommission,
        status: 'PENDING',
      },
    })

    // Update property status if completed
    if (tx.status === 'COMPLETED') {
      await db.property.update({
        where: { id: propertyId },
        data: { status: type === 'SALE' ? 'SOLD' : 'RENTED' },
      })
    }

    await logAudit({
      action: type === 'SALE' ? 'SALE' : 'RENTAL',
      entity: 'TRANSACTION',
      entityId: tx.id,
      transactionId: tx.id,
      propertyId,
      performedBy: (body.agentName || 'admin').toLowerCase().replace(/\s+/g, '.') + '@zaraj.io',
      details: `${type} of "${property.title}" for $${saleAmount.toLocaleString()} (${tx.status})`,
    })

    const created = await db.transaction.findUnique({
      where: { id: tx.id },
      include: { property: true, taxRecord: true },
    })

    return NextResponse.json({ transaction: created }, { status: 201 })
  } catch (e) {
    console.error('create transaction error', e)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}
