import { db } from '@/lib/db'
import { oyruOrderItems } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const items = await db
      .select()
      .from(oyruOrderItems)
      .where(eq(oyruOrderItems.orderId, id))

    return Response.json(items)
  } catch (error) {
    console.error('Error fetching order items:', error)
    return Response.json(
      { error: 'Failed to fetch order items' },
      { status: 500 }
    )
  }
}
