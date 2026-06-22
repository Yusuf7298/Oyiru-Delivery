# OYRU PHASE 1 - DAY 2: INTERNAL QA EXECUTION

**Date**: [Set by team]  
**Owner**: QA Lead  
**Duration**: Full day  
**Success Criteria**: All 5 user flows pass, 0 critical issues, test coverage > 90%

---

## PRE-QA CHECKLIST

- [ ] Staging environment stable (from Day 1)
- [ ] All test accounts created and verified
- [ ] QA team briefing completed
- [ ] Test devices/browsers prepared
- [ ] Screenshot tool configured
- [ ] Issue tracking system ready

---

## QA FLOW 1: CUSTOMER JOURNEY (1.5 hours)

### Test Account
- Email: customer@test.local
- Password: Test123!@#
- Role: Customer

### Test Steps

#### 1.1 Sign In & Onboarding
```
[ ] Load https://staging.oyru.example.com
[ ] Verify homepage loads
[ ] Click "Sign In"
[ ] Enter customer@test.local / Test123!@#
[ ] Verify redirected to /customer dashboard
[ ] Verify profile shows customer data
```

**Expected**: Successfully logged in, profile loaded

#### 1.2 Browse Products
```
[ ] Navigate to /customer/products or /products
[ ] Verify 20 products displayed
[ ] Verify categories filterable (5 categories)
[ ] Verify search functional
[ ] Verify product images load
[ ] Verify prices displayed in INR
[ ] Click on product detail
[ ] Verify full product info shows
```

**Expected**: All 20 products visible, searchable, detailed view working

#### 1.3 Add to Cart
```
[ ] From product detail, click "Add to Cart"
[ ] Verify quantity selector visible
[ ] Change quantity to 5
[ ] Click "Add to Cart"
[ ] Verify cart updated
[ ] Navigate to /customer/cart
[ ] Verify 1 item in cart
[ ] Verify quantity is 5
[ ] Verify total calculated correctly
```

**Expected**: Item added, cart updated, total correct

#### 1.4 Checkout
```
[ ] From cart, enter delivery address
[ ] Verify address validation
[ ] Select payment method (COD/Prepaid)
[ ] Click "Place Order"
[ ] Verify order confirmation page
[ ] Verify order number generated
[ ] Verify email confirmation sent (check logs)
```

**Expected**: Order placed, confirmation shown, email sent

#### 1.5 Track Order
```
[ ] Navigate to /customer/orders
[ ] Verify order appears in list
[ ] Click on order
[ ] Verify order detail page loads
[ ] Verify status timeline visible
[ ] Verify current status = "Pending"
[ ] Verify estimated delivery time shown
```

**Expected**: Order visible, timeline accurate, status tracking working

#### 1.6 Sign Out
```
[ ] Click profile menu
[ ] Click "Sign Out"
[ ] Verify redirected to home
[ ] Verify session cleared
```

**Expected**: Properly logged out

### Results
- **Pass**: ✓ ✓ ✓ ✓ ✓ ✓ = Full customer flow working
- **Issues Found**: [List any issues]

---

## QA FLOW 2: HOTEL ORDERING (1.5 hours)

### Test Account
- Email: hotel@test.local
- Password: Test123!@#
- Role: Hotel

### Test Steps

#### 2.1 Sign In
```
[ ] Load https://staging.oyru.example.com
[ ] Click "Sign In"
[ ] Enter hotel@test.local / Test123!@#
[ ] Verify redirected to /hotel dashboard
```

**Expected**: Hotel dashboard loaded

#### 2.2 Dashboard Stats
```
[ ] Verify dashboard shows:
    - Total Orders: 0 or [number]
    - Pending Deliveries: 0 or [number]
    - Total Spending: INR 0 or [amount]
    - Last Order: [date or "No orders"]
```

**Expected**: Stats displayed and accurate

#### 2.3 Browse Products
```
[ ] Navigate to /hotel/ordering
[ ] Verify 20 products displayed
[ ] Verify bulk quantity input (0-999)
[ ] Add 50 units of first product
[ ] Verify cart shows 50 units
[ ] Add 30 units of different product
[ ] Verify cart shows 2 items
```

