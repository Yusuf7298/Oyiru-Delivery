'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { BarChart3, ChevronLeft, TrendingUp, Users, Activity } from 'lucide-react'

export default function AnalyticsReportPage() {
  const [data, setData] = useState({
    monthlyRevenue: 0,
    activeHotelsCount: 0,
    engagementScore: 'Loading...'
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/reports/analytics')
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/super-admin/reports" className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Business Analytics</h1>
              <p className="text-muted-foreground mt-2">Comprehensive platform analytics and insights</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <p className="text-muted-foreground text-sm">Monthly Revenue (30 Days)</p>
            <h3 className="text-2xl font-bold mt-1">{data.monthlyRevenue.toFixed(2)} Birr</h3>
          </Card>

          <Card className="p-6 bg-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-muted-foreground text-sm">Active Hotels</p>
            <h3 className="text-2xl font-bold mt-1">{data.activeHotelsCount}</h3>
          </Card>

          <Card className="p-6 bg-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Activity className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-muted-foreground text-sm">Platform Engagement</p>
            <h3 className="text-2xl font-bold mt-1">{data.engagementScore}</h3>
          </Card>
        </div>

        <Card className="p-12 text-center border-dashed border-2">
          <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Detailed Analytics Coming Soon</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            We are gathering more data to provide comprehensive charts and predictive analytics. Check back later for detailed breakdowns.
          </p>
        </Card>
      </div>
    </div>
  )
}
