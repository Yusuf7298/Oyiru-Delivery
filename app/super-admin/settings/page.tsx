'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Save, AlertCircle, Loader2 } from 'lucide-react'
import { getAdminSettings, saveAdminSettings } from '@/app/actions/settings'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    platformCommission: 15,
    minDeliveryFee: 5,
    maxDeliveryDistance: 20,
    supportEmail: 'support@oyru.com',
    supportPhone: '+251911000000',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAdminSettings()
        if (data) {
          setSettings({
            platformCommission: parseFloat(data.platformCommissionPercentage || '15'),
            minDeliveryFee: parseFloat(data.minDeliveryFee || '5'),
            maxDeliveryDistance: parseFloat(data.maxDeliveryDistance || '20'),
            supportEmail: data.supportEmail || 'support@oyru.com',
            supportPhone: data.supportPhoneNumber || '+251911000000',
          })
        }
      } catch (err) {
        // First load — defaults are fine
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleChange = (field: string, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }))
    setSaved(false)
    setError(null)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await saveAdminSettings({
        platformCommission: Number(settings.platformCommission),
        minDeliveryFee: Number(settings.minDeliveryFee),
        maxDeliveryDistance: Number(settings.maxDeliveryDistance),
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background/50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background/50 p-6 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Platform Settings</h1>
          <p className="text-muted-foreground mt-1">Changes are persisted to the database immediately on save.</p>
        </div>

        {saved && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <p className="text-sm font-medium text-green-600">Settings saved to database.</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
        )}

        {/* Financial Settings */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6 space-y-6">
          <h2 className="text-lg font-bold">Financial Settings</h2>

          <div>
            <label className="block text-sm font-semibold mb-2">Platform Commission (%)</label>
            <input
              type="number"
              min="0" max="100"
              value={settings.platformCommission}
              onChange={e => handleChange('platformCommission', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">Percentage of each order taken as platform commission</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Minimum Delivery Fee (Birr)</label>
            <input
              type="number"
              min="0" step="0.01"
              value={settings.minDeliveryFee}
              onChange={e => handleChange('minDeliveryFee', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Maximum Delivery Distance (km)</label>
            <input
              type="number"
              min="1"
              value={settings.maxDeliveryDistance}
              onChange={e => handleChange('maxDeliveryDistance', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Support Settings */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6 space-y-6">
          <h2 className="text-lg font-bold">Support Settings</h2>

          <div>
            <label className="block text-sm font-semibold mb-2">Support Email</label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={e => handleChange('supportEmail', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Support Phone</label>
            <input
              type="tel"
              value={settings.supportPhone}
              onChange={e => handleChange('supportPhone', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg" className="px-8">
            {saving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" />Save Settings</>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
