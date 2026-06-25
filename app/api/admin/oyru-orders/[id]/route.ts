import { db } from '@/lib/db'
import { oyruOrders } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.delete(oyruOrders).where(eq(oyruOrders.id, id))

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting order:', error)
    return Response.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}
