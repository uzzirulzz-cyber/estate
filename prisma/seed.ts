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

  // Clean all collections
  await db.notification.deleteMany()
  await db.location.deleteMany()
  await db.rEProject.deleteMany()
  await db.payment.deleteMany()
  await db.appointment.deleteMany()
  await db.lead.deleteMany()
  await db.user.deleteMany()
  await db.agent.deleteMany()
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
      data: { ...p, slug: slugify(p.title), approvalStatus: 'APPROVED', published: true },
    })
    createdProperties.push(created)
    await db.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'PROPERTY',
        entityId: created.id,
        propertyId: created.id,
        performedBy: 'system@propertyatlas.lifestyle',
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
        performedBy: t.data.agent.toLowerCase().replace(' ', '.') + '@propertyatlas.lifestyle',
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
        performedBy: 'admin@propertyatlas.lifestyle',
        details: `Updated pricing details for "${p.title}" (${p.city})`,
      },
    })
  }

  // ── AGENTS ──────────────────────────────────────────────
  const agents = [
    { name: 'Ahmed Raza', email: 'ahmed.raza@propertyatlas.lifestyle', phone: '+92 300 1234567', whatsapp: '+92 300 1234567', licenseNumber: 'RLA-001', agency: 'PropertyAtlas', location: 'F-7, Islamabad', specialization: 'Luxury Homes', experience: 12, verified: true, rating: 4.9, commissionEarned: 9500000 },
    { name: 'Fatima Sheikh', email: 'fatima.sheikh@propertyatlas.lifestyle', phone: '+92 301 2345678', whatsapp: '+92 301 2345678', licenseNumber: 'RLA-002', agency: 'PropertyAtlas', location: 'Bahria Town, Islamabad', specialization: 'Apartments', experience: 8, verified: true, rating: 4.8, commissionEarned: 6200000 },
    { name: 'Bilal Khan', email: 'bilal.khan@propertyatlas.lifestyle', phone: '+92 302 3456789', whatsapp: '+92 302 3456789', licenseNumber: 'RLA-003', agency: 'PropertyAtlas', location: 'DHA, Islamabad', specialization: 'Commercial', experience: 10, verified: true, rating: 4.7, commissionEarned: 8100000 },
    { name: 'Sana Malik', email: 'sana.malik@propertyatlas.lifestyle', phone: '+92 303 4567890', whatsapp: '+92 303 4567890', licenseNumber: 'RLA-004', agency: 'PropertyAtlas', location: 'F-11, Islamabad', specialization: 'Family Homes', experience: 6, verified: true, rating: 4.6, commissionEarned: 4300000 },
    { name: 'Imran Qureshi', email: 'imran.qureshi@propertyatlas.lifestyle', phone: '+92 304 5678901', whatsapp: '+92 304 5678901', licenseNumber: 'RLA-005', agency: 'PropertyAtlas', location: 'Bani Gala, Islamabad', specialization: 'Villas', experience: 15, verified: false, rating: 4.5, commissionEarned: 5600000 },
    { name: 'Zainab Ahmed', email: 'zainab.ahmed@propertyatlas.lifestyle', phone: '+92 305 6789012', whatsapp: '+92 305 6789012', licenseNumber: 'RLA-006', agency: 'PropertyAtlas', location: 'Gulberg Greens, Islamabad', specialization: 'Investment', experience: 9, verified: true, rating: 4.8, commissionEarned: 7200000 },
  ]
  const createdAgents = []
  for (const a of agents) {
    createdAgents.push(await db.agent.create({ data: { ...a, totalLeads: Math.floor(Math.random() * 40) + 10, convertedLeads: Math.floor(Math.random() * 15) + 3 } }))
  }
  // Assign agents to properties (round-robin)
  createdProperties.forEach((p, i) => {
    p.assignedAgentId = createdAgents[i % createdAgents.length].id
  })
  // Update properties with assigned agent
  for (let i = 0; i < createdProperties.length; i++) {
    await db.property.update({ where: { id: createdProperties[i].id }, data: { assignedAgentId: createdAgents[i % createdAgents.length].id } })
  }

  // ── USERS ───────────────────────────────────────────────
  const users = [
    { name: 'Bilal Khan', email: 'bilal.khan@email.com', phone: '+92 310 1111111', role: 'BUYER', location: 'Islamabad', verified: true },
    { name: 'Hassan Ali', email: 'hassan.ali@email.com', phone: '+92 311 2222222', role: 'BUYER', location: 'Rawalpindi', verified: true },
    { name: 'Ayesha Siddiqui', email: 'ayesha.s@email.com', phone: '+92 312 3333333', role: 'OWNER', location: 'F-7, Islamabad', verified: true },
    { name: 'Usman Tariq', email: 'usman.t@email.com', phone: '+92 313 4444444', role: 'TENANT', location: 'Bahria Town', verified: false },
    { name: 'Mariam Iqbal', email: 'mariam.i@email.com', phone: '+92 314 5555555', role: 'LANDLORD', location: 'DHA, Islamabad', verified: true },
    { name: 'Asad Mahmood', email: 'asad.m@email.com', phone: '+92 315 6666666', role: 'INVESTOR', location: 'Lahore', verified: true },
    { name: 'Nida Parveen', email: 'nida.p@email.com', phone: '+92 316 7777777', role: 'BUYER', location: 'Karachi', verified: false },
    { name: 'Hamza Sheikh', email: 'hamza.s@email.com', phone: '+92 317 8888888', role: 'DEVELOPER', location: 'Islamabad', verified: true },
    { name: 'Capital Holdings', email: 'info@capitalholdings.pk', phone: '+92 51 1111222', role: 'AGENCY', location: 'Blue Area, Islamabad', verified: true },
    { name: 'Bahria Town Ltd', email: 'info@bahriatown.com', phone: '+92 51 2222333', role: 'DEVELOPER', location: 'Bahria Town, Islamabad', verified: true },
  ]
  for (const u of users) {
    await db.user.create({ data: u })
  }

  // ── LEADS ───────────────────────────────────────────────
  const leadStages = ['NEW', 'CONTACTED', 'FOLLOW_UP', 'VIEWING', 'NEGOTIATION', 'CONVERTED', 'LOST']
  const leadSources = ['WEBSITE', 'REFERRAL', 'SOCIAL', 'CALL', 'WALK_IN']
  const leadNames = ['Bilal Khan', 'Hassan Ali', 'Ayesha Siddiqui', 'Usman Tariq', 'Mariam Iqbal', 'Asad Mahmood', 'Nida Parveen', 'Hamza Sheikh', 'Sadia Anwar', 'Kamran Akhtar', 'Rabia Naeem', 'Tariq Jamil']
  for (let i = 0; i < 24; i++) {
    const stage = leadStages[Math.floor(Math.random() * leadStages.length)]
    const agent = createdAgents[Math.floor(Math.random() * createdAgents.length)]
    const prop = createdProperties[Math.floor(Math.random() * createdProperties.length)]
    const followUp = new Date(now); followUp.setDate(followUp.getDate() + Math.floor(Math.random() * 14))
    await db.lead.create({
      data: {
        customerName: leadNames[i % leadNames.length] + ' ' + (i + 1),
        email: `lead${i + 1}@email.com`,
        phone: `+92 32${i} ${1000000 + i}`,
        propertyId: prop.id,
        budget: [15000000, 25000000, 45000000, 80000000, 120000000][Math.floor(Math.random() * 5)],
        locationPref: prop.city,
        propertyTypePref: prop.propertyType,
        listingType: prop.listingType === 'RENTAL' ? 'RENTAL' : 'SALE',
        assignedAgentId: agent.id,
        stage,
        source: leadSources[Math.floor(Math.random() * leadSources.length)],
        score: Math.floor(Math.random() * 60) + 40,
        notes: stage === 'CONVERTED' ? 'Deal closed successfully.' : 'Interested client, following up.',
        followUpDate: followUp,
      },
    })
  }

  // ── APPOINTMENTS ────────────────────────────────────────
  const apptTypes = ['VIEWING', 'SITE_VISIT', 'MEETING', 'VIRTUAL_TOUR']
  const apptStatuses = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED']
  for (let i = 0; i < 16; i++) {
    const prop = createdProperties[Math.floor(Math.random() * createdProperties.length)]
    const agent = createdAgents[Math.floor(Math.random() * createdAgents.length)]
    const scheduled = new Date(now); scheduled.setDate(scheduled.getDate() + (i - 8)); scheduled.setHours(10 + (i % 8), 0, 0, 0)
    await db.appointment.create({
      data: {
        propertyId: prop.id,
        agentId: agent.id,
        customerName: leadNames[i % leadNames.length],
        customerEmail: `client${i + 1}@email.com`,
        customerPhone: `+92 33${i} ${2000000 + i}`,
        type: apptTypes[Math.floor(Math.random() * apptTypes.length)],
        scheduledAt: scheduled,
        status: apptStatuses[Math.floor(Math.random() * apptStatuses.length)],
        notes: 'Property viewing scheduled.',
      },
    })
  }

  // ── PAYMENTS ────────────────────────────────────────────
  // Add payments for completed transactions
  const allTx = await db.transaction.findMany()
  let invCounter = 1
  for (const tx of allTx) {
    if (tx.status === 'COMPLETED') {
      // commission payment
      await db.payment.create({
        data: {
          transactionId: tx.id,
          amount: tx.commissionAmount,
          type: 'COMMISSION',
          status: 'PAID',
          method: tx.paymentMethod,
          invoiceNumber: `INV-${String(invCounter++).padStart(4, '0')}`,
          payerName: tx.buyerName,
          paidDate: tx.saleDate,
        },
      })
      // property payment
      await db.payment.create({
        data: {
          transactionId: tx.id,
          amount: tx.amount,
          type: tx.type === 'SALE' ? 'PROPERTY' : 'RENTAL',
          status: 'PAID',
          method: tx.paymentMethod,
          invoiceNumber: `INV-${String(invCounter++).padStart(4, '0')}`,
          payerName: tx.buyerName,
          paidDate: tx.saleDate,
        },
      })
    } else if (tx.status === 'PENDING') {
      await db.payment.create({
        data: {
          transactionId: tx.id,
          amount: tx.amount * 0.1,
          type: 'DEPOSIT',
          status: 'PENDING',
          method: 'BANK_TRANSFER',
          invoiceNumber: `INV-${String(invCounter++).padStart(4, '0')}`,
          payerName: tx.buyerName,
          dueDate: new Date(now.getTime() + 7 * 86400000),
        },
      })
    }
  }
  // A few failed/refunded payments
  for (let i = 0; i < 3; i++) {
    const tx = allTx[Math.floor(Math.random() * allTx.length)]
    await db.payment.create({
      data: {
        transactionId: tx?.id,
        amount: [500000, 1200000, 800000][i],
        type: 'PLATFORM_FEE',
        status: ['FAILED', 'REFUNDED', 'PARTIAL'][i],
        method: 'CREDIT_CARD',
        invoiceNumber: `INV-${String(invCounter++).padStart(4, '0')}`,
        payerName: tx?.buyerName || 'Unknown',
      },
    })
  }

  // ── REAL ESTATE PROJECTS ────────────────────────────────
  const projects = [
    { name: 'Centaurus Towers', developer: 'Centaurus Mall Group', location: 'Jinnah Avenue, F-8', city: 'Islamabad', description: 'Iconic mixed-use twin towers with luxury residences, shopping mall, and 5-star hotel.', startingPrice: 65000000, completionDate: 'Q4 2026', totalUnits: 320, availableUnits: 145, soldUnits: 175, imageUrl: '/properties/project1.png', amenities: 'Sky Lounge,Infinity Pool,Spa,Valet Parking,Smart Home,Fast Elevators', status: 'ONGOING', featured: true },
    { name: 'Capital Smart City', developer: 'Capital Smart City Ltd', location: 'M-2 Motorway, Chakri Road', city: 'Islamabad', description: 'Pakistan\u2019s first smart city with fiber-to-home, smart infrastructure, and eco-friendly design.', startingPrice: 35000000, completionDate: 'Q2 2027', totalUnits: 800, availableUnits: 520, soldUnits: 280, imageUrl: '/properties/project2.png', amenities: 'Smart City,Clubhouse,Nature Trails,Parks,Fiber Internet,Eco-Friendly', status: 'ONGOING', featured: true },
    { name: 'Bahria Town Phase 9', developer: 'Bahria Town Pvt Ltd', location: 'Bahria Town', city: 'Islamabad', description: 'Gated community with modern villas, commercial centers, and entertainment facilities.', startingPrice: 28000000, completionDate: 'Q1 2026', totalUnits: 500, availableUnits: 180, soldUnits: 320, imageUrl: '/properties/apt1.png', amenities: 'Gated Community,Commercial Area,Jamia Mosque,Parks,Security,Schools', status: 'ONGOING', featured: false },
    { name: 'DHA Valley', developer: 'DHA Islamabad', location: 'DHA Phase 2', city: 'Islamabad', description: 'Scenic valley development with farm houses and residential plots alongside Rawal Lake.', startingPrice: 22000000, completionDate: 'Completed', totalUnits: 1200, availableUnits: 0, soldUnits: 1200, imageUrl: '/properties/house1.png', amenities: 'Lake View,Farm Houses,Clubhouse,Security,Parks,Commercial', status: 'COMPLETED', featured: false },
  ]
  for (const p of projects) {
    await db.rEProject.create({ data: p })
  }

  // ── LOCATIONS ───────────────────────────────────────────
  const locations = [
    { name: 'Pakistan', level: 'COUNTRY', propertyCount: 10, popular: true },
    { name: 'Islamabad', level: 'CITY', propertyCount: 10, popular: true, seoContent: 'Capital city of Pakistan with premium real estate.' },
    { name: 'F-7', level: 'AREA', propertyCount: 1, popular: true, seoContent: 'Elite residential sector with luxury villas.' },
    { name: 'F-8', level: 'AREA', propertyCount: 2, popular: true, seoContent: 'Central business and residential hub.' },
    { name: 'F-11', level: 'AREA', propertyCount: 1, popular: false },
    { name: 'Bahria Town', level: 'SOCIETY', propertyCount: 2, popular: true, seoContent: 'Modern gated community with full amenities.' },
    { name: 'DHA Phase 2', level: 'SOCIETY', propertyCount: 1, popular: true },
    { name: 'Bani Gala', level: 'AREA', propertyCount: 1, popular: false },
    { name: 'Gulberg Greens', level: 'SOCIETY', propertyCount: 1, popular: false },
    { name: 'Blue Area', level: 'AREA', propertyCount: 1, popular: true, seoContent: 'Islamabad\u2019s central commercial business district.' },
    { name: 'Chakri Road', level: 'AREA', propertyCount: 1, popular: false },
  ]
  for (const l of locations) {
    await db.location.create({ data: l })
  }

  // ── NOTIFICATIONS ───────────────────────────────────────
  const notifications = [
    { type: 'PROPERTY_SUBMITTED', title: 'New property submitted', message: 'A new property "Skyline Residences" was submitted for approval.', channel: 'IN_APP', read: false },
    { type: 'PROPERTY_APPROVED', title: 'Property approved', message: '"Margalla View Luxury Villa" has been approved and published.', channel: 'IN_APP', read: false },
    { type: 'NEW_INQUIRY', title: 'New inquiry received', message: 'Hassan Ali inquired about The Crescent Apartments.', channel: 'IN_APP', read: false },
    { type: 'APPOINTMENT_BOOKED', title: 'Viewing scheduled', message: 'Property viewing booked for Centaurus Towers tomorrow at 2 PM.', channel: 'IN_APP', read: false },
    { type: 'PAYMENT_RECEIVED', title: 'Payment received', message: 'Rs 5,550,000 commission received for Skyline Glass Villa sale.', channel: 'IN_APP', read: true },
    { type: 'PAYMENT_FAILED', title: 'Payment failed', message: 'A payment of Rs 500,000 failed for Blue Area Business Tower.', channel: 'EMAIL', read: false },
    { type: 'NEW_USER', title: 'New user registered', message: 'Asad Mahmood registered as an INVESTOR.', channel: 'IN_APP', read: true },
    { type: 'PROPERTY_REJECTED', title: 'Listing rejected', message: 'A property listing was rejected due to incomplete documents.', channel: 'IN_APP', read: false },
  ]
  for (const n of notifications) {
    await db.notification.create({ data: n })
  }

  const counts = {
    properties: await db.property.count(),
    agents: await db.agent.count(),
    users: await db.user.count(),
    leads: await db.lead.count(),
    appointments: await db.appointment.count(),
    transactions: await db.transaction.count(),
    payments: await db.payment.count(),
    projects: await db.rEProject.count(),
    locations: await db.location.count(),
    notifications: await db.notification.count(),
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
