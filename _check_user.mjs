import { Pool } from 'pg'
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
for (const t of ['user','session','account','verification']) {
  const r = await pool.query(
    `select column_name, data_type, is_nullable from information_schema.columns where table_schema='public' and table_name=$1 order by ordinal_position`, [t])
  console.log(`\n=== ${t} ===`)
  for (const c of r.rows) console.log(`  ${c.column_name} : ${c.data_type} ${c.is_nullable==='NO'?'NOT NULL':''}`)
}
await pool.end()
