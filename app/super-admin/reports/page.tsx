'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { BarChart3, TrendingUp, Package, Truck } from 'lucide-react'

export default function ReportsHub() {
  const reports = [
    {
      title: 'Sales Reports',
      description: 'View sales metrics, revenue trends, and order analytics',
      icon: TrendingUp,
      href: '/super-admin/reports/sales',
      color: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Inventory Reports',
      description: 'Track stock levels, low inventory alerts, and product availability',
      icon: Package,
      href: '/super-admin/reports/inventory',
      color: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Delivery Reports',
      description: 'Monitor delivery performance and completion rates',
      icon: Truck,
      href: '/super-admin/reports/delivery',
      color: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Business Analytics',
      description: 'Comprehensive platform analytics and insights',
      icon: BarChart3,
      href: '/super-admin/reports/analytics',
      color: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-2">View platform metrics and generate detailed reports</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => {
            const IconComponent = report.icon
            return (
              <Link key={report.href} href={report.href}>
                <Card className="bg-card border border-border p-6 hover:shadow-lg transition-shadow cursor-pointer group h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 ${report.color} rounded-lg group-hover:scale-110 transition-transform`}>
                      <IconComponent className={`w-6 h-6 ${report.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground">{report.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                    </div>
                  </div>
                  <p className="text-sm text-primary font-semibold">View Report →</p>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
