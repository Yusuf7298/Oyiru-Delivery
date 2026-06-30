'use client'

import { useState, useEffect, use } from 'react'
import { ArrowLeft, Loader2, Plus, Trash2, Edit2, Check, X, FileText, ShoppingBag, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { getHotelById } from '@/app/actions/hotels'
import { getHotelAgreements, addProductToAgreement, removeProductFromAgreement, updateAgreementPrice } from '@/app/actions/agreements'

interface Product {
  id: string
  name: string
  price: string
  stockQuantity: number
}

export default function HotelAgreementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: hotelId } = use(params)
  const [hotel, setHotel] = useState<any>(null)
  const [agreements, setAgreements] = useState<any[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [agreedPrice, setAgreedPrice] = useState('')
  const [unit, setUnit] = useState('kg')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadData()
  }, [hotelId])

  async function loadData() {
    setIsLoading(true)
    const [hotelRes, agreementsRes, productsRes] = await Promise.all([
      getHotelById(hotelId),
      getHotelAgreements(hotelId),
      fetch('/api/products').then(res => res.json())
    ])

    if (hotelRes.success) setHotel(hotelRes.hotel)
    if (agreementsRes.success && agreementsRes.agreements) setAgreements(agreementsRes.agreements)
    if (Array.isArray(productsRes)) setProducts(productsRes)
    
    setIsLoading(false)
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProductId || !agreedPrice) return
    setIsAdding(true)
    setMessage(null)

    const res = await addProductToAgreement({
      hotelId,
      productId: selectedProductId,
      agreedPrice,
      unit
    })

    if (res.success) {
      setMessage({ type: 'success', text: 'Product added to agreement!' })
      setSelectedProductId('')
      setAgreedPrice('')
      const agreementsRes = await getHotelAgreements(hotelId)
      if (agreementsRes.success && agreementsRes.agreements) {
        setAgreements(agreementsRes.agreements)
      }
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to add product' })
    }
    setIsAdding(false)
  }

  const handleRemoveProduct = async (agreementId: string) => {
    if (!confirm('Are you sure you want to remove this product from the agreement?')) return
    const res = await removeProductFromAgreement(agreementId)
    if (res.success) {
      setAgreements(agreements.filter(a => a.id !== agreementId))
      setMessage({ type: 'success', text: 'Product removed from agreement' })
    }
  }

  const handleStartEdit = (agreement: any) => {
    setEditingId(agreement.id)
    setEditPrice(parseFloat(agreement.agreedPrice).toString())
  }

  const handleSaveEdit = async (agreementId: string) => {
    if (!editPrice) return
    const res = await updateAgreementPrice(agreementId, editPrice)
    if (res.success) {
      setAgreements(agreements.map(a => a.id === agreementId ? { ...a, agreedPrice: editPrice } : a))
      setEditingId(null)
      setMessage({ type: 'success', text: 'Agreement price updated!' })
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to update price' })
    }
  }

  // Filter out products that are already in the agreement
  const availableProducts = products.filter(
    p => !agreements.some(a => a.productId === p.id && a.isActive)
  )

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <Link
          href="/super-admin/hotels"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Hotel Management
        </Link>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-slate-400 font-medium">Loading agreement pricing details...</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Hotel Info Hero Banner */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
                  <FileText className="w-4 h-4" /> Contract Agreement Form
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">
                  {hotel?.companyName}
                </h1>
                <p className="text-slate-400 text-sm">
                  Define approved products and negotiate wholesale contract pricing (Birr/kg).
                </p>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl px-6 py-4 flex flex-col gap-1 min-w-[200px]">
                <span className="text-xs text-slate-500 font-semibold uppercase">Base Contract Amount</span>
                <span className="text-2xl font-bold text-indigo-400">
                  {hotel?.basePaymentAmount ? `${parseFloat(hotel.basePaymentAmount).toLocaleString()} Birr` : 'None / On-demand'}
                </span>
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-xl flex items-center justify-between ${
                message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
              }`}>
                <span className="font-medium">{message.text}</span>
                <button onClick={() => setMessage(null)} className="opacity-60 hover:opacity-100">✕</button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Add Product Agreement Form */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl h-fit">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-400" /> Add Product Contract
                </h3>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Select Product</label>
                    <select
                      required
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- Choose Product --</option>
                      {availableProducts.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (Retail: {parseFloat(p.price).toFixed(2)} Birr)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Agreed Price (Birr/kg)</label>
                    <div className="relative">
                      <input
                        required
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={agreedPrice}
                        onChange={(e) => setAgreedPrice(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                      />
                      <DollarSign className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Unit of Measurement</label>
                    <input
                      type="text"
                      name="unit"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="e.g. kg"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAdding}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2.5 rounded-xl transition-all"
                  >
                    {isAdding ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-5 h-5" /> Add Agreement Price
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Agreement Price List Table */}
              <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-indigo-400" /> Negotiated Pricing Form
                </h3>
                {agreements.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">
                    No custom pricing contracts defined yet. Complete the form to add one.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-3 px-4">Product</th>
                          <th className="py-3 px-4">Standard Price</th>
                          <th className="py-3 px-4">Contract Price</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {agreements.map((agreement) => (
                          <tr key={agreement.id} className="hover:bg-slate-900/20 transition-colors">
                            <td className="py-4 px-4 font-medium text-white flex items-center gap-3">
                              {agreement.productName}
                            </td>
                            <td className="py-4 px-4 text-slate-400">
                              {parseFloat(agreement.defaultPrice).toFixed(2)} Birr/{agreement.unit || 'kg'}
                            </td>
                            <td className="py-4 px-4">
                              {editingId === agreement.id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={editPrice}
                                    onChange={(e) => setEditPrice(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 w-24 text-white focus:outline-none focus:border-indigo-500 text-sm"
                                  />
                                  <button
                                    onClick={() => handleSaveEdit(agreement.id)}
                                    className="p-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-lg"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <span className="font-semibold text-indigo-400">
                                  {parseFloat(agreement.agreedPrice).toFixed(2)} Birr/{agreement.unit || 'kg'}
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {editingId !== agreement.id && (
                                  <button
                                    onClick={() => handleStartEdit(agreement)}
                                    className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleRemoveProduct(agreement.id)}
                                  className="p-2 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
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
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
