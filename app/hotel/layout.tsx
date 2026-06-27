import { getAuthContext, requireRestaurantOwner } from '@/lib/middleware/role-check'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

export const dynamic = 'force-dynamic'

export default async function HotelLayout({ children }: { children: ReactNode }) {
  const auth = await getAuthContext()

  if (!auth?.isAuthenticated) {
    redirect('/sign-in')
  }

  if (!requireRestaurantOwner(auth)) {
    redirect('/')
  }

  return <>{children}</>
}
