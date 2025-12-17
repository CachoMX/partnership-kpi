"use client"

import { useState } from "react"
import type { Deal, Partner } from "@/app/page"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { EditDealDialog } from "@/components/edit-deal-dialog"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { Pencil, Trash2, Search, AlertCircle, Calendar, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type DealsTableProps = {
  deals: Deal[]
  partners: Partner[]
  onUpdate: (deal: Deal) => void
  onDelete: (id: string) => void
}

export function DealsTable({ deals, partners, onUpdate, onDelete }: DealsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null)
  const [deletingDeal, setDeletingDeal] = useState<Deal | null>(null)

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.dealName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.partnerName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDateRange =
      (!startDate || new Date(deal.closeDate) >= new Date(startDate)) &&
      (!endDate || new Date(deal.closeDate) <= new Date(endDate))

    const matchesStatus = !statusFilter || deal.status === statusFilter

    return matchesSearch && matchesDateRange && matchesStatus
  })

  const getDealsNeedingAttention = () => {
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

    return deals.filter((deal) => {
      if (deal.status === "won" || deal.status === "lost" || deal.status === "affiliate-paid") return false

      const lastUpdated = new Date(deal.lastUpdated)
      return lastUpdated < twoWeeksAgo
    })
  }

  const dealsNeedingAttention = getDealsNeedingAttention()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "won":
        return "bg-green-100 text-green-800"
      case "affiliate-paid":
        return "bg-emerald-100 text-emerald-800"
      case "pitch-made":
        return "bg-indigo-100 text-indigo-800"
      case "call-booked":
        return "bg-blue-100 text-blue-800"
      case "intro-made":
        return "bg-purple-100 text-purple-800"
      case "needs-followup":
        return "bg-yellow-100 text-yellow-800"
      case "lost":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "intro-made":
        return "Intro Made"
      case "pitch-made":
        return "Pitch Made"
      case "call-booked":
        return "Call Booked"
      case "needs-followup":
        return "Needs Follow-Up"
      case "won":
        return "Won"
      case "affiliate-paid":
        return "Affiliate Paid"
      case "lost":
        return "Lost"
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const getDaysSinceUpdate = (lastUpdated: string) => {
    const today = new Date()
    const updated = new Date(lastUpdated)
    const diffTime = Math.abs(today.getTime() - updated.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getMonthsElapsed = (deal: Deal) => {
    if (!deal.closeDate || deal.status !== "won" || (deal.commissionType || "one-time") !== "recurring") return 0

    const closeDate = new Date(deal.closeDate)
    const today = new Date()

    const months = (today.getFullYear() - closeDate.getFullYear()) * 12 + (today.getMonth() - closeDate.getMonth())

    return Math.max(0, months + 1) // +1 to include the current month
  }

  const calculateCommission = (deal: Deal) => {
    const partner = partners.find((p) => p.id === deal.partnerId)
    if (!partner) return { amount: 0, rate: 0, tierName: "", monthsElapsed: 0, totalRecurring: 0 }

    const tier = partner.commissionTiers.find((t) => t.id === deal.commissionTierId)
    const rate = tier?.rate || partner.commissionRate
    const tierName = tier?.name || "Default"
    const monthlyAmount = (deal.dealValue * rate) / 100
    const monthsElapsed = getMonthsElapsed(deal)
    const totalRecurring = monthlyAmount * monthsElapsed

    return {
      amount: monthlyAmount,
      rate,
      tierName,
      monthsElapsed,
      totalRecurring,
    }
  }

  const hasActiveFilters = startDate !== "" || endDate !== "" || statusFilter !== ""

  const clearAllFilters = () => {
    setStartDate("")
    setEndDate("")
    setStatusFilter("")
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Deals</h2>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="gap-2">
              <X className="w-4 h-4" />
              Clear All Filters
            </Button>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Calendar className="w-4 h-4" />
                Date Range
                {(startDate || endDate) && (
                  <Badge variant="secondary" className="ml-1">
                    Active
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Start Date</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">End Date</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                {(startDate || endDate) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStartDate("")
                      setEndDate("")
                    }}
                    className="w-full"
                  >
                    Clear Date Range
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                Status
                {statusFilter && (
                  <Badge variant="secondary" className="ml-1">
                    1
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" align="end">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Filter by Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="intro-made">Intro Made</SelectItem>
                    <SelectItem value="call-booked">Call Booked</SelectItem>
                    <SelectItem value="pitch-made">Pitch Made</SelectItem>
                    <SelectItem value="needs-followup">Needs Follow-Up</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="affiliate-paid">Affiliate Paid</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
                {statusFilter && (
                  <Button variant="ghost" size="sm" onClick={() => setStatusFilter("")} className="w-full">
                    Clear Filter
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {dealsNeedingAttention.length > 0 && (
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <span className="font-semibold">
              {dealsNeedingAttention.length} deal{dealsNeedingAttention.length > 1 ? "s" : ""}
            </span>{" "}
            haven't been updated in over 2 weeks: {dealsNeedingAttention.map((d) => d.dealName).join(", ")}
          </AlertDescription>
        </Alert>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-semibold text-foreground">Deal Name</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Partner</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Direction</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Status Details</th>
              <th className="text-right py-3 px-4 font-semibold text-foreground">Deal Value</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Commission Type</th>
              <th className="text-right py-3 px-4 font-semibold text-foreground">Commission</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Last Updated</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Close Date</th>
              <th className="text-right py-3 px-4 font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeals.map((deal) => {
              const commission = calculateCommission(deal)
              const daysSinceUpdate = getDaysSinceUpdate(deal.lastUpdated)
              const needsAttention =
                daysSinceUpdate >= 14 &&
                deal.status !== "won" &&
                deal.status !== "lost" &&
                deal.status !== "affiliate-paid"

              const isRecurring = (deal.commissionType || "one-time") === "recurring"
              const hasPendingRecurring = isRecurring && deal.status === "won" && commission.monthsElapsed > 0

              return (
                <tr
                  key={deal.id}
                  className={`border-b hover:bg-muted/50 transition-colors ${needsAttention ? "bg-amber-50/50" : ""}`}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{deal.dealName}</span>
                      {needsAttention && (
                        <AlertCircle className="w-4 h-4 text-amber-600" title="Not updated in 2+ weeks" />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground">{deal.partnerName}</td>
                  <td className="py-4 px-4">
                    <Badge
                      variant="outline"
                      className={deal.direction === "outbound" ? "text-blue-600" : "text-green-600"}
                    >
                      {deal.direction === "outbound" ? "→ Sent" : "← Received"}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <Badge className={getStatusColor(deal.status)}>{getStatusLabel(deal.status)}</Badge>
                  </td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">
                    {deal.status === "intro-made" && deal.referralName && (
                      <div>
                        <span className="font-medium">Referral:</span> {deal.referralName}
                      </div>
                    )}
                    {deal.status === "pitch-made" && deal.pitchDate && (
                      <div>
                        <span className="font-medium">Pitch:</span> {formatDate(deal.pitchDate)}
                      </div>
                    )}
                    {deal.status === "call-booked" && deal.callDate && (
                      <div>
                        <span className="font-medium">Call:</span> {formatDate(deal.callDate)}
                      </div>
                    )}
                    {deal.status === "needs-followup" && deal.followUpNotes && (
                      <div className="max-w-xs truncate">
                        <span className="font-medium">Notes:</span> {deal.followUpNotes}
                      </div>
                    )}
                    {deal.status === "affiliate-paid" && (
                      <div className="space-y-1">
                        {deal.affiliatePaymentDate && (
                          <div>
                            <span className="font-medium">Paid:</span> {formatDate(deal.affiliatePaymentDate)}
                          </div>
                        )}
                        {deal.affiliatePaymentMethod && (
                          <div>
                            <span className="font-medium">Method:</span> {deal.affiliatePaymentMethod}
                          </div>
                        )}
                        {deal.affiliatePaymentAmount && (
                          <div>
                            <span className="font-medium">Amount:</span> ${deal.affiliatePaymentAmount.toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}
                    {!deal.referralName &&
                      !deal.pitchDate &&
                      !deal.callDate &&
                      !deal.followUpNotes &&
                      !deal.affiliatePaymentDate && <span>—</span>}
                  </td>
                  <td className="py-4 px-4 text-right font-medium text-foreground">
                    ${deal.dealValue.toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    <Badge
                      variant="outline"
                      className={
                        isRecurring
                          ? "bg-purple-100 text-purple-700 border-purple-300"
                          : "bg-gray-100 text-gray-700 border-gray-300"
                      }
                    >
                      {isRecurring ? "🔄 Recurring" : "One-Time"}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex flex-col items-end">
                      {isRecurring && hasPendingRecurring ? (
                        <>
                          <span className="font-medium text-purple-600">${commission.amount.toLocaleString()}/mo</span>
                          <span className="text-xs font-semibold text-purple-700">
                            {commission.monthsElapsed} months = ${commission.totalRecurring.toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {commission.tierName} ({commission.rate}%)
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="font-medium text-indigo-600">${commission.amount.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground">
                            {commission.tierName} ({commission.rate}%)
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className={needsAttention ? "text-amber-600 font-medium" : "text-muted-foreground"}>
                        {formatDate(deal.lastUpdated)}
                      </span>
                      {needsAttention && <span className="text-xs text-amber-600">{daysSinceUpdate} days ago</span>}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground">{formatDate(deal.closeDate)}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingDeal(deal)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeletingDeal(deal)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredDeals.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No deals found. Try adjusting your search or filters.
          </div>
        )}
      </div>

      {editingDeal && (
        <EditDealDialog
          deal={editingDeal}
          partners={partners}
          open={!!editingDeal}
          onOpenChange={(open) => !open && setEditingDeal(null)}
          onUpdate={(updated) => {
            onUpdate(updated)
            setEditingDeal(null)
          }}
        />
      )}

      {deletingDeal && (
        <DeleteConfirmationDialog
          open={!!deletingDeal}
          onOpenChange={(open) => !open && setDeletingDeal(null)}
          onConfirm={() => {
            onDelete(deletingDeal.id)
            setDeletingDeal(null)
          }}
          title="Delete Deal"
          description={`Are you sure you want to delete "${deletingDeal.dealName}"? This action cannot be undone.`}
        />
      )}
    </Card>
  )
}
