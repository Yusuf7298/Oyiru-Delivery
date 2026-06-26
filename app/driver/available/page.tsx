'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MapPin, Clock, DollarSign, Package, ArrowLeft, Loader2 } from 'lucide-react'

interface Delivery {
  id: string
  orderNumber: string
  deliveryAddress: string
  totalAmount: number
  status: string
  createdAt: string
}

export default function AvailableDeliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState<string | null>(null)

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const response = await fetch('/api/driver/available-deliveries')
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

  const handleAcceptDelivery = async (deliveryId: string) => {
    setAccepting(deliveryId)
    try {
      const response = await fetch(`/api/driver/accept-delivery/${deliveryId}`, {
        method: 'POST',
      })
      if (response.ok) {
        setDeliveries(deliveries.filter(d => d.id !== deliveryId))
      }
    } catch (error) {
      console.error('Failed to accept delivery:', error)
    } finally {
      setAccepting(null)
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
          <h1 className="text-2xl font-bold text-foreground">Available Deliveries</h1>
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
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-foreground mb-2">No available deliveries</h2>
            <p className="text-muted-foreground mb-6">Check back later for new delivery requests</p>
            <Link href="/driver">
              <Button>Back to Hub</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {deliveries.map((delivery) => (
              <Card key={delivery.id} className="bg-card border border-border p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Order Info */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                    <p className="font-bold text-foreground">{delivery.orderNumber}</p>
                  </div>

                  {/* Address */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Delivery Address
                    </p>
                    <p className="text-foreground text-sm">{delivery.deliveryAddress}</p>
                  </div>

                  {/* Amount */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      Delivery Fee
                    </p>
                    <p className="font-bold text-primary text-lg">{delivery.totalAmount.toFixed(2)} Birr</p>
                  </div>

                  {/* Action */}
                  <div className="flex items-end">
                    <Button
                      onClick={() => handleAcceptDelivery(delivery.id)}
                      disabled={accepting === delivery.id}
                      className="w-full"
                    >
                      {accepting === delivery.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Accepting...
                        </>
                      ) : (
                        'Accept Delivery'
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
