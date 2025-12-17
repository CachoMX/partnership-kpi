"use client"

import { useState } from "react"
import type { Partner, Deal } from "@/app/page"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { EditPartnerDialog } from "@/components/edit-partner-dialog"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { Pencil, Trash2, ExternalLink, Search } from "lucide-react"
import { SUPPORT_AREAS } from "@/components/support-areas-select"
import { UnifiedPartnerFilters, type PartnerFilters } from "@/components/unified-partner-filters"

type PartnersTableProps = {
  partners: Partner[]
  deals: Deal[]
  onUpdate: (partner: Partner) => void
  onDelete: (id: string) => void
}

export function PartnersTable({ partners, deals, onUpdate, onDelete }: PartnersTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<PartnerFilters>({
    name: "",
    email: "",
    mainContact: "",
    company: "",
    supportAreas: [],
    locations: [],
    status: "",
    tier: "",
    minPayoutsDue: "",
    maxPayoutsDue: "",
    minDealsClosed: "",
    maxDealsClosed: "",
    website: "",
  })
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [deletingPartner, setDeletingPartner] = useState<Partner | null>(null)

  const allSupportAreas = Array.from(new Set([...SUPPORT_AREAS, ...partners.flatMap((p) => p.supportAreas)])).sort()
  const allLocations = Array.from(new Set(partners.flatMap((p) => p.locations))).sort()
  const allTiers = Array.from(new Set(partners.flatMap((p) => p.commissionTiers.map((t) => t.name)))).sort()

  const getIntrosReceived = (partnerId: string) => {
    return deals.filter((deal) => deal.partnerId === partnerId && deal.direction === "inbound").length
  }

  const getIntrosMade = (partnerId: string) => {
    return deals.filter((deal) => deal.partnerId === partnerId && deal.direction === "outbound").length
  }

  const getPayoutsDue = (partnerId: string) => {
    const partner = partners.find((p) => p.id === partnerId)
    if (!partner) return 0

    return deals
      .filter((deal) => deal.partnerId === partnerId && (deal.status === "won" || deal.status === "affiliate-paid"))
      .reduce((sum, deal) => {
        // If already paid, don't include in payouts due
        if (deal.status === "affiliate-paid") return sum

        const tier = partner.commissionTiers.find((t) => t.id === deal.commissionTierId)
        const rate = tier?.rate || partner.commissionRate
        return sum + (deal.dealValue * rate) / 100
      }, 0)
  }

  const getDealsClosed = (partnerId: string) => {
    return deals.filter(
      (deal) => deal.partnerId === partnerId && deal.status === "won" && deal.direction === "outbound",
    ).length
  }

  const filteredPartners = partners
    .filter((partner) => {
      const matchesSearch =
        partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.mainContact.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.email.toLowerCase().includes(searchQuery.toLowerCase())

      // Apply all filters
      const matchesName = !filters.name || partner.name.toLowerCase().includes(filters.name.toLowerCase())
      const matchesEmail = !filters.email || partner.email.toLowerCase().includes(filters.email.toLowerCase())
      const matchesContact =
        !filters.mainContact || partner.mainContact.toLowerCase().includes(filters.mainContact.toLowerCase())
      const matchesWebsite = !filters.website || partner.website.toLowerCase().includes(filters.website.toLowerCase())
      const matchesStatus = !filters.status || partner.status === filters.status
      const matchesSupportAreas =
        filters.supportAreas.length === 0 || filters.supportAreas.some((area) => partner.supportAreas.includes(area))
      const matchesLocations =
        filters.locations.length === 0 || filters.locations.some((location) => partner.locations.includes(location))
      const matchesTier = !filters.tier || partner.commissionTiers.some((tier) => tier.name === filters.tier)

      const payoutsDue = getPayoutsDue(partner.id)
      const matchesMinPayouts = !filters.minPayoutsDue || payoutsDue >= Number.parseFloat(filters.minPayoutsDue)
      const matchesMaxPayouts = !filters.maxPayoutsDue || payoutsDue <= Number.parseFloat(filters.maxPayoutsDue)

      const dealsClosed = getDealsClosed(partner.id)
      const matchesMinDeals = !filters.minDealsClosed || dealsClosed >= Number.parseInt(filters.minDealsClosed)
      const matchesMaxDeals = !filters.maxDealsClosed || dealsClosed <= Number.parseInt(filters.maxDealsClosed)

      return (
        matchesSearch &&
        matchesName &&
        matchesEmail &&
        matchesContact &&
        matchesWebsite &&
        matchesStatus &&
        matchesSupportAreas &&
        matchesLocations &&
        matchesTier &&
        matchesMinPayouts &&
        matchesMaxPayouts &&
        matchesMinDeals &&
        matchesMaxDeals
      )
    })
    .sort((a, b) => {
      const totalIntrosA = getIntrosReceived(a.id) + getIntrosMade(a.id)
      const totalIntrosB = getIntrosReceived(b.id) + getIntrosMade(b.id)
      return totalIntrosB - totalIntrosA
    })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Partners</h2>
        <div className="flex items-center gap-2">
          <UnifiedPartnerFilters
            filters={filters}
            onFiltersChange={setFilters}
            allSupportAreas={allSupportAreas}
            allLocations={allLocations}
            allTiers={allTiers}
            partners={partners}
          />

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Quick search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-semibold text-foreground">Partner</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Contact</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Email</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Support Areas</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Locations</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Commission Tiers</th>
              <th className="text-right py-3 px-4 font-semibold text-foreground">Intros</th>
              <th className="text-right py-3 px-4 font-semibold text-foreground">Payouts Due</th>
              <th className="text-right py-3 px-4 font-semibold text-foreground">Deals</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Next Steps</th>
              <th className="text-right py-3 px-4 font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPartners.map((partner) => {
              const introsReceived = getIntrosReceived(partner.id)
              const introsMade = getIntrosMade(partner.id)
              const payoutsDue = getPayoutsDue(partner.id)
              const dealsClosed = getDealsClosed(partner.id)

              return (
                <tr key={partner.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{partner.name}</span>
                      {partner.website && (
                        <a href={partner.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground">{partner.mainContact}</td>
                  <td className="py-4 px-4 text-muted-foreground">{partner.email}</td>
                  <td className="py-4 px-4">
                    <div className="flex gap-1 max-w-[200px] overflow-hidden" title={partner.supportAreas.join(", ")}>
                      {partner.supportAreas.slice(0, 2).map((area) => (
                        <Badge
                          key={area}
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0.5 whitespace-nowrap shrink-0"
                        >
                          {area}
                        </Badge>
                      ))}
                      {partner.supportAreas.length > 2 && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 whitespace-nowrap shrink-0">
                          +{partner.supportAreas.length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {partner.locations.slice(0, 2).map((location) => (
                        <Badge key={location} variant="outline" className="text-xs">
                          {location}
                        </Badge>
                      ))}
                      {partner.locations.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{partner.locations.length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {partner.commissionTiers.map((tier) => (
                        <Badge key={tier.id} variant="outline" className="text-indigo-600 font-medium text-xs">
                          {tier.name}: {tier.rate}%
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="text-sm">
                      <span className="text-green-600 font-medium">{introsReceived}</span>
                      <span className="text-muted-foreground"> / </span>
                      <span className="text-blue-600 font-medium">{introsMade}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right font-medium text-foreground">${payoutsDue.toLocaleString()}</td>
                  <td className="py-4 px-4 text-right font-medium text-foreground">{dealsClosed}</td>
                  <td className="py-4 px-4">
                    <Badge className={getStatusColor(partner.status)}>{partner.status}</Badge>
                  </td>
                  <td className="py-4 px-4 text-sm text-muted-foreground max-w-xs truncate">{partner.nextSteps}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingPartner(partner)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeletingPartner(partner)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredPartners.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No partners found. Try adjusting your search or filters.
          </div>
        )}
      </div>

      {editingPartner && (
        <EditPartnerDialog
          partner={editingPartner}
          open={!!editingPartner}
          onOpenChange={(open) => !open && setEditingPartner(null)}
          onUpdate={(updated) => {
            onUpdate(updated)
            setEditingPartner(null)
          }}
        />
      )}

      {deletingPartner && (
        <DeleteConfirmationDialog
          open={!!deletingPartner}
          onOpenChange={(open) => !open && setDeletingPartner(null)}
          onConfirm={() => {
            onDelete(deletingPartner.id)
            setDeletingPartner(null)
          }}
          title="Delete Partner"
          description={`Are you sure you want to delete ${deletingPartner.name}? This action cannot be undone and will remove all associated data.`}
        />
      )}
    </Card>
  )
}
