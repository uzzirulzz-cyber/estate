import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// The platform shell may export a stale DATABASE_URL (e.g. an old SQLite path).
// Next.js loads .env, but process.env already-set values take precedence.
// Force-load the value from the .env file so PrismaClient always uses the
// database configured there, not whatever the shell inherited.
function loadDatabaseUrlFromEnv(): string | undefined {
  try {
    const envPath = resolve(process.cwd(), '.env')
    const content = readFileSync(envPath, 'utf8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      if (key !== 'DATABASE_URL') continue
      let value = trimmed.slice(eqIdx + 1).trim()
      // strip surrounding quotes
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      return value
    }
  } catch {
    // fall through to process.env
  }
  return undefined
}

const envUrl = loadDatabaseUrlFromEnv()
if (envUrl) {
  process.env.DATABASE_URL = envUrl
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
