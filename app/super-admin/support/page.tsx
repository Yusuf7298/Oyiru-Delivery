'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Search, AlertCircle, MessageCircle, Loader2, CheckCircle, Clock } from 'lucide-react'
import { getAllSupportTickets, updateSupportTicketStatus } from '@/app/actions/admin-dashboard'

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-blue-100 text-blue-800 border-blue-200',
}

const statusColors: Record<string, string> = {
  open: 'bg-red-100 text-red-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const loadTickets = async () => {
    try {
      setLoading(true)
      const data = await getAllSupportTickets(page, 20)
      setTickets(data.tickets)
      setTotalPages(data.pages)
    } catch (err) {
      console.error('Error loading tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTickets() }, [page])

  const handleStatusUpdate = async (ticketId: string, newStatus: string) => {
    try {
      setUpdatingId(ticketId)
      await updateSupportTicketStatus(ticketId, newStatus)
      setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t))
    } catch (err) {
      console.error('Error updating ticket:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = tickets.filter(t => {
    const matchSearch = !searchQuery ||
      t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userId?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    return matchSearch && matchPriority && matchStatus
  })

  const openCount = tickets.filter(t => t.status === 'open').length
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length

  return (
    <div className="min-h-screen bg-background/50 p-6 sm:p-8">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-primary" />
          Support Tickets
        </h1>
        <p className="text-muted-foreground mt-1">Manage customer support requests.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Tickets</p>
          <p className="text-2xl font-bold">{tickets.length}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-xs text-red-600 font-medium mb-1">Open</p>
          <p className="text-2xl font-bold text-red-700">{openCount}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-xs text-yellow-600 font-medium mb-1">In Progress</p>
          <p className="text-2xl font-bold text-yellow-700">{inProgressCount}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-xs text-green-600 font-medium mb-1">Resolved</p>
          <p className="text-2xl font-bold text-green-700">{tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by subject or user ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-card border border-dashed border-border rounded-2xl">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold mb-2">No tickets found</h2>
          <p className="text-muted-foreground">
            {tickets.length === 0
              ? 'No support tickets have been submitted yet.'
              : 'No tickets match your current filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(ticket => (
            <div key={ticket.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{ticket.subject}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      User: {ticket.userId?.slice(0, 12)}... • {ticket.id?.slice(0, 8)}
                    </p>
                    {ticket.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{ticket.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${priorityColors[ticket.priority] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                    {ticket.priority || 'medium'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[ticket.status] || 'bg-gray-100 text-gray-800'}`}>
                    {ticket.status?.replace('_', ' ') || 'open'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(ticket.createdAt).toLocaleString()}
                </p>
                <div className="flex gap-2">
                  {ticket.status === 'open' && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updatingId === ticket.id}
                      onClick={() => handleStatusUpdate(ticket.id, 'in_progress')}
                      className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                    >
                      {updatingId === ticket.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Start'}
                    </Button>
                  )}
                  {ticket.status === 'in_progress' && (
                    <Button
                      size="sm"
                      disabled={updatingId === ticket.id}
                      onClick={() => handleStatusUpdate(ticket.id, 'resolved')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {updatingId === ticket.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><CheckCircle className="w-3 h-3 mr-1" />Resolve</>}
                    </Button>
                  )}
                  {ticket.status === 'resolved' && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updatingId === ticket.id}
                      onClick={() => handleStatusUpdate(ticket.id, 'closed')}
                    >
                      Close
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Previous</Button>
            <Button variant="outline" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next</Button>
          </div>
        </div>
      )}
    </div>
  )
}
