'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Truck, MapPin, Clock, DollarSign, TrendingUp, Package } from 'lucide-react'

interface DriverStats {
  activeDeliveries: number
  totalDeliveries: number
  totalEarnings: number
  averageRating: number
}

export default function DriverDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DriverStats>({
    activeDeliveries: 0,
    totalDeliveries: 0,
    totalEarnings: 0,
    averageRating: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/driver/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Truck className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Driver Hub</h1>
            </div>
            <Link href="/profile">
              <Button variant="outline">Profile</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Active Deliveries */}
          <Card className="bg-card border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Deliveries</p>
                <p className="text-3xl font-bold text-foreground">{stats.activeDeliveries}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          {/* Total Deliveries */}
          <Card className="bg-card border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Deliveries</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalDeliveries}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          {/* Earnings */}
          <Card className="bg-card border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                <p className="text-3xl font-bold text-foreground">₹{stats.totalEarnings.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </Card>

          {/* Rating */}
          <Card className="bg-card border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average Rating</p>
                <p className="text-3xl font-bold text-foreground">⭐ {stats.averageRating.toFixed(1)}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Available Deliveries */}
          <Link href="/driver/available">
            <Card className="bg-card border border-border p-6 hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Available Deliveries</h3>
                  <p className="text-sm text-muted-foreground">Browse new delivery requests</p>
                </div>
              </div>
              <p className="text-sm text-primary font-semibold">View all available</p>
            </Card>
          </Link>

          {/* Active Deliveries */}
          <Link href="/driver/active">
            <Card className="bg-card border border-border p-6 hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Truck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Active Deliveries</h3>
                  <p className="text-sm text-muted-foreground">Track current deliveries</p>
                </div>
              </div>
              <p className="text-sm text-primary font-semibold">{stats.activeDeliveries} in progress</p>
            </Card>
          </Link>

          {/* Earnings */}
          <Link href="/driver/earnings">
            <Card className="bg-card border border-border p-6 hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Earnings & History</h3>
                  <p className="text-sm text-muted-foreground">View earnings & completed deliveries</p>
                </div>
              </div>
              <p className="text-sm text-primary font-semibold">Total: ₹{stats.totalEarnings.toFixed(2)}</p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
