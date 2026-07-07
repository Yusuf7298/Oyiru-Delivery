import { AuthContext } from '@/lib/middleware/role-check'

export type Permission =
  | 'view_dashboard'
  | 'manage_products'
  | 'manage_orders'
  | 'manage_customers'
  | 'manage_hotels'
  | 'manage_delivery'
  | 'view_reports'
  | 'manage_settings'
  | 'view_own_orders'
  | 'create_orders'
  | 'accept_deliveries'
  | 'view_own_deliveries'
  | 'manage_agreements'
  | 'approve_orders'
  | 'assign_drivers'
  | 'update_delivery_status'
  | 'view_hotel_dashboard'
  | 'view_delivery_dashboard'

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  customer: ['view_own_orders', 'create_orders'],
  // restaurant_owner and hotel are the same business entity — keep their
  // permissions identical so the hotel ordering flow works for either role.
  restaurant_owner: ['view_hotel_dashboard', 'view_own_orders', 'create_orders'],
  delivery_partner: ['accept_deliveries', 'view_own_deliveries', 'update_delivery_status'],
  admin: [
    'view_dashboard',
    'manage_products',
    'manage_orders',
    'manage_customers',
    'manage_hotels',
    'manage_delivery',
    'view_reports',
    'manage_settings',
  ],
  super_admin: [
    'view_dashboard',
    'manage_products',
    'manage_orders',
    'manage_customers',
    'manage_hotels',
    'manage_delivery',
    'view_reports',
    'manage_settings',
  ],
  hotel: ['view_hotel_dashboard', 'view_own_orders', 'create_orders'],
  delivery: ['view_delivery_dashboard', 'accept_deliveries', 'view_own_deliveries', 'update_delivery_status'],
}

export function hasPermission(auth: AuthContext | null, permission: Permission): boolean {
  if (!auth || !auth.isAuthenticated) return false

  const rolePermissions = ROLE_PERMISSIONS[auth.role] || []
  return rolePermissions.includes(permission)
}

export function hasAnyPermission(auth: AuthContext | null, permissions: Permission[]): boolean {
  if (!auth || !auth.isAuthenticated) return false

  const rolePermissions = ROLE_PERMISSIONS[auth.role] || []
  return permissions.some((perm) => rolePermissions.includes(perm))
}

export function hasAllPermissions(auth: AuthContext | null, permissions: Permission[]): boolean {
  if (!auth || !auth.isAuthenticated) return false

  const rolePermissions = ROLE_PERMISSIONS[auth.role] || []
  return permissions.every((perm) => rolePermissions.includes(perm))
}

export function canAccessUserData(auth: AuthContext | null, targetUserId: string): boolean {
  if (!auth || !auth.isAuthenticated) return false

  // Users can access their own data
  if (auth.userId === targetUserId) return true

  // Admins can access any user data
  if (auth.role === 'admin' || auth.role === 'super_admin') return true

  return false
}

export function canAccessOrderData(auth: AuthContext | null, orderUserId: string | null, orderHotelId: string | null): boolean {
  if (!auth || !auth.isAuthenticated) return false

  // Admins can access any order
  if (auth.role === 'admin' || auth.role === 'super_admin') return true

  // Customers can access their own orders
  if (auth.role === 'customer' && orderUserId === auth.userId) return true

  // Hotel users can access their own orders
  if (auth.role === 'hotel' && orderUserId === auth.userId) return true

  return false
}

export function canAccessHotelData(auth: AuthContext | null, hotelId: string): boolean {
  if (!auth || !auth.isAuthenticated) return false

  // Admins can access any hotel data
  if (auth.role === 'admin' || auth.role === 'super_admin') return true

  // Hotel role users can access hotel data
  if (auth.role === 'hotel') return true

  return false
}

export function canAccessDeliveryData(auth: AuthContext | null, driverId: string): boolean {
  if (!auth || !auth.isAuthenticated) return false

  // Admins can access any delivery data
  if (auth.role === 'admin' || auth.role === 'super_admin') return true

  // Drivers can access their own deliveries
  if ((auth.role === 'delivery_partner' || auth.role === 'delivery') && auth.userId === driverId) return true

  return false
}
