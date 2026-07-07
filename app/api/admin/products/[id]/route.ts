import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getAuthContext, requireAdmin } from '@/lib/middleware/role-check'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authContext = await getAuthContext()
  if (!authContext) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!requireAdmin(authContext)) return Response.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, price, categoryId, stockQuantity, image, isAvailable } = body

    // Only update fields that were provided
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = price.toString()
    if (categoryId !== undefined) updateData.categoryId = categoryId
    if (stockQuantity !== undefined) updateData.stockQuantity = stockQuantity
    if (image !== undefined) updateData.image = image || null
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable

    if (Object.keys(updateData).length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 })
    }

    const updated = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning()

    if (!updated.length) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    return Response.json(updated[0])
  } catch (error) {
    console.error('Error updating product:', error)
    return Response.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authContext = await getAuthContext()
  if (!authContext) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!requireAdmin(authContext)) return Response.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const { id } = await params
    await db.delete(products).where(eq(products.id, id))
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return Response.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
