import { db } from '../lib/db'
import { usersProfile, user } from '../lib/db/schema'
import { eq } from 'drizzle-orm'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

async function makeSuperAdmin() {
  console.log('👑 Super Admin Bootstrap Tool')
  console.log('------------------------------')
  
  rl.question('Enter the email address of the account to promote: ', async (email) => {
    try {
      // 1. Find the user by email in Better Auth's user table
      const authUsers = await db
        .select()
        .from(user)
        .where(eq(user.email, email.trim()))
        .limit(1)

      const targetUser = authUsers[0]

      if (!targetUser) {
        console.error(`\n❌ Error: No account found with email "${email}"`)
        console.log('Please ensure you have signed up at /sign-up first.')
        process.exit(1)
      }

      console.log(`\nFound user: ${targetUser.name} (${targetUser.email})`)
      console.log(`User ID: ${targetUser.id}`)

      // 2. Check if a profile exists
      const existingProfile = await db
        .select()
        .from(usersProfile)
        .where(eq(usersProfile.userId, targetUser.id))
        .limit(1)

      if (existingProfile.length > 0) {
        // Update existing profile
        await db
          .update(usersProfile)
          .set({ role: 'super_admin' })
          .where(eq(usersProfile.userId, targetUser.id))
        
        console.log(`\n✅ Success: Updated existing profile to SUPER_ADMIN!`)
      } else {
        // Create new profile
        const profileId = `prof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        await db
          .insert(usersProfile)
          .values({
            id: profileId,
            userId: targetUser.id,
            role: 'super_admin',
          })
          
        console.log(`\n✅ Success: Created new profile and set to SUPER_ADMIN!`)
      }

      console.log('\nYou can now log in securely at: http://localhost:3000/auth-admin-x7f9')
      
    } catch (error) {
      console.error('\n❌ An error occurred:', error)
    } finally {
      process.exit(0)
    }
  })
}

makeSuperAdmin()
