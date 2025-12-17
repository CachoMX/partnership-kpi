"use client"

import type React from "react"

import { useState } from "react"
import type { Deal, Partner } from "@/app/page"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type AddDealDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (deal: Omit<Deal, "id" | "createdDate">) => void
  partners: Partner[]
}

export function AddDealDialog({ open, onOpenChange, onAdd, partners }: AddDealDialogProps) {
  const [formData, setFormData] = useState({
    dealName: "",
    partnerId: "",
    partnerName: "",
    dealValue: "",
    status: "intro-made" as const,
    direction: "outbound" as const,
    closeDate: "",
    notes: "",
    commissionTierId: "",
    commissionType: "one-time" as "recurring" | "one-time",
    referralName: "",
    pitchDate: "",
    callDate: "",
    followUpNotes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      dealName: formData.dealName,
      partnerId: formData.partnerId,
      partnerName: formData.partnerName,
      dealValue: Number(formData.dealValue),
      status: formData.status,
      direction: formData.direction,
      closeDate: formData.closeDate,
      notes: formData.notes,
      commissionTierId: formData.commissionTierId,
      commissionType: formData.commissionType,
      referralName: formData.referralName || undefined,
      pitchDate: formData.pitchDate || undefined,
      callDate: formData.callDate || undefined,
      followUpNotes: formData.followUpNotes || undefined,
    })
    setFormData({
      dealName: "",
      partnerId: "",
      partnerName: "",
      dealValue: "",
      status: "intro-made",
      direction: "outbound",
      closeDate: "",
      notes: "",
      commissionTierId: "",
      commissionType: "one-time",
      referralName: "",
      pitchDate: "",
      callDate: "",
      followUpNotes: "",
    })
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

  const isReferralExistingPartner = partners.some((p) => p.name.toLowerCase() === formData.referralName.toLowerCase())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Deal</DialogTitle>
          <DialogDescription>Add a new deal to track</DialogDescription>
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
              value={formData.commissionType}
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
              {formData.commissionType === "recurring"
                ? "System will track ongoing payments for this deal"
                : "Commission is paid once when deal closes"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dealValue">Deal Value ($)</Label>
              <Input
                id="dealValue"
                type="number"
                value={formData.dealValue}
                onChange={(e) => setFormData({ ...formData, dealValue: e.target.value })}
                required
              />
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
                value={formData.referralName}
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
                value={formData.pitchDate}
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
                value={formData.callDate}
                onChange={(e) => setFormData({ ...formData, callDate: e.target.value })}
              />
            </div>
          )}

          {formData.status === "needs-followup" && (
            <div className="space-y-2">
              <Label htmlFor="followUpNotes">Follow-Up Notes</Label>
              <Textarea
                id="followUpNotes"
                value={formData.followUpNotes}
                onChange={(e) => setFormData({ ...formData, followUpNotes: e.target.value })}
                rows={3}
                placeholder="Notes about what needs to be followed up on"
              />
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
            <Button type="submit">Add Deal</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
