'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft, User, Mail, Phone, MapPin, Calendar,
    ShoppingBag, Package, CheckCircle2, XCircle,
    Loader2, TrendingUp, Clock, Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getCustomerProfile, getCustomerOrders, toggleCustomerStatus } from '@/app/actions/customer-admin'

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
    draft: { color: '#9ca3af', bg: 'rgba(156,163,175,0.12)' },
    submitted: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
    inventory_review: { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
    approved: { color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
    assigned: { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
    shipped: { color: '#c084fc', bg: 'rgba(192,132,252,0.12)' },
    delivered: { color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
    completed: { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    cancelled: { color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
}

function OrderStatusBadge({ status }: { status: string }) {
    const s = STATUS_COLORS[status] ?? { color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' }
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '2px 10px', borderRadius: 999,
            background: s.bg, color: s.color,
            fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
            border: `1px solid ${s.color}30`,
        }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color }} />
            {status.replace(/_/g, ' ')}
        </span>
    )
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: userId } = React.use(params)

    const [customer, setCustomer] = useState<any>(null)
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [toggling, setToggling] = useState(false)
    const [msg, setMsg] = useState('')
    const [error, setError] = useState('')

    const load = async () => {
        setLoading(true)
        try {
            const [cRes, oRes] = await Promise.all([
                getCustomerProfile(userId),
                getCustomerOrders(userId),
            ])
            if (cRes.success) setCustomer(cRes.customer)
            else setError(cRes.error || 'Not found')
            if (oRes.success) setOrders(oRes.orders || [])
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [userId])

    const handleToggle = async () => {
        if (!customer) return
        setToggling(true)
        setMsg('')
        const isSuspended = !customer.profile?.isVerified
        const res = await toggleCustomerStatus(userId, !isSuspended)
        if (res.success) {
            setCustomer((c: any) => ({ ...c, profile: { ...c.profile, isVerified: isSuspended } }))
            setMsg(isSuspended ? 'Customer account restored.' : 'Customer account suspended.')
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

    if (error || !customer) return (
        <div className="min-h-screen bg-background p-8">
            <Link href="/super-admin/customers">
                <Button variant="ghost" className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
            </Link>
            <p className="text-destructive">{error || 'Customer not found'}</p>
        </div>
    )

    const totalSpent = orders.reduce((s: number, o: any) => s + parseFloat(o.totalAmount || '0'), 0)
    const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'completed').length
    const isSuspended = !customer.profile?.isVerified

    return (
        <div className="min-h-screen bg-background/50 p-4 sm:p-8">
            {/* Notification */}
            {msg && (
                <div className={`max-w-4xl mx-auto mb-4 px-5 py-3 rounded-xl text-sm font-medium border ${msg.includes('suspended') ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'
                    }`}>{msg}</div>
            )}

            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/super-admin/customers">
                        <button className="p-2 rounded-xl hover:bg-secondary transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{customer.name}</h1>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${isSuspended
                            ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                            : 'bg-green-500/15 text-green-400 border border-green-500/20'
                        }`}>
                        {isSuspended ? '● Suspended' : '● Active'}
                    </span>
                    <Button
                        size="sm"
                        variant={isSuspended ? 'default' : 'destructive'}
                        disabled={toggling}
                        onClick={handleToggle}
                    >
                        {toggling ? <Loader2 className="w-3 h-3 animate-spin" /> : isSuspended ? 'Restore' : 'Suspend'}
                    </Button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left: Profile */}
                <div className="space-y-6">
                    {/* Avatar */}
                    <Card className="p-6 text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 text-2xl font-extrabold text-white shadow-lg">
                            {customer.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <h2 className="font-bold text-lg">{customer.name}</h2>
                        <p className="text-sm text-muted-foreground mt-1">{customer.email}</p>
                        <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {customer.profile?.role || 'customer'}
                        </span>
                    </Card>

                    {/* Details */}
                    <Card className="p-6 space-y-3">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Details</h3>
                        <div className="space-y-3 text-sm">
                            {customer.profile?.phoneNumber && (
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <span>{customer.profile.phoneNumber}</span>
                                </div>
                            )}
                            {customer.profile?.address && (
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span>{customer.profile.address}{customer.profile.city ? `, ${customer.profile.city}` : ''}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>Joined {new Date(customer.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className={`w-4 h-4 ${customer.emailVerified ? 'text-green-500' : 'text-muted-foreground'}`} />
                                <span>{customer.emailVerified ? 'Email verified' : 'Email not verified'}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Stats */}
                    <Card className="p-6">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Order Stats</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-secondary/30 rounded-xl p-3 text-center">
                                <p className="text-2xl font-bold text-primary">{orders.length}</p>
                                <p className="text-xs text-muted-foreground mt-1">Total Orders</p>
                            </div>
                            <div className="bg-secondary/30 rounded-xl p-3 text-center">
                                <p className="text-2xl font-bold text-green-500">{completedOrders}</p>
                                <p className="text-xs text-muted-foreground mt-1">Completed</p>
                            </div>
                            <div className="col-span-2 bg-secondary/30 rounded-xl p-3 text-center">
                                <p className="text-xl font-bold text-foreground">{totalSpent.toFixed(2)} Birr</p>
                                <p className="text-xs text-muted-foreground mt-1">Total Spent</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right: Order history */}
                <div className="lg:col-span-2">
                    <Card className="overflow-hidden">
                        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                            <h3 className="font-bold text-lg">Order History</h3>
                            <span className="text-sm text-muted-foreground">{orders.length} orders</span>
                        </div>

                        {orders.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                                <p className="text-muted-foreground">No orders yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                                {orders.map((order: any) => (
                                    <div key={order.id} className="px-6 py-4 hover:bg-secondary/20 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                    <span className="font-mono text-sm font-semibold text-foreground">
                                                        #{order.orderNumber}
                                                    </span>
                                                    <OrderStatusBadge status={order.status || 'draft'} />
                                                </div>
                                                {/* Items list */}
                                                {order.items?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mb-1.5">
                                                        {order.items.map((item: any) => (
                                                            <span key={item.id} className="text-xs bg-secondary/50 px-2 py-0.5 rounded-full text-muted-foreground">
                                                                {item.productName} ×{item.quantity}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {order.deliveryAddress}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="font-bold text-primary text-sm">{parseFloat(order.totalAmount).toFixed(2)} Birr</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                                <Link href={`/super-admin/orders/${order.id}`} className="text-xs text-primary hover:underline mt-1 block">
                                                    View →
                                                </Link>
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
