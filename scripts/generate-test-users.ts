import { db } from '@/lib/db'
import { user, usersProfile } from '@/lib/db/schema'
import { v4 as uuidv4 } from 'uuid'
import { hash } from '@node-rs/bcrypt'

const TEST_USERS = [
  {
    email: 'customer@test.com',
    password: 'Test123!@#',
    role: 'customer',
    name: 'Test Customer',
  },
  {
    email: 'admin@test.com',
    password: 'Admin123!@#',
    role: 'admin',
    name: 'Test Admin',
  },
  {
    email: 'driver@test.com',
    password: 'Driver123!@#',
    role: 'delivery_partner',
    name: 'Test Driver',
  },
  {
    email: 'super_admin@test.com',
    password: 'SuperAdmin123!@#',
    role: 'super_admin',
    name: 'Test Super Admin',
  },
]

async function generateTestUsers() {
  try {
    console.log('Generating test users...')

    for (const testUser of TEST_USERS) {
      const userId = uuidv4()
      const hashedPassword = await hash(testUser.password, 10)

      // Create user
      await db
        .insert(user)
        .values({
          id: userId,
          name: testUser.name,
          email: testUser.email,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoNothing()

      // Create profile
      await db
        .insert(usersProfile)
        .values({
          id: uuidv4(),
          userId,
          role: testUser.role as any,
          phoneNumber: '+1234567890',
          address: '123 Test Street',
          city: 'Test City',
          zipCode: '12345',
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoNothing()

      console.log(`✓ Created ${testUser.role}: ${testUser.email}`)
      console.log(`  Password: ${testUser.password}`)
    }

    console.log('\n✓ Test users generated successfully!')
    console.log('\nTest Credentials:')
    TEST_USERS.forEach((u) => {
      console.log(`\n${u.role.toUpperCase()}:`)
      console.log(`  Email: ${u.email}`)
      console.log(`  Password: ${u.password}`)
    })

    process.exit(0)
  } catch (error) {
    console.error('Error generating test users:', error)
    process.exit(1)
  }
}

generateTestUsers()
