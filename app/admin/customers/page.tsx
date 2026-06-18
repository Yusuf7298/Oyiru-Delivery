'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAllCustomers } from '@/app/actions/admin-dashboard'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Search, Mail, Phone, MapPin, User } from 'lucide-react'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true)
        const data = await getAllCustomers(page, 20)
        setCustomers(data.customers)
        setTotalPages(data.pages)
      } catch (error) {
        console.error('Error loading customers:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCustomers()
  }, [page])

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
              <h1 className="text-2xl font-bold">Customers Management</h1>
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
              placeholder="Search customers by name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Customers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg border border-border p-6 animate-pulse">
                <div className="h-12 w-12 rounded-full bg-secondary mb-4" />
                <div className="h-4 bg-secondary rounded mb-3" />
                <div className="h-4 bg-secondary rounded w-2/3" />
              </div>
            ))
          ) : customers.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No customers found
            </div>
          ) : (
            customers.map((customer: any) => (
              <div key={customer.id} className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-white font-bold">
                    {customer.phoneNumber?.charAt(0).toUpperCase() || 'C'}
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-semibold">
                    Active
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Phone</p>
                    <p className="font-semibold flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      {customer.phoneNumber || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Address</p>
                    <p className="font-semibold flex items-center gap-2 line-clamp-2">
                      <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                      {customer.address || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">City</p>
                    <p className="font-semibold">{customer.city || 'N/A'}</p>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-3">
                      Joined: {new Date(customer.createdAt).toLocaleDateString()}
                    </p>
                    <Link href={`/admin/customers/${customer.userId}`}>
                      <Button variant="outline" className="w-full" size="sm">
                        View Details
                      </Button>
                    </Link>
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