**Expected**: Bulk ordering functional, cart accumulates

#### 2.4 Place Hotel Order
```
[ ] From cart, verify total price shows
[ ] Enter delivery address: "Grand Hotel, Main St"
[ ] Enter delivery notes: "Morning delivery"
[ ] Select payment: INVOICE
[ ] Click "Place Order"
[ ] Verify order confirmation
[ ] Verify order number generated
```

**Expected**: Hotel order placed successfully

#### 2.5 View Order History
```
[ ] Navigate to /hotel/orders
[ ] Verify new order appears
[ ] Verify order shows:
    - Order number
    - Items & quantities
    - Total amount
    - Status
    - Delivery date
[ ] Click on order
[ ] Verify full details page loads
[ ] Verify item breakdown visible
```

**Expected**: Order history complete, details accurate

### Results
- **Pass**: ✓ ✓ ✓ ✓ ✓ = Hotel flow working
- **Issues Found**: [List any issues]

---

## QA FLOW 3: DRIVER DELIVERY (1.5 hours)

### Test Account
- Email: driver@test.local
- Password: Test123!@#
- Role: Delivery Partner

### Test Steps

#### 3.1 Driver Sign In
```
[ ] Load https://staging.oyru.example.com
[ ] Click "Sign In"
[ ] Enter driver@test.local / Test123!@#
[ ] Verify redirected to /driver dashboard
```

**Expected**: Driver dashboard loaded

#### 3.2 Dashboard Stats
```
[ ] Verify dashboard shows:
    - Active Deliveries: [number]
    - Total Earnings: INR [amount]
    - Completed Orders: [number]
    - Rating: [stars]
```

**Expected**: Driver stats displayed

#### 3.3 Available Deliveries
```
[ ] Navigate to /driver/available
[ ] Verify list of available deliveries
    (from customer & hotel orders placed earlier)
[ ] Verify each shows:
    - Pickup location
    - Delivery location
    - Delivery fee
    - Status: "AVAILABLE"
[ ] Click "Accept Delivery"
[ ] Verify delivery moves to active
```

**Expected**: Deliveries available, can accept

#### 3.4 Active Deliveries
```
[ ] Navigate to /driver/active
[ ] Verify accepted delivery shows
[ ] Verify map with location
[ ] Click "Mark as Picked Up"
[ ] Verify status changes to "Picked Up"
[ ] Click "Start Delivery"
[ ] Verify status changes to "In Transit"
[ ] Click "Delivered"
[ ] Verify status changes to "Delivered"
```

**Expected**: Delivery lifecycle working, status updates real-time

#### 3.5 Earnings Tracking
```
[ ] Navigate to /driver/earnings
[ ] Verify completed delivery appears
[ ] Verify fee credited
[ ] Verify total earnings updated
```

**Expected**: Earnings calculated, displayed correctly

### Results
- **Pass**: ✓ ✓ ✓ ✓ ✓ = Driver flow working
- **Issues Found**: [List any issues]

---

## QA FLOW 4: ADMIN MANAGEMENT (1.5 hours)

### Test Account
- Email: admin@test.local
- Password: Test123!@#
- Role: Admin

### Test Steps

#### 4.1 Admin Sign In
```
[ ] Load https://staging.oyru.example.com
[ ] Click "Sign In"
[ ] Enter admin@test.local / Test123!@#
[ ] Verify redirected to /admin dashboard
```

**Expected**: Admin dashboard loaded

#### 4.2 Dashboard Overview
```
[ ] Verify dashboard shows:
    - Total Orders: [number]
    - Total Revenue: INR [amount]
    - Active Hotels: 3
    - Available Products: 20
    - Delivery Partners: [number]
[ ] Verify all links functional
```

**Expected**: Dashboard complete, navigation working

