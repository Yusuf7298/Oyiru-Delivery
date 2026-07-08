'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Eye, Download, CheckCircle2, Star, RotateCcw, X, Plus, Minus } from 'lucide-react'
import Link from 'next/link'
import { getHotelOrderDetails, submitB2BOrder } from '@/app/actions/b2b-orders'
import { submitOrderFeedback, requestOrderReturn, getOrderFeedback, getOrderReturn } from '@/app/actions/customer-interactions'

interface OrderItem {
  id: string
  name: string
  quantity: number
  unitPrice: number | string
  image?: string
}

interface Order {
  id: string
  orderNumber: string
  totalAmount: number | string
  paymentMethod: string
  deliveryAddress: string
  status: string
  createdAt: string
  items?: OrderItem[]
  driver?: { name: string; phone: string }
}

type ModalMode = 'details' | 'feedback' | 'return'

export default function HotelOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsLoading, setIsDetailsLoading] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>('details')

  // Feedback state
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackComment, setFeedbackComment] = useState('')
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [feedbackError, setFeedbackError] = useState('')
  const [feedbackDone, setFeedbackDone] = useState(false)
  const [existingFeedback, setExistingFeedback] = useState<any>(null)

  // Return state
  const [returnReason, setReturnReason] = useState('')
  const [returnItems, setReturnItems] = useState<{ orderItemId: string; quantity: number; max: number; name: string }[]>([])
  const [returnSubmitting, setReturnSubmitting] = useState(false)
  const [returnError, setReturnError] = useState('')
  const [returnDone, setReturnDone] = useState(false)
  const [existingReturn, setExistingReturn] = useState<any>(null)

  // Confirm delivery state
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/hotel/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewOrder = async (order: Order) => {
    setIsDetailsLoading(true)
    setSelectedOrder(order)
    setModalMode('details')
    setFeedbackDone(false)
    setReturnDone(false)
    setExistingFeedback(null)
    setExistingReturn(null)
    try {
      const data = await getHotelOrderDetails(order.id)
      if (data.success) {
        // Merge order + items (items are returned separately)
        const merged = { ...data.order, items: data.items || [] } as unknown as Order
        setSelectedOrder(merged)

        // Pre-load return item quantities
        if (data.items && data.items.length > 0) {
          setReturnItems(data.items.map((item: any) => ({
            orderItemId: item.id,
            quantity: 0,
            max: Number(item.quantity),
            name: item.name,
          })))
        }

        // Load existing feedback / return
        const [fb, ret] = await Promise.all([
          getOrderFeedback(order.id),
          getOrderReturn(order.id),
        ])
        setExistingFeedback(fb)
        setExistingReturn(ret)
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
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleConfirmDelivery = async (orderId: string) => {
    setConfirmingId(orderId)
    setConfirmError('')
    try {
      const res = await fetch(`/api/hotel/orders/${orderId}/confirm`, { method: 'POST' })
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed' } : o))
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: 'completed' } : prev)
        }
      } else {
        const body = await res.json()
        setConfirmError(body.error || 'Failed to confirm delivery')
      }
    } catch {
      setConfirmError('Network error')
    } finally {
      setConfirmingId(null)
    }
  }

  const handleSubmitFeedback = async () => {
    if (!selectedOrder || feedbackRating === 0) {
      setFeedbackError('Please select a star rating')
      return
    }
    setFeedbackSubmitting(true)
    setFeedbackError('')
    try {
      await submitOrderFeedback(selectedOrder.id, feedbackRating, feedbackComment)
      setFeedbackDone(true)
      setExistingFeedback({ rating: feedbackRating, comment: feedbackComment })
    } catch (err: any) {
      setFeedbackError(err.message || 'Failed to submit feedback')
    } finally {
      setFeedbackSubmitting(false)
    }
  }

  const handleSubmitReturn = async () => {
    if (!selectedOrder) return
    if (!returnReason.trim()) {
      setReturnError('Please enter a reason for the return')
      return
    }
    const selectedItems = returnItems.filter(i => i.quantity > 0)
    if (selectedItems.length === 0) {
      setReturnError('Please select at least one item and quantity to return')
      return
    }
    setReturnSubmitting(true)
    setReturnError('')
    try {
      await requestOrderReturn(selectedOrder.id, returnReason, selectedItems.map(i => ({
        orderItemId: i.orderItemId,
        quantity: i.quantity,
      })))
      setReturnDone(true)
      setExistingReturn({ reason: returnReason, status: 'pending', items: selectedItems })
    } catch (err: any) {
      setReturnError(err.message || 'Failed to submit return request')
    } finally {
      setReturnSubmitting(false)
    }
  }

  const adjustReturnQty = (itemId: string, delta: number) => {
    setReturnItems(prev => prev.map(i =>
      i.orderItemId === itemId
        ? { ...i, quantity: Math.max(0, Math.min(i.max, i.quantity + delta)) }
        : i
    ))
  }

  const handleDownloadInvoice = (order: Order) => {
    const content = `Order Invoice\n=============\nOrder: ${order.orderNumber}\nDate: ${new Date(order.createdAt).toLocaleString()}\nTotal: ${Number(order.totalAmount).toFixed(2)} Birr\nPayment: ${order.paymentMethod}\nStatus: ${order.status}\nDelivery: ${order.deliveryAddress}`
    const el = document.createElement('a')
    el.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content)
    el.download = `invoice-${order.orderNumber}.txt`
    el.style.display = 'none'
    document.body.appendChild(el)
    el.click()
    document.body.removeChild(el)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'submitted': return 'bg-blue-100 text-blue-700'
      case 'inventory_review': return 'bg-purple-100 text-purple-700'
      case 'approved': return 'bg-teal-100 text-teal-700'
      case 'assigned': return 'bg-yellow-100 text-yellow-700'
      case 'shipped': return 'bg-indigo-100 text-indigo-700'
      case 'delivered': return 'bg-green-100 text-green-700'
      case 'completed': return 'bg-emerald-100 text-emerald-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatStatus = (status: string) => status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

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
          <Link href="/hotel/ordering" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
            New Order
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-muted-foreground">View your order history and status</p>
        </div>

        {confirmError && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">{confirmError}</div>
        )}

        {isLoading ? (
          <div className="text-center py-12"><p className="text-muted-foreground">Loading orders...</p></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 border border-border rounded-lg bg-card">
            <p className="text-muted-foreground mb-4">No orders yet</p>
            <Link href="/hotel/ordering" className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Start Ordering</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-border rounded-lg p-6 bg-card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">Order #{order.orderNumber}</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{Number(order.totalAmount).toFixed(2)} Birr</p>
                    <p className="text-sm text-muted-foreground">{order.paymentMethod}</p>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground mb-4">
                  <p>Delivery: {order.deliveryAddress}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => handleViewOrder(order)} className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
                    <Eye className="w-4 h-4" /> View Details
                  </button>
                  {order.status === 'draft' && (
                    <button onClick={() => handleSubmitOrder(order)} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Submit Order
                    </button>
                  )}
                  {order.status === 'delivered' && (
                    <button
                      onClick={() => handleConfirmDelivery(order.id)}
                      disabled={confirmingId === order.id}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-60"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {confirmingId === order.id ? 'Confirming...' : 'Confirm Received'}
                    </button>
                  )}
                  <button onClick={() => handleDownloadInvoice(order)} className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
                    <Download className="w-4 h-4" /> Invoice
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
          <div className="bg-card rounded-xl max-w-lg w-full p-4 sm:p-6 my-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal tab bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                {[
                  { mode: 'details' as ModalMode, label: 'Details' },
                  ...(selectedOrder.status === 'delivered' || selectedOrder.status === 'completed'
                    ? [
                      { mode: 'feedback' as ModalMode, label: '⭐ Feedback' },
                      { mode: 'return' as ModalMode, label: '↩ Return' },
                    ]
                    : []),
                ].map(tab => (
                  <button
                    key={tab.mode}
                    onClick={() => setModalMode(tab.mode)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${modalMode === tab.mode ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {isDetailsLoading ? (
              <div className="py-12 text-center text-muted-foreground animate-pulse">Loading details...</div>
            ) : (
              <>
                {/* ───── DETAILS TAB ───── */}
                {modalMode === 'details' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Order Number</p>
                        <p className="font-semibold">{selectedOrder.orderNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Date</p>
                        <p className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Total</p>
                        <p className="font-semibold text-primary">{Number(selectedOrder.totalAmount).toFixed(2)} Birr</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                          {formatStatus(selectedOrder.status)}
                        </span>
                      </div>
                    </div>

                    {selectedOrder.status === 'delivered' && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-sm text-green-800">
                        <p className="font-semibold mb-1">✅ Your order has been delivered!</p>
                        <p className="text-xs">Click <strong>Confirm Received</strong> once you have physically received the goods.</p>
                        <button
                          onClick={() => handleConfirmDelivery(selectedOrder.id)}
                          disabled={confirmingId === selectedOrder.id}
                          className="mt-3 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-bold disabled:opacity-60"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {confirmingId === selectedOrder.id ? 'Confirming...' : 'Confirm Received'}
                        </button>
                      </div>
                    )}

                    {/* Order Items */}
                    <div>
                      <p className="text-sm font-semibold mb-3">Order Items</p>
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        <div className="space-y-2">
                          {selectedOrder.items.map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center text-sm border border-border p-3 rounded-xl">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-muted rounded-lg overflow-hidden relative flex-shrink-0">
                                  {item.image
                                    ? <Image src={item.image} alt={item.name} fill className="object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                                  }
                                </div>
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-muted-foreground text-xs">{Number(item.quantity).toFixed(1)} kg</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-primary">{(Number(item.unitPrice) * Number(item.quantity)).toFixed(2)} Birr</p>
                                <p className="text-xs text-muted-foreground">{Number(item.unitPrice).toFixed(2)} Birr/kg</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No items found</p>
                      )}
                    </div>
                  </div>
                )}

                {/* ───── FEEDBACK TAB ───── */}
                {modalMode === 'feedback' && (
                  <div className="space-y-5">
                    <h3 className="font-bold text-lg">Leave Feedback</h3>
                    {existingFeedback ? (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                        <p className="text-sm font-semibold text-yellow-800 mb-2">You already submitted feedback for this order</p>
                        <div className="flex gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`w-5 h-5 ${s <= existingFeedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                          ))}
                        </div>
                        {existingFeedback.comment && <p className="text-sm text-muted-foreground italic">"{existingFeedback.comment}"</p>}
                      </div>
                    ) : feedbackDone ? (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                        <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="font-semibold text-green-700">Thank you for your feedback!</p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm font-semibold mb-2">Rating *</p>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(s => (
                              <button key={s} onClick={() => setFeedbackRating(s)} className="p-1 rounded transition-transform hover:scale-110">
                                <Star className={`w-8 h-8 ${s <= feedbackRating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-semibold mb-2 block">Comment (optional)</label>
                          <textarea
                            rows={3}
                            value={feedbackComment}
                            onChange={e => setFeedbackComment(e.target.value)}
                            placeholder="How was the quality and delivery?"
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                          />
                        </div>
                        {feedbackError && <p className="text-destructive text-sm">{feedbackError}</p>}
                        <button
                          onClick={handleSubmitFeedback}
                          disabled={feedbackSubmitting}
                          className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-60"
                        >
                          {feedbackSubmitting ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* ───── RETURN TAB ───── */}
                {modalMode === 'return' && (
                  <div className="space-y-5">
                    <h3 className="font-bold text-lg">Request Return</h3>
                    {existingReturn ? (
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                        <p className="text-sm font-semibold text-orange-800 mb-2">Return request already submitted</p>
                        <p className="text-xs text-muted-foreground mb-1">Status: <span className="font-semibold capitalize">{existingReturn.status}</span></p>
                        <p className="text-xs text-muted-foreground">Reason: {existingReturn.reason}</p>
                        {existingReturn.items && existingReturn.items.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {existingReturn.items.map((i: any) => (
                              <li key={i.orderItemId || i.id} className="text-xs text-muted-foreground">• {i.name} — {i.quantity} kg</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : returnDone ? (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                        <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="font-semibold text-green-700">Return request submitted successfully!</p>
                        <p className="text-xs text-muted-foreground mt-1">Admin will review and process your request.</p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="text-sm font-semibold mb-2 block">Reason for Return *</label>
                          <textarea
                            rows={2}
                            value={returnReason}
                            onChange={e => setReturnReason(e.target.value)}
                            placeholder="e.g. Wrong product delivered, damaged goods..."
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold mb-3">Select Items & Quantities to Return</p>
                          {returnItems.length > 0 ? (
                            <div className="space-y-3">
                              {returnItems.map(item => (
                                <div key={item.orderItemId} className="flex items-center justify-between p-3 border border-border rounded-xl">
                                  <div>
                                    <p className="text-sm font-medium">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">Max returnable: {item.max} kg</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => adjustReturnQty(item.orderItemId, -1)}
                                      className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                                    <button
                                      onClick={() => adjustReturnQty(item.orderItemId, 1)}
                                      className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                    <span className="text-xs text-muted-foreground ml-1">kg</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No items available to return</p>
                          )}
                        </div>
                        {returnError && <p className="text-destructive text-sm">{returnError}</p>}
                        <button
                          onClick={handleSubmitReturn}
                          disabled={returnSubmitting}
                          className="w-full py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all disabled:opacity-60"
                        >
                          {returnSubmitting ? 'Submitting...' : 'Submit Return Request'}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
