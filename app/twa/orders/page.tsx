'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import WebApp from '@twa-dev/sdk'
import { getUserOrders } from '@/app/actions/orders'
import { EmptyState } from '@/components/notifications'
import { OrderHistorySkeleton } from '@/components/skeletons'

export default function TelegramOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      WebApp.ready()
      WebApp.expand()
    }

    const loadOrders = async () => {
      try {
        const data = await getUserOrders()
        setOrders(data)
      } catch (error) {
        console.error('Error loading orders:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-card border-b border-border py-4 px-4">
        <div className="flex items-center gap-4">
          <Link href="/twa" className="text-primary font-semibold">
            ← Back
          </Link>
          <h1 className="text-lg font-bold">My Orders</h1>
        </div>
      </header>

      <div className="px-4 py-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <OrderHistorySkeleton key={i} />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <Link
                key={order.id}
                href={`/twa/orders/${order.id}`}
                className="block bg-card rounded-lg border border-border p-4 hover:border-primary/50 transition-colors active:bg-secondary"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${order.status === 'delivered'
                      ? 'bg-green-50 text-green-700'
                      : order.status === 'cancelled'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-blue-50 text-blue-700'
                      }`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-3">
                  {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''} • {parseFloat(order.totalAmount).toFixed(2)} Birr
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    View details →
                  </span>
                  <span className="text-xs font-medium text-primary">
                    Track Order
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="📦"
            title="No orders yet"
            description="Start ordering delicious food from your favorite restaurants"
            action={
              <Link href="/twa">
                <button className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90">
                  Browse Restaurants
                </button>
              </Link>
            }
          />
        )}
      </div>
    </div>
  )
}
