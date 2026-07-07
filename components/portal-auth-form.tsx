'use client'

import Image from 'next/image'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { ensureProfile } from '@/app/actions/users'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

interface PortalAuthFormProps {
    title: string
    subtitle: string
    allowedRoles: string[]
    accentColor: string      // tailwind color class e.g. 'green', 'blue', 'purple', 'orange'
    redirectTo: string
}

const ACCENT: Record<string, { border: string; text: string; bg: string; glow: string }> = {
    green: { border: 'border-green-500/60', text: 'text-green-400', bg: 'bg-green-500/10', glow: 'shadow-green-500/20' },
    blue: { border: 'border-blue-500/60', text: 'text-blue-400', bg: 'bg-blue-500/10', glow: 'shadow-blue-500/20' },
    purple: { border: 'border-purple-500/60', text: 'text-purple-400', bg: 'bg-purple-500/10', glow: 'shadow-purple-500/20' },
    orange: { border: 'border-orange-500/60', text: 'text-orange-400', bg: 'bg-orange-500/10', glow: 'shadow-orange-500/20' },
    red: { border: 'border-red-500/60', text: 'text-red-400', bg: 'bg-red-500/10', glow: 'shadow-red-500/20' },
}

export function PortalAuthForm({ title, subtitle, allowedRoles, accentColor, redirectTo }: PortalAuthFormProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const accent = ACCENT[accentColor] ?? ACCENT.green

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const { error: authError } = await authClient.signIn.email({ email, password })

        if (authError) {
            setError(authError.message ?? 'Invalid credentials')
            setLoading(false)
            return
        }

        try {
            let profile = null
            for (let i = 0; i < 3; i++) {
                try {
                    profile = await ensureProfile()
                    break
                } catch {
                    if (i < 2) await new Promise(r => setTimeout(r, 600))
                }
            }

            if (!profile) {
                setError('Session not ready. Please try again.')
                setLoading(false)
                return
            }

            if (!allowedRoles.includes(profile.role)) {
                await authClient.signOut()
                setError('You do not have permission to access this portal.')
                setLoading(false)
                return
            }

            window.location.href = redirectTo
        } catch {
            window.location.href = redirectTo
        }
    }

    return (
        <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
            {/* Background glow */}
            <div className={`absolute w-96 h-96 rounded-full blur-[120px] opacity-20 ${accent.bg} pointer-events-none`} />

            <div className="w-full max-w-sm relative z-10">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className={`w-20 h-20 rounded-2xl overflow-hidden shadow-2xl ${accent.glow} mb-4 border ${accent.border}`}>
                        <Image src="/logo.jpg" alt="Oyru" width={80} height={80} className="object-cover w-full h-full" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">{title}</h1>
                    <p className={`text-sm mt-1 ${accent.text}`}>{subtitle}</p>
                </div>

                {/* Form card */}
                <div className={`bg-[#111] border ${accent.border} rounded-2xl p-6 shadow-2xl`}>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                placeholder="you@oyru.com"
                                className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-white/30 text-sm transition-colors"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 pr-12 rounded-xl bg-[#0a0a0a] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-white/30 text-sm transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(s => !s)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-200 ${accent.bg} border ${accent.border} hover:brightness-125 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                        >
                            {loading
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
                                : 'Sign In'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-slate-600 mt-6">
                    Oyru Platform · Restricted Access
                </p>
            </div>
        </div>
    )
}
