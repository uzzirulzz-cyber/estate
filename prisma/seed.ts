import { db } from '../src/lib/db'

const sales = [
  { city: 'Manhattan', state: 'NY', agent: 'Sarah Mitchell', buyer: 'James Carter', seller: 'Estate Holdings LLC' },
  { city: 'Brooklyn', state: 'NY', agent: 'David Chen', buyer: 'Olivia Bennett', seller: 'Urban Nest Group' },
  { city: 'Miami', state: 'FL', agent: 'Maria Rodriguez', buyer: 'Robert Hayes', seller: 'Coastal Properties' },
  { city: 'Austin', state: 'TX', agent: 'Tyler Brooks', buyer: 'Emma Watson', seller: 'Lonestar Realty' },
  { city: 'Seattle', state: 'WA', agent: 'Jessica Park', buyer: 'Michael Chang', seller: 'Emerald City Homes' },
  { city: 'Denver', state: 'CO', agent: 'Ryan Foster', buyer: 'Sophia Reed', seller: 'Mile High Estates' },
  { city: 'San Francisco', state: 'CA', agent: 'Daniel Kim', buyer: 'William Scott', seller: 'Bay Area Ventures' },
  { city: 'Phoenix', state: 'AZ', agent: 'Lauren Wells', buyer: 'Isabella Cruz', seller: 'Desert Sky Realty' },
]

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

