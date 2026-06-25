import { Pool } from 'pg'
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const r = await pool.query(`select table_name from information_schema.tables where table_schema='public' order by table_name`)
console.log('TABLES:', r.rows.map(x=>x.table_name).join(', ') || '(none)')
await pool.end()
