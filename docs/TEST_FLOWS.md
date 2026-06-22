# Oyru Delivery MVP - Test Flows & Scenarios

This document outlines detailed test flows for all MVP features.

## Test User Credentials

Generate test users first:
```bash
pnpm run generate-test-users
```

### Available Test Accounts

```
CUSTOMER:
  Email: customer@test.com
  Password: Test123!@#

ADMIN:
  Email: admin@test.com
  Password: Admin123!@#

DRIVER:
  Email: driver@test.com
  Password: Driver123!@#

SUPER_ADMIN:
  Email: super_admin@test.com
  Password: SuperAdmin123!@#
```

## Flow 1: Customer Order Placement

### Step 1: Browse Products
1. Open application homepage
2. Verify all 5 categories display: Fresh Produce, Dairy & Eggs, Beverages, Snacks, Essentials
3. Verify 20 products loaded with images and prices in INR (₹)
4. Click each category to filter products
5. Verify category filter works correctly

### Step 2: Add to Cart
1. Click "Add to Cart" on 3 different products
2. Select quantities (test with 1, 5, 10)
3. Verify cart count increases
4. Verify prices calculate correctly for quantities

### Step 3: View Cart
1. Click cart button
2. Verify all added products display with correct quantities
3. Verify subtotal calculation is accurate
4. Test increasing/decreasing quantities
5. Test removing items

### Step 4: Checkout
1. Fill delivery address (required field)
2. Add delivery notes (optional)
3. Select payment method (COD or Invoice)
4. Click "Proceed to Checkout"
5. Verify order is created with:
   - Order number generated
   - Status = 'pending'
   - Correct total amount
6. Verify cart clears after checkout

### Step 5: Track Order
1. Navigate to "Your Orders" page
2. Verify all customer orders display
3. Click order to view details
4. Verify order timeline shows progression
5. Confirm delivery address and notes display correctly

**Expected Result**: Order successfully placed, tracked, and customer can view status updates.

---

## Flow 2: Admin Product Management

### Step 1: Admin Login
1. Login with: `admin@test.com` / `Admin123!@#`
2. Verify redirected to admin dashboard
3. Verify no access to customer/driver pages

### Step 2: Manage Products
1. Navigate to Admin → Products
2. Verify all 20 products listed with stock quantities
3. Click edit on a product
4. Update price (e.g., 50 to 75)
5. Update stock (e.g., 100 to 80)
6. Save changes
7. Verify changes reflected in product list

### Step 3: Create New Product
1. Click "Add Product"
2. Fill form:
   - Name: "Test Product"
   - Category: Any
   - Price: 99.99
   - Stock: 50
   - Description: Test description
3. Click Create
4. Verify product appears in list with new data

### Step 4: Delete Product
1. Locate created product in list
2. Click Delete
3. Confirm deletion
4. Verify product removed from list

### Step 5: View Orders
1. Navigate to Admin → Oyru Orders
2. Verify all orders display
3. Click order to view details and items
4. Verify can change order status

**Expected Result**: Admin successfully manages products and orders.

---

## Flow 3: Inventory Stock Management

### Step 1: Check Stock
1. Admin login
2. Go to Products list
3. Verify stock quantities display
4. Sort by stock to find low items

### Step 2: Monitor Low Stock
1. Navigate to Admin → Inventory
2. Verify products with stock ≤ 10 highlighted
3. Verify inventory history shows changes
4. Verify reason for change documented

### Step 3: Test Stock Decrement
1. Customer places order with 5 items of a product with stock 10
2. Admin checks product stock
3. Verify stock is now 5
4. Verify inventory log shows: "Order ORD-xxx"

### Step 4: Prevent Overselling
1. Customer attempts to order 15 items when only 5 available
2. Verify checkout fails with "Insufficient stock" message
3. Verify customer can adjust quantity to 5 and proceed

**Expected Result**: Stock prevents overselling and tracks all changes.

---

## Flow 4: Order Lifecycle

### Step 1: Create Order
1. Place new customer order
2. Verify status = 'pending'
3. Verify order shows in admin orders list

### Step 2: Status Transitions
1. Admin navigates to order
2. Update status: pending → confirmed
3. Verify UI updates immediately
4. Update status: confirmed → packing
5. Update status: packing → ready
6. Update status: ready → picked_up
7. Update status: picked_up → in_transit
8. Update status: in_transit → delivered
9. Verify order shows as delivered with checkmark

### Step 3: Invalid Transitions
1. Create new order (pending)
2. Attempt to change directly to 'delivered'
3. Verify rejected with error message
4. Verify current status unchanged

### Step 4: Cancellation
1. Create order with pending status
2. Click Cancel Order
3. Verify status changes to 'cancelled'
4. Verify stock is refunded (if ordered)
5. Verify cannot cancel already delivered orders

**Expected Result**: Order lifecycle enforces valid state transitions.

---

## Flow 5: Role-Based Security

### Step 1: Customer Access
1. Login as customer
2. Verify access to: /, /cart, /customer/orders, /customer/orders/[id]
3. Navigate to /admin → Verify 401 Unauthorized
4. Navigate to /driver → Verify 401 Unauthorized
5. Navigate to /hotel → Verify 401 Unauthorized

