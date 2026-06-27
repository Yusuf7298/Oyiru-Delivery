const { Pool } = require('pg');
require('dotenv').config();
const p = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    try {
        const prods = await p.query('SELECT id, name, price, "stockQuantity" FROM products LIMIT 3');
        console.log('PRODUCTS:', JSON.stringify(prods.rows));

        const orders = await p.query('SELECT id, "orderNumber", status, "totalAmount", "createdAt" FROM oyru_orders');
        console.log('OYRU_ORDERS:', JSON.stringify(orders.rows));

        const profiles = await p.query('SELECT id, role, "userId" FROM users_profile');
        console.log('PROFILES:', JSON.stringify(profiles.rows.map(r => ({ id: r.id, role: r.role, userId: r.userId }))));

        const cats = await p.query('SELECT id, name FROM oyru_categories');
        console.log('CATEGORIES:', JSON.stringify(cats.rows));

        const productOrders = await p.query('SELECT COUNT(*) as c FROM product_orders');
        console.log('PRODUCT_ORDERS count:', productOrders.rows[0].c);

        const activeSessions = await p.query('SELECT COUNT(*) as c FROM session WHERE "expiresAt" > NOW()');
        console.log('ACTIVE_SESSIONS:', activeSessions.rows[0].c);
    } catch (e) {
        console.log('ERR:', e.message);
    } finally {
        await p.end();
    }
}
run();
