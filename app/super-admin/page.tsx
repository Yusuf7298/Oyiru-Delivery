'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  getPlatformStats,
  getAllOrders,
} from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Users, Store, Truck, TrendingUp, DollarSign } from 'lucide-react'

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
    <div className="min-h-screen bg-background/50 p-6 sm:p-8">
      {/* Title */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Platform performance and statistics</p>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card/50 rounded-2xl p-6 h-36 animate-pulse border border-border/50"></div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
          {/* Total Orders */}
          <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="flex items-center justify-between z-10 relative">
              <div>
                <p className="text-sm font-medium text-white/50 mb-2">Total Orders</p>
                <p className="text-4xl font-extrabold text-white">{stats.totalOrders}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
          </div>

          {/* Total Customers */}
          <Link href="/super-admin/customers" className="bg-[#121212] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="flex items-center justify-between z-10 relative">
              <div>
                <p className="text-sm font-medium text-white/50 mb-2">Total Customers</p>
                <p className="text-4xl font-extrabold text-white">{stats.totalCustomers || 0}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-colors"></div>
          </Link>

          {/* Total Restaurants */}
          <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="flex items-center justify-between z-10 relative">
              <div>
                <p className="text-sm font-medium text-white/50 mb-2">Total Restaurants</p>
                <p className="text-4xl font-extrabold text-white">{stats.totalRestaurants || 0}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <Store className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors"></div>
          </div>

          {/* Delivery Partners */}
          <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="flex items-center justify-between z-10 relative">
              <div>
                <p className="text-sm font-medium text-white/50 mb-2">Delivery Partners</p>
                <p className="text-4xl font-extrabold text-white">{stats.totalDeliveryPartners || 0}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                <Truck className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-colors"></div>
          </div>

          {/* Today Orders */}
          <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="flex items-center justify-between z-10 relative">
              <div>
                <p className="text-sm font-medium text-white/50 mb-2">Today Orders</p>
                <p className="text-4xl font-extrabold text-white">{stats.todayOrders || 0}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl group-hover:bg-pink-500/20 transition-colors"></div>
          </div>

          {/* Today Revenue */}
          <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="flex items-center justify-between z-10 relative">
              <div>
                <p className="text-sm font-medium text-white/50 mb-2">Today Revenue</p>
                <p className="text-4xl font-extrabold text-white">{stats.todayRevenue ? stats.todayRevenue.toFixed(2) : '0.00'} Birr</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-colors"></div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Failed to load statistics</p>
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="bg-[#121212] border border-white/5 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Recent Orders</h2>
          <Link href="/super-admin/orders">
            <Button variant="outline" size="sm" className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white">
              View All
            </Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-sm font-semibold text-white/50">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono">{order.orderNumber}</td>
                    <td className="px-6 py-4">{order.userId ? 'Registered User' : 'Guest'}</td>
                    <td className="px-6 py-4 font-semibold">{parseFloat(order.totalAmount).toFixed(2)} Birr</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300">
                        {order.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/50">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-white/50">
                    No recent orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
