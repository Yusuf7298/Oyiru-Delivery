'use client'

import { useEffect, useState } from 'react'
import { Eye, Shield, Truck, Calendar, ShoppingBag, Loader2, CheckCircle2, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react'
import { getHotelOrders, getOrderDetails, updateOrderStatus, assignDriver } from '@/app/actions/oyru-orders'
import { getAvailableDrivers } from '@/app/actions/delivery-actions'
import { getStatusLabel, getStatusColor, getStatusTimeline, OyruOrderStatus } from '@/lib/services/oyru-order-lifecycle'

export default function OyruOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [orderDetails, setOrderDetails] = useState<any | null>(null)
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [orderHistory, setOrderHistory] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [selectedDriverId, setSelectedDriverId] = useState('')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isAssigningDriver, setIsAssigningDriver] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadOrders()
    loadDrivers()
  }, [])

  async function loadOrders() {
    setIsLoading(true)
    const res = await getHotelOrders()
    if (res.success && res.orders) {
      setOrders(res.orders)
    }
    setIsLoading(false)
  }

  async function loadDrivers() {
    const res = await getAvailableDrivers()
    if (res.success && res.drivers) {
      setDrivers(res.drivers)
    }
  }

  const handleViewOrder = async (order: any) => {
    setSelectedOrder(order)
    setOrderDetails(null)
    setOrderItems([])
    setOrderHistory([])
    setSelectedDriverId('')
    
    const res = await getOrderDetails(order.id)
    if (res.success) {
      setOrderDetails(res.order)
      setOrderItems(res.items || [])
      setOrderHistory(res.history || [])
    }
  }

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    setIsUpdatingStatus(true)
    setMessage(null)
    const res = await updateOrderStatus(orderId, nextStatus, `Updated by admin`)
    if (res.success) {
      setMessage({ type: 'success', text: `Order status updated to ${getStatusLabel(nextStatus as OyruOrderStatus)}` })
      loadOrders()
      // Refresh selected order details if open
      if (selectedOrder && selectedOrder.id === orderId) {
        const detailRes = await getOrderDetails(orderId)
        if (detailRes.success) {
          setSelectedOrder(detailRes.order)
          setOrderDetails(detailRes.order)
          setOrderHistory(detailRes.history || [])
        }
      }
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to update order status' })
    }
    setIsUpdatingStatus(false)
  }

  const handleAssignDriver = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDriverId || !selectedOrder) return
    setIsAssigningDriver(true)
    setMessage(null)

    const res = await assignDriver(selectedOrder.id, selectedDriverId)
    if (res.success) {
      setMessage({ type: 'success', text: 'Driver assigned successfully!' })
      setSelectedDriverId('')
      loadOrders()
      // Refresh selected order
      const detailRes = await getOrderDetails(selectedOrder.id)
      if (detailRes.success) {
        setSelectedOrder(detailRes.order)
        setOrderDetails(detailRes.order)
        setOrderHistory(detailRes.history || [])
      }
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to assign driver' })
    }
    setIsAssigningDriver(false)
  }

  const getStatusActionLabel = (status: OyruOrderStatus) => {
    switch (status) {
      case 'submitted': return 'Review Inventory'
      case 'inventory_review': return 'Approve Order'
      default: return ''
    }
  }

  const getNextStatus = (status: OyruOrderStatus): OyruOrderStatus | null => {
    switch (status) {
      case 'submitted': return 'inventory_review'
      case 'inventory_review': return 'approved'
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold mb-2 tracking-wider uppercase">
            <Shield className="w-4 h-4" />
            Admin Operations
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Oyru Partner Orders
          </h1>
          <p className="text-slate-400 mt-1">
            Review submitted hotel orders, verify inventory stock, approve contracts, and assign delivery partners.
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-6 flex items-center justify-between ${
            message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
          }`}>
            <span className="font-medium">{message.text}</span>
            <button onClick={() => setMessage(null)} className="opacity-60 hover:opacity-100">✕</button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-slate-400 font-medium">Loading partner orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center backdrop-blur-xl">
            <ShoppingBag className="w-16 h-16 mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-300">No partner orders found</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">
              Hotel partner orders will appear here once they draft and submit them from their ordering console.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                      Order #{order.orderNumber}
                    </h3>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold border"
                      style={{
                        backgroundColor: `${getStatusColor(order.status as OyruOrderStatus)}15`,
                        color: getStatusColor(order.status as OyruOrderStatus),
                        borderColor: `${getStatusColor(order.status as OyruOrderStatus)}30`
                      }}
                    >
                      {getStatusLabel(order.status as OyruOrderStatus)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-sm text-slate-400 border-t border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-slate-500" />
                      <span>Total Amount: <strong className="text-white">{parseFloat(order.totalAmount).toFixed(2)} Birr</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-slate-500" />
                      <span className="line-clamp-1">Deliver to: {order.deliveryAddress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span>Placed on: {new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Actions based on status */}
                  {getNextStatus(order.status as OyruOrderStatus) && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, getNextStatus(order.status as OyruOrderStatus)!)}
                      disabled={isUpdatingStatus}
                      className="flex items-center gap-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/30 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    >
                      {getStatusActionLabel(order.status as OyruOrderStatus)} <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  {order.status === 'draft' && (
                    <span className="text-xs text-slate-500 italic px-3 py-2 border border-slate-800/40 rounded-xl bg-slate-950/20">
                      Draft — Awaiting hotel submission
                    </span>
                  )}

                  <button
                    onClick={() => handleViewOrder(order)}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  >
                    <Eye className="w-4 h-4" /> View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detailed Modal View */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl animate-in fade-in-50 zoom-in-95 my-8">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  Order Details — #{selectedOrder.orderNumber}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Order Specs */}
                  <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-5 space-y-3 text-sm">
                    <h4 className="font-bold text-indigo-400 uppercase tracking-wide text-xs">Summary Details</h4>
                    <div className="flex justify-between border-b border-slate-800/50 pb-2">
                      <span className="text-slate-400">Total Price:</span>
                      <span className="font-semibold text-white">{parseFloat(selectedOrder.totalAmount).toFixed(2)} Birr</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/50 pb-2">
                      <span className="text-slate-400">Payment Mode:</span>
                      <span className="font-semibold text-white">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/50 pb-2">
                      <span className="text-slate-400">Address:</span>
                      <span className="font-semibold text-white text-right max-w-[200px] line-clamp-2">{selectedOrder.deliveryAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Special Notes:</span>
                      <span className="text-slate-300 italic">{selectedOrder.deliveryNotes || 'None'}</span>
                    </div>
                  </div>

                  {/* Assign Driver Form */}
                  {selectedOrder.status === 'approved' && (
                    <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-5 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h4 className="font-bold text-indigo-400 uppercase tracking-wide text-xs">Assign Delivery Driver</h4>
                        <p className="text-slate-400 text-xs mt-1">Assign an active delivery partner to ship this order.</p>
                      </div>
                      <form onSubmit={handleAssignDriver} className="space-y-3 mt-4">
                        <select
                          required
                          value={selectedDriverId}
                          onChange={(e) => setSelectedDriverId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"
                        >
                          <option value="">-- Choose Driver --</option>
                          {drivers.map(d => (
                            <option key={d.id} value={d.id}>{d.name} ({d.phone || 'No phone'})</option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          disabled={isAssigningDriver}
                          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2 rounded-lg transition-all text-sm"
                        >
                          {isAssigningDriver ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4" /> Dispatch Delivery
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Driver Info Display */}
                  {selectedOrder.status === 'assigned' && (
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-5 flex items-center gap-3">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400 opacity-80" />
                      <div>
                        <h4 className="font-bold text-emerald-400 text-sm">Dispatched for Delivery</h4>
                        <p className="text-xs text-slate-400 mt-1">A delivery driver has been assigned. Awaiting shipment pickup confirmation.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Items list */}
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-300 text-sm">Products In Contract Order</h3>
                  <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                          <th className="py-3 px-4">Product Name</th>
                          <th className="py-3 px-4 text-center">Quantity</th>
                          <th className="py-3 px-4 text-right">Unit Price</th>
                          <th className="py-3 px-4 text-right">Total Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {orderItems.map((item) => (
                          <tr key={item.id} className="text-slate-300">
                            <td className="py-3.5 px-4 font-semibold text-white">{item.productName}</td>
                            <td className="py-3.5 px-4 text-center">{item.quantity} kg</td>
                            <td className="py-3.5 px-4 text-right">{parseFloat(item.unitPrice).toFixed(2)} Birr</td>
                            <td className="py-3.5 px-4 text-right text-indigo-400 font-semibold">
                              {(item.quantity * parseFloat(item.unitPrice)).toFixed(2)} Birr
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Audit Logs / Timeline */}
                <div className="space-y-3 pt-4 border-t border-slate-800/60">
                  <h3 className="font-bold text-slate-300 text-sm">Audit History Logs</h3>
                  <div className="space-y-3 pl-4 border-l border-slate-800">
                    {orderHistory.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No history logs recorded yet.</p>
                    ) : (
                      orderHistory.map((h) => (
                        <div key={h.id} className="relative text-xs space-y-1">
                          <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-900"></div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">
                              {getStatusLabel(h.toStatus as OyruOrderStatus)}
                            </span>
                            <span className="text-slate-500">
                              {new Date(h.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-slate-400">{h.reason}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/20">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-5 py-2 rounded-lg transition-all text-sm"
                >
                  Close Detail Overview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
