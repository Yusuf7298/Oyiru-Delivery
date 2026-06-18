'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { fetchRestaurants } from '@/app/actions/restaurants'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'

function SearchContent() {
  const searchParams = useSearchParams()
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const data = await fetchRestaurants()
        let filtered = data

        if (query) {
          const lowerQuery = query.toLowerCase()
          filtered = data.filter(
            (restaurant: any) =>
              restaurant.name.toLowerCase().includes(lowerQuery) ||
              restaurant.description?.toLowerCase().includes(lowerQuery)
          )
        }

        setRestaurants(filtered)
      } catch (error) {
        console.error('Error loading restaurants:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRestaurants()
  }, [query])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setSearching(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search restaurants, cuisines..."
              value={query}
              onChange={handleSearch}
              className="flex-1 px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Link href="/">
              <Button variant="outline">Clear</Button>
            </Link>
          </div>
        </div>

        {/* Results */}
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
          <>
            <p className="text-muted-foreground mb-6">
              Found {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''}
              {query && ` for "${query}"`}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant: any) => (
                <Link
                  key={restaurant.id}
                  href={`/restaurant/${restaurant.id}`}
                  className="bg-card rounded-lg overflow-hidden hover:shadow-lg transition-shadow group border border-border"
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
                        Fee: ${restaurant.deliveryFee || 0}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              {query
                ? `No restaurants found for "${query}"`
                : 'No restaurants available'}
            </p>
            <Link href="/">
              <Button>Browse All Restaurants</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <SearchContent />
    </Suspense>
  )
}
