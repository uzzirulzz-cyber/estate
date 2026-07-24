import { db } from '../src/lib/db'

// Islamabad-based agents, buyers, sellers (Pakistani names)
const sales = [
  { city: 'F-7', state: 'Islamabad', agent: 'Ahmed Raza', buyer: 'Bilal Khan', seller: 'Capital Holdings Pvt Ltd' },
  { city: 'Bahria Town', state: 'Islamabad', agent: 'Fatima Sheikh', buyer: 'Hassan Ali', seller: 'Bahria Town Ltd' },
  { city: 'DHA Phase 2', state: 'Islamabad', agent: 'Sana Malik', buyer: 'Usman Tariq', seller: 'DHA Islamabad' },
  { city: 'F-11', state: 'Islamabad', agent: 'Imran Qureshi', buyer: 'Ayesha Siddiqui', seller: 'Margalla Builders' },
  { city: 'G-11', state: 'Islamabad', agent: 'Zainab Ahmed', buyer: 'Hamza Sheikh', seller: 'Green Valley Realty' },
  { city: 'E-7', state: 'Islamabad', agent: 'Bilal Khan', buyer: 'Mariam Iqbal', seller: 'Diplomatic Enclave Estates' },
  { city: 'Bani Gala', state: 'Islamabad', agent: 'Sana Malik', buyer: 'Asad Mahmood', seller: 'Rawal Lake View' },
  { city: 'Blue Area', state: 'Islamabad', agent: 'Ahmed Raza', buyer: 'Nida Parveen', seller: 'Centaurus Mall Group' },
]

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