### Step 2: Admin Access
1. Login as admin
2. Verify access to all admin pages
3. Attempt to edit customer order from URL → Verify allowed
4. API call with admin token to driver endpoint → Verify allowed

### Step 3: Driver Access
1. Login as driver
2. Verify access to: /driver, /driver/available, /driver/active
3. Navigate to /admin → Verify 403 Forbidden
4. Navigate to /customer → Verify 403 Forbidden

### Step 4: Data Isolation
1. Login as customer-1
2. Place order
3. Logout and login as customer-2
4. Verify cannot see customer-1's orders
5. API request with customer-2 token to customer-1's order → Verify 403

**Expected Result**: Each role can only access assigned pages and data.

---

## Flow 6: Hotel Ordering (B2B)

### Step 1: Hotel Login
1. Create hotel user or use existing
2. Login to hotel portal
3. Verify /hotel page displays stats

### Step 2: Browse & Order
1. Navigate to /hotel/ordering
2. Search products by category
3. Add 100 units of a product to cart
4. Add 50 units of another product
5. View cart with bulk quantities

### Step 3: Place Hotel Order
1. Verify delivery address field
2. Add delivery notes: "Deliver to kitchen entrance"
3. Select "Invoice" payment method
4. Submit order
5. Verify order created with hotel billing info

### Step 4: Track Hotel Orders
1. Navigate to /hotel/orders
2. View all hotel orders placed
3. Click order to view details
4. Verify can download invoice (future feature)

**Expected Result**: Hotels can place bulk orders with invoice billing.

---

## Flow 7: Error Handling

### Step 1: Validation Errors
1. Try to place order without delivery address → Error message
2. Try to add negative quantity → Error message
3. Try to order with invalid email → Error message

### Step 2: Stock Errors
1. Order 20 items when stock is 10 → "Insufficient stock"
2. Verify can adjust and succeed with 10

### Step 3: Permission Errors
1. Customer token accessing /admin API → 401
2. Driver token accessing /customer/orders/[id] → 403
3. Anonymous token accessing protected route → 401

### Step 4: Database Errors
1. If DB goes down during order → Graceful error message
2. Health check endpoint returns error status → 503

**Expected Result**: All errors handled gracefully with clear messages.

---

## Flow 8: Performance Testing

### Step 1: Load Times
```
Homepage:     < 2s
Product list: < 1s
Checkout:     < 3s
Admin orders: < 3s
```

1. Open Network tab in DevTools
2. Load each page
3. Verify load times meet targets
4. Verify no 404s or failed requests

### Step 2: Database Queries
1. Add debug logging to queries
2. Confirm no N+1 problems
3. Verify indexes on frequently filtered columns
4. Monitor slow query logs

**Expected Result**: Application performs within acceptable parameters.

---

## Flow 9: Edge Cases

### Step 1: Simultaneous Orders
1. Have 2 browser windows open as same customer
2. In window 1: Add product with stock 5 to cart
3. In window 2: Add same product with stock 5 to cart
4. In window 1: Order 4 items
5. In window 2: Try to order 4 items
6. Verify window 2 gets "Insufficient stock" error

### Step 2: Session Timeout
1. Login to customer account
2. Wait for session to expire (test with short timeout)
3. Try to access protected route
4. Verify redirect to login with message

### Step 3: Concurrent Status Updates
1. Admin-1 updates order status to "packing"
2. Admin-2 attempts to update to "ready" simultaneously
3. Verify only one update succeeds
4. Verify no state corruption

**Expected Result**: Edge cases handled correctly without data loss.

---

## Flow 10: Smoke Testing (Quick Validation)

Quick checklist for daily testing:

- [ ] Application starts without errors
- [ ] Health check passes: GET /api/health → 200
- [ ] Customer can login
- [ ] Admin can login
- [ ] Driver can login
- [ ] Can place order (customer flow)
- [ ] Order appears in admin orders
- [ ] Can change order status
- [ ] Customer can view their orders
- [ ] No console errors

Expected time: ~5 minutes

---

## Regression Testing Checklist

After any code changes, verify:

- [ ] Customer order flow still works
- [ ] Admin dashboard functional
- [ ] Stock doesn't go negative
- [ ] Order status transitions valid
- [ ] Permissions enforced
- [ ] No new console errors
- [ ] Performance maintained
- [ ] All APIs responding correctly

---

## Performance Benchmarks

**Baseline Metrics** (to be measured on first production deployment):
- Homepage load: ______
- API response time (avg): ______
- Database query time (avg): ______
- Concurrent users supported: ______

**Targets**:
- Homepage < 2s
- API response < 500ms
- 95th percentile < 1s
- Support 1000+ concurrent users

---

## Test Data Requirements

Run before each test cycle:
```bash
# Generate test users
pnpm run generate-test-users

# Seed test products and categories
pnpm run seed

# Optional: Generate test orders
pnpm run generate-test-data
```

---

## Known Issues & Workarounds

Document any known issues found during testing:

1. Issue: ...
   Workaround: ...

2. Issue: ...
   Workaround: ...
