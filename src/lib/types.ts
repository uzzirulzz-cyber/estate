export type ListingType = 'SALE' | 'RENTAL' | 'PROJECT'
export type PropertyKind =
  | 'APARTMENT'
  | 'HOUSE'
  | 'VILLA'
  | 'TOWNHOUSE'
  | 'PENTHOUSE'
  | 'DUPLEX'
  | 'COMMERCIAL'
  | 'LAND'
export type PropertyStatus = 'AVAILABLE' | 'SOLD' | 'RENTED' | 'OFF_MARKET'
export type TxType = 'SALE' | 'RENTAL'
export type TxStatus = 'COMPLETED' | 'PENDING' | 'CANCELLED'
export type TaxStatus = 'PENDING' | 'PAID'

export interface Property {
  id: string
  title: string
  slug: string
  description: string
  listingType: ListingType
  propertyType: PropertyKind
  status: PropertyStatus
  price: number
  monthlyRent: number | null
  projectProgress: number | null
  expectedCompletion: string | null
  address: string
  city: string
  state: string
  zipCode: string
  bedrooms: number
  bathrooms: number
  area: number
  yearBuilt: number | null
  imageUrl: string
  gallery: string | null
  features: string | null
  featured: boolean
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  propertyId: string
  property?: Property
  type: TxType
  buyerName: string
  sellerName: string
  agentName: string
  amount: number
  commissionRate: number
  commissionAmount: number
  taxRate: number
  taxAmount: number
  netRevenue: number
  profit: number
  saleDate: string
  status: TxStatus
  paymentMethod: string
  notes: string | null
  taxRecord?: TaxRecord | null
}

export interface TaxRecord {
  id: string
  transactionId: string
  fiscalYear: number
  taxRate: number
  taxableAmount: number
  taxAmount: number
  status: TaxStatus
  paidDate: string | null
  createdAt: string
}

export interface AuditLog {
  id: string
  action: string
  entity: string
  entityId: string
  propertyId: string | null
  transactionId: string | null
  performedBy: string
  details: string
  timestamp: string
  property?: { title: string } | null
  transaction?: { property?: { title: string } | null } | null
}

export interface DashboardStats {
  kpis: {
    totalProperties: number
    availableProperties: number
    soldProperties: number
    rentedProperties: number
    projectProperties: number
    totalSalesVolume: number
    totalRevenue: number
    totalProfit: number
    totalTaxCollected: number
    pendingTaxAmount: number
    paidTaxAmount: number
    pendingTaxCount: number
    paidTaxCount: number
    ytdRevenue: number
    ytdProfit: number
    ytdSales: number
    mtdRevenue: number
    last30Revenue: number
    completedDeals: number
    avgDealSize: number
    profitMargin: number
    auditCount: number
  }
  topAgents: { name: string; revenue: number; profit: number; deals: number }[]
  salesByType: { type: string; count: number; revenue: number }[]
}

export interface ChartSeries {
  series: {
    label: string
    revenue: number
    profit: number
    tax: number
    volume: number
    deals: number
  }[]
}

export interface TaxReport {
  records: (TaxRecord & { transaction?: Transaction })[]
  summary: {
    totalTaxable: number
    totalTax: number
    paidTax: number
    pendingTax: number
    count: number
  }
  byYear: {
    fiscalYear: number
    taxable: number
    tax: number
    paid: number
    pending: number
    count: number
  }[]
}

export const LISTING_TYPE_LABEL: Record<ListingType, string> = {
  SALE: 'For Sale',
  RENTAL: 'For Rent',
  PROJECT: 'Ongoing Project',
}

export const PROPERTY_TYPE_LABEL: Record<PropertyKind, string> = {
  APARTMENT: 'Apartment',
  HOUSE: 'House',
  VILLA: 'Villa',
  TOWNHOUSE: 'Townhouse',
  PENTHOUSE: 'Penthouse',
  DUPLEX: 'Duplex',
  COMMERCIAL: 'Commercial',
  LAND: 'Land',
}

export function formatCurrency(n: number, compact = false) {
  if (compact && Math.abs(n) >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(n)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatNumber(n: number, compact = false) {
  return new Intl.NumberFormat('en-US', {
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(n)
}

export function formatDate(d: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(d))
}

export function formatDateTime(d: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(d))
}
