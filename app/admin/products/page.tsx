'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import BackToDashboardButton from '@/components/BackToDashboardButton'

interface Product {
  id: string
  categoryId: string
  name: string
  price: number | string
  description?: string
  stockQuantity: number
  isAvailable: boolean
  image?: string | null
}

interface Category {
  id: string
  name: string
}

const emptyForm = {
  name: '',
  description: '',
  price: '',
  categoryId: '',
  stockQuantity: '',
  image: '',
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ ...emptyForm })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
        ])

        if (productsRes.ok) {
          const data = await productsRes.json()
          setProducts(data)
        }

        if (categoriesRes.ok) {
          const data = await categoriesRes.json()
          setCategories(data)
          if (data.length > 0) {
            setFormData((prev) => ({ ...prev, categoryId: prev.categoryId || data[0].id }))
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

  const resetForm = () => {
    setFormData({ ...emptyForm, categoryId: categories[0]?.id || '' })
    setEditingId(null)
    setError(null)
    setShowForm(false)
  }

  const openAddForm = () => {
    setFormData({ ...emptyForm, categoryId: categories[0]?.id || '' })
    setEditingId(null)
    setError(null)
    setShowForm(true)
  }

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      categoryId: product.categoryId,
      stockQuantity: String(product.stockQuantity),
      image: product.image || '',
    })
    setEditingId(product.id)
    setError(null)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const price = parseFloat(formData.price)
    const stockQuantity = parseInt(formData.stockQuantity, 10)
    if (Number.isNaN(price) || price < 0) {
      setError('Please enter a valid price.')
      return
    }
    if (Number.isNaN(stockQuantity) || stockQuantity < 0) {
      setError('Please enter a valid stock quantity.')
      return
    }

    setSaving(true)
    try {
      const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products'
      const method = editingId ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, price, stockQuantity }),
      })

      if (response.ok) {
        const saved = await response.json()
        if (editingId) {
          setProducts((prev) => prev.map((p) => (p.id === editingId ? saved : p)))
        } else {
          setProducts((prev) => [...prev, saved])
        }
        resetForm()
      } else {
        const data = await response.json().catch(() => ({}))
        setError(data.error || `Failed to ${editingId ? 'update' : 'add'} product.`)
      }
    } catch (error) {
      console.error('Error saving product:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product? This cannot be undone.')) return

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productId))
      } else {
        const data = await response.json().catch(() => ({}))
        setError(data.error || 'Failed to delete product.')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      setError('An error occurred while deleting. Please try again.')
    }
  }

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Unknown'
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackToDashboardButton />
          <h1 className="text-3xl font-bold">Products</h1>
        </div>
        <button
          onClick={() => (showForm ? resetForm() : openAddForm())}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-4 opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Add / Edit Product Form */}
      {showForm && (
        <div className="mb-6 p-6 bg-card border border-border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Price (Birr )</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Stock Quantity</label>
                <input
                  type="number"
                  required
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Image URL (optional)</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg"
                placeholder="https://example.com/product.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg"
                placeholder="Enter product description"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Update Product' : 'Save Product'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No products yet</p>
          <button
            onClick={openAddForm}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-5 h-5" />
            Create First Product
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Stock</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                        {product.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-muted-foreground font-bold opacity-40">{product.name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        {product.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{getCategoryName(product.categoryId)}</td>
                  <td className="px-6 py-4 font-semibold">{Number(product.price).toFixed(2)} Birr</td>
                  <td className="px-6 py-4 text-sm">{product.stockQuantity} units</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${product.isAvailable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {product.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="Edit product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
