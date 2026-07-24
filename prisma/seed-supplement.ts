import { db } from '../src/lib/db'

async function main() {
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
  for (const n of notifications) await db.notification.create({ data: n })
  const locations = [
    { name: 'Bani Gala', level: 'AREA', propertyCount: 1, popular: false },
    { name: 'Gulberg Greens', level: 'SOCIETY', propertyCount: 1, popular: false },
    { name: 'Blue Area', level: 'AREA', propertyCount: 1, popular: true, seoContent: 'Islamabad CBD' },
    { name: 'Chakri Road', level: 'AREA', propertyCount: 1, popular: false },
  ]
  for (const l of locations) await db.location.create({ data: l })
  console.log('done: notifications', await db.notification.count(), 'locations', await db.location.count())
}

main().catch(console.error).finally(() => db.$disconnect())
