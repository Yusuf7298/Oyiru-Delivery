'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getRestaurantOrders, updateOrderStatusFromRestaurant } from '@/app/actions/restaurant-orders'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle2, Clock, Package } from 'lucide-react'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  picked_up: 'bg-blue-100 text-blue-800',
  in_transit: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const statusFlow = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'in_transit', 'delivered']

export default function RestaurantOrdersPage() {
  const params = useParams()
  const restaurantId = params.id as string

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getRestaurantOrders(restaurantId)
        setOrders(data)
      } catch (error) {
        console.error('Error loading orders:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [restaurantId])

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)
    try {
      const updated = await updateOrderStatusFromRestaurant(orderId, newStatus, restaurantId)
      setOrders(orders.map(o => (o.id === orderId ? updated : o)))
    } catch (error) {
      console.error('Error updating order:', error)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/restaurant" className="flex items-center gap-2 hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-xl font-bold">Orders</h1>
          <div className="w-16"></div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg p-6 animate-pulse h-32"></div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div key={order.id} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">Order #{order.id.slice(0, 8)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      ${parseFloat(order.totalAmount).toFixed(2)}
                    </div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${
                        statusColors[order.status] || 'bg-gray-100'
                      }`}
                    >
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <p className="text-muted-foreground">Delivery Address</p>
                    <p className="font-semibold">{order.deliveryAddress}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Delivery City</p>
                    <p className="font-semibold">{order.deliveryCity}</p>
                  </div>
                </div>

                {/* Status Flow */}
                <div className="mb-6">
                  <p className="text-sm font-semibold mb-3">Update Status</p>
                  <div className="flex gap-2 flex-wrap">
                    {statusFlow.map((status, index) => {
                      const isCurrentStatus = status === order.status
                      const isPastStatus = statusFlow.indexOf(order.status) >= index
                      const isNextStatus = statusFlow.indexOf(order.status) === index - 1

                      return (
                        <button
                          key={status}
                          onClick={() => isNextStatus && handleStatusUpdate(order.id, status)}
                          disabled={!isNextStatus || updating === order.id}
                          className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                            isCurrentStatus
                              ? 'bg-primary text-white'
                              : isPastStatus
                              ? 'bg-green-100 text-green-800 cursor-default'
                              : isNextStatus
                              ? 'bg-secondary hover:bg-secondary/80 cursor-pointer'
                              : 'bg-muted text-muted-foreground cursor-default'
                          } ${updating === order.id ? 'opacity-50' : ''}`}
                        >
                          {status.replace('_', ' ')}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Special Instructions */}
                {order.specialInstructions && (
                  <div className="bg-secondary/50 rounded p-3">
                    <p className="text-sm text-muted-foreground">Special Instructions</p>
                    <p className="text-sm font-medium">{order.specialInstructions}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg text-muted-foreground">No orders yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
