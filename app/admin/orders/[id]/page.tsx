'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getOrderByIdAdmin, updateOyruOrderStatus } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronLeft, Package, User, MapPin, Phone, AlertCircle, Clock, CheckCircle2 } from 'lucide-react'
import React from 'react'

export default function AdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  // React.use allows us to unwrap the promise param correctly in Next.js 15
  const unwrappedParams = React.use(params)
  const orderId = unwrappedParams.id

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await getOrderByIdAdmin(orderId)
        if (data) {
          setOrder(data)
        } else {
          setError('Order not found')
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

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setUpdating(true)
      const res = await updateOyruOrderStatus(orderId, newStatus)
      if (res.success) {
        setOrder({ ...order, status: newStatus })
      } else {
        alert('Failed to update status')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading order details...</p>
      </div>
    )
  }

  if (error || !order) {
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

  const statuses = ['pending', 'confirmed', 'packing', 'ready', 'picked_up', 'in_transit', 'delivered', 'cancelled']

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
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
        
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Update Status:</span>
          <select 
            className="bg-card border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            value={order.status || 'pending'}
            onChange={(e) => handleUpdateStatus(e.target.value)}
            disabled={updating}
          >
            {statuses.map(s => (
              <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
            ))}
          </select>
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
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <Package className="w-6 h-6 m-auto text-muted-foreground absolute inset-0 mt-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {parseFloat(item.unitPrice).toFixed(2)} Birr x {item.quantity}
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

        {/* Right Column: Details */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card className="p-6 bg-gradient-to-br from-card to-card/50">
            <h2 className="text-sm font-medium text-muted-foreground mb-2">Current Status</h2>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
              <span className="text-xl font-bold text-blue-500 capitalize">{String(order.status || 'pending').replace('_', ' ')}</span>
            </div>
          </Card>

          {/* Customer Info */}
          <Card className="p-6">
            <h2 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
              <User className="w-4 h-4" /> Customer Information
            </h2>
            <div className="space-y-3">
              <p className="text-foreground font-medium">{order.userId ? 'Registered User' : 'Guest Checkout'}</p>
              {order.userId && <p className="text-sm text-muted-foreground break-all">ID: {order.userId}</p>}
            </div>
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
