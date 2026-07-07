'use server'

import { db } from '@/lib/db'
import { oyruOrders, hotelAccounts, products, categories_oyru, usersProfile } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import { getSession } from '@/lib/auth-utils'

/**
 * Ensure the caller is an authenticated admin or super_admin.
 * Server actions are publicly-invokable endpoints, so every privileged
 * action must guard itself — there is no route middleware doing it.
 */
async function requireAdmin() {
  const session = await getSession()
  if (!session?.user) throw new Error('Unauthorized')

  const profile = await db.query.usersProfile.findFirst({
    where: eq(usersProfile.userId, session.user.id),
  })

  if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
    throw new Error('Forbidden')
  }
  return session
}

/**
 * Get platform statistics (admin only)
 */
export async function getPlatformStats() {
  try {
    await requireAdmin()
    // Get all orders
    const allOrders = await db.select().from(oyruOrders)
    const ordersCount = allOrders.length
    const totalRevenue = allOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount || '0'), 0)

    // Get hotels
    const allHotels = await db.select().from(hotelAccounts)

    // Get products
    const allProducts = await db.select().from(products)
    const lowStockProducts = allProducts.filter(p => p.stockQuantity < 10).length

    const stats = {
      totalOrders: ordersCount,
      totalRevenue: totalRevenue,
      activeHotels: allHotels.length,
      totalProducts: allProducts.length,
      lowStockItems: lowStockProducts,
      recentOrders: allOrders.slice(-5),
    }

    return stats
  } catch (error) {
    console.error('[v0] Error getting platform stats:', error)
    return {
      totalOrders: 0,
      totalRevenue: 0,
      activeHotels: 0,
      totalProducts: 0,
      lowStockItems: 0,
      recentOrders: [],
    }
  }
}

/**
 * Get all hotels
 */
export async function getAllHotels() {
  try {
    await requireAdmin()
    return await db.select().from(hotelAccounts)
  } catch (error) {
    console.error('[v0] Error getting hotels:', error)
    return []
  }
}

/**
 * Get all orders
 */
export async function getAllOrders() {
  try {
    await requireAdmin()
    return await db.select().from(oyruOrders)
  } catch (error) {
    console.error('[v0] Error getting orders:', error)
    return []
  }
}

/**
 * Get all products
 */
export async function getAllProducts() {
  try {
    await requireAdmin()
    return await db.select().from(products)
  } catch (error) {
    console.error('[v0] Error getting products:', error)
    return []
  }
}

/**
 * Get product categories
 */
export async function getCategories() {
  try {
    await requireAdmin()
    return await db.select().from(categories_oyru)
  } catch (error) {
    console.error('[v0] Error getting categories:', error)
    return []
  }
}

/**
 * Get order by ID (Admin)
 */
export async function getOrderByIdAdmin(orderId: string) {
  try {
    await requireAdmin()
    const order = await db.query.oyruOrders.findFirst({
      where: eq(oyruOrders.id, orderId)
    })

    if (!order) return null

    // Get items using standard select since we need to join products
    const { oyruOrderItems } = await import('@/lib/db/schema')
    const items = await db.select({
      id: oyruOrderItems.id,
      productId: oyruOrderItems.productId,
      quantity: oyruOrderItems.quantity,
      unitPrice: oyruOrderItems.unitPrice,
      name: products.name,
      image: products.image
    })
    .from(oyruOrderItems)
    .innerJoin(products, eq(oyruOrderItems.productId, products.id))
    .where(eq(oyruOrderItems.orderId, orderId))

    return {
      ...order,
      items
    }
  } catch (error) {
    console.error('Error fetching order for admin:', error)
    return null
  }
}

/**
 * Update Oyru Order Status (Admin)
 */
export async function updateOyruOrderStatus(orderId: string, status: any) {
  try {
    await requireAdmin()
    const updated = await db
      .update(oyruOrders)
      .set({ status, updatedAt: new Date() })
      .where(eq(oyruOrders.id, orderId))
      .returning()

    return { success: true, order: updated[0] }
  } catch (error) {
    console.error('Error updating order status:', error)
    return { success: false, error: 'Failed to update status' }
  }
}

/**
 * Create Staff Account (Super Admin Only)
 */
