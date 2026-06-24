import { pool } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST() {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const timestamp = Date.now()
    const orderId = `order_test_${timestamp}`
    const customerId = 'test_user_123'

    // Calculate order totals
    const subtotal = 100
    const deliveryFee = 5.00
    const tax = Math.round((subtotal + deliveryFee) * 0.05 * 100) / 100
    const total = subtotal + deliveryFee + tax

    console.log('[v0] Creating test order:', { orderId, customerId, subtotal, deliveryFee, tax, total })

    // Insert order into product_orders table
    const orderResult = await client.query(
      `INSERT INTO product_orders (id, "customerId", status, subtotal, "deliveryFee", tax, total, address, phone, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [
        orderId,
        customerId,
        'pending',
        subtotal,
        deliveryFee,
        tax,
        total,
        '123 Test Street',
        '9876543210',
      ]
    )

    console.log('[v0] Order created:', orderResult.rows[0])

    // Insert order item
    const itemId = `oi_test_${timestamp}`
    await client.query(
      `INSERT INTO product_order_items (id, "orderId", "productId", quantity, "unitPrice", "createdAt")
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [itemId, orderId, 'prod-1', 1, 100]
    )

    console.log('[v0] Order item created')

    await client.query('COMMIT')
    console.log('[v0] Test order committed:', orderId)

    return NextResponse.json({
      success: true,
      orderId,
      order: orderResult.rows[0],
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('[v0] Error creating test order:', error)
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