async function main() {
  console.log('Seeding database...')

  // Clean
  await db.auditLog.deleteMany()
  await db.taxRecord.deleteMany()
  await db.transaction.deleteMany()
  await db.property.deleteMany()

  const now = new Date()

  const properties = [
    {
      title: 'Skyline Glass Villa',
      description: 'A breathtaking modern villa featuring floor-to-ceiling glass walls, an infinity pool, and panoramic city views. Designed by award-winning architects with smart-home automation throughout.',
      listingType: 'SALE', propertyType: 'VILLA', status: 'AVAILABLE',
      price: 2850000, monthlyRent: null,
      projectProgress: null, expectedCompletion: null,
      address: '1480 Ridge Crest Drive', city: 'Manhattan', state: 'NY', zipCode: '10019',
      bedrooms: 5, bathrooms: 4.5, area: 6200, yearBuilt: 2023,
      imageUrl: '/properties/villa1.png', gallery: '/properties/villa1.png',
      features: 'Infinity Pool,Smart Home,Wine Cellar,Home Theater,3-Car Garage',
      featured: true,
    },
    {
      title: 'The Crescent Apartments',
      description: 'Contemporary apartment building offering bright open-plan units with premium finishes, rooftop terrace, and 24/7 concierge service in the heart of downtown.',
      listingType: 'SALE', propertyType: 'APARTMENT', status: 'AVAILABLE',
      price: 685000, monthlyRent: null,
      projectProgress: null, expectedCompletion: null,
      address: '77 Crescent Boulevard', city: 'Brooklyn', state: 'NY', zipCode: '11201',
      bedrooms: 2, bathrooms: 2, area: 1450, yearBuilt: 2022,
      imageUrl: '/properties/apt1.png', gallery: '/properties/apt1.png',
      features: 'Rooftop Terrace,Concierge,Gym,Doorman,Pet Friendly',
      featured: true,
    },
    {
      title: 'Aurora Tower (Pre-Construction)',
      description: 'An iconic 42-story residential tower currently under construction. Featuring luxury residences, sky lounge, and resort-style amenities. Reserve your unit today with pre-construction pricing.',
      listingType: 'PROJECT', propertyType: 'APARTMENT', status: 'AVAILABLE',
      price: 1250000, monthlyRent: null,
      projectProgress: 45, expectedCompletion: 'Q3 2026',
      address: '900 Harborfront Avenue', city: 'Miami', state: 'FL', zipCode: '33132',
      bedrooms: 3, bathrooms: 3, area: 2100, yearBuilt: null,
      imageUrl: '/properties/project1.png', gallery: '/properties/project1.png',
      features: 'Sky Lounge,Infinity Pool,Spa,Valet Parking,Smart Home',
      featured: true,
    },
    {
      title: 'Maple Grove Family Home',
      description: 'Charming suburban family home on a quiet tree-lined street. Renovated kitchen, hardwood floors, private backyard, and finished basement. Move-in ready.',
      listingType: 'SALE', propertyType: 'HOUSE', status: 'AVAILABLE',
      price: 542000, monthlyRent: null,
      projectProgress: null, expectedCompletion: null,
      address: '24 Maple Grove Lane', city: 'Austin', state: 'TX', zipCode: '78704',
      bedrooms: 4, bathrooms: 3, area: 2800, yearBuilt: 2018,
      imageUrl: '/properties/house1.png', gallery: '/properties/house1.png',
      features: 'Renovated Kitchen,Backyard,Finished Basement,2-Car Garage,Solar Panels',
      featured: false,
    },
    {
      title: 'The Pinnacle Penthouse',
      description: 'Ultra-luxury penthouse occupying the top floor with 360-degree views, private elevator, wraparound terrace, and designer interiors. The pinnacle of urban living.',
      listingType: 'RENTAL', propertyType: 'PENTHOUSE', status: 'AVAILABLE',
      price: 0, monthlyRent: 18500,
      projectProgress: null, expectedCompletion: null,
      address: '1 Summit Place, PH', city: 'San Francisco', state: 'CA', zipCode: '94105',
      bedrooms: 4, bathrooms: 4, area: 3800, yearBuilt: 2021,
      imageUrl: '/properties/penthouse1.png', gallery: '/properties/penthouse1.png',
      features: 'Private Elevator,Wraparound Terrace,Smart Home,Concierge,Wine Room',
      featured: true,
    },
    {
      title: 'Heritage Townhomes Collection',
      description: 'Elegant row of modern townhomes with classic brick facades, private rooftop decks, and energy-efficient design. Steps from parks and dining.',
      listingType: 'SALE', propertyType: 'TOWNHOUSE', status: 'AVAILABLE',
      price: 748000, monthlyRent: null,
      projectProgress: null, expectedCompletion: null,
      address: '120-128 Heritage Row', city: 'Seattle', state: 'WA', zipCode: '98101',
      bedrooms: 3, bathrooms: 2.5, area: 2200, yearBuilt: 2020,
      imageUrl: '/properties/townhouse1.png', gallery: '/properties/townhouse1.png',
      features: 'Rooftop Deck,Energy Efficient,Hardwood Floors,Attached Garage,Smart Locks',
      featured: false,
    },
    {
      title: 'Casa del Mar Beachfront',
      description: 'Stunning beachfront retreat with direct ocean access, vaulted ceilings, and walls of glass opening to a sprawling deck. The ultimate coastal lifestyle.',
      listingType: 'RENTAL', propertyType: 'VILLA', status: 'AVAILABLE',
      price: 0, monthlyRent: 12500,
      projectProgress: null, expectedCompletion: null,
      address: '55 Coastal Highway', city: 'Miami', state: 'FL', zipCode: '33139',
      bedrooms: 4, bathrooms: 3.5, area: 3400, yearBuilt: 2019,
      imageUrl: '/properties/beach1.png', gallery: '/properties/beach1.png',
      features: 'Beachfront,Ocean View,Pool,Outdoor Kitchen,Hurricane Windows',
      featured: true,
    },
    {
      title: 'Meridian Business Tower',
      description: 'Class-A commercial office space in the central business district. Flexible floor plans, premium building systems, and stunning lobby. Ideal for HQ relocation.',
      listingType: 'SALE', propertyType: 'COMMERCIAL', status: 'AVAILABLE',
      price: 4200000, monthlyRent: null,
      projectProgress: null, expectedCompletion: null,
      address: '300 Meridian Plaza', city: 'Denver', state: 'CO', zipCode: '80202',
      bedrooms: 0, bathrooms: 6, area: 18500, yearBuilt: 2017,
      imageUrl: '/properties/commercial1.png', gallery: '/properties/commercial1.png',
      features: 'Class A,Flexible Layouts,Underground Parking,Conference Center,Café',
      featured: false,
    },
    {
      title: 'Greenfield Estates (Phase 2)',
      description: 'Phase 2 of the popular Greenfield Estates master-planned community. 60 single-family homes with community clubhouse, trails, and parks. Foundation work underway.',
      listingType: 'PROJECT', propertyType: 'HOUSE', status: 'AVAILABLE',
      price: 495000, monthlyRent: null,
      projectProgress: 25, expectedCompletion: 'Q1 2026',
      address: 'Greenfield Boulevard', city: 'Phoenix', state: 'AZ', zipCode: '85048',
      bedrooms: 4, bathrooms: 2.5, area: 2600, yearBuilt: null,
      imageUrl: '/properties/project2.png', gallery: '/properties/project2.png',
      features: 'Clubhouse,Trails,Parks,Smart Home,Energy Efficient',
      featured: false,
    },
    {
      title: 'The Laurent Duplex Residences',
      description: 'Sophisticated duplex apartments with landscaped entrances, private garages, and spacious layouts. Premium location near top schools and shopping.',
      listingType: 'SALE', propertyType: 'DUPLEX', status: 'AVAILABLE',
      price: 612000, monthlyRent: null,
      projectProgress: null, expectedCompletion: null,
      address: '88 Laurent Avenue', city: 'Austin', state: 'TX', zipCode: '78703',
      bedrooms: 3, bathrooms: 2.5, area: 1900, yearBuilt: 2021,
      imageUrl: '/properties/duplex1.png', gallery: '/properties/duplex1.png',
      features: 'Private Garage,Hardwood Floors,Fireplace,Patio,Storage',
      featured: false,
    },
  ]

  const createdProperties = []
  for (const p of properties) {
    const created = await db.property.create({
      data: { ...p, slug: slugify(p.title) },
    })
    createdProperties.push(created)
    await db.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'PROPERTY',
        entityId: created.id,
        propertyId: created.id,
        performedBy: 'system@seed',
        details: `Property "${created.title}" listed (${created.listingType})`,
      },
    })
  }

  // Create historical transactions (some properties sold/rented)
  const txData = [
    { propIdx: 0, type: 'SALE', status: 'COMPLETED', monthsAgo: 0, data: sales[0] },     // Skyline Glass Villa sold
    { propIdx: 1, type: 'SALE', status: 'COMPLETED', monthsAgo: 1, data: sales[1] },     // Crescent Apts sold
    { propIdx: 3, type: 'SALE', status: 'COMPLETED', monthsAgo: 2, data: sales[3] },     // Maple Grove sold
    { propIdx: 5, type: 'SALE', status: 'COMPLETED', monthsAgo: 3, data: sales[5] },     // Heritage Townhomes sold
    { propIdx: 7, type: 'SALE', status: 'COMPLETED', monthsAgo: 4, data: sales[7] },     // Meridian Tower sold
    { propIdx: 9, type: 'SALE', status: 'COMPLETED', monthsAgo: 5, data: sales[6] },     // Laurent Duplex sold
    { propIdx: 4, type: 'RENTAL', status: 'COMPLETED', monthsAgo: 1, data: sales[2] },   // Pinnacle Penthouse rented
    { propIdx: 6, type: 'RENTAL', status: 'COMPLETED', monthsAgo: 2, data: sales[4] },   // Casa del Mar rented
    { propIdx: 2, type: 'SALE', status: 'PENDING', monthsAgo: 0, data: sales[0] },       // Aurora Tower pending
  ]

  for (const t of txData) {
    const prop = createdProperties[t.propIdx]
    const saleAmount = t.type === 'RENTAL' ? (prop.monthlyRent ?? 0) * 12 : prop.price
    const commissionRate = t.type === 'RENTAL' ? 8 : 3
    const commissionAmount = (saleAmount * commissionRate) / 100
    const taxRate = t.type === 'RENTAL' ? 4 : 5
    const taxAmount = (saleAmount * taxRate) / 100
    const costs = commissionAmount * 0.35 // estimated operational cost
    const profit = commissionAmount - costs
    const netRevenue = commissionAmount - taxAmount
    const saleDate = new Date(now)
    saleDate.setMonth(saleDate.getMonth() - t.monthsAgo)

    const tx = await db.transaction.create({
      data: {
        propertyId: prop.id,
        type: t.type,
        buyerName: t.data.buyer,
        sellerName: t.data.seller,
        agentName: t.data.agent,
        amount: saleAmount,
        commissionRate,
        commissionAmount,
        taxRate,
        taxAmount,
        netRevenue,
        profit,
        saleDate,
        status: t.status,
        paymentMethod: ['BANK_TRANSFER', 'WIRE', 'CREDIT_CARD', 'CASH'][Math.floor(Math.random() * 4)],
        notes: t.type === 'SALE' ? 'Standard sale transaction.' : '12-month lease agreement.',
      },
    })

    const fiscalYear = saleDate.getFullYear()
    await db.taxRecord.create({
      data: {
        transactionId: tx.id,
        fiscalYear,
        taxRate,
        taxableAmount: commissionAmount,
        taxAmount: (commissionAmount * taxRate) / 100,
        status: t.status === 'COMPLETED' ? (t.monthsAgo > 2 ? 'PAID' : 'PENDING') : 'PENDING',
        paidDate: t.monthsAgo > 2 && t.status === 'COMPLETED' ? saleDate : null,
      },
    })

    await db.auditLog.create({
      data: {
        action: t.type === 'SALE' ? 'SALE' : 'RENTAL',
        entity: 'TRANSACTION',
        entityId: tx.id,
        transactionId: tx.id,
        propertyId: prop.id,
        performedBy: t.data.agent.toLowerCase().replace(' ', '.') + '@esterra.io',
        details: `${t.type} of "${prop.title}" for $${saleAmount.toLocaleString()} (${t.status})`,
      },
    })

    // Update property status if completed
    if (t.status === 'COMPLETED') {
      await db.property.update({
        where: { id: prop.id },
        data: { status: t.type === 'SALE' ? 'SOLD' : 'RENTED' },
      })
    }
  }

  // Add a few audit entries for updates
  const sampleProps = createdProperties.slice(0, 3)
  for (const p of sampleProps) {
    await db.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'PROPERTY',
        entityId: p.id,
        propertyId: p.id,
        performedBy: 'admin@esterra.io',
        details: `Updated pricing details for "${p.title}"`,
      },
    })
  }

  const counts = {
    properties: await db.property.count(),
    transactions: await db.transaction.count(),
    taxRecords: await db.taxRecord.count(),
    auditLogs: await db.auditLog.count(),
  }
  console.log('Seed complete:', counts)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
