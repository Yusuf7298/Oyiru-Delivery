'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Shield, Plus, UserPlus, LogIn } from 'lucide-react'
import { createStaffAccount } from '@/app/actions/admin'

export default function StaffAccountsPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('admin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const res = await createStaffAccount({ name, email, password, role })
      if (res.success) {
        setSuccess('Account created successfully!')
        setName('')
        setEmail('')
        setPassword('')
        setRole('admin')
      } else {
        setError(res.error || 'Failed to create account')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background/50 p-6 sm:p-8">
      <div className="mb-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          Staff Accounts
        </h1>
        <p className="text-muted-foreground mt-1">Super Admin portal to manually create staff and partner accounts.</p>
      </div>

      <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" /> Create Account
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. john@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Temporary Password</Label>
              <Input id="password" type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Account Role</Label>
              <select 
                id="role"
                required
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="admin">Admin</option>
                <option value="restaurant_owner">Hotel / Restaurant Owner</option>
                <option value="delivery_partner">Delivery Partner (Driver)</option>
              </select>
            </div>

            {error && <p className="text-sm text-red-500 font-medium bg-red-500/10 p-3 rounded-lg">{error}</p>}
            {success && <p className="text-sm text-green-600 font-medium bg-green-500/10 p-3 rounded-lg">{success}</p>}

            <Button type="submit" disabled={loading} className="w-full mt-4">
              {loading ? 'Creating...' : 'Create Account'}
            </Button>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="p-6 bg-secondary/30 border-none shadow-inner">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <LogIn className="w-5 h-5 text-muted-foreground" /> Secret Login Portals
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Provide these links along with the credentials to the newly created staff members so they can log in.
            </p>
            <div className="space-y-3">
              <div className="bg-background p-3 rounded-lg border border-border">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Admins</p>
                <code className="text-sm text-primary">/auth-admin-x7f9</code>
              </div>
              <div className="bg-background p-3 rounded-lg border border-border">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Restaurants</p>
                <code className="text-sm text-primary">/auth-hotel-m4p2</code>
              </div>
              <div className="bg-background p-3 rounded-lg border border-border">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Drivers</p>
                <code className="text-sm text-primary">/auth-driver-k9v1</code>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
