import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-utils'
import { db } from '@/lib/db'
import { usersProfile } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ role: null })
    }

    const profile = await db
      .select({ role: usersProfile.role })
      .from(usersProfile)
      .where(eq(usersProfile.userId, session.user.id))
      .limit(1)

    return NextResponse.json({ role: profile[0]?.role || 'customer' })
  } catch (error) {
    console.error('Error in /api/auth/role:', error)
    return NextResponse.json({ role: null }, { status: 500 })
  }
}
