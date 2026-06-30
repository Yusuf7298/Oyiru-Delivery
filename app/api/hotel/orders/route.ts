import { db } from '@/lib/db'
import { oyruOrders, oyruOrderItems, orderStatusHistory, hotelAccounts } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { eq } from 'drizzle-orm'
import { getAuthContext, requireAuth } from '@/lib/middleware/role-check'
import { hasPermission } from '@/lib/utils/permissions'
import { checkStockAvailability, decrementStock } from '@/lib/services/inventory'

export async function POST(request: Request) {
  try {
    const authContext = await getAuthContext()

    if (!requireAuth(authContext) || !hasPermission(authContext, 'create_orders')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admins and super admins manage products — they cannot place orders
    if (authContext.role === 'admin' || authContext.role === 'super_admin') {
      return Response.json({ error: 'Admins cannot create orders' }, { status: 403 })
    }

    const body = await request.json()
    let { items, totalAmount, deliveryAddress, deliveryNotes, paymentMethod = 'COD' } = body

    if (!items || items.length === 0) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Get hotel account to find default address and ID
    const hotel = await db
      .select({ id: hotelAccounts.id, address: hotelAccounts.address })
      .from(hotelAccounts)
      .where(eq(hotelAccounts.userId, authContext.userId))
      .limit(1)

    if (!hotel.length) {
      return Response.json({ error: 'Hotel account not found' }, { status: 404 })
    }

    if (!deliveryAddress) {
      deliveryAddress = hotel[0].address
      if (!deliveryAddress) {
         return Response.json({ error: 'Delivery address is required' }, { status: 400 })
      }
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
        hotelAccountId: hotel[0].id,
        totalAmount: totalAmount.toString(),
        paymentMethod,
        deliveryAddress,
        deliveryNotes,
        status: 'draft',
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

    // Log the order status change in history
    await db.insert(orderStatusHistory).values({
      id: uuidv4(),
      orderId,
      fromStatus: null,
      toStatus: 'draft',
      changedBy: authContext.userId,
      reason: 'Order created via API',
      createdAt: new Date(),
    })

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
      .where(eq(oyruOrders.userId, authContext.userId))
      .orderBy(oyruOrders.createdAt)

    return Response.json({ success: true, orders })
  } catch (error) {
    console.error('[v0] Error fetching orders:', error)
    return Response.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
