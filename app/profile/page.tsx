'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { getUserProfile, updateUserProfile } from '@/app/actions/users'
import { Button } from '@/components/ui/button'
import { 
  User, Shield, Activity, MapPin, Phone, Mail, 
  Camera, Package, ShoppingCart, Store, CheckCircle2, 
  LogOut, Loader2, Edit3, X
} from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')
  const [toast, setToast] = useState<{show: boolean, message: string}>({show: false, message: ''})
  
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
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
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
      showToast('Profile updated successfully!')
    } catch (error) {
      console.error('Failed to save profile:', error)
      showToast('Failed to save profile changes')
    } finally {
      setSaving(false)
    }
  }

  const showToast = (message: string) => {
    setToast({ show: true, message })
    setTimeout(() => setToast({ show: false, message: '' }), 3000)
  }

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'admin':
      case 'super_admin':
        return <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Admin</span>
      case 'restaurant_owner':
        return <span className="bg-orange-500/10 text-orange-500 border border-orange-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Partner</span>
      case 'delivery_partner':
        return <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Driver</span>
      default:
        return <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Customer</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading profile...</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background/50 pb-20 relative">
      
      {/* Toast Notification */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}`}>
        <div className="bg-card border border-border shadow-2xl rounded-full px-6 py-3 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      </div>

      {/* Banner */}
      <div className="h-64 w-full bg-gradient-to-r from-primary/80 via-accent/80 to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop')] mix-blend-overlay opacity-30 bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
        <div className="max-w-5xl mx-auto px-4 h-full relative">
          <Link href="/" className="absolute top-6 left-4 bg-background/20 hover:bg-background/40 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
            ← Back Home
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        
        {/* Profile Header Card */}
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-8 shadow-2xl mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent p-1 shadow-xl">
                <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary to-accent">
                  {user.name?.charAt(0) || user.email?.charAt(0)}
                </div>
              </div>
              <button className="absolute bottom-0 right-0 p-2.5 bg-background border border-border rounded-full shadow-lg hover:scale-110 hover:text-primary transition-all duration-300">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                <h1 className="text-3xl font-extrabold tracking-tight">{user.name || 'User'}</h1>
                {profile?.role && getRoleBadge(profile.role)}
              </div>
              <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-4 h-4" /> {user.email}
              </p>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <Button onClick={() => setActiveTab('personal')} variant={activeTab === 'personal' ? 'default' : 'outline'} className="flex-1 sm:flex-none rounded-full">
                Edit Profile
              </Button>
              <Button onClick={handleLogout} variant="outline" className="flex-1 sm:flex-none rounded-full text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/40">
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-8 bg-card border border-border p-2 rounded-2xl overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab('personal')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${activeTab === 'personal' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'hover:bg-secondary text-muted-foreground hover:text-foreground'}`}
          >
            <User className="w-4 h-4" /> Personal Info
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${activeTab === 'security' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'hover:bg-secondary text-muted-foreground hover:text-foreground'}`}
          >
            <Shield className="w-4 h-4" /> Account Security
          </button>
          <button 
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${activeTab === 'activity' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'hover:bg-secondary text-muted-foreground hover:text-foreground'}`}
          >
            <Activity className="w-4 h-4" /> Activity & Links
          </button>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2">
            
            {activeTab === 'personal' && (
              <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-bold">Personal Information</h2>
                    <p className="text-sm text-muted-foreground mt-1">Update your contact and location details</p>
                  </div>
                  {!editing ? (
                    <Button onClick={() => setEditing(true)} variant="outline" size="sm" className="rounded-full h-9">
                      <Edit3 className="w-4 h-4 mr-2" /> Edit Details
                    </Button>
                  ) : (
                    <Button onClick={() => { setEditing(false); setFormData({
                      phoneNumber: profile.phoneNumber || '',
                      address: profile.address || '',
                      city: profile.city || '',
                      zipCode: profile.zipCode || ''
                    })}} variant="ghost" size="sm" className="rounded-full text-muted-foreground h-9">
                      <X className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                  )}
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                        <Phone className="w-4 h-4 text-primary" /> Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        disabled={!editing}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300 disabled:opacity-60"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                        <MapPin className="w-4 h-4 text-primary" /> Street Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={!editing}
                        placeholder="123 Main St, Apt 4B"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300 disabled:opacity-60"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        disabled={!editing}
                        placeholder="New York"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300 disabled:opacity-60"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                        Zip / Postal Code
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        disabled={!editing}
                        placeholder="10001"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300 disabled:opacity-60"
                      />
                    </div>
                  </div>

                  {editing && (
                    <div className="pt-6 mt-6 border-t border-border flex justify-end">
                      <Button type="submit" disabled={saving} className="rounded-full px-8 py-6 h-auto text-base font-semibold shadow-xl shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300">
                        {saving ? (
                          <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving Changes...</>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h2 className="text-xl font-bold">Account Security</h2>
                  <p className="text-sm text-muted-foreground mt-1">Manage your sensitive account settings</p>
                </div>
                
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-secondary/30 border border-border flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold mb-1">Email Address</h4>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-bold uppercase rounded-full">Verified</span>
                  </div>
                  
                  <div className="p-5 rounded-2xl bg-secondary/30 border border-border flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold mb-1">Password</h4>
                      <p className="text-sm text-muted-foreground">••••••••••••</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full">Update</Button>
                  </div>
                  
                  <div className="p-5 rounded-2xl bg-secondary/30 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-semibold mb-1">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Button variant="default" size="sm" className="rounded-full whitespace-nowrap">Enable 2FA</Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="grid sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Link href="/orders" className="group block">
                  <div className="bg-card border border-border p-6 rounded-3xl hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Package className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">My Orders</h3>
                    <p className="text-sm text-muted-foreground">Track your deliveries and view past order history</p>
                  </div>
                </Link>

                <Link href="/cart" className="group block">
                  <div className="bg-card border border-border p-6 rounded-3xl hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Shopping Cart</h3>
                    <p className="text-sm text-muted-foreground">View your saved items and proceed to checkout</p>
                  </div>
                </Link>

                <Link href="/" className="group block sm:col-span-2">
                  <div className="bg-card border border-border p-6 rounded-3xl hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex-shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Store className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2">Discover Restaurants</h3>
                      <p className="text-sm text-muted-foreground">Browse our vast selection of partner restaurants and order your next meal</p>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats Sidebar */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold mb-4">Account Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-sm font-medium text-muted-foreground">Account Status</span>
                  <span className="text-sm font-bold text-green-500">Active</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-sm font-medium text-muted-foreground">Member Since</span>
                  <span className="text-sm font-bold">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'New'}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm font-medium text-muted-foreground">Primary Role</span>
                  <span className="text-sm font-bold capitalize">{profile?.role?.replace('_', ' ') || 'Customer'}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-3xl p-6">
              <h3 className="font-bold text-primary mb-2">Need Help?</h3>
              <p className="text-sm text-foreground/80 mb-4">Our support team is always here to assist you with your orders and account.</p>
              <Button variant="default" className="w-full rounded-full shadow-lg shadow-primary/20">Contact Support</Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
