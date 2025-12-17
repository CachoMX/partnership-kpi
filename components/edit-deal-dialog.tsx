"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Deal, Partner } from "@/app/page"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type EditDealDialogProps = {
  deal: Deal
  partners: Partner[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (deal: Deal) => void
}

export function EditDealDialog({ deal, partners, open, onOpenChange, onUpdate }: EditDealDialogProps) {
  const [formData, setFormData] = useState(deal)

  useEffect(() => {
    setFormData(deal)
  }, [deal])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(formData)
  }

  const handlePartnerChange = (partnerId: string) => {
    const partner = partners.find((p) => p.id === partnerId)
    setFormData({
      ...formData,
      partnerId,
      partnerName: partner?.name || "",
      commissionTierId: "", // Reset commission tier when partner changes
    })
  }

  const selectedPartner = partners.find((p) => p.id === formData.partnerId)

  const isReferralExistingPartner = partners.some(
    (p) => p.name.toLowerCase() === (formData.referralName || "").toLowerCase(),
  )

  const calculateCommission = () => {
    if (!selectedPartner) return 0
    const tier = selectedPartner.commissionTiers.find((t) => t.id === formData.commissionTierId)
    const rate = tier?.rate || selectedPartner.commissionRate
    return (formData.dealValue * rate) / 100
  }

  const getMonthsElapsed = () => {
    if (!formData.closeDate || formData.status !== "won") return 0

    const closeDate = new Date(formData.closeDate)
    const today = new Date()

    const months = (today.getFullYear() - closeDate.getFullYear()) * 12 + (today.getMonth() - closeDate.getMonth())

    return Math.max(0, months + 1) // +1 to include the current month
  }

  const monthsElapsed = getMonthsElapsed()
  const isRecurring = (formData.commissionType || "one-time") === "recurring"
  const recurringPayoutsPending = isRecurring && formData.status === "won" ? monthsElapsed : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Deal</DialogTitle>
          <DialogDescription>Update deal information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dealName">Deal Name</Label>
              <Input
                id="dealName"
                value={formData.dealName}
                onChange={(e) => setFormData({ ...formData, dealName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partner">Partner</Label>
              <Select value={formData.partnerId} onValueChange={handlePartnerChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select partner" />
                </SelectTrigger>
                <SelectContent>
                  {partners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedPartner && selectedPartner.commissionTiers.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="commissionTier">Commission Structure</Label>
              <Select
                value={formData.commissionTierId}
                onValueChange={(value) => setFormData({ ...formData, commissionTierId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select commission structure" />
                </SelectTrigger>
                <SelectContent>
                  {selectedPartner.commissionTiers.map((tier) => (
                    <SelectItem key={tier.id} value={tier.id}>
                      {tier.name} - {tier.rate}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Choose which commission structure applies to this specific deal
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="commissionType">Commission Type</Label>
            <Select
              value={formData.commissionType || "one-time"}
              onValueChange={(value: "recurring" | "one-time") => setFormData({ ...formData, commissionType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one-time">One-Time Commission</SelectItem>
                <SelectItem value="recurring">Recurring Commission</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {(formData.commissionType || "one-time") === "recurring"
                ? "System will track monthly ongoing payments for this deal"
                : "Commission is paid once when deal closes"}
            </p>
            {isRecurring && formData.status === "won" && monthsElapsed > 0 && (
              <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 text-purple-900">
                  <span className="font-semibold">Recurring Payouts Due:</span>
                  <span className="text-lg font-bold">{monthsElapsed} months</span>
                </div>
                <div className="text-sm text-purple-700 mt-1">
                  ${calculateCommission().toLocaleString()} × {monthsElapsed} = $
                  {(calculateCommission() * monthsElapsed).toLocaleString()}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dealValue">Deal Value ($)</Label>
              <Input
                id="dealValue"
                type="number"
                value={formData.dealValue}
                onChange={(e) => setFormData({ ...formData, dealValue: Number(e.target.value) })}
                required
              />
              {formData.commissionTierId && (
                <p className="text-sm text-indigo-600 font-medium">
                  Commission: ${calculateCommission().toLocaleString()}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intro-made">Intro Made</SelectItem>
                  <SelectItem value="call-booked">Call Booked</SelectItem>
                  <SelectItem value="pitch-made">Pitch Made</SelectItem>
                  <SelectItem value="needs-followup">Needs Follow-Up</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="affiliate-paid">Affiliate Paid</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.status === "intro-made" && (
            <div className="space-y-2">
              <Label htmlFor="referralName">Referral Name</Label>
              <Input
                id="referralName"
                value={formData.referralName || ""}
                onChange={(e) => setFormData({ ...formData, referralName: e.target.value })}
                placeholder="Name of person being referred"
              />
              {isReferralExistingPartner && formData.referralName && (
                <p className="text-sm text-amber-600">Note: This name matches an existing partner</p>
              )}
            </div>
          )}

          {formData.status === "pitch-made" && (
            <div className="space-y-2">
              <Label htmlFor="pitchDate">Pitch Date</Label>
              <Input
                id="pitchDate"
                type="date"
                value={formData.pitchDate || ""}
                onChange={(e) => setFormData({ ...formData, pitchDate: e.target.value })}
              />
            </div>
          )}

          {formData.status === "call-booked" && (
            <div className="space-y-2">
              <Label htmlFor="callDate">Call Date</Label>
              <Input
                id="callDate"
                type="date"
                value={formData.callDate || ""}
                onChange={(e) => setFormData({ ...formData, callDate: e.target.value })}
              />
            </div>
          )}

          {formData.status === "needs-followup" && (
            <div className="space-y-2">
              <Label htmlFor="followUpNotes">Follow-Up Notes</Label>
              <Textarea
                id="followUpNotes"
                value={formData.followUpNotes || ""}
                onChange={(e) => setFormData({ ...formData, followUpNotes: e.target.value })}
                rows={3}
                placeholder="Notes about what needs to be followed up on"
              />
            </div>
          )}

          {formData.status === "affiliate-paid" && (
            <div className="space-y-4 p-4 border rounded-lg bg-emerald-50">
              <h3 className="font-semibold text-emerald-900">Payment Information</h3>

              {isRecurring && (
                <div className="space-y-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <Label htmlFor="monthsPaid">Months Paid</Label>
                  <Input
                    id="monthsPaid"
                    type="number"
                    min="1"
                    max={monthsElapsed}
                    value={formData.monthsPaid || 1}
                    onChange={(e) => setFormData({ ...formData, monthsPaid: Number(e.target.value) })}
                  />
                  <p className="text-sm text-purple-700">
                    Total months elapsed: {monthsElapsed}. Specify how many months are being paid with this payment.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="affiliatePaymentDate">Payment Date</Label>
                  <Input
                    id="affiliatePaymentDate"
                    type="date"
                    value={formData.affiliatePaymentDate || ""}
                    onChange={(e) => setFormData({ ...formData, affiliatePaymentDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="affiliatePaymentMethod">Payment Method</Label>
                  <Select
                    value={formData.affiliatePaymentMethod || ""}
                    onValueChange={(value) => setFormData({ ...formData, affiliatePaymentMethod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Wire Transfer">Wire Transfer</SelectItem>
                      <SelectItem value="ACH">ACH</SelectItem>
                      <SelectItem value="Check">Check</SelectItem>
                      <SelectItem value="PayPal">PayPal</SelectItem>
                      <SelectItem value="Venmo">Venmo</SelectItem>
                      <SelectItem value="Zelle">Zelle</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="affiliatePaymentAmount">Payment Amount ($)</Label>
                  <Input
                    id="affiliatePaymentAmount"
                    type="number"
                    value={
                      formData.affiliatePaymentAmount ||
                      (isRecurring ? calculateCommission() * (formData.monthsPaid || 1) : calculateCommission())
                    }
                    onChange={(e) => setFormData({ ...formData, affiliatePaymentAmount: Number(e.target.value) })}
                    placeholder={`Suggested: $${(isRecurring ? calculateCommission() * (formData.monthsPaid || 1) : calculateCommission()).toLocaleString()}`}
                  />
                  <p className="text-sm text-muted-foreground">
                    {isRecurring
                      ? `${formData.monthsPaid || 1} month(s): $${(calculateCommission() * (formData.monthsPaid || 1)).toLocaleString()}`
                      : `Calculated commission: $${calculateCommission().toLocaleString()}`}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="affiliatePaymentReference">Payment Reference</Label>
                  <Input
                    id="affiliatePaymentReference"
                    value={formData.affiliatePaymentReference || ""}
                    onChange={(e) => setFormData({ ...formData, affiliatePaymentReference: e.target.value })}
                    placeholder="Transaction ID, check number, etc."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="affiliatePaymentNotes">Payment Notes</Label>
                <Textarea
                  id="affiliatePaymentNotes"
                  value={formData.affiliatePaymentNotes || ""}
                  onChange={(e) => setFormData({ ...formData, affiliatePaymentNotes: e.target.value })}
                  rows={2}
                  placeholder="Any additional payment details or notes"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="direction">Deal Direction</Label>
            <Select
              value={formData.direction}
              onValueChange={(value: any) => setFormData({ ...formData, direction: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="outbound">→ Sent to Partner (I&apos;m sending them business)</SelectItem>
                <SelectItem value="inbound">← Received from Partner (They&apos;re sending me business)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="closeDate">Expected Close Date</Label>
            <Input
              id="closeDate"
              type="date"
              value={formData.closeDate}
              onChange={(e) => setFormData({ ...formData, closeDate: e.target.value })}
              disabled={false}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Deal</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
