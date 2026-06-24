import { pool } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const client = await pool.connect()

  try {
    // Get all product_orders
    const ordersResult = await client.query(`
      SELECT * FROM product_orders ORDER BY "createdAt" DESC LIMIT 5
    `)

    // Get all product_order_items for the first order if it exists
    let itemsResult: any = { rows: [] }
    if (ordersResult.rows.length > 0) {
      const firstOrderId = ordersResult.rows[0].id
      itemsResult = await client.query(`
        SELECT * FROM product_order_items WHERE "orderId" = $1
      `, [firstOrderId])
    }

    console.log('[v0] Orders found:', ordersResult.rows.length)
    console.log('[v0] Items for first order:', itemsResult.rows.length)

    return NextResponse.json({
      success: true,
      ordersCount: ordersResult.rows.length,
      orders: ordersResult.rows,
      itemsForFirstOrder: itemsResult.rows,
    })
  } catch (error) {
    console.error('[v0] Error verifying orders:', error)
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
