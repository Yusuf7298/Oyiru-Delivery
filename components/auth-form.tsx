'use client'

import Image from 'next/image'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { getUserProfile, ensureProfile } from '@/app/actions/users'

export function AuthForm({ mode, allowedRoles }: { mode: 'sign-in' | 'sign-up', allowedRoles?: string[] }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignUp = mode === 'sign-up'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: authError } = isSignUp
      ? await authClient.signUp.email({ email, password, name })
      : await authClient.signIn.email({ email, password })

    if (authError) {
      setError(authError.message ?? 'Something went wrong')
      setLoading(false)
      return
    }

    try {
      // On sign-up: create profile row if missing (new users have none yet)
      // On sign-in: fetch existing profile
      const profile = isSignUp ? await ensureProfile() : await getUserProfile()

      if (allowedRoles && profile?.role && !allowedRoles.includes(profile.role)) {
        await authClient.signOut()
        setError('You are not authorized to access this portal.')
        setLoading(false)
        return
      }

      let redirectUrl = '/'
      const role = profile?.role
      if (role === 'admin' || role === 'super_admin') {
        redirectUrl = '/admin'
      } else if (role === 'delivery_partner') {
        redirectUrl = '/driver'
      } else if (role === 'restaurant_owner') {
        redirectUrl = '/hotel'
      }
      // customer or no role → '/'

      // Hard redirect so server layouts re-evaluate session
      window.location.href = redirectUrl
    } catch (err) {
      console.error('Failed to get profile after auth:', err)
      window.location.href = '/'
    }
  }

  return (
    <main className="min-h-svh bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-sm p-6">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex flex-col items-center gap-2">
            <span className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-lg">
              <Image src="/logo.jpg" alt="Oyru" fill className="object-cover" sizes="64px" priority />
            </span>
            <span className="font-bold text-lg text-foreground">Oyru</span>
          </Link>
        </div>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-center">
            {allowedRoles ? `${allowedRoles[0].replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} Portal` : (isSignUp ? 'Create an account' : 'Welcome back')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            {allowedRoles ? 'Sign in to access your dashboard' : (isSignUp ? 'Sign up to get started' : 'Sign in to your account to continue')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isSignUp && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading
              ? 'Please wait...'
              : isSignUp
                ? 'Create account'
                : 'Sign in'}
          </Button>
        </form>

        {(!allowedRoles || allowedRoles.includes('customer')) && (
          <p className="text-sm text-muted-foreground text-center mt-6">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <Link
              href={isSignUp ? '/sign-in' : '/sign-up'}
              className="text-foreground font-medium underline-offset-4 hover:underline"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </Link>
          </p>
        )}
      </Card>
    </main>
  )
}
