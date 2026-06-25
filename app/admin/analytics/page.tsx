'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAnalyticsData, getDashboardStats } from '@/app/actions/admin-dashboard'
import { Button } from '@/components/ui/button'
import { ChevronLeft, TrendingUp, TrendingDown, Calendar } from 'lucide-react'

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null)
  const [analyticsData, setAnalyticsData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true)
        const [statsData, data] = await Promise.all([
          getDashboardStats(),
          getAnalyticsData(days),
        ])
        setStats(statsData)
        setAnalyticsData(data)
      } catch (error) {
        console.error('Error loading analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [days])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="p-2 hover:bg-secondary rounded-lg">
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold">Analytics & Reports</h1>
            </div>

            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days</option>
              <option value={365}>Last Year</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-secondary rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Total Revenue"
                value={`$${stats?.todayRevenue?.toFixed(2) || '0.00'}`}
                change={12}
                icon={TrendingUp}
              />
              <MetricCard
                title="Total Orders"
                value={stats?.totalOrders?.toLocaleString() || '0'}
                change={8}
                icon={TrendingUp}
              />
              <MetricCard
                title="Avg Order Value"
                value={stats?.totalOrders ? `$${(stats.todayRevenue / stats.todayOrders).toFixed(2)}` : '$0.00'}
                change={-2}
                icon={TrendingDown}
              />
              <MetricCard
                title="Active Users"
                value={stats?.totalCustomers?.toLocaleString() || '0'}
                change={5}
                icon={TrendingUp}
              />
            </div>

            {/* Daily Breakdown */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-bold mb-6">Daily Performance</h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Orders</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Deliveries</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Avg Delivery Time</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Active Customers</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {analyticsData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                          No analytics data available
                        </td>
                      </tr>
                    ) : (
                      analyticsData.map((day: any, idx) => (
                        <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium">
                            {new Date(day.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm">{day.totalOrders}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-primary">
                            ${day.totalRevenue?.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm">{day.totalDeliveries}</td>
                          <td className="px-6 py-4 text-sm">
                            {day.averageDeliveryTime?.toFixed(1) || 'N/A'} min
                          </td>
                          <td className="px-6 py-4 text-sm">{day.activeCustomers}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Export Section */}
            <div className="mt-8 flex justify-end gap-4">
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Report
              </Button>
              <Button>
                Download Report
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function MetricCard({ title, value, change, icon: Icon }: any) {
  const isPositive = change >= 0

  return (
    <div className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
          <Icon className={`w-5 h-5 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
        </div>
      </div>
      <p className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? '+' : ''}{change}% from last period
      </p>
    </div>
  )
}
