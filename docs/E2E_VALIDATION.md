# Oyru Delivery MVP - End-to-End Validation Guide

## Overview
This guide provides comprehensive E2E test flows for validating all Oyru delivery platform features. Each user role has a dedicated validation path.

## Test Environment Setup

### Prerequisites
- Clean database with seeded test data
- All environment variables configured (.env.development.local)
- Dev server running on http://localhost:3000

### Test Accounts
```
Customer: customer@test.com / password123
Hotel: hotel@test.com / password123
Driver: driver@test.com / password123
Admin: admin@test.com / password123
```

## Customer E2E Flow

### 1. Homepage & Product Discovery
- [ ] Load homepage (/ ) - should display hero section and product categories
- [ ] Verify 5 categories visible: Fresh Produce, Dairy & Eggs, Beverages, Snacks, Essentials
- [ ] Click category filter - should filter products
- [ ] Search for product - should return matching results
- [ ] Performance: Homepage should load in <2 seconds

### 2. Product Selection & Cart
- [ ] Click "Add to Cart" on product - should add to cart counter
- [ ] Cart badge increments correctly
- [ ] Navigate to /cart - should show all selected products
- [ ] Update quantity - should recalculate total
- [ ] Remove item - should remove from cart
- [ ] Clear cart - should empty all items

### 3. Checkout & Order Placement
- [ ] Click "Proceed to Checkout"
- [ ] Verify delivery address field populated
- [ ] Select payment method (COD/Invoice)
- [ ] Submit order - should create order successfully
- [ ] Success message displayed with order number
- [ ] Order status should be "pending"

### 4. Order Tracking
- [ ] Navigate to /customer/orders
- [ ] View list of all customer orders
- [ ] Click order - should navigate to /customer/orders/[id]
- [ ] Order detail page shows:
  - [ ] Order number and date
  - [ ] Order timeline with status progression
  - [ ] List of items ordered with quantities
  - [ ] Total amount and payment method
  - [ ] Estimated delivery time
- [ ] Timeline updates as status changes
- [ ] Completed orders marked as delivered

### 5. Authentication & Security
- [ ] Sign up as new customer
- [ ] Verify email confirmation (if enabled)
- [ ] Login with credentials
- [ ] Session persists on page reload
- [ ] Cannot access admin or driver pages
- [ ] Logout clears session

## Hotel E2E Flow

### 1. Hotel Dashboard
- [ ] Login as hotel account
- [ ] /hotel dashboard shows:
  - [ ] Total orders count
  - [ ] Total amount spent
  - [ ] Pending deliveries
- [ ] Click "Browse Products"
- [ ] Product browsing with category filters

### 2. Bulk Ordering
- [ ] Select multiple products with quantities
- [ ] Add items to cart
- [ ] Cart shows items and total amount
- [ ] Proceed to checkout
- [ ] Enter delivery address
- [ ] Select billing method (Invoice preferred)
- [ ] Submit order
- [ ] Order confirmation with invoice number

### 3. Order History
- [ ] Navigate to /hotel/orders
- [ ] View all placed orders with status
- [ ] Click order to see details:
  - [ ] Items with quantities
  - [ ] Total billing amount
  - [ ] Delivery status
- [ ] Download invoice capability

### 4. Invoice & Billing
- [ ] Orders show Invoice as payment method
- [ ] Billing address populated correctly
- [ ] Invoice downloadable from order detail

## Driver E2E Flow

### 1. Driver Dashboard
- [ ] Login as driver
- [ ] /driver dashboard shows:
  - [ ] Active deliveries count
  - [ ] Total earnings today/month
  - [ ] Average rating
  - [ ] Total orders completed

### 2. Available Deliveries
- [ ] Navigate to /driver/available
- [ ] View list of available deliveries:
  - [ ] Order details (items, total)
  - [ ] Delivery address
  - [ ] Estimated earnings
- [ ] Click "Accept Delivery"
- [ ] Delivery status updates to "assigned"
- [ ] Delivery moves to /driver/active

### 3. Active Delivery Tracking
- [ ] /driver/active shows accepted deliveries
- [ ] Status buttons:
  - [ ] "Picked Up" - updates status to picked_up
  - [ ] "In Transit" - updates status to in_transit
  - [ ] "Delivered" - updates status to delivered, adds to earnings
