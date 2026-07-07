'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getB2BOrderDetails, reviewOrderForStock, approveB2BOrder, prepareAndShipOrder, fetchDrivers } from '@/app/actions/b2b-orders'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatusDropdown, StatusOption } from '@/components/status-dropdown'
import { ChevronLeft, Package, MapPin, AlertCircle, Clock, Loader2 } from 'lucide-react'
import React from 'react'

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

export default function SuperAdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = React.use(params)

  const [order, setOrder] = useState<any>(null)
  const [role, setRole] = useState<string>('')
  const [drivers, setDrivers] = useState<any[]>([])
  const [selectedDriver, setSelectedDriver] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const loadOrder = async () => {
    try {
      const data = await getB2BOrderDetails(orderId)
      if (data.success && data.order) {
        setOrder({ ...data.order, items: (data as any).items || [] })
        const detectedRole = data.role || ''
        setRole(detectedRole)
        if (detectedRole === 'admin' || detectedRole === 'super_admin') {
          const drv = await fetchDrivers()
          if (drv.success && drv.drivers) setDrivers(drv.drivers)
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

  useEffect(() => { loadOrder() }, [orderId])

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === order.status) return
    setUpdating(true)
    setError('')
    setSuccessMsg('')

    try {
      let res: any
      if (newStatus === 'inventory_review') {
        res = await reviewOrderForStock(orderId)
      } else if (newStatus === 'approved') {
        res = await approveB2BOrder(orderId)
      } else if (newStatus === 'assigned') {
        if (!selectedDriver) {
          setError('Please select a driver before assigning.')
          setUpdating(false)
          return
        }
        res = await prepareAndShipOrder(orderId, selectedDriver)
      } else {
        res = await (await import('@/app/actions/oyru-orders')).updateOrderStatus(orderId, newStatus, `Status set to ${newStatus} by admin`)
      }

      if (res.success) {
        setOrder((o: any) => ({ ...o, status: newStatus }))
        setSuccessMsg(`Status updated to: ${newStatus.replace(/_/g, ' ').toUpperCase()}`)
        setTimeout(() => setSuccessMsg(''), 4000)
      } else {
        setError(res.error || 'Failed to update status')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update status')
    }
    setUpdating(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  if (error && !order) return (
    <div className="min-h-screen bg-background p-8">
      <Link href="/super-admin/orders">
        <Button variant="ghost" className="mb-4"><ChevronLeft className="w-4 h-4 mr-2" />Back</Button>
      </Link>
      <Card className="p-12 text-center border-dashed border-2">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <p className="text-xl font-semibold">{error}</p>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      {error && order && (
        <div className="max-w-5xl mx-auto mb-4 bg-destructive text-destructive-foreground px-6 py-3 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}
      {successMsg && (
        <div className="max-w-5xl mx-auto mb-4 bg-green-600 text-white px-6 py-3 rounded-xl flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')}>✕</button>
        </div>
      )}

      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8 flex items-center gap-4">
        <Link href="/super-admin/orders" className="p-2 hover:bg-secondary rounded-lg transition-colors">
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

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
              <Package className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Order Items</h2>
            </div>
            <div className="space-y-4">
              {order.items?.length > 0 ? order.items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <div className="w-16 h-16 bg-background rounded-lg overflow-hidden relative flex-shrink-0 border border-border">
                    {item.productImage || item.image ? (
                      <Image src={item.productImage || item.image} alt={item.productName || item.name || ''} fill className="object-cover" />
                    ) : (
                      <Package className="w-6 h-6 m-auto text-muted-foreground absolute inset-0 mt-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.productName || item.name || 'Product'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {parseFloat(item.unitPrice).toFixed(2)} Birr × {item.quantity} kg
                    </p>
                  </div>
                  <p className="font-semibold text-primary">
                    {(parseFloat(item.unitPrice) * item.quantity).toFixed(2)} Birr
                  </p>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">No items found</p>
              )}
            </div>
            <div className="mt-6 pt-6 border-t border-border flex justify-between items-center">
              <span className="text-lg text-muted-foreground font-medium">Total Amount</span>
              <span className="text-2xl font-bold">{parseFloat(order.totalAmount).toFixed(2)} Birr</span>
            </div>
          </Card>
        </div>

        {/* Right: Status + Info */}
        <div className="space-y-6">
          {/* Status Dropdown */}
          <Card className="p-6 bg-[#0a0a0a] border-white/10">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Workflow Status</h2>
            <StatusDropdown
              current={order.status || 'draft'}
              options={ALL_STATUS_OPTIONS.filter(o => getAllowedNextStatuses(order.status, role).includes(o.value))}
              onChange={handleStatusChange}
              disabled={updating}
            />
            {updating && (
              <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                <Loader2 className="w-3 h-3 animate-spin" /> Updating...
              </div>
            )}
            {/* Driver selector when approved */}
            {order.status === 'approved' && (role === 'admin' || role === 'super_admin') && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-slate-400 mb-2 font-semibold">Select driver to assign:</p>
                <select
                  value={selectedDriver}
                  onChange={e => setSelectedDriver(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                >
                  <option value="">Choose driver...</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} — {d.phone || d.email}</option>
                  ))}
                </select>
              </div>
            )}
            {/* Shipped info */}
            {(order.status === 'assigned' || order.status === 'shipped') && (
              <div className="mt-3 pt-3 border-t border-white/10 text-xs text-slate-400">
                Driver Assigned: {drivers.find(d => d.id === order.delivery?.driverId)?.name || 'Test Driver'}
              </div>
            )}
          </Card>

          {/* Delivery */}
          <Card className="p-6">
            <h2 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Delivery Details
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Address</p>
                <p className="text-sm">{order.deliveryAddress}</p>
              </div>
              {order.deliveryNotes && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm bg-secondary/50 p-3 rounded-lg border border-border/50">{order.deliveryNotes}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Payment */}
          <Card className="p-6">
            <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Payment Method
            </h2>
            <span className="font-medium bg-secondary/30 px-3 py-1 rounded-full border border-border text-sm">
              {order.paymentMethod || 'COD'}
            </span>
          </Card>
        </div>
      </div>
    </div>
  )
}
