'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAllRestaurants, suspendRestaurant } from '@/app/actions/admin-dashboard'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Search, MapPin, Phone, AlertCircle } from 'lucide-react'

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        setLoading(true)
        const data = await getAllRestaurants(page, 15)
        setRestaurants(data.restaurants)
        setTotalPages(data.pages)
      } catch (error) {
        console.error('Error loading restaurants:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRestaurants()
  }, [page])

  const handleSuspend = async (restaurantId: string) => {
    try {
      await suspendRestaurant(restaurantId, 'Suspended by admin')
      setRestaurants(restaurants.filter(r => r.id !== restaurantId))
    } catch (error) {
      console.error('Error suspending restaurant:', error)
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
              <h1 className="text-2xl font-bold">Restaurants Management</h1>
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
              placeholder="Search restaurants by name, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Restaurants Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Restaurant Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">City</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Delivery Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Fee</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      Loading restaurants...
                    </td>
                  </tr>
                ) : restaurants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No restaurants found
                    </td>
                  </tr>
                ) : (
                  restaurants.map((restaurant: any) => (
                    <tr key={restaurant.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold">{restaurant.name}</p>
                          <p className="text-xs text-muted-foreground">{restaurant.description?.substring(0, 50)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{restaurant.city}</td>
                      <td className="px-6 py-4 text-sm">{restaurant.deliveryTime || 30} min</td>
                      <td className="px-6 py-4 text-sm font-semibold">${restaurant.deliveryFee || 0}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${restaurant.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {restaurant.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <Link href={`/super-admin/restaurants/${restaurant.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                        {restaurant.isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSuspend(restaurant.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Suspend
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
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
