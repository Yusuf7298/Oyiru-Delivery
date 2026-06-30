import 'dotenv/config'
import pg from 'pg'
const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function run() {
  const client = await pool.connect()
  try {
    console.log('Starting Oyru Database Migration...')

    // 1. Add roles to user_role enum
    // We run each enum alter individually because they cannot be run in transactions
    try {
      await client.query(`ALTER TYPE user_role ADD VALUE 'delivery'`)
      console.log('Added "delivery" role to user_role enum')
    } catch (e) {
      console.log('"delivery" role already exists or failed to add:', e.message)
    }

    try {
      await client.query(`ALTER TYPE user_role ADD VALUE 'hotel'`)
      console.log('Added "hotel" role to user_role enum')
    } catch (e) {
      console.log('"hotel" role already exists or failed to add:', e.message)
    }

    // 2. Create oyru_order_status enum
    try {
      await client.query(`
        CREATE TYPE oyru_order_status AS ENUM (
          'draft', 'submitted', 'inventory_review', 'approved', 'assigned', 'shipped', 'delivered', 'completed', 'cancelled'
        )
      `)
      console.log('Created oyru_order_status enum')
    } catch (e) {
      console.log('oyru_order_status enum already exists or failed to create:', e.message)
    }

    // 3. Update oyru_orders
    console.log('Updating oyru_orders table...')
    await client.query(`UPDATE oyru_orders SET status = 'draft' WHERE status IS NULL OR status = 'pending'`)
    
    try {
      await client.query(`ALTER TABLE oyru_orders ALTER COLUMN status SET DEFAULT 'draft'`)
      await client.query(`ALTER TABLE oyru_orders ALTER COLUMN status TYPE oyru_order_status USING status::oyru_order_status`)
      console.log('Updated status column in oyru_orders')
    } catch (e) {
      console.log('Failed to update status column in oyru_orders:', e.message)
    }

    // 4. Update hotel_accounts
    console.log('Updating hotel_accounts table...')
    await client.query(`ALTER TABLE hotel_accounts ADD COLUMN IF NOT EXISTS "ownerFullName" TEXT`)
    await client.query(`ALTER TABLE hotel_accounts ADD COLUMN IF NOT EXISTS "address" TEXT`)
    await client.query(`ALTER TABLE hotel_accounts ADD COLUMN IF NOT EXISTS "agreementStartDate" TIMESTAMP`)
    await client.query(`ALTER TABLE hotel_accounts ADD COLUMN IF NOT EXISTS "agreementEndDate" TIMESTAMP`)
    await client.query(`ALTER TABLE hotel_accounts ADD COLUMN IF NOT EXISTS "telegramChatId" TEXT`)
    try {
      await client.query(`ALTER TABLE hotel_accounts DROP COLUMN IF EXISTS "agreementPdfUrl"`)
    } catch (e) {
      console.log('Failed to drop agreementPdfUrl:', e.message)
    }
    console.log('hotel_accounts table updated successfully')

    // 5. Update hotel_product_agreements
    console.log('Updating hotel_product_agreements table...')
    await client.query(`ALTER TABLE hotel_product_agreements ADD COLUMN IF NOT EXISTS "unit" TEXT DEFAULT 'kg'`)
    await client.query(`ALTER TABLE hotel_product_agreements ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true`)
    await client.query(`ALTER TABLE hotel_product_agreements ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT NOW()`)
    console.log('hotel_product_agreements table updated successfully')

    // 6. Update admin_profiles
    console.log('Updating admin_profiles table...')
    try {
      await client.query(`ALTER TABLE admin_profiles DROP COLUMN IF EXISTS "agreementPdfUrl"`)
    } catch (e) {
      console.log('Failed to drop agreementPdfUrl from admin_profiles:', e.message)
    }

    // 7. Create delivery_profiles table
    console.log('Creating delivery_profiles table...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS delivery_profiles (
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL UNIQUE,
        "phoneNumber" TEXT,
        "vehicleType" TEXT,
        "isAvailable" BOOLEAN DEFAULT true,
        "telegramChatId" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE
      )
    `)
    console.log('delivery_profiles table created successfully')

    // 8. Create order_status_history table
    console.log('Creating order_status_history table...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_status_history (
        id TEXT PRIMARY KEY,
        "orderId" TEXT NOT NULL,
        "fromStatus" TEXT,
        "toStatus" TEXT NOT NULL,
        "changedBy" TEXT,
        "reason" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY ("orderId") REFERENCES oyru_orders(id) ON DELETE CASCADE,
        FOREIGN KEY ("changedBy") REFERENCES "user"(id) ON DELETE SET NULL
      )
    `)
    console.log('order_status_history table created successfully')

    console.log('All migrations completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    client.release()
    await pool.end()
  }
}

run()
