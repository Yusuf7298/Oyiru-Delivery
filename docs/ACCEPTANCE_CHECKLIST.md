# Oyru Delivery MVP - Acceptance Checklist

This checklist ensures all MVP features are working correctly before release.

## Test Environment Setup

- [ ] Test users generated (`pnpm run generate-test-users`)
- [ ] Database seeded with test data (`pnpm run seed`)
- [ ] Environment variables configured (.env.local)
- [ ] Application started without errors (`pnpm dev`)
- [ ] Health check passing (`GET /api/health`)

## Authentication & Authorization

### Login/Logout
- [ ] Customer can login with email/password
- [ ] Admin can login with email/password
- [ ] Driver can login with email/password
- [ ] Super Admin can login with email/password
- [ ] Invalid credentials rejected
- [ ] User can logout successfully
- [ ] Session persists across page reloads
- [ ] Sessions expire after timeout

### Role-Based Access Control
- [ ] Customers can only access customer pages
- [ ] Admins can access admin dashboard
- [ ] Drivers can access driver portal
- [ ] Super Admin has all permissions
- [ ] Users cannot access pages for other roles
- [ ] API endpoints validate role permissions
- [ ] Unauthorized API calls return 401/403

## Customer Flow

### Homepage & Product Browsing
- [ ] Homepage loads with all categories
- [ ] Products display with images and prices
- [ ] Categories filter works correctly
- [ ] Products sortable by price/popularity
- [ ] Product search functionality works
- [ ] Out-of-stock products marked unavailable

### Shopping Cart
- [ ] Add product to cart increments quantity
- [ ] Remove product from cart works
- [ ] Update quantity updates subtotal
- [ ] Cart persists across sessions
- [ ] Clear cart clears all items
- [ ] Cart shows correct totals

### Checkout & Orders
- [ ] Can place order from cart
- [ ] Order number generated correctly
- [ ] Order status set to 'pending'
- [ ] Delivery address is required
- [ ] Payment method selection works (COD/Invoice)
- [ ] Order confirmation message shown
- [ ] Stock decremented after order
- [ ] Cannot order more than available stock

### Order Tracking
- [ ] Can view all customer orders
- [ ] Can view individual order details
- [ ] Order timeline displays correctly
- [ ] Order status updates reflected
- [ ] Delivery address displayed
- [ ] Order total calculation correct

## Order Lifecycle

### State Transitions
- [ ] pending → confirmed works
- [ ] confirmed → packing works
- [ ] packing → ready works
- [ ] ready → picked_up works
- [ ] picked_up → in_transit works
- [ ] in_transit → delivered works
- [ ] Any state → cancelled works (except final states)
- [ ] Invalid transitions rejected

### Order Status Labels
- [ ] All 8 status values have labels
- [ ] Status colors display correctly
- [ ] Progress bar updates with status

## Inventory Management

### Stock Management
- [ ] Stock decrements on order confirmation
- [ ] Cannot order more than available stock
- [ ] Inventory logs created for changes
- [ ] Low stock alerts generated (threshold = 10)
- [ ] Product availability updates with stock
- [ ] Stock increment works (for returns/cancellations)

### Low Stock Alerts
- [ ] Admin sees low stock products
- [ ] Alert triggers when stock ≤ 10
- [ ] Alert clears when stock > 10

## Hotel Ordering System

### Hotel Orders
- [ ] Hotels can browse products
- [ ] Hotels can place orders with multiple items
- [ ] Bulk quantities supported
- [ ] Invoice billing option available
- [ ] Hotel can view their order history
- [ ] Hotel cannot see other hotel orders

### Hotel Permissions
- [ ] Only hotel users can access `/hotel/*`
- [ ] Hotel can only see their own data
- [ ] Non-hotel users cannot access hotel pages

## Delivery Management

### Driver Portal
- [ ] Driver can view available deliveries
- [ ] Driver can accept delivery
- [ ] Driver can view active deliveries
- [ ] Driver can update delivery status
- [ ] Driver can mark delivery as complete
- [ ] Driver earnings calculated correctly

### Delivery Status Flow
- [ ] assigned status on creation
- [ ] picked_up on pickup
- [ ] in_transit when en route
- [ ] delivered on completion

