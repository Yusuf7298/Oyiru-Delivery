'use client'

import { useEffect, useState } from 'react'
import { getAnalyticsData, getDashboardStatsWithTrend } from '@/app/actions/admin-dashboard'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Calendar, Minus } from 'lucide-react'

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null)
  const [analyticsData, setAnalyticsData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [statsData, data] = await Promise.all([
          getDashboardStatsWithTrend(),
          getAnalyticsData(days),
        ])
        setStats(statsData)
        setAnalyticsData(data)
      } catch (err) {
        console.error('Error loading analytics:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [days])

  return (
    <div className="min-h-screen bg-background/50 p-6 sm:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">Real platform metrics vs previous {days}-day period.</p>
        </div>
        <select
          value={days}
          onChange={e => setDays(Number(e.target.value))}
          className="px-4 py-2 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
        >
          <option value={7}>Last 7 Days</option>
          <option value={30}>Last 30 Days</option>
          <option value={90}>Last 90 Days</option>
          <option value={365}>Last Year</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-card rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Key Metrics — real trend data */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Revenue"
              value={`${stats?.totalRevenue?.toFixed(2) || '0.00'} Birr`}
              change={stats?.trends?.revenue ?? null}
            />
            <MetricCard
              title="Total Orders"
              value={stats?.totalOrders?.toLocaleString() || '0'}
              change={stats?.trends?.orders ?? null}
            />
            <MetricCard
              title="Avg Order Value"
              value={`${stats?.avgOrderValue?.toFixed(2) || '0.00'} Birr`}
              change={stats?.trends?.avgOrderValue ?? null}
            />
            <MetricCard
              title="Total Customers"
              value={stats?.totalCustomers?.toLocaleString() || '0'}
              change={stats?.trends?.customers ?? null}
            />
          </div>

          {/* Today Summary */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-card border border-border rounded-2xl p-6">
              <p className="text-sm text-muted-foreground mb-1">Today Orders</p>
              <p className="text-3xl font-bold">{stats?.todayOrders || 0}</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <p className="text-sm text-muted-foreground mb-1">Today Revenue</p>
              <p className="text-3xl font-bold">{stats?.todayRevenue?.toFixed(2) || '0.00'} Birr</p>
            </div>
          </div>

          {/* Daily Breakdown from daily_analytics table */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-6 py-5 border-b border-border">
              <h2 className="text-lg font-bold">Daily Performance</h2>
              <p className="text-sm text-muted-foreground mt-0.5">From <code>daily_analytics</code> table — populated automatically.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Deliveries</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Avg Delivery</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Active Users</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {analyticsData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        No daily analytics data yet. Data populates as orders are placed.
                      </td>
                    </tr>
                  ) : analyticsData.map((day, idx) => (
                    <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium">{new Date(day.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm">{day.totalOrders}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary">{Number(day.totalRevenue).toFixed(2)} Birr</td>
                      <td className="px-6 py-4 text-sm">{day.totalDeliveries}</td>
                      <td className="px-6 py-4 text-sm">{day.averageDeliveryTime ? `${Number(day.averageDeliveryTime).toFixed(1)} min` : 'N/A'}</td>
                      <td className="px-6 py-4 text-sm">{day.activeCustomers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Report
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

function MetricCard({ title, value, change }: { title: string; value: string; change: number | null }) {
  const noData = change === null || change === 0
  const isPositive = (change ?? 0) > 0
  const isNegative = (change ?? 0) < 0

  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
      <p className="text-sm text-muted-foreground mb-2">{title}</p>
      <p className="text-2xl font-bold mb-4">{value}</p>
      <div className="flex items-center gap-1.5">
        {noData ? (
          <><Minus className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">No prior data</span></>
        ) : isPositive ? (
          <><TrendingUp className="w-4 h-4 text-green-600" /><span className="text-sm text-green-600 font-medium">+{change}% vs prev period</span></>
        ) : (
          <><TrendingDown className="w-4 h-4 text-red-500" /><span className="text-sm text-red-500 font-medium">{change}% vs prev period</span></>
        )}
      </div>
    </div>
  )
}
