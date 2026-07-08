'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { getUserProfile, updateUserProfile } from '@/app/actions/users'
import {
    User, Shield, MapPin, Phone, Mail,
    CheckCircle2, LogOut, Loader2, Edit3, X, ArrowLeft
} from 'lucide-react'

const ROLE_META: Record<string, { label: string; portal: string; color: string }> = {
    super_admin: { label: 'Super Admin', portal: '/auth-superadmin-s9k3', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    admin: { label: 'Admin', portal: '/auth-admin-x7f9', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
    restaurant_owner: { label: 'Hotel Partner', portal: '/auth-hotel-m4p2', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
    hotel: { label: 'Hotel Partner', portal: '/auth-hotel-m4p2', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
    delivery_partner: { label: 'Driver', portal: '/auth-driver-k9v1', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    delivery: { label: 'Driver', portal: '/auth-driver-k9v1', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    customer: { label: 'Customer', portal: '/sign-in', color: 'text-primary bg-primary/10 border-primary/20' },
}

const BACK_LINKS: Record<string, string> = {
    super_admin: '/super-admin',
    admin: '/admin',
    restaurant_owner: '/hotel',
    hotel: '/hotel',
    delivery_partner: '/driver',
    delivery: '/driver',
    customer: '/',
}

export default function ProfilePage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [msg, setMsg] = useState('')
    const [form, setForm] = useState({ phoneNumber: '', address: '', city: '', zipCode: '' })

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await authClient.getSession()
                if (!data?.user) { router.push('/sign-in'); return }
                setUser(data.user)
                const p = await getUserProfile()
                setProfile(p)
                if (p) setForm({ phoneNumber: p.phoneNumber || '', address: p.address || '', city: p.city || '', zipCode: p.zipCode || '' })
            } catch (e) { console.error(e) }
            finally { setLoading(false) }
        }
        load()
    }, [router])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            await updateUserProfile(form)
            setProfile((p: any) => ({ ...p, ...form }))
            setEditing(false)
            setMsg('Profile updated!')
            setTimeout(() => setMsg(''), 3000)
        } catch { setMsg('Failed to save') }
        finally { setSaving(false) }
    }

    const handleSignOut = async () => {
        await authClient.signOut()
        const portal = ROLE_META[profile?.role]?.portal || '/sign-in'
        window.location.href = portal
    }

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    )

    if (!user) return null

    const role = profile?.role || 'customer'
    const meta = ROLE_META[role] ?? ROLE_META.customer
    const backLink = BACK_LINKS[role] ?? '/'

    return (
        <div className="min-h-screen bg-background/50">
            {msg && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-xl">
                    <CheckCircle2 className="w-4 h-4" /> {msg}
                </div>
            )}

            {/* Header bar */}
            <header className="sticky top-0 z-40 bg-card/80 backdrop-blur border-b border-border">
                <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
                    <a href={backLink} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </a>
                    <button onClick={handleSignOut} className="flex items-center gap-2 text-sm font-medium text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-lg transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

                {/* Profile card */}
                <div className="bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-extrabold text-white shadow-lg flex-shrink-0">
                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-2xl font-extrabold">{user.name}</h1>
                        <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                            <Mail className="w-4 h-4" /> {user.email}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${meta.color}`}>
                                {meta.label}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${user.emailVerified ? 'text-green-500 bg-green-500/10 border-green-500/20' : 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
                                }`}>
                                {user.emailVerified ? '✓ Verified' : 'Unverified'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Personal Info */}
                <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-bold flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Personal Information</h2>
                        {!editing ? (
                            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                                <Edit3 className="w-4 h-4" /> Edit
                            </button>
                        ) : (
                            <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
                                <X className="w-4 h-4" /> Cancel
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { name: 'phoneNumber', label: 'Phone Number', icon: Phone, placeholder: '+251 911 000 000', type: 'tel' },
                            { name: 'address', label: 'Address', icon: MapPin, placeholder: 'Street address', type: 'text' },
                            { name: 'city', label: 'City', icon: MapPin, placeholder: 'City', type: 'text' },
                            { name: 'zipCode', label: 'Postal Code', icon: Shield, placeholder: '10001', type: 'text' },
                        ].map(f => (
                            <div key={f.name}>
                                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider flex items-center gap-1">
                                    <f.icon className="w-3 h-3" /> {f.label}
                                </label>
                                <input
                                    type={f.type}
                                    value={(form as any)[f.name]}
                                    onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                                    disabled={!editing}
                                    placeholder={f.placeholder}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-default"
                                />
                            </div>
                        ))}

                        {editing && (
                            <div className="sm:col-span-2 flex justify-end">
                                <button type="submit" disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors">
                                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {/* Account overview */}
                <div className="bg-card border border-border rounded-2xl p-6">
                    <h2 className="text-lg font-bold mb-4">Account Overview</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-border">
                            <span className="text-muted-foreground">Member since</span>
                            <span className="font-medium">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                            <span className="text-muted-foreground">Role</span>
                            <span className={`font-bold text-xs px-2 py-0.5 rounded-full border ${meta.color}`}>{meta.label}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">Account status</span>
                            <span className="font-medium text-green-500">Active</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
