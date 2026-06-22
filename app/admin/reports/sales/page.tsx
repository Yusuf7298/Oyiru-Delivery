'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Download, TrendingUp, DollarSign, ShoppingCart, Users } from 'lucide-react'

interface SalesReport {
  totalSales: number
  totalOrders: number
  totalCustomers: number
  averageOrderValue: number
  dailySales: Array<{
    date: string
    sales: number
    orders: number
  }>
}

export default function SalesReports() {
  const [report, setReport] = useState<SalesReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch('/api/admin/reports/sales')
        if (response.ok) {
          const data = await response.json()
          setReport(data)
        }
      } catch (error) {
        console.error('Failed to fetch sales report:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [])

  const downloadReport = async () => {
    const csv = [
      ['Sales Report'],
      ['Generated:', new Date().toISOString()],
      [],
      ['Metric', 'Value'],
      ['Total Sales', `₹${report?.totalSales.toFixed(2)}`],
      ['Total Orders', report?.totalOrders],
      ['Total Customers', report?.totalCustomers],
      ['Average Order Value', `₹${report?.averageOrderValue.toFixed(2)}`],
      [],
      ['Daily Sales'],
      ['Date', 'Sales', 'Orders'],
      ...(report?.dailySales.map(d => [d.date, `₹${d.sales.toFixed(2)}`, d.orders]) || []),
    ]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/admin/reports" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Reports</span>
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Sales Reports</h1>
            <Button onClick={downloadReport} disabled={!report} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading report...</p>
          </div>
        ) : report ? (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-card border border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Sales</p>
                    <p className="text-3xl font-bold text-foreground">₹{report.totalSales.toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </Card>

              <Card className="bg-card border border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                    <p className="text-3xl font-bold text-foreground">{report.totalOrders}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="bg-card border border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Customers</p>
                    <p className="text-3xl font-bold text-foreground">{report.totalCustomers}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </Card>

              <Card className="bg-card border border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Avg. Order Value</p>
                    <p className="text-3xl font-bold text-foreground">₹{report.averageOrderValue.toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Daily Sales Table */}
            <Card className="bg-card border border-border overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">Daily Sales Breakdown</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Sales</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.dailySales.map((row, idx) => (
                      <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 text-sm text-foreground">{row.date}</td>
                        <td className="px-6 py-4 text-sm font-bold text-primary">₹{row.sales.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{row.orders}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Failed to load report</p>
          </div>
        )}
      </div>
    </div>
  )
}
