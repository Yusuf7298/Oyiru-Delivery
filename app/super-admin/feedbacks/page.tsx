'use client'

import { useEffect, useState } from 'react'
import { getAllFeedbacksAdmin } from '@/app/actions/customer-interactions'
import { Card } from '@/components/ui/card'
import { Star, MessageSquare } from 'lucide-react'

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getAllFeedbacksAdmin()
        setFeedbacks(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-background/50 p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-primary" />
          Customer Feedbacks
        </h1>
        <p className="text-muted-foreground mt-1">Review ratings and comments left by customers on delivered orders.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-card rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : feedbacks.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Feedbacks Yet</h2>
          <p className="text-muted-foreground">When customers leave feedback on their orders, they will appear here.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {feedbacks.map((fdbk) => (
            <Card key={fdbk.id} className="p-6 flex flex-col hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">{fdbk.customerName || 'Unknown Customer'}</h3>
                  <p className="text-xs text-muted-foreground">{fdbk.customerEmail}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">Order #{fdbk.orderNumber || fdbk.orderId.substring(0,8)}</p>
                  <p className="text-xs text-muted-foreground">{new Date(fdbk.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className={`w-5 h-5 ${i <= fdbk.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                ))}
                <span className="ml-2 font-medium">{fdbk.rating}/5</span>
              </div>

              <div className="bg-secondary/30 rounded-lg p-4 flex-1">
                {fdbk.comment ? (
                  <p className="text-sm italic text-foreground/80">&quot;{fdbk.comment}&quot;</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No comment provided.</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
