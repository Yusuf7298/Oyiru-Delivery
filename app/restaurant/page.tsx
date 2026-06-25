'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getRestaurantOwnerRestaurants } from '@/app/actions/restaurant-orders'
import { Button } from '@/components/ui/button'
import { Plus, BarChart3, UtensilsCrossed } from 'lucide-react'

export default function RestaurantDashboard() {
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const data = await getRestaurantOwnerRestaurants()
        setRestaurants(data)
      } catch (error) {
        console.error('Error loading restaurants:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRestaurants()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
              Oy
            </div>
            <span className="hidden sm:inline">Oyru Restaurant</span>
          </Link>
          <Link href="/profile">
            <Button variant="outline">Profile</Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Restaurant Dashboard</h1>
          <p className="text-muted-foreground">Manage your restaurants and orders</p>
        </div>

        {/* Add Restaurant Button */}
        <div className="mb-8">
          <Link href="/restaurant/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Restaurant
            </Button>
          </Link>
        </div>

        {/* Restaurants List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg p-6 animate-pulse h-48"></div>
            ))}
          </div>
        ) : restaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant: any) => (
              <div
                key={restaurant.id}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {restaurant.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {restaurant.description || 'No description'}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${restaurant.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {restaurant.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery Time:</span>
                    <span className="font-semibold">{restaurant.deliveryTime || 30}m</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery Fee:</span>
                    <span className="font-semibold">${restaurant.deliveryFee || 0}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/restaurant/${restaurant.id}/orders`} className="flex-1">
                    <Button variant="outline" className="w-full gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Orders
                    </Button>
                  </Link>
                  <Link href={`/restaurant/${restaurant.id}/menu`} className="flex-1">
                    <Button variant="outline" className="w-full gap-2">
                      <UtensilsCrossed className="w-4 h-4" />
                      Menu
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <p className="text-lg text-muted-foreground mb-6">No restaurants yet</p>
            <Link href="/restaurant/new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Your First Restaurant
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
