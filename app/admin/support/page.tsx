'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Search, AlertCircle, MessageCircle } from 'lucide-react'

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const mockTickets = [
    {
      id: 'TICKET001',
      subject: 'Order not received',
      priority: 'high',
      status: 'open',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      customer: 'John Doe',
    },
    {
      id: 'TICKET002',
      subject: 'Wrong items in order',
      priority: 'medium',
      status: 'in_progress',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      customer: 'Jane Smith',
    },
    {
      id: 'TICKET003',
      subject: 'Delivery delay',
      priority: 'low',
      status: 'resolved',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      customer: 'Bob Johnson',
    },
  ]

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800',
    }
    return colors[priority] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      open: 'bg-red-100 text-red-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="p-2 hover:bg-secondary rounded-lg">
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold">Support Tickets</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
        <div className="space-y-4">
          {mockTickets.map((ticket) => (
            <div key={ticket.id} className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-secondary/30">
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                    <p className="text-sm text-muted-foreground">
                      From: {ticket.customer} • {ticket.id}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Opened: {ticket.createdAt.toLocaleString()}
              </p>

              <Link href={`/admin/support/${ticket.id}`}>
                <Button variant="outline" size="sm">
                  View & Respond
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {mockTickets.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No support tickets found</p>
          </div>
        )}
      </main>
    </div>
  )
}
