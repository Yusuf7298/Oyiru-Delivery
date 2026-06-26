import { getAuthContext } from '@/lib/middleware/role-check'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

export default async function ProfileLayout({ children }: { children: ReactNode }) {
  const auth = await getAuthContext()

  if (!auth?.isAuthenticated) {
    redirect('/sign-in')
  }

  return <>{children}</>
}
