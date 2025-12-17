"use client"

import type React from "react"

import { useState } from "react"
import type { Partner } from "@/app/page"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SupportAreasSelect, SUPPORT_AREAS } from "@/components/support-areas-select"

type AddPartnerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (partner: Omit<Partner, "id">) => void
}

export function AddPartnerDialog({ open, onOpenChange, onAdd }: AddPartnerDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    mainContact: "",
    email: "",
    supportAreas: [] as string[],
    website: "",
    locations: "",
    dealsClosed: 0,
    lastFollowUp: "",
    nextSteps: "",
    status: "active" as "active" | "pending" | "inactive",
    commissionRate: 10,
  })

  const [customAreas, setCustomAreas] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const partner: Omit<Partner, "id"> = {
      name: formData.name,
      mainContact: formData.mainContact,
      email: formData.email,
      supportAreas: formData.supportAreas,
      website: formData.website,
      locations: formData.locations
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      introsReceived: 0,
      introsMade: 0,
      payoutsDue: 0,
      dealsClosed: formData.dealsClosed,
      affiliates: [],
      lastFollowUp: formData.lastFollowUp,
      nextSteps: formData.nextSteps,
      status: formData.status,
      commissionRate: formData.commissionRate,
      commissionTiers: [],
    }

    onAdd(partner)

    // Reset form
    setFormData({
      name: "",
      mainContact: "",
      email: "",
      supportAreas: [],
      website: "",
      locations: "",
      dealsClosed: 0,
      lastFollowUp: "",
      nextSteps: "",
      status: "active",
      commissionRate: 10,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add New Partner</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Partner Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mainContact">Main Contact *</Label>
              <Input
                id="mainContact"
                value={formData.mainContact}
                onChange={(e) => setFormData({ ...formData, mainContact: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="contact@partner.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
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
            <Label htmlFor="locations">Locations (comma-separated)</Label>
            <Input
              id="locations"
              placeholder="New York, London, Tokyo"
              value={formData.locations}
              onChange={(e) => setFormData({ ...formData, locations: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="commissionRate">Commission Rate (%)</Label>
            <Input
              id="commissionRate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.commissionRate}
              onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
            />
            <p className="text-sm text-muted-foreground">
              Commission percentage calculated on closed deals (e.g., 10 for 10%)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastFollowUp">Last Follow-up Date</Label>
              <Input
                id="lastFollowUp"
                type="date"
                value={formData.lastFollowUp}
                onChange={(e) => setFormData({ ...formData, lastFollowUp: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as "active" | "pending" | "inactive" })
                }
              >
                <SelectTrigger id="status">
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
            <Label htmlFor="nextSteps">Next Steps</Label>
            <Textarea
              id="nextSteps"
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
            <Button type="submit">Add Partner</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
