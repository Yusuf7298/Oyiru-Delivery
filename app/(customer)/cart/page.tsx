'use client'

import Link from 'next/link'
import { useCart } from '@/lib/contexts/cart-context'
import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart, Receipt, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart()
  const [isHydrated, setIsHydrated] = useState(false)
  const total = getCartTotal()

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Show loading state during hydration
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mb-4"></div>
      </div>
    )
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
        <div className="z-10 flex flex-col items-center animate-in slide-in-from-bottom-8 fade-in duration-700">
          <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <ShoppingCart className="w-16 h-16 text-primary opacity-80" />
          </div>
          <h1 className="text-4xl font-extrabold text-foreground mb-4">Your cart is empty</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-md text-center">Looks like you haven't added anything yet. Let's find something great!</p>
          <Link
            href="/"
            className="px-8 py-4 font-bold text-lg bg-primary text-primary-foreground rounded-full hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border/50 sticky top-0 z-40 backdrop-blur-xl bg-card/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-semibold group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Continue Shopping</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-foreground">Shopping Cart</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cart.items.map((item, index) => (
                <div
                  key={item.productId}
                  className="bg-card border border-border/50 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-sm hover:shadow-md transition-shadow animate-in slide-in-from-bottom-4 fade-in duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Product Image */}
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden bg-muted/30 border border-border/50 group">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ShoppingCart className="w-8 h-8 opacity-50" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground text-xl mb-1">{item.name}</h3>
                      <p className="text-primary font-extrabold text-xl">
                        {(item.price * item.quantity).toFixed(2)} Birr
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{item.price.toFixed(2)} Birr each</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="flex items-center bg-background border border-border/50 rounded-xl shadow-sm overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-3 hover:bg-muted transition-colors text-foreground"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-bold text-lg bg-muted/10 py-2">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-3 hover:bg-muted transition-colors text-foreground"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="p-3 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Clear Cart Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={clearCart}
                className="px-6 py-3 text-sm font-bold text-destructive bg-destructive/10 border border-destructive/20 rounded-full hover:bg-destructive hover:text-white transition-colors"
              >
                Clear Entire Cart
              </button>
            </div>
          </div>

          {/* Order Summary Panel */}
          <div className="lg:col-span-1">
            <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 sticky top-32 shadow-2xl shadow-primary/5 animate-in slide-in-from-right-8 fade-in duration-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Receipt className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-extrabold text-foreground">Order Summary</h2>
              </div>

              {/* Summary Details */}
              <div className="space-y-4 mb-8 pb-8 border-b border-dashed border-border">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="font-medium">Subtotal ({cart.items.length} items)</span>
                  <span className="font-semibold text-foreground">{total.toFixed(2)} Birr</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="font-medium">Delivery Fee</span>
                  <span className="font-bold text-green-500">Free</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="font-medium">Tax</span>
                  <span className="font-semibold text-foreground">0.00 Birr</span>
                </div>
              </div>

              {/* Total */}
              <div className="mb-8 flex justify-between items-end">
                <span className="font-extrabold text-foreground text-lg">Total Amount</span>
                <span className="text-4xl font-black text-primary">
                  {total.toFixed(2)} Birr
                </span>
              </div>

              {/* Checkout Button */}
              <div className="space-y-4">
                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 font-bold text-lg"
                >
                  Proceed to Checkout
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </Link>
              </div>

              {/* Secure Checkout Badge */}
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground font-medium">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                Secure & Encrypted Checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
