import { db } from '@/lib/db'
import { oyruOrders, hotelAccounts } from '@/lib/db/schema'
import { getAuthContext, requireAdmin } from '@/lib/middleware/role-check'
import { eq, inArray, and, gte, lte } from 'drizzle-orm'

export async function GET() {
  const authContext = await getAuthContext()
  if (!authContext) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!requireAdmin(authContext)) return Response.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const orders = await db.select().from(oyruOrders)
    const hotels = await db.select().from(hotelAccounts)

    // Monthly Revenue
    const monthlyRevenue = orders
      .filter(o => new Date(o.createdAt) >= thirtyDaysAgo && (o.status === 'delivered' || o.status === 'completed' || o.status === 'approved' || o.status === 'shipped'))
      .reduce((sum, o) => sum + Number(o.totalAmount), 0)

    // Active Hotels
    const activeHotelsCount = hotels.filter(h => h.isActive).length

    // Engagement (total orders this month vs last month, simple proxy)
    const currentMonthOrders = orders.filter(o => new Date(o.createdAt) >= thirtyDaysAgo).length
    const engagementScore = currentMonthOrders > 50 ? 'Very High' : currentMonthOrders > 20 ? 'High' : currentMonthOrders > 5 ? 'Medium' : 'Low'

    return Response.json({
      monthlyRevenue,
      activeHotelsCount,
      engagementScore,
    })
  } catch (error) {
    console.error('Failed to fetch analytics report:', error)
    return Response.json({ error: 'Failed to fetch report' }, { status: 500 })
  }
}
