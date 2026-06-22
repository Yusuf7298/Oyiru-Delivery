'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Package, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  totalAmount: string | number
  status: string
  createdAt: string
  deliveryAddress: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/customer/orders')
        if (!response.ok) throw new Error('Failed to fetch orders')

        const data = await response.json()
        setOrders(data.orders || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'confirmed':
      case 'packing':
      case 'ready':
        return <Package className="w-5 h-5 text-blue-600" />
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      packing: 'bg-purple-100 text-purple-800',
      ready: 'bg-cyan-100 text-cyan-800',
      picked_up: 'bg-orange-100 text-orange-800',
      in_transit: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Shopping</span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Your Orders</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-foreground mb-2">No Orders Yet</h2>
            <p className="text-muted-foreground mb-6">Start shopping to place your first order</p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <Link key={order.id} href={`/customer/orders/${order.id}`}>
                <div className="border border-border rounded-lg p-6 hover:shadow-lg transition-shadow bg-card cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="font-bold text-foreground">{order.orderNumber}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Amount</p>
                      <p className="font-bold text-foreground">₹{Number(order.totalAmount).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Delivery To</p>
                      <p className="font-semibold text-foreground truncate">{order.deliveryAddress}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
