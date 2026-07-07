'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { getAllOrders } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Search, Download, RefreshCw } from 'lucide-react'

const STATUS_META: Record<string, { color: string; bg: string; label: string }> = {
  draft: { color: '#9ca3af', bg: 'rgba(156,163,175,0.15)', label: 'Draft' },
  submitted: { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)', label: 'Submitted' },
  inventory_review: { color: '#a78bfa', bg: 'rgba(167,139,250,0.15)', label: 'In Review' },
  approved: { color: '#34d399', bg: 'rgba(52,211,153,0.15)', label: 'Approved' },
  assigned: { color: '#60a5fa', bg: 'rgba(96,165,250,0.15)', label: 'Assigned' },
  shipped: { color: '#c084fc', bg: 'rgba(192,132,252,0.15)', label: 'Shipped' },
  delivered: { color: '#4ade80', bg: 'rgba(74,222,128,0.15)', label: 'Delivered' },
  completed: { color: '#10b981', bg: 'rgba(16,185,129,0.15)', label: 'Completed' },
  cancelled: { color: '#f87171', bg: 'rgba(248,113,113,0.15)', label: 'Cancelled' },
  pending: { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)', label: 'Pending' },
  confirmed: { color: '#60a5fa', bg: 'rgba(96,165,250,0.15)', label: 'Confirmed' },
  in_transit: { color: '#c084fc', bg: 'rgba(192,132,252,0.15)', label: 'In Transit' },
}

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { color: '#9ca3af', bg: 'rgba(156,163,175,0.12)', label: status }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '3px 10px', borderRadius: '999px',
      background: meta.bg, color: meta.color,
      fontSize: '11px', fontWeight: '600', letterSpacing: '0.04em',
      border: `1px solid ${meta.color}30`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
      {meta.label}
    </span>
  )
}

const PAGE_SIZE = 15

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  const loadOrders = async () => {
    setLoading(true)
    try {
      const data = await getAllOrders()
      setOrders(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadOrders() }, [])

  const filtered = useMemo(() => orders.filter(o => {
    const q = searchQuery.toLowerCase()
    const matchSearch = !q || o.orderNumber?.toLowerCase().includes(q) || o.userId?.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    return matchSearch && matchStatus
  }), [orders, searchQuery, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const uniqueStatuses = [...new Set(orders.map(o => o.status).filter(Boolean))]

  return (
    <div className="min-h-screen bg-background/50 p-4 sm:p-8">
      {/* Title row */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1 text-sm">{orders.length} total orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadOrders} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            const csv = [
              ['Order ID', 'Customer', 'Amount', 'Status', 'Date'],
              ...filtered.map(o => [o.orderNumber, o.userId || 'Guest', parseFloat(o.totalAmount).toFixed(2) + ' Birr', o.status, new Date(o.createdAt).toLocaleDateString()])
            ].map(r => r.join(',')).join('\n')
            const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURIComponent(csv)
            a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`; a.click()
          }}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by order ID..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[160px]"
        >
          <option value="all">All Statuses</option>
          {uniqueStatuses.map(s => (
            <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                {['Order ID', 'Customer', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-muted-foreground">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 opacity-50" />
                  Loading orders...
                </td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-muted-foreground">
                  {searchQuery || statusFilter !== 'all' ? 'No orders match your filters.' : 'No orders yet.'}
                </td></tr>
              ) : paginated.map((order: any, i) => (
                <tr
                  key={order.id}
                  className="border-t border-border/50 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-foreground/90">{order.orderNumber}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {order.userId ? 'Registered User' : 'Guest'}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-foreground">
                    {parseFloat(order.totalAmount).toFixed(2)} Birr
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status || 'draft'} />
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-5">
        <p className="text-sm text-muted-foreground">
          Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} orders
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Previous</Button>
          <span className="px-3 py-1.5 text-sm font-medium bg-card border border-border rounded-lg">
            {page} / {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>Next</Button>
        </div>
      </div>
    </div>
  )
}
