# Oyru Telegram Bot - Validation Guide

## Bot Setup

### Configuration
- Bot Token: Set in `TELEGRAM_BOT_TOKEN` environment variable
- Webhook URL: `https://yourdomain.com/api/telegram/webhook`
- Admin Chat ID: Set in `TELEGRAM_ADMIN_CHAT_ID` for notifications

### Testing Locally
```bash
# Start development server
pnpm dev

# Bot will be available at http://localhost:3000/api/telegram/webhook
# For local testing, use ngrok to expose local server:
ngrok http 3000
# Update webhook in bot config to use ngrok URL
```

## Command Validation

### 1. /start Command
**Expected Behavior:**
- [ ] Bot sends welcome message with greeting
- [ ] User identification stored (first_name, last_name, user_id)
- [ ] Main menu keyboard displayed with buttons:
  - [ ] Browse Products
  - [ ] Search
  - [ ] My Cart
  - [ ] My Orders
  - [ ] Help

**Test Steps:**
1. Message `/start` to bot
2. Verify welcome message received
3. Verify main menu keyboard appears
4. Verify buttons are clickable

**Error Handling:**
- [ ] Bot handles repeated /start gracefully
- [ ] No error messages displayed to user

### 2. /products Command
**Expected Behavior:**
- [ ] Lists all product categories
- [ ] Shows inline keyboard with category buttons
- [ ] Pagination for large result sets
- [ ] Category emoji icons displayed

**Test Steps:**
1. Click "Browse Products" or message `/products`
2. Verify all 5 categories listed:
   - [ ] Fresh Produce
   - [ ] Dairy & Eggs
   - [ ] Beverages
   - [ ] Snacks
   - [ ] Essentials
3. Click category - should show products in category
4. Verify pagination if >10 products

**Error Handling:**
- [ ] Handle empty product catalog gracefully
- [ ] Handle network errors with retry option

### 3. /search Command
**Expected Behavior:**
- [ ] Prompts user to enter search query
- [ ] Searches products by name/description
- [ ] Returns matching products with prices
- [ ] "Add to Cart" button for each product

**Test Steps:**
1. Click "Search" or message `/search`
2. Message product name (e.g., "apple", "milk", "coffee")
3. Verify matching products returned
4. Verify prices displayed in INR (₹)
5. Click "Add to Cart" - should add product
6. Verify confirmation message

**Error Cases:**
- [ ] No results found - show "No products found" message
- [ ] Empty search - prompt user to enter search term
- [ ] Special characters - handle safely

### 4. /cart Command
**Expected Behavior:**
- [ ] Display all items in user's cart
- [ ] Show quantity and price per item
- [ ] Display total cart value
- [ ] Options to:
  - [ ] Modify quantity (+ / -)
  - [ ] Remove item
  - [ ] Proceed to checkout

**Test Steps:**
1. Add 3-4 products to cart
2. Message `/cart` or click "My Cart"
3. Verify all products listed with:
   - [ ] Product name
   - [ ] Quantity
   - [ ] Unit price
   - [ ] Line total (qty × price)
4. Verify cart total calculated correctly
5. Test modify quantity - should update total
6. Test remove item - should remove from cart

**Empty Cart:**
- [ ] Display "Your cart is empty" message
- [ ] Provide "Browse Products" link to restart

### 5. /checkout Command
**Expected Behavior:**
- [ ] Prompts for delivery address
- [ ] Confirms delivery location
- [ ] Selects payment method (COD/Invoice)
- [ ] Generates order confirmation with order number

**Test Steps:**
1. Add items to cart
2. Click "Checkout" from cart or message `/checkout`
3. Enter delivery address when prompted
4. Select payment method
5. Verify order confirmation with:
   - [ ] Order number (ORD-XXXXX)
   - [ ] Delivery address
   - [ ] Total amount
   - [ ] Estimated delivery time
6. Verify order status set to "pending"

**Error Cases:**
- [ ] Empty cart - prevent checkout
- [ ] Invalid address - prompt for clarification
- [ ] Network error - show retry option

### 6. /orders Command
**Expected Behavior:**
- [ ] Display all user's orders with status
- [ ] Show order number, date, total amount
- [ ] Clickable order buttons to view details
- [ ] Real-time status updates

**Test Steps:**
1. Place 2-3 test orders
2. Message `/orders` or click "My Orders"
3. Verify all orders listed with:
   - [ ] Order number
   - [ ] Order date
   - [ ] Status (pending/confirmed/packing/assigned/delivered)
   - [ ] Total amount
4. Click order - should show detailed view:
   - [ ] Items ordered with quantities
   - [ ] Total with breakdown
   - [ ] Current status
   - [ ] Estimated delivery time
   - [ ] Timeline of status changes

**Status Updates:**
- [ ] "Pending" orders shown in yellow
- [ ] "Confirmed" in blue
- [ ] "Out for Delivery" in orange
- [ ] "Delivered" in green
- [ ] "Cancelled" in red

### 7. /help Command
**Expected Behavior:**
- [ ] Display all available commands with descriptions
- [ ] Show usage examples
- [ ] Provide contact information

