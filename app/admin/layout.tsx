import { auth } from '@/lib/auth'
import { headers, redirect } from 'next/headers'
import { ReactNode } from 'react'
import { pool } from '@/lib/db'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  // Check if user is admin by querying raw SQL for only the columns we created
  const result = await pool.query(
    'SELECT role FROM users_profile WHERE "userId" = $1',
    [session.user.id]
  )

  const userProfile = result.rows[0] as { role: string } | undefined

  if (!userProfile || userProfile.role !== 'admin') {
    redirect('/')
  }

  return <>{children}</>
}
