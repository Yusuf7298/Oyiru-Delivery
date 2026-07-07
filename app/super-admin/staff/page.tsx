'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Shield, UserPlus, LogIn, FileText, Info } from 'lucide-react'
import { createStaffAccount, getAllProducts } from '@/app/actions/admin'
import BackToDashboardButton from '@/components/BackToDashboardButton'

export default function StaffAccountsPage() {
  const [role, setRole] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>([]);

  // Update a specific agreement field
  const updateAgreement = (index: number, key: 'productId' | 'pricePerKg', value: string) => {
    setAgreements(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };
  const [agreements, setAgreements] = useState<Array<{ productId?: string; pricePerKg?: string }>>([])

  const addAgreement = () => {
    setAgreements(prev => [...prev, {}])
  }

  const removeAgreement = (index: number) => {
    setAgreements(prev => prev.filter((_, i) => i !== index))
  }


  useEffect(() => {
    getAllProducts().then(setProducts)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set('role', role)

    try {
      const res = await createStaffAccount(formData)
      if (res.success) {
        setSuccess('Account created successfully!')
        e.currentTarget.reset()
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
      <div className="flex items-center justify-between mb-4">
        <BackToDashboardButton />
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          Staff Accounts
        </h1>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" /> Create Account
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* === SECTION 1: BASIC INFO === */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-foreground border-b pb-2">1. Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" required placeholder="e.g. John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" name="email" type="email" required placeholder="e.g. john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" required placeholder="+251 911 234567" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Temporary Password</Label>
                    <Input id="password" name="password" type="password" required minLength={8} placeholder="At least 8 characters" />
                  </div>
                </div>
              </div>

              {/* === SECTION 2: ROLE & SPECIFICS === */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-foreground border-b pb-2">2. Role &amp; Specific Details</h3>
                <div className="space-y-2">
                  <Label htmlFor="role">Account Role</Label>
                  <select
                    id="role"
                    name="role"
                    required
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="admin">Admin (Store Manager)</option>
                    <option value="restaurant_owner">Hotel / Restaurant Owner</option>
                    <option value="delivery_partner">Delivery Partner (Driver)</option>
                  </select>
                </div>

                {/* --- Admin Fields --- */}
                {role === 'admin' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="positionTitle">Store Role / Position</Label>
                      <Input id="positionTitle" name="positionTitle" required placeholder="e.g. Warehouse Manager" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input id="startDate" name="startDate" type="date" required />
                    </div>
                  </div>
                )}

                {/* --- Hotel Fields --- */}
                {role === 'restaurant_owner' && (
                  <div className="space-y-4 pt-2">
                    {/* Hotel basic fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Hotel Name</Label>
                        <Input id="companyName" name="companyName" required placeholder="e.g. Hilton Addis" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hotelAddress">Hotel Address</Label>
                        <Input id="hotelAddress" name="hotelAddress" required placeholder="Street address" />
                      </div>
                    </div>

                    {/* Agreements list */}
                    <div className="space-y-4">
                      {agreements.map((agr, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end border border-border rounded p-3 bg-secondary/10">
                          <div className="space-y-2">
                            <Label htmlFor={`productId-${idx}`}>Product</Label>
                            <select
                              id={`productId-${idx}`}
                              name="productId"
                              className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                              value={agr.productId || ''}
                              onChange={e => updateAgreement(idx, 'productId', e.target.value)}
                            >
                              <option value="">Select a product...</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`pricePerKg-${idx}`}>Price per Kg (Birr)</Label>
                            <Input
                              id={`pricePerKg-${idx}`}
                              name="pricePerKg"
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={agr.pricePerKg || ''}
                              onChange={e => updateAgreement(idx, 'pricePerKg', e.target.value)}
                            />
                          </div>
                          <div className="col-span-2 flex justify-end space-x-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => removeAgreement(idx)}>
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button type="button" variant="secondary" size="sm" onClick={addAgreement}>
                        + Add Product Agreement
                      </Button>
                    </div>

                    {/* Other hotel-specific fields */}
                    <div className="bg-secondary/20 p-4 rounded-lg border border-border space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-sm">Agreement Details</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="agreementDuration">Agreement Duration</Label>
                          <Input id="agreementDuration" name="agreementDuration" placeholder="e.g. 1 Year, 6 Months" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="basePaymentAmount">Base Payment Amount (Optional)</Label>
                          <Input id="basePaymentAmount" name="basePaymentAmount" type="number" step="0.01" placeholder="0.00" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- Delivery Partner Fields --- */}
                {role === 'delivery_partner' && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="serviceType">Service Type</Label>
                        <select
                          id="serviceType"
                          name="serviceType"
                          required
                          className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="serviceFee">Service Fee (Amount)</Label>
                        <Input id="serviceFee" name="serviceFee" type="number" step="0.01" required placeholder="0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birthPlace">Birth Place</Label>
                        <Input id="birthPlace" name="birthPlace" required placeholder="City, Region" />
                      </div>
                    </div>

                    <div className="bg-secondary/20 p-4 rounded-lg border border-border space-y-4 mt-4">
                      <span className="font-semibold text-sm">Guarantor Information</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="guarantorName">Guarantor Full Name</Label>
                          <Input id="guarantorName" name="guarantorName" required placeholder="Guarantor Name" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="guarantorPhone">Guarantor Phone</Label>
                          <Input id="guarantorPhone" name="guarantorPhone" required placeholder="+251..." />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* === SECTION 3: AGREEMENT PDF === */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-foreground border-b pb-2">3. Agreement Document</h3>
                <div className="space-y-2">
                  <Label htmlFor="agreementPdf" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Signed Agreement PDF (Optional)
                  </Label>
                  <Input id="agreementPdf" name="agreementPdf" type="file" accept="application/pdf" className="cursor-pointer" />
                </div>
              </div>

              {error && <p className="text-sm text-red-500 font-medium bg-red-500/10 p-3 rounded-lg">{error}</p>}
              {success && <p className="text-sm text-green-600 font-medium bg-green-500/10 p-3 rounded-lg">{success}</p>}

              <input type="hidden" name="agreements" value={JSON.stringify(agreements)} />
              <Button type="submit" disabled={loading} className="w-full mt-4 h-12 text-lg">
                {loading ? 'Creating...' : 'Create Account & Save Agreement'}
              </Button>
            </form>
          </Card>
        </div>

        {/* === SIDEBAR === */}
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
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Super Admin</p>
                <code className="text-sm text-primary">/auth-superadmin-s9k3</code>
              </div>
              <div className="bg-background p-3 rounded-lg border border-border">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Admins</p>
                <code className="text-sm text-primary">/auth-admin-x7f9</code>
              </div>
              <div className="bg-background p-3 rounded-lg border border-border">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Hotels / Restaurants</p>
                <code className="text-sm text-primary">/auth-hotel-m4p2</code>
              </div>
              <div className="bg-background p-3 rounded-lg border border-border">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Delivery Drivers</p>
                <code className="text-sm text-primary">/auth-driver-k9v1</code>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