**Test Steps:**
1. Message `/help`
2. Verify all commands listed:
   - [ ] /start - Start the bot
   - [ ] /products - Browse all products
   - [ ] /search - Search products
   - [ ] /cart - View shopping cart
   - [ ] /checkout - Place order
   - [ ] /orders - View my orders
   - [ ] /help - Show this help menu
3. Verify descriptions are clear
4. Verify support contact info provided

### 8. /track Command (Optional Enhancement)
**Expected Behavior:**
- [ ] Show active order tracking in real-time
- [ ] Display delivery partner location (if enabled)
- [ ] Show ETA to delivery address

**Test Steps:**
1. Place order and mark as "Out for Delivery"
2. Message `/track`
3. Show active delivery status
4. Provide real-time updates

## Inline Buttons Validation

### Product Selection Flow
- [ ] Category buttons navigate correctly
- [ ] Product buttons show correct details
- [ ] "Add to Cart" button works from inline view
- [ ] Back button returns to previous menu
- [ ] Pagination buttons (< >) navigate correctly

### Cart Management
- [ ] "+" button increases quantity
- [ ] "-" button decreases quantity (min 1)
- [ ] "Remove" button deletes item
- [ ] "Checkout" button proceeds to payment

### Order Interaction
- [ ] "View Details" button expands full order info
- [ ] "Track" button shows tracking info (if applicable)
- [ ] Status updates reflected immediately

## Notification Validation

### Order Notifications to Customer
When order status changes:
- [ ] pending → confirmed: "Your order #ORD-XXX confirmed"
- [ ] confirmed → packing: "We're packing your order"
- [ ] packing → assigned: "Out for delivery!"
- [ ] assigned → delivered: "Order delivered!"

### Admin Notifications
- [ ] New orders sent to admin chat
- [ ] High-value orders flagged
- [ ] System alerts for inventory issues

## Error Message Validation

### Expected Error Scenarios
- [ ] Invalid product ID: "Product not found"
- [ ] Out of stock: "This item is currently out of stock"
- [ ] Delivery address required: "Please enter a delivery address"
- [ ] Payment method required: "Select a payment method"
- [ ] Network error: "Connection error. Please try again."
- [ ] Session timeout: "Your session has expired. Please start over with /start"

**Verification:**
- [ ] Error messages are user-friendly
- [ ] No technical jargon exposed
- [ ] Recovery option provided

## Performance Validation

| Metric | Target | Blocker if > |
|---|---|---|
| Command response time | <2s | 5s |
| Product list load | <3s | 8s |
| Search results | <2s | 5s |
| Order creation | <1s | 3s |
| Notification delivery | <5s | 10s |

**Testing:**
- [ ] Measure response times for each command
- [ ] Test with slow network (throttle to 3G)
- [ ] Verify graceful degradation

## State Management

### User Session
- [ ] User ID stored in session
- [ ] Cart persists across sessions
- [ ] User preferences remembered
- [ ] Session expires after 24 hours of inactivity

**Test Steps:**
1. Add items to cart
2. Close bot conversation
3. Reopen bot after 1 hour
4. Verify cart items still present

### Conversation Context
- [ ] Bot remembers previous action context
- [ ] Can handle conversation interruptions
- [ ] Properly transitions between menus

## Security Validation

### Input Validation
- [ ] Sanitize all user inputs
- [ ] Prevent SQL injection attempts
- [ ] Handle malicious inputs gracefully

### Authentication
- [ ] Only authenticated Telegram users can order
- [ ] User data isolated per user ID
- [ ] No sensitive data in logs

### Rate Limiting
- [ ] Prevent command spam
- [ ] Limit search requests per user/minute
- [ ] Block repeated failed attempts

## Mobile Testing

**Telegram Clients:**
- [ ] Telegram iOS app
- [ ] Telegram Android app
- [ ] Telegram Desktop
- [ ] Telegram Web

**Verification:**
- [ ] Inline keyboards render correctly
- [ ] Text formatting preserved
- [ ] Media attachments handled
- [ ] Long messages wrapped properly

## Integration Testing

### Database Integration
- [ ] Orders saved to database
- [ ] User data persisted
- [ ] Cart items sync with web platform

### API Integration
- [ ] Telegram API calls succeed
- [ ] Rate limits respected
- [ ] Error responses handled

### Payment Integration
- [ ] Payment method stored with order
- [ ] Invoice generated for corporate accounts
- [ ] COD confirmed for regular customers

## Sign-Off Checklist

- [ ] All 7 commands functional and tested
- [ ] Error scenarios handled gracefully
- [ ] Performance benchmarks met
- [ ] Notifications delivered correctly
- [ ] Mobile clients working
- [ ] State persistence verified
- [ ] Security measures validated
- [ ] No console errors in logs
- [ ] Database integration confirmed

**Validation Date**: _______
**Tester**: _______
**Sign-Off**: _______

## Known Limitations

- [ ] Live location tracking not available (for privacy)
- [ ] Maximum 10 products displayed per page
- [ ] Cart limited to 50 items
- [ ] Order history shows last 30 days
