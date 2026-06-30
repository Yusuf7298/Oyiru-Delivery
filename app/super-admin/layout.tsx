import { ReactNode } from 'react'
import { SuperAdminSidebar } from '@/components/super-admin-sidebar'
import { getSession } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { usersProfile } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession()

  if (!session?.user) {
    redirect('/sign-in')
  }

  const profile = await db
    .select()
    .from(usersProfile)
    .where(eq(usersProfile.userId, session.user.id))
    .limit(1)

  if (profile[0]?.role !== 'super_admin') {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SuperAdminSidebar />
      <div className="flex-1 overflow-x-hidden">
        {children}
      </div>
    </div>
  )
}
