'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/lib/contexts/cart-context'
import { auth } from '@/lib/auth'
import { createOrder } from '@/app/actions/orders'
import { Button } from '@/components/ui/button'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, clearCart, getCartTotal } = useCart()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    deliveryAddress: '',
    deliveryCity: '',
    phoneNumber: '',
    specialInstructions: '',
  })

  useEffect(() => {
    const getUser = async () => {
      try {
        // Get session from auth
        const headers = new Headers()
        const response = await fetch('/api/auth/get-session', {
          headers,
        })
        if (response.ok) {
          const session = await response.json()
          setUser(session.user)
          setFormData((prev) => ({
            ...prev,
            phoneNumber: session.user?.phone || '',
          }))
        } else {
          router.push('/sign-in')
        }
      } catch (error) {
        console.error('Failed to get user:', error)
        router.push('/sign-in')
      }
    }

    getUser()
  }, [router])

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/" className="text-primary font-semibold">
              ← Back
            </Link>
            <h1 className="text-xl font-bold">Checkout</h1>
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">
            Add items to your cart to proceed with checkout.
          </p>
          <Link href="/">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
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
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const totalAmount = getCartTotal()
      const orderData = {
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
        router.push(`/orders/${result.orderId}`)
      } else {
        alert('Failed to place order: ' + result.error)
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert('An error occurred while placing your order')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = getCartTotal()
  const deliveryFee = 5
  const tax = subtotal * 0.05
  const total = subtotal + deliveryFee + tax

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-primary font-semibold">
            ← Back
          </Link>
          <h1 className="text-xl font-bold">Checkout</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="order-2 md:order-1">
            <div className="bg-card rounded-lg border border-border p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-border">
                {cart.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
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

              <div className="pt-4 border-t border-border flex items-center justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Form */}
          <div className="order-1 md:order-2">
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={handleInputChange}
                      placeholder="Enter your delivery address"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary"
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
                      placeholder="Enter your city"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary"
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
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary"
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
                      placeholder="Any special requests or instructions?"
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-lg font-semibold"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </Button>

              <Link href="/">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
