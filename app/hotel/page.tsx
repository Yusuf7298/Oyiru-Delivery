'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, BarChart3, Truck, Settings, LogOut } from 'lucide-react'

interface Stats {
  totalOrders: number
  totalSpent: number
  pendingOrders: number
}

export default function HotelDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/hotel/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-lg">
              Oy
            </div>
            <div>
              <h1 className="font-bold text-lg">Oyru Hotel</h1>
              <p className="text-xs text-muted-foreground">Hotel Orders</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="p-2 hover:bg-muted rounded-lg transition-colors" title="Storefront Home">
              <span className="text-sm font-medium mr-1 hidden sm:inline-block">Storefront</span>
            </Link>
            <Link href="/profile" className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </Link>
            <button onClick={() => { window.location.href = '/' }} className="p-2 hover:bg-muted rounded-lg transition-colors text-destructive">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome to Oyru Hotel</h2>
          <p className="text-muted-foreground">Manage your orders and track deliveries</p>
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg p-6 animate-pulse h-32"></div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                  <p className="text-3xl font-bold">{stats.totalOrders}</p>
                </div>
                <ShoppingCart className="w-10 h-10 text-primary opacity-20" />
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                  <p className="text-3xl font-bold">{stats.totalSpent.toFixed(2)} Birr</p>
                </div>
                <BarChart3 className="w-10 h-10 text-green-500 opacity-20" />
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending Orders</p>
                  <p className="text-3xl font-bold">{stats.pendingOrders}</p>
                </div>
                <Truck className="w-10 h-10 text-orange-500 opacity-20" />
              </div>
            </div>
          </div>
        ) : null}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Now */}
          <Link href="/hotel/ordering">
            <div className="bg-card border border-border rounded-lg p-8 hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <ShoppingCart className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Order Now</h3>
                  <p className="text-sm text-muted-foreground">
                    Browse and order products
                  </p>
                </div>
              </div>
              <p className="text-sm text-primary font-semibold group-hover:translate-x-1 transition-transform">
                Start ordering →
              </p>
            </div>
          </Link>

          {/* My Orders */}
          <Link href="/hotel/orders">
            <div className="bg-card border border-border rounded-lg p-8 hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <BarChart3 className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">My Orders</h3>
                  <p className="text-sm text-muted-foreground">
                    View order history and status
                  </p>
                </div>
              </div>
              <p className="text-sm text-primary font-semibold group-hover:translate-x-1 transition-transform">
                View orders →
              </p>
            </div>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-12 bg-card border border-border rounded-lg p-8">
          <h3 className="text-xl font-bold mb-6">Why Choose Oyru?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">Easy Ordering</h4>
              <p className="text-sm text-muted-foreground">
                Simple and intuitive ordering system for all your needs
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-3">
                <Truck className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">Fast Delivery</h4>
              <p className="text-sm text-muted-foreground">
                Quick and reliable delivery to your location
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2">Track Orders</h4>
              <p className="text-sm text-muted-foreground">
                Real-time order tracking and status updates
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
