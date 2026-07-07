require('dotenv').config()
const { Pool } = require('pg')

const BASE = 'http://localhost:3000'
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

async function run() {
    const client = await pool.connect()
    const email = 'superadmin@oyiru.com'
    const password = '1q2w3e4r'
    const name = 'Oyiru Super Admin'

    try {
        // Delete existing account if any
        const ex = await client.query(`SELECT id FROM "user" WHERE email = $1`, [email])
        if (ex.rows.length) {
            const id = ex.rows[0].id
            for (const q of [
                `DELETE FROM users_profile WHERE "userId" = '${id}'`,
                `DELETE FROM session WHERE "userId" = '${id}'`,
                `DELETE FROM account WHERE "userId" = '${id}'`,
                `DELETE FROM "user" WHERE id = '${id}'`,
            ]) await client.query(q).catch(() => { })
            console.log('Removed existing account')
        }

        // Sign up via Better Auth
        const res = await fetch(`${BASE}/api/auth/sign-up/email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Origin': BASE },
            body: JSON.stringify({ email, password, name }),
        })

        if (!res.ok) {
            const err = await res.text()
            throw new Error(`Sign-up failed (${res.status}): ${err}`)
        }
        console.log('Account created via Better Auth')

        // Set role to super_admin
        const u = await client.query(`SELECT id FROM "user" WHERE email = $1`, [email])
        const userId = u.rows[0].id

        const ep = await client.query(`SELECT id FROM users_profile WHERE "userId" = $1`, [userId])
        if (ep.rows.length) {
            await client.query(`UPDATE users_profile SET role = 'super_admin', "updatedAt" = NOW() WHERE "userId" = $1`, [userId])
        } else {
            await client.query(
                `INSERT INTO users_profile (id, "userId", role, "isVerified", "createdAt", "updatedAt") VALUES ($1, $2, 'super_admin', true, NOW(), NOW())`,
                [`prof_sa_${Date.now()}`, userId]
            )
        }
        console.log('Role set to super_admin')

        // Verify sign-in works
        const login = await fetch(`${BASE}/api/auth/sign-in/email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Origin': BASE },
            body: JSON.stringify({ email, password }),
        })

        if (login.ok) {
            console.log('\n✓ Login verified successfully\n')
            console.log('  Email:    superadmin@oyiru.com')
            console.log('  Password: 1q2w3e4r')
            console.log('  Role:     super_admin')
            console.log('  Portal:   /super-admin/sign-in\n')
        } else {
            const err = await login.text()
            console.log('Login verification failed:', err)
        }
    } finally {
        client.release()
        await pool.end()
    }
}

run().catch(e => { console.error('Error:', e.message); process.exit(1) })
