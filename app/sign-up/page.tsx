import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'
import { getAuthContext } from '@/lib/middleware/role-check'

export const dynamic = 'force-dynamic'

export default async function SignUpPage() {
  const authContext = await getAuthContext()
  if (authContext?.isAuthenticated) {
    if (authContext.role === 'super_admin') redirect('/super-admin')
    if (authContext.role === 'admin') redirect('/admin')
    if (authContext.role === 'delivery' || authContext.role === 'delivery_partner') redirect('/driver')
    if (authContext.role === 'hotel' || authContext.role === 'restaurant_owner') redirect('/hotel')
    redirect('/')
  }
  return <AuthForm mode="sign-up" />
}
