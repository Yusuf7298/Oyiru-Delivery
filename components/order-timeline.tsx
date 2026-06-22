import { ORDER_STATE_LABELS, getStateColor, ORDER_STATE_TRANSITIONS } from '@/lib/services/order-lifecycle'

type OrderStatus = 'pending' | 'confirmed' | 'packing' | 'ready' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled'

interface TimelineEvent {
  status: OrderStatus
  timestamp?: Date
  label: string
}

interface OrderTimelineProps {
  currentStatus: OrderStatus
  events?: TimelineEvent[]
  createdAt?: Date
}

export function OrderTimeline({ currentStatus, events = [], createdAt }: OrderTimelineProps) {
  const statuses: OrderStatus[] = [
    'pending',
    'confirmed',
    'packing',
    'ready',
    'picked_up',
    'in_transit',
    'delivered',
  ]

  const getIsCompleted = (status: OrderStatus) => {
    const currentIndex = statuses.indexOf(currentStatus)
    const statusIndex = statuses.indexOf(status)
    return statusIndex < currentIndex || currentStatus === status
  }

  const getIsActive = (status: OrderStatus) => currentStatus === status

  const getTimestamp = (status: OrderStatus): Date | undefined => {
    if (status === 'pending' && createdAt) {
      return createdAt
    }
    const event = events.find((e) => e.status === status)
    return event?.timestamp
  }

  if (currentStatus === 'cancelled') {
    return (
      <div className="border-l-4 border-red-500 pl-6 py-4">
        <h3 className="font-bold text-red-600">Order Cancelled</h3>
        <p className="text-sm text-gray-600">
          {createdAt && `on ${new Date(createdAt).toLocaleDateString()}`}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {statuses.map((status, index) => {
        const isCompleted = getIsCompleted(status)
        const isActive = getIsActive(status)
        const timestamp = getTimestamp(status)

        return (
          <div key={status} className="flex gap-4">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                }`}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              {index < statuses.length - 1 && (
                <div
                  className={`w-1 h-16 transition-colors ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className="pb-8 flex-1">
              <h4 className="font-semibold text-foreground">{ORDER_STATE_LABELS[status]}</h4>
              {timestamp ? (
                <p className="text-sm text-muted-foreground">
                  {new Date(timestamp).toLocaleDateString()}{' '}
                  {new Date(timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Pending</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
