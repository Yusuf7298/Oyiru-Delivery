'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Loader2, DollarSign, TrendingUp, Calendar } from 'lucide-react'

interface CompletedDelivery {
  id: string
  orderNumber: string
  deliveryAddress: string
  totalAmount: number
  deliveryTime?: string
  createdAt: string
}

export default function DriverEarnings() {
  const [deliveries, setDeliveries] = useState<CompletedDelivery[]>([])
  const [loading, setLoading] = useState(true)
  const [totalEarnings, setTotalEarnings] = useState(0)

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await fetch('/api/driver/earnings')
        if (response.ok) {
          const data = await response.json()
          setDeliveries(data.deliveries || [])
          setTotalEarnings(data.totalEarnings || 0)
        }
      } catch (error) {
        console.error('Failed to fetch earnings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEarnings()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/driver" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Driver Hub</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Earnings & History</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Earnings Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                <p className="text-3xl font-bold text-foreground">₹{totalEarnings.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </Card>

          <Card className="bg-card border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Deliveries</p>
                <p className="text-3xl font-bold text-foreground">{deliveries.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="bg-card border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average Per Delivery</p>
                <p className="text-3xl font-bold text-foreground">
                  ₹{deliveries.length > 0 ? (totalEarnings / deliveries.length).toFixed(2) : '0.00'}
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Calendar className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Completed Deliveries List */}
        <Card className="bg-card border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Completed Deliveries</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-4">Loading history...</p>
            </div>
          ) : deliveries.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No completed deliveries</h3>
              <p className="text-muted-foreground">Your completed deliveries will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Order Number</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Delivery Address</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Earnings</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Delivered At</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((delivery) => (
                    <tr key={delivery.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{delivery.orderNumber}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground truncate">{delivery.deliveryAddress}</td>
                      <td className="px-6 py-4 text-sm font-bold text-primary">₹{delivery.totalAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {delivery.deliveryTime
                          ? new Date(delivery.deliveryTime).toLocaleString()
                          : new Date(delivery.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
