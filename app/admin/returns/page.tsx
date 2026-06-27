'use client'

import { useEffect, useState } from 'react'
import { getAllReturnsAdmin, updateReturnStatusAdmin } from '@/app/actions/customer-interactions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RotateCcw, CheckCircle, XCircle } from 'lucide-react'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-500',
  approved: 'bg-green-500/20 text-green-500',
  rejected: 'bg-red-500/20 text-red-500',
  completed: 'bg-blue-500/20 text-blue-500',
}

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const data = await getAllReturnsAdmin()
      setReturns(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleUpdateStatus = async (returnId: string, status: string) => {
    try {
      setUpdating(returnId)
      const res = await updateReturnStatusAdmin(returnId, status)
      if (res.success) {
        await loadData()
      } else {
        alert('Failed to update return status')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="min-h-screen bg-background/50 p-6 sm:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <RotateCcw className="w-8 h-8 text-primary" />
            Return Requests
          </h1>
          <p className="text-muted-foreground mt-1">Manage and process customer return requests.</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-card rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : returns.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2">
          <RotateCcw className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Returns Requested</h2>
          <p className="text-muted-foreground">When customers request a return, they will appear here.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {returns.map((ret) => {
            const returnedValue = ret.items?.reduce((sum: number, item: any) => sum + parseFloat(item.unitPrice || '0') * item.quantity, 0) || 0
            
            return (
              <Card key={ret.id} className="p-6 flex flex-col md:flex-row gap-6 hover:shadow-lg transition-shadow border border-border">
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-3">
                        Order #{ret.orderNumber || ret.orderId.substring(0,8)}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[ret.status] || 'bg-secondary'}`}>
                          {ret.status}
                        </span>
                      </h3>
                      <p className="text-sm text-muted-foreground">Requested on {new Date(ret.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Order: {parseFloat(ret.totalAmount).toFixed(2)} Birr</p>
                      <p className="text-lg font-bold text-red-500">Refund: {returnedValue.toFixed(2)} Birr</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Customer</p>
                      <p className="font-medium">{ret.customerName}</p>
                      <p className="text-muted-foreground text-xs">{ret.customerEmail}</p>
                      
                      <p className="text-muted-foreground mt-3 mb-1">Return Reason</p>
                      <p className="font-medium bg-secondary/30 p-2 rounded-lg border border-border/50">{ret.reason}</p>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground mb-2">Items to Return</p>
                      <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                        {ret.items?.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between bg-secondary/20 p-2 rounded border border-border/50">
                            <span className="font-medium flex-1 truncate">{item.name}</span>
                            <span className="font-bold whitespace-nowrap ml-2 bg-background px-2 py-0.5 rounded text-xs border border-border">{item.quantity}x</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-48 flex flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                  {ret.status === 'pending' ? (
                    <>
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white" 
                        onClick={() => handleUpdateStatus(ret.id, 'approved')}
                        disabled={updating === ret.id}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" /> Approve
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => handleUpdateStatus(ret.id, 'rejected')}
                        disabled={updating === ret.id}
                      >
                        <XCircle className="w-4 h-4 mr-2" /> Reject
                      </Button>
                    </>
                  ) : ret.status === 'approved' ? (
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                      onClick={() => handleUpdateStatus(ret.id, 'completed')}
                      disabled={updating === ret.id}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> Mark Completed
                    </Button>
                  ) : (
                    <div className="text-center p-3 bg-secondary/30 rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">Action Completed</p>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
