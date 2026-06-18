'use client'

import Link from 'next/link'
import { useCart } from '@/lib/contexts/cart-context'
import { Button } from '@/components/ui/button'

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart()

  if (!cart.restaurantId || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/" className="text-primary font-semibold">
              ← Back
            </Link>
            <h1 className="text-xl font-bold">Shopping Cart</h1>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">
            Add delicious food from your favorite restaurants
          </p>
          <Link href="/">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  const subtotal = getCartTotal()
  const deliveryFee = 5
  const tax = subtotal * 0.05
  const total = subtotal + deliveryFee + tax

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-primary font-semibold">
            ← Back
          </Link>
          <h1 className="text-xl font-bold">Shopping Cart</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.dishId}
                className="bg-card rounded-lg border border-border p-4 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1">{item.dishName}</h3>
                  {item.specialInstructions && (
                    <p className="text-sm text-muted-foreground">
                      Note: {item.specialInstructions}
                    </p>
                  )}
                  <p className="text-primary font-semibold mt-2">
                    ${item.price.toFixed(2)} each
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item.dishId, item.quantity - 1)}
                    className="w-8 h-8 rounded-lg border border-border hover:bg-secondary flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.dishId, item.quantity + 1)}
                    className="w-8 h-8 rounded-lg border border-border hover:bg-secondary flex items-center justify-center"
                  >
                    +
                  </button>
                </div>

                <div className="text-right min-w-max">
                  <p className="font-semibold mb-2">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.dishId)}
                    className="text-sm text-destructive hover:text-destructive/80"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-card rounded-lg border border-border p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-border">
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

              <div className="flex items-center justify-between font-bold text-lg mb-6">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>

              <Link href="/checkout">
                <Button className="w-full py-3 text-lg font-semibold">
                  Proceed to Checkout
                </Button>
              </Link>

              <button
                onClick={clearCart}
                className="w-full mt-3 py-2 px-4 rounded-lg border border-border text-destructive hover:bg-destructive/10 font-medium"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
