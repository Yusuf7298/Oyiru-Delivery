import { AuthForm } from '@/components/auth-form'

export default function HotelAuthPage() {
  return <AuthForm mode="sign-in" allowedRoles={['restaurant_owner']} />
}
