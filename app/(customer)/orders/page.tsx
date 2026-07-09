'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getUserProductOrders, getProductOrder } from '@/app/actions/product-orders'
import { getOrderFeedback, getOrderReturn, submitOrderFeedback, requestOrderReturn } from '@/app/actions/customer-interactions'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Star, MessageSquare, RotateCcw } from 'lucide-react'

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  inventory_review: 'bg-purple-100 text-purple-800',
  approved: 'bg-emerald-100 text-emerald-800',
  assigned: 'bg-amber-100 text-amber-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  completed: 'bg-teal-100 text-teal-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  // Feedback & Returns state
  const [feedback, setFeedback] = useState<any>(null)
  const [orderReturn, setOrderReturn] = useState<any>(null)

  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [feedbackComment, setFeedbackComment] = useState('')

  const [showReturnForm, setShowReturnForm] = useState(false)
  const [returnReason, setReturnReason] = useState('')
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({})
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
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

      // Fetch feedback & returns
      const [fdbk, ret] = await Promise.all([
        getOrderFeedback(orderId),
        getOrderReturn(orderId)
      ])
      setFeedback(fdbk)
      setOrderReturn(ret)

      // Reset forms
      setShowFeedbackForm(false)
      setShowReturnForm(false)
      setFeedbackRating(5)
      setFeedbackComment('')
      setReturnReason('')
      setReturnQuantities({})
    } catch (error) {
      console.error('Error loading order:', error)
    }
  }

  const handleSubmitFeedback = async () => {
    if (!selectedOrder) return
    setActionError(null)
    try {
      await submitOrderFeedback(selectedOrder.id, feedbackRating, feedbackComment)
      setFeedback({ rating: feedbackRating, comment: feedbackComment })
      setShowFeedbackForm(false)
      setActionSuccess('Feedback submitted successfully!')
      setTimeout(() => setActionSuccess(null), 3000)
    } catch (error) {
      console.error(error)
      setActionError('Failed to submit feedback')
    }
  }

  const handleQuantityChange = (orderItemId: string, value: number, max: number) => {
    const validValue = Math.max(0, Math.min(max, value))
    setReturnQuantities(prev => ({
      ...prev,
      [orderItemId]: validValue
    }))
  }

  const handleRequestReturn = async () => {
    if (!selectedOrder || !returnReason.trim()) return

    const itemsToReturn = Object.entries(returnQuantities)
      .map(([orderItemId, quantity]) => ({ orderItemId, quantity }))
      .filter(i => i.quantity > 0)

    if (itemsToReturn.length === 0) {
      setActionError('Please select at least one item to return')
      return
    }

    try {
      await requestOrderReturn(selectedOrder.id, returnReason, itemsToReturn)
      setOrderReturn({
        status: 'pending',
        reason: returnReason,
        items: itemsToReturn.map(item => {
          const originalItem = selectedOrder.items.find((i: any) => i.id === item.orderItemId)
          return { name: originalItem?.name, quantity: item.quantity }
        })
      })
      setShowReturnForm(false)
      setActionSuccess('Return request submitted!')
      setTimeout(() => setActionSuccess(null), 3000)
    } catch (error: any) {
      console.error(error)
      setActionError(error.message || 'Failed to request return')
    }
  }

  const computeSubtotal = (order: any) => {
    if (order.items && order.items.length > 0) {
      return order.items.reduce((sum: number, item: any) => sum + parseFloat(item.unitPrice || 0) * item.quantity, 0)
    }
    return parseFloat(order.totalAmount) - 5.00
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Toast notifications */}
      {actionSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl text-sm font-medium animate-in slide-in-from-top-4">
          {actionSuccess}
        </div>
      )}
      {actionError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-destructive text-destructive-foreground px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4">
          <span className="text-sm font-medium">{actionError}</span>
          <button onClick={() => setActionError(null)} className="ml-2 opacity-70 hover:opacity-100">✕</button>
        </div>
      )}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-card rounded-lg max-w-md w-full p-4 sm:p-6 my-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Order #{selectedOrder.orderNumber || selectedOrder.id.slice(0, 8)}</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${statusColors[selectedOrder.status] || 'bg-gray-100'
                    }`}
                >
                  {selectedOrder.status.replace('_', ' ').toUpperCase()}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>

              {/* Items List */}
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
                  <span>{computeSubtotal(selectedOrder).toFixed(2)} Birr</span>
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

              {/* Feedback & Returns Section */}
              {selectedOrder.status === 'delivered' && (
                <div className="border-t border-border pt-6 space-y-4">
                  {/* FEEDBACK */}
                  {feedback ? (
                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} className={`w-4 h-4 ${i <= feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                        ))}
                      </div>
                      {feedback.comment && <p className="text-sm italic">&quot;{feedback.comment}&quot;</p>}
                    </div>
                  ) : showFeedbackForm ? (
                    <div className="bg-secondary/30 p-4 rounded-lg space-y-4">
                      <h3 className="font-semibold text-sm">Leave Feedback</h3>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map(i => (
                          <button key={i} onClick={() => setFeedbackRating(i)}>
                            <Star className={`w-6 h-6 ${i <= feedbackRating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                          </button>
                        ))}
                      </div>
                      <textarea
                        className="w-full bg-background border border-border rounded-lg p-2 text-sm"
                        placeholder="Write a review..."
                        rows={3}
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSubmitFeedback}>Submit</Button>
                        <Button size="sm" variant="outline" onClick={() => setShowFeedbackForm(false)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" className="w-full" onClick={() => setShowFeedbackForm(true)}>
                      <MessageSquare className="w-4 h-4 mr-2" /> Leave Feedback
                    </Button>
                  )}

                  {/* RETURNS */}
                  {orderReturn ? (
                    <div className="bg-red-500/10 text-red-700 p-4 rounded-lg border border-red-500/20">
                      <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" /> Return Request: {orderReturn.status.toUpperCase()}
                      </h3>
                      <p className="text-sm mb-2"><strong>Reason:</strong> {orderReturn.reason}</p>
                      <div className="text-sm space-y-1">
                        <p className="font-semibold">Items returned:</p>
                        {orderReturn.items?.map((item: any, idx: number) => (
                          <p key={idx}>- {item.quantity}x {item.name}</p>
                        ))}
                      </div>
                    </div>
                  ) : showReturnForm ? (
                    <div className="bg-secondary/30 p-4 rounded-lg space-y-4 border border-border">
                      <h3 className="font-semibold text-sm">Request Return</h3>

                      <div className="space-y-3 bg-background p-3 rounded-lg border border-border">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Select Items to Return</p>
                        {selectedOrder.items?.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between gap-4 text-sm">
                            <span className="flex-1 truncate">{item.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Qty:</span>
                              <input
                                type="number"
                                min="0"
                                max={item.quantity}
                                value={returnQuantities[item.id] || 0}
                                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0, item.quantity)}
                                className="w-16 bg-card border border-border rounded px-2 py-1 text-center"
                              />
                              <span className="text-xs text-muted-foreground">/ {item.quantity}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <textarea
                        className="w-full bg-background border border-border rounded-lg p-2 text-sm"
                        placeholder="Why are you returning these items?"
                        rows={3}
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive" onClick={handleRequestReturn}>Submit Request</Button>
                        <Button size="sm" variant="outline" onClick={() => setShowReturnForm(false)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="destructive" className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={() => setShowReturnForm(true)}>
                      <RotateCcw className="w-4 h-4 mr-2" /> Request Return
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
