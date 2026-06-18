'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { getUserProfile, updateUserProfile } from '@/app/actions/users'
import { Button } from '@/components/ui/button'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    phoneNumber: '',
    address: '',
    city: '',
    zipCode: '',
  })

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data } = await authClient.getSession()
        if (!data?.user) {
          router.push('/sign-in')
          return
        }

        setUser(data.user)

        // Fetch user profile
        const userProfile = await getUserProfile()
        setProfile(userProfile)
        if (userProfile) {
          setFormData({
            phoneNumber: userProfile.phoneNumber || '',
            address: userProfile.address || '',
            city: userProfile.city || '',
            zipCode: userProfile.zipCode || '',
          })
        }
      } catch (error) {
        console.error('Failed to load user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router])

  const handleLogout = async () => {
    try {
      await authClient.signOut()
      router.push('/sign-in')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await updateUserProfile({
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        city: formData.city,
        zipCode: formData.zipCode,
      })

      setProfile({
        ...profile,
        ...formData,
      })
      setEditing(false)
    } catch (error) {
      console.error('Failed to save profile:', error)
      alert('Failed to save profile changes')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-primary font-semibold">
            ← Back
          </Link>
          <h1 className="text-xl font-bold">My Profile</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* User Info Card */}
          <div className="md:col-span-1">
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-white text-2xl font-bold mb-4">
                {user.name?.charAt(0) || user.email?.charAt(0)}
              </div>
              <h2 className="text-xl font-bold mb-1">{user.name || 'User'}</h2>
              <p className="text-sm text-muted-foreground mb-6">{user.email}</p>

              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full text-destructive border-destructive hover:bg-destructive/10"
              >
                Sign Out
              </Button>
            </div>
          </div>

          {/* Profile Form */}
          <div className="md:col-span-2">
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Profile Information</h2>
                <button
                  onClick={() => setEditing(!editing)}
                  className="text-primary font-medium hover:underline"
                >
                  {editing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-2 rounded-lg border border-border bg-muted text-muted-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={user.name || ''}
                    disabled
                    className="w-full px-4 py-2 rounded-lg border border-border bg-muted text-muted-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    disabled={!editing}
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:text-muted-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!editing}
                    placeholder="Enter your street address"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:text-muted-foreground"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={!editing}
                      placeholder="Enter your city"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:text-muted-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      disabled={!editing}
                      placeholder="Enter your zip code"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:text-muted-foreground"
                    />
                  </div>
                </div>

                {editing && (
                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full mt-6"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Link href="/orders">
            <div className="bg-card rounded-lg border border-border p-6 hover:border-primary/50 transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">📦 My Orders</h3>
              <p className="text-sm text-muted-foreground">
                View order history and tracking
              </p>
            </div>
          </Link>

          <Link href="/cart">
            <div className="bg-card rounded-lg border border-border p-6 hover:border-primary/50 transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">🛒 Shopping Cart</h3>
              <p className="text-sm text-muted-foreground">
                View and manage your cart
              </p>
            </div>
          </Link>

          <Link href="/">
            <div className="bg-card rounded-lg border border-border p-6 hover:border-primary/50 transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">🍽️ Restaurants</h3>
              <p className="text-sm text-muted-foreground">
                Browse and order from restaurants
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
