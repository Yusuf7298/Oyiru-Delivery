import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await db.delete(products).where(eq(products.id, id))

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return Response.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
