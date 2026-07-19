import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logAudit, slugify } from '@/lib/audit'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const property = await db.property.findUnique({
    where: { id },
    include: {
      transactions: {
        orderBy: { saleDate: 'desc' },
        include: { taxRecord: true },
      },
    },
  })
  if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ property })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const existing = await db.property.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const data: Record<string, unknown> = {}
    const fields = [
      'title', 'description', 'listingType', 'propertyType', 'status', 'address',
      'city', 'state', 'zipCode', 'expectedCompletion', 'imageUrl', 'gallery',
      'features', 'featured',
    ]
    for (const f of fields) if (body[f] !== undefined) data[f] = body[f]
    if (body.price !== undefined) data.price = parseFloat(body.price)
    if (body.monthlyRent !== undefined) data.monthlyRent = body.monthlyRent ? parseFloat(body.monthlyRent) : null
    if (body.projectProgress !== undefined) data.projectProgress = body.projectProgress != null ? parseInt(body.projectProgress, 10) : null
    if (body.bedrooms !== undefined) data.bedrooms = parseInt(body.bedrooms, 10)
    if (body.bathrooms !== undefined) data.bathrooms = parseFloat(body.bathrooms)
    if (body.area !== undefined) data.area = parseFloat(body.area)
    if (body.yearBuilt !== undefined) data.yearBuilt = body.yearBuilt ? parseInt(body.yearBuilt, 10) : null
    if (body.title) data.slug = slugify(body.title) + '-' + id.slice(-6)

    const property = await db.property.update({ where: { id }, data })

    await logAudit({
      action: 'UPDATE',
      entity: 'PROPERTY',
      entityId: id,
      propertyId: id,
      details: `Updated property "${property.title}"`,
    })

    return NextResponse.json({ property })
  } catch (e) {
    console.error('update property error', e)
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const existing = await db.property.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await db.property.delete({ where: { id } })

    await logAudit({
      action: 'DELETE',
      entity: 'PROPERTY',
      entityId: id,
      details: `Deleted property "${existing.title}"`,
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('delete property error', e)
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 })
  }
}
