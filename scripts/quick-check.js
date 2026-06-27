const { Pool } = require('pg');
require('dotenv').config();
const p = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });

async function run() {
    const client = await p.connect();
    try {
        const tables = await client.query(`
      SELECT table_name, 
        (SELECT COUNT(*) FROM information_schema.columns c2 WHERE c2.table_name = t.table_name AND c2.table_schema='public') as cols
      FROM information_schema.tables t
      WHERE table_schema='public' ORDER BY table_name
    `);
        console.log('=== DB TABLES ===');
        for (const r of tables.rows) {
            const cnt = await client.query(`SELECT COUNT(*) as n FROM "${r.table_name}"`);
            const flag = Number(cnt.rows[0].n) > 0 ? '✓' : '·';
            console.log(`  ${flag} ${r.table_name} (${cnt.rows[0].n} rows)`);
        }
    } finally {
        client.release();
        await p.end();
    }
}
run().catch(e => { console.error(e.message); process.exit(1); });
