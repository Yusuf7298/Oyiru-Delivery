import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { v4 as uuidv4 } from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, price, categoryId, stockQuantity } = body

    const newProduct = await db
      .insert(products)
      .values({
        id: uuidv4(),
        name,
        description,
        price: price.toString(),
        categoryId,
        stockQuantity,
        isAvailable: true,
      })
      .returning()

    return Response.json(newProduct[0])
  } catch (error) {
    console.error('Error creating product:', error)
    return Response.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
