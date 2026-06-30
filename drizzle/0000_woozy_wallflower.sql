CREATE TYPE "public"."delivery_status" AS ENUM('assigned', 'picked_up', 'in_transit', 'delivered');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'packing', 'ready', 'picked_up', 'in_transit', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."oyru_order_status" AS ENUM('draft', 'submitted', 'inventory_review', 'approved', 'assigned', 'shipped', 'delivered', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('COD', 'INVOICE');--> statement-breakpoint
CREATE TYPE "public"."return_status" AS ENUM('pending', 'approved', 'rejected', 'completed');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('customer', 'restaurant_owner', 'delivery_partner', 'delivery', 'admin', 'super_admin', 'hotel');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"role" "user_role" NOT NULL,
	"canViewDashboard" boolean DEFAULT false,
	"canManageProducts" boolean DEFAULT false,
	"canManageOrders" boolean DEFAULT false,
	"canManageCustomers" boolean DEFAULT false,
	"canManageHotels" boolean DEFAULT false,
	"canManageDelivery" boolean DEFAULT false,
	"canViewReports" boolean DEFAULT false,
	"canManageSettings" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"startDate" timestamp,
	"positionTitle" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_profiles_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "admin_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"platformCommissionPercentage" numeric(5, 2) DEFAULT '15',
	"minDeliveryFee" numeric(10, 2) DEFAULT '2',
	"maxDeliveryDistance" numeric(10, 2) DEFAULT '20',
	"supportEmail" text,
	"supportPhoneNumber" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"action" text NOT NULL,
	"entityType" text NOT NULL,
	"entityId" text,
	"oldValue" text,
	"newValue" text,
	"ipAddress" text,
	"userAgent" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cart_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" text PRIMARY KEY NOT NULL,
	"cartId" text NOT NULL,
	"productId" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"restaurantId" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"imageUrl" text,
	"displayOrder" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oyru_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"image" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "oyru_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "customer_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"phone" text,
	"address" text,
	"city" text,
	"postalCode" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customer_profiles_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "daily_analytics" (
	"id" text PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"totalOrders" integer DEFAULT 0,
	"totalRevenue" numeric(12, 2) DEFAULT '0',
	"totalDeliveries" integer DEFAULT 0,
	"averageDeliveryTime" numeric(5, 2),
	"activeCustomers" integer DEFAULT 0,
	"activeRestaurants" integer DEFAULT 0,
	"activeDeliveryPartners" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deliveries" (
	"id" text PRIMARY KEY NOT NULL,
	"orderId" text NOT NULL,
	"driverId" text,
	"status" "delivery_status" DEFAULT 'assigned',
	"pickupTime" timestamp,
	"deliveryTime" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "deliveries_orderId_unique" UNIQUE("orderId")
);
--> statement-breakpoint
CREATE TABLE "delivery_partners" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"phoneNumber" text NOT NULL,
	"vehicleType" text,
	"licenseNumber" text,
	"isVerified" boolean DEFAULT false,
	"isActive" boolean DEFAULT true,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"totalOrders" integer DEFAULT 0,
	"totalEarnings" numeric(10, 2) DEFAULT '0',
	"averageRating" numeric(3, 2),
	"serviceType" text,
	"serviceFee" numeric(10, 2),
	"birthPlace" text,
	"guarantorName" text,
	"guarantorPhone" text,
	"agreementPdfUrl" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "delivery_partners_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "delivery_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"phoneNumber" text,
	"vehicleType" text,
	"isAvailable" boolean DEFAULT true,
	"telegramChatId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "delivery_profiles_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "dishes" (
	"id" text PRIMARY KEY NOT NULL,
	"restaurantId" text NOT NULL,
	"categoryId" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"imageUrl" text,
	"isAvailable" boolean DEFAULT true,
	"preparationTime" integer,
	"displayOrder" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hotel_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text,
	"companyName" text NOT NULL,
	"contactPerson" text,
	"ownerFullName" text,
	"email" text,
	"phone" text,
	"address" text,
	"billingType" text DEFAULT 'INVOICE',
	"agreementDuration" text,
	"agreementStartDate" timestamp,
	"agreementEndDate" timestamp,
	"basePaymentAmount" numeric(10, 2),
	"telegramChatId" text,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hotel_accounts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "hotel_chains" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"logoUrl" text,
	"totalLocations" integer DEFAULT 0,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hotel_product_agreements" (
	"id" text PRIMARY KEY NOT NULL,
	"hotelId" text NOT NULL,
	"productId" text NOT NULL,
	"agreedPrice" numeric(10, 2) NOT NULL,
	"unit" text DEFAULT 'kg',
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" text PRIMARY KEY NOT NULL,
	"dishId" text NOT NULL,
	"restaurantId" text NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"minQuantity" integer DEFAULT 5,
	"maxQuantity" integer DEFAULT 100,
	"lastRestocked" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" text NOT NULL,
	"quantityChanged" integer NOT NULL,
	"reason" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" text PRIMARY KEY NOT NULL,
	"orderId" text NOT NULL,
	"dishId" text NOT NULL,
	"quantity" integer NOT NULL,
	"unitPrice" numeric(10, 2) NOT NULL,
	"totalPrice" numeric(10, 2) NOT NULL,
	"specialInstructions" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_status_history" (
	"id" text PRIMARY KEY NOT NULL,
	"orderId" text NOT NULL,
	"fromStatus" text,
	"toStatus" text NOT NULL,
	"changedBy" text,
	"reason" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"restaurantId" text NOT NULL,
	"deliveryPartnerId" text,
	"status" "order_status" DEFAULT 'draft',
	"totalAmount" numeric(10, 2) NOT NULL,
	"deliveryFee" numeric(10, 2) DEFAULT '0',
	"taxAmount" numeric(10, 2) DEFAULT '0',
	"discountAmount" numeric(10, 2) DEFAULT '0',
	"deliveryAddress" text NOT NULL,
	"deliveryCity" text NOT NULL,
	"deliveryLatitude" numeric(10, 8),
	"deliveryLongitude" numeric(11, 8),
	"customerPhoneNumber" text,
	"specialInstructions" text,
	"estimatedDeliveryTime" timestamp,
	"actualDeliveryTime" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oyru_order_feedbacks" (
	"id" text PRIMARY KEY NOT NULL,
	"orderId" text NOT NULL,
	"userId" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "oyru_order_feedbacks_orderId_unique" UNIQUE("orderId")
);
--> statement-breakpoint
CREATE TABLE "oyru_order_items" (
	"id" text PRIMARY KEY NOT NULL,
	"orderId" text NOT NULL,
	"productId" text NOT NULL,
	"quantity" integer NOT NULL,
	"unitPrice" numeric(10, 2) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oyru_order_return_items" (
	"id" text PRIMARY KEY NOT NULL,
	"returnId" text NOT NULL,
	"orderItemId" text NOT NULL,
	"quantity" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oyru_order_returns" (
	"id" text PRIMARY KEY NOT NULL,
	"orderId" text NOT NULL,
	"userId" text NOT NULL,
	"reason" text NOT NULL,
	"status" "return_status" DEFAULT 'pending',
	"adminNotes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "oyru_order_returns_orderId_unique" UNIQUE("orderId")
);
--> statement-breakpoint
CREATE TABLE "oyru_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text,
	"hotelAccountId" text,
	"orderNumber" text NOT NULL,
	"totalAmount" numeric(10, 2) NOT NULL,
	"paymentMethod" "payment_method" DEFAULT 'COD',
	"deliveryAddress" text NOT NULL,
	"deliveryNotes" text,
	"status" "oyru_order_status" DEFAULT 'draft',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "oyru_orders_orderNumber_unique" UNIQUE("orderNumber")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"categoryId" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"image" text,
	"price" numeric(10, 2) NOT NULL,
	"weight" numeric(10, 2),
	"unit" text DEFAULT 'piece',
	"stockQuantity" integer DEFAULT 0 NOT NULL,
	"isAvailable" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promotions" (
	"id" text PRIMARY KEY NOT NULL,
	"restaurantId" text,
	"title" text NOT NULL,
	"description" text,
	"discountType" text NOT NULL,
	"discountValue" numeric(10, 2),
	"minOrderAmount" numeric(10, 2),
	"code" text,
	"maxUses" integer,
	"timesUsed" integer DEFAULT 0,
	"startDate" timestamp,
	"endDate" timestamp,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "promotions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "restaurants" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"imageUrl" text,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"phoneNumber" text,
	"deliveryTime" integer,
	"deliveryFee" numeric(10, 2) DEFAULT '0',
	"minOrderAmount" numeric(10, 2) DEFAULT '0',
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"subject" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'open',
	"priority" text DEFAULT 'medium',
	"assignedTo" text,
	"orderId" text,
	"attachments" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"role" "user_role" DEFAULT 'customer' NOT NULL,
	"phoneNumber" text,
	"address" text,
	"city" text,
	"zipCode" text,
	"profileImageUrl" text,
	"isVerified" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_profile_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_profiles" ADD CONSTRAINT "admin_profiles_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart" ADD CONSTRAINT "cart_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cartId_cart_id_fk" FOREIGN KEY ("cartId") REFERENCES "public"."cart"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_orderId_oyru_orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."oyru_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_driverId_user_id_fk" FOREIGN KEY ("driverId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_profiles" ADD CONSTRAINT "delivery_profiles_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotel_accounts" ADD CONSTRAINT "hotel_accounts_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotel_product_agreements" ADD CONSTRAINT "hotel_product_agreements_hotelId_hotel_accounts_id_fk" FOREIGN KEY ("hotelId") REFERENCES "public"."hotel_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotel_product_agreements" ADD CONSTRAINT "hotel_product_agreements_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_orderId_oyru_orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."oyru_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_changedBy_user_id_fk" FOREIGN KEY ("changedBy") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oyru_order_feedbacks" ADD CONSTRAINT "oyru_order_feedbacks_orderId_oyru_orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."oyru_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oyru_order_feedbacks" ADD CONSTRAINT "oyru_order_feedbacks_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oyru_order_items" ADD CONSTRAINT "oyru_order_items_orderId_oyru_orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."oyru_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oyru_order_items" ADD CONSTRAINT "oyru_order_items_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oyru_order_return_items" ADD CONSTRAINT "oyru_order_return_items_returnId_oyru_order_returns_id_fk" FOREIGN KEY ("returnId") REFERENCES "public"."oyru_order_returns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oyru_order_return_items" ADD CONSTRAINT "oyru_order_return_items_orderItemId_oyru_order_items_id_fk" FOREIGN KEY ("orderItemId") REFERENCES "public"."oyru_order_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oyru_order_returns" ADD CONSTRAINT "oyru_order_returns_orderId_oyru_orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."oyru_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oyru_order_returns" ADD CONSTRAINT "oyru_order_returns_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oyru_orders" ADD CONSTRAINT "oyru_orders_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oyru_orders" ADD CONSTRAINT "oyru_orders_hotelAccountId_hotel_accounts_id_fk" FOREIGN KEY ("hotelAccountId") REFERENCES "public"."hotel_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_oyru_categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."oyru_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;