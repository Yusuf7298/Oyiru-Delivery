'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ShoppingCart, Zap, Star, Search, Filter } from 'lucide-react'

interface Category {
  id: string
  name: string
  image?: string
}

interface Product {
  id: string
  categoryId: string
  name: string
  price: number | string
  image?: string
  description?: string
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products'),
        ])

        if (categoriesRes.ok) {
          const data = await categoriesRes.json()
          setCategories(data)
        }

        if (productsRes.ok) {
          const data = await productsRes.json()
          setProducts(data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory && selectedCategory !== 'all' ? p.categoryId === selectedCategory : true;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  })

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-accent/10 to-background border-b border-border/50">
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
          <div className="max-w-2xl animate-in slide-in-from-bottom-6 fade-in duration-700">
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
              Get Everything <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Delivered</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Browse from thousands of products and get them delivered to your doorstep in 30 minutes.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 shadow-sm text-sm font-semibold">
                <Zap className="w-4 h-4 text-primary" />
                <span>Fast delivery</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 shadow-sm text-sm font-semibold">
                <ShoppingCart className="w-4 h-4 text-primary" />
                <span>Wide selection</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Search and Filter Bar */}
        <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-4 shadow-sm mb-10 sticky top-24 z-30">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md group flex-1">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
              />
            </div>

            {/* Category Dropdown */}
            <div className="relative w-full md:w-auto flex items-center gap-3">
              <Filter className="w-5 h-5 text-muted-foreground hidden sm:block shrink-0" />
              <select
                value={selectedCategory || 'all'}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-64 px-4 py-3 rounded-xl border border-border bg-background font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'/%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground font-medium animate-pulse">Loading amazing products...</p>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              {searchQuery ? 'Search Results' : (categories.find((c) => c.id === selectedCategory)?.name || 'All Products')}
              <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md ml-2">
                {filteredProducts.length} items
              </span>
            </h2>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-32 bg-muted/30 rounded-3xl border border-dashed border-border flex flex-col items-center justify-center">
                <Search className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-2xl font-bold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6 max-w-md">We couldn't find any products matching your search or category filter.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} 
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors shadow-md"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="group relative flex flex-col bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="aspect-square bg-muted/30 overflow-hidden relative">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                          No image
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="absolute top-3 left-3 flex gap-1">
                        <div className="flex items-center gap-1 bg-background/90 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-yellow-500 shadow-sm">
                          <Star className="w-3 h-3 fill-yellow-500" />
                          4.8
                        </div>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                        <span className="font-extrabold text-xl text-foreground">
                          {Number(product.price).toFixed(2)} Birr
                        </span>
                        <div className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 group-hover:scale-110 duration-300">
                          <ShoppingCart className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