async function main() {
  console.log('Seeding database (Islamabad properties, PKR pricing)...')

  // Clean
  await db.auditLog.deleteMany()
  await db.taxRecord.deleteMany()
  await db.transaction.deleteMany()
  await db.property.deleteMany()

  const now = new Date()

  const properties = [
    {
      title: 'Margalla View Luxury Villa',
      description: 'A breathtaking modern villa in F-7 with panoramic Margalla Hills views, infinity pool, and smart-home automation throughout. Designed by award-winning architects with premium imported finishes.',
      listingType: 'SALE', propertyType: 'VILLA', status: 'AVAILABLE',
      price: 185000000, monthlyRent: null, // 18.5 crore PKR
      projectProgress: null, expectedCompletion: null,
      address: 'House 12, Street 23, F-7/2', city: 'F-7', state: 'Islamabad', zipCode: '44000',
      bedrooms: 6, bathrooms: 7, area: 9000, yearBuilt: 2023,
      imageUrl: '/properties/villa1.png', gallery: '/properties/villa1.png',
      features: 'Infinity Pool,Smart Home,Wine Cellar,Home Theater,4-Car Garage,Lush Garden',
      featured: true,
    },
    {
      title: 'The Crescent Apartments',
      description: 'Contemporary apartment building in Bahria Town Phase 8 offering bright open-plan units with premium finishes, rooftop terrace, and 24/7 concierge security.',
      listingType: 'SALE', propertyType: 'APARTMENT', status: 'AVAILABLE',
      price: 22500000, monthlyRent: null, // 2.25 crore PKR
      projectProgress: null, expectedCompletion: null,
      address: 'Block C, Bahria Town Phase 8', city: 'Bahria Town', state: 'Islamabad', zipCode: '46000',
      bedrooms: 2, bathrooms: 2, area: 1450, yearBuilt: 2022,
      imageUrl: '/properties/apt1.png', gallery: '/properties/apt1.png',
      features: 'Rooftop Terrace,Concierge,Gym,24/7 Security,Pet Friendly,Backup Generator',
      featured: true,
    },
    {
      title: 'Centaurus Towers (Pre-Construction)',
      description: 'An iconic 40-story residential tower currently under construction in the heart of Islamabad. Featuring luxury residences, sky lounge, and resort-style amenities. Reserve your unit today with pre-launch pricing.',
      listingType: 'PROJECT', propertyType: 'APARTMENT', status: 'AVAILABLE',
      price: 65000000, monthlyRent: null, // 6.5 crore PKR
      projectProgress: 45, expectedCompletion: 'Q4 2026',
      address: 'Jinnah Avenue, F-8 Markaz', city: 'F-8', state: 'Islamabad', zipCode: '44000',
      bedrooms: 3, bathrooms: 3, area: 2100, yearBuilt: null,
      imageUrl: '/properties/project1.png', gallery: '/properties/project1.png',
      features: 'Sky Lounge,Infinity Pool,Spa,Valet Parking,Smart Home,Fast Elevators',
      featured: true,
    },
    {
      title: 'F-11 Family Home',
      description: 'Charming family home on a quiet street in F-11. Renovated kitchen, marble floors, private lawn, and spacious basement. Move-in ready in one of Islamabad\u2019s most sought-after sectors.',
      listingType: 'SALE', propertyType: 'HOUSE', status: 'AVAILABLE',
      price: 48000000, monthlyRent: null, // 4.8 crore PKR
      projectProgress: null, expectedCompletion: null,
      address: 'House 45, Street 10, F-11/3', city: 'F-11', state: 'Islamabad', zipCode: '44000',
      bedrooms: 5, bathrooms: 5, area: 3600, yearBuilt: 2019,
      imageUrl: '/properties/house1.png', gallery: '/properties/house1.png',
      features: 'Renovated Kitchen,Private Lawn,Marble Floors,2-Car Garage,Solar Panels,Servant Quarter',
      featured: false,
    },
    {
      title: 'The Pinnacle Penthouse',
      description: 'Ultra-luxury penthouse occupying the top floor of Centaurus with 360-degree views of Islamabad, private elevator, wraparound terrace, and designer interiors. The pinnacle of capital living.',
      listingType: 'RENTAL', propertyType: 'PENTHOUSE', status: 'AVAILABLE',
      price: 0, monthlyRent: 1200000, // 12 lakh PKR/month
      projectProgress: null, expectedCompletion: null,
      address: 'Centaurus Mall, Penthouse Floor, Jinnah Avenue', city: 'F-8', state: 'Islamabad', zipCode: '44000',
      bedrooms: 4, bathrooms: 5, area: 5200, yearBuilt: 2021,
      imageUrl: '/properties/penthouse1.png', gallery: '/properties/penthouse1.png',
      features: 'Private Elevator,Wraparound Terrace,Smart Home,Concierge,Wine Room,City View',
      featured: true,
    },
    {
      title: 'DHA Phase 2 Townhomes',
      description: 'Elegant modern townhomes in DHA Phase 2 with contemporary facades, private rooftop decks, and energy-efficient design. Steps from the DHA Club and commercial market.',
      listingType: 'SALE', propertyType: 'TOWNHOUSE', status: 'AVAILABLE',
      price: 38000000, monthlyRent: null, // 3.8 crore PKR
      projectProgress: null, expectedCompletion: null,
      address: 'Sector D, DHA Phase 2', city: 'DHA Phase 2', state: 'Islamabad', zipCode: '45750',
      bedrooms: 4, bathrooms: 4, area: 3200, yearBuilt: 2020,
      imageUrl: '/properties/townhouse1.png', gallery: '/properties/townhouse1.png',
      features: 'Rooftop Deck,Energy Efficient,Marble Floors,Attached Garage,Smart Locks,Backup Power',
      featured: false,
    },
    {
      title: 'Rawal Lake View Villa',
      description: 'Stunning villa with direct Rawal Lake access, vaulted ceilings, and walls of glass opening to a sprawling deck. The ultimate Bani Gala lifestyle with serene water views.',
      listingType: 'RENTAL', propertyType: 'VILLA', status: 'AVAILABLE',
      price: 0, monthlyRent: 850000, // 8.5 lakh PKR/month
      projectProgress: null, expectedCompletion: null,
      address: 'Bani Gala, Near Rawal Lake', city: 'Bani Gala', state: 'Islamabad', zipCode: '45500',
      bedrooms: 5, bathrooms: 6, area: 6500, yearBuilt: 2019,
      imageUrl: '/properties/beach1.png', gallery: '/properties/beach1.png',
      features: 'Lake View,Swimming Pool,Outdoor Kitchen,Landscaped Garden,Standby Generator,Solar System',
      featured: true,
    },
    {
      title: 'Blue Area Business Tower',
      description: 'Class-A commercial office tower in Blue Area, Islamabad\u2019s central business district. Flexible floor plans, premium building systems, and stunning lobby. Ideal for corporate HQ.',
      listingType: 'SALE', propertyType: 'COMMERCIAL', status: 'AVAILABLE',
      price: 320000000, monthlyRent: null, // 32 crore PKR
      projectProgress: null, expectedCompletion: null,
      address: 'Plot 14, Blue Area, F-8 Markaz', city: 'Blue Area', state: 'Islamabad', zipCode: '44000',
      bedrooms: 0, bathrooms: 8, area: 28000, yearBuilt: 2018,
      imageUrl: '/properties/commercial1.png', gallery: '/properties/commercial1.png',
      features: 'Class A,Flexible Layouts,Underground Parking,Conference Center,Caf\u00e9,High-Speed Elevators',
      featured: false,
    },
    {
      title: 'Capital Smart City (Phase 2)',
      description: 'Phase 2 of the popular Capital Smart City master-planned community. 200 villas with clubhouse, nature trails, and parks. Smart-city infrastructure with fiber to every home. Foundation work underway.',
      listingType: 'PROJECT', propertyType: 'HOUSE', status: 'AVAILABLE',
      price: 35000000, monthlyRent: null, // 3.5 crore PKR
      projectProgress: 30, expectedCompletion: 'Q2 2027',
      address: 'Capital Smart City, M-2 Motorway', city: 'Chakri Road', state: 'Islamabad', zipCode: '46000',
      bedrooms: 4, bathrooms: 4, area: 3000, yearBuilt: null,
      imageUrl: '/properties/project2.png', gallery: '/properties/project2.png',
      features: 'Smart City,Clubhouse,Nature Trails,Parks,Fiber Internet,Eco-Friendly',
      featured: false,
    },
    {
      title: 'Gulberg Greens Duplex Residences',
      description: 'Sophisticated duplex apartments in Gulberg Greens with landscaped entrances, private garages, and spacious modern layouts. Premium location near the Islamabad Expressway.',
      listingType: 'SALE', propertyType: 'DUPLEX', status: 'AVAILABLE',
      price: 42000000, monthlyRent: null, // 4.2 crore PKR
      projectProgress: null, expectedCompletion: null,
      address: 'Block D, Gulberg Greens', city: 'Gulberg Greens', state: 'Islamabad', zipCode: '45700',
      bedrooms: 4, bathrooms: 4, area: 3400, yearBuilt: 2021,
      imageUrl: '/properties/duplex1.png', gallery: '/properties/duplex1.png',
      features: 'Private Garage,Marble Floors,Fireplace,Roof Terrace,Storage,Modern Kitchen',
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
        performedBy: 'system@zaraj.io',
        details: `Property "${created.title}" listed (${created.listingType}) in ${created.city}, ${created.state}`,
      },
    })
  }

  // Create historical transactions (some properties sold/rented)
  const txData = [
    { propIdx: 0, type: 'SALE', status: 'COMPLETED', monthsAgo: 0, data: sales[0] },     // Margalla View Villa sold
    { propIdx: 1, type: 'SALE', status: 'COMPLETED', monthsAgo: 1, data: sales[1] },     // Crescent Apartments sold
    { propIdx: 3, type: 'SALE', status: 'COMPLETED', monthsAgo: 2, data: sales[3] },     // F-11 Home sold
    { propIdx: 5, type: 'SALE', status: 'COMPLETED', monthsAgo: 3, data: sales[5] },     // DHA Townhomes sold
    { propIdx: 7, type: 'SALE', status: 'COMPLETED', monthsAgo: 4, data: sales[7] },     // Blue Area Tower sold
    { propIdx: 9, type: 'SALE', status: 'COMPLETED', monthsAgo: 5, data: sales[6] },     // Gulberg Duplex sold
    { propIdx: 4, type: 'RENTAL', status: 'COMPLETED', monthsAgo: 1, data: sales[2] },   // Pinnacle Penthouse rented
    { propIdx: 6, type: 'RENTAL', status: 'COMPLETED', monthsAgo: 2, data: sales[4] },   // Rawal Lake Villa rented
    { propIdx: 2, type: 'SALE', status: 'PENDING', monthsAgo: 0, data: sales[0] },       // Centaurus pending
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
        paymentMethod: ['BANK_TRANSFER', 'WIRE', 'PAYORDER', 'CASH'][Math.floor(Math.random() * 4)],
        notes: t.type === 'SALE' ? 'Standard sale transaction in Islamabad.' : '12-month lease agreement.',
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
        performedBy: t.data.agent.toLowerCase().replace(' ', '.') + '@zaraj.io',
        details: `${t.type} of "${prop.title}" for PKR ${saleAmount.toLocaleString()} (${t.status})`,
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
        performedBy: 'admin@zaraj.io',
        details: `Updated pricing details for "${p.title}" (${p.city})`,
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
