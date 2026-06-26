import { AuthForm } from '@/components/auth-form'

export default function DriverAuthPage() {
  return <AuthForm mode="sign-in" allowedRoles={['delivery_partner']} />
}
