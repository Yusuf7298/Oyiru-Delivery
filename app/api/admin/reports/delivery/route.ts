import { db } from '@/lib/db'
import { oyruOrders } from '@/lib/db/schema'
import { getAuthContext, requireAdmin } from '@/lib/middleware/role-check'

export async function GET() {
  const authContext = await getAuthContext()
  if (!authContext) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!requireAdmin(authContext)) return Response.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const orders = await db.select().from(oyruOrders)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    // Active Deliveries (shipped or assigned)
    const activeDeliveries = orders.filter(o => o.status === 'shipped' || o.status === 'assigned').length

    // Completed Today (delivered or completed today)
    const completedToday = orders.filter(o => 
      (o.status === 'delivered' || o.status === 'completed') && 
      new Date(o.updatedAt || o.createdAt) >= today
    ).length

    // Needs attention (shipped but older than 24h)
    const delayedShipments = orders.filter(o => 
      o.status === 'shipped' && 
      new Date(o.updatedAt || o.createdAt) < twentyFourHoursAgo
    ).length

    return Response.json({
      activeDeliveries,
      completedToday,
      delayedShipments,
    })
  } catch (error) {
    console.error('Failed to fetch delivery report:', error)
    return Response.json({ error: 'Failed to fetch report' }, { status: 500 })
  }
}
