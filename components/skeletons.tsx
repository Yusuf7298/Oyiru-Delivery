export function RestaurantCardSkeleton() {
  return (
    <div className="bg-card rounded-lg overflow-hidden border border-border animate-pulse">
      <div className="bg-secondary h-40 w-full"></div>
      <div className="p-4 space-y-3">
        <div className="bg-secondary h-6 w-3/4 rounded"></div>
        <div className="bg-secondary h-4 w-full rounded"></div>
        <div className="bg-secondary h-4 w-2/3 rounded"></div>
        <div className="flex gap-4 pt-2">
          <div className="bg-secondary h-4 w-1/3 rounded"></div>
          <div className="bg-secondary h-4 w-1/3 rounded"></div>
        </div>
      </div>
    </div>
  )
}

export function MenuItemSkeleton() {
  return (
    <div className="bg-card rounded-lg border border-border p-4 animate-pulse">
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="bg-secondary h-6 w-3/4 rounded mb-2"></div>
          <div className="bg-secondary h-4 w-full rounded mb-2"></div>
          <div className="bg-secondary h-4 w-2/3 rounded mb-3"></div>
          <div className="bg-secondary h-6 w-1/3 rounded"></div>
        </div>
        <div className="w-20 h-20 bg-secondary rounded-lg"></div>
      </div>
    </div>
  )
}

export function OrderHistorySkeleton() {
  return (
    <div className="bg-card rounded-lg border border-border p-4 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="bg-secondary h-6 w-1/3 rounded"></div>
        <div className="bg-secondary h-4 w-20 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="bg-secondary h-4 w-full rounded"></div>
        <div className="bg-secondary h-4 w-2/3 rounded"></div>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="bg-secondary h-6 w-1/4 rounded"></div>
        <div className="bg-secondary h-8 w-20 rounded"></div>
      </div>
    </div>
  )
}

export function RestaurantGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <RestaurantCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg border border-border p-6 animate-pulse">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-secondary"></div>
          <div className="flex-1">
            <div className="bg-secondary h-6 w-1/3 rounded mb-2"></div>
            <div className="bg-secondary h-4 w-1/2 rounded"></div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6 animate-pulse">
        <div className="bg-secondary h-6 w-1/3 rounded mb-6"></div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="bg-secondary h-4 w-1/4 rounded mb-2"></div>
              <div className="bg-secondary h-8 w-full rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
