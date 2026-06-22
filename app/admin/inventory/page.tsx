'use client'

import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'

interface InventoryItem {
  id: string
  name: string
  categoryName: string
  stockQuantity: number
  price: number | string
  isAvailable: boolean
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lowStockFilter, setLowStockFilter] = useState(false)

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch('/api/admin/inventory')
        if (response.ok) {
          const data = await response.json()
          setInventory(data)
        }
      } catch (error) {
        console.error('Error fetching inventory:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInventory()
  }, [])

  const filteredInventory = lowStockFilter
    ? inventory.filter((item) => item.stockQuantity < 20)
    : inventory

  const lowStockCount = inventory.filter((item) => item.stockQuantity < 20).length
  const outOfStockCount = inventory.filter((item) => item.stockQuantity === 0).length

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Products</p>
          <p className="text-3xl font-bold">{inventory.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 border-yellow-200">
          <p className="text-sm text-yellow-700 font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Low Stock
          </p>
          <p className="text-3xl font-bold text-yellow-700">{lowStockCount}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 border-red-200">
          <p className="text-sm text-red-700 font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Out of Stock
          </p>
          <p className="text-3xl font-bold text-red-700">{outOfStockCount}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={lowStockFilter}
            onChange={(e) => setLowStockFilter(e.target.checked)}
            className="w-4 h-4 border border-border rounded"
          />
          <span className="text-sm font-medium">Show only low stock items (&lt; 20 units)</span>
        </label>
      </div>

      {/* Inventory Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      ) : filteredInventory.length === 0 ? (
        <div className="text-center py-12 border border-border rounded-lg bg-card">
          <p className="text-muted-foreground">No inventory items</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Product</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Stock</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.id} className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{item.categoryName}</td>
                  <td className="px-6 py-4 font-semibold">₹{Number(item.price).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-border rounded-full h-2">
                        <div
                          className={`h-full rounded-full ${
                            item.stockQuantity === 0
                              ? 'bg-red-500'
                              : item.stockQuantity < 20
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min((item.stockQuantity / 100) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold text-sm w-16">{item.stockQuantity} units</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        item.stockQuantity === 0
                          ? 'bg-red-100 text-red-800'
                          : item.stockQuantity < 20
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {item.stockQuantity === 0
                        ? 'Out of Stock'
                        : item.stockQuantity < 20
                        ? 'Low Stock'
                        : 'In Stock'}
                    </span>
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