## Admin Dashboard

### Product Management
- [ ] Admin can add new products
- [ ] Admin can edit products
- [ ] Admin can delete products
- [ ] Product images upload correctly
- [ ] Stock quantities updatable
- [ ] Availability toggle works

### Order Management
- [ ] Admin can view all orders
- [ ] Admin can see order details with items
- [ ] Admin can update order status
- [ ] Admin can filter orders by status
- [ ] Admin can search orders

### Inventory Management
- [ ] Admin sees all products with stock
- [ ] Low stock items highlighted
- [ ] Inventory history viewable
- [ ] Can manually adjust stock

### Analytics & Reports
- [ ] Sales reports generate correctly
- [ ] Inventory reports available
- [ ] Reports can be exported to CSV
- [ ] Date range filtering works

## Security & Permissions

### Data Isolation
- [ ] Customers cannot access other customer data
- [ ] Hotels cannot access other hotel data
- [ ] Drivers cannot access other driver data
- [ ] Non-admins cannot access admin data

### API Security
- [ ] Unauthorized requests rejected (401)
- [ ] Forbidden requests rejected (403)
- [ ] Invalid input validated
- [ ] SQL injection attempts blocked
- [ ] XSS attempts blocked
- [ ] CSRF tokens validated

## Telegram Bot (Optional)

- [ ] `/start` command works
- [ ] `/products` shows categories
- [ ] `/search` finds products
- [ ] `/cart` displays cart
- [ ] `/orders` shows order history
- [ ] `/help` shows commands
- [ ] Bot messages send correctly
- [ ] Notifications send on order updates

## Production Hardening

### Logging
- [ ] Logs capture errors
- [ ] Log levels configurable
- [ ] Sensitive data not logged
- [ ] Logs help troubleshoot issues

### Health Checks
- [ ] `/api/health` endpoint responds
- [ ] Database connectivity verified
- [ ] Health check indicates system status
- [ ] Monitoring can use health checks

### Environment Validation
- [ ] Missing env vars caught on startup
- [ ] Defaults applied for optional vars
- [ ] Error messages are helpful
- [ ] Startup fails gracefully

### Error Handling
- [ ] Errors return appropriate status codes
- [ ] Error messages are user-friendly
- [ ] Errors logged with full context
- [ ] Database errors don't expose details

## Performance

### Load Times
- [ ] Homepage loads < 2 seconds
- [ ] Product search responds < 1 second
- [ ] Checkout completes < 3 seconds
- [ ] Admin pages load < 3 seconds

### Database
- [ ] Queries use appropriate indexes
- [ ] No N+1 query problems
- [ ] Connection pooling working
- [ ] Database backups working

## Browser Compatibility

- [ ] Chrome latest version works
- [ ] Firefox latest version works
- [ ] Safari latest version works
- [ ] Mobile browsers work
- [ ] Responsive design on all sizes

## Edge Cases

- [ ] Simultaneous order from same cart
- [ ] Stock goes to 0 during ordering
- [ ] Price changes during checkout
- [ ] Session expires during purchase
- [ ] Network errors handled gracefully
- [ ] Duplicate order prevention
- [ ] Order cancellation workflow

## Documentation

- [ ] README.md is complete
- [ ] DEPLOYMENT.md covers all scenarios
- [ ] TEST_FLOWS.md documents test cases
- [ ] Code comments explain complex logic
- [ ] API documentation accurate
- [ ] Environment setup documented

## Final Checks

- [ ] All tests passing
- [ ] No console errors/warnings
- [ ] No broken links
- [ ] All images loading
- [ ] All forms validating
- [ ] Database migrations clean
- [ ] No uncommitted changes
- [ ] Git history is clean

## Sign-Off

- [ ] QA Lead: _________________ Date: _______
- [ ] Product Owner: _________________ Date: _______
- [ ] Tech Lead: _________________ Date: _______

## Notes

Use this section for additional observations or issues found:

```
- Issue 1: ...
- Issue 2: ...
```

## Approved for Release

- [ ] YES - All checks passed, ready for production
- [ ] NO - Issues found, requires fixes before release
