'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Save, AlertCircle } from 'lucide-react'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    platformCommission: 15,
    minDeliveryFee: 2,
    maxDeliveryDistance: 20,
    supportEmail: 'support@oyru.com',
    supportPhone: '+1234567890',
  })

  const [saved, setSaved] = useState(false)

  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }))
    setSaved(false)
  }

  const handleSave = async () => {
    try {
      // Save settings
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
    }
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
              <h1 className="text-2xl font-bold">Platform Settings</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {saved && (
          <div className="mb-6 p-4 rounded-lg bg-green-100 border border-green-200 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-600" />
            <p className="text-sm text-green-800">Settings saved successfully!</p>
          </div>
        )}

        {/* Financial Settings */}
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <h2 className="text-xl font-bold mb-6">Financial Settings</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Platform Commission (%)</label>
              <input
                type="number"
                value={settings.platformCommission}
                onChange={(e) => handleChange('platformCommission', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Percentage of order amount platform takes as commission
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Minimum Delivery Fee ($)</label>
              <input
                type="number"
                value={settings.minDeliveryFee}
                onChange={(e) => handleChange('minDeliveryFee', e.target.value)}
                step="0.01"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Minimum delivery fee charged to customers
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Maximum Delivery Distance (km)</label>
              <input
                type="number"
                value={settings.maxDeliveryDistance}
                onChange={(e) => handleChange('maxDeliveryDistance', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Maximum distance for delivery from restaurant
              </p>
            </div>
          </div>
        </div>

        {/* Support Settings */}
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <h2 className="text-xl font-bold mb-6">Support Settings</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleChange('supportEmail', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Support Phone</label>
              <input
                type="tel"
                value={settings.supportPhone}
                onChange={(e) => handleChange('supportPhone', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-card rounded-lg border border-red-200 p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-red-600 mb-2">Danger Zone</h3>
              <p className="text-sm text-muted-foreground mb-4">
                These actions are irreversible. Please be careful.
              </p>
              <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                Clear All Cache
              </Button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button onClick={handleSave} size="lg">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </main>
    </div>
  )
}
