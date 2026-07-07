'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getB2BOrderDetails, reviewOrderForStock, approveB2BOrder, prepareAndShipOrder, fetchDrivers } from '@/app/actions/b2b-orders'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatusDropdown, StatusOption } from '@/components/status-dropdown'
import { ChevronLeft, Package, MapPin, AlertCircle, Clock, CheckCircle2, Truck, Loader2 } from 'lucide-react'
import React from 'react'

// All possible statuses with colors matching the screenshot
const ALL_STATUS_OPTIONS: StatusOption[] = [
  { value: 'draft', label: 'Draft', color: '#6b7280' },
  { value: 'submitted', label: 'Submitted', color: '#facc15' },
  { value: 'inventory_review', label: 'Inventory Review', color: '#a78bfa' },
  { value: 'approved', label: 'Approved', color: '#34d399' },
  { value: 'assigned', label: 'Assigned', color: '#60a5fa' },
  { value: 'shipped', label: 'Shipped', color: '#c084fc' },
  { value: 'delivered', label: 'Delivered', color: '#4ade80' },
  { value: 'completed', label: 'Completed', color: '#10b981' },
  { value: 'cancelled', label: 'Cancelled', color: '#f87171' },
]

// Allowed transitions per role (what the dropdown will show as selectable)
function getAllowedNextStatuses(currentStatus: string, role: string): string[] {
  if (role === 'super_admin') {
    const map: Record<string, string[]> = {
      draft: ['submitted', 'cancelled'],
      submitted: ['inventory_review', 'cancelled'],
      inventory_review: ['approved', 'cancelled'],
      approved: ['assigned', 'cancelled'],
      assigned: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: ['completed'],
    }
    return [currentStatus, ...(map[currentStatus] || [])]
  }
  if (role === 'admin') {
    const map: Record<string, string[]> = {
      draft: ['submitted', 'cancelled'],
      submitted: ['inventory_review', 'cancelled'],
      inventory_review: ['approved', 'cancelled'],
      approved: ['assigned', 'cancelled'],
      assigned: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: ['completed'],
    }
    return [currentStatus, ...(map[currentStatus] || [])]
  }
  return [currentStatus]
}

