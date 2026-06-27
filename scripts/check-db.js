const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
    try {
        // List all tables + row counts
        const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name
    `);

        console.log('\n=== TABLES IN DB ===');
        for (const row of tables.rows) {
            const count = await pool.query(`SELECT COUNT(*) FROM "${row.table_name}"`);
            console.log(`  ${row.table_name}: ${count.rows[0].count} rows`);
        }

        // Check critical tables exist
        const criticalTables = ['user', 'session', 'users_profile', 'products', 'orders', 'order_items', 'product_orders', 'product_order_items', 'deliveries', 'cart', 'cart_items'];
        console.log('\n=== CRITICAL TABLE CHECK ===');
        const existing = tables.rows.map(r => r.table_name);
        for (const t of criticalTables) {
            console.log(`  ${t}: ${existing.includes(t) ? 'EXISTS' : 'MISSING'}`);
        }

        // Check user + role distribution
        const profileRoles = await pool.query(`SELECT role, COUNT(*) FROM users_profile GROUP BY role`).catch(() => ({ rows: [] }));
        console.log('\n=== USER ROLES ===');
        profileRoles.rows.forEach(r => console.log(`  ${r.role}: ${r.count}`));

        // Total users
        const users = await pool.query(`SELECT COUNT(*) FROM "user"`).catch(() => ({ rows: [{ count: 0 }] }));
        console.log(`  total users: ${users.rows[0].count}`);

        // Order stats
        const orderStats = await pool.query(`SELECT status, COUNT(*) FROM orders GROUP BY status ORDER BY status`).catch(() => ({ rows: [] }));
        console.log('\n=== ORDER STATUS (orders table) ===');
        if (orderStats.rows.length === 0) console.log('  empty');
        orderStats.rows.forEach(r => console.log(`  ${r.status}: ${r.count}`));

        const prodOrders = await pool.query(`SELECT status, COUNT(*) FROM product_orders GROUP BY status ORDER BY status`).catch(e => ({ rows: [], err: e.message }));
        console.log('\n=== ORDER STATUS (product_orders table) ===');
        if (prodOrders.err) console.log('  ERROR:', prodOrders.err);
        else if (prodOrders.rows.length === 0) console.log('  empty');
        else prodOrders.rows.forEach(r => console.log(`  ${r.status}: ${r.count}`));

        // Products
        const prods = await pool.query(`SELECT COUNT(*), SUM("stockQuantity") as total_stock FROM products`).catch(() => ({ rows: [{}] }));
        console.log('\n=== PRODUCTS ===');
        console.log(`  count: ${prods.rows[0].count}, total stock: ${prods.rows[0].total_stock}`);

        // Sessions
        const sessions = await pool.query(`SELECT COUNT(*) FROM session WHERE "expiresAt" > NOW()`).catch(() => ({ rows: [{ count: 0 }] }));
        console.log('\n=== ACTIVE SESSIONS ===');
        console.log(`  active: ${sessions.rows[0].count}`);

    } catch (e) {
        console.log('ERROR:', e.message);
    } finally {
        await pool.end();
    }
}

check();
