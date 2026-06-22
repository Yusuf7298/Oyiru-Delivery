export type OrderStatus = 'pending' | 'confirmed' | 'packing' | 'assigned' | 'delivered' | 'cancelled'

export type InternalStatus = 'pending' | 'confirmed' | 'packing' | 'ready' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled'

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  packing: 'Packing',
  assigned: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  packing: 'bg-purple-100 text-purple-800',
  assigned: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const STATUS_ICONS: Record<OrderStatus, string> = {
  pending: '📦',
  confirmed: '✓',
  packing: '📋',
  assigned: '🚗',
  delivered: '✓✓',
  cancelled: '✗',
}

// Map internal states to public customer-facing states
export function mapInternalToPublicStatus(internalStatus: InternalStatus): OrderStatus {
  switch (internalStatus) {
    case 'pending':
      return 'pending'
    case 'confirmed':
      return 'confirmed'
    case 'packing':
      return 'packing'
    case 'ready':
    case 'picked_up':
      return 'assigned'
    case 'in_transit':
      return 'assigned'
    case 'delivered':
      return 'delivered'
    case 'cancelled':
      return 'cancelled'
    default:
      return 'pending'
  }
}

// Map public states back to internal states (for operational tracking)
export function mapPublicToInternalStatus(publicStatus: OrderStatus): InternalStatus {
  switch (publicStatus) {
    case 'pending':
      return 'pending'
    case 'confirmed':
      return 'confirmed'
    case 'packing':
      return 'packing'
    case 'assigned':
      return 'in_transit'
    case 'delivered':
      return 'delivered'
    case 'cancelled':
      return 'cancelled'
    default:
      return 'pending'
  }
}

export function getStatusLabel(status: OrderStatus): string {
  return STATUS_LABELS[status] || 'Unknown'
}

export function getStatusColor(status: OrderStatus): string {
  return STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'
}

export function getStatusIcon(status: OrderStatus): string {
  return STATUS_ICONS[status] || '?'
}

export function isOrderComplete(status: OrderStatus): boolean {
  return status === 'delivered' || status === 'cancelled'
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['packing', 'cancelled'],
    packing: ['assigned', 'cancelled'],
    assigned: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
  }

  return (validTransitions[from] || []).includes(to)
}
