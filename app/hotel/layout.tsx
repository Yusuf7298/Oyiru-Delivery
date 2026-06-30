import { getAuthContext, requireHotel, requireRestaurantOwner } from '@/lib/middleware/role-check'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'
import { HotelSidebar } from '@/components/hotel-sidebar'
export const dynamic = 'force-dynamic'
export default async function HotelLayout({ children }: { children: ReactNode }) {
  const auth = await getAuthContext()
  if (!auth?.isAuthenticated) {
    redirect('/sign-in')
  }
  if (!requireHotel(auth) && !requireRestaurantOwner(auth)) {
    redirect('/')
  }
  return (
    <div className="flex min-h-screen bg-background">
      <HotelSidebar />
      <div className="flex-1 overflow-x-hidden">
        {children}
      </div>
    </div>
  )
}
