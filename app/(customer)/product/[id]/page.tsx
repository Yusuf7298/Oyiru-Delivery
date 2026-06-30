'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, ArrowLeft, Minus, Plus, Star, Zap, ShieldCheck } from 'lucide-react'
import { useCart } from '@/lib/contexts/cart-context'

interface Product {
  id: string
  name: string
  price: string
  description?: string
  categoryId?: string
  stock?: number
  image?: string
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [addedToCart, setAddedToCart] = useState(false)
  const [productId, setProductId] = useState<string>('')

  useEffect(() => {
    const unwrapParams = async () => {
      const { id } = await params
      setProductId(id)
    }
    unwrapParams()
  }, [params])

  useEffect(() => {
    if (!productId) return
    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/products/${productId}`)

        if (!res.ok) {
          throw new Error('Product not found')
        }

        const data = await res.json()
        setProduct(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  const handleAddToCart = () => {
    if (!product) return

    addToCart({
      productId: product.id,
      name: product.name,
      price: parseFloat(product.price || '0'),
      quantity,
      image: product.image,
      categoryId: product.categoryId,
    })
    setAddedToCart(true)

    setTimeout(() => {
      setAddedToCart(false)
    }, 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground font-medium animate-pulse">Loading product details...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-destructive font-semibold text-lg">{error || 'Product not found'}</p>
        <Link href="/" className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors font-semibold shadow-md">
          Return to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb / Back Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to products</span>
        </button>
      </div>

      {/* Product Details Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Product Image Panel */}
          <div className="relative group w-full bg-card border border-border/50 rounded-3xl overflow-hidden shadow-2xl shadow-primary/5 aspect-square flex items-center justify-center animate-in slide-in-from-left-8 fade-in duration-700">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/30">
                <ShoppingCart className="w-16 h-16 mb-4 opacity-50" />
                <span className="font-medium">No image available</span>
              </div>
            )}
            
            {/* Overlay Gradient for premium feel */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
          </div>

          {/* Product Info Panel */}
          <div className="flex flex-col gap-8 animate-in slide-in-from-right-8 fade-in duration-700">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded-full text-sm font-bold border border-yellow-500/20">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span>4.8 (124 reviews)</span>
                </div>
                {product.stock !== undefined && product.stock > 0 && (
                  <div className="bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-sm font-bold border border-green-500/20">
                    In Stock
                  </div>
                )}
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4 leading-tight">{product.name}</h1>
              {product.description && (
                <p className="text-muted-foreground text-lg leading-relaxed">{product.description}</p>
              )}
            </div>

            {/* Price & Action Card */}
            <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-6 sm:p-8 shadow-xl shadow-primary/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
              
              <div className="flex items-end gap-2 mb-8 relative z-10">
                <span className="text-5xl font-extrabold text-primary">
                  {Number(product.price).toFixed(2)} Birr
                </span>
                <span className="text-muted-foreground font-medium mb-1">/ piece</span>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Zap className="w-4 h-4 text-accent" /> Fast 30m Delivery
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <ShieldCheck className="w-4 h-4 text-green-500" /> Quality Assured
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
                {/* Quantity Selector */}
                <div className="flex items-center justify-between w-full sm:w-auto bg-background border border-border/50 rounded-2xl p-2 shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-muted rounded-xl transition-colors text-foreground"
                    disabled={quantity === 1}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-muted rounded-xl transition-colors text-foreground"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 flex items-center justify-center gap-2 w-full px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg ${
                    addedToCart
                      ? 'bg-green-500 text-white shadow-green-500/20'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-6 h-6" />
                  {addedToCart ? 'Added Successfully!' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
