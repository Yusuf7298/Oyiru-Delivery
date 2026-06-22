'use client'

import { useEffect, useState } from 'react'
import { Eye, Trash2 } from 'lucide-react'

interface OrderItem {
  id: string
  productId: string
  quantity: number
  unitPrice: number | string
}

interface Order {
  id: string
  orderNumber: string
  userId?: string
  hotelAccountId?: string
  totalAmount: number | string
  paymentMethod: string
  deliveryAddress: string
  status: string
  createdAt: string
}

export default function OyruOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/admin/oyru-orders')
        if (response.ok) {
          const data = await response.json()
          setOrders(data)
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order)
    try {
      const response = await fetch(`/api/admin/oyru-orders/${order.id}/items`)
      if (response.ok) {
        const data = await response.json()
        setOrderItems(data)
      }
    } catch (error) {
      console.error('Error fetching order items:', error)
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return

    try {
      const response = await fetch(`/api/admin/oyru-orders/${orderId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setOrders(orders.filter((o) => o.id !== orderId))
      }
    } catch (error) {
      console.error('Error deleting order:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Oyru Orders</h1>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 border border-border rounded-lg bg-card">
          <p className="text-muted-foreground">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-border rounded-lg p-4 bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      <strong>Total:</strong> ₹{Number(order.totalAmount).toFixed(2)}
                    </p>
                    <p>
                      <strong>Payment:</strong> {order.paymentMethod}
                    </p>
                    <p>
                      <strong>Delivery:</strong> {order.deliveryAddress}
                    </p>
                    <p>
                      <strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewOrder(order)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="View order details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteOrder(order.id)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    title="Delete order"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Order Details</h2>
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              <div>
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="font-semibold">{selectedOrder.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-semibold text-lg text-primary">
                  ₹{Number(selectedOrder.totalAmount).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Items</p>
                {orderItems.length > 0 ? (
                  <div className="space-y-2">
                    {orderItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm border-b border-border pb-2"
                      >
                        <span>Qty: {item.quantity}</span>
                        <span>₹{Number(item.unitPrice).toFixed(2)} each</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No items</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
