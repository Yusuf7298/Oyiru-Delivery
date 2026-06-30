'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAllDeliveryPartners, suspendDeliveryPartner } from '@/app/actions/admin-dashboard'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Search, Phone, Truck, Star } from 'lucide-react'

export default function AdminDeliveryPartnersPage() {
  const [partners, setPartners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const loadPartners = async () => {
      try {
        setLoading(true)
        const data = await getAllDeliveryPartners(page, 15)
        setPartners(data.partners)
        setTotalPages(data.pages)
      } catch (error) {
        console.error('Error loading delivery partners:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPartners()
  }, [page])

  const handleSuspend = async (partnerId: string) => {
    try {
      await suspendDeliveryPartner(partnerId, 'Suspended by admin')
      setPartners(partners.filter(p => p.id !== partnerId))
    } catch (error) {
      console.error('Error suspending partner:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/super-admin/dashboard" className="p-2 hover:bg-secondary rounded-lg">
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold">Delivery Partners</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search delivery partners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg border border-border p-6 animate-pulse">
                <div className="h-12 w-12 rounded-full bg-secondary mb-4" />
                <div className="h-4 bg-secondary rounded mb-3" />
                <div className="h-4 bg-secondary rounded w-2/3" />
              </div>
            ))
          ) : partners.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No delivery partners found
            </div>
          ) : (
            partners.map((partner: any) => (
              <div key={partner.id} className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold">
                    <Truck className="w-6 h-6" />
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${partner.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {partner.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Phone</p>
                    <p className="font-semibold flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      {partner.phoneNumber}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Vehicle</p>
                    <p className="font-semibold">{partner.vehicleType || 'Not specified'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total Orders</p>
                      <p className="font-bold text-lg">{partner.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Rating</p>
                      <p className="font-bold text-lg flex items-center gap-1">
                        {partner.averageRating || 'N/A'}
                        {partner.averageRating && <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Earnings</p>
                    <p className="font-semibold text-lg text-primary">{partner.totalEarnings?.toFixed(2) || '0.00'} Birr</p>
                  </div>

                  <div className="pt-4 border-t border-border space-y-2">
                    <Link href={`/super-admin/delivery-partners/${partner.userId}`}>
                      <Button variant="outline" className="w-full" size="sm">
                        View Details
                      </Button>
                    </Link>
                    {partner.isActive && (
                      <Button
                        variant="ghost"
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                        size="sm"
                        onClick={() => handleSuspend(partner.id)}
                      >
                        Suspend
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-8">
          <p className="text-sm text-muted-foreground">
            Showing page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
