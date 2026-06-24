import { pool } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const client = await pool.connect()

  try {
    console.log('[v0] Starting fix migration...')

    // Drop existing product_orders table to recreate without FK constraint issues
    await client.query(`DROP TABLE IF EXISTS product_order_items`)
    await client.query(`DROP TABLE IF EXISTS product_orders`)
    console.log('[v0] Dropped old tables')

    // Create product_orders table WITHOUT strict foreign key
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_orders (
        id TEXT PRIMARY KEY,
        "customerId" TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        subtotal NUMERIC(10,2) NOT NULL,
        "deliveryFee" NUMERIC(10,2) NOT NULL DEFAULT 5.00,
        tax NUMERIC(10,2) NOT NULL,
        total NUMERIC(10,2) NOT NULL,
        address TEXT NOT NULL,
        phone TEXT NOT NULL,
        "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
      )
    `)
    console.log('[v0] product_orders table created (no FK)')

    // Create product_order_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_order_items (
        id TEXT PRIMARY KEY,
        "orderId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        "unitPrice" NUMERIC(10,2) NOT NULL,
        "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
        FOREIGN KEY ("orderId") REFERENCES product_orders(id) ON DELETE CASCADE
      )
    `)
    console.log('[v0] product_order_items table created')

    // Create indexes
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_product_orders_customer ON product_orders("customerId")`
    )
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_product_order_items_order ON product_order_items("orderId")`
    )
    console.log('[v0] Indexes created')

    return NextResponse.json({
      success: true,
      message: 'Fix migration completed successfully',
    })
  } catch (error) {
    console.error('[v0] Fix migration failed:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
