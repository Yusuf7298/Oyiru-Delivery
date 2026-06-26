'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getUserProductOrders, getProductOrder } from '@/app/actions/product-orders'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getUserProductOrders()
        setOrders(data)
      } catch (error) {
        console.error('Error loading orders:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  const handleViewOrder = async (orderId: string) => {
    try {
      const orderData = await getProductOrder(orderId)
      setSelectedOrder(orderData)
    } catch (error) {
      console.error('Error loading order:', error)
    }
  }

  const computeSubtotal = (order: any) => {
    if (order.items && order.items.length > 0) {
      return order.items.reduce((sum: number, item: any) => sum + parseFloat(item.unitPrice || 0) * item.quantity, 0)
    }
    // Fallback if items not loaded yet
    return parseFloat(order.totalAmount) - 5.00
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-xl font-bold">My Orders</h1>
          <div className="w-16"></div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg p-6 animate-pulse h-24"></div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <button
                key={order.id}
                onClick={() => handleViewOrder(order.id)}
                className="w-full bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-lg">Order #{order.orderNumber || order.id.slice(0, 8)}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[order.status] || 'bg-gray-100'}`}
                  >
                    {order.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  <span className="font-semibold text-foreground">{parseFloat(order.totalAmount).toFixed(2)} Birr</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-6">You haven&apos;t placed any orders yet</p>
            <Link href="/">
              <Button>Start Ordering</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg max-w-md w-full p-6 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Order #{selectedOrder.orderNumber || selectedOrder.id.slice(0, 8)}</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusColors[selectedOrder.status] || 'bg-gray-100'
                    }`}
                >
                  {selectedOrder.status.replace('_', ' ').toUpperCase()}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-semibold">{(parseFloat(item.unitPrice) * item.quantity).toFixed(2)} Birr</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    {computeSubtotal(selectedOrder).toFixed(2)} Birr
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>5.00 Birr</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{parseFloat(selectedOrder.totalAmount).toFixed(2)} Birr</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Delivery Address</p>
                <p className="font-semibold">{selectedOrder.deliveryAddress}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
