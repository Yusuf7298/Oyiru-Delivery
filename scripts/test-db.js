require('dotenv').config()
const { Pool } = require('pg')

console.log('Connecting to:', process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ':***@'))

const p = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false }
})

p.query('SELECT COUNT(*) as users FROM "user"')
    .then(r => {
        console.log('SUCCESS — users in DB:', r.rows[0].users)
        p.end()
    })
    .catch(e => {
        console.error('FAILED:', e.message)
        p.end()
        process.exit(1)
    })
