# Oyru Delivery MVP - Performance Optimization Guide

## Performance Targets

| Component | Target | Blocker if > |
|---|---|---|
| Homepage LCP | <2s | 5s |
| Product Search | <500ms | 2s |
| API Response | <500ms | 2s |
| Order Creation | <1s | 3s |
| Dashboard Load | <2s | 5s |
| Cart Operations | <300ms | 1s |
| Mobile Home | <3s | 8s |

## Frontend Optimizations

### 1. Image Optimization
```tsx
// Use Next.js Image component for automatic optimization
import Image from 'next/image'

export function ProductCard({ product }) {
  return (
    <Image
      src={product.image}
      alt={product.name}
      width={300}
      height={300}
      priority={false}
      quality={75}
      placeholder="blur"
      blurDataURL={product.blurHash}
    />
  )
}
```

**Checklist:**
- [ ] All images use next/image component
- [ ] Images sized appropriately for device
- [ ] Blur placeholders added for better UX
- [ ] AVIF format used where supported
- [ ] Image quality set to 75-85

### 2. Code Splitting & Lazy Loading
```tsx
// Lazy load heavy components
import dynamic from 'next/dynamic'

const OrderTimeline = dynamic(
  () => import('@/components/order-timeline'),
  { loading: () => <Skeleton /> }
)

export default function OrderDetail() {
  return <OrderTimeline /> // Loaded on demand
}
```

**Checklist:**
- [ ] Heavy components lazy loaded
- [ ] Route-based code splitting configured
- [ ] Loading states provided
- [ ] Prefetch on route hover

### 3. Memoization
```tsx
import { memo } from 'react'

const ProductCard = memo(function ProductCard({ product }) {
  return <div>{product.name}</div>
}, (prev, next) => prev.product.id === next.product.id)

export default ProductCard
```

**Checklist:**
- [ ] React.memo used for list items
- [ ] useMemo for expensive computations
- [ ] useCallback for event handlers in lists
- [ ] Proper dependency arrays

### 4. Pagination
```tsx
// Fetch products in chunks
const PRODUCTS_PER_PAGE = 20

export function ProductList() {
  const [page, setPage] = useState(1)
  const { data } = useSWR(
    `/api/products?page=${page}&limit=${PRODUCTS_PER_PAGE}`,
    fetcher
  )
  
  return (
    <>
      <ProductGrid products={data.products} />
      <Pagination
        page={page}
        total={data.total}
        onPageChange={setPage}
      />
    </>
  )
}
```

**Checklist:**
- [ ] Pagination implemented for product lists
- [ ] API supports limit/offset parameters
- [ ] Load more button or pagination controls
- [ ] Default page size: 20 items

### 5. Virtual Scrolling (for large lists)
```tsx
import { FixedSizeList } from 'react-window'

function OrderList({ orders }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={orders.length}
      itemSize={60}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <OrderCard order={orders[index]} />
        </div>
      )}
    </FixedSizeList>
  )
}
```

**Checklist:**
- [ ] Virtual scrolling for order lists
- [ ] Only visible rows rendered
- [ ] Smooth scrolling maintained
- [ ] Reduced DOM nodes

## API & Backend Optimizations

### 1. Database Query Optimization
```typescript
// Use select to fetch only needed fields
const orders = await db
  .select({
    id: oyruOrders.id,
    orderNumber: oyruOrders.orderNumber,
    status: oyruOrders.status,
    totalAmount: oyruOrders.totalAmount,
    createdAt: oyruOrders.createdAt,
  })
  .from(oyruOrders)
  .where(eq(oyruOrders.userId, userId))
  .limit(20)
  .offset((page - 1) * 20)

// Add indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_products_category ON products(category_id);
```

**Checklist:**
- [ ] Only needed fields selected
- [ ] Indexes created on frequently filtered columns
- [ ] N+1 queries eliminated with joins
- [ ] Pagination enforced
- [ ] Query plans analyzed

### 2. Caching Strategy
```typescript
// Use SWR for client caching
import useSWR from 'swr'

export function useProducts() {
  const { data, error, isLoading } = useSWR(
    '/api/products',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // Cache 1 minute
    }
  )
  return { data, error, isLoading }
}
```

**Checklist:**
- [ ] SWR caching configured
- [ ] Cache headers set (Cache-Control)
- [ ] Stale-while-revalidate pattern used
- [ ] Cache invalidation on mutations

### 3. API Response Compression
```typescript
// next.config.js
const nextConfig = {
  compress: true, // Enable gzip
  // ...
}
```

