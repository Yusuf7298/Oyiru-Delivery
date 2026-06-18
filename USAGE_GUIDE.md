# Oyru Delivery Platform - Complete Usage Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Customer Guide](#customer-guide)
3. [Restaurant Owner Guide](#restaurant-owner-guide)
4. [Delivery Partner Guide](#delivery-partner-guide)
5. [Admin/Super Admin Guide](#admin-super-admin-guide)
6. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Registration & Login

All users start by creating an account on the platform:

1. Visit the home page or open the Telegram Mini App
2. Click "Sign Up" or "Create Account"
3. Enter your email address
4. Create a strong password (minimum 8 characters)
5. Click "Sign Up"
6. Check your email for verification (if required)
7. Log in with your credentials

**Account Types:**
- **Customer**: Browse and order food
- **Restaurant Owner**: Manage restaurant and menu
- **Delivery Partner**: Accept and deliver orders
- **Admin**: Manage the entire platform

---

## Customer Guide

### How Customers Use Oyru

#### 1. **Browse Restaurants**

**On Web App:**
- Navigate to the home page (`/`)
- View featured restaurants in the grid
- Use the search bar to find specific restaurants
- Filter by delivery time, fees, or location

**On Telegram Mini App:**
- Open the mini app via Telegram
- Tap the home icon to see all restaurants
- Scroll through the restaurant list

#### 2. **View Restaurant Menu**

1. Click on any restaurant card
2. You'll see the restaurant detail page with:
   - Restaurant name and description
   - Delivery time estimate
   - Delivery fee
   - Menu organized by categories (Appetizers, Main Courses, Desserts, etc.)

#### 3. **Add Items to Cart**

1. Browse menu items in each category
2. Click the "+" button or tap an item to add it
3. Adjust the quantity using the quantity selector
4. View the item details if needed
5. Items are added to your cart automatically

**Cart Features:**
- View total items in cart (badge icon)
- See real-time price calculations
- View cart summary before checkout

#### 4. **Checkout & Place Order**

1. Click the cart icon or "Proceed to Checkout" button
2. Review your order:
   - Items and quantities
   - Subtotal
   - Delivery fee
   - Tax amount
   - **Total price**
3. Enter your delivery address (if not already saved)
4. Add special instructions (optional)
5. Enter your phone number for delivery contact
6. Click "Place Order"
7. Confirmation page shows your order ID and estimated delivery time

#### 5. **Track Order**

1. Go to "My Orders" page
2. Select an active order
3. See real-time status:
   - **Pending**: Waiting for restaurant confirmation
   - **Confirmed**: Restaurant has accepted the order
   - **Preparing**: Food is being prepared
   - **Ready**: Food is ready for pickup
   - **Picked Up**: Delivery partner has picked up the order
   - **In Transit**: Order is on the way to you
   - **Delivered**: Order has arrived

4. View:
   - Estimated delivery time
   - Delivery partner information (when assigned)
   - Order details and receipt

#### 6. **Manage Profile**

1. Go to Profile page (`/profile`)
2. Update your information:
   - Full name
   - Phone number
   - Email address
   - Delivery addresses (save multiple)
   - City/Location
3. View your order history
4. See account settings
5. Log out when done

#### 7. **Telegram Mini App Usage**

**Navigation:**
- **Home**: Browse all restaurants
- **Search**: Find specific restaurants
- **Cart**: View and manage your cart
- **Orders**: Track your orders
- **Profile**: Update account information

**Key Differences from Web:**
- Optimized for mobile screens
- Touch-friendly interface
- Integrated with Telegram notifications
- Faster loading on mobile devices

---

## Restaurant Owner Guide

### How Restaurant Owners Manage Their Business

#### 1. **Access Restaurant Dashboard**

1. Log in with your restaurant owner account
2. Navigate to `/restaurant` (restaurant dashboard)
3. You'll see your restaurant overview

#### 2. **Manage Your Restaurant**

**Restaurant Settings:**
1. Go to your restaurant profile
2. Update:
   - Restaurant name and description
   - Restaurant image/logo
   - Phone number
   - Address and location (latitude/longitude)
   - Delivery time estimate
   - Delivery fee
   - Minimum order amount
   - Status (active/inactive)

3. Save changes

#### 3. **Manage Menu**

**Add Categories:**
1. Go to "Menu Management"
2. Click "Add Category"
3. Enter:
   - Category name (e.g., "Appetizers", "Main Courses")
   - Description
   - Category image
   - Display order (for sorting)
4. Click "Save Category"

**Add Menu Items (Dishes):**
1. Select a category
2. Click "Add Item"
3. Enter:
   - Item name
   - Description
   - Price
   - Item image
   - Preparation time (minutes)
   - Availability (available/unavailable)
4. Click "Add Item"

**Edit Menu Items:**
1. Find the item in the menu
2. Click "Edit"
3. Update any details
4. Click "Save"

**Remove Items:**
1. Click "Delete" or the delete icon
2. Confirm deletion

**Mark Items as Unavailable:**
1. Toggle the availability switch
2. Item won't appear to customers (useful during service interruptions)

#### 4. **Manage Orders**

**View Orders:**
1. Go to "Orders" page (`/restaurant/[id]/orders`)
2. See all orders for your restaurant:
   - Pending orders
   - Active orders
   - Completed orders
   - Cancelled orders

**Process Orders:**
1. Filter by status (Pending, Confirmed, etc.)
2. Click on an order to see details:
   - Customer name and phone
   - Items ordered with quantities
   - Special instructions
   - Delivery address
   - Total amount
3. Update order status:
   - **Confirm**: Accept the order
   - **Start Preparing**: Begin cooking
   - **Ready for Pickup**: Food is ready
   - **Mark as Delivered**: Confirm delivery (if you deliver)
   - **Cancel**: Cancel the order (with reason)

**Bulk Actions:**
- Select multiple orders
- Perform batch status updates

#### 5. **Manage Inventory**

If inventory management is enabled:

1. Go to "Inventory" section
2. Set stock levels for each item:
   - Current quantity
   - Minimum quantity (when to reorder)
   - Maximum quantity
3. Track restock dates
4. System alerts you when items are low

#### 6. **View Analytics**

1. Go to "Analytics" page
2. View:
   - Total orders (today, this week, this month)
   - Revenue metrics
   - Popular items
   - Customer feedback/ratings
   - Peak hours
   - Average order value

#### 7. **Manage Promotions**

1. Go to "Promotions" section
2. Create a new promotion:
   - Promotion title
   - Description
   - Discount type (percentage or fixed amount)
   - Discount value
   - Minimum order amount (optional)
   - Promotion code
   - Start and end dates
   - Max uses
3. Activate/deactivate promotions
4. Track promotion usage

#### 8. **Customer Reviews & Ratings**

1. View customer reviews
2. Respond to feedback
3. Track your restaurant rating
4. Address low ratings with improvements

---

## Delivery Partner Guide

### How Delivery Partners Use Oyru

#### 1. **Register as Delivery Partner**

1. Log in or create an account
2. Select "Delivery Partner" during registration
3. Complete your profile:
   - Phone number
   - Vehicle type (motorcycle, car, bicycle, etc.)
   - License number
   - Profile photo
4. Submit for verification
5. Wait for admin approval (usually within 24-48 hours)

#### 2. **Access Delivery Dashboard**

1. Go to `/delivery` dashboard
2. See overview:
   - Total completed deliveries
   - Current earnings
   - Average rating
   - Next delivery alert

#### 3. **Accept Orders**

**View Available Orders:**
1. Go to "Available Orders" section
2. See orders ready for pickup:
   - Restaurant name
   - Delivery distance
   - Delivery fee/earning
   - Time frame
   - Items being delivered

**Accept an Order:**
1. Review order details:
   - Restaurant location
   - Delivery destination
   - Estimated time
   - Estimated earnings
2. Click "Accept Order"
3. Get navigation to restaurant
4. Order moves to "Active Deliveries"

#### 4. **Complete Deliveries**

**Before Pickup:**
1. Navigate to the restaurant using the address
2. Contact restaurant if needed (call/message)
3. Confirm you've arrived

**At Restaurant:**
1. Collect the order
2. Verify items match the order (if possible)
3. Check package condition
4. Click "Order Picked Up" in the app

**During Transit:**
1. Navigate to delivery address
2. App shows real-time navigation
3. Keep track of time
4. Contact customer if needed

**At Delivery Location:**
1. Navigate to exact address
2. Contact customer if needed
3. Deliver the order to customer
4. Ask for confirmation of delivery
5. Click "Delivery Complete"
6. Add delivery photo (optional)
7. Customer confirms or reports issues

#### 5. **Track Earnings**

1. Go to "Earnings" dashboard
2. View:
   - Total earnings (lifetime)
   - Earnings this week/month
   - Per-delivery breakdown
   - Performance bonuses
3. View payment history
4. Request payout (if available)

#### 6. **View Performance**

1. Go to "My Performance" page
2. See:
   - Total deliveries completed
   - Average rating
   - On-time delivery percentage
   - Customer reviews and feedback
   - Cancellation rate
3. View suggestions for improvement

#### 7. **Manage Availability**

1. Set your status:
   - **Online**: Ready to accept orders
   - **Offline**: Not available
   - **Break**: Temporarily unavailable
2. System only sends orders when you're online
3. Return status to Online when ready

#### 8. **Manage Location**

1. Keep location sharing enabled during deliveries
2. Real-time tracking helps customers see you approaching
3. Improves delivery transparency and trust

#### 9. **Ratings & Reviews**

1. View customer ratings after each delivery
2. See detailed feedback
3. Respond to reviews
4. Work to maintain high rating (4.5+ stars recommended)

---

## Admin/Super Admin Guide

### How Admins Manage the Platform

#### 1. **Access Admin Dashboard**

1. Log in with admin credentials
2. Go to `/admin/dashboard`
3. See platform overview with key metrics

#### 2. **Dashboard Overview**

**Key Metrics:**
- Total orders (today, week, month)
- Total revenue
- Active users
- Active restaurants
- Active delivery partners
- Platform health status

**Recent Activity:**
- Latest orders
- New customers
- New restaurants
- Recent issues

#### 3. **Manage Orders**

**Orders Management (`/admin/orders`):**
1. View all orders across the platform
2. Filter by:
   - Status (Pending, Confirmed, Preparing, etc.)
   - Date range
   - Restaurant
   - Customer
3. Search by order ID
4. See order details:
   - Customer information
   - Restaurant information
   - Items ordered
   - Delivery partner assigned
   - Total amount
   - Current status
5. Update order status if needed
6. Cancel problematic orders
7. Resolve customer complaints

**Bulk Actions:**
- Export order data
- Filter and generate reports

#### 4. **Manage Customers**

**Customers Management (`/admin/customers`):**
1. View all registered customers
2. See customer information:
   - Name and email
   - Phone number
   - Address
   - Total orders placed
   - Total spent
   - Registration date
3. Click on customer to see:
   - Order history
   - Addresses saved
   - Account status
   - Activity timeline
4. Actions:
   - Suspend/unsuspend account
   - View customer support tickets
   - Refund orders

**Customer Support:**
- Resolve complaints
- Issue refunds
- Assist with problems

#### 5. **Manage Restaurants**

**Restaurants Management (`/admin/restaurants`):**
1. View all restaurants on platform
2. See restaurant info:
   - Name and owner
   - Location and contact
   - Active orders
   - Revenue generated
   - Rating and reviews
   - Registration date
3. Monitor performance:
   - Order count
   - Average order value
   - Customer satisfaction
4. Actions:
   - Activate/deactivate restaurant
   - Suspend restaurant (for violations)
   - Update restaurant details
   - View analytics

**Quality Control:**
- Monitor restaurant ratings
- Address low-rated restaurants
- Enforce platform policies
- Respond to complaints about restaurants

#### 6. **Manage Delivery Partners**

**Delivery Partners Management (`/admin/delivery-partners`):**
1. View all delivery partners
2. See partner information:
   - Name and contact
   - Vehicle type
   - Total deliveries
   - Total earnings
   - Average rating
   - Verification status
3. Monitor performance:
   - On-time delivery rate
   - Customer satisfaction
   - Cancellation rate
4. Actions:
   - Approve/reject partners
   - Suspend/unsuspend partners
   - View delivery history
   - Address customer complaints

**Quality Assurance:**
- Verify licenses
- Monitor ratings
- Enforce service standards
- Address conduct issues

#### 7. **View Analytics & Reports**

**Analytics Dashboard (`/admin/analytics`):**
1. View comprehensive metrics:
   - Daily order trends
   - Revenue tracking
   - Customer metrics
   - Partner metrics
   - Delivery times
2. Compare time periods:
   - 7 days
   - 30 days
   - 90 days
   - Custom range
3. Export reports
4. View graphs and charts
5. Performance insights

**Key Metrics to Monitor:**
- Daily active users
- Order success rate
- Average delivery time
- Customer satisfaction
- Revenue per day
- Top performing restaurants
- Top performing partners

#### 8. **Support Tickets Management**

**Support System (`/admin/support`):**
1. View all support tickets from customers and partners
2. Filter by:
   - Priority (High, Medium, Low)
   - Status (Open, In Progress, Resolved, Closed)
   - Type (Customer, Partner, Restaurant)
3. Click ticket to see:
   - Issue description
   - Related order
   - Priority level
   - Customer contact
4. Actions:
   - Assign to team member
   - Add responses
   - Mark as resolved
   - Close ticket
   - Generate refund if needed

**Resolution Process:**
1. Read ticket details
2. Investigate issue
3. Communicate with involved parties
4. Resolve issue
5. Document solution
6. Close ticket

#### 9. **Platform Settings**

**Settings Management (`/admin/settings`):**
1. Configure platform fees:
   - Commission percentage (platform takes from restaurants)
   - Minimum delivery fee
   - Maximum delivery distance
2. Contact information:
   - Support email
   - Support phone number
3. Business hours and availability
4. Payment methods
5. Notification settings
6. Email templates

**Configuration Tips:**
- Adjust commission based on business model
- Set appropriate delivery radius
- Update contact info for customer support
- Configure email notifications

#### 10. **User Permissions & Roles**

If managing multiple admins:

1. Create admin accounts
2. Assign roles:
   - Super Admin: Full access
   - Admin: Manage orders, customers, restaurants
   - Support: Handle support tickets
   - Analytics: View reports only
3. Set permissions:
   - View dashboard
   - Manage products
   - Manage orders
   - Manage customers
   - Manage hotels/restaurants
   - Manage delivery
   - View reports
   - Manage settings

#### 11. **Audit Logs**

1. View activity logs
2. Track all admin actions:
   - Who made changes
   - What was changed
   - When it was changed
   - Why (reason if provided)
3. Compliance and security tracking

#### 12. **Promotions Management**

1. Create platform-wide promotions
2. Create restaurant-specific promotions
3. Set:
   - Discount amount/percentage
   - Validity period
   - Max uses
   - Minimum order amount
4. Track promotion usage
5. Disable unsuccessful promotions

---

## Troubleshooting

### Common Customer Issues

**"I can't find my restaurant"**
- Try searching with restaurant name
- Check if restaurant is currently active
- Verify your location is within delivery area

**"My order hasn't been delivered"**
- Check order status
- Contact support for assistance
- May be delayed due to traffic or weather

**"I want to cancel my order"**
- If order is still "Pending" or "Confirmed", you can usually cancel
- Go to order details and click "Cancel Order"
- Contact support if order is already preparing

**"How do I save my address?"**
- Go to Profile → Addresses
- Click "Add New Address"
- Fill in details and save

### Common Restaurant Issues

**"Orders aren't coming in"**
- Check if restaurant is marked as active
- Verify restaurant location/delivery area
- Check if items are available
- Contact support if issue persists

**"Customer complained about order"**
- Check support tickets for details
- Respond to customer
- Admin may issue refund if needed

**"How do I update menu?"**
- Log in to restaurant dashboard
- Go to Menu Management
- Add/edit/delete items as needed
- Changes take effect immediately

### Common Delivery Partner Issues

**"I'm not getting order offers"**
- Make sure you're marked as "Online"
- Check if you're in active delivery areas
- Ensure location sharing is enabled

**"Customer says delivery didn't arrive"**
- Check delivery photos if available
- Contact support with order details
- Provide evidence of delivery

### Common Admin Issues

**"Can't access admin dashboard"**
- Verify you have admin permissions
- Contact super admin for access
- Clear browser cache and try again

**"Data not updating"**
- Refresh the page
- Clear cache
- Try a different browser
- Contact technical support

### Getting Help

**Contact Support:**
- Email: support@oyru.delivery
- Phone: +251-XXX-XXX-XXXX
- Live chat in platform (if available)
- Create support ticket in admin dashboard

---

## Best Practices

### For Customers:
- Save multiple delivery addresses
- Add special delivery instructions (gate code, apartment number, etc.)
- Rate and review after delivery
- Keep contact information updated

### For Restaurants:
- Keep menu updated and accurate
- Respond promptly to orders
- Maintain high food quality
- Communicate with customers proactively
- Train staff on order accuracy

### For Delivery Partners:
- Maintain excellent on-time performance
- Keep vehicle clean and well-maintained
- Communicate with customers
- Follow traffic rules and safety guidelines
- Build positive customer relationships

### For Admins:
- Monitor platform metrics regularly
- Address customer complaints quickly
- Maintain data integrity
- Ensure platform security
- Support all user types fairly

---

Last Updated: June 2026
For more information, visit: oyru.delivery
