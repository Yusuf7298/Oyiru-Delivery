import { getAuthContext, requireRestaurantOwner } from '@/lib/middleware/role-check'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

export default async function HotelLayout({ children }: { children: ReactNode }) {
  const auth = await getAuthContext()

  if (!auth?.isAuthenticated) {
    redirect('/auth-hotel-m4p2')
  }

  if (!requireRestaurantOwner(auth)) {
    redirect('/')
  }

  return <>{children}</>
}
