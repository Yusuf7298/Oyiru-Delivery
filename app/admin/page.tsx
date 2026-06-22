'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  getPlatformStats,
  getAllOrders,
  getAllRestaurants,
  getAllDeliveryPartners,
} from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { BarChart3, Store, Truck, ShoppingCart, DollarSign, Users, LineChart } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getPlatformStats()
        setStats(data)
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
              Ad
            </div>
            <span className="hidden sm:inline">Oyru Admin</span>
          </Link>
          <Link href="/profile">
            <Button variant="outline">Profile</Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and management</p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg p-6 animate-pulse h-32"></div>
            ))}
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Total Orders */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                    <p className="text-3xl font-bold">{stats.totalOrders}</p>
                  </div>
                  <ShoppingCart className="w-10 h-10 text-primary opacity-20" />
                </div>
              </div>

              {/* Total Revenue */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-green-500 opacity-20" />
                </div>
              </div>

              {/* Active Restaurants */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active Restaurants</p>
                    <p className="text-3xl font-bold">
                      {stats.activeRestaurants}/{stats.totalRestaurants}
                    </p>
                  </div>
                  <Store className="w-10 h-10 text-blue-500 opacity-20" />
                </div>
              </div>

              {/* Active Delivery Partners */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Delivery Partners</p>
                    <p className="text-3xl font-bold">
                      {stats.activeDeliveryPartners}/{stats.totalDeliveryPartners}
                    </p>
                  </div>
                  <Truck className="w-10 h-10 text-orange-500 opacity-20" />
                </div>
              </div>

              {/* Average Order Value */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Avg Order Value</p>
                    <p className="text-3xl font-bold">
                      ${(stats.totalRevenue / Math.max(stats.totalOrders, 1)).toFixed(2)}
                    </p>
                  </div>
                  <BarChart3 className="w-10 h-10 text-purple-500 opacity-20" />
                </div>
              </div>

              {/* Platform Commission */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Est. Commission</p>
                    <p className="text-3xl font-bold">
                      ${(stats.totalRevenue * 0.15).toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="w-10 h-10 text-green-600 opacity-20" />
                </div>
              </div>
            </div>

            {/* Management Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Products Management */}
              <Link href="/admin/products">
                <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                      <ShoppingCart className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Products</h3>
                      <p className="text-sm text-muted-foreground">Manage product catalog</p>
                    </div>
                  </div>
                  <p className="text-sm text-primary font-semibold">
                    Manage inventory
                  </p>
                </div>
              </Link>

              {/* Oyru Orders Management */}
              <Link href="/admin/oyru-orders">
                <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-cyan-100 rounded-lg group-hover:bg-cyan-200 transition-colors">
                      <ShoppingCart className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Oyru Orders</h3>
                      <p className="text-sm text-muted-foreground">Delivery orders management</p>
                    </div>
                  </div>
                  <p className="text-sm text-primary font-semibold">
                    View details
                  </p>
                </div>
              </Link>

              {/* Inventory Management */}
              <Link href="/admin/inventory">
                <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-rose-100 rounded-lg group-hover:bg-rose-200 transition-colors">
                      <Store className="w-6 h-6 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Inventory</h3>
                      <p className="text-sm text-muted-foreground">Track stock levels</p>
                    </div>
                  </div>
                  <p className="text-sm text-primary font-semibold">
                    View inventory
                  </p>
                </div>
              </Link>

              {/* Restaurants Management */}
              <Link href="/admin/restaurants">
                <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Store className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Manage Restaurants</h3>
                      <p className="text-sm text-muted-foreground">View and manage all restaurants</p>
                    </div>
                  </div>
                  <p className="text-sm text-primary font-semibold">
                    {stats.totalRestaurants} total
                  </p>
                </div>
              </Link>

              {/* Orders Management */}
              <Link href="/admin/orders">
                <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <ShoppingCart className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">View All Orders</h3>
                      <p className="text-sm text-muted-foreground">Track platform orders</p>
                    </div>
                  </div>
                  <p className="text-sm text-primary font-semibold">
                    {stats.totalOrders} total
                  </p>
                </div>
              </Link>

              {/* Delivery Partners Management */}
              <Link href="/admin/delivery-partners">
                <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                      <Truck className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Delivery Partners</h3>
                      <p className="text-sm text-muted-foreground">Manage delivery fleet</p>
                    </div>
                  </div>
                  <p className="text-sm text-primary font-semibold">
                    {stats.totalDeliveryPartners} total
                  </p>
                </div>
              </Link>

              {/* Users Management */}
              <Link href="/admin/users">
                <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Users</h3>
                      <p className="text-sm text-muted-foreground">View all platform users</p>
                    </div>
                  </div>
                  <p className="text-sm text-primary font-semibold">
                    Manage users
                  </p>
                </div>
              </Link>

              {/* Reports */}
              <Link href="/admin/reports">
                <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                      <LineChart className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Reports & Analytics</h3>
                      <p className="text-sm text-muted-foreground">View platform reports</p>
                    </div>
                  </div>
                  <p className="text-sm text-primary font-semibold">
                    View reports
                  </p>
                </div>
              </Link>

              {/* Settings */}
              <Link href="/admin/settings">
                <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Settings</h3>
                      <p className="text-sm text-muted-foreground">Platform configuration</p>
                    </div>
                  </div>
                  <p className="text-sm text-primary font-semibold">
                    Configure
                  </p>
                </div>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Failed to load statistics</p>
          </div>
        )}
      </div>
    </div>
  )
}
