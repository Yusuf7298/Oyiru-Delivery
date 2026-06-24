#!/usr/bin/env node

import { pool } from './index.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function runMigrations() {
  const client = await pool.connect()
  
  try {
    console.log('[v0] Starting database migrations...')
    
    // Read and execute migration
    const migrationPath = path.join(__dirname, 'migrations', '001_create_product_orders.sql')
    const sql = fs.readFileSync(migrationPath, 'utf-8')
    
    await client.query(sql)
    console.log('[v0] Migration completed successfully')
    
  } catch (error) {
    console.error('[v0] Migration failed:', error.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

runMigrations()
