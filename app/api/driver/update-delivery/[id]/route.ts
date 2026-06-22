import { db } from '@/lib/db'
import { deliveries } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status } = await req.json()
    const deliveryId = params.id

    const updates: any = { status }

    // Set pickup time when picked up
    if (status === 'picked_up') {
      updates.pickupTime = new Date()
    }

    // Set delivery time when delivered
    if (status === 'delivered') {
      updates.deliveryTime = new Date()
    }

    const updated = await db
      .update(deliveries)
      .set(updates)
      .where(eq(deliveries.id, deliveryId))
      .returning()

    return Response.json(updated[0])
  } catch (error) {
    console.error('Failed to update delivery:', error)
    return Response.json({ error: 'Failed to update delivery' }, { status: 500 })
  }
}
