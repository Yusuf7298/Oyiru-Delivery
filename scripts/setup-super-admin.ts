import dotenv from 'dotenv'
dotenv.config({ path: '.env' })

async function setupSuperAdmin() {
  const { db } = await import('../lib/db')
  const { usersProfile, user } = await import('../lib/db/schema')
  const { eq } = await import('drizzle-orm')
  const email = 'oyiru@delivery.com'
  const password = 'oyiruSuper1'
  const name = 'Oyiru Super Admin'

  console.log('Checking if user exists...')
  
  try {
    const res = await fetch('http://localhost:3000/api/auth/sign-up/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      },
      body: JSON.stringify({
        email,
        password,
        name
      })
    })

    if (!res.ok) {
      const err = await res.json()
      if (err.message === 'User already exists' || err.code === 'USER_ALREADY_EXISTS' || err.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') {
        console.log('User already exists, proceeding to promote...')
      } else {
        console.error('Failed to create user via API:', err)
        return
      }
    } else {
      console.log('User created successfully.')
    }

    // Now let's promote them
    const dbUser = await db.query.user.findFirst({
      where: eq(user.email, email)
    })

    if (!dbUser) {
      console.error('Could not find user in database. Make sure your local server is running on port 3000')
      return
    }

    await db.update(usersProfile)
      .set({ role: 'super_admin' })
      .where(eq(usersProfile.userId, dbUser.id))

    console.log(`Successfully promoted ${email} to super_admin!`)
    process.exit(0)
  } catch (err) {
    console.error('Error:', err)
  }
}

setupSuperAdmin()
