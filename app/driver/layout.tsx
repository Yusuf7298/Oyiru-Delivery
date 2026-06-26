import { getAuthContext, requireDriver } from '@/lib/middleware/role-check'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

export default async function DriverLayout({ children }: { children: ReactNode }) {
  const auth = await getAuthContext()

  if (!auth?.isAuthenticated) {
    redirect('/auth-driver-k9v1')
  }

  if (!requireDriver(auth)) {
    redirect('/')
  }

  return <>{children}</>
}
