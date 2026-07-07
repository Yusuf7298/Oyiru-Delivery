import { getAuthContext } from '@/lib/middleware/role-check'
import { redirect } from 'next/navigation'
import { PortalAuthForm } from '@/components/portal-auth-form'

export const dynamic = 'force-dynamic'

export default async function DriverPortal() {
  const auth = await getAuthContext()
  if (auth?.isAuthenticated && (auth.role === 'delivery_partner' || auth.role === 'delivery')) {
    redirect('/driver')
  }
  return (
    <PortalAuthForm
      title="Driver Portal"
      subtitle="Delivery Operations"
      allowedRoles={['delivery_partner', 'delivery']}
      accentColor="blue"
      redirectTo="/driver"
    />
  )
}
