'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  getDeliveryPartner,
  getAvailableOrders,
  getDeliveryPartnerOrders,
} from '@/app/actions/delivery'
import { Button } from '@/components/ui/button'
import { MapPin, Package, DollarSign, Star, Navigation } from 'lucide-react'

export default function DeliveryDashboard() {
  const [partner, setPartner] = useState<any>(null)
  const [availableOrders, setAvailableOrders] = useState<any[]>([])
  const [activeOrders, setActiveOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'available' | 'active'>('available')

  useEffect(() => {
    const loadData = async () => {
      try {
        const partnerData = await getDeliveryPartner()
        setPartner(partnerData)

        if (partnerData) {
          const availableData = await getAvailableOrders()
          setAvailableOrders(availableData)

          const activeData = await getDeliveryPartnerOrders()
          setActiveOrders(activeData)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
              DP
            </div>
            <span className="hidden sm:inline">Oyru Delivery</span>
          </Link>
          <Link href="/profile">
            <Button variant="outline">Profile</Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg p-6 animate-pulse h-24"></div>
            ))}
          </div>
        ) : partner ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Orders */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Deliveries</p>
                  <p className="text-2xl font-bold">{partner.totalOrders || 0}</p>
                </div>
                <Package className="w-8 h-8 text-blue-500 opacity-20" />
              </div>
            </div>

            {/* Total Earnings */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                  <p className="text-2xl font-bold">${parseFloat(partner.totalEarnings || 0).toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500 opacity-20" />
              </div>
            </div>

            {/* Rating */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Rating</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    {partner.averageRating ? parseFloat(partner.averageRating).toFixed(1) : '0'}
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-500 opacity-20" />
              </div>
            </div>

            {/* Status */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Current Status</p>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${partner.isActive ? 'bg-green-500' : 'bg-red-500'
                      }`}
                  ></div>
                  <span className="font-semibold">
                    {partner.isActive ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-border">
          <button
            onClick={() => setTab('available')}
            className={`px-4 py-2 font-semibold transition-colors ${tab === 'available'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Available Orders ({availableOrders.length})
          </button>
          <button
            onClick={() => setTab('active')}
            className={`px-4 py-2 font-semibold transition-colors ${tab === 'active'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Active Deliveries ({activeOrders.length})
          </button>
        </div>

        {/* Available Orders */}
        {tab === 'available' && (
          <div className="space-y-4">
            {availableOrders.length > 0 ? (
              availableOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg">Order #{order.id.slice(0, 8)}</h3>
                      <p className="text-sm text-muted-foreground">
                        Ready for pickup
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        ${parseFloat(order.totalAmount).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Delivery Address</p>
                        <p className="font-semibold">{order.deliveryAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Navigation className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">City</p>
                        <p className="font-semibold">{order.deliveryCity}</p>
                      </div>
                    </div>
                  </div>

                  <Link href={`/delivery/order/${order.id}`} className="block">
                    <Button className="w-full">Accept Delivery</Button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg text-muted-foreground">No available orders</p>
              </div>
            )}
          </div>
        )}

        {/* Active Orders */}
        {tab === 'active' && (
          <div className="space-y-4">
            {activeOrders.length > 0 ? (
              activeOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg">Order #{order.id.slice(0, 8)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {order.status.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        ${parseFloat(order.totalAmount).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Delivery Address</p>
                        <p className="font-semibold">{order.deliveryAddress}</p>
                      </div>
                    </div>
                  </div>

                  <Link href={`/delivery/order/${order.id}`} className="block">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg text-muted-foreground">No active deliveries</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
