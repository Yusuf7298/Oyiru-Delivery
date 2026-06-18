'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchRestaurants } from '@/app/actions/restaurants'
import { useCart } from '@/lib/contexts/cart-context'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Home, User } from 'lucide-react'

const WebApp = typeof window !== 'undefined' ? require('@twa-dev/sdk').default : null

export default function TelegramHome() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const { getItemCount } = useCart()

  useEffect(() => {
    // Initialize Telegram
    if (typeof window !== 'undefined' && WebApp) {
      try {
        WebApp.ready()
        WebApp.expand()
        WebApp.disableVerticalSwipes()
      } catch (error) {
        console.error('Error initializing Telegram WebApp:', error)
      }
    }

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
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card border-b border-border py-4 px-4">
        <h1 className="text-xl font-bold">Oyru Delivery</h1>
        <p className="text-xs text-muted-foreground">Order from your favorite restaurants</p>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-secondary rounded-lg h-24 animate-pulse"></div>
            ))}
          </div>
        ) : restaurants.length > 0 ? (
          restaurants.map((restaurant: any) => (
            <Link
              key={restaurant.id}
              href={`/twa/restaurant/${restaurant.id}`}
              className="block bg-card border border-border rounded-lg p-4 hover:bg-secondary transition-colors active:scale-95"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-base mb-1">{restaurant.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {restaurant.description || 'Delicious food and great service'}
                  </p>
                </div>
                <div className="text-right ml-2">
                  <div className="text-sm font-semibold text-primary">{restaurant.deliveryTime || 30}m</div>
                  <div className="text-xs text-muted-foreground">${restaurant.deliveryFee || 0}</div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No restaurants available</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex items-center justify-around h-16">
        <Link
          href="/twa"
          className="flex flex-col items-center justify-center gap-1 flex-1 h-full hover:bg-secondary/50 active:bg-secondary"
        >
          <Home className="w-5 h-5" />
          <span className="text-xs font-medium">Home</span>
        </Link>
        <Link
          href="/twa/cart"
          className="flex flex-col items-center justify-center gap-1 flex-1 h-full hover:bg-secondary/50 active:bg-secondary relative"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-xs font-medium">Cart</span>
          {getItemCount() > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {getItemCount()}
            </span>
          )}
        </Link>
        <Link
          href="/twa/profile"
          className="flex flex-col items-center justify-center gap-1 flex-1 h-full hover:bg-secondary/50 active:bg-secondary"
        >
          <User className="w-5 h-5" />
          <span className="text-xs font-medium">Profile</span>
        </Link>
      </div>
    </div>
  )
}
