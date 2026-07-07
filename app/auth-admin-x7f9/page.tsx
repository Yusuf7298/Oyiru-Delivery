import { getAuthContext } from '@/lib/middleware/role-check'
import { redirect } from 'next/navigation'
import { PortalAuthForm } from '@/components/portal-auth-form'

export const dynamic = 'force-dynamic'

export default async function AdminPortal() {
  const auth = await getAuthContext()
  if (auth?.isAuthenticated) {
    if (auth.role === 'super_admin') redirect('/super-admin')
    if (auth.role === 'admin') redirect('/admin')
  }
  return (
    <PortalAuthForm
      title="Admin Portal"
      subtitle="Oyru Store Operations"
      allowedRoles={['admin', 'super_admin']}
      accentColor="green"
      redirectTo="/admin"
    />
  )
}
