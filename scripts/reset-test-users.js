/**
 * Recreate test users via the live Better Auth API.
 * Server must be running on port 3000 first.
 * Run: node scripts/reset-test-users.js
 */
require('dotenv').config()
const { Pool } = require('pg')

const BASE = 'http://localhost:3000'
const ORIGIN = 'http://localhost:3000'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
})

const TEST_USERS = [
    { name: 'Test Customer', email: 'customer@test.oyru.com', password: 'Test@1234', role: 'customer', portal: '/' },
    { name: 'Grand Palace Hotel', email: 'hotel@test.oyru.com', password: 'Hotel@1234', role: 'restaurant_owner', portal: '/auth-hotel-m4p2' },
    { name: 'Test Driver', email: 'driver@test.oyru.com', password: 'Driver@1234', role: 'delivery_partner', portal: '/auth-driver-k9v1' },
    { name: 'Test Admin', email: 'admin@test.oyru.com', password: 'Admin@1234', role: 'admin', portal: '/auth-admin-x7f9' },
    { name: 'Super Admin Oyru', email: 'superadmin@test.oyru.com', password: 'Super@1234', role: 'super_admin', portal: '/super-admin/sign-in' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

async function authFetch(path, body) {
    const res = await fetch(`${BASE}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Origin': ORIGIN,
        },
        body: JSON.stringify(body),
    })
    return res
}

async function deleteUser(client, email) {
    const u = await client.query(`SELECT id FROM "user" WHERE email = $1`, [email])
    if (!u.rows.length) return false
    const id = u.rows[0].id
    for (const q of [
        `DELETE FROM order_status_history WHERE "changedBy" = '${id}'`,
        `DELETE FROM oyru_order_feedbacks WHERE "userId" = '${id}'`,
        `DELETE FROM oyru_order_returns WHERE "userId" = '${id}'`,
        `DELETE FROM oyru_orders WHERE "userId" = '${id}'`,
        `DELETE FROM deliveries WHERE "driverId" = '${id}'`,
        `DELETE FROM delivery_partners WHERE "userId" = '${id}'`,
        `DELETE FROM hotel_accounts WHERE "userId" = '${id}'`,
        `DELETE FROM users_profile WHERE "userId" = '${id}'`,
        `DELETE FROM session WHERE "userId" = '${id}'`,
        `DELETE FROM account WHERE "userId" = '${id}'`,
        `DELETE FROM "user" WHERE id = '${id}'`,
    ]) {
        await client.query(q).catch(() => { })
    }
    return true
}

async function setRole(client, email, role) {
    const u = await client.query(`SELECT id FROM "user" WHERE email = $1`, [email])
    if (!u.rows.length) throw new Error('User not found after sign-up')
    const userId = u.rows[0].id

    const existing = await client.query(`SELECT id FROM users_profile WHERE "userId" = $1`, [userId])
    if (existing.rows.length) {
        await client.query(`UPDATE users_profile SET role = $1, "updatedAt" = NOW() WHERE "userId" = $2`, [role, userId])
    } else {
        await client.query(
            `INSERT INTO users_profile (id, "userId", role, "isVerified", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, true, NOW(), NOW())`,
            [`prof_test_${Date.now()}`, userId, role]
        )
    }
    return userId
}

async function createDeliveryPartner(client, userId) {
    const ex = await client.query(`SELECT id FROM delivery_partners WHERE "userId" = $1`, [userId])
    if (ex.rows.length) return
    await client.query(
        `INSERT INTO delivery_partners
     (id, "userId", "phoneNumber", "isVerified", "isActive", "totalOrders", "totalEarnings", "createdAt", "updatedAt")
     VALUES ($1, $2, '+251911000002', true, true, 0, 0, NOW(), NOW())`,
        [`dp_test_${Date.now()}`, userId]
    )
}

async function createHotelAccount(client, userId) {
    const cols = await client.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name='hotel_accounts' AND table_schema='public'`
    )
    if (!cols.rows.some(r => r.column_name === 'userId')) {
        console.log('    ⚠  hotel_accounts has no userId column — skipping')
        return
    }
    const ex = await client.query(`SELECT id FROM hotel_accounts WHERE "userId" = $1`, [userId])
    if (ex.rows.length) return
    await client.query(
        `INSERT INTO hotel_accounts
     (id, "userId", "companyName", "contactPerson", email, phone, "billingType", "isActive", "createdAt", "updatedAt")
     VALUES ($1, $2, 'Grand Palace Hotel (Test)', 'Grand Palace Hotel', 'hotel@test.oyru.com', '+251911000001', 'INVOICE', true, NOW(), NOW())`,
        [`hot_test_${Date.now()}`, userId]
    )
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function run() {
    const client = await pool.connect()
    console.log('\n=== Resetting Test Users ===\n')

    try {
        for (const u of TEST_USERS) {
            console.log(`\n[${u.role.toUpperCase()}] ${u.email}`)

            try {
                // 1. Delete old
                const deleted = await deleteUser(client, u.email)
                if (deleted) console.log('    🗑  Deleted old account')

                // 2. Sign up through Better Auth
                const signUpRes = await authFetch('/api/auth/sign-up/email', {
                    name: u.name, email: u.email, password: u.password,
                })
                if (!signUpRes.ok) {
                    const txt = await signUpRes.text()
                    throw new Error(`sign-up HTTP ${signUpRes.status}: ${txt.slice(0, 120)}`)
                }
                console.log('    ✓  Signed up via Better Auth')

                // 3. Set role
                const userId = await setRole(client, u.email, u.role)
                console.log(`    ✓  Role → ${u.role}`)

                // 4. Role extras
                if (u.role === 'delivery_partner') {
                    await createDeliveryPartner(client, userId)
                    console.log('    ✓  delivery_partners record created')
                }
                if (u.role === 'restaurant_owner') {
                    await createHotelAccount(client, userId)
                    console.log('    ✓  hotel_accounts record created')
                }

            } catch (err) {
                console.log(`    ✗  ${err.message}`)
            }
        }

        // ── Verify sign-in for all accounts ──────────────────────────────────────
        console.log('\n=== Verifying Sign-In ===\n')
        let allOk = true
        for (const u of TEST_USERS) {
            const res = await authFetch('/api/auth/sign-in/email', {
                email: u.email, password: u.password,
            })
            if (res.ok) {
                const data = await res.json()
                console.log(`  ✓  ${u.role.padEnd(18)}  session: ${data.session?.id?.slice(0, 12) || 'yes'}`)
            } else {
                const err = await res.text()
                console.log(`  ✗  ${u.role.padEnd(18)}  ${res.status}: ${err.slice(0, 100)}`)
                allOk = false
            }
        }

        // ── Summary ───────────────────────────────────────────────────────────────
        console.log('\n=== Test Credentials ===\n')
        console.log('  Role               Email                              Password       Portal')
        console.log('  ─────────────────  ─────────────────────────────────  ─────────────  ──────────────────────')
        for (const u of TEST_USERS) {
            const ok = allOk ? '✓' : '?'
            console.log(`  ${ok} ${u.role.padEnd(17)}  ${u.email.padEnd(33)}  ${u.password.padEnd(13)}  ${u.portal}`)
        }
        console.log('')

    } finally {
        client.release()
        await pool.end()
    }
}

run().catch(e => { console.error('\nFatal:', e.message); process.exit(1) })