#### 4.3 Product Management
```
[ ] Navigate to /admin/products
[ ] Verify 20 products listed
[ ] Click edit on one product
[ ] Change price by 10%
[ ] Click Save
[ ] Verify product updated
[ ] Navigate back, verify change persisted
[ ] Click "Add Product"
[ ] Fill form with new product
[ ] Click Save
[ ] Verify product appears in list
```

**Expected**: Product CRUD operations working

#### 4.4 Order Management
```
[ ] Navigate to /admin/oyru-orders
[ ] Verify all orders visible
[ ] Verify order details accessible
[ ] Verify can change order status
[ ] Verify status transitions valid
```

**Expected**: Order management working

#### 4.5 Reports
```
[ ] Navigate to /admin/reports
[ ] Click "Sales Reports"
[ ] Verify chart displays
[ ] Verify data accurate
[ ] Export as CSV
[ ] Verify file downloads
[ ] Click "Inventory Reports"
[ ] Verify stock levels shown
```

**Expected**: Reports generating, data accurate

#### 4.6 Settings
```
[ ] Navigate to /admin/settings
[ ] Verify editable settings
[ ] Change one setting
[ ] Save
[ ] Verify change persisted
```

**Expected**: Settings management working

### Results
- **Pass**: ✓ ✓ ✓ ✓ ✓ ✓ = Admin flow working
- **Issues Found**: [List any issues]

---

## QA FLOW 5: TELEGRAM BOT (1 hour)

### Test Steps

#### 5.1 Bot Discovery
```
[ ] Search for bot in Telegram: @OyruDeliveryBot (staging)
[ ] Click "Start"
[ ] Verify welcome message received
[ ] Verify menu appears
```

**Expected**: Bot responsive, welcome message sent

#### 5.2 /products Command
```
[ ] Type /products
[ ] Verify list of 20 products received
[ ] Verify products showing name, price
```

**Expected**: Product list displayed in chat

#### 5.3 /search Command
```
[ ] Type /search vegetables
[ ] Verify search results returned
[ ] Verify relevant products shown
```

**Expected**: Search filtering working

#### 5.4 /cart Command
```
[ ] Type /cart add 5 (for first product)
[ ] Verify "Added to cart" confirmation
[ ] Type /cart view
[ ] Verify cart shows item, quantity
```

**Expected**: Cart operations working via bot

#### 5.5 /checkout Command
```
[ ] Type /checkout
[ ] Verify checkout initiated
[ ] Provide delivery address
[ ] Verify order placed
[ ] Verify order confirmation with number
```

**Expected**: Checkout via Telegram working

#### 5.6 /orders Command
```
[ ] Type /orders
[ ] Verify all orders listed
[ ] Click on order
[ ] Verify order details shown
[ ] Verify status tracking available
```

**Expected**: Order history accessible via bot

#### 5.7 /help Command
```
[ ] Type /help
[ ] Verify help text with all commands
[ ] Verify descriptions accurate
```

**Expected**: Help system working

### Results
- **Pass**: ✓ ✓ ✓ ✓ ✓ ✓ ✓ = Telegram bot working
- **Issues Found**: [List any issues]

---

## CROSS-FLOW TESTS (30 minutes)

### 6.1 Inventory Consistency
```
[ ] As Admin: Check product stock (20 units)
[ ] As Hotel: Order 5 units
[ ] As Admin: Check stock (should be 15)
[ ] As Customer: Check product detail
[ ] Verify available quantity shows 15
[ ] Attempt to order 20 units as customer
[ ] Verify error "Only 15 available"
```

**Expected**: Inventory auto-decrements, prevents overselling

### 6.2 Order Status Flow
```
[ ] Place order as customer
[ ] Verify initial status "Pending"
[ ] As Admin: Change status to "Confirmed"
[ ] As Customer: Refresh order detail
[ ] Verify status updated in real-time
[ ] As Driver: Accept delivery
[ ] Verify status auto-updates
```

**Expected**: Status updates propagate across roles

### 6.3 Payment Processing
```
[ ] Place order as customer with COD
[ ] Verify payment status "Pending"
[ ] Place order as hotel with INVOICE
[ ] Verify payment status "Invoice Sent"
[ ] As Admin: Verify both orders visible
```

