'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ShoppingCart, Filter, X } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  categoryId: string
  name: string
  price: number | string
  description?: string
  stockQuantity: number
  isAvailable: boolean
}

interface Category {
  id: string
  name: string
}

interface CartItem {
  productId: string
  productName: string
  price: number | string
  quantity: number
}

export default function HotelOrderingPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
        ])

        if (productsRes.ok) {
          const data = await productsRes.json()
          setProducts(data.filter((p: Product) => p.isAvailable))
        }

        if (categoriesRes.ok) {
          const data = await categoriesRes.json()
          setCategories(data)
          if (data.length > 0) {
            setSelectedCategory(data[0].id)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredProducts = products.filter((product) => {
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleAddToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.productId === product.id)

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: 1,
        },
      ])
    }
  }

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId))
  }

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId)
    } else {
      setCart(
        cart.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      )
    }
  }

  const totalPrice = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  )

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty!')
      return
    }

    try {
      const response = await fetch('/api/hotel/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          totalAmount: totalPrice,
        }),
      })

      if (response.ok) {
        const order = await response.json()
        alert(`Order placed successfully! Order ID: ${order.orderNumber}`)
        setCart([])
        setShowCart(false)
      } else {
        alert('Failed to place order')
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Error placing order')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/hotel" className="flex items-center gap-2 font-bold text-xl">
            <span className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 shadow">
              <Image src="/logo.jpg" alt="Oyru" fill className="object-cover" sizes="32px" />
            </span>
            <span>Hotel Ordering</span>
          </Link>
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-semibold">{cart.length}</span>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-white text-xs flex items-center justify-center rounded-full">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Order Products</h1>
          <p className="text-muted-foreground">Browse and order items for your hotel</p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${selectedCategory === ''
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Products Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 border border-border rounded-lg bg-card">
                <p className="text-muted-foreground">No products available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-card"
                  >
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      <div className="text-4xl font-bold text-muted-foreground opacity-20">
                        {product.name.charAt(0)}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-1 line-clamp-1">{product.name}</h3>
                      {product.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-2xl font-bold text-primary">
                            {Number(product.price).toFixed(2)} Birr
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.stockQuantity} in stock
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stockQuantity === 0}
                        className={`w-full py-2 rounded-lg font-medium transition-colors ${product.stockQuantity === 0
                          ? 'bg-muted text-muted-foreground cursor-not-allowed'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90'
                          }`}
                      >
                        {product.stockQuantity === 0
                          ? 'Out of Stock'
                          : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <div
              className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${showCart ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              onClick={() => setShowCart(false)}
            ></div>

            <div
              className={`fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-50 overflow-y-auto transition-transform lg:relative lg:max-w-none lg:w-auto lg:h-auto lg:static lg:border-l lg:border-border lg:rounded-lg lg:p-6 ${showCart
                ? 'translate-x-0'
                : 'translate-x-full lg:translate-x-0'
                }`}
            >
              {/* Mobile Close Button */}
              <div className="lg:hidden p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-bold text-lg">Shopping Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-muted rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Desktop Title */}
              <h2 className="hidden lg:block font-bold text-lg mb-6">Shopping Cart</h2>

              {cart.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3 mb-4 pb-4 border-b border-border">
                    {cart.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between text-sm">
                        <div className="flex-1">
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            {Number(item.price).toFixed(2)} Birr
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                item.productId,
                                item.quantity - 1
                              )
                            }
                            className="px-2 py-1 border border-border rounded hover:bg-muted"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                item.productId,
                                item.quantity + 1
                              )
                            }
                            className="px-2 py-1 border border-border rounded hover:bg-muted"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveFromCart(item.productId)}
                          className="p-1 text-destructive hover:bg-destructive/10 rounded ml-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="space-y-2 mb-4 pb-4 border-b border-border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-semibold">
                        {totalPrice.toFixed(2)} Birr
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-primary">{totalPrice.toFixed(2)} Birr</span>
                    </div>
                  </div>

                  {/* Order Button */}
                  <button
                    onClick={handlePlaceOrder}
                    className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-semibold transition-colors"
                  >
                    Place Order
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
