import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { v4 as uuidv4 } from 'uuid'
import { getAuthContext, requireAdmin } from '@/lib/middleware/role-check'
export async function POST(request: Request) {
  const authContext = await getAuthContext()
  if (!authContext) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!requireAdmin(authContext)) return Response.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const body = await request.json()
    const { name, description, price, categoryId, stockQuantity, image } = body
    const newProduct = await db
      .insert(products)
      .values({
        id: uuidv4(),
        name,
        description,
        price: price.toString(),
        categoryId,
        stockQuantity,
        image: image || null,
        isAvailable: true,
      })
      .returning()
    return Response.json(newProduct[0])
  } catch (error) {
    console.error('Error creating product:', error)
    return Response.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
