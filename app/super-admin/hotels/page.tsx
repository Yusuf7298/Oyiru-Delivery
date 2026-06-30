'use client'

import { useState, useEffect } from 'react'
import { Plus, Hotel, Shield, Phone, MapPin, Eye, Edit, ToggleLeft, ToggleRight, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getHotels, createHotelAccount, toggleHotelStatus, deleteHotel, updateHotel } from '@/app/actions/hotels'

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingHotelId, setEditingHotelId] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    ownerFullName: '',
    hotelName: '',
    address: '',
    phoneNumber: '',
    email: '',
    password: '',
    agreementStartDate: '',
    agreementEndDate: '',
    basePaymentAmount: '',
    telegramChatId: ''
  })
  
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadHotels()
  }, [])

  async function loadHotels() {
    setIsLoading(true)
    const res = await getHotels()
    if (res.success && res.hotels) {
      setHotels(res.hotels)
    }
    setIsLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    const res = await createHotelAccount(formData)
    if (res.success) {
      setMessage({ type: 'success', text: 'Hotel account created successfully!' })
      setShowModal(false)
      setFormData({
        ownerFullName: '',
        hotelName: '',
        address: '',
        phoneNumber: '',
        email: '',
        password: '',
        agreementStartDate: '',
        agreementEndDate: '',
        basePaymentAmount: '',
        telegramChatId: ''
      })
      loadHotels()
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to create hotel account' })
    }
    setIsSubmitting(false)
  }

  const handleToggleStatus = async (id: string) => {
    const res = await toggleHotelStatus(id)
    if (res.success) {
      setHotels(hotels.map(h => h.id === id ? { ...h, isActive: res.isActive } : h))
    }
  }

  const handleEditClick = (hotel: any) => {
    setFormData({
      ownerFullName: hotel.ownerFullName || '',
      hotelName: hotel.companyName || '',
      address: hotel.address || '',
      phoneNumber: hotel.phone || '',
      email: hotel.email || '',
      password: '', // Leave blank when editing
      agreementStartDate: hotel.agreementStartDate ? new Date(hotel.agreementStartDate).toISOString().split('T')[0] : '',
      agreementEndDate: hotel.agreementEndDate ? new Date(hotel.agreementEndDate).toISOString().split('T')[0] : '',
      basePaymentAmount: hotel.basePaymentAmount || '',
      telegramChatId: hotel.telegramChatId || ''
    })
    setEditingHotelId(hotel.id)
    setShowEditModal(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingHotelId) return
    setIsSubmitting(true)
    setMessage(null)

    const payload = {
      companyName: formData.hotelName,
      ownerFullName: formData.ownerFullName,
      address: formData.address,
      phone: formData.phoneNumber,
      email: formData.email,
      agreementStartDate: formData.agreementStartDate,
      agreementEndDate: formData.agreementEndDate,
      basePaymentAmount: formData.basePaymentAmount,
      telegramChatId: formData.telegramChatId
    }

    const res = await updateHotel(editingHotelId, payload)
    if (res.success) {
      setMessage({ type: 'success', text: 'Hotel account updated successfully!' })
      setShowEditModal(false)
      loadHotels()
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to update hotel account' })
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hotel? This action cannot be undone.')) return
    const res = await deleteHotel(id)
    if (res.success) {
      setMessage({ type: 'success', text: 'Hotel account deleted.' })
      setHotels(hotels.filter(h => h.id !== id))
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to delete hotel' })
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      {/* Background gradients for ambient glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold mb-2 tracking-wider uppercase">
              <Shield className="w-4 h-4" />
              Super Admin Panel
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Hotel Management
            </h1>
            <p className="text-slate-400 mt-1">
              Create, view, and configure hotel accounts and contract agreements.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-3 rounded-xl font-medium shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-5 h-5" />
            Create Hotel Account
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-6 flex items-center justify-between ${
            message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
          }`}>
            <span className="font-medium">{message.text}</span>
            <button onClick={() => setMessage(null)} className="opacity-60 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Hotels Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-slate-400 font-medium">Loading hotels...</p>
          </div>
        ) : hotels.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center backdrop-blur-xl">
            <Hotel className="w-16 h-16 mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-300">No hotels registered yet</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">
              Create your first hotel partner account to start defining product agreements and pricing contracts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:border-slate-700 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                      <Hotel className="w-6 h-6" />
                    </div>
                    <button
                      onClick={() => handleToggleStatus(hotel.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        hotel.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {hotel.isActive ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-emerald-400" /> Active
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 text-slate-400" /> Inactive
                        </>
                      )}
                    </button>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {hotel.companyName}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5">
                    Owner: <span className="text-slate-200 font-medium">{hotel.ownerFullName || hotel.contactPerson}</span>
                  </p>

                  <div className="mt-4 space-y-2 border-t border-slate-800/80 pt-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Phone className="w-4 h-4 text-slate-500" />
                      <span>{hotel.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <span className="line-clamp-1">{hotel.address}</span>
                    </div>
                    {hotel.agreementStartDate && (
                      <div className="text-xs text-slate-500 mt-2">
                        Agreement: {new Date(hotel.agreementStartDate).toLocaleDateString()} - {hotel.agreementEndDate ? new Date(hotel.agreementEndDate).toLocaleDateString() : 'Ongoing'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex flex-col gap-3">
                  <Link
                    href={`/super-admin/hotels/${hotel.id}/agreement`}
                    className="w-full text-center bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium px-4 py-2.5 rounded-xl transition-all text-sm"
                  >
                    Manage Contract Pricing
                  </Link>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(hotel)}
                      className="flex-1 text-center bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-medium px-4 py-2 rounded-xl transition-all text-sm flex items-center justify-center gap-1"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(hotel.id)}
                      className="flex-1 text-center bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-medium px-4 py-2 rounded-xl transition-all text-sm flex items-center justify-center gap-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in-50 zoom-in-95">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Hotel className="w-6 h-6 text-indigo-400" /> Create Hotel Account
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Hotel Owner Full Name</label>
                    <input
                      required
                      type="text"
                      name="ownerFullName"
                      value={formData.ownerFullName}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Hotel/Business Name</label>
                    <input
                      required
                      type="text"
                      name="hotelName"
                      value={formData.hotelName}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Contact Email Address</label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
                    <input
                      required
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
                    <input
                      required
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Physical Address</label>
                    <input
                      required
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Agreement Start Date</label>
                    <input
                      type="date"
                      name="agreementStartDate"
                      value={formData.agreementStartDate}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Agreement End Date</label>
                    <input
                      type="date"
                      name="agreementEndDate"
                      value={formData.agreementEndDate}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Base Monthly Contract Amount (Birr)</label>
                    <input
                      type="number"
                      name="basePaymentAmount"
                      placeholder="e.g. 5000"
                      value={formData.basePaymentAmount}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Telegram Chat ID (Notifications)</label>
                    <input
                      type="text"
                      name="telegramChatId"
                      placeholder="e.g. 987654321"
                      value={formData.telegramChatId}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-5 py-2.5 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium px-6 py-2.5 rounded-xl transition-all min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Save Partner'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in-50 zoom-in-95">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Edit className="w-6 h-6 text-indigo-400" /> Edit Hotel Account
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Hotel Owner Full Name</label>
                  <input
                    required
                    type="text"
                    name="ownerFullName"
                    value={formData.ownerFullName}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Hotel/Business Name</label>
                  <input
                    required
                    type="text"
                    name="hotelName"
                    value={formData.hotelName}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Contact Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
                  <input
                    required
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Physical Address</label>
                  <input
                    required
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2 pt-4 border-t border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Agreement Details (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Agreement Start Date</label>
                      <input
                        type="date"
                        name="agreementStartDate"
                        value={formData.agreementStartDate}
                        onChange={handleInputChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Agreement End Date</label>
                      <input
                        type="date"
                        name="agreementEndDate"
                        value={formData.agreementEndDate}
                        onChange={handleInputChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Base Payment Amount (Birr)</label>
                      <input
                        type="number"
                        name="basePaymentAmount"
                        value={formData.basePaymentAmount}
                        onChange={handleInputChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Telegram Chat ID</label>
                      <input
                        type="text"
                        name="telegramChatId"
                        value={formData.telegramChatId}
                        onChange={handleInputChange}
                        placeholder="e.g. 123456789"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
