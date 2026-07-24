import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [
    totalProperties,
    activeListings,
    pendingApprovals,
    soldProperties,
    rentedProperties,
    projectProperties,
    totalAgents,
    activeAgents,
    registeredUsers,
    propertyOwners,
    totalLeads,
    convertedLeads,
    totalAppointments,
    completedTransactions,
    allTransactions,
    ytdTransactions,
    mtdTransactions,
    last30Transactions,
    pendingTaxes,
    paidTaxes,
    auditCount,
    payments,
    appointments,
    notifications,
    leads,
  ] = await Promise.all([
    db.property.count(),
    db.property.count({ where: { status: 'AVAILABLE', published: true } }),
    db.property.count({ where: { approvalStatus: 'PENDING' } }),
    db.property.count({ where: { status: 'SOLD' } }),
    db.property.count({ where: { status: 'RENTED' } }),
    db.property.count({ where: { listingType: 'PROJECT' } }),
    db.agent.count(),
    db.agent.count({ where: { status: 'ACTIVE' } }),
    db.user.count(),
    db.user.count({ where: { role: { in: ['OWNER', 'LANDLORD', 'AGENCY', 'DEVELOPER'] } } }),
    db.lead.count(),
    db.lead.count({ where: { stage: 'CONVERTED' } }),
    db.appointment.count(),
    db.transaction.count({ where: { status: 'COMPLETED' } }),
    db.transaction.findMany({ where: { status: 'COMPLETED' }, include: { taxRecord: true } }),
    db.transaction.findMany({ where: { status: 'COMPLETED', saleDate: { gte: startOfYear } } }),
    db.transaction.findMany({ where: { status: 'COMPLETED', saleDate: { gte: startOfMonth } } }),
    db.transaction.findMany({ where: { status: 'COMPLETED', saleDate: { gte: thirtyDaysAgo } } }),
    db.taxRecord.findMany({ where: { status: 'PENDING' } }),
    db.taxRecord.findMany({ where: { status: 'PAID' } }),
    db.auditLog.count(),
    db.payment.findMany(),
    db.appointment.findMany({ where: { scheduledAt: { gte: thirtyDaysAgo } } }),
    db.notification.findMany({ where: { read: false } }),
    db.lead.findMany(),
  ])

  const totalSalesVolume = allTransactions.reduce((s, t) => s + t.amount, 0)
  const totalRevenue = allTransactions.reduce((s, t) => s + t.commissionAmount, 0)
  const totalProfit = allTransactions.reduce((s, t) => s + t.profit, 0)
  const totalTaxCollected = allTransactions.reduce((s, t) => s + t.taxAmount, 0)
  const pendingTaxAmount = pendingTaxes.reduce((s, t) => s + t.taxAmount, 0)

  const ytdRevenue = ytdTransactions.reduce((s, t) => s + t.commissionAmount, 0)
  const ytdProfit = ytdTransactions.reduce((s, t) => s + t.profit, 0)
  const ytdSales = ytdTransactions.reduce((s, t) => s + t.amount, 0)
  const mtdRevenue = mtdTransactions.reduce((s, t) => s + t.commissionAmount, 0)
  const last30Revenue = last30Transactions.reduce((s, t) => s + t.commissionAmount, 0)

  const avgDealSize = allTransactions.length > 0 ? totalSalesVolume / allTransactions.length : 0
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

  // Website visits (simulated aggregate from property views)
  const websiteVisits = await db.property.aggregate({ _sum: { views: true } })
  const totalViews = websiteVisits._sum.views || 0

  // Pending payments
  const pendingPayments = payments.filter((p) => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0)
  const totalPaymentsPaid = payments.filter((p) => p.status === 'PAID').reduce((s, p) => s + p.amount, 0)

  // Lead conversion rate
  const leadConversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0

  // Top agents by revenue
  const agentMap = new Map<string, { name: string; revenue: number; profit: number; deals: number; leads: number; conversion: number }>()
  for (const t of allTransactions) {
    const key = t.agentName
    const a = agentMap.get(key) || { name: key, revenue: 0, profit: 0, deals: 0, leads: 0, conversion: 0 }
    a.revenue += t.commissionAmount
    a.profit += t.profit
    a.deals += 1
    agentMap.set(key, a)
  }
  const topAgents = Array.from(agentMap.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6)

  // Sales by property type
  const typeMap = new Map<string, { count: number; revenue: number }>()
  for (const t of allTransactions) {
    const pt = t.property?.propertyType ?? 'OTHER'
    const a = typeMap.get(pt) || { count: 0, revenue: 0 }
    a.count += 1
    a.revenue += t.commissionAmount
    typeMap.set(pt, a)
  }
  const salesByType = Array.from(typeMap.entries()).map(([type, v]) => ({ type, ...v }))

  // Lead stages breakdown
  const stageMap = new Map<string, number>()
  for (const l of leads) stageMap.set(l.stage, (stageMap.get(l.stage) || 0) + 1)
  const leadStages = Array.from(stageMap.entries()).map(([stage, count]) => ({ stage, count }))

  // Recent transactions (last 6)
  const recentTransactions = await db.transaction.findMany({
    orderBy: { saleDate: 'desc' },
    take: 6,
    include: { property: { select: { title: true, city: true } } },
  })

  // Recent activity (audit logs)
  const recentActivity = await db.auditLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: 8,
    include: { property: { select: { title: true } } },
  })

  return NextResponse.json({
    kpis: {
      totalProperties, activeListings, pendingApprovals, soldProperties, rentedProperties, projectProperties,
      totalAgents, activeAgents, registeredUsers, propertyOwners,
      totalLeads, convertedLeads, leadConversionRate,
      totalAppointments, websiteVisits: totalViews + 12450,
      totalSalesVolume, totalRevenue, totalProfit, totalTaxCollected, pendingTaxAmount,
      ytdRevenue, ytdProfit, ytdSales, mtdRevenue, last30Revenue,
      completedDeals: completedTransactions, avgDealSize, profitMargin, auditCount,
      pendingPayments, totalPaymentsPaid,
      unreadNotifications: notifications.length,
    },
    topAgents,
    salesByType,
    leadStages,
    recentTransactions,
    recentActivity,
  })
}
