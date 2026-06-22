'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Package, MapPin, Phone, DollarSign } from 'lucide-react'
import { OrderTimeline } from '@/components/order-timeline'

interface OrderItem {
  id: string
  productId: string
  quantity: number
  unitPrice: string | number
}

interface Order {
  id: string
  orderNumber: string
  totalAmount: string | number
  status: string
  createdAt: string
  deliveryAddress: string
  deliveryNotes?: string
  paymentMethod: string
  items: OrderItem[]
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/customer/orders/${params.id}`)
        if (!response.ok) throw new Error('Failed to fetch order')

        const data = await response.json()
        setOrder(data.order)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error || 'Order not found'}</p>
          <Link href="/customer/orders" className="text-primary hover:underline">
            Back to Orders
          </Link>
        </div>
      </div>
    )
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/customer/orders"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Orders</span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{order.orderNumber}</h1>
              <p className="text-sm text-muted-foreground">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadge(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Timeline */}
            <div className="border border-border rounded-lg p-6 bg-card">
              <h2 className="text-xl font-bold text-foreground mb-6">Order Status</h2>
              <OrderTimeline currentStatus={order.status as any} createdAt={new Date(order.createdAt)} />
            </div>

            {/* Order Items */}
            <div className="border border-border rounded-lg p-6 bg-card">
              <h2 className="text-xl font-bold text-foreground mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between pb-4 border-b border-border last:border-b-0">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Product {item.productId}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        ₹{(Number(item.unitPrice) * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ₹{Number(item.unitPrice).toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="border border-border rounded-lg p-6 bg-card">
              <h3 className="text-lg font-bold text-foreground mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">₹{Number(order.totalAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-semibold">₹0.00</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">
                    ₹{Number(order.totalAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="border border-border rounded-lg p-6 bg-card">
              <h3 className="text-lg font-bold text-foreground mb-4">Delivery Details</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery Address</p>
                    <p className="font-semibold text-foreground">{order.deliveryAddress}</p>
                  </div>
                </div>
                {order.deliveryNotes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery Notes</p>
                    <p className="font-semibold text-foreground">{order.deliveryNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="border border-border rounded-lg p-6 bg-card">
              <h3 className="text-lg font-bold text-foreground mb-4">Payment</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span className="text-sm">
                    {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Invoice'}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {order.paymentMethod === 'COD'
                    ? 'Pay when your order arrives'
                    : 'Invoice will be sent separately'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
