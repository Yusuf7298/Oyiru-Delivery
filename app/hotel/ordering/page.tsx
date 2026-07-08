'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ShoppingCart, X, Plus, Minus, AlertTriangle, Star, Package } from 'lucide-react'
import { submitB2BOrder } from '@/app/actions/b2b-orders'

interface Product {
  id: string
  categoryId: string
  name: string
  price: number | string
  defaultPrice: number | string
  description?: string
  stockQuantity: number
  isAvailable: boolean
  unit?: string
  isAgreed: boolean
}

interface CartItem {
  productId: string
  productName: string
  price: number | string
  quantity: number
  isAgreed: boolean
}

export default function HotelOrderingPage() {
  const [agreedProducts, setAgreedProducts] = useState<Product[]>([])
  const [otherProducts, setOtherProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [hotelAddress, setHotelAddress] = useState<string>('')
  const [hasAddress, setHasAddress] = useState(true)
  const [hasAgreements, setHasAgreements] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showOther, setShowOther] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/hotel/agreements'),
      fetch('/api/categories'),
    ]).then(async ([agrRes, catRes]) => {
      if (agrRes.ok) {
        const d = await agrRes.json()
        setAgreedProducts(d.agreedProducts || [])
        setOtherProducts(d.otherProducts || [])
        setHotelAddress(d.hotelAddress || '')
        setHasAddress(d.hasAddress)
        setHasAgreements(d.hasAgreements)
      }
      if (catRes.ok) setCategories(await catRes.json())
    }).catch(console.error).finally(() => setIsLoading(false))
  }, [])

  const filterProducts = (list: Product[]) =>
    list.filter(p => {
      const matchCat = !selectedCategory || p.categoryId === selectedCategory
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchSearch
    })

  const addToCart = (product: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.productId === product.id)
      if (ex) return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { productId: product.id, productName: product.name, price: product.price, quantity: 1, isAgreed: product.isAgreed }]
    })
  }

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) setCart(c => c.filter(i => i.productId !== productId))
    else setCart(c => c.map(i => i.productId === productId ? { ...i, quantity: qty } : i))
  }

  const cartQty = (id: string) => cart.find(i => i.productId === id)?.quantity || 0
  const total = cart.reduce((s, i) => s + Number(i.price) * i.quantity, 0)

  const handlePlaceOrder = async () => {
    if (cart.length === 0) { setError('Your cart is empty.'); return }
    if (!hasAddress) { setError('Please set your delivery address in Settings first.'); return }

    setPlacing(true)
    setError(null)
    try {
      const res = await fetch('/api/hotel/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(i => ({ productId: i.productId, quantity: i.quantity })),
          // address is auto-used from hotel account server-side
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const orderId = data.order?.id
        if (orderId) {
          const submitRes = await submitB2BOrder(orderId)
          if (submitRes.success) {
            setSuccess(`Order #${data.order?.orderNumber} submitted! Admin will review shortly.`)
          } else {
            setSuccess(`Order #${data.order?.orderNumber} created. Go to My Orders to submit.`)
          }
        } else {
          setSuccess('Order placed successfully!')
        }
        setCart([])
        setShowCart(false)
      } else {
        const e = await res.json()
        setError(e.error || 'Failed to place order')
      }
    } catch {
      setError('Error placing order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  const ProductCard = ({ product }: { product: Product }) => {
    const qty = cartQty(product.id)
    return (
      <div className={`border rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-card ${product.isAgreed ? 'border-primary/30' : 'border-border'}`}>
        <div className="aspect-video bg-muted flex items-center justify-center relative">
          {product.isAgreed && (
            <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" /> Agreed Price
            </span>
          )}
          <Package className="w-8 h-8 text-muted-foreground opacity-30" />
        </div>
        <div className="p-4">
          <h3 className="font-semibold mb-1 line-clamp-1">{product.name}</h3>
          {product.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{product.description}</p>}
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-lg font-bold text-primary">{Number(product.price).toFixed(2)} Birr/{product.unit || 'kg'}</p>
              {product.isAgreed && Number(product.price) !== Number(product.defaultPrice) && (
                <p className="text-xs text-muted-foreground line-through">{Number(product.defaultPrice).toFixed(2)} Birr</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{product.stockQuantity} in stock</p>
          </div>

          {product.stockQuantity === 0 ? (
            <div className="w-full py-2.5 rounded-lg bg-muted text-muted-foreground text-sm font-medium text-center">Out of Stock</div>
          ) : qty === 0 ? (
            <button onClick={() => addToCart(product)} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
              Add to Cart
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => updateQty(product.id, qty - 1)} className="w-8 h-8 flex items-center justify-center border border-border rounded-lg hover:bg-muted"><Minus className="w-3 h-3" /></button>
              <input type="number" min="1" value={qty} onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v > 0) updateQty(product.id, v) }}
                className="flex-1 text-center text-sm font-bold border border-border rounded-lg py-1.5 focus:outline-none focus:ring-1 focus:ring-primary" />
              <button onClick={() => updateQty(product.id, qty + 1)} className="w-8 h-8 flex items-center justify-center border border-border rounded-lg hover:bg-muted"><Plus className="w-3 h-3" /></button>
              <span className="text-xs text-muted-foreground w-6">{product.unit || 'kg'}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Toasts */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-destructive text-destructive-foreground px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 max-w-md">
          <span className="text-sm font-medium">{error}</span>
          <button onClick={() => setError(null)} className="ml-2 opacity-70 hover:opacity-100">✕</button>
        </div>
      )}
      {success && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 max-w-md">
          <span className="text-sm font-medium">{success}</span>
          <button onClick={() => setSuccess(null)} className="ml-2 opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/hotel" className="flex items-center gap-2 font-bold text-xl">
            <span className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 shadow">
              <Image src="/logo.jpg" alt="Oyru" fill className="object-cover" sizes="32px" />
            </span>
            <span>Place Order</span>
          </Link>
          <button onClick={() => setShowCart(!showCart)} className="relative flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-semibold">{cart.reduce((s, i) => s + i.quantity, 0)} kg</span>
            {cart.length > 0 && <span className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-white text-xs flex items-center justify-center rounded-full">{cart.length}</span>}
          </button>
        </div>
      </header>

      {/* Address warning */}
      {!hasAddress && !isLoading && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3 text-yellow-800">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-yellow-600" />
            <span className="text-sm font-medium">No delivery address saved. <Link href="/hotel/settings" className="underline font-bold">Go to Settings</Link> to add your address before placing orders.</span>
          </div>
        </div>
      )}
      {hasAddress && hotelAddress && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-sm text-primary flex items-center gap-2">
            <span className="font-semibold">Delivering to:</span> {hotelAddress}
            <Link href="/hotel/settings" className="ml-auto text-xs underline text-muted-foreground">Change</Link>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search + filter */}
        <div className="mb-6 space-y-3">
          <input type="text" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[{ id: '', name: 'All' }, ...categories].map(cat => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${selectedCategory === cat.id ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Products */}
            <div className="lg:col-span-3 space-y-8">
              {/* Agreed products */}
              {filterProducts(agreedProducts).length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-primary fill-primary" />
                    <h2 className="text-xl font-bold">Your Agreed Products</h2>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">{filterProducts(agreedProducts).length} items</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {filterProducts(agreedProducts).map(p => <ProductCard key={p.id} product={p} />)}
                  </div>
                </div>
              )}

              {/* Other products */}
              {filterProducts(otherProducts).length > 0 && (
                <div>
                  <button onClick={() => setShowOther(s => !s)} className="flex items-center gap-2 mb-4 group">
                    <h2 className="text-xl font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                      Other Products
                    </h2>
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{filterProducts(otherProducts).length}</span>
                    <span className="text-xs text-muted-foreground ml-1">{showOther ? '▲ Hide' : '▼ Show'}</span>
                  </button>
                  {showOther && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {filterProducts(otherProducts).map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                  )}
                </div>
              )}

              {filterProducts(agreedProducts).length === 0 && filterProducts(otherProducts).length === 0 && (
                <div className="text-center py-20 text-muted-foreground">No products match your search.</div>
              )}
            </div>

            {/* Cart sidebar */}
            <div className="lg:col-span-1">
              <div onClick={() => setShowCart(false)} className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${showCart ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
              <div className={`fixed right-0 top-0 h-full w-full max-w-sm bg-card border-l border-border z-50 overflow-y-auto transition-transform lg:sticky lg:top-20 lg:max-w-none lg:w-auto lg:h-auto lg:translate-x-0 lg:border lg:rounded-2xl lg:overflow-hidden ${showCart ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4 lg:hidden">
                    <h2 className="font-bold text-lg">Cart</h2>
                    <button onClick={() => setShowCart(false)}><X className="w-5 h-5" /></button>
                  </div>
                  <h2 className="hidden lg:block font-bold text-lg mb-5">Cart</h2>

                  {cart.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">Empty</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 mb-4 max-h-80 overflow-y-auto pr-1">
                        {cart.map(item => (
                          <div key={item.productId} className="flex items-start gap-2 text-sm">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-xs truncate">{item.productName}</p>
                              <p className="text-xs text-muted-foreground">{Number(item.price).toFixed(2)} Birr × {item.quantity} kg</p>
                              <p className="text-xs font-semibold text-primary">{(Number(item.price) * item.quantity).toFixed(2)} Birr</p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center border border-border rounded text-xs hover:bg-muted"><Minus className="w-2.5 h-2.5" /></button>
                              <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                              <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center border border-border rounded text-xs hover:bg-muted"><Plus className="w-2.5 h-2.5" /></button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-border pt-3 mb-4">
                        <div className="flex justify-between text-sm font-bold">
                          <span>Total</span>
                          <span className="text-primary">{total.toFixed(2)} Birr</span>
                        </div>
                        {hotelAddress && <p className="text-xs text-muted-foreground mt-1.5 truncate">📍 {hotelAddress}</p>}
                      </div>

                      <button onClick={handlePlaceOrder} disabled={placing || !hasAddress}
                        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {placing ? 'Placing...' : !hasAddress ? 'Set address first' : 'Place Order'}
                      </button>
                      {!hasAddress && (
                        <Link href="/hotel/settings" className="block text-center text-xs text-primary underline mt-2">→ Go to Settings</Link>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
