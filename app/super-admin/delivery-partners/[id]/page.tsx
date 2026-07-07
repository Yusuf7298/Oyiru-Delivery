'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { db } from '@/lib/db'
import {
    Truck, Phone, ArrowLeft, Package, Star,
    CheckCircle2, XCircle, Clock, MapPin, Loader2,
    TrendingUp, Calendar, User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import React from 'react'

// Server action to get driver detail
import { getDriverProfile, getDriverDeliveryHistory, toggleDriverStatus } from '@/app/actions/driver-admin'

export default function DriverDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: userId } = React.use(params)

    const [driver, setDriver] = useState<any>(null)
    const [deliveries, setDeliveries] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [toggling, setToggling] = useState(false)
    const [error, setError] = useState('')
    const [msg, setMsg] = useState('')

    const load = async () => {
        setLoading(true)
        try {
            const [driverRes, deliveriesRes] = await Promise.all([
                getDriverProfile(userId),
                getDriverDeliveryHistory(userId),
            ])
            if (driverRes.success) setDriver(driverRes.driver)
            else setError(driverRes.error || 'Driver not found')
            if (deliveriesRes.success) setDeliveries(deliveriesRes.deliveries || [])
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [userId])

    const handleToggleStatus = async () => {
        if (!driver) return
        setToggling(true)
        setMsg('')
        const res = await toggleDriverStatus(driver.id, !driver.isActive)
        if (res.success) {
            setDriver({ ...driver, isActive: !driver.isActive })
            setMsg(driver.isActive ? 'Driver suspended.' : 'Driver reactivated.')
            setTimeout(() => setMsg(''), 3000)
        } else {
            setMsg(res.error || 'Failed')
        }
        setToggling(false)
    }

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    )

    if (error || !driver) return (
        <div className="min-h-screen bg-background p-8">
            <Link href="/super-admin/delivery-partners">
                <Button variant="ghost" className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
            </Link>
            <p className="text-destructive">{error || 'Driver not found'}</p>
        </div>
    )

    const completedCount = deliveries.filter(d => d.deliveryStatus === 'delivered').length
    const totalEarnings = parseFloat(driver.totalEarnings || '0')
    const avgPerDelivery = completedCount > 0 ? (totalEarnings / completedCount).toFixed(2) : '0.00'

    return (
        <div className="min-h-screen bg-background/50 p-4 sm:p-8">
            {/* Notification */}
            {msg && (
                <div className={`max-w-4xl mx-auto mb-4 px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${msg.includes('suspend') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
                    }`}>
                    {msg}
                </div>
            )}

            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/super-admin/delivery-partners">
                        <button className="p-2 rounded-xl hover:bg-secondary transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{driver.userName || 'Driver'}</h1>
                        <p className="text-sm text-muted-foreground">{driver.userEmail}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${driver.isActive ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-red-500/15 text-red-400 border border-red-500/20'
                        }`}>
                        {driver.isActive ? '● Active' : '● Inactive'}
                    </span>
                    <Button
                        size="sm"
                        variant={driver.isActive ? 'destructive' : 'default'}
                        disabled={toggling}
                        onClick={handleToggleStatus}
                    >
                        {toggling ? <Loader2 className="w-3 h-3 animate-spin" /> : driver.isActive ? 'Suspend' : 'Reactivate'}
                    </Button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left: Profile */}
                <div className="space-y-6">
                    {/* Avatar + info */}
                    <Card className="p-6">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mb-3 shadow-lg shadow-orange-500/20">
                                <Truck className="w-9 h-9 text-white" />
                            </div>
                            <h2 className="text-lg font-bold">{driver.userName}</h2>
                            <p className="text-sm text-muted-foreground">{driver.userEmail}</p>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span>{driver.phoneNumber || 'No phone'}</span>
                            </div>
                            {driver.vehicleType && (
                                <div className="flex items-center gap-3">
                                    <Truck className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                    <span>{driver.vehicleType}</span>
                                </div>
                            )}
                            {driver.birthPlace && (
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                    <span>{driver.birthPlace}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span>Joined {new Date(driver.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Stats */}
                    <Card className="p-6 space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Performance</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-secondary/30 rounded-xl p-3 text-center">
                                <p className="text-2xl font-bold text-primary">{driver.totalOrders || 0}</p>
                                <p className="text-xs text-muted-foreground mt-1">Total Orders</p>
                            </div>
                            <div className="bg-secondary/30 rounded-xl p-3 text-center">
                                <p className="text-2xl font-bold text-green-500">{completedCount}</p>
                                <p className="text-xs text-muted-foreground mt-1">Completed</p>
                            </div>
                            <div className="bg-secondary/30 rounded-xl p-3 text-center">
                                <p className="text-lg font-bold text-foreground">{totalEarnings.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground mt-1">Total Birr</p>
                            </div>
                            <div className="bg-secondary/30 rounded-xl p-3 text-center">
                                <p className="text-lg font-bold text-yellow-500">{avgPerDelivery}</p>
                                <p className="text-xs text-muted-foreground mt-1">Avg/Delivery</p>
                            </div>
                        </div>

                        {driver.averageRating && (
                            <div className="flex items-center gap-2 pt-2 border-t border-border">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">{parseFloat(driver.averageRating).toFixed(1)}</span>
                                <span className="text-sm text-muted-foreground">rating</span>
                            </div>
                        )}
                    </Card>

                    {/* Guarantor */}
                    {(driver.guarantorName || driver.guarantorPhone) && (
                        <Card className="p-6">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Guarantor</h3>
                            <div className="space-y-2 text-sm">
                                {driver.guarantorName && (
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        <span>{driver.guarantorName}</span>
                                    </div>
                                )}
                                {driver.guarantorPhone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                        <span>{driver.guarantorPhone}</span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right: Delivery history */}
                <div className="lg:col-span-2">
                    <Card className="overflow-hidden">
                        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                            <h3 className="font-bold text-lg">Delivery History</h3>
                            <span className="text-sm text-muted-foreground">{deliveries.length} deliveries</span>
                        </div>

                        {deliveries.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                                <p className="text-muted-foreground">No deliveries yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {deliveries.map((d: any) => (
                                    <div key={d.deliveryId} className="px-6 py-4 hover:bg-secondary/20 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-sm font-semibold text-foreground truncate">
                                                        #{d.orderNumber}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${d.deliveryStatus === 'delivered'
                                                            ? 'bg-green-500/15 text-green-400'
                                                            : d.deliveryStatus === 'in_transit' || d.deliveryStatus === 'picked_up'
                                                                ? 'bg-blue-500/15 text-blue-400'
                                                                : 'bg-orange-500/15 text-orange-400'
                                                        }`}>
                                                        {d.deliveryStatus?.replace(/_/g, ' ') || 'assigned'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    <MapPin className="w-3 h-3 inline mr-1" />
                                                    {d.deliveryAddress}
                                                </p>
                                                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                                    {d.pickupTime && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            Picked up: {new Date(d.pickupTime).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    )}
                                                    {d.deliveryTime && (
                                                        <span className="flex items-center gap-1 text-green-500">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Delivered: {new Date(d.deliveryTime).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="font-bold text-primary text-sm">
                                                    {parseFloat(d.totalAmount || '0').toFixed(2)} Birr
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {new Date(d.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    )
}
