import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

// Cache the pool in Next.js development to avoid exhausting connections on HMR
const globalForDb = globalThis as unknown as {
  pool: Pool | undefined
}

export const pool = globalForDb.pool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  // Aggressively drop idle connections to prevent ECONNRESET 
  // when Neon scales to zero or closes idle connections
  max: 20,
  idleTimeoutMillis: 10000, // 10 seconds
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true,
})

if (process.env.NODE_ENV !== 'production') globalForDb.pool = pool

export const db = drizzle(pool, { schema })
