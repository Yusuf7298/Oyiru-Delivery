import { db } from '@/lib/db'
import { oyruOrders } from '@/lib/db/schema'
import { getAuthContext, requireAdmin } from '@/lib/middleware/role-check'

export async function GET() {
  const authContext = await getAuthContext()
  if (!authContext) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!requireAdmin(authContext)) return Response.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const orders = await db.select().from(oyruOrders)

    // Calculate totals
    const totalSales = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0)
    const totalOrders = orders.length
    const totalCustomers = new Set(orders.map(o => o.userId)).size
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0

    // Group by date
    const dailySales: Record<string, { sales: number; orders: number }> = {}
    orders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0]
      if (!dailySales[date]) {
        dailySales[date] = { sales: 0, orders: 0 }
      }
      dailySales[date].sales += Number(order.totalAmount)
      dailySales[date].orders += 1
    })

    const dailySalesArray = Object.entries(dailySales)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return Response.json({
      totalSales,
      totalOrders,
      totalCustomers,
      averageOrderValue,
      dailySales: dailySalesArray,
    })
  } catch (error) {
    console.error('Failed to fetch sales report:', error)
    return Response.json({ error: 'Failed to fetch report' }, { status: 500 })
  }
}