**Expected**: Payment methods tracked correctly

---

## PERFORMANCE TESTS (30 minutes)

### 7.1 Page Load Times
```
[ ] Homepage: __________ ms (Target: < 2000ms)
[ ] Products list: __________ ms (Target: < 1000ms)
[ ] Order detail: __________ ms (Target: < 1000ms)
[ ] Dashboard: __________ ms (Target: < 1500ms)
```

**Expected**: All < targets

### 7.2 API Response Times
```
[ ] GET /api/products: __________ ms (Target: < 500ms)
[ ] GET /api/categories: __________ ms (Target: < 300ms)
[ ] POST /api/orders: __________ ms (Target: < 1000ms)
[ ] GET /api/orders: __________ ms (Target: < 500ms)
```

**Expected**: All < targets

### 7.3 Concurrent Users
```
[ ] Load test with 10 concurrent users
[ ] Verify no errors
[ ] Check response times
[ ] Monitor database connections
```

**Expected**: System handles load without degradation

---

## SECURITY SPOT CHECKS (30 minutes)

### 8.1 Authentication
```
[ ] Attempt signin with wrong password
[ ] Verify error message (no user hint)
[ ] Attempt XSS in email field
[ ] Verify sanitized
[ ] Verify session timeout after 1 hour
```

**Expected**: Auth secure

### 8.2 Authorization
```
[ ] As Customer, try accessing /admin
[ ] Verify redirected to /customer/orders
[ ] As Driver, try accessing /hotel/ordering
[ ] Verify denied access
[ ] Try accessing other customer's orders
[ ] Verify forbidden
```

**Expected**: Role-based access enforced

### 8.3 Data Validation
```
[ ] Try submitting negative quantity
[ ] Verify rejected
[ ] Try submitting empty address
[ ] Verify required field error
[ ] Try SQL injection in search
[ ] Verify no errors, safe response
```

**Expected**: Input validation working

---

## ISSUE REPORTING TEMPLATE

For each issue found, record:

```
ISSUE #[N]:
Title: [Brief description]
Severity: CRITICAL | HIGH | MEDIUM | LOW
Flow: [Which flow - Customer/Hotel/Driver/Admin/Telegram]
Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected Behavior:
[What should happen]

Actual Behavior:
[What actually happened]

Screenshot: [Attach if visual]
Logs: [Paste relevant logs]
Device: [Browser/Phone, OS]
Notes: [Any other info]
```

---

## QA EXECUTION REPORT

After completing all flows, generate report:

```
# QA EXECUTION REPORT - DAY 2

**Date**: [Date]
**QA Lead**: [Name]
**Environment**: Staging
**Duration**: [Hours]

## Summary
- Flows Tested: 5
- Test Cases Executed: 50+
- Pass Rate: ___%
- Issues Found: [Number]
  - Critical: [Number]
  - High: [Number]
  - Medium: [Number]
  - Low: [Number]

## Flow Results
- [ ] Customer: PASS / FAIL
- [ ] Hotel: PASS / FAIL
- [ ] Driver: PASS / FAIL
- [ ] Admin: PASS / FAIL
- [ ] Telegram: PASS / FAIL

## Critical Issues (MUST fix before UAT)
[List each critical issue]

## High Issues (Should fix before UAT)
[List each high issue]

## Test Coverage
- Happy Path: 100%
- Edge Cases: 85%
- Error Handling: 80%
- Performance: 90%
- Security: 85%

## Recommendation
[ ] Approved for Day 3 Client UAT
[ ] Fix critical issues, retest, then approve
[ ] Major rework needed, delay UAT

**Sign-off**: ________________________
```

---

## DELIVERABLES

- [ ] QA_EXECUTION_REPORT.md (full report)
- [ ] Screenshots (key flows)
- [ ] Issue list (with tickets)
- [ ] Test coverage summary
- [ ] Team briefing on findings

---

**Next**: Day 3 Client UAT Execution
