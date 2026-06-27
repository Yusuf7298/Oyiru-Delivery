import { getAuthContext, requireDriver } from '@/lib/middleware/role-check'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

export const dynamic = 'force-dynamic'

export default async function DriverLayout({ children }: { children: ReactNode }) {
  const auth = await getAuthContext()

  if (!auth?.isAuthenticated) {
    redirect('/sign-in')
  }

  if (!requireDriver(auth)) {
    redirect('/')
  }

  return <>{children}</>
}
