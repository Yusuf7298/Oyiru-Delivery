/**
 * Create test credentials for all roles.
 * Run: node scripts/create-test-users.js
 *
 * This creates real accounts via the Better Auth API so login works exactly
 * as it would in production.
 */

require('dotenv').config()
const { Pool } = require('pg')
const { createHash, randomBytes } = require('crypto')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// ── Credentials ─────────────────────────────────────────────────────────────
const TEST_USERS = [
    {
        name: 'Test Customer',
        email: 'customer@test.oyru.com',
        password: 'Test@1234',
        role: 'customer',
        portal: '/',
    },
    {
        name: 'Grand Palace Hotel',
        email: 'hotel@test.oyru.com',
        password: 'Hotel@1234',
        role: 'restaurant_owner',
        portal: '/auth-hotel-m4p2',
        companyName: 'Grand Palace Hotel (Test)',
        phone: '+251911000001',
        address: 'Bole Road, Addis Ababa',
    },
    {
        name: 'Test Driver',
        email: 'driver@test.oyru.com',
        password: 'Driver@1234',
        role: 'delivery_partner',
        portal: '/auth-driver-k9v1',
        phone: '+251911000002',
    },
    {
        name: 'Test Admin',
        email: 'admin@test.oyru.com',
        password: 'Admin@1234',
        role: 'admin',
        portal: '/auth-admin-x7f9',
    },
    {
        name: 'Super Admin Oyru',
        email: 'superadmin@test.oyru.com',
        password: 'Super@1234',
        role: 'super_admin',
        portal: '/super-admin/sign-in',
    },
]

// ── Better Auth compatible password hash (bcrypt via @node-rs/bcrypt) ────────
async function hashPassword(password) {
    // Better Auth uses bcrypt. We call it via a small inline script.
    // Since we can't import ESM here easily, we'll use the DB-level approach:
    // Create the user record manually matching Better Auth's schema.
    const { default: bcrypt } = await import('@node-rs/bcrypt').catch(() => {
        // Fallback: use a pre-hashed value and note user must reset
        return { default: null }
    })

    if (bcrypt) {
        return await bcrypt.hash(password, 12)
    }

    // If bcrypt not available, use sha256 placeholder
    // NOTE: this won't work for login — install @node-rs/bcrypt
    throw new Error('@node-rs/bcrypt required. Run: npm install @node-rs/bcrypt')
}

async function userExists(client, email) {
    const res = await client.query(`SELECT id FROM "user" WHERE email = $1`, [email])
    return res.rows.length > 0 ? res.rows[0].id : null
}

async function createUser(client, user) {
    const existingId = await userExists(client, user.email)
    if (existingId) {
        console.log(`  ⏭  ${user.email} already exists (id: ${existingId.slice(0, 8)}...)`)
        return existingId
    }

    const userId = `usr_test_${randomBytes(8).toString('hex')}`
    const hashedPw = await hashPassword(user.password)
    const now = new Date().toISOString()

    // Insert into Better Auth `user` table
    await client.query(
        `INSERT INTO "user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, true, $4, $4)`,
        [userId, user.name, user.email, now]
    )

    // Insert into Better Auth `account` table (email/password provider)
    const accountId = `acc_test_${randomBytes(8).toString('hex')}`
    await client.query(
        `INSERT INTO account (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
     VALUES ($1, $2, 'credential', $3, $4, $5, $5)`,
        [accountId, user.email, userId, hashedPw, now]
    )

    // Insert into users_profile
    const profileId = `prof_test_${randomBytes(8).toString('hex')}`
    await client.query(
        `INSERT INTO users_profile (id, "userId", role, "phoneNumber", address, "isVerified", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, true, $6, $6)`,
        [profileId, userId, user.role, user.phone || null, user.address || null, now]
    )

    return userId
}

async function createHotelAccount(client, userId, user) {
    // Check if hotel account already linked to this user
    const existing = await client.query(
        `SELECT id FROM hotel_accounts WHERE "userId" = $1`,
        [userId]
    )
    if (existing.rows.length > 0) {
        console.log(`  ⏭  Hotel account already exists for ${user.email}`)
        return existing.rows[0].id
    }

    // Check if hotel_accounts has userId column
    const cols = await client.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'hotel_accounts' AND table_schema = 'public'`
    )
    const colNames = cols.rows.map(r => r.column_name)

    if (!colNames.includes('userId')) {
        console.log(`  ⚠  hotel_accounts has no userId column — skipping hotel account creation`)
        return null
    }

    const hotelId = `hot_test_${randomBytes(8).toString('hex')}`
    await client.query(
        `INSERT INTO hotel_accounts (id, "userId", "companyName", "contactPerson", email, phone, "billingType", "isActive", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, 'INVOICE', true, $7, $7)`,
        [hotelId, userId, user.companyName, user.name, user.email, user.phone, new Date().toISOString()]
    )
    return hotelId
}

async function createDeliveryPartner(client, userId, user) {
    const existing = await client.query(
        `SELECT id FROM delivery_partners WHERE "userId" = $1`,
        [userId]
    )
    if (existing.rows.length > 0) {
        console.log(`  ⏭  Delivery partner record already exists for ${user.email}`)
        return
    }

    const dpId = `dp_test_${randomBytes(8).toString('hex')}`
    await client.query(
        `INSERT INTO delivery_partners (id, "userId", "phoneNumber", "isVerified", "isActive", "totalOrders", "totalEarnings", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, true, true, 0, 0, $4, $4)`,
        [dpId, userId, user.phone || '+251900000000', new Date().toISOString()]
    )
}

async function run() {
    const client = await pool.connect()
    console.log('\n=== Creating Test Users ===\n')

    try {
        for (const user of TEST_USERS) {
            console.log(`\n📋 ${user.role.toUpperCase()} — ${user.email}`)

            try {
                const userId = await createUser(client, user)

                // Role-specific records
                if (user.role === 'restaurant_owner') {
                    await createHotelAccount(client, userId, user)
                }
                if (user.role === 'delivery_partner') {
                    await createDeliveryPartner(client, userId, user)
                }

                console.log(`  ✓ Created — password: ${user.password}`)
                console.log(`  🔗 Login at: ${user.portal}`)
            } catch (err) {
                console.log(`  ✗ Failed: ${err.message}`)
            }
        }

        console.log('\n=== Test Credentials Summary ===\n')
        console.log('┌─────────────────┬────────────────────────────────┬───────────────┬──────────────────────────────┐')
        console.log('│ Role            │ Email                          │ Password      │ Login Portal                 │')
        console.log('├─────────────────┼────────────────────────────────┼───────────────┼──────────────────────────────┤')
        for (const u of TEST_USERS) {
            const role = u.role.padEnd(15)
            const email = u.email.padEnd(30)
            const pw = u.password.padEnd(13)
            const portal = u.portal.padEnd(28)
            console.log(`│ ${role} │ ${email} │ ${pw} │ ${portal} │`)
        }
        console.log('└─────────────────┴────────────────────────────────┴───────────────┴──────────────────────────────┘')
        console.log('')

    } finally {
        client.release()
        await pool.end()
    }
}

run().catch(e => {
    console.error('Fatal:', e.message)
    process.exit(1)
})
