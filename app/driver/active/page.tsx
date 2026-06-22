'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MapPin, Clock, Package, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'

interface ActiveDelivery {
  id: string
  orderNumber: string
  deliveryAddress: string
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered'
  pickupTime?: string
  createdAt: string
}

export default function ActiveDeliveries() {
  const [deliveries, setDeliveries] = useState<ActiveDelivery[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const response = await fetch('/api/driver/active-deliveries')
        if (response.ok) {
          const data = await response.json()
          setDeliveries(data)
        }
      } catch (error) {
        console.error('Failed to fetch deliveries:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDeliveries()
  }, [])

  const handleUpdateStatus = async (deliveryId: string, newStatus: string) => {
    setUpdating(deliveryId)
    try {
      const response = await fetch(`/api/driver/update-delivery/${deliveryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        const updated = await response.json()
        setDeliveries(deliveries.map(d => d.id === deliveryId ? updated : d))
      }
    } catch (error) {
      console.error('Failed to update delivery:', error)
    } finally {
      setUpdating(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800'
      case 'picked_up': return 'bg-yellow-100 text-yellow-800'
      case 'in_transit': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getNextAction = (status: string): { label: string; value: string } | null => {
    switch (status) {
      case 'assigned': return { label: 'Mark as Picked Up', value: 'picked_up' }
      case 'picked_up': return { label: 'Start Transit', value: 'in_transit' }
      case 'in_transit': return { label: 'Mark as Delivered', value: 'delivered' }
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/driver" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Driver Hub</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Active Deliveries</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-4">Loading deliveries...</p>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-foreground mb-2">No active deliveries</h2>
            <p className="text-muted-foreground mb-6">You're all caught up! Check available deliveries.</p>
            <Link href="/driver/available">
              <Button>View Available Deliveries</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {deliveries.map((delivery) => {
              const nextAction = getNextAction(delivery.status)
              return (
                <Card key={delivery.id} className="bg-card border border-border p-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                    {/* Order Info */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                      <p className="font-bold text-foreground">{delivery.orderNumber}</p>
                    </div>

                    {/* Address */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Delivery To
                      </p>
                      <p className="text-foreground text-sm">{delivery.deliveryAddress}</p>
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(delivery.status)}`}>
                        {delivery.status === 'picked_up' ? 'Picked Up' : delivery.status.replace(/_/g, ' ')}
                      </div>
                    </div>

                    {/* Time Info */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Received
                      </p>
                      <p className="text-sm text-foreground">
                        {new Date(delivery.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {/* Action */}
                    <div>
                      {nextAction ? (
                        <Button
                          onClick={() => handleUpdateStatus(delivery.id, nextAction.value)}
                          disabled={updating === delivery.id}
                          size="sm"
                        >
                          {updating === delivery.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            nextAction.label
                          )}
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-semibold">Completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
