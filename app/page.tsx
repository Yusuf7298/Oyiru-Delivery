'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchRestaurants } from '@/app/actions/restaurants'
import { Button } from '@/components/ui/button'

export default function Page() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const data = await fetchRestaurants()
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
              Oy
            </div>
            <span className="hidden sm:inline">Oyru</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/orders" className="text-sm font-medium hover:text-primary transition-colors">
              My Orders
            </Link>
            <Link href="/profile" className="text-sm font-medium hover:text-primary transition-colors">
              Profile
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="text-primary">Delicious Food</span> Delivered Fast
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Order from your favorite restaurants and get it delivered to your doorstep in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <input
              type="text"
              placeholder="Enter your location..."
              className="px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-64"
            />
            <Button className="w-full sm:w-auto">Search</Button>
          </div>
        </div>
      </section>

      {/* Restaurants Grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Popular Restaurants</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg overflow-hidden animate-pulse h-72">
                  <div className="bg-secondary h-40 w-full"></div>
                  <div className="p-4 space-y-3">
                    <div className="bg-secondary h-4 w-3/4"></div>
                    <div className="bg-secondary h-3 w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : restaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant: any) => (
                <Link
                  key={restaurant.id}
                  href={`/restaurant/${restaurant.id}`}
                  className="bg-card rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 h-40 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                      {restaurant.name.charAt(0)}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {restaurant.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {restaurant.description || 'Delicious food and great service'}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <span className="text-primary font-semibold">{restaurant.deliveryTime || 30}</span>
                        <span className="text-muted-foreground">min</span>
                      </span>
                      <span className="text-muted-foreground">
                        Delivery Fee: ${restaurant.deliveryFee || 0}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No restaurants available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-12 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2026 Oyru Delivery. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