export async function createStaffAccount(formData: FormData) {
  const { auth } = await import('@/lib/auth')
  const { user, usersProfile } = await import('@/lib/db/schema')
  const { getSession } = await import('@/lib/auth-utils')

  const session = await getSession()
  if (!session?.user) throw new Error('Unauthorized')

  const profile = await db.query.usersProfile.findFirst({
    where: eq(usersProfile.userId, session.user.id)
  })

  if (profile?.role !== 'super_admin') {
    throw new Error('Forbidden: Only Super Admins can create staff accounts')
  }

  try {
    const role = formData.get('role') as string
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const phone = formData.get('phone') as string
    
    // Process File Upload if present
    const pdfFile = formData.get('agreementPdf') as File | null
    let pdfUrl = ''
    if (pdfFile && pdfFile.size > 0) {
       // In a real production app, upload to S3/Cloud. For prototype, we generate a mock URL or save locally.
       // We'll mock the URL here, or if you implemented a local write, we can write it.
       // Since server actions cannot easily use `fs` without path resolution tricks in Next.js, we'll store a pseudo URL.
       pdfUrl = `/uploads/agreements/${Date.now()}-${pdfFile.name.replace(/\s/g, '_')}`
       // NOTE: Actual file saving logic would go here.
    }

    const res = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name
      },
      headers: new Headers() // Do not pass current session headers to avoid cookie overriding
    })

    if (res?.user) {
      // 1. Create or Update usersProfile
      const existingProfile = await db.query.usersProfile.findFirst({
        where: eq(usersProfile.userId, res.user.id)
      })

      if (existingProfile) {
        await db.update(usersProfile)
          .set({ role: role as any, phoneNumber: phone, address: formData.get('hotelAddress') as string || undefined })
          .where(eq(usersProfile.userId, res.user.id))
      } else {
        const profileId = `prof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        await db.insert(usersProfile).values({
          id: profileId,
          userId: res.user.id,
          role: role as any,
          phoneNumber: phone,
          address: formData.get('hotelAddress') as string || undefined
        })
      }

      // 2. Role-specific creations
      if (role === 'restaurant_owner') {
        const { hotelAccounts, hotelProductAgreements } = await import('@/lib/db/schema')
        
        const companyName = formData.get('companyName') as string || name
        const address = formData.get('hotelAddress') as string
        const duration = formData.get('agreementDuration') as string
        const basePayment = formData.get('basePaymentAmount') as string

        const hotelId = `hot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        await db.insert(hotelAccounts).values({
          id: hotelId,
          userId: res.user.id,
          companyName,
          contactPerson: name,
          email,
          phone,
          agreementDuration: duration || null,
          basePaymentAmount: basePayment ? basePayment : null,
          isActive: true
        })

        // Parse agreements JSON (array of {productId, pricePerKg})
        const agreementsJson = formData.get('agreements') as string
        let agreementsArray: Array<{ productId?: string; pricePerKg?: string }> = []
        try {
          agreementsArray = agreementsJson ? JSON.parse(agreementsJson) : []
        } catch (e) {
          console.error('Failed to parse agreements JSON', e)
        }
        // Insert each product agreement from the form's agreements list
        for (const agr of agreementsArray) {
          if (agr.productId && agr.pricePerKg) {
            await db.insert(hotelProductAgreements).values({
              id: `hpa_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              hotelId,
              productId: agr.productId,
              agreedPrice: agr.pricePerKg
            })
          }
        }
      } 
      else if (role === 'admin') {
         const { adminProfiles } = await import('@/lib/db/schema')
         const startDateStr = formData.get('startDate') as string
         const positionTitle = formData.get('positionTitle') as string
         
         await db.insert(adminProfiles).values({
            id: `adm_${Date.now()}`,
            userId: res.user.id,
            startDate: startDateStr ? new Date(startDateStr) : new Date(),
            positionTitle,
         })
      }
      else if (role === 'delivery_partner') {
         const { deliveryPartners } = await import('@/lib/db/schema')
         
         const serviceType = formData.get('serviceType') as string
         const serviceFee = formData.get('serviceFee') as string
         const birthPlace = formData.get('birthPlace') as string
         const guarantorName = formData.get('guarantorName') as string
         const guarantorPhone = formData.get('guarantorPhone') as string

         await db.insert(deliveryPartners).values({
            id: `del_${Date.now()}`,
            userId: res.user.id,
            phoneNumber: phone || '',
            serviceType,
            serviceFee: serviceFee ? serviceFee : null,
            birthPlace,
            guarantorName,
            guarantorPhone,
            agreementPdfUrl: pdfUrl || null,
            isVerified: true
         })
      }

      return { success: true }
    } else {
      throw new Error('Failed to create account via auth')
    }
  } catch (error: any) {
    console.error('Error creating staff account:', error)
    return { success: false, error: error.message || 'Failed to create account' }
  }
}
