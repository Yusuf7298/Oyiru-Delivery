import { auth } from '@/lib/auth'
import { headers, redirect } from 'next/headers'
import { ReactNode } from 'react'

export default async function HotelLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  return <>{children}</>
}
