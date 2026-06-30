import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

async function migrate() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })

  const queries = [
    // 1. Add new columns to hotel_accounts
    `ALTER TABLE "hotel_accounts" ADD COLUMN IF NOT EXISTS "userId" text REFERENCES "user"("id") ON DELETE CASCADE`,
    `ALTER TABLE "hotel_accounts" ADD COLUMN IF NOT EXISTS "agreementDuration" text`,
    `ALTER TABLE "hotel_accounts" ADD COLUMN IF NOT EXISTS "basePaymentAmount" decimal(10,2)`,
    `ALTER TABLE "hotel_accounts" ADD COLUMN IF NOT EXISTS "agreementPdfUrl" text`,

    // 2. Add new columns to delivery_partners
    `ALTER TABLE "delivery_partners" ADD COLUMN IF NOT EXISTS "serviceType" text`,
    `ALTER TABLE "delivery_partners" ADD COLUMN IF NOT EXISTS "serviceFee" decimal(10,2)`,
    `ALTER TABLE "delivery_partners" ADD COLUMN IF NOT EXISTS "birthPlace" text`,
    `ALTER TABLE "delivery_partners" ADD COLUMN IF NOT EXISTS "guarantorName" text`,
    `ALTER TABLE "delivery_partners" ADD COLUMN IF NOT EXISTS "guarantorPhone" text`,
    `ALTER TABLE "delivery_partners" ADD COLUMN IF NOT EXISTS "agreementPdfUrl" text`,

    // 3. Create hotel_product_agreements table
    `CREATE TABLE IF NOT EXISTS "hotel_product_agreements" (
      "id" text PRIMARY KEY,
      "hotelId" text NOT NULL REFERENCES "hotel_accounts"("id") ON DELETE CASCADE,
      "productId" text NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
      "agreedPrice" decimal(10,2) NOT NULL,
      "createdAt" timestamp DEFAULT now() NOT NULL
    )`,

    // 4. Create admin_profiles table
    `CREATE TABLE IF NOT EXISTS "admin_profiles" (
      "id" text PRIMARY KEY,
      "userId" text NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
      "startDate" timestamp,
      "positionTitle" text,
      "agreementPdfUrl" text,
      "createdAt" timestamp DEFAULT now() NOT NULL,
      "updatedAt" timestamp DEFAULT now() NOT NULL
    )`,
  ]

  for (const sql of queries) {
    try {
      await pool.query(sql)
      console.log('✅', sql.substring(0, 60) + '...')
    } catch (err) {
      console.error('❌ Error:', err.message, '\n   SQL:', sql.substring(0, 80))
    }
  }

  console.log('\n🎉 Migration complete!')
  await pool.end()
}

migrate()
