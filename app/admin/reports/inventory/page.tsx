'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Download, AlertTriangle, Package, TrendingDown } from 'lucide-react'

interface InventoryItem {
  id: string
  name: string
  categoryId: string
  stockQuantity: number
  isAvailable: boolean
}

export default function InventoryReports() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch('/api/admin/reports/inventory')
        if (response.ok) {
          const data = await response.json()
          setItems(data)
        }
      } catch (error) {
        console.error('Failed to fetch inventory report:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [])

  const downloadReport = async () => {
    const csv = [
      ['Inventory Report'],
      ['Generated:', new Date().toISOString()],
      [],
      ['Product Name', 'Stock Quantity', 'Status'],
      ...items.map(item => [item.name, item.stockQuantity, item.isAvailable ? 'Available' : 'Unavailable']),
    ]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const lowStockItems = items.filter(item => item.stockQuantity < 10)
  const totalValue = items.reduce((sum, item) => sum + item.stockQuantity, 0)

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
            <h1 className="text-2xl font-bold text-foreground">Inventory Reports</h1>
            <Button onClick={downloadReport} variant="outline" size="sm">
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
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="bg-card border border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Products</p>
                    <p className="text-3xl font-bold text-foreground">{items.length}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="bg-card border border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Stock</p>
                    <p className="text-3xl font-bold text-foreground">{totalValue}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingDown className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="bg-card border border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Low Stock Items</p>
                    <p className="text-3xl font-bold text-foreground">{lowStockItems.length}</p>
                  </div>
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
              <Card className="bg-amber-50 border border-amber-200 p-6 mb-8">
                <h2 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Low Stock Items ({lowStockItems.length})
                </h2>
                <div className="space-y-2">
                  {lowStockItems.map(item => (
                    <p key={item.id} className="text-sm text-amber-800">
                      {item.name}: {item.stockQuantity} units remaining
                    </p>
                  ))}
                </div>
              </Card>
            )}

            {/* Full Inventory Table */}
            <Card className="bg-card border border-border overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">Inventory List</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Product Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Stock Quantity</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-foreground">{item.name}</td>
                        <td className="px-6 py-4 text-sm font-bold text-foreground">{item.stockQuantity}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              item.isAvailable
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
