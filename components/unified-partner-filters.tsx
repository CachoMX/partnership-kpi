"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Filter, X } from "lucide-react"
import { SupportAreasSelect } from "@/components/support-areas-select"
import type { Partner } from "@/app/page"

export type PartnerFilters = {
  name: string
  email: string
  mainContact: string
  company: string
  supportAreas: string[]
  locations: string[]
  status: string
  tier: string
  minPayoutsDue: string
  maxPayoutsDue: string
  minDealsClosed: string
  maxDealsClosed: string
  website: string
}

type UnifiedPartnerFiltersProps = {
  filters: PartnerFilters
  onFiltersChange: (filters: PartnerFilters) => void
  allSupportAreas: string[]
  allLocations: string[]
  allTiers: string[]
  partners: Partner[]
}

export function UnifiedPartnerFilters({
  filters,
  onFiltersChange,
  allSupportAreas,
  allLocations,
  allTiers,
  partners,
}: UnifiedPartnerFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (Array.isArray(value)) return value.length > 0
    return value !== ""
  }).length

  const clearAllFilters = () => {
    onFiltersChange({
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
  }

  const hasActiveFilters = activeFilterCount > 0

  return (
    <div className="flex items-center gap-2">
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="gap-2">
          <X className="w-4 h-4" />
          Clear All Filters
        </Button>
      )}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[600px] max-h-[600px] overflow-y-auto p-6" align="end">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Filter Partners</h3>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Clear All
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Name Filter */}
              <div className="space-y-2">
                <Label htmlFor="name-filter">Partner Name</Label>
                <Input
                  id="name-filter"
                  placeholder="Search by name..."
                  value={filters.name}
                  onChange={(e) => onFiltersChange({ ...filters, name: e.target.value })}
                />
              </div>

              {/* Email Filter */}
              <div className="space-y-2">
                <Label htmlFor="email-filter">Email</Label>
                <Input
                  id="email-filter"
                  placeholder="Search by email..."
                  value={filters.email}
                  onChange={(e) => onFiltersChange({ ...filters, email: e.target.value })}
                />
              </div>

              {/* Main Contact Filter */}
              <div className="space-y-2">
                <Label htmlFor="contact-filter">Main Contact</Label>
                <Input
                  id="contact-filter"
                  placeholder="Search by contact..."
                  value={filters.mainContact}
                  onChange={(e) => onFiltersChange({ ...filters, mainContact: e.target.value })}
                />
              </div>

              {/* Website Filter */}
              <div className="space-y-2">
                <Label htmlFor="website-filter">Website</Label>
                <Input
                  id="website-filter"
                  placeholder="Search by website..."
                  value={filters.website}
                  onChange={(e) => onFiltersChange({ ...filters, website: e.target.value })}
                />
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => onFiltersChange({ ...filters, status: value === "all" ? "" : value })}
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Commission Tier Filter */}
              <div className="space-y-2">
                <Label htmlFor="tier-filter">Commission Tier</Label>
                <Select
                  value={filters.tier}
                  onValueChange={(value) => onFiltersChange({ ...filters, tier: value === "all" ? "" : value })}
                >
                  <SelectTrigger id="tier-filter">
                    <SelectValue placeholder="All tiers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    {allTiers.map((tier) => (
                      <SelectItem key={tier} value={tier}>
                        {tier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Support Areas Filter */}
            <div className="space-y-2">
              <Label>Support Areas</Label>
              <SupportAreasSelect
                value={filters.supportAreas}
                onChange={(areas) => onFiltersChange({ ...filters, supportAreas: areas })}
                availableAreas={allSupportAreas}
              />
            </div>

            {/* Locations Filter */}
            <div className="space-y-2">
              <Label>Locations</Label>
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                {allLocations.length > 0 ? (
                  allLocations.map((location) => (
                    <label key={location} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.locations.includes(location)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            onFiltersChange({ ...filters, locations: [...filters.locations, location] })
                          } else {
                            onFiltersChange({
                              ...filters,
                              locations: filters.locations.filter((l) => l !== location),
                            })
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{location}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No locations available</p>
                )}
              </div>
            </div>

            {/* Payouts Due Range */}
            <div className="space-y-2">
              <Label>Payouts Due Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Min ($)"
                  type="number"
                  value={filters.minPayoutsDue}
                  onChange={(e) => onFiltersChange({ ...filters, minPayoutsDue: e.target.value })}
                />
                <Input
                  placeholder="Max ($)"
                  type="number"
                  value={filters.maxPayoutsDue}
                  onChange={(e) => onFiltersChange({ ...filters, maxPayoutsDue: e.target.value })}
                />
              </div>
            </div>

            {/* Deals Closed Range */}
            <div className="space-y-2">
              <Label>Deals Closed Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Min"
                  type="number"
                  value={filters.minDealsClosed}
                  onChange={(e) => onFiltersChange({ ...filters, minDealsClosed: e.target.value })}
                />
                <Input
                  placeholder="Max"
                  type="number"
                  value={filters.maxDealsClosed}
                  onChange={(e) => onFiltersChange({ ...filters, maxDealsClosed: e.target.value })}
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
