"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Partner } from "@/app/page"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2 } from "lucide-react"
import { SupportAreasSelect, SUPPORT_AREAS } from "@/components/support-areas-select"

type EditPartnerDialogProps = {
  partner: Partner
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (partner: Partner) => void
}

export function EditPartnerDialog({ partner, open, onOpenChange, onUpdate }: EditPartnerDialogProps) {
  const [formData, setFormData] = useState({
    name: partner.name,
    mainContact: partner.mainContact,
    email: partner.email,
    supportAreas: partner.supportAreas,
    website: partner.website,
    locations: partner.locations.join(", "),
    dealsClosed: partner.dealsClosed,
    lastFollowUp: partner.lastFollowUp,
    nextSteps: partner.nextSteps,
    status: partner.status,
    commissionRate: partner.commissionRate,
    commissionTiers: partner.commissionTiers || [],
  })

  const [newTierName, setNewTierName] = useState("")
  const [newTierRate, setNewTierRate] = useState("")
  const [customAreas, setCustomAreas] = useState<string[]>([])

  useEffect(() => {
    setFormData({
      name: partner.name,
      mainContact: partner.mainContact,
      email: partner.email,
      supportAreas: partner.supportAreas,
      website: partner.website,
      locations: partner.locations.join(", "),
      dealsClosed: partner.dealsClosed,
      lastFollowUp: partner.lastFollowUp,
      nextSteps: partner.nextSteps,
      status: partner.status,
      commissionRate: partner.commissionRate,
      commissionTiers: partner.commissionTiers || [],
    })
  }, [partner])

  const handleAddTier = () => {
    if (newTierName && newTierRate) {
      const newTier = {
        id: `${partner.id}-${Date.now()}`,
        name: newTierName,
        rate: Number(newTierRate),
      }
      setFormData({
        ...formData,
        commissionTiers: [...formData.commissionTiers, newTier],
      })
      setNewTierName("")
      setNewTierRate("")
    }
  }

  const handleRemoveTier = (tierId: string) => {
    setFormData({
      ...formData,
      commissionTiers: formData.commissionTiers.filter((t) => t.id !== tierId),
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const updatedPartner: Partner = {
      ...partner,
      name: formData.name,
      mainContact: formData.mainContact,
      email: formData.email,
      supportAreas: formData.supportAreas,
      website: formData.website,
      locations: formData.locations
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      introsReceived: partner.introsReceived,
      introsMade: partner.introsMade,
      payoutsDue: partner.payoutsDue,
      dealsClosed: formData.dealsClosed,
      affiliates: partner.affiliates, // Keep existing, just hidden from UI
      lastFollowUp: formData.lastFollowUp,
      nextSteps: formData.nextSteps,
      status: formData.status,
      commissionRate: formData.commissionRate,
      commissionTiers: formData.commissionTiers,
    }

    onUpdate(updatedPartner)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Partner</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Partner Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-mainContact">Main Contact *</Label>
              <Input
                id="edit-mainContact"
                value={formData.mainContact}
                onChange={(e) => setFormData({ ...formData, mainContact: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email">Email *</Label>
            <Input
              id="edit-email"
              type="email"
              placeholder="contact@partner.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-website">Website</Label>
            <Input
              id="edit-website"
              type="url"
              placeholder="https://example.com"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Support Areas</Label>
            <SupportAreasSelect
              value={formData.supportAreas}
              onChange={(areas) => setFormData({ ...formData, supportAreas: areas })}
              onAddCustomArea={(area) => setCustomAreas([...customAreas, area])}
              availableAreas={[...SUPPORT_AREAS, ...customAreas]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-locations">Locations (comma-separated)</Label>
            <Input
              id="edit-locations"
              placeholder="New York, London, Tokyo"
              value={formData.locations}
              onChange={(e) => setFormData({ ...formData, locations: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-commissionRate">Default Commission Rate (%)</Label>
            <Input
              id="edit-commissionRate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.commissionRate}
              onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
            />
            <p className="text-sm text-muted-foreground">
              Default commission rate (used as fallback if no tiers are set)
            </p>
          </div>

          <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Commission Tiers</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Set up multiple commission structures (e.g., 10% lifetime vs 40% first month)
            </p>

            {formData.commissionTiers.length > 0 && (
              <div className="space-y-2">
                {formData.commissionTiers.map((tier) => (
                  <div key={tier.id} className="flex items-center justify-between bg-background p-3 rounded-md">
                    <div>
                      <span className="font-medium">{tier.name}</span>
                      <span className="text-muted-foreground ml-2">- {tier.rate}%</span>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveTier(tier.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                placeholder="Tier name (e.g., 10% Lifetime)"
                value={newTierName}
                onChange={(e) => setNewTierName(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Rate %"
                min="0"
                max="100"
                step="0.1"
                value={newTierRate}
                onChange={(e) => setNewTierRate(e.target.value)}
                className="w-32"
              />
              <Button type="button" onClick={handleAddTier} variant="secondary">
                Add Tier
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-lastFollowUp">Last Follow-up Date</Label>
              <Input
                id="edit-lastFollowUp"
                type="date"
                value={formData.lastFollowUp}
                onChange={(e) => setFormData({ ...formData, lastFollowUp: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as "active" | "pending" | "inactive" })
                }
              >
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-nextSteps">Next Steps</Label>
            <Textarea
              id="edit-nextSteps"
              placeholder="Describe the next steps for this partnership..."
              value={formData.nextSteps}
              onChange={(e) => setFormData({ ...formData, nextSteps: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
