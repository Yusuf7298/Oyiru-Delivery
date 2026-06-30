'use client'

import { useEffect, useState, useRef } from 'react'
import { Truck, MapPin, Package, ShieldCheck, DollarSign, Loader2, Navigation, Eye, CheckCircle2, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { getMyDeliveries, updateDeliveryStatus } from '@/app/actions/delivery-actions'

export default function DeliveryDashboard() {
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDelivery, setSelectedDelivery] = useState<any | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Signature Drawing State
  const [showSignature, setShowSignature] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    loadDeliveries()
  }, [])

  async function loadDeliveries() {
    setIsLoading(true)
    const res = await getMyDeliveries()
    if (res.success && res.deliveries) {
      setDeliveries(res.deliveries)
    }
    setIsLoading(false)
  }

  const handleStatusChange = async (deliveryId: string, currentStatus: string) => {
    let nextStatus: 'picked_up' | 'in_transit' | 'delivered';
    
    if (currentStatus === 'assigned') {
      nextStatus = 'picked_up'
    } else if (currentStatus === 'picked_up') {
      nextStatus = 'in_transit'
    } else if (currentStatus === 'in_transit') {
      // Trigger signature confirmation first
      setShowSignature(true)
      return
    } else {
      return
    }

    await performStatusUpdate(deliveryId, nextStatus)
  }

  const performStatusUpdate = async (deliveryId: string, status: 'picked_up' | 'in_transit' | 'delivered') => {
    setIsUpdating(true)
    setMessage(null)
    const res = await updateDeliveryStatus(deliveryId, status)
    if (res.success) {
      setMessage({ type: 'success', text: `Delivery status updated to ${status.replace('_', ' ').toUpperCase()}` })
      loadDeliveries()
      setSelectedDelivery(null)
      setShowSignature(false)
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to update delivery status' })
    }
    setIsUpdating(false)
  }

  // Signature Canvas Drawing Logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#6366f1' // Indigo
    
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    ctx.beginPath()
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    ctx.lineTo(clientX - rect.left, clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const getStatusButtonLabel = (status: string) => {
    switch (status) {
      case 'assigned': return 'Confirm Pickup (Picked Up)'
      case 'picked_up': return 'Start Transit (In Transit)'
      case 'in_transit': return 'Complete Delivery (Delivered)'
      default: return ''
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold mb-2 tracking-wider uppercase">
              <Truck className="w-4 h-4" />
              Delivery Operations
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              Driver Dashboard
            </h1>
            <p className="text-slate-400 mt-1">
              View your assigned hotel shipments, map destinations, and record transit status.
            </p>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-6 flex items-center justify-between ${
            message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
          }`}>
            <span className="font-medium">{message.text}</span>
            <button onClick={() => setMessage(null)} className="opacity-60 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Deliveries Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-slate-400 font-medium">Loading assigned deliveries...</p>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center backdrop-blur-xl">
            <Package className="w-16 h-16 mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-300">No active deliveries</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">
              You currently do not have any deliveries assigned. When the super admin assigns a delivery to you, it will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deliveries.map((delivery) => (
              <div
                key={delivery.deliveryId}
                className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                        Order #{delivery.orderNumber}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">Assigned on: {new Date(delivery.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border capitalize ${
                      delivery.deliveryStatus === 'delivered'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    }`}>
                      {delivery.deliveryStatus.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-3 border-t border-slate-800/80 pt-4 mt-4 text-sm text-slate-400">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
                      <span>Destination: <strong className="text-slate-200">{delivery.deliveryAddress}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-slate-500" />
                      <span>Order Value: <strong className="text-slate-200">{parseFloat(delivery.totalAmount).toFixed(2)} Birr</strong></span>
                    </div>
                    {delivery.deliveryNotes && (
                      <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl text-xs italic text-slate-400 mt-2">
                        Note: {delivery.deliveryNotes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center gap-3">
                  {delivery.deliveryStatus !== 'delivered' ? (
                    <button
                      onClick={() => handleStatusChange(delivery.deliveryId, delivery.deliveryStatus)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
                    >
                      {getStatusButtonLabel(delivery.deliveryStatus)} <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-2 rounded-xl text-sm font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Order Fully Delivered
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedDelivery(delivery)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 p-2.5 rounded-xl transition-all"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Signature Capture Modal */}
        {showSignature && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in-50 zoom-in-95">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" /> Confirm Delivery Receipt
                </h3>
                <button
                  onClick={() => setShowSignature(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-400">
                  Please request the hotel representative signature in the box below to complete the shipment delivery protocol.
                </p>
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                  <canvas
                    ref={canvasRef}
                    width={380}
                    height={180}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full cursor-crosshair h-[180px]"
                  ></canvas>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Clear Signature
                  </button>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowSignature(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-4 py-2 rounded-xl transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Retrieve the delivery we were updating
                      const activeDelivery = deliveries.find(d => d.deliveryStatus === 'in_transit')
                      if (activeDelivery) {
                        performStatusUpdate(activeDelivery.deliveryId, 'delivered')
                      }
                    }}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium px-5 py-2 rounded-xl transition-all text-sm"
                  >
                    Submit Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Modal Overview */}
        {selectedDelivery && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in-50 zoom-in-95">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Delivery Details — #{selectedDelivery.orderNumber}
                </h2>
                <button
                  onClick={() => setSelectedDelivery(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-5 space-y-3 text-sm">
                  <div className="flex justify-between border-b border-slate-800/50 pb-2">
                    <span className="text-slate-400">Recipient Hotel:</span>
                    <span className="font-semibold text-white">Hotel Partner</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/50 pb-2">
                    <span className="text-slate-400">Total Price:</span>
                    <span className="font-semibold text-white">{parseFloat(selectedDelivery.totalAmount).toFixed(2)} Birr</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/50 pb-2">
                    <span className="text-slate-400">Destination:</span>
                    <span className="font-semibold text-white text-right max-w-[250px]">{selectedDelivery.deliveryAddress}</span>
                  </div>
                  {selectedDelivery.pickupTime && (
                    <div className="flex justify-between border-b border-slate-800/50 pb-2">
                      <span className="text-slate-400">Picked Up At:</span>
                      <span className="font-semibold text-white">{new Date(selectedDelivery.pickupTime).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedDelivery.deliveryTime && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Delivered At:</span>
                      <span className="font-semibold text-emerald-400">{new Date(selectedDelivery.deliveryTime).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/20">
                <button
                  onClick={() => setSelectedDelivery(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-5 py-2 rounded-lg transition-all text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
