'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { fetchRestaurant, fetchRestaurantCategories, fetchRestaurantDishes } from '@/app/actions/restaurants'
import { createOrder } from '@/app/actions/orders'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Minus } from 'lucide-react'

const WebApp = typeof window !== 'undefined' ? require('@twa-dev/sdk').default : null

export default function TelegramRestaurantPage() {
  const params = useParams()
  const router = useRouter()
  const restaurantId = params.id as string

  const [restaurant, setRestaurant] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [dishes, setDishes] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    if (WebApp) {
      try {
        WebApp.ready()
        WebApp.expand()
      } catch (error) {
        console.error('Error initializing Telegram WebApp:', error)
      }
    }

    const loadData = async () => {
      try {
        const restaurantData = await fetchRestaurant(restaurantId)
        if (!restaurantData) {
          router.push('/twa')
          return
        }
        setRestaurant(restaurantData)

        const categoriesData = await fetchRestaurantCategories(restaurantId)
        setCategories(categoriesData)

        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0].id)
          const dishesData = await fetchRestaurantDishes(restaurantId, categoriesData[0].id)
          setDishes(dishesData)
        }
      } catch (error) {
        console.error('Error loading restaurant:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [restaurantId, router])

  const handleCategoryChange = async (categoryId: string) => {
    setSelectedCategory(categoryId)
    const dishesData = await fetchRestaurantDishes(restaurantId, categoryId)
    setDishes(dishesData)
  }

  const handleAddToCart = (dishId: string) => {
    const newCart = new Map(cart)
    newCart.set(dishId, (newCart.get(dishId) || 0) + 1)
    setCart(newCart)
  }

  const handleRemoveFromCart = (dishId: string) => {
    const newCart = new Map(cart)
    const quantity = newCart.get(dishId) || 0
    if (quantity > 1) {
      newCart.set(dishId, quantity - 1)
    } else {
      newCart.delete(dishId)
    }
    setCart(newCart)
  }

  const getTotalPrice = () => {
    let total = 0
    for (const [dishId, quantity] of cart.entries()) {
      const dish = dishes.find((d: any) => d.id === dishId)
      if (dish) {
        total += parseFloat(dish.price) * quantity
      }
    }
    return total
  }

  const handleCheckout = async () => {
    if (cart.size === 0) {
      WebApp.showAlert('Please add items to your cart')
      return
    }

    setPlacing(true)
    const items = Array.from(cart.entries()).map(([dishId, quantity]) => ({
      dishId,
      quantity,
    }))

    try {
      await createOrder({
        restaurantId,
        items,
        deliveryAddress: '123 Main St',
        deliveryCity: 'City',
      })
      setCart(new Map())
      WebApp.showAlert('Order placed successfully!')
      router.push('/twa')
    } catch (error) {
      console.error('Error creating order:', error)
      WebApp.showAlert('Error placing order')
    } finally {
      setPlacing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 py-6 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-secondary rounded-lg h-20 animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Restaurant not found</p>
          <Link href="/twa">
            <Button>Back</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border py-3 px-4 flex items-center gap-3">
        <Link href="/twa" className="hover:text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="font-bold text-base">{restaurant.name}</h1>
          <p className="text-xs text-muted-foreground">{restaurant.deliveryTime || 30}m delivery</p>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            {categories.map((category: any) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-3 py-1 rounded-full whitespace-nowrap text-sm transition-colors ${selectedCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-secondary text-foreground'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {/* Dishes */}
        <div className="space-y-3">
          {dishes.map((dish: any) => (
            <div
              key={dish.id}
              className="bg-card border border-border rounded-lg p-3 flex justify-between items-start gap-3"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{dish.name}</h3>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{dish.description}</p>
                <span className="text-sm font-bold text-primary">${dish.price}</span>
              </div>
              <div className="flex items-center gap-2">
                {cart.has(dish.id) && (
                  <button
                    onClick={() => handleRemoveFromCart(dish.id)}
                    className="p-1 bg-secondary rounded hover:bg-secondary/80"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
                {cart.has(dish.id) && (
                  <span className="px-2 font-semibold text-sm">{cart.get(dish.id)}</span>
                )}
                <button
                  onClick={() => handleAddToCart(dish.id)}
                  className="p-1 bg-primary text-white rounded hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Bar */}
      {cart.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Total:</span>
            <span className="text-lg font-bold text-primary">
              ${(getTotalPrice() + parseFloat(restaurant.deliveryFee || 0)).toFixed(2)}
            </span>
          </div>
          <Button
            onClick={handleCheckout}
            disabled={placing}
            className="w-full"
          >
            {placing ? 'Placing...' : 'Place Order'}
          </Button>
        </div>
      )}
    </div>
  )
}
