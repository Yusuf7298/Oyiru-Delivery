import { AuthForm } from '@/components/auth-form'

export default function AdminAuthPage() {
  return <AuthForm mode="sign-in" allowedRoles={['admin', 'super_admin']} />
}
