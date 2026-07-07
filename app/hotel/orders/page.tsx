'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Eye, Download, Truck, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { getHotelOrderDetails, submitB2BOrder } from '@/app/actions/b2b-orders'

interface Order {
  id: string
  orderNumber: string
  totalAmount: number | string
  paymentMethod: string
  deliveryAddress: string
  status: string
  createdAt: string
  items?: any[]
  driver?: {
    name: string
    phone: string
  }
}

export default function HotelOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsLoading, setIsDetailsLoading] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/hotel/orders')
        if (response.ok) {
          const data = await response.json()
          setOrders(data.orders || data) // depending on API response format
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
    setIsDetailsLoading(true)
    setSelectedOrder(order)
    try {
      const data = await getHotelOrderDetails(order.id)
      if (data.success && data.order) {
        setSelectedOrder(data.order as any)
      }
    } catch (error) {
      console.error('Error fetching order items:', error)
    } finally {
      setIsDetailsLoading(false)
    }
  }

  const handleSubmitOrder = async (order: Order) => {
    try {
      const res = await submitB2BOrder(order.id)
      if (res.success) {
        setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'submitted' } : o))
      } else {
        alert(res.error || 'Failed to submit order')
      }
    } catch (err) {
      console.error(err)
      alert('Error submitting order')
    }
  }

  const handleDownloadInvoice = (order: Order) => {
    const invoiceContent = `
Order Invoice
=============
Order Number: ${order.orderNumber}
Date: ${new Date(order.createdAt).toLocaleString()}
Total Amount: ${Number(order.totalAmount).toFixed(2)} Birr
Payment Method: ${order.paymentMethod}
Status: ${order.status}
Delivery Address: ${order.deliveryAddress}
    `
    const element = document.createElement('a')
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(invoiceContent)
    )
    element.setAttribute('download', `invoice-${order.orderNumber}.txt`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'manager_reviewed':
        return 'bg-blue-100 text-blue-800'
      case 'approved':
        return 'bg-purple-100 text-purple-800'
      case 'shipment_prepared':
        return 'bg-orange-100 text-orange-800'
      case 'shipped':
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').toUpperCase()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/hotel" className="flex items-center gap-2 font-bold text-xl">
            <span className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 shadow">
              <Image src="/logo.jpg" alt="Oyru" fill className="object-cover" sizes="32px" />
            </span>
            <span>My Orders</span>
          </Link>
          <Link
            href="/hotel/ordering"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            New Order
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-muted-foreground">View your order history and status</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 border border-border rounded-lg bg-card">
            <p className="text-muted-foreground mb-4">No orders yet</p>
            <Link
              href="/hotel/ordering"
              className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Start Ordering
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-border rounded-lg p-6 bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        Order #{order.orderNumber}
                      </h3>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {Number(order.totalAmount).toFixed(2)} Birr
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.paymentMethod}
                    </p>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground mb-4">
                  <p>Delivery: {order.deliveryAddress}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewOrder(order)}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  {order.status === 'draft' && (
                    <button
                      onClick={() => handleSubmitOrder(order)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Submit Order
                    </button>
                  )}
                  <button
                    onClick={() => handleDownloadInvoice(order)}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-card rounded-lg max-w-lg w-full p-4 sm:p-6 my-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Order Details</h2>

            {isDetailsLoading ? (
              <div className="py-8 text-center text-muted-foreground animate-pulse">
                Loading details...
              </div>
            ) : (
              <div className="space-y-6 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order Number</p>
                    <p className="font-semibold">{selectedOrder.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-semibold">
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="font-semibold text-lg text-primary">
                      {Number(selectedOrder.totalAmount).toFixed(2)} Birr
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        selectedOrder.status
                      )}`}
                    >
                      {formatStatus(selectedOrder.status)}
                    </span>
                  </div>
                </div>

                {/* Driver Info if Shipped */}
                {(selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered') && selectedOrder.driver && (
                  <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                    <h3 className="font-semibold text-green-700 flex items-center gap-2 mb-2">
                      <Truck className="w-4 h-4" /> Delivery Assigned
                    </h3>
                    <div className="text-sm text-green-900/80">
                      <p><strong>Driver:</strong> {selectedOrder.driver.name}</p>
                      <p><strong>Phone:</strong> {selectedOrder.driver.phone}</p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground mb-3">Order Items</p>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <div className="space-y-3">
                      {selectedOrder.items.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center text-sm border border-border p-3 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-secondary rounded overflow-hidden relative">
                              {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                            </div>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-muted-foreground">{item.quantity} kg</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary">{(Number(item.unitPrice) * item.quantity).toFixed(2)} Birr</p>
                            <p className="text-xs text-muted-foreground">{Number(item.unitPrice).toFixed(2)} Birr/kg</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No items</p>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full px-4 py-3 border border-border rounded-lg hover:bg-muted font-medium transition-colors"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
