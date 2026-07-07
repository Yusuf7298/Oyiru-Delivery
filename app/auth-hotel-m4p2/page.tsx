import { getAuthContext } from '@/lib/middleware/role-check'
import { redirect } from 'next/navigation'
import { PortalAuthForm } from '@/components/portal-auth-form'

export const dynamic = 'force-dynamic'

export default async function HotelPortal() {
  const auth = await getAuthContext()
  if (auth?.isAuthenticated && (auth.role === 'restaurant_owner' || auth.role === 'hotel')) {
    redirect('/hotel')
  }
  return (
    <PortalAuthForm
      title="Hotel Portal"
      subtitle="Partner Ordering System"
      allowedRoles={['restaurant_owner', 'hotel']}
      accentColor="orange"
      redirectTo="/hotel"
    />
  )
}
