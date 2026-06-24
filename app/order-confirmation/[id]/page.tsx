'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getProductOrder } from '@/app/actions/product-orders'

interface OrderConfirmationProps {
  params: Promise<{ id: string }>
}

interface OrderData {
  id: string
  customerId: string
  status: string
  subtotal: number
  deliveryFee: number
  tax: number
  total: number
  address: string
  phone: string
  createdAt: string
  items?: Array<{
    id: string
    orderId: string
    productId: string
    quantity: number
    unitPrice: number
    name: string
    image?: string
  }>
}

export default function OrderConfirmation({ params }: OrderConfirmationProps) {
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [orderId, setOrderId] = useState('')

  useEffect(() => {
    const unwrapParams = async () => {
      const { id } = await params
      setOrderId(id)
      
      const orderData = await getProductOrder(id)
      setOrder(orderData)
      setLoading(false)
    }

    unwrapParams()
  }, [params])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">Order Not Found</h1>
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground mb-6">
            We couldn&apos;t find the order you&apos;re looking for.
          </p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-purple-100 text-purple-800',
    out_for_delivery: 'bg-cyan-100 text-cyan-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  const statusColor = statusColors[order.status] || 'bg-gray-100 text-gray-800'

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-primary font-semibold">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold">Order Confirmation</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex gap-4">
            <div className="text-green-600 text-2xl">✓</div>
            <div>
              <h2 className="text-lg font-semibold text-green-900 mb-1">
                Order Placed Successfully!
              </h2>
              <p className="text-green-800">
                Your order has been received and is being prepared for delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Order Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Order Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-mono font-semibold">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                  {order.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Date:</span>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Delivery Address</h3>
            <div className="space-y-2 text-sm">
              <p className="font-semibold">{order.address}</p>
              <p className="text-muted-foreground">{order.phone}</p>
              <p className="text-muted-foreground mt-4 text-xs">
                Estimated delivery: 30-45 minutes
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Order Items</h3>
          <div className="space-y-4">
            {order.items && order.items.length > 0 ? (
              order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-3 border-b border-border last:border-b-0">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity} × ₹{parseFloat(item.unitPrice.toString()).toFixed(2)}
                    </p>
                  </div>
                  <p className="font-semibold">
                    ₹{(parseFloat(item.unitPrice.toString()) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No items found</p>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>₹{parseFloat(order.subtotal.toString()).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery Fee:</span>
              <span>₹{parseFloat(order.deliveryFee.toString()).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (5%):</span>
              <span>₹{parseFloat(order.tax.toString()).toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between font-semibold">
              <span>Total:</span>
              <span className="text-lg">₹{parseFloat(order.total.toString()).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>
          <Link href="/orders" className="flex-1">
            <Button className="w-full">
              View All Orders
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
