import { db } from '@/lib/db'
import { oyruOrderItems } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
