'use server'

import { db } from '@/lib/db'
import { restaurants, categories, dishes } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getUserId } from '@/lib/auth-utils'

/**
 * Fetch all restaurants for the customer view
 */
export async function fetchRestaurants() {
  return db
    .select()
    .from(restaurants)
    .where(eq(restaurants.isActive, true))
}

/**
 * Fetch a single restaurant with all details
 */
export async function fetchRestaurant(restaurantId: string) {
  return db
    .select()
    .from(restaurants)
    .where(and(eq(restaurants.id, restaurantId), eq(restaurants.isActive, true)))
    .limit(1)
    .then(rows => rows[0])
}

/**
 * Fetch all categories for a restaurant
 */
export async function fetchRestaurantCategories(restaurantId: string) {
  return db
    .select()
    .from(categories)
    .where(eq(categories.restaurantId, restaurantId))
}

/**
 * Fetch all dishes for a restaurant (optionally filtered by category)
 */
export async function fetchRestaurantDishes(restaurantId: string, categoryId?: string) {
  const conditions = categoryId
    ? and(eq(dishes.restaurantId, restaurantId), eq(dishes.categoryId, categoryId))
    : eq(dishes.restaurantId, restaurantId)

  return db
    .select()
    .from(dishes)
    .where(conditions)
}

/**
 * Create a new restaurant (restaurant owner only)
 */
export async function createRestaurant(data: {
  name: string
  description?: string
  imageUrl?: string
  address: string
  city: string
  latitude?: number
  longitude?: number
  phoneNumber?: string
  deliveryTime?: number
  deliveryFee?: string
  minOrderAmount?: string
}) {
  const userId = await getUserId()

  const restaurantId = `rest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const [restaurant] = await db
    .insert(restaurants)
    .values({
      id: restaurantId,
      userId,
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      address: data.address,
      city: data.city,
      latitude: data.latitude ? String(data.latitude) : undefined,
      longitude: data.longitude ? String(data.longitude) : undefined,
      phoneNumber: data.phoneNumber,
      deliveryTime: data.deliveryTime,
      deliveryFee: data.deliveryFee || '0',
      minOrderAmount: data.minOrderAmount || '0',
    })
    .returning()

  return restaurant
}

/**
 * Update a restaurant
 */
export async function updateRestaurant(restaurantId: string, data: Partial<typeof restaurants.$inferInsert>) {
  const userId = await getUserId()

  const updated = await db
    .update(restaurants)
    .set(data)
    .where(and(eq(restaurants.id, restaurantId), eq(restaurants.userId, userId)))
    .returning()

  return updated[0]
}

/**
 * Create a new category
 */
export async function createCategory(restaurantId: string, data: {
  name: string
  description?: string
  imageUrl?: string
  displayOrder?: number
}) {
  const userId = await getUserId()

  // Verify ownership
  const restaurant = await db
    .select()
    .from(restaurants)
    .where(and(eq(restaurants.id, restaurantId), eq(restaurants.userId, userId)))
    .limit(1)

  if (!restaurant.length) throw new Error('Restaurant not found or unauthorized')

  const categoryId = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const [category] = await db
    .insert(categories)
    .values({
      id: categoryId,
      restaurantId,
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      displayOrder: data.displayOrder || 0,
    })
    .returning()

  return category
}

/**
 * Create a new dish
 */
export async function createDish(data: {
  restaurantId: string
  categoryId: string
  name: string
  description?: string
  price: string
  imageUrl?: string
  preparationTime?: number
  displayOrder?: number
}) {
  const userId = await getUserId()

  // Verify ownership
  const restaurant = await db
    .select()
    .from(restaurants)
    .where(and(eq(restaurants.id, data.restaurantId), eq(restaurants.userId, userId)))
    .limit(1)

  if (!restaurant.length) throw new Error('Restaurant not found or unauthorized')

  const dishId = `dish_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const [dish] = await db
    .insert(dishes)
    .values({
      id: dishId,
      restaurantId: data.restaurantId,
      categoryId: data.categoryId,
      name: data.name,
      description: data.description,
      price: data.price,
      imageUrl: data.imageUrl,
      preparationTime: data.preparationTime,
      displayOrder: data.displayOrder || 0,
    })
    .returning()

  return dish
}

/**
 * Update a dish
 */
export async function updateDish(dishId: string, data: Partial<typeof dishes.$inferInsert>) {
  const userId = await getUserId()

  // Verify ownership through restaurant
  const dish = await db
    .select()
    .from(dishes)
    .where(eq(dishes.id, dishId))
    .limit(1)

  if (!dish.length) throw new Error('Dish not found')

  const restaurant = await db
    .select()
    .from(restaurants)
    .where(and(eq(restaurants.id, dish[0].restaurantId), eq(restaurants.userId, userId)))
    .limit(1)

  if (!restaurant.length) throw new Error('Unauthorized')

  const updated = await db
    .update(dishes)
    .set(data)
    .where(eq(dishes.id, dishId))
    .returning()

  return updated[0]
}
