import { pgTable, text, timestamp, boolean, decimal, integer, pgEnum } from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- Enums ---
export const userRoleEnum = pgEnum('user_role', ['customer', 'restaurant_owner', 'delivery_partner', 'admin'])
export const orderStatusEnum = pgEnum('order_status', ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'in_transit', 'delivered', 'cancelled'])

// --- App tables ---

export const usersProfile = pgTable('users_profile', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().unique(),
  role: userRoleEnum('role').notNull().default('customer'),
  phoneNumber: text('phoneNumber'),
  address: text('address'),
  city: text('city'),
  zipCode: text('zipCode'),
  profileImageUrl: text('profileImageUrl'),
  isVerified: boolean('isVerified').default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const restaurants = pgTable('restaurants', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  imageUrl: text('imageUrl'),
  address: text('address').notNull(),
  city: text('city').notNull(),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  phoneNumber: text('phoneNumber'),
  deliveryTime: integer('deliveryTime'),
  deliveryFee: decimal('deliveryFee', { precision: 10, scale: 2 }).default('0'),
  minOrderAmount: decimal('minOrderAmount', { precision: 10, scale: 2 }).default('0'),
  isActive: boolean('isActive').default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  restaurantId: text('restaurantId').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  imageUrl: text('imageUrl'),
  displayOrder: integer('displayOrder').default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const dishes = pgTable('dishes', {
  id: text('id').primaryKey(),
  restaurantId: text('restaurantId').notNull(),
  categoryId: text('categoryId').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  imageUrl: text('imageUrl'),
  isAvailable: boolean('isAvailable').default(true),
  preparationTime: integer('preparationTime'),
  displayOrder: integer('displayOrder').default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  restaurantId: text('restaurantId').notNull(),
  deliveryPartnerId: text('deliveryPartnerId'),
  status: orderStatusEnum('status').default('pending'),
  totalAmount: decimal('totalAmount', { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal('deliveryFee', { precision: 10, scale: 2 }).default('0'),
  taxAmount: decimal('taxAmount', { precision: 10, scale: 2 }).default('0'),
  discountAmount: decimal('discountAmount', { precision: 10, scale: 2 }).default('0'),
  deliveryAddress: text('deliveryAddress').notNull(),
  deliveryCity: text('deliveryCity').notNull(),
  deliveryLatitude: decimal('deliveryLatitude', { precision: 10, scale: 8 }),
  deliveryLongitude: decimal('deliveryLongitude', { precision: 11, scale: 8 }),
  customerPhoneNumber: text('customerPhoneNumber'),
  specialInstructions: text('specialInstructions'),
  estimatedDeliveryTime: timestamp('estimatedDeliveryTime'),
  actualDeliveryTime: timestamp('actualDeliveryTime'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const orderItems = pgTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('orderId').notNull(),
  dishId: text('dishId').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unitPrice', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('totalPrice', { precision: 10, scale: 2 }).notNull(),
  specialInstructions: text('specialInstructions'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const deliveryPartners = pgTable('delivery_partners', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().unique(),
  phoneNumber: text('phoneNumber').notNull(),
  vehicleType: text('vehicleType'),
  licenseNumber: text('licenseNumber'),
  isVerified: boolean('isVerified').default(false),
  isActive: boolean('isActive').default(true),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  totalOrders: integer('totalOrders').default(0),
  totalEarnings: decimal('totalEarnings', { precision: 10, scale: 2 }).default('0'),
  averageRating: decimal('averageRating', { precision: 3, scale: 2 }),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const adminSettings = pgTable('admin_settings', {
  id: text('id').primaryKey(),
  platformCommissionPercentage: decimal('platformCommissionPercentage', { precision: 5, scale: 2 }).default('15'),
  minDeliveryFee: decimal('minDeliveryFee', { precision: 10, scale: 2 }).default('2'),
  maxDeliveryDistance: decimal('maxDeliveryDistance', { precision: 10, scale: 2 }).default('20'),
  supportEmail: text('supportEmail'),
  supportPhoneNumber: text('supportPhoneNumber'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const adminPermissions = pgTable('admin_permissions', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  role: userRoleEnum('role').notNull(),
  canViewDashboard: boolean('canViewDashboard').default(false),
  canManageProducts: boolean('canManageProducts').default(false),
  canManageOrders: boolean('canManageOrders').default(false),
  canManageCustomers: boolean('canManageCustomers').default(false),
  canManageHotels: boolean('canManageHotels').default(false),
  canManageDelivery: boolean('canManageDelivery').default(false),
  canViewReports: boolean('canViewReports').default(false),
  canManageSettings: boolean('canManageSettings').default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  action: text('action').notNull(),
  entityType: text('entityType').notNull(),
  entityId: text('entityId'),
  oldValue: text('oldValue'),
  newValue: text('newValue'),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const hotelChains = pgTable('hotel_chains', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  logoUrl: text('logoUrl'),
  totalLocations: integer('totalLocations').default(0),
  isActive: boolean('isActive').default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const inventory = pgTable('inventory', {
  id: text('id').primaryKey(),
  dishId: text('dishId').notNull(),
  restaurantId: text('restaurantId').notNull(),
  quantity: integer('quantity').notNull().default(0),
  minQuantity: integer('minQuantity').default(5),
  maxQuantity: integer('maxQuantity').default(100),
  lastRestocked: timestamp('lastRestocked'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const supportTickets = pgTable('support_tickets', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  subject: text('subject').notNull(),
  description: text('description'),
  status: text('status').default('open'),
  priority: text('priority').default('medium'),
  assignedTo: text('assignedTo'),
  orderId: text('orderId'),
  attachments: text('attachments'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const promotions = pgTable('promotions', {
  id: text('id').primaryKey(),
  restaurantId: text('restaurantId'),
  title: text('title').notNull(),
  description: text('description'),
  discountType: text('discountType').notNull(),
  discountValue: decimal('discountValue', { precision: 10, scale: 2 }),
  minOrderAmount: decimal('minOrderAmount', { precision: 10, scale: 2 }),
  code: text('code').unique(),
  maxUses: integer('maxUses'),
  timesUsed: integer('timesUsed').default(0),
  startDate: timestamp('startDate'),
  endDate: timestamp('endDate'),
  isActive: boolean('isActive').default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const dailyAnalytics = pgTable('daily_analytics', {
  id: text('id').primaryKey(),
  date: timestamp('date').notNull(),
  totalOrders: integer('totalOrders').default(0),
  totalRevenue: decimal('totalRevenue', { precision: 12, scale: 2 }).default('0'),
  totalDeliveries: integer('totalDeliveries').default(0),
  averageDeliveryTime: decimal('averageDeliveryTime', { precision: 5, scale: 2 }),
  activeCustomers: integer('activeCustomers').default(0),
  activeRestaurants: integer('activeRestaurants').default(0),
  activeDeliveryPartners: integer('activeDeliveryPartners').default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// --- OYRU DELIVERY SPECIFIC TABLES ---

export const paymentMethodEnum = pgEnum('payment_method', ['COD', 'INVOICE'])
export const deliveryStatusEnum = pgEnum('delivery_status', ['assigned', 'picked_up', 'in_transit', 'delivered'])

export const categories_oyru = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  categoryId: text('categoryId').notNull().references(() => categories_oyru.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  image: text('image'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  weight: decimal('weight', { precision: 10, scale: 2 }),
  unit: text('unit').default('piece'),
  stockQuantity: integer('stockQuantity').notNull().default(0),
  isAvailable: boolean('isAvailable').default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const customerProfiles = pgTable('customer_profiles', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  postalCode: text('postalCode'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const hotelAccounts = pgTable('hotel_accounts', {
  id: text('id').primaryKey(),
  companyName: text('companyName').notNull(),
  contactPerson: text('contactPerson'),
  email: text('email').unique(),
  phone: text('phone'),
  billingType: text('billingType').default('INVOICE'),
  isActive: boolean('isActive').default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const cart = pgTable('cart', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const cartItems = pgTable('cart_items', {
  id: text('id').primaryKey(),
  cartId: text('cartId').notNull().references(() => cart.id, { onDelete: 'cascade' }),
  productId: text('productId').notNull().references(() => products.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(1),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const oyruOrders = pgTable('orders', {
  id: text('id').primaryKey(),
  userId: text('userId').references(() => user.id, { onDelete: 'cascade' }),
  hotelAccountId: text('hotelAccountId').references(() => hotelAccounts.id, { onDelete: 'cascade' }),
  orderNumber: text('orderNumber').notNull().unique(),
  totalAmount: decimal('totalAmount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum('paymentMethod').default('COD'),
  deliveryAddress: text('deliveryAddress').notNull(),
  deliveryNotes: text('deliveryNotes'),
  status: text('status').default('pending'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const oyruOrderItems = pgTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('orderId').notNull().references(() => oyruOrders.id, { onDelete: 'cascade' }),
  productId: text('productId').notNull().references(() => products.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unitPrice', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const deliveries = pgTable('deliveries', {
  id: text('id').primaryKey(),
  orderId: text('orderId').notNull().unique().references(() => oyruOrders.id, { onDelete: 'cascade' }),
  driverId: text('driverId').references(() => user.id, { onDelete: 'setNull' }),
  status: deliveryStatusEnum('status').default('assigned'),
  pickupTime: timestamp('pickupTime'),
  deliveryTime: timestamp('deliveryTime'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const inventoryLogs = pgTable('inventory_logs', {
  id: text('id').primaryKey(),
  productId: text('productId').notNull().references(() => products.id, { onDelete: 'cascade' }),
  quantityChanged: integer('quantityChanged').notNull(),
  reason: text('reason'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})
