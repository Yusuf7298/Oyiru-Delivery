import { db } from '@/lib/db'
import { products, inventoryLogs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

export const LOW_STOCK_THRESHOLD = 10

export interface InventoryUpdate {
  productId: string
  quantityChanged: number
  reason: string
}

export async function getProductStock(productId: string): Promise<number> {
  try {
    const product = await db.select().from(products).where(eq(products.id, productId)).limit(1)

    if (!product.length) {
      throw new Error(`Product ${productId} not found`)
    }

    return product[0].stockQuantity || 0
  } catch (error) {
    console.error('[v0] Error getting product stock:', error)
    throw error
  }
}

export async function checkStockAvailability(productId: string, quantity: number): Promise<boolean> {
  try {
    const stock = await getProductStock(productId)
    return stock >= quantity
  } catch (error) {
    console.error('[v0] Error checking stock availability:', error)
    return false
  }
}

export async function decrementStock(productId: string, quantity: number, reason: string): Promise<boolean> {
  try {
    const currentStock = await getProductStock(productId)

    if (currentStock < quantity) {
      throw new Error(
        `Insufficient stock for product ${productId}. Available: ${currentStock}, Requested: ${quantity}`
      )
    }

    // Decrement stock
    await db
      .update(products)
      .set({ stockQuantity: currentStock - quantity })
      .where(eq(products.id, productId))

    // Log the change
    await db.insert(inventoryLogs).values({
      id: uuidv4(),
      productId,
      quantityChanged: -quantity,
      reason,
      createdAt: new Date(),
    })

    return true
  } catch (error) {
    console.error('[v0] Error decrementing stock:', error)
    throw error
  }
}

export async function incrementStock(productId: string, quantity: number, reason: string): Promise<boolean> {
  try {
    const currentStock = await getProductStock(productId)

    // Increment stock
    await db
      .update(products)
      .set({ stockQuantity: currentStock + quantity })
      .where(eq(products.id, productId))

    // Log the change
    await db.insert(inventoryLogs).values({
      id: uuidv4(),
      productId,
      quantityChanged: quantity,
      reason,
      createdAt: new Date(),
    })

    return true
  } catch (error) {
    console.error('[v0] Error incrementing stock:', error)
    throw error
  }
}

export async function updateProductAvailability(productId: string): Promise<void> {
  try {
    const stock = await getProductStock(productId)
    const isAvailable = stock > 0

    await db.update(products).set({ isAvailable }).where(eq(products.id, productId))
  } catch (error) {
    console.error('[v0] Error updating product availability:', error)
    throw error
  }
}

export async function checkLowStock(productId: string): Promise<boolean> {
  try {
    const stock = await getProductStock(productId)
    return stock <= LOW_STOCK_THRESHOLD && stock > 0
  } catch (error) {
    console.error('[v0] Error checking low stock:', error)
    return false
  }
}

export async function getLowStockProducts(): Promise<{ productId: string; quantity: number }[]> {
  try {
    const lowStockProducts = await db
      .select({ id: products.id, stockQuantity: products.stockQuantity })
      .from(products)
      .where((product) => product.stockQuantity.lessOrEqual(LOW_STOCK_THRESHOLD))

    return lowStockProducts.map((p) => ({
      productId: p.id,
      quantity: p.stockQuantity || 0,
    }))
  } catch (error) {
    console.error('[v0] Error getting low stock products:', error)
    return []
  }
}

export async function getInventoryHistory(productId: string, limit = 50): Promise<any[]> {
  try {
    const logs = await db
      .select()
      .from(inventoryLogs)
      .where(eq(inventoryLogs.productId, productId))
      .limit(limit)

    return logs
  } catch (error) {
    console.error('[v0] Error getting inventory history:', error)
    return []
  }
}
