require('dotenv').config()
const { Pool } = require('pg')

async function run() {
  console.log('Connecting to database...')
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })
  const client = await pool.connect()
  try {
    console.log('Cleaning up negative stocks if any...')
    await client.query(`
      UPDATE products SET "stockQuantity" = 0 WHERE "stockQuantity" < 0;
    `)

    console.log('Adding positive stock check constraint to products table...')
    await client.query(`
      ALTER TABLE products DROP CONSTRAINT IF EXISTS check_positive_stock;
    `)
    await client.query(`
      ALTER TABLE products ADD CONSTRAINT check_positive_stock CHECK ("stockQuantity" >= 0);
    `)

    console.log('Check constraint check_positive_stock added successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

run()
