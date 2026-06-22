export type OrderStatus = 'pending' | 'confirmed' | 'packing' | 'ready' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled'

export const ORDER_STATE_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['packing', 'cancelled'],
  packing: ['ready', 'cancelled'],
  ready: ['picked_up', 'cancelled'],
  picked_up: ['in_transit', 'cancelled'],
  in_transit: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
}

export const ORDER_STATE_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  packing: 'Packing',
  ready: 'Ready for Pickup',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const ORDER_STATE_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  packing: 'bg-purple-100 text-purple-800',
  ready: 'bg-cyan-100 text-cyan-800',
  picked_up: 'bg-orange-100 text-orange-800',
  in_transit: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export function isValidTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
  return ORDER_STATE_TRANSITIONS[currentStatus].includes(newStatus)
}

export function getValidNextStates(currentStatus: OrderStatus): OrderStatus[] {
  return ORDER_STATE_TRANSITIONS[currentStatus]
}

export function getStateLabel(status: OrderStatus): string {
  return ORDER_STATE_LABELS[status] || status
}

export function getStateColor(status: OrderStatus): string {
  return ORDER_STATE_COLORS[status] || 'bg-gray-100 text-gray-800'
}

export function isTerminalState(status: OrderStatus): boolean {
  return status === 'delivered' || status === 'cancelled'
}

export function canCancelOrder(status: OrderStatus): boolean {
  return status !== 'delivered' && status !== 'cancelled' && status !== 'in_transit' && status !== 'picked_up'
}

export function getOrderProgress(status: OrderStatus): number {
  const progressMap: Record<OrderStatus, number> = {
    pending: 10,
    confirmed: 25,
    packing: 40,
    ready: 55,
    picked_up: 70,
    in_transit: 85,
    delivered: 100,
    cancelled: 0,
  }
  return progressMap[status] || 0
}

export interface OrderStateChange {
  fromStatus: OrderStatus
  toStatus: OrderStatus
  timestamp: Date
  reason?: string
  userId?: string
}

export function validateStateTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
  allowedTransitions?: Record<OrderStatus, OrderStatus[]>
): { valid: boolean; error?: string } {
  const transitions = allowedTransitions || ORDER_STATE_TRANSITIONS

  if (!isValidTransition(currentStatus, newStatus)) {
    return {
      valid: false,
      error: `Cannot transition from ${getStateLabel(currentStatus)} to ${getStateLabel(newStatus)}`,
    }
  }

  return { valid: true }
}
