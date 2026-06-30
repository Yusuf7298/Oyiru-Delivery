'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  getDashboardStats,
  getRecentOrders,
  getAllCustomers,
  getAllRestaurants,
  getAllDeliveryPartners,
  getAnalyticsData,
} from '@/app/actions/admin-dashboard'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  Users,
  ShoppingCart,
  Truck,
  TrendingUp,
  AlertCircle,
  Settings,
  LogOut,
} from 'lucide-react'

interface Stats {
  totalOrders: number
  totalCustomers: number
  totalRestaurants: number
  totalDeliveryPartners: number
  todayOrders: number
  todayRevenue: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsData, ordersData] = await Promise.all([
          getDashboardStats(),
          getRecentOrders(5),
        ])
        setStats(statsData)
        setRecentOrders(ordersData)
      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-card rounded-lg p-6 border border-border hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-2">{label}</p>
          <p className="text-3xl font-bold">{value?.toLocaleString() || '0'}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 shadow">
              <Image src="/logo.jpg" alt="Oyru" fill className="object-cover" sizes="40px" priority />
            </span>
            <span className="font-bold text-xl hidden sm:inline">Oyru Admin</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/super-admin/settings" className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </Link>
            <Link href="/sign-in" className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <LogOut className="w-5 h-5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <div className="flex">
        <aside className="w-64 bg-card border-r border-border min-h-screen p-6 hidden md:block">
          <nav className="space-y-2">
            <NavItem icon={BarChart3} label="Overview" href="/super-admin/dashboard" active={activeTab === 'overview'} />
            <NavItem icon={ShoppingCart} label="Orders" href="/super-admin/orders" active={activeTab === 'orders'} />
            <NavItem icon={Users} label="Customers" href="/super-admin/customers" active={activeTab === 'customers'} />
            <NavItem icon={ShoppingCart} label="Restaurants" href="/super-admin/restaurants" active={activeTab === 'restaurants'} />
            <NavItem icon={Truck} label="Delivery Partners" href="/super-admin/delivery-partners" active={activeTab === 'delivery'} />
            <NavItem icon={TrendingUp} label="Analytics" href="/super-admin/analytics" active={activeTab === 'analytics'} />
            <NavItem icon={AlertCircle} label="Support Tickets" href="/super-admin/support" active={activeTab === 'support'} />
            <NavItem icon={Settings} label="Settings" href="/super-admin/settings" active={activeTab === 'settings'} />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          {loading ? (
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-secondary rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard
                  label="Total Orders"
                  value={stats?.totalOrders}
                  icon={ShoppingCart}
                  color="bg-blue-500"
                />
                <StatCard
                  label="Total Customers"
                  value={stats?.totalCustomers}
                  icon={Users}
                  color="bg-green-500"
                />
                <StatCard
                  label="Total Restaurants"
                  value={stats?.totalRestaurants}
                  icon={ShoppingCart}
                  color="bg-purple-500"
                />
                <StatCard
                  label="Delivery Partners"
                  value={stats?.totalDeliveryPartners}
                  icon={Truck}
                  color="bg-orange-500"
                />
                <StatCard
                  label="Today Orders"
                  value={stats?.todayOrders}
                  icon={TrendingUp}
                  color="bg-pink-500"
                />
                <StatCard
                  label="Today Revenue"
                  value={`${stats?.todayRevenue?.toFixed(2)} Birr`}
                  icon={TrendingUp}
                  color="bg-teal-500"
                />
              </div>

              {/* Recent Orders Section */}
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Recent Orders</h2>
                  <Link href="/super-admin/orders">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Order ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Customer</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order: any) => (
                        <tr key={order.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                          <td className="py-3 px-4 text-sm font-mono">{order.id.substring(0, 8)}</td>
                          <td className="py-3 px-4 text-sm">{order.userId.substring(0, 8)}</td>
                          <td className="py-3 px-4 text-sm font-semibold">{parseFloat(order.totalAmount).toFixed(2)} Birr</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

function NavItem({ icon: Icon, label, href, active }: any) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${active ? 'bg-primary text-white' : 'hover:bg-secondary text-foreground'
        }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}

function getStatusColor(status: string) {
  const colors: { [key: string]: string } = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-purple-100 text-purple-800',
    ready: 'bg-green-100 text-green-800',
    in_transit: 'bg-orange-100 text-orange-800',
    delivered: 'bg-teal-100 text-teal-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}
