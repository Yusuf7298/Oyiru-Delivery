'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, ArrowLeft, Minus, Plus } from 'lucide-react'
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

    // Add to cart using the context
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading product...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error || 'Product not found'}</p>
        <Link href="/" className="text-primary hover:underline">
          Back to home
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            <span className="font-bold text-lg">Oyru</span>

            <Link
              href="/cart"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline">Cart</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="flex items-center justify-center bg-muted rounded-lg aspect-square overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center text-muted-foreground">
                <span>No image available</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">{product.name}</h1>
              {product.description && (
                <p className="text-muted-foreground text-lg">{product.description}</p>
              )}
            </div>

            {/* Price */}
            <div className="border-t border-b border-border py-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary">
                  ₹{Number(product.price).toFixed(2)}
                </span>
                {product.stock !== undefined && (
                  <span className="text-sm text-muted-foreground">
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-foreground font-semibold">Quantity:</span>
              <div className="flex items-center gap-2 border border-border rounded-lg p-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 hover:bg-muted rounded transition-colors"
                  disabled={quantity === 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-5 h-5" />
              {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
            </button>

            {addedToCart && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">✓ Added to cart successfully</p>
              </div>
            )}

            {/* Go to Cart Link */}
            <Link
              href="/cart"
              className="text-primary hover:underline text-center font-semibold"
            >
              View Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
