import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logAudit, slugify } from '@/lib/audit'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const listingType = searchParams.get('listingType') // SALE | RENTAL | PROJECT
  const propertyType = searchParams.get('propertyType')
  const status = searchParams.get('status')
  const city = searchParams.get('city')
  const q = searchParams.get('q') // search title/city/address
  const featured = searchParams.get('featured')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const beds = searchParams.get('beds')
  const sort = searchParams.get('sort') // newest | price-asc | price-desc

  const where: Record<string, unknown> = {}
  if (listingType) where.listingType = listingType
  if (propertyType) where.propertyType = propertyType
  if (status) where.status = status
  if (city) where.city = city
  if (featured === 'true') where.featured = true
  if (minPrice || maxPrice) {
    where.price = {}
    if (minPrice) (where.price as Record<string, unknown>).gte = parseFloat(minPrice)
    if (maxPrice) (where.price as Record<string, unknown>).lte = parseFloat(maxPrice)
  }
  if (beds) where.bedrooms = { gte: parseInt(beds, 10) }
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { city: { contains: q } },
      { address: { contains: q } },
      { description: { contains: q } },
    ]
  }

  let orderBy: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' }
  if (sort === 'price-asc') orderBy = { price: 'asc' }
  if (sort === 'price-desc') orderBy = { price: 'desc' }

  const properties = await db.property.findMany({
    where,
    orderBy,
  })

  return NextResponse.json({ properties })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const slug = body.slug || slugify(body.title) + '-' + Date.now().toString(36)
    const property = await db.property.create({
      data: {
        title: body.title,
        slug,
        description: body.description || '',
        listingType: body.listingType,
        propertyType: body.propertyType,
        status: body.status || 'AVAILABLE',
        price: parseFloat(body.price) || 0,
        monthlyRent: body.monthlyRent ? parseFloat(body.monthlyRent) : null,
        projectProgress: body.projectProgress != null ? parseInt(body.projectProgress, 10) : null,
        expectedCompletion: body.expectedCompletion || null,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        bedrooms: parseInt(body.bedrooms, 10) || 0,
        bathrooms: parseFloat(body.bathrooms) || 0,
        area: parseFloat(body.area) || 0,
        yearBuilt: body.yearBuilt ? parseInt(body.yearBuilt, 10) : null,
        imageUrl: body.imageUrl || '/properties/apt1.png',
        gallery: body.gallery || body.imageUrl || '',
        features: body.features || '',
        featured: !!body.featured,
      },
    })

    await logAudit({
      action: 'CREATE',
      entity: 'PROPERTY',
      entityId: property.id,
      propertyId: property.id,
      details: `Created property "${property.title}" (${property.listingType})`,
    })

    return NextResponse.json({ property }, { status: 201 })
  } catch (e) {
    console.error('create property error', e)
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 })
  }
}
