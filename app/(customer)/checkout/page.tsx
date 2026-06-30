'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/lib/contexts/cart-context'
import { createProductOrder } from '@/app/actions/product-orders'
import { ArrowLeft, CheckCircle2, CreditCard, MapPin, Phone, Truck } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, clearCart, getCartTotal } = useCart()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    deliveryAddress: '',
    deliveryCity: '',
    phoneNumber: '',
    specialInstructions: '',
  })

  useEffect(() => {
    const getUser = async () => {
      try {
        const headers = new Headers()
        const response = await fetch('/api/auth/get-session', {
          headers,
        })
        if (response.ok) {
          const session = await response.json()
          if (!session?.user) {
            router.push('/sign-in')
            return
          }
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mb-4"></div>
      </div>
    )
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-6">
          <Truck className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-3xl font-extrabold mb-4">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8 text-lg">Add items to your cart to proceed with checkout.</p>
        <Link
          href="/"
          className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-full hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
        >
          Continue Shopping
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
    setOrderError(null)

    if (!formData.deliveryAddress || !formData.deliveryCity || !formData.phoneNumber) {
      setOrderError('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const totalAmount = getCartTotal()
      const result = await createProductOrder({
        items: cart.items,
        totalAmount,
        deliveryAddress: formData.deliveryAddress,
        deliveryCity: formData.deliveryCity,
        customerPhoneNumber: formData.phoneNumber,
        specialInstructions: formData.specialInstructions,
      })

      if (result.success) {
        clearCart()
        router.push(`/order-confirmation/${result.orderId}`)
      } else {
        setOrderError('Failed to place order: ' + result.message)
      }
    } catch (error) {
      console.error('Error placing order:', error)
      setOrderError('An error occurred while placing your order')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = getCartTotal()
  const deliveryFee = 0 // Keeping it 0 to match cart display
  const tax = 0 // Keeping it 0 to match cart display
  const total = subtotal + deliveryFee + tax

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card border-b border-border/50 sticky top-0 z-40 backdrop-blur-xl bg-card/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 font-semibold">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Cart</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-extrabold mb-8 text-foreground">Secure Checkout</h1>

        <div className="grid lg:grid-cols-12 gap-10">

          {/* Form Section */}
          <div className="lg:col-span-7 space-y-8 animate-in slide-in-from-left-8 fade-in duration-700">
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Delivery Details</h2>
              </div>

              <div className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-semibold mb-2 text-foreground group-focus-within:text-primary transition-colors">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={handleInputChange}
                    placeholder="E.g. House No. 123, Street 4"
                    className="w-full px-5 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-semibold mb-2 text-foreground group-focus-within:text-primary transition-colors">
                      City *
                    </label>
                    <input
                      type="text"
                      name="deliveryCity"
                      value={formData.deliveryCity}
                      onChange={handleInputChange}
                      placeholder="E.g. Addis Ababa"
                      className="w-full px-5 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                      required
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold mb-2 text-foreground flex items-center gap-2 group-focus-within:text-primary transition-colors">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="+251..."
                        className="w-full pl-12 pr-5 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold mb-2 text-foreground group-focus-within:text-primary transition-colors">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleInputChange}
                    placeholder="Any landmarks or instructions for the driver?"
                    rows={3}
                    className="w-full px-5 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm resize-none"
                  />
                </div>
              </div>
            </form>

            <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Payment Method</h2>
              </div>

              <div className="p-4 border-2 border-primary bg-primary/5 rounded-2xl flex items-center gap-3 cursor-pointer">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                <span className="font-bold text-foreground">Cash on Delivery</span>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-6 sm:p-8 sticky top-28 shadow-2xl shadow-primary/5 animate-in slide-in-from-right-8 fade-in duration-700">
              <h2 className="text-xl font-extrabold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-4 bg-background/50 p-3 rounded-xl">
                    <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs">No img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{item.name}</p>
                      <p className="text-muted-foreground text-sm">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-bold shrink-0">
                      {(item.price * item.quantity).toFixed(2)} Birr
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-dashed border-border mb-6">
                <div className="flex justify-between text-muted-foreground font-medium">
                  <span>Subtotal</span>
                  <span className="text-foreground">{subtotal.toFixed(2)} Birr</span>
                </div>
                <div className="flex justify-between text-muted-foreground font-medium">
                  <span>Delivery Fee</span>
                  <span className="text-green-500 font-bold">Free</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8 pt-6 border-t border-border">
                <span className="font-extrabold text-lg">Total</span>
                <span className="text-3xl font-black text-primary">{total.toFixed(2)} Birr</span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  'Place Order Now'
                )}
              </button>

              {orderError && (
                <p className="mt-3 text-sm text-destructive font-medium text-center bg-destructive/10 px-4 py-2 rounded-xl">
                  {orderError}
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
