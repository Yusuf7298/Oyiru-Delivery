import { db } from '@/lib/db'
import { oyruOrders, oyruOrderItems } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { v4 as uuidv4 } from 'crypto'
import { getAuthContext, requireAuth } from '@/lib/middleware/role-check'
import { hasPermission } from '@/lib/utils/permissions'
import { checkStockAvailability, decrementStock } from '@/lib/services/inventory'

export async function POST(request: Request) {
  try {
    const authContext = await getAuthContext()

    if (!requireAuth(authContext) || !hasPermission(authContext, 'create_orders')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { items, totalAmount, deliveryAddress, deliveryNotes, paymentMethod = 'COD' } = body

    if (!items || items.length === 0) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 })
    }

    if (!deliveryAddress) {
      return Response.json({ error: 'Delivery address is required' }, { status: 400 })
    }

    // Check stock availability for all items
    for (const item of items) {
      const hasStock = await checkStockAvailability(item.productId, item.quantity)
      if (!hasStock) {
        return Response.json(
          { error: `Insufficient stock for product ${item.productId}` },
          { status: 400 }
        )
      }
    }

    const orderId = uuidv4()
    const orderNumber = `ORD-${Date.now()}`

    // Create order
    const newOrder = await db
      .insert(oyruOrders)
      .values({
        id: orderId,
        orderNumber,
        userId: authContext.userId,
        totalAmount: totalAmount.toString(),
        paymentMethod,
        deliveryAddress,
        deliveryNotes,
        status: 'pending',
      })
      .returning()

    // Create order items and decrement stock
    const orderItemsData = items.map((item: any) => ({
      id: uuidv4(),
      orderId,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.price.toString(),
    }))

    await db.insert(oyruOrderItems).values(orderItemsData)

    // Decrement stock for each item
    for (const item of items) {
      await decrementStock(item.productId, item.quantity, `Order ${orderNumber}`)
    }

    return Response.json({
      success: true,
      order: {
        ...newOrder[0],
        items: orderItemsData,
      },
    })
  } catch (error) {
    console.error('[v0] Error creating order:', error)
    return Response.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const authContext = await getAuthContext()

    if (!requireAuth(authContext) || !hasPermission(authContext, 'view_own_orders')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await db
      .select()
      .from(oyruOrders)
      .where((table) => table.userId === authContext.userId)
      .orderBy(oyruOrders.createdAt)

    return Response.json({ success: true, orders })
  } catch (error) {
    console.error('[v0] Error fetching orders:', error)
    return Response.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
