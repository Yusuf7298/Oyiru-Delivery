'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useCart } from '@/lib/contexts/cart-context'
import { createOrder } from '@/app/actions/orders'
import { Button } from '@/components/ui/button'

const WebApp = typeof window !== 'undefined' ? require('@twa-dev/sdk').default : null

export default function TelegramCheckout() {
  const router = useRouter()
  const { cart, clearCart, getCartTotal } = useCart()
  const [loading, setLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    deliveryAddress: '',
    deliveryCity: '',
    phoneNumber: '',
    specialInstructions: '',
  })

  useEffect(() => {
    setIsMounted(true)
    if (typeof window !== 'undefined' && WebApp) {
      try {
        WebApp.ready()
        WebApp.expand()
        
        // Get user from Telegram
        const twaUser = (WebApp as any).initDataUnsafe?.user
        if (twaUser) {
          setUser(twaUser)
          setFormData((prev) => ({
            ...prev,
            phoneNumber: twaUser.phone_number || '',
          }))
        }
      } catch (error) {
        console.error('Error initializing Telegram WebApp:', error)
      }
    }
  }, [])

  if (!cart.restaurantId || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-bold mb-2 text-center">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6 text-center">
          Add items to your cart to proceed with checkout.
        </p>
        <Link href="/twa" className="w-full">
          <Button className="w-full">Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.deliveryAddress ||
      !formData.deliveryCity ||
      !formData.phoneNumber
    ) {
      WebApp.showAlert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const totalAmount = getCartTotal()
      const orderData = {
        restaurantId: cart.restaurantId!,
        items: cart.items,
        totalAmount,
        deliveryAddress: formData.deliveryAddress,
        deliveryCity: formData.deliveryCity,
        customerPhoneNumber: formData.phoneNumber,
        specialInstructions: formData.specialInstructions,
      }

      const result = await createOrder(orderData)

      if (result.success) {
        clearCart()
        WebApp.showAlert('Order placed successfully!')
        router.push(`/twa/orders/${result.orderId}`)
      } else {
        WebApp.showAlert('Failed to place order: ' + result.error)
      }
    } catch (error) {
      console.error('Error placing order:', error)
      WebApp.showAlert('An error occurred while placing your order')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = getCartTotal()
  const deliveryFee = 5
  const tax = subtotal * 0.05
  const total = subtotal + deliveryFee + tax

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-card border-b border-border py-4 px-4">
        <div className="flex items-center gap-4">
          <Link href="/twa" className="text-primary font-semibold">
            ← Back
          </Link>
          <h1 className="text-lg font-bold">Checkout</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Order Summary */}
        <div className="bg-card rounded-lg border border-border p-4">
          <h2 className="font-semibold mb-4">Order Summary</h2>

          <div className="space-y-2 mb-4 pb-4 border-b border-border">
            {cart.items.map((item) => (
              <div
                key={item.dishId}
                className="flex items-center justify-between text-sm"
              >
                <span>
                  {item.dishName} x{item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tax (5%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between font-bold">
            <span>Total</span>
            <span className="text-primary text-lg">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Delivery Form */}
        <form onSubmit={handlePlaceOrder} className="space-y-4">
          <div>
            <h2 className="font-semibold mb-3">Delivery Address</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleInputChange}
                  placeholder="Enter delivery address"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="deliveryCity"
                  value={formData.deliveryCity}
                  onChange={handleInputChange}
                  placeholder="Enter city"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleInputChange}
                  placeholder="Any special requests?"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-semibold"
          >
            {loading ? 'Placing Order...' : `Place Order - $${total.toFixed(2)}`}
          </Button>

          <Link href="/twa" className="block">
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </form>
      </div>
    </div>
  )
}
