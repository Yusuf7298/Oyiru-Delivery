import { db } from '@/lib/db'
import { oyruOrders, oyruOrderItems } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { v4 as uuidv4 } from 'crypto'

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { items, totalAmount } = body

    if (!items || items.length === 0) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const orderId = uuidv4()
    const orderNumber = `ORD-${Date.now()}`

    // Create order
    const newOrder = await db
      .insert(oyruOrders)
      .values({
        id: orderId,
        orderNumber,
        userId: session.user.id,
        totalAmount: totalAmount.toString(),
        paymentMethod: 'prepaid',
        deliveryAddress: session.user.email || 'Hotel Address',
        status: 'pending',
      })
      .returning()

    // Create order items
    const orderItemsData = items.map((item: any) => ({
      id: uuidv4(),
      orderId,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.price.toString(),
    }))

    await db.insert(oyruOrderItems).values(orderItemsData)

    return Response.json({
      ...newOrder[0],
      items: orderItemsData,
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return Response.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await db
      .select()
      .from(oyruOrders)
      .where((table) => table.userId === session.user.id)
      .orderBy(oyruOrders.createdAt)

    return Response.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return Response.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
