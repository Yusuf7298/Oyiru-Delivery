'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Building2, Phone, Mail, MapPin, CreditCard, Save, Loader2, CheckCircle2 } from 'lucide-react'
import { getHotelSettings, saveHotelSettings } from '@/app/actions/hotel-settings'

export default function HotelSettingsPage() {
    const [form, setForm] = useState({
        companyName: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        billingType: 'INVOICE',
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        getHotelSettings().then(data => {
            if (data) {
                setForm({
                    companyName: data.companyName || '',
                    contactPerson: data.contactPerson || '',
                    phone: data.phone || '',
                    email: data.email || '',
                    address: data.address || '',
                    billingType: data.billingType || 'INVOICE',
                })
            }
        }).catch(console.error).finally(() => setLoading(false))
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError('')
        setSaved(false)
        try {
            await saveHotelSettings(form)
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (err: any) {
            setError(err.message || 'Failed to save')
        } finally {
            setSaving(false)
        }
    }

    const field = (key: keyof typeof form, value: string) =>
        setForm(f => ({ ...f, [key]: value }))

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    )

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-card border-b border-border">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
                    <Link href="/hotel" className="flex items-center gap-2 font-bold text-xl">
                        <span className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 shadow">
                            <Image src="/logo.jpg" alt="Oyru" fill className="object-cover" sizes="32px" />
                        </span>
                        <span>Hotel Settings</span>
                    </Link>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
                    <p className="text-muted-foreground">
                        Update your hotel information. Your saved address will be used automatically when placing orders.
                    </p>
                </div>

                {saved && (
                    <div className="mb-6 flex items-center gap-3 bg-green-500/10 border border-green-500/20 text-green-600 px-5 py-3 rounded-xl">
                        <CheckCircle2 className="w-5 h-5" />
                        Settings saved successfully. Your address will now be used for orders.
                    </div>
                )}
                {error && (
                    <div className="mb-6 bg-destructive/10 border border-destructive/20 text-destructive px-5 py-3 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Company Info */}
                    <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-primary" />
                            Company Information
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold mb-2">Company / Hotel Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.companyName}
                                    onChange={e => field('companyName', e.target.value)}
                                    placeholder="Grand Palace Hotel"
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Contact Person</label>
                                <input
                                    type="text"
                                    value={form.contactPerson}
                                    onChange={e => field('contactPerson', e.target.value)}
                                    placeholder="Full name"
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                                    <Phone className="w-4 h-4" /> Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={e => field('phone', e.target.value)}
                                    placeholder="+251 911 000 000"
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> Email Address
                                </label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={e => field('email', e.target.value)}
                                    placeholder="orders@yourhotel.com"
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            Delivery Address
                        </h2>
                        <p className="text-sm text-muted-foreground -mt-2">
                            This address is automatically used when you place orders. No need to re-enter it each time.
                        </p>

                        <div>
                            <label className="block text-sm font-semibold mb-2">Full Delivery Address *</label>
                            <textarea
                                required
                                rows={3}
                                value={form.address}
                                onChange={e => field('address', e.target.value)}
                                placeholder="Building No, Street, District, City"
                                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            />
                            {!form.address && (
                                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                                    ⚠ Address is required before you can place orders
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Billing */}
                    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-primary" />
                            Payment Method
                        </h2>
                        <div className="flex gap-4">
                            {['INVOICE', 'COD'].map(type => (
                                <label key={type} className={`flex items-center gap-3 flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.billingType === type
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/40'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="billingType"
                                        value={type}
                                        checked={form.billingType === type}
                                        onChange={() => field('billingType', type)}
                                        className="accent-primary"
                                    />
                                    <div>
                                        <p className="font-semibold text-sm">{type === 'INVOICE' ? 'Invoice / Credit' : 'Cash on Delivery'}</p>
                                        <p className="text-xs text-muted-foreground">{type === 'INVOICE' ? 'Billed monthly' : 'Pay on delivery'}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Save */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
                        >
                            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save Settings</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