**Checklist:**
- [ ] Gzip compression enabled
- [ ] Brotli compression preferred in nginx
- [ ] Response sizes < 100KB for most endpoints

### 4. Connection Pooling
```typescript
// Database connection pooling
// Neon handles this automatically
// For manual connections:
const pool = new Pool({
  max: 20,
  min: 5,
  idle: 10000,
  connection_timeout: 5000,
})
```

**Checklist:**
- [ ] Database connection pool configured
- [ ] Pool size optimized (20-50)
- [ ] Idle timeout set (10-30s)

## Network Optimizations

### 1. HTTP/2 Push
```typescript
// next.config.js
const nextConfig = {
  // HTTP/2 enabled by default on modern servers
  // Ensure CDN supports HTTP/2
}
```

### 2. CDN Integration
- [ ] Static assets served from CDN
- [ ] Image optimization via CDN
- [ ] Geographic distribution

### 3. Reduce Bundle Size
```json
// package.json - remove unused packages
// Use npm audit to identify vulnerabilities
// Keep dependencies minimal
```

**Checklist:**
- [ ] Bundle size < 200KB (gzipped)
- [ ] Run `npm run build` and check sizes
- [ ] Remove unused dependencies
- [ ] Tree-shake unused code

## Monitoring & Metrics

### 1. Web Vitals
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

**Metrics to Track:**
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] FCP (First Contentful Paint) < 1.8s

### 2. Performance Monitoring
```typescript
// pages/api/health
import { performance } from 'perf_hooks'

export async function GET() {
  const start = performance.now()
  
  // Do work...
  
  const duration = performance.now() - start
  return Response.json({ duration_ms: duration })
}
```

### 3. Logging Slow Queries
```typescript
const start = Date.now()
const result = await db.query(sql)
const duration = Date.now() - start

if (duration > 500) {
  logger.warn(`Slow query: ${duration}ms`, { query: sql })
}
```

**Checklist:**
- [ ] Slow queries logged (>500ms)
- [ ] API latencies tracked
- [ ] User experience metrics monitored
- [ ] Alerts for performance degradation

## Load Testing

### Using Artillery
```yaml
# load-test.yml
config:
  target: 'https://yourdomain.com'
  phases:
    - duration: 60
      arrivalRate: 10 # requests per second
      name: 'Warm up'
    - duration: 120
      arrivalRate: 50
      name: 'Ramp up'
    - duration: 60
      arrivalRate: 100
      name: 'Spike'

scenarios:
  - name: 'Homepage'
    flow:
      - get:
          url: '/'
  - name: 'Product Search'
    flow:
      - get:
          url: '/api/products?search=apple'
```

**Run Test:**
```bash
artillery run load-test.yml
```

**Checklist:**
- [ ] Homepage handles 100 rps
- [ ] APIs handle 50 rps
- [ ] Database handles connection spikes
- [ ] No timeout errors under load

## Optimization Checklist

### Critical (Must Fix)
- [ ] Homepage LCP < 2s
- [ ] API responses < 500ms
- [ ] Images optimized with next/image
- [ ] Database indexes present
- [ ] Connection pooling configured

### Important (Should Fix)
- [ ] Code splitting implemented
- [ ] Pagination on list views
- [ ] Caching headers configured
- [ ] Bundle size < 200KB
- [ ] Mobile performance optimized

### Nice to Have
- [ ] Service Worker caching
- [ ] Image blur placeholders
- [ ] Prefetch next page on hover
- [ ] Skeleton loading states
- [ ] Error boundary retry logic

## Performance Budget

```
// Enforce performance budget in ci.json
{
  "bundles": [
    {
      "name": "main",
      "maxSize": "200kb"
    }
  ],
  "metrics": [
    {
      "name": "LCP",
      "value": 2500,
      "unit": "ms"
    }
  ]
}
```

## Testing Performance Locally

```bash
# Measure bundle size
npm run build

# Analyze bundle
npm install --save-dev webpack-bundle-analyzer
# Add to next.config.js and rebuild

# Test performance with Lighthouse
# Use Chrome DevTools -> Lighthouse
# Run in production mode for accurate results

# Mobile performance test
# Use Chrome DevTools -> Performance
# Throttle CPU (4x slowdown) and Network (Slow 4G)
```

## Production Deployment Checklist

- [ ] Minification enabled
- [ ] Source maps disabled for production
- [ ] Caching headers configured
- [ ] CDN configured
- [ ] Compression enabled
- [ ] Database indexes verified
- [ ] Load testing passed
- [ ] Monitoring configured
- [ ] Alerts set up for performance degradation
