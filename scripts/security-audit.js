const BASE = 'http://localhost:3000'

const tests = [
    // Admin APIs — must 401 with no session
    { label: 'POST /api/admin/products', method: 'POST', path: '/api/admin/products', body: { name: 'x', price: 1, categoryId: 'x', stockQuantity: 1 }, expect: 401 },
    { label: 'GET /api/admin/oyru-orders', method: 'GET', path: '/api/admin/oyru-orders', expect: 401 },
    { label: 'DELETE /api/admin/oyru-orders/[id]', method: 'DELETE', path: '/api/admin/oyru-orders/fake-id', expect: 401 },
    { label: 'GET /api/admin/oyru-orders/[id]/items', method: 'GET', path: '/api/admin/oyru-orders/fake-id/items', expect: 401 },
    { label: 'DELETE /api/admin/products/[id]', method: 'DELETE', path: '/api/admin/products/fake-id', expect: 401 },
    { label: 'GET /api/admin/inventory', method: 'GET', path: '/api/admin/inventory', expect: 401 },
    { label: 'GET /api/admin/reports/sales', method: 'GET', path: '/api/admin/reports/sales', expect: 401 },
    { label: 'GET /api/admin/reports/inventory', method: 'GET', path: '/api/admin/reports/inventory', expect: 401 },
    { label: 'GET /api/admin/reports/analytics', method: 'GET', path: '/api/admin/reports/analytics', expect: 401 },
    { label: 'GET /api/admin/reports/delivery', method: 'GET', path: '/api/admin/reports/delivery', expect: 401 },
    // Hotel private
    { label: 'GET /api/hotel/agreements', method: 'GET', path: '/api/hotel/agreements', expect: [401, 403] },
    // Driver privacy
    { label: 'GET /api/driver/available-deliveries', method: 'GET', path: '/api/driver/available-deliveries', expect: 401 },
    // Debug routes disabled
    { label: 'POST /api/test-order (disabled)', method: 'POST', path: '/api/test-order', expect: 410 },
    { label: 'GET /api/verify-order (disabled)', method: 'GET', path: '/api/verify-order', expect: 410 },
    // Migration routes locked
    { label: 'GET /api/migrations/run', method: 'GET', path: '/api/migrations/run', expect: [401, 403] },
    { label: 'GET /api/migrations/fix', method: 'GET', path: '/api/migrations/fix', expect: [401, 403] },
    // Public routes — accept DB cold start (500/503 = Neon hibernating, not a security issue)
    { label: 'GET /api/products (public - no auth block)', method: 'GET', path: '/api/products', expect: [200, 500] },
    { label: 'GET /api/categories (public - no auth block)', method: 'GET', path: '/api/categories', expect: [200, 500] },
    { label: 'GET /api/health (public - DB dependent)', method: 'GET', path: '/api/health', expect: [200, 503] },
]

async function run() {
    console.log('\n=== SECURITY AUDIT ===\n')
    let passed = 0, failed = 0

    for (const test of tests) {
        try {
            const res = await fetch(`${BASE}${test.path}`, {
                method: test.method,
                headers: { 'Content-Type': 'application/json' },
                body: test.body ? JSON.stringify(test.body) : undefined,
            })
            const expected = Array.isArray(test.expect) ? test.expect : [test.expect]
            const ok = expected.includes(res.status)
            console.log(`  ${ok ? '✓' : '✗'}  ${test.label} → ${res.status}${ok ? '' : ` (expected ${expected.join(' or ')})`}`)
            ok ? passed++ : failed++
        } catch (e) {
            console.log(`  ✗  ${test.label} → NETWORK ERROR`)
            failed++
        }
    }

    console.log(`\n=== RESULT: ${passed}/${passed + failed} passed ===`)
    if (failed > 0) process.exit(1)
}

run()