export default function AdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params)
  const orderId = unwrappedParams.id

  const [order, setOrder] = useState<any>(null)
  const [role, setRole] = useState<string>('')
  const [drivers, setDrivers] = useState<any[]>([])
  const [selectedDriver, setSelectedDriver] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await getB2BOrderDetails(orderId)
        if (data.success && data.order) {
          // Merge items into the order object so order.items is available in JSX
          const orderWithItems = {
            ...data.order,
            items: (data as any).items || [],
          }
          setOrder(orderWithItems)
          const detectedRole = data.role || ''
          setRole(detectedRole)

          // Load drivers for admin/super_admin roles
          if (detectedRole === 'admin' || detectedRole === 'super_admin') {
            const drv = await fetchDrivers()
            if (drv.success && drv.drivers) {
              setDrivers(drv.drivers)
            }
          }
        } else {
          setError(data.error || 'Order not found')
        }
      } catch (err) {
        console.error(err)
        setError('Failed to load order')
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [orderId])

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === order.status) return
    setUpdating(true)
    setError('')
    setSuccessMsg('')

    try {
      let res: any

      // Use specific actions for lifecycle-validated transitions
      if (newStatus === 'inventory_review') {
        res = await reviewOrderForStock(orderId)
      } else if (newStatus === 'approved') {
        res = await approveB2BOrder(orderId)
      } else if (newStatus === 'assigned' || newStatus === 'shipped') {
        if (newStatus === 'assigned' && !selectedDriver) {
          setError('Please select a driver before assigning.')
          setUpdating(false)
          return
        }
        res = newStatus === 'assigned'
          ? await prepareAndShipOrder(orderId, selectedDriver)
          : await (await import('@/app/actions/oyru-orders')).updateOrderStatus(orderId, newStatus, 'Shipped')
      } else {
        // General transition (draft→submitted, force-cancel, etc.)
        res = await (await import('@/app/actions/oyru-orders')).updateOrderStatus(orderId, newStatus, `Status set to ${newStatus} by admin`)
      }

      if (res.success) {
        setOrder({ ...order, status: newStatus })
        setSuccessMsg(`Status updated to: ${newStatus.replace(/_/g, ' ').toUpperCase()}`)
      } else {
        setError(res.error || 'Failed to update status')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update status')
    }
    setUpdating(false)
  }

  const handleReview = async () => { await handleStatusChange('inventory_review') }
  const handleApprove = async () => { await handleStatusChange('approved') }
  const handleShip = async () => { await handleStatusChange('assigned') }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading order details...</p>
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Link href="/admin/orders">
          <Button variant="ghost" className="mb-4">
            <ChevronLeft className="w-4 h-4 mr-2" /> Back to Orders
          </Button>
        </Link>
        <Card className="p-12 text-center border-dashed border-2">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">{error || 'Order Not Found'}</h2>
          <p className="text-muted-foreground">The order you are looking for does not exist or has been removed.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      {/* Notifications */}
      {error && order && (
        <div className="max-w-5xl mx-auto mb-4 bg-destructive text-destructive-foreground px-6 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}
      {successMsg && (
        <div className="max-w-5xl mx-auto mb-4 bg-green-600 text-white px-6 py-3 rounded-lg flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')}>✕</button>
        </div>
      )}

      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <Clock className="w-3 h-3" />
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
              <Package className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Order Items</h2>
            </div>

            <div className="space-y-4">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <div className="w-16 h-16 bg-background rounded-lg overflow-hidden relative flex-shrink-0 border border-border">
                    {item.productImage || item.image ? (
                      <Image src={item.productImage || item.image} alt={item.productName || item.name || ''} fill className="object-cover" />
                    ) : (
                      <Package className="w-6 h-6 m-auto text-muted-foreground absolute inset-0 mt-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{item.productName || item.name || 'Product'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {parseFloat(item.unitPrice).toFixed(2)} Birr x {item.quantity} kg
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">
                      {(parseFloat(item.unitPrice) * item.quantity).toFixed(2)} Birr
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-border flex justify-between items-center">
              <span className="text-lg text-muted-foreground font-medium">Total Amount</span>
              <span className="text-2xl font-bold text-foreground">{parseFloat(order.totalAmount).toFixed(2)} Birr</span>
            </div>
          </Card>
        </div>

        {/* Right Column: Details & Actions */}
        <div className="space-y-6">
          {/* Status Dropdown Card */}
          <Card className="p-6 bg-[#0a0a0a] border-white/10">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
              Workflow Status
            </h2>

            <StatusDropdown
              current={order.status || 'draft'}
              options={ALL_STATUS_OPTIONS.filter(o =>
                getAllowedNextStatuses(order.status, role).includes(o.value)
              )}
              onChange={handleStatusChange}
              disabled={updating}
            />

            {updating && (
              <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                Updating status...
              </div>
            )}

            {/* Driver selector — shows when order is approved and needs driver assignment */}
            {order.status === 'approved' && (role === 'admin' || role === 'super_admin') && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-slate-400 mb-2 font-semibold">Select driver to assign:</p>
                <select
                  value={selectedDriver}
                  onChange={e => setSelectedDriver(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-green-500/50 outline-none"
                >
                  <option value="">Choose driver...</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} — {d.phone || d.email}</option>
                  ))}
                </select>
                {drivers.length === 0 && (
                  <p className="text-xs text-slate-500 mt-2">No drivers available. Add drivers in Staff management.</p>
                )}
              </div>
            )}
          </Card>

          {/* Delivery Info */}
          <Card className="p-6">
            <h2 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Delivery Details
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Address</p>
                <p className="text-sm text-foreground leading-relaxed">{order.deliveryAddress}</p>
              </div>
              {order.deliveryNotes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm text-foreground bg-secondary/50 p-3 rounded-lg border border-border/50">{order.deliveryNotes}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Payment Info */}
          <Card className="p-6">
            <h2 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Payment Method
            </h2>
            <div className="space-y-3">
              <p className="text-foreground font-medium bg-secondary/30 inline-block px-3 py-1 rounded-full border border-border">
                {order.paymentMethod || 'COD'}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
