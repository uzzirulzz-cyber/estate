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
    availableProperties,
    soldProperties,
    rentedProperties,
    projectProperties,
    allTransactions,
    ytdTransactions,
    mtdTransactions,
    last30Transactions,
    pendingTaxes,
    paidTaxes,
    auditCount,
  ] = await Promise.all([
    db.property.count(),
    db.property.count({ where: { status: 'AVAILABLE' } }),
    db.property.count({ where: { status: 'SOLD' } }),
    db.property.count({ where: { status: 'RENTED' } }),
    db.property.count({ where: { listingType: 'PROJECT' } }),
    db.transaction.findMany({ where: { status: 'COMPLETED' }, include: { taxRecord: true } }),
    db.transaction.findMany({ where: { status: 'COMPLETED', saleDate: { gte: startOfYear } } }),
    db.transaction.findMany({ where: { status: 'COMPLETED', saleDate: { gte: startOfMonth } } }),
    db.transaction.findMany({ where: { status: 'COMPLETED', saleDate: { gte: thirtyDaysAgo } } }),
    db.taxRecord.findMany({ where: { status: 'PENDING' } }),
    db.taxRecord.findMany({ where: { status: 'PAID' } }),
    db.auditLog.count(),
  ])

  const totalSalesVolume = allTransactions.reduce((s, t) => s + t.amount, 0)
  const totalRevenue = allTransactions.reduce((s, t) => s + t.commissionAmount, 0)
  const totalProfit = allTransactions.reduce((s, t) => s + t.profit, 0)
  const totalTaxCollected = allTransactions.reduce((s, t) => s + t.taxAmount, 0)
  const pendingTaxAmount = pendingTaxes.reduce((s, t) => s + t.taxAmount, 0)
  const paidTaxAmount = paidTaxes.reduce((s, t) => s + t.taxAmount, 0)

  const ytdRevenue = ytdTransactions.reduce((s, t) => s + t.commissionAmount, 0)
  const ytdProfit = ytdTransactions.reduce((s, t) => s + t.profit, 0)
  const ytdSales = ytdTransactions.reduce((s, t) => s + t.amount, 0)

  const mtdRevenue = mtdTransactions.reduce((s, t) => s + t.commissionAmount, 0)
  const last30Revenue = last30Transactions.reduce((s, t) => s + t.commissionAmount, 0)

  const avgDealSize = allTransactions.length > 0 ? totalSalesVolume / allTransactions.length : 0
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

  // Top agents by revenue
  const agentMap = new Map<string, { revenue: number; profit: number; deals: number }>()
  for (const t of allTransactions) {
    const a = agentMap.get(t.agentName) || { revenue: 0, profit: 0, deals: 0 }
    a.revenue += t.commissionAmount
    a.profit += t.profit
    a.deals += 1
    agentMap.set(t.agentName, a)
  }
  const topAgents = Array.from(agentMap.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

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

  return NextResponse.json({
    kpis: {
      totalProperties,
      availableProperties,
      soldProperties,
      rentedProperties,
      projectProperties,
      totalSalesVolume,
      totalRevenue,
      totalProfit,
      totalTaxCollected,
      pendingTaxAmount,
      paidTaxAmount,
      pendingTaxCount: pendingTaxes.length,
      paidTaxCount: paidTaxes.length,
      ytdRevenue,
      ytdProfit,
      ytdSales,
      mtdRevenue,
      last30Revenue,
      completedDeals: allTransactions.length,
      avgDealSize,
      profitMargin,
      auditCount,
    },
    topAgents,
    salesByType,
  })
}
