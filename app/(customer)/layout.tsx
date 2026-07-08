import { getAuthContext } from '@/lib/middleware/role-check'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

export const dynamic = 'force-dynamic'

export default async function CustomerLayout({ children }: { children: ReactNode }) {
  const auth = await getAuthContext()

  if (auth?.isAuthenticated && auth.role !== 'customer') {
    // Redirect staff away from customer pages — but NOT from /profile (handled by its own page)
    // The redirect happens at the layout level so it covers all (customer) routes
    if (auth.role === 'super_admin') redirect('/super-admin')
    if (auth.role === 'admin') redirect('/admin')
    if (auth.role === 'delivery' || auth.role === 'delivery_partner') redirect('/driver')
    if (auth.role === 'hotel' || auth.role === 'restaurant_owner') redirect('/hotel')
  }

  return <>{children}</>
}
