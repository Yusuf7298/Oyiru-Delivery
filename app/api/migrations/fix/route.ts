import { pool } from '@/lib/db'
import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/middleware/role-check'

export async function GET() {
  // Block entirely in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Disabled in production' }, { status: 403 })
  }

  const authContext = await getAuthContext()
  if (!authContext) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (authContext.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden: super_admin only' }, { status: 403 })
  }

  const client = await pool.connect()
  try {
    await client.query(`DROP TABLE IF EXISTS product_order_items`)
    await client.query(`DROP TABLE IF EXISTS product_orders`)
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
    await client.query(`CREATE INDEX IF NOT EXISTS idx_product_orders_customer ON product_orders("customerId")`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_product_order_items_order ON product_order_items("orderId")`)

    return NextResponse.json({ success: true, message: 'Fix migration completed' })
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  } finally {
    client.release()
  }
}
