import { db } from '@/lib/db'
import { categories_oyru } from '@/lib/db/schema'

export async function GET() {
  try {
    const categories = await db.select().from(categories_oyru)
    return Response.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return Response.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