- [ ] Each status change reflected on customer timeline
- [ ] Earnings updated on completion

### 4. Earnings & History
- [ ] /driver/earnings shows:
  - [ ] Completed deliveries list
  - [ ] Total earnings
  - [ ] Breakdown by date/week/month
  - [ ] Average rating

## Admin E2E Flow

### 1. Admin Dashboard
- [ ] Login as admin
- [ ] Dashboard shows platform metrics:
  - [ ] Total orders
  - [ ] Total revenue
  - [ ] Active products
- [ ] Navigation links accessible

### 2. Product Management
- [ ] /admin/products page loads
- [ ] View all products in table
- [ ] Add new product:
  - [ ] Fill form with product details
  - [ ] Upload image
  - [ ] Set price and stock
  - [ ] Submit - product appears in list
- [ ] Edit product:
  - [ ] Change price/stock
  - [ ] Update availability
  - [ ] Submit - changes reflected
- [ ] Delete product - removed from catalog

### 3. Order Management
- [ ] /admin/oyru-orders shows all platform orders
- [ ] Filter by status (pending/confirmed/packing/assigned/delivered)
- [ ] View order details with items
- [ ] Update order status through dropdown
- [ ] Status change reflected in customer tracking

### 4. Inventory Management
- [ ] /admin/inventory shows stock levels
- [ ] Red flag for low stock (<10)
- [ ] Manual stock adjustment capability
- [ ] Inventory logs show change history with reasons

### 5. Delivery Management
- [ ] /admin/delivery-partners shows driver list
- [ ] View driver stats (total orders, earnings, rating)
- [ ] Verify, suspend, or manage drivers

### 6. Reports
- [ ] /admin/reports/sales:
  - [ ] Revenue by date/week/month
  - [ ] Top products
  - [ ] Order trends
  - [ ] CSV export capability
- [ ] /admin/reports/inventory:
  - [ ] Stock levels by category
  - [ ] Low stock alerts
  - [ ] Reorder recommendations

## Status Transition Validation

### Valid Transitions
- pending → confirmed → packing → assigned → delivered
- Any status → cancelled

### Invalid Transitions (should prevent)
- delivered → any status
- cancelled → any status
- assigned → pending (backward)
- packing → pending (backward)

## Performance Benchmarks

| Page/Endpoint | Target | Blocker if > |
|---|---|---|
| Homepage load | <2s | 5s |
| Product search | <500ms | 2s |
| API responses | <500ms | 2s |
| Order creation | <1s | 3s |
| Dashboard load | <2s | 5s |

## Security Validation

### Authentication
- [ ] Cannot access protected routes without login
- [ ] Session token expires properly
- [ ] Cannot forge/manipulate session tokens
- [ ] CSRF protection on POST requests

### Authorization
- [ ] Customer cannot view admin pages
- [ ] Admin cannot place customer orders
- [ ] Driver can only see own deliveries
- [ ] Hotel can only see own orders

### Data Isolation
- [ ] Customers only see their orders
- [ ] Hotels only see their accounts' orders
- [ ] Drivers only see assigned deliveries
- [ ] Admins see all data

## Error Scenarios

### Inventory
- [ ] Cannot checkout with insufficient stock
- [ ] Stock prevents overselling
- [ ] Low stock warnings shown

### Payment
- [ ] Invalid delivery address rejected
- [ ] Empty cart prevents checkout

### Delivery
- [ ] Cannot mark delivered without pickup
- [ ] Cannot accept delivery if already assigned
- [ ] Cannot update status on cancelled orders

## Logging & Monitoring

### Verify Logs Contain
- [ ] Order creation events
- [ ] Status transitions with timestamps
- [ ] Inventory changes with reasons
- [ ] User authentication events
- [ ] Error events with full stack traces

## Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## Responsive Design

- [ ] Mobile (375px): All features functional
- [ ] Tablet (768px): Layout optimized
- [ ] Desktop (1920px): Full-width usage

## Sign-Off Checklist

- [ ] All E2E flows completed successfully
- [ ] No blocker errors encountered
- [ ] Performance benchmarks met
- [ ] Security validation passed
- [ ] All user roles tested
- [ ] Mobile responsiveness verified
- [ ] No console errors in browser
- [ ] All API responses valid

**Validation Date**: _______
**Tester**: _______
**Sign-Off**: _______
