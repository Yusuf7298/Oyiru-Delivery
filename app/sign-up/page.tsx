import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'
import { getAuthContext } from '@/lib/middleware/role-check'

export default async function SignUpPage() {
  const authContext = await getAuthContext()
  if (authContext?.isAuthenticated) {
    if (authContext.role === 'admin' || authContext.role === 'super_admin') redirect('/admin')
    if (authContext.role === 'delivery_partner') redirect('/driver')
    if (authContext.role === 'restaurant_owner') redirect('/hotel')
    redirect('/')
  }
  return <AuthForm mode="sign-up" />
}
