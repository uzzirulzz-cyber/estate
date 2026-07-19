import { db } from '@/lib/db'

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'SALE'
  | 'RENTAL'
  | 'TAX_PAID'
  | 'STATUS_CHANGE'

export type AuditEntity = 'PROPERTY' | 'TRANSACTION' | 'TAX'

export async function logAudit(params: {
  action: AuditAction
  entity: AuditEntity
  entityId: string
  details: string
  performedBy?: string
  propertyId?: string
  transactionId?: string
}) {
  try {
    return await db.auditLog.create({
      data: {
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        details: params.details,
        performedBy: params.performedBy ?? 'admin@esterra.io',
        propertyId: params.propertyId,
        transactionId: params.transactionId,
      },
    })
  } catch (e) {
    console.error('audit log failed', e)
    return null
  }
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatDate(d: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(d))
}
