"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import type { CallResult } from "@/lib/database.types"

interface AddCallFormProps {
  closers: Array<{ id: string; name: string }>
  setters: Array<{ id: string; name: string }>
  onSuccess?: () => void
}

export function AddCallForm({ closers, setters, onSuccess }: AddCallFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    booking_date: new Date().toISOString().split('T')[0],
    lead_name: '',
    lead_email: '',
    lead_phone: '',
    closer_name: '',
    setter_name: '',
    result: '' as CallResult,
    offer_made: false,
    revenue: 0,
    cash_collected: 0,
    cash_collected_2: 0,
    lead_source: '',
    medium: '',
    campaign: '',
    call_recording_link: '',
    sales_platform: '',
    payment_method: '',
    commission_override: null as number | null,
    commission_rate_override: null as number | null,
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add call')
      }

      toast.success('Call added successfully!')

      // Reset form
      setFormData({
        booking_date: new Date().toISOString().split('T')[0],
        lead_name: '',
        lead_email: '',
        lead_phone: '',
        closer_name: '',
        setter_name: '',
        result: '' as CallResult,
        offer_made: false,
        revenue: 0,
        cash_collected: 0,
        cash_collected_2: 0,
        lead_source: '',
        medium: '',
        campaign: '',
        call_recording_link: '',
        sales_platform: '',
        payment_method: '',
        commission_override: null as number | null,
        commission_rate_override: null as number | null,
        notes: ''
      })

      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message || 'Failed to add call')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 className="text-h2" style={{ marginBottom: 'var(--space-2)' }}>Add New Call</h2>
        <p className="text-small" style={{ color: 'var(--color-text-muted)' }}>Enter the call details below</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="booking_date">Booking Date</Label>
              <Input
                id="booking_date"
                type="date"
                value={formData.booking_date}
                onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead_name">Lead Name</Label>
              <Input
                id="lead_name"
                value={formData.lead_name}
                onChange={(e) => setFormData({ ...formData, lead_name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lead_email">Lead Email</Label>
              <Input
                id="lead_email"
                type="email"
                value={formData.lead_email}
                onChange={(e) => setFormData({ ...formData, lead_email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead_phone">Lead Phone</Label>
              <Input
                id="lead_phone"
                type="tel"
                value={formData.lead_phone}
                onChange={(e) => setFormData({ ...formData, lead_phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="closer_name">Closer</Label>
              <Select
                value={formData.closer_name}
                onValueChange={(value) => setFormData({ ...formData, closer_name: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select closer" />
                </SelectTrigger>
                <SelectContent>
                  {closers.map((closer) => (
                    <SelectItem key={closer.id} value={closer.name}>
                      {closer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="setter_name">Setter</Label>
              <Select
                value={formData.setter_name}
                onValueChange={(value) => setFormData({ ...formData, setter_name: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select setter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">None</SelectItem>
                  {setters.map((setter) => (
                    <SelectItem key={setter.id} value={setter.name}>
                      {setter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="result">Result</Label>
              <Select
                value={formData.result}
                onValueChange={(value) => setFormData({ ...formData, result: value as CallResult })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Follow-Up Scheduled">Follow-Up Scheduled</SelectItem>
                  <SelectItem value="No Show">No Show</SelectItem>
                  <SelectItem value="DQ">DQ</SelectItem>
                  <SelectItem value="Reschedule">Reschedule</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="offer_made">Offer Made?</Label>
              <Select
                value={formData.offer_made.toString()}
                onValueChange={(value) => setFormData({ ...formData, offer_made: value === 'true' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="revenue">Revenue ($)</Label>
              <Input
                id="revenue"
                type="number"
                step="0.01"
                value={formData.revenue}
                onChange={(e) => setFormData({ ...formData, revenue: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cash_collected">Cash Collected ($)</Label>
              <Input
                id="cash_collected"
                type="number"
                step="0.01"
                value={formData.cash_collected}
                onChange={(e) => setFormData({ ...formData, cash_collected: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cash_collected_2">Cash Collected 2 ($)</Label>
              <Input
                id="cash_collected_2"
                type="number"
                step="0.01"
                value={formData.cash_collected_2}
                onChange={(e) => setFormData({ ...formData, cash_collected_2: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lead_source">Lead Source</Label>
              <Input
                id="lead_source"
                value={formData.lead_source}
                onChange={(e) => setFormData({ ...formData, lead_source: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medium">Medium</Label>
              <Input
                id="medium"
                value={formData.medium}
                onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign">Campaign</Label>
              <Input
                id="campaign"
                value={formData.campaign}
                onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="call_recording_link">Call Recording Link</Label>
            <Input
              id="call_recording_link"
              type="url"
              value={formData.call_recording_link}
              onChange={(e) => setFormData({ ...formData, call_recording_link: e.target.value })}
              placeholder="https://"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sales_platform">Sales Platform</Label>
              <Select
                value={formData.sales_platform}
                onValueChange={(value) => setFormData({ ...formData, sales_platform: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  <SelectItem value="Elective">Elective</SelectItem>
                  <SelectItem value="Whop">Whop</SelectItem>
                  <SelectItem value="Fanbasis">Fanbasis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  <SelectItem value="Debit">Debit</SelectItem>
                  <SelectItem value="Bank">Bank</SelectItem>
                  <SelectItem value="Financing">Financing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commission_override">Commission Override ($)</Label>
              <Input
                id="commission_override"
                type="number"
                step="0.01"
                value={formData.commission_override ?? ''}
                onChange={(e) => setFormData({ ...formData, commission_override: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="Leave blank for default"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commission_rate_override">Commission Rate Override (%)</Label>
              <Input
                id="commission_rate_override"
                type="number"
                step="0.1"
                value={formData.commission_rate_override ?? ''}
                onChange={(e) => setFormData({ ...formData, commission_rate_override: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="Leave blank for default"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes..."
              rows={3}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full btn btn-primary">
            {loading ? 'Adding...' : 'Add Call'}
          </Button>
        </form>
    </div>
  )
}
