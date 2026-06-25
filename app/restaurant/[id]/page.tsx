'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { fetchRestaurant, fetchRestaurantCategories, fetchRestaurantDishes } from '@/app/actions/restaurants'
import { useCart } from '@/lib/contexts/cart-context'
import { Button } from '@/components/ui/button'
import { ShoppingCart, ArrowLeft } from 'lucide-react'

export default function RestaurantPage() {
  const params = useParams()
  const router = useRouter()
  const restaurantId = params.id as string
  const { addToCart, updateQuantity, cart, getItemCount } = useCart()

  const [restaurant, setRestaurant] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [dishes, setDishes] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const restaurantData = await fetchRestaurant(restaurantId)
        if (!restaurantData) {
          router.push('/')
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

  const getItemQuantity = (dishId: string): number => {
    const item = cart.items.find(i => i.productId === dishId)
    return item ? item.quantity : 0
  }

  const getTotalPrice = () => {
    return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-secondary rounded-lg"></div>
            <div className="h-12 bg-secondary rounded w-1/3"></div>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-secondary rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">Restaurant not found</p>
          <Link href="/"><Button>Back to Home</Button></Link>
        </div>
      </div>
    )
  }

  const itemCount = getItemCount()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          {itemCount > 0 && (
            <Link href="/cart">
              <div className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full">
                <ShoppingCart className="w-4 h-4" />
                <span className="font-semibold">{itemCount}</span>
              </div>
            </Link>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-8 mb-6">
            <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
            <p className="text-muted-foreground mb-4">{restaurant.description}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1">
                <span className="text-primary font-semibold">{restaurant.deliveryTime || 30}</span>
                <span className="text-muted-foreground">min delivery</span>
              </span>
              <span className="text-muted-foreground">Delivery Fee: ${restaurant.deliveryFee || 0}</span>
              <span className="text-muted-foreground">Min Order: ${restaurant.minOrderAmount || 0}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {categories.length > 0 && (
              <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
                {categories.map((category: any) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${selectedCategory === category.id
                        ? 'bg-primary text-white'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                      }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}

            <div className="grid gap-4">
              {dishes.map((dish: any) => {
                const qty = getItemQuantity(dish.id)
                return (
                  <div key={dish.id} className="bg-card border border-border rounded-lg p-4 flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{dish.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{dish.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">${dish.price}</span>
                        {dish.preparationTime && (
                          <span className="text-xs text-muted-foreground">{dish.preparationTime} min prep</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {qty > 0 && (
                        <button
                          onClick={() => updateQuantity(dish.id, qty - 1)}
                          className="px-2 py-1 bg-secondary rounded hover:bg-secondary/80"
                        >
                          −
                        </button>
                      )}
                      {qty > 0 && <span className="px-2 font-semibold">{qty}</span>}
                      <button
                        onClick={() => addToCart({ productId: dish.id, name: dish.name, price: parseFloat(dish.price), image: dish.imageUrl })}
                        className="px-3 py-1 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-20">
              <h2 className="font-bold text-xl mb-6">Order Summary</h2>
              {cart.items.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                    {cart.items.map((item) => (
                      <div key={item.productId} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.name} x{item.quantity}</span>
                        <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border pt-4 mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">${getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="font-semibold">${(parseFloat(restaurant.deliveryFee) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">${(getTotalPrice() + (parseFloat(restaurant.deliveryFee) || 0)).toFixed(2)}</span>
                    </div>
                  </div>
                  <Link href="/checkout">
                    <Button className="w-full">Proceed to Checkout</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
