'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Truck, ChevronLeft, MapPin, PackageCheck, AlertCircle } from 'lucide-react'

export default function DeliveryReportPage() {
  const [data, setData] = useState({
    activeDeliveries: 0,
    completedToday: 0,
    delayedShipments: 0
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/reports/delivery')
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
              <h1 className="text-2xl font-bold text-foreground">Delivery Reports</h1>
              <p className="text-muted-foreground mt-2">Monitor delivery performance and completion rates</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Truck className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-muted-foreground text-sm">Active Deliveries</p>
            <h3 className="text-2xl font-bold mt-1">{data.activeDeliveries}</h3>
          </Card>

          <Card className="p-6 bg-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <PackageCheck className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-muted-foreground text-sm">Completed Today</p>
            <h3 className="text-2xl font-bold mt-1">{data.completedToday}</h3>
          </Card>

          <Card className="p-6 bg-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <p className="text-muted-foreground text-sm">Delayed Shipments</p>
            <h3 className="text-2xl font-bold mt-1">{data.delayedShipments}</h3>
          </Card>
        </div>

        <Card className="p-12 text-center border-dashed border-2">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Driver Fleet Metrics Coming Soon</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Detailed tracking of driver completion times, route efficiency, and location data is currently being integrated.
          </p>
        </Card>
      </div>
    </div>
  )
}
