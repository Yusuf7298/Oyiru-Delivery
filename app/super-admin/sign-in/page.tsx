import { getAuthContext } from '@/lib/middleware/role-check'
import { redirect } from 'next/navigation'
import { PortalAuthForm } from '@/components/portal-auth-form'

export const dynamic = 'force-dynamic'

export default async function SuperAdminSignIn() {
  const auth = await getAuthContext()
  if (auth?.isAuthenticated && auth.role === 'super_admin') redirect('/super-admin')
  return (
    <PortalAuthForm
      title="Super Admin"
      subtitle="Oyru Platform Control"
      allowedRoles={['super_admin']}
      accentColor="purple"
      redirectTo="/super-admin"
    />
  )
}
