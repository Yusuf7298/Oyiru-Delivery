import 'dotenv/config'
import pg from 'pg'
const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function run() {
  const client = await pool.connect()
  try {
    console.log('Patching status column in oyru_orders table...')

    // 1. Drop default constraint
    console.log('Dropping default constraint on status column...')
    await client.query(`ALTER TABLE oyru_orders ALTER COLUMN status DROP DEFAULT`)

    // 2. Change column type
    console.log('Casting status column to oyru_order_status type...')
    await client.query(`ALTER TABLE oyru_orders ALTER COLUMN status TYPE oyru_order_status USING status::oyru_order_status`)

    // 3. Set new default constraint
    console.log('Setting default value to "draft"...')
    await client.query(`ALTER TABLE oyru_orders ALTER COLUMN status SET DEFAULT 'draft'::oyru_order_status`)

    console.log('oyru_orders status column successfully patched!')
  } catch (error) {
    console.error('Patch failed:', error)
  } finally {
    client.release()
    await pool.end()
  }
}

run()
