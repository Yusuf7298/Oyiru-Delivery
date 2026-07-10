/**
 * Oyru Order Lifecycle Service
 * Manages the full order status workflow:
 * draft → submitted → inventory_review → approved → assigned → shipped → delivered → completed
 */

export type OyruOrderStatus = 'draft' | 'submitted' | 'inventory_review' | 'approved' | 'assigned' | 'shipped' | 'delivered' | 'completed' | 'cancelled'

export const OYRU_ORDER_TRANSITIONS: Record<OyruOrderStatus, OyruOrderStatus[]> = {
  draft: ['submitted', 'cancelled'],
  submitted: ['inventory_review', 'cancelled'],
  inventory_review: ['approved', 'cancelled'],
  approved: ['assigned', 'cancelled'],
  assigned: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['completed'],
  completed: [],
  cancelled: [],
}

export const OYRU_ORDER_STATUS_LABELS: Record<OyruOrderStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  inventory_review: 'Inventory Review',
  approved: 'Approved',
  assigned: 'Driver Assigned',
  shipped: 'Shipped',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const OYRU_ORDER_STATUS_COLORS: Record<OyruOrderStatus, string> = {
  draft: '#6b7280',
  submitted: '#3b82f6',
  inventory_review: '#8b5cf6',
  approved: '#10b981',
  assigned: '#f59e0b',
  shipped: '#6366f1',
  delivered: '#22c55e',
  completed: '#059669',
  cancelled: '#ef4444',
}

/** Which role can perform which transitions */
export const OYRU_TRANSITION_PERMISSIONS: Record<string, { from: OyruOrderStatus; to: OyruOrderStatus }[]> = {
  hotel: [
    { from: 'draft', to: 'submitted' },
    { from: 'draft', to: 'cancelled' },
    { from: 'delivered', to: 'completed' },
  ],
  restaurant_owner: [
    { from: 'draft', to: 'submitted' },
    { from: 'draft', to: 'cancelled' },
    { from: 'delivered', to: 'completed' },
  ],
  // admin and super_admin have identical full control over all transitions
  admin: [
    { from: 'draft', to: 'submitted' },
    { from: 'draft', to: 'cancelled' },
    { from: 'submitted', to: 'inventory_review' },
    { from: 'submitted', to: 'cancelled' },
    { from: 'inventory_review', to: 'approved' },
    { from: 'inventory_review', to: 'cancelled' },
    { from: 'approved', to: 'assigned' },
    { from: 'approved', to: 'cancelled' },
    { from: 'assigned', to: 'shipped' },
    { from: 'assigned', to: 'cancelled' },
    { from: 'shipped', to: 'delivered' },
    { from: 'delivered', to: 'completed' },
  ],
  super_admin: [
    { from: 'draft', to: 'submitted' },
    { from: 'draft', to: 'cancelled' },
    { from: 'submitted', to: 'inventory_review' },
    { from: 'submitted', to: 'cancelled' },
    { from: 'inventory_review', to: 'approved' },
    { from: 'inventory_review', to: 'cancelled' },
    { from: 'approved', to: 'assigned' },
    { from: 'approved', to: 'cancelled' },
    { from: 'assigned', to: 'shipped' },
    { from: 'assigned', to: 'cancelled' },
    { from: 'shipped', to: 'delivered' },
    { from: 'delivered', to: 'completed' },
  ],
  delivery: [
    { from: 'assigned', to: 'shipped' },
    { from: 'shipped', to: 'delivered' },
  ],
  delivery_partner: [
    { from: 'assigned', to: 'shipped' },
    { from: 'shipped', to: 'delivered' },
  ],
}

export function isValidOyruTransition(currentStatus: OyruOrderStatus, newStatus: OyruOrderStatus): boolean {
  return OYRU_ORDER_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false
}

export function canRolePerformTransition(role: string, fromStatus: OyruOrderStatus, toStatus: OyruOrderStatus): boolean {
  const allowed = OYRU_TRANSITION_PERMISSIONS[role]
  if (!allowed) return false
  return allowed.some(t => t.from === fromStatus && t.to === toStatus)
}

export function getValidNextStatesForRole(role: string, currentStatus: OyruOrderStatus): OyruOrderStatus[] {
  const allowed = OYRU_TRANSITION_PERMISSIONS[role]
  if (!allowed) return []
  return allowed.filter(t => t.from === currentStatus).map(t => t.to)
}

export function getStatusLabel(status: OyruOrderStatus): string {
  return OYRU_ORDER_STATUS_LABELS[status] || status
}

export function getStatusColor(status: OyruOrderStatus): string {
  return OYRU_ORDER_STATUS_COLORS[status] || '#6b7280'
}

export function isTerminalStatus(status: OyruOrderStatus): boolean {
  return status === 'completed' || status === 'cancelled'
}

export function canCancelOyruOrder(status: OyruOrderStatus): boolean {
  return !isTerminalStatus(status) && status !== 'shipped' && status !== 'delivered'
}

export function getOrderProgress(status: OyruOrderStatus): number {
  const progressMap: Record<OyruOrderStatus, number> = {
    draft: 5,
    submitted: 15,
    inventory_review: 30,
    approved: 45,
    assigned: 60,
    shipped: 75,
    delivered: 90,
    completed: 100,
    cancelled: 0,
  }
  return progressMap[status] || 0
}

export function getStatusTimeline(currentStatus: OyruOrderStatus): { status: OyruOrderStatus; label: string; completed: boolean; active: boolean }[] {
  const flow: OyruOrderStatus[] = ['draft', 'submitted', 'inventory_review', 'approved', 'assigned', 'shipped', 'delivered', 'completed']
  const currentIndex = flow.indexOf(currentStatus)

  return flow.map((status, index) => ({
    status,
    label: OYRU_ORDER_STATUS_LABELS[status],
    completed: currentStatus === 'cancelled' ? false : index < currentIndex,
    active: status === currentStatus,
  }))
}
