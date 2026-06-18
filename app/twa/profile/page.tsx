'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getUserOrders } from '@/app/actions/orders'
import { getUserProfile } from '@/app/actions/users'
import { Button } from '@/components/ui/button'
import { ArrowLeft, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

const WebApp = typeof window !== 'undefined' ? require('@twa-dev/sdk').default : null

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  picked_up: 'bg-blue-100 text-blue-800',
  in_transit: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function TelegramProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (WebApp) {
      try {
        WebApp.ready()
      } catch (error) {
        console.error('Error initializing Telegram WebApp:', error)
      }
    }
    WebApp.expand()

    const loadData = async () => {
      try {
        const profileData = await getUserProfile()
        setProfile(profileData)

        const ordersData = await getUserOrders()
        setOrders(ordersData.slice(0, 5))
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleLogout = async () => {
    // Logout logic would go here
    router.push('/sign-in')
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border py-3 px-4 flex items-center gap-3">
        <Link href="/twa" className="hover:text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-bold text-base flex-1">Profile</h1>
      </div>

      <div className="px-4 py-6 space-y-6">
        {loading ? (
          <div className="space-y-4">
            <div className="bg-secondary h-20 rounded animate-pulse"></div>
            <div className="bg-secondary h-12 rounded animate-pulse"></div>
          </div>
        ) : (
          <>
            {/* Profile Info */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
                  {profile?.phoneNumber?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">User ID</p>
                  <p className="font-semibold text-sm">{profile?.phoneNumber || 'Not set'}</p>
                </div>
              </div>
              {profile?.address && (
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-1">Delivery Address</p>
                  <p className="text-sm font-medium">{profile.address}</p>
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                <p>Role: <span className="font-semibold capitalize">{profile?.role || 'customer'}</span></p>
              </div>
            </div>

            {/* Recent Orders */}
            <div>
              <h2 className="font-bold text-sm mb-3">Recent Orders</h2>
              {orders.length > 0 ? (
                <div className="space-y-2">
                  {orders.map((order: any) => (
                    <Link
                      key={order.id}
                      href={`/twa/order/${order.id}`}
                      className="block bg-card border border-border rounded-lg p-3 hover:bg-secondary/50 transition-colors active:scale-95"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold">Order #{order.id.slice(0, 8)}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            statusColors[order.status] || 'bg-gray-100'
                          }`}
                        >
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        <span className="font-semibold text-foreground">${parseFloat(order.totalAmount).toFixed(2)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No orders yet</p>
              )}
            </div>

            {/* Logout */}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
